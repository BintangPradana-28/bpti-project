# 04-business-rules.md — Business Rules Catalogue
# BPTI Inventory & Asset Management System

**Snapshot diaudit:** v4 (`bpti-project-main__1_.zip`, 2026-09-24) — lihat `README.md` §1
**Melanjutkan penomoran dari:** `SRS.md` §12 (BR-001 s.d. BR-010) — dokumen ini **tidak mengubah/menomori ulang** BR-001..010, hanya menambah BR-011 dst. yang digali langsung dari kode.
**Legenda status:** lihat `README.md` §2. Setiap baris di sini `[VERIFIED-IN-CODE]` dengan kutipan `file:baris`, kecuali ditandai lain.

---

## Inventory & Stock

**BR-011 — Stok tidak boleh negatif untuk transaksi OUT/TRANSFER**
`calculateNewStock()` (`inventory-service.ts:25-58`) melempar error `"Insufficient stock..."` jika `currentQty < quantity` untuk tipe `OUT` (baris 39-44) maupun `TRANSFER` (baris 50-55). Ditegakkan di dalam `prisma.$transaction` sehingga atomik terhadap race condition pada level aplikasi. *(Menegakkan `SRS.md` BR-002.)*

**BR-012 — `ADJUSTMENT` menetapkan kuantitas absolut, bukan delta**
`calculateNewStock()` baris 47-48: `case ADJUSTMENT: return quantity;` — nilai `quantity` yang dikirim untuk tipe `ADJUSTMENT` menjadi saldo baru **secara langsung**, berbeda dari `IN`/`OUT`/`RETURN`/`TRANSFER` yang menambah/mengurangi dari saldo berjalan. Ini keputusan desain yang valid, tapi berisiko *human error* di form input kalau operator tidak sadar bedanya (mis. mengetik "10" bermaksud "tambah 10" padahal untuk `ADJUSTMENT` itu berarti "jadikan tepat 10"). **Rekomendasi non-kode:** label UI untuk mode `ADJUSTMENT` sebaiknya eksplisit menyatakan "Kuantitas Akhir" bukan "Jumlah", untuk mencegah kesalahan input.

**BR-013 — Setiap transaksi stok yang menembus `minStock` otomatis membuat `SystemAlert`**
`transactStock()` baris 219-235: jika `newQty <= item.minStock`, dibuat baris `SystemAlert` bertipe `LOW_STOCK` (atau `OUT_OF_STOCK` jika `newQty === 0`), lalu ditampilkan di dashboard lewat `MonitoringService` (`monitoring-service.ts:32-36`) — lihat `17-data-dictionary.md` §7 untuk detail lengkap (termasuk koreksi atas temuan sebelumnya yang keliru menyatakan tabel ini tidak terhubung sama sekali). **Catatan:** alert yang sudah dibuat tidak pernah bisa ditandai selesai (`isResolved` tidak pernah ditulis `true` oleh kode manapun) — bukan salah BR ini, tapi konsekuensi praktisnya.

## Asset Lifecycle

**BR-014 — Hanya aset berstatus `AVAILABLE` yang boleh di-assign baru**
`assignAsset()` (`asset-service.ts:211-262`) baris 223-227 melempar error jika `asset.status !== AVAILABLE`. *(Menegakkan sebagian `SRS.md` BR-005.)*

**BR-015 — Kondisi pengembalian yang buruk otomatis mengubah status Asset menjadi `DAMAGED`**
`returnAsset()` (`asset-service.ts:264-317`) baris 291-295: jika `returnCondition` adalah `BROKEN` atau `POOR`, `nextStatus = DAMAGED`; selain itu `nextStatus = AVAILABLE`. Logika biner ini tidak membedakan `BROKEN` (rusak berat) dari `POOR` (kurang baik) — keduanya diperlakukan sama persis menghasilkan `DAMAGED`. Ini masuk akal sebagai simplifikasi tapi layak dikonfirmasi apakah memang disengaja bahwa `POOR` tidak punya jalur lebih ringan (mis. tetap `AVAILABLE` dengan `condition = POOR` tercatat, tanpa memblokir aset dari pemakaian berikutnya).

