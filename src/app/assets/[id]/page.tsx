import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import {
  ChevronLeft,
  Laptop,
  QrCode,
  MapPin,
  User,
  DollarSign,
  ShieldAlert,
  Clock,
  Wrench,
  CheckCircle2,
} from "lucide-react";
import { AssetService } from "@/modules/assets/asset-service";
import { formatDate, formatCurrency } from "@/lib/utils";
import Image from "next/image";
import { requirePagePermission, PERMISSIONS } from "@/lib/session";

export const dynamic = "force-dynamic";

interface AssetDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AssetDetailPage({ params }: AssetDetailPageProps) {
  await requirePagePermission(PERMISSIONS.ASSET_READ);

  const { id } = await params;
  const asset = await AssetService.getAssetById(id);

  if (!asset) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "AVAILABLE":
        return <Badge variant="success">Available (Tersedia)</Badge>;
      case "ASSIGNED":
        return <Badge variant="default">Assigned (Ditugaskan)</Badge>;
      case "IN_USE":
        return <Badge variant="default">In Use (Digunakan)</Badge>;
      case "IN_REPAIR":
        return <Badge variant="warning">In Repair (Sedang Diservis)</Badge>;
      case "DAMAGED":
        return <Badge variant="destructive">Damaged (Rusak)</Badge>;
      case "LOST":
        return <Badge variant="destructive">Lost (Hilang)</Badge>;
      case "RETIRED":
      case "DISPOSED":
        return <Badge variant="secondary">Retired (Afkir)</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <AppShell
      title={`Detail Aset: ${asset.name}`}
      subtitle={`Spesifikasi teknis, kode identifikasi QR, dan riwayat penugasan unit ${asset.assetTag}`}
    >
      <div className="space-y-6">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <Link
            href="/assets"
            className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali ke Daftar Aset
          </Link>

          <div className="flex items-center gap-2">
            <span className="font-mono text-xs text-slate-400">ID: {asset.id}</span>
          </div>
        </div>

        {/* Hero Header Card */}
        <Card className="border-slate-800 bg-slate-900/80">
          <CardContent className="pt-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-400">
                  <Laptop className="h-7 w-7" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h1 className="text-xl font-bold text-white tracking-tight">
                      {asset.name}
                    </h1>
                    <span className="font-mono text-sm font-bold text-sky-400 bg-sky-950/60 px-2.5 py-0.5 rounded border border-sky-800/60">
                      {asset.assetTag}
                    </span>
                    {getStatusBadge(asset.status)}
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {asset.brand || "Tidak ada merk"} {asset.model ? `• Model: ${asset.model}` : ""}{" "}
                    {asset.serialNumber ? `• S/N: ${asset.serialNumber}` : ""}
                  </p>
                </div>
              </div>

