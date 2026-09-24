import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission, PERMISSIONS } from "@/lib/session";
import { formatDate, formatCurrency } from "@/lib/utils";

function escapeCsvCell(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n") || str.includes("\r")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function buildCsv(headers: string[], rows: (string | number | null | undefined)[][]): string {
  const bom = "\uFEFF"; // UTF-8 Byte Order Mark for Microsoft Excel compatibility
  const headerLine = headers.map(escapeCsvCell).join(",");
  const rowLines = rows.map((r) => r.map(escapeCsvCell).join(","));
  return bom + [headerLine, ...rowLines].join("\r\n");
}

export async function GET(request: NextRequest) {
  try {
    await requirePermission(PERMISSIONS.REPORT_EXPORT);

    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type") || "inventory";
    const dateStr = new Date().toISOString().split("T")[0];

    let csv = "";
    let filename = `bpti-report-${type}-${dateStr}.csv`;

    switch (type) {
      case "inventory": {
        filename = `bpti-inventaris-katalog-${dateStr}.csv`;
        const items = await prisma.inventoryItem.findMany({
          include: {
            category: true,
            stocks: { include: { location: true } },
          },
          orderBy: { code: "asc" },
        });

        const headers = [
          "Kode Barang",
          "Nama Barang",
          "Kategori",
          "Satuan",
          "Total Stok",
          "Stok Minimum",
          "Stok Maksimum",
          "Status Stok",
          "Rincian Lokasi Penyimpanan",
        ];

        const rows = items.map((it) => {
          const totalQty = it.stocks.reduce((sum, s) => sum + s.quantity, 0);
          const locationDetails = it.stocks
            .map((s) => `${s.location.name}: ${s.quantity} ${it.unit}`)
            .join(" | ");

          let status = "NORMAL";
          if (totalQty === 0) status = "HABIS (OUT OF STOCK)";
          else if (totalQty <= it.minStock) status = "KRITIS (LOW STOCK)";

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

        csv = buildCsv(headers, rows);
        break;
      }

      case "assets": {
        filename = `bpti-aset-perangkat-${dateStr}.csv`;
        const assets = await prisma.asset.findMany({
          include: {
            holder: true,
            department: true,
            location: true,
          },
          orderBy: { assetTag: "asc" },
        });

        const headers = [
          "Tag Aset",
          "Nama Aset / Perangkat",
          "Nomor Seri",
          "Merek",
          "Model / Tipe",
          "Status Siklus",
          "Kondisi Fisik",
          "Penanggung Jawab",
          "Departemen",
          "Lokasi Fisik",
          "Biaya Pengadaan (IDR)",
          "Tanggal Pengadaan",
        ];

        const rows = assets.map((a) => [
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

        csv = buildCsv(headers, rows);
        break;
      }

      case "movements": {
        filename = `bpti-mutasi-stok-${dateStr}.csv`;
        const movements = await prisma.stockMovement.findMany({
          include: {
            item: true,
            location: true,
            actor: true,
          },
          orderBy: { createdAt: "desc" },
          take: 1000,
        });

        const headers = [
          "Waktu Mutasi",
          "Kode Barang",
          "Nama Barang",
          "Tipe Mutasi",
          "Jumlah",
          "Satuan",
          "Lokasi",
          "No. Referensi / Surat",
          "Keterangan / Alasan",
          "Petugas Pencatat",
        ];

        const rows = movements.map((m) => [
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

        csv = buildCsv(headers, rows);
        break;
      }

      case "maintenance": {
        filename = `bpti-servis-pemeliharaan-${dateStr}.csv`;
        const records = await prisma.maintenanceRecord.findMany({
          include: {
            asset: true,
            requestedBy: true,
          },
          orderBy: { createdAt: "desc" },
        });

        const headers = [
          "ID Tiket",
          "Judul Perbaikan",
          "Tag Aset",
          "Nama Aset",
          "Prioritas",
          "Status Servis",
          "Teknisi PIC",
          "Estimasi / Biaya Real (IDR)",
          "Pelapor",
          "Catatan Resolusi",
          "Tanggal Diajukan",
        ];

        const rows = records.map((r) => [
          r.id,
          r.title,
          r.asset.assetTag,
          r.asset.name,
          r.priority,
          r.status,
          r.technician || "-",
          r.cost ? Number(r.cost) : 0,
          r.requestedBy.name,
          r.resolutionNotes || "-",
          formatDate(r.createdAt),
        ]);

        csv = buildCsv(headers, rows);
        break;
      }

      case "audit": {
        filename = `bpti-audit-trail-${dateStr}.csv`;
        const logs = await prisma.auditLog.findMany({
          include: { actor: true },
          orderBy: { timestamp: "desc" },
          take: 2000,
        });

        const headers = [
          "Timestamp",
          "Petugas / Aktor",
          "Email Aktor",
          "Aksi",
          "Entitas",
          "ID Entitas",
          "Alamat IP",
        ];

        const rows = logs.map((l) => [
          formatDate(l.timestamp),
          l.actor ? l.actor.name : "System / Background",
          l.actor ? l.actor.email : "-",
          l.action,
          l.entity,
          l.entityId,
          l.ipAddress || "-",
        ]);

        csv = buildCsv(headers, rows);
        break;
      }

      default:
        return NextResponse.json({ error: "Tipe laporan tidak valid" }, { status: 400 });
    }

    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error: unknown) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Gagal mengekspor laporan" },
      { status: 500 }
    );
  }
}