**BR-016 — Dua mekanisme validasi transisi status yang tidak saling terhubung (temuan penting)**
`LEGAL_TRANSITIONS` (`asset-service.ts:7-16`, 8 status, tabel transisi lengkap) dan `isValidAssetTransition()` (baris 18-20) adalah satu-satunya tempat aturan transisi status Asset didefinisikan secara formal. Keduanya **hanya dikonsumsi oleh `updateStatus()`** (baris 175-209) — method yang benar menegakkan `LEGAL_TRANSITIONS` (baris 186-191) tapi **tidak pernah dipanggil dari action manapun** (dikonfirmasi: `grep -rn "AssetService.updateStatus" src/actions` = 0 hasil; `updateAssetStatusSchema` di `validations/asset.ts` juga terekspor tapi tak pernah diimpor `actions/`). Empat jalur lain yang benar-benar mengubah `Asset.status` di produksi masing-masing punya logika ad-hoc sendiri, **tidak mengacu `LEGAL_TRANSITIONS` sama sekali**:
| Jalur | Baris | Perubahan status | Konsisten dgn `LEGAL_TRANSITIONS`? |
|---|---|---|---|
| `assignAsset()` | `asset-service.ts:223-227,246` | *(apa pun)* → `ASSIGNED`, hanya jika asal `AVAILABLE` | ✓ ya (`AVAILABLE→ASSIGNED` ada di tabel) |
| `returnAsset()` | `asset-service.ts:291-301` | `ASSIGNED` → `AVAILABLE`/`DAMAGED` | ✓ ya (keduanya ada di tabel dari `ASSIGNED`) — **tapi**: tidak memeriksa status asal sebelum menulis, jadi kalau dipanggil pada assignment yang assetnya sudah pindah status lain (mis. lewat jalur maintenance), tetap dipaksa `AVAILABLE`/`DAMAGED` |
| `MaintenanceService.createTicket()` | `maintenance-service.ts:53-57` | *(apa pun)* → `IN_REPAIR`, **tanpa syarat apa pun** | ❌ **tidak** — bisa memaksa `IN_REPAIR` dari `RETIRED`/`DISPOSED`/`LOST`, yang menurut `LEGAL_TRANSITIONS` tidak diizinkan |
| `MaintenanceService.updateStatus()` | `maintenance-service.ts:96-105` | `IN_REPAIR` → `AVAILABLE` (saat tiket `COMPLETED`/`CANCELLED`) | ✓ ya, tapi begitu juga tanpa memeriksa status Asset saat ini terlebih dulu |
Dampak konkret paling nyata: **tiket maintenance bisa dibuka untuk aset yang sudah `RETIRED`/`DISPOSED`/`LOST`**, secara diam-diam "menghidupkan kembali" aset yang seharusnya sudah keluar dari sirkulasi. *(Terkait `BR-005`, `FR-ASSET-STATE-001/002`.)*
**Rekomendasi:** satukan keempat jalur ini melalui `updateStatus()`/`isValidAssetTransition()` sebagai satu sumber kebenaran, atau — kalau keempatnya memang sengaja punya aturan lebih sempit — tambahkan minimal satu baris pemeriksaan status-asal di `createTicket()`.

**BR-017 — `transferAsset()` tidak memeriksa status Asset sama sekali**
`transferAsset()` (`asset-service.ts:405-450`) tidak membaca/memvalidasi `asset.status` sebelum memindahkan `locationId`/`holderId` — bisa dipanggil pada aset berstatus apa pun, termasuk `DISPOSED`. Berbeda dari BR-016 (yang tentang lompatan status), ini tentang operasi yang **tidak mengubah status sama sekali** tapi tetap boleh dieksekusi pada aset yang secara logis sudah "tidak aktif". Severitas rendah (memindahkan lokasi aset yang sudah dibuang tidak merusak data), tapi tetap kesenjangan validasi yang nyata.

## Maintenance

**BR-018 — Transisi status Maintenance tidak divalidasi legalitasnya**
Berbeda dari Asset (yang punya `LEGAL_TRANSITIONS`), `MaintenanceStatus` (6 nilai: `REQUESTED→APPROVED→IN_PROGRESS→WAITING_PART→COMPLETED`/`CANCELLED`) **tidak punya tabel transisi legal apa pun** di kode. `updateStatus()` (`maintenance-service.ts:72-119`) menerima `status` apa pun dan menuliskannya langsung (baris 88) — secara teknis mengizinkan lompatan `REQUESTED` langsung ke `COMPLETED` tanpa pernah melalui `APPROVED`/`IN_PROGRESS`. Detail lengkap tabel status di `05-state-machines.md` §3.