              {/* QR Code Container */}
              {asset.qrCode && (
                <div className="flex items-center gap-3 p-3 rounded-lg border border-slate-800 bg-slate-950/80 shrink-0">
                  <Image
                    src={asset.qrCode}
                    alt={`QR Code ${asset.assetTag}`}
                    width={64}
                    height={64}
                    className="h-16 w-16 rounded bg-white p-1"
                  />
                  <div className="text-xs space-y-0.5">
                    <div className="flex items-center gap-1 font-semibold text-slate-200">
                      <QrCode className="h-3.5 w-3.5 text-sky-400" />
                      QR Tag ID
                    </div>
                    <div className="font-mono text-[11px] text-slate-400">{asset.assetTag}</div>
                    <a
                      href={asset.qrCode}
                      download={`QR-${asset.assetTag}.png`}
                      className="text-[11px] text-sky-400 hover:underline block pt-1"
                    >
                      Unduh QR Code
                    </a>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Key Attributes 3-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Penanggung Jawab & Lokasi */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-xs font-semibold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                <MapPin className="h-3.5 w-3.5 text-sky-400" />
                Lokasi & Pemegang
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Penanggung Jawab:</span>
                {asset.holder ? (
                  <div className="flex items-center gap-2">
                    <User className="h-3.5 w-3.5 text-emerald-400" />
                    <div>
                      <span className="font-medium text-white">{asset.holder.name}</span>
                      <span className="text-slate-500 block text-[11px]">{asset.holder.email}</span>
                    </div>
                  </div>
                ) : (
                  <span className="text-slate-500 italic">Belum ada pemegang (Unassigned)</span>
                )}
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Lokasi Penempatan:</span>
                <span className="text-white font-medium">
                  {asset.location ? `${asset.location.name} (${asset.location.code})` : "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Departemen Pengguna:</span>
                <span className="text-white font-medium">
                  {asset.department ? `${asset.department.name} (${asset.department.code})` : "-"}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Card 2: Kondisi Fisik & Kategori */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-xs font-semibold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                <ShieldAlert className="h-3.5 w-3.5 text-amber-400" />
                Spesifikasi & Kondisi
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Kondisi Fisik Saat Ini:</span>
                <Badge variant="outline" className="text-xs">
                  {asset.condition}
                </Badge>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Katalog Master Terkait:</span>
                <span className="text-white font-medium">
                  {asset.item ? `${asset.item.name} (${asset.item.code})` : "Aset Mandiri"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Catatan Teknis / Deskripsi:</span>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {asset.notes || "Tidak ada catatan tambahan."}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Card 3: Keuangan & Garansi */}
          <Card className="border-slate-800 bg-slate-900/60">
            <CardHeader className="pb-3 border-b border-slate-800/80">
              <CardTitle className="text-xs font-semibold text-slate-300 flex items-center gap-2 uppercase tracking-wider">
                <DollarSign className="h-3.5 w-3.5 text-emerald-400" />
                Pengadaan & Garansi
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4 space-y-3 text-xs">
              <div>
                <span className="text-slate-400 block mb-0.5">Tanggal Pembelian:</span>
                <span className="text-white font-medium">
                  {asset.purchaseDate ? formatDate(asset.purchaseDate) : "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Nilai Perolehan / Biaya:</span>
                <span className="font-mono text-emerald-400 font-semibold">
                  {asset.purchaseCost ? formatCurrency(Number(asset.purchaseCost)) : "-"}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block mb-0.5">Batas Garansi:</span>
                <span className="text-white font-medium">
                  {asset.warrantyExpiry ? formatDate(asset.warrantyExpiry) : "-"}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab / Section 1: Riwayat Penugasan */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Clock className="h-4 w-4 text-sky-400" />
              Riwayat Penugasan & Serah Terima ({asset.assignments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Penanggung Jawab</TableHead>
                  <TableHead>Ditetapkan Oleh</TableHead>
                  <TableHead>Lokasi</TableHead>
                  <TableHead>Tanggal Penetapan</TableHead>
                  <TableHead>Batas Waktu</TableHead>
                  <TableHead>Tanggal Kembali</TableHead>
                  <TableHead>Kondisi Kembali</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asset.assignments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-6 text-slate-500 text-xs">
                      Belum pernah ada riwayat serah terima penugasan untuk aset ini.
                    </TableCell>
                  </TableRow>
                ) : (
                  asset.assignments.map((item) => {
                    const now = new Date();
                    const isOverdue =
                      item.status === "ACTIVE" &&
                      item.dueDate &&
                      new Date(item.dueDate).getTime() < now.getTime();

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium text-white">
                          {item.holder?.name || item.borrowerName || "Peminjam Luar"}
                          <div className="text-[11px] text-slate-500">
                            {item.holder?.email || item.borrowerContact || "-"}
                          </div>
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {item.assignedBy.name}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400">
                          {item.location?.name || "-"}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400 font-mono">
                          {formatDate(item.assignedAt)}
                        </TableCell>
                        <TableCell className="text-xs font-mono">
                          {item.dueDate ? (
                            <div className="space-y-0.5">
                              <span className="text-slate-300 block">{formatDate(item.dueDate)}</span>
                              {isOverdue && (
                                <Badge variant="destructive" className="text-[9px] px-1 py-0">
                                  Terlambat
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-500 italic">Tanpa batas</span>
                          )}
                        </TableCell>
                        <TableCell className="text-xs text-slate-400 font-mono">
                          {item.returnedAt ? formatDate(item.returnedAt) : "-"}
                        </TableCell>
                        <TableCell className="text-xs">
                          {item.returnCondition ? (
                            <Badge variant="outline">{item.returnCondition}</Badge>
                          ) : (
                            "-"
                          )}
                        </TableCell>
                        <TableCell>
                          {item.status === "ACTIVE" ? (
                            isOverdue ? (
                              <Badge variant="destructive">Terlambat</Badge>
                            ) : (
                              <Badge variant="success">Active</Badge>
                            )
                          ) : (
                            <Badge variant="secondary">Returned</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tab / Section 2: Riwayat Pemeliharaan & Tiket Servis */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-400" />
              Riwayat Tiket Servis & Pemeliharaan ({asset.maintenances.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Judul Tiket</TableHead>
                  <TableHead>Prioritas</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Teknisi</TableHead>
                  <TableHead>Biaya Perbaikan</TableHead>
                  <TableHead>Tanggal Tiket</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asset.maintenances.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-500 text-xs">
                      Tidak ada catatan servis atau keluhan pemeliharaan tercatat.
                    </TableCell>
                  </TableRow>
                ) : (
                  asset.maintenances.map((rec) => (
                    <TableRow key={rec.id}>
                      <TableCell className="font-medium text-white">
                        {rec.title}
                        <div className="text-[11px] text-slate-500 line-clamp-1">{rec.description}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rec.priority === "CRITICAL"
                              ? "destructive"
                              : rec.priority === "HIGH"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[11px]"
                        >
                          {rec.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            rec.status === "COMPLETED"
                              ? "success"
                              : rec.status === "IN_PROGRESS"
                              ? "warning"
                              : "secondary"
                          }
                          className="text-[11px]"
                        >
                          {rec.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">
                        {rec.technician || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300 font-mono">
                        {formatCurrency(rec.cost ? Number(rec.cost) : null)}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400 font-mono">
                        {formatDate(rec.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tab / Section 3: Riwayat Pemindahan & Mutasi Lokasi */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-white flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-400" />
              Riwayat Relokasi & Pemindahan Lokasi ({asset.transfers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dari Lokasi</TableHead>
                  <TableHead>Menuju Lokasi</TableHead>
                  <TableHead>Pemegang Sebelumnya</TableHead>
                  <TableHead>Pemegang Baru</TableHead>
                  <TableHead>Alasan Pemindahan</TableHead>
                  <TableHead>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {asset.transfers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-slate-500 text-xs">
                      Aset belum pernah dipindahkan dari lokasi penempatan awalnya.
                    </TableCell>
                  </TableRow>
                ) : (
                  asset.transfers.map((tr) => (
                    <TableRow key={tr.id}>
                      <TableCell className="text-xs text-slate-300">
                        {tr.fromLocation?.name || "-"}
                      </TableCell>
                      <TableCell className="text-xs font-semibold text-sky-400">
                        {tr.toLocation?.name || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400">
                        {tr.fromHolder?.name || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">
                        {tr.toHolder?.name || "-"}
                      </TableCell>
                      <TableCell className="text-xs text-slate-300">
                        {tr.reason}
                      </TableCell>
                      <TableCell className="text-xs text-slate-400 font-mono">
                        {formatDate(tr.transferredAt)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
