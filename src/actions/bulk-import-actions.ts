"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission, PERMISSIONS } from "@/lib/session";
import { recordAudit } from "@/lib/audit";
import { parseSpreadsheetBuffer } from "@/lib/bulk-import-parser";
import {
  importInventoryRowSchema,
  importAssetRowSchema,
  ImportInventoryRow,
  ImportAssetRow,
} from "@/lib/validations/bulk-import";
import { MovementType, AssetCondition } from "@prisma/client";

export interface BulkImportResult {
  success: boolean;
  message?: string;
  count?: number;
  errors?: Array<{ row: number; field?: string; message: string }>;
}

/**
 * Server Action: Impor Massal Master Katalog Inventaris
 */
export async function importInventoryItemsAction(
  formData: FormData
): Promise<BulkImportResult> {
  try {
    const user = await requirePermission(PERMISSIONS.INVENTORY_CREATE);

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, message: "Berkas tidak ditemukan atau kosong." };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, message: "Ukuran berkas maksimal adalah 5MB." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsedRows = await parseSpreadsheetBuffer(buffer, file.name);

    if (parsedRows.length === 0) {
      return { success: false, message: "Tidak ada baris data valid di dalam berkas." };
    }

    // 1. Validasi setiap baris dengan Zod
    const rowErrors: Array<{ row: number; field?: string; message: string }> = [];
    const validRows: Array<{ rowNumber: number; data: ImportInventoryRow }> = [];
    const seenCodes = new Set<string>();

    for (const item of parsedRows) {
      const parsed = importInventoryRowSchema.safeParse(item.data);
      if (!parsed.success) {
        const issues = parsed.error.issues;
        for (const issue of issues) {
          rowErrors.push({
            row: item.rowNumber,
            field: issue.path.join("."),
            message: issue.message,
          });
        }
      } else {
        const rowData = parsed.data;
        if (seenCodes.has(rowData.code.toUpperCase())) {
          rowErrors.push({
            row: item.rowNumber,
            field: "code",
            message: `Kode barang '${rowData.code}' terduplikasi di dalam berkas impor.`,
          });
        } else {
          seenCodes.add(rowData.code.toUpperCase());
          validRows.push({ rowNumber: item.rowNumber, data: rowData });
        }
      }
    }

    if (rowErrors.length > 0) {
      return {
        success: false,
        message: `Terdapat ${rowErrors.length} kesalahan validasi pada berkas impor.`,
        errors: rowErrors,
      };
    }

    // 2. Cek duplikasi kode terhadap database
    const codesToCheck = validRows.map((r) => r.data.code);
    const existingItems = await prisma.inventoryItem.findMany({
      where: { code: { in: codesToCheck } },
      select: { code: true },
    });

    if (existingItems.length > 0) {
      const existingCodeSet = new Set(existingItems.map((it) => it.code.toUpperCase()));
      for (const r of validRows) {
        if (existingCodeSet.has(r.data.code.toUpperCase())) {
          rowErrors.push({
            row: r.rowNumber,
            field: "code",
            message: `Kode barang '${r.data.code}' sudah terdaftar di database.`,
          });
        }
      }
      return {
        success: false,
        message: `Ditemukan ${existingItems.length} kode barang yang sudah ada di database.`,
        errors: rowErrors,
      };
    }

    // 3. Eksekusi atomik di dalam prisma.$transaction
    await prisma.$transaction(async (tx) => {
      // Siapkan mapping lokasi yang ada
      const allLocations = await tx.location.findMany({
        select: { id: true, code: true },
      });
      const locationMap = new Map(allLocations.map((l) => [l.code.toUpperCase(), l.id]));
      const defaultLocationId = allLocations[0]?.id;

      for (const { data } of validRows) {
        // Cari atau buat kategori
        let category = await tx.category.findFirst({
          where: { name: { equals: data.categoryName } },
        });
        if (!category) {
          const categoryCode =
            data.categoryName.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10) ||
            `CAT-${Date.now()}`;
          let finalCode = categoryCode;
          const existingWithCode = await tx.category.findUnique({ where: { code: finalCode } });
          if (existingWithCode) {
            finalCode = `${categoryCode.slice(0, 6)}-${Math.floor(100 + Math.random() * 900)}`;
          }

          category = await tx.category.create({
            data: {
              code: finalCode,
              name: data.categoryName,
              description: `Dibuat otomatis via impor massal`,
            },
          });
        }

        // Tentukan lokasi stok awal
        let targetLocationId = defaultLocationId;
        if (data.locationCode) {
          const matchedId = locationMap.get(data.locationCode.toUpperCase());
          if (matchedId) {
            targetLocationId = matchedId;
          }
        }

        // Buat item inventaris
        const createdItem = await tx.inventoryItem.create({
          data: {
            code: data.code,
            name: data.name,
            categoryId: category.id,
            unit: data.unit,
            minStock: data.minStock,
            maxStock: data.maxStock,
          },
        });

        // Jika ada stok awal dan lokasi valid, catat stok & mutasi IN
        if (data.initialStock > 0 && targetLocationId) {
          await tx.stock.create({
            data: {
              itemId: createdItem.id,
              locationId: targetLocationId,
              quantity: data.initialStock,
            },
          });

          await tx.stockMovement.create({
            data: {
              itemId: createdItem.id,
              locationId: targetLocationId,
              type: MovementType.IN,
              quantity: data.initialStock,
              previousQty: 0,
              resultingQty: data.initialStock,
              reason: "Saldo stok awal via impor massal",
              referenceNumber: `IMP-${Date.now()}`,
              actorId: user.id,
            },
          });
        }
      }

      await recordAudit({
        actorId: user.id,
        action: "IMPORT_INVENTORY",
        entity: "INVENTORY_ITEM",
        entityId: "BULK",
        notes: `Berhasil mengimpor ${validRows.length} item katalog inventaris.`,
      });
    });

    revalidatePath("/inventory");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return {
      success: true,
      count: validRows.length,
      message: `Berhasil mengimpor ${validRows.length} master barang inventaris.`,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat mengimpor data inventaris.",
    };
  }
}