## Identity, Access & Audit

**BR-019 — Izin efektif = union tabel `RolePermission` (selalu kosong) dengan peta hardcoded**
`requirePermission()`/`getCurrentUser()` di `session.ts` menggabungkan `user.role.permissions` (relasi ke `RolePermission`, tidak pernah diisi — `17-data-dictionary.md` §1) dengan `ROLE_DEFAULT_PERMISSIONS[roleName]` (hardcoded, `rbac.ts:38-92`, tidak berubah sejak v1). Praktiknya, peta hardcoded 100% menentukan hasil. *(Detail penuh: `22-authorization-matrix.md`.)*

**BR-020 — Setiap mutasi yang terpasang ke UI wajib lolos `requirePermission → Zod.parse` sebelum menyentuh database**
Konsisten di seluruh 10 Server Action yang terpasang (`asset-actions.ts` ×4, `inventory-actions.ts` ×2, `maintenance-actions.ts` ×2, `user-actions.ts`, `location-actions.ts`) dan 1 Route Handler (`api/reports/export/route.ts`). Tidak ada satu pun jalur mutasi yang melewati urutan ini. *(Menegakkan `SRS.md` BR-001, BR-007, BR-008; lihat juga `FR-ACCESS-002`.)*

**BR-021 — Tidak ada operasi hapus permanen (`.delete()`/`.deleteMany()`) di seluruh basis kode**
Diverifikasi lewat pencarian menyeluruh di `src/` (di luar `__tests__`) — nol hasil. Konsisten dengan `BR-004` (preservasi riwayat) dan filosofi audit trail *immutable*. Penghapusan "logis" yang ada hanya lewat field `isActive`/status, itu pun baru dipakai untuk `InventoryItem.isActive` (filter, bukan mutasi — belum ada UI untuk menonaktifkan item) dan `User.isActive` (field ada, belum ada UI untuk menonaktifkan user — lihat `README.md` Temuan #4).

**BR-022 — Pembuatan User mensyaratkan email unik dan selalu membuat kredensial ter-hash dalam satu transaksi**
`UserService.createUser()` (`user-service.ts:75-130`) memeriksa duplikasi email (baris 76-82) sebelum `hashPassword()`, lalu membuat baris `User` **dan** `Account` dalam satu `prisma.$transaction` (baris 86-112) — tidak mungkin ada `User` tanpa kredensial login yang valid melalui jalur ini (berbeda dari `prisma/seed.ts` sebelum v2, yang sempat membuat `User` tanpa `Account` sama sekali).

**BR-023 — Pembuatan Location mensyaratkan kode unik, tanpa proteksi siklus pohon**
`LocationService.createLocation()` (`location-service.ts:93-122`) memeriksa duplikasi `code` (baris 94-100) tapi **tidak** memeriksa apakah `parentId` yang diberikan akan membentuk siklus (A→parent B→parent A). Risiko rendah untuk saat ini (hanya `create`, belum ada `update` yang bisa mengubah `parentId` node yang sudah ada), tapi wajib ditambahkan sebelum fitur *update* lokasi dibangun. *(Lihat juga `03-domain-model.md` Invariant I-8.)*

## Ringkasan status penegakan

| BR | Ditegakkan di kode? | Tercermin di UI (bisa dipicu pengguna nyata)? |
|---|:-:|:-:|
| BR-011, 012, 013 | ✅ | ✅ (lewat `InventoryModals`) |
| BR-014, 015 | ✅ | ✅ (lewat `AssignmentModals`) |
| BR-016 | ⚠️ Sebagian (1 dari 4 jalur berpotensi melanggarnya) | — |
| BR-017 | ❌ (tidak ada validasi) | ✅ tetap bisa dipicu |
| BR-018 | ❌ (tidak ada validasi) | ✅ tetap bisa dipicu (lewat aksi `updateMaintenanceStatusAction`, walau belum ada UI update di `MaintenanceModal` — lihat `README.md` Temuan #1) |
| BR-019 – BR-023 | ✅ | ✅ |
