import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, PERMISSIONS } from "@/lib/session";
import { formatDate } from "@/lib/utils";
import {
  generateCsv,
  generateXlsx,
  generatePdf,
} from "@/lib/reports-generator";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.REPORT_EXPORT);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "inventory";
    const format = (searchParams.get("format") || "csv").toLowerCase();
    const dateStr = new Date().toISOString().split("T")[0];

    let reportTitle = "Laporan Operasional";
    let baseFilename = `bpti-report-${type}-${dateStr}`;
    let headers: string[] = [];
    let rows: (string | number | null | undefined)[][] = [];

    switch (type) {
      case "inventory": {
        reportTitle = "Master Inventaris & Rincian Stok Gudang";
        baseFilename = `bpti-inventaris-katalog-${dateStr}`;
        const items = await prisma.inventoryItem.findMany({
          include: {
            category: true,
            stocks: { include: { location: true } },
          },
          orderBy: { code: "asc" },
        });

        headers = [
          "Kode Barang",
          "Nama Barang",
          "Kategori",
          "Satuan",
          "Total Stok",
          "Stok Min",
          "Stok Max",
          "Status Stok",
          "Rincian Lokasi Penyimpanan",
        ];

        rows = items.map((it) => {
          const totalQty = it.stocks.reduce((sum, s) => sum + s.quantity, 0);
          const locationDetails = it.stocks
            .map((s) => `${s.location.name}: ${s.quantity} ${it.unit}`)
            .join(" | ");

          let status = "NORMAL";
          if (totalQty === 0) status = "HABIS";
          else if (totalQty <= it.minStock) status = "LOW STOCK";

          return [
            it.code,
            it.name,
            it.category.name,
            it.unit,
            totalQty,
            it.minStock,
            it.maxStock,
            status,
            locationDetails,
          ];
        });
        break;
      }

      case "assets": {
        reportTitle = "Pelacakan Aset & Riwayat Penanggung Jawab";
        baseFilename = `bpti-aset-perangkat-${dateStr}`;
        const assets = await prisma.asset.findMany({
          include: {
            holder: true,
            department: true,
            location: true,
          },
          orderBy: { assetTag: "asc" },
        });

        headers = [
          "Tag Aset",
          "Nama Aset",
          "Nomor Seri",
          "Merek",
          "Model",
          "Status",
          "Kondisi",
          "Penanggung Jawab",
          "Departemen",
          "Lokasi Fisik",
          "Biaya (IDR)",
          "Tanggal Pengadaan",
        ];

        rows = assets.map((a) => [
          a.assetTag,
          a.name,
          a.serialNumber || "-",
          a.brand || "-",
          a.model || "-",
          a.status,
          a.condition,
          a.holder ? `${a.holder.name} (${a.holder.email})` : "Belum Ditetapkan",
          a.department ? a.department.name : "-",
          a.location ? `${a.location.name} (${a.location.code})` : "-",
          a.purchaseCost ? Number(a.purchaseCost) : 0,
          a.purchaseDate ? formatDate(a.purchaseDate) : "-",
        ]);
        break;
      }

      case "movements": {
        reportTitle = "Buku Besar Mutasi & Pergerakan Stok";
        baseFilename = `bpti-mutasi-stok-${dateStr}`;
        const movements = await prisma.stockMovement.findMany({
          include: {
            item: true,
            location: true,
            actor: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1000,
        });

        headers = [
          "Waktu Mutasi",
          "Kode Barang",
          "Nama Barang",
          "Tipe",
          "Jumlah",
          "Satuan",
          "Lokasi",
          "No. Referensi",
          "Keterangan",
          "Petugas",
        ];

        rows = movements.map((m) => [
          formatDate(m.createdAt),
          m.item.code,
          m.item.name,
          m.type,
          m.quantity,
          m.item.unit,
          m.location.name,
          m.referenceNumber || "-",
          m.reason || "-",
          m.actor.name,
        ]);
        break;
      }

      case "maintenance": {
        reportTitle = "Rekap Pemeliharaan & Servis Perangkat";
        baseFilename = `bpti-servis-pemeliharaan-${dateStr}`;
        const records = await prisma.maintenanceRecord.findMany({
          include: {
            asset: true,
            requestedBy: true,
          },
          orderBy: { createdAt: "desc" },
        });

        headers = [
          "ID Tiket",
          "Judul Servis",
          "Tag Aset",
          "Nama Aset",
          "Prioritas",
          "Status Servis",
          "Teknisi PIC",
          "Biaya (IDR)",
          "Pelapor",
          "Tanggal Pengajuan",
        ];

        rows = records.map((r) => [
          r.id.substring(0, 8),
          r.title,
          r.asset.assetTag,
          r.asset.name,
          r.priority,
          r.status,
          r.technician || "-",
          r.cost ? Number(r.cost) : 0,
          r.requestedBy.name,
          formatDate(r.createdAt),
        ]);
        break;
      }

      case "audit": {
        reportTitle = "Jejak Audit Keamanan & Transaksi Sistem";
        baseFilename = `bpti-audit-trail-${dateStr}`;
        const logs = await prisma.auditLog.findMany({
          include: { actor: true },
          orderBy: { timestamp: "desc" },
          take: 2000,
        });

        headers = [
          "Waktu",
          "Petugas / Aktor",
          "Email Aktor",
          "Aksi",
          "Entitas",
          "ID Entitas",
          "Alamat IP",
        ];

        rows = logs.map((l) => [
          formatDate(l.timestamp),
          l.actor ? l.actor.name : "System",
          l.actor ? l.actor.email : "-",
          l.action,
          l.entity,
          l.entityId,
          l.ipAddress || "-",
        ]);
        break;
      }

      default:
        return NextResponse.json({ error: "Tipe laporan tidak valid" }, { status: 400 });
    }

    if (format === "xlsx") {
      const buffer = await generateXlsx(reportTitle, headers, rows);
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type":
            "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": `attachment; filename="${baseFilename}.xlsx"`,
        },
      });
    }

    if (format === "pdf") {
      const buffer = await generatePdf(reportTitle, headers, rows);
      return new Response(new Uint8Array(buffer), {
        status: 200,
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${baseFilename}.pdf"`,
        },
      });
    }

    // Default to CSV
    const csv = generateCsv(headers, rows);
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${baseFilename}.csv"`,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal mengekspor laporan" },
      { status: 500 }
    );
  }
}