/**
 * Server Action: Impor Massal Master Aset Perangkat
 */
export async function importAssetsAction(
  formData: FormData
): Promise<BulkImportResult> {
  try {
    const user = await requirePermission(PERMISSIONS.ASSET_CREATE);

    const file = formData.get("file") as File | null;
    if (!file || file.size === 0) {
      return { success: false, message: "Berkas tidak ditemukan atau kosong." };
    }

    if (file.size > 5 * 1024 * 1024) {
      return { success: false, message: "Ukuran berkas maksimal adalah 5MB." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const parsedRows = await parseSpreadsheetBuffer(buffer, file.name);

    if (parsedRows.length === 0) {
      return { success: false, message: "Tidak ada baris data valid di dalam berkas." };
    }

    // 1. Validasi Zod
    const rowErrors: Array<{ row: number; field?: string; message: string }> = [];
    const validRows: Array<{ rowNumber: number; data: ImportAssetRow }> = [];
    const seenTags = new Set<string>();

    for (const item of parsedRows) {
      const parsed = importAssetRowSchema.safeParse(item.data);
      if (!parsed.success) {
        const issues = parsed.error.issues;
        for (const issue of issues) {
          rowErrors.push({
            row: item.rowNumber,
            field: issue.path.join("."),
            message: issue.message,
          });
        }
      } else {
        const rowData = parsed.data;
        if (seenTags.has(rowData.assetTag.toUpperCase())) {
          rowErrors.push({
            row: item.rowNumber,
            field: "assetTag",
            message: `Tag ID '${rowData.assetTag}' terduplikasi di dalam berkas impor.`,
          });
        } else {
          seenTags.add(rowData.assetTag.toUpperCase());
          validRows.push({ rowNumber: item.rowNumber, data: rowData });
        }
      }
    }

    if (rowErrors.length > 0) {
      return {
        success: false,
        message: `Terdapat ${rowErrors.length} kesalahan validasi pada berkas impor.`,
        errors: rowErrors,
      };
    }

    // 2. Cek duplikasi Tag ID terhadap database
    const tagsToCheck = validRows.map((r) => r.data.assetTag);
    const existingAssets = await prisma.asset.findMany({
      where: { assetTag: { in: tagsToCheck } },
      select: { assetTag: true },
    });

    if (existingAssets.length > 0) {
      const existingTagSet = new Set(existingAssets.map((a) => a.assetTag.toUpperCase()));
      for (const r of validRows) {
        if (existingTagSet.has(r.data.assetTag.toUpperCase())) {
          rowErrors.push({
            row: r.rowNumber,
            field: "assetTag",
            message: `Tag ID '${r.data.assetTag}' sudah terdaftar di database.`,
          });
        }
      }
      return {
        success: false,
        message: `Ditemukan ${existingAssets.length} Tag ID aset yang sudah terdaftar di database.`,
        errors: rowErrors,
      };
    }

    // 3. Eksekusi atomik transaksi
    await prisma.$transaction(async (tx) => {
      // Mapping lokasi
      const allLocations = await tx.location.findMany({
        select: { id: true, code: true },
      });
      const locationMap = new Map(allLocations.map((l) => [l.code.toUpperCase(), l.id]));
      const defaultLocationId = allLocations[0]?.id;

      // Mapping departemen
      const allDepts = await tx.department.findMany({
        select: { id: true, code: true },
      });
      const deptMap = new Map(allDepts.map((d) => [d.code.toUpperCase(), d.id]));

      for (const { data } of validRows) {
        let locationId = defaultLocationId;
        if (data.locationCode) {
          const matched = locationMap.get(data.locationCode.toUpperCase());
          if (matched) locationId = matched;
        }

        let departmentId: string | undefined = undefined;
        if (data.departmentCode) {
          const matchedDept = deptMap.get(data.departmentCode.toUpperCase());
          if (matchedDept) departmentId = matchedDept;
        }

        let purchaseDateParsed: Date | undefined = undefined;
        if (data.purchaseDate) {
          const d = new Date(data.purchaseDate);
          if (!isNaN(d.getTime())) {
            purchaseDateParsed = d;
          }
        }

        await tx.asset.create({
          data: {
            assetTag: data.assetTag,
            name: data.name,
            serialNumber: data.serialNumber,
            brand: data.brand,
            model: data.model,
            condition: data.condition as AssetCondition,
            locationId,
            departmentId,
            purchaseCost: data.purchaseCost,
            purchaseDate: purchaseDateParsed,
          },
        });
      }

      await recordAudit({
        actorId: user.id,
        action: "IMPORT_ASSETS",
        entity: "ASSET",
        entityId: "BULK",
        notes: `Berhasil mengimpor ${validRows.length} unit aset perangkat.`,
      });
    });

    revalidatePath("/assets");
    revalidatePath("/dashboard");
    revalidatePath("/reports");

    return {
      success: true,
      count: validRows.length,
      message: `Berhasil mengimpor ${validRows.length} unit aset perangkat.`,
    };
  } catch (error: unknown) {
    return {
      success: false,
      message: error instanceof Error ? error.message : "Terjadi kesalahan saat mengimpor data aset.",
    };
  }
}
