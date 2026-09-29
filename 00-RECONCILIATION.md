# 00-RECONCILIATION.md — Rekonsiliasi Scope Resmi vs Implementasi
# PKL BPTI UHAMKA — Sistem Informasi Inventaris

**Jenis dokumen:** Artifact Comparison (`AGENTS.md` §45 — "Identify contradictions, missing requirements, regressions")
**Dibuat:** 2026-09-24 · **Diselesaikan:** 2026-09-24
**Status:** ✅ Resolved — `bpti-project-main` dikonfirmasi sebagai proyek tim PKL (lihat §5). Dokumen ini disimpan sebagai catatan keputusan.
**Legenda status:** lihat `README.md` §2

---

## 0. Latar belakang

Audit internal mula-mula mendokumentasikan repositori **`bpti-project-main`** (19 model Prisma, RBAC 6 peran, modul Asset/Inventory/Location/Maintenance/Monitoring/Reports/Audit — lihat `README.md` dan `03-domain-model.md`). **Empat artefak resmi PKL** kemudian dibandingkan terhadapnya:

1. `Project_Charter_Sistem_Inventaris_BPTI_UHAMKA.docx`
2. `SRS_Inventaris_BPTI_UHAMKA_Lengkap.docx`
3. Lima diagram `drawio` (ERD, Arsitektur 3-Tier, Arsitektur Lapisan, Use Case, Modularitas Tim)
4. Dua diagram aktivitas (`drawio`) alur Peminjaman dan Pengembalian

Keempatnya **secara eksplisit dan tegas menggambarkan sistem yang jauh lebih kecil** daripada `bpti-project-main`. Ini bukan perbedaan kecil — ini dua sistem dengan cakupan (scope) yang berbeda secara mendasar, dan salah satunya (dokumen resmi) punya **tenggat waktu nyata dengan mentor yang akan menilai**. Prinsip `AGENTS.md` §45 ("Do not silently replace one approved decision with another") dan §79 ("Stop implementation... when a requested change contradicts an explicit client requirement") mewajibkan temuan ini dicatat sebelum dokumen tambahan untuk `bpti-project-main` dilanjutkan, karena melanjutkannya tanpa rekonsiliasi berisiko menghasilkan dokumentasi yang rapi untuk sistem yang salah.

## 1. Identitas proyek resmi (dari Project Charter, ditandatangani dalam proses)

| Item | Nilai `[VERIFIED-IN-DOCX]` |
|---|---|
| Nama proyek | Sistem Informasi Inventaris Barang Berbasis Web (SIM-Inventaris BPTI) |
| Instansi | **Badan** Pengembangan Teknologi Informasi (BPTI), UHAMKA — bukan "Balai", dan bukan entitas `.go.id` (UHAMKA adalah universitas swasta Muhammadiyah) |
| Jenis penugasan | PKL / Magang, 4 mahasiswa |
| Periode | **14 September – 31 Oktober 2026** (~7 minggu). Hari ini **24 September 2026 = pertengahan Minggu ke-2 dari 7** ("Database & Fondasi Autentikasi") |
| Nama repositori (dari diagram Modularitas Tim) | `inventaris-bpti` — **bukan** `bpti-project-main` |
| Mentor lapangan | Mufki (baris tanda tangan "Mengetahui/Menyetujui" — belum terisi tanggal pada dokumen yang diunggah) |
| Tim | Imam Maula (PM/Core Architect), Indra Dharmawan (UI/UX & Frontend), **Muhan Bintang (System Analyst & Fullstack Dev, fokus Sirkulasi Peminjaman & SOP Logic)**, Reval Delsiyano (QA/QC & Layout) |

**Peran spesifik Dev 3 (Muhan Bintang)**, sesuai `SRS_Inventaris_BPTI_UHAMKA_Lengkap.docx` BAB 3: Server Actions sirkulasi pinjam/kembali, transaksi atomik `Prisma.$transaction`, kalkulasi stok dinamis, validasi status terlambat — persis yang digambarkan di kedua diagram aktivitas terkait.

## 2. Perbandingan langsung: Scope resmi vs `bpti-project-main`

| Dimensi | **Resmi** (Charter + SRS UHAMKA) | **`bpti-project-main`** (hasil audit internal) |
|---|---|---|
| Jumlah tabel inti | **3**: `users`, `items`, `borrow_records` | **19** model: User, Session, Account, Verification, Role, Permission, RolePermission, Department, Location, Category, InventoryItem, Stock, StockMovement, Asset, AssetAssignment, AssetTransfer, MaintenanceRecord, AuditLog, SystemAlert |
| Peran pengguna | **1** — Admin tunggal (Viewer eksplisit "ditiadakan", BAB 2.3) | **6** — SUPER_ADMIN, INVENTORY_ADMIN, IT_STAFF, MANAGER, AUDITOR, VIEWER, dengan 23 permission granular |
| Model peminjaman | Time-boxed **loan** dengan `dueDate` + deteksi TERLAMBAT (seperti pinjam-buku perpustakaan) — peminjam adalah **staf eksternal yang datanya diketik manual oleh Admin**, bukan akun pengguna | Custody **assignment** tanpa batas waktu (seperti serah-terima aset kantor) — pemegang (`holder`) adalah baris `User` sungguhan di sistem |
| Lokasi | Kolom teks bebas `Item.location` (mis. "Rak Gudang") — bukan tabel | Pohon hierarkis `Location` (self-relation, Organization→Building→Floor→Room) |
| Autentikasi | Username + password, **Bcrypt**, tanpa email | Better Auth, email + password, dengan tabel `Account`/`Session`/`Verification` |
| Maintenance/Perbaikan | ❌ Tidak ada di scope (kondisi fisik cukup dicatat sebagai field `condition`/`returnCondition`) | ✅ Modul penuh `MaintenanceRecord` dengan status 6-tahap |
| Audit trail | ❌ Tidak diminta sebagai tabel terpisah | ✅ `AuditLog` + `SystemAlert` dedicated |
| Monitoring/Reports | Kartu metrik sederhana di dasbor (FR-UI-01) | Modul `Monitoring`+`Reports` terpisah dengan banyak KPI |
| Out-of-scope eksplisit | Portal Viewer pegawai, approval workflow online, SSO, QR code — **keempatnya eksplisit ditulis "Tidak Termasuk"** di Charter §3 | Tidak ada pernyataan out-of-scope — `AGENTS.md`/`SRS.md` proyek ini justru menyebut QR (`FR-QR`), notifikasi, dan RBAC penuh sebagai `[PROPOSED]`/`[OPTIONAL]` in-scope |
| ID requirement | `FR-AUTH-01..04`, `FR-ITEM-01..05`, `FR-TRX-01..06`, `FR-UI-01..05` (20 total), `NFR-*-01` (5 total) | `FR-AUTH-*` s.d. `FR-NOTIFY-*` (~90 requirement), `NFR-*` (~50) |

**Kesimpulan yang bisa dipastikan dari bukti di atas, bukan tebakan:** dua dokumen SRS ini menggambarkan dua sistem yang berbeda secara substansial, bukan dua versi dari sistem yang sama pada tingkat detail berbeda.

## 3. Yang **tetap relevan dan bisa dipakai ulang** dari `bpti-project-main` untuk proyek resmi

Meski skalanya jauh melampaui kebutuhan, beberapa pola implementasi di `bpti-project-main` justru **lebih matang** dari yang diminta SRS resmi dan secara teknis valid untuk dipakai ulang oleh tim — ini bukan kerja yang sia-sia:

| Pola di `bpti-project-main` | Padanan requirement resmi | Catatan |
|---|---|---|
| `asset-service.ts` / `inventory-service.ts`: `prisma.$transaction(...)` untuk assign/transfer/transactStock | `FR-TRX-03`, `FR-TRX-05`, `NFR-REL-01` (ACID) | Pola atomiknya **identik secara prinsip** dengan yang diminta SOP resmi BAB 7.1/7.2 — tinggal disederhanakan ke 2 tabel (`items`, `borrow_records`) alih-alih 4+ |
| `lib/validations/*.ts` (Zod) | FR-ITEM/FR-TRX menyebut validasi wajib | Polanya (schema per-aksi, `.parse()` sebelum service call) langsung terpakai, tinggal field-nya disesuaikan ke `borrow_records` |
| `src/middleware.ts` (route guard berbasis cookie) | `FR-AUTH-03` | Sama persis kebutuhannya — proteksi `/dashboard/*` dll. Tinggal disederhanakan (resmi: 1 role, tidak perlu logika permission) |
| `lib/auth.ts` (Better Auth) | `FR-AUTH-02` minta **Bcrypt** spesifik, bukan Better Auth | ⚠️ **Tidak bisa dipakai langsung** — Better Auth punya hashing sendiri (scrypt secara default), sementara SRS resmi eksplisit meminta "algoritma Bcrypt (minimal 10 salt rounds)" sebagai NFR-SEC-01. Ini butuh keputusan sadar, bukan asumsi — lihat §5. |
| FK `onDelete: Restrict` pada relasi transaksi→master data | `FR-ITEM-05` ("Proteksi Hapus Aset Terikat... onDelete: Restrict") | **Cocok persis, bahkan istilahnya sama.** Keputusan desain ini sudah benar untuk kedua sistem. |
| 8 Server Action dengan pola `auth-check → Zod.parse → service → revalidatePath` | Pola implementasi untuk `FR-TRX-*`/`FR-ITEM-*` | Struktur file (`actions/*.ts`) cocok dengan direktori kerja Dev 2/Dev 3 di SRS resmi BAB 3 |

## 4. Yang **tidak cocok / kontradiktif** dan wajib diputuskan sebelum submit ke mentor

1. **Hashing password**: SRS resmi eksplisit meminta Bcrypt ≥10 salt round (`NFR-SEC-01`). `bpti-project-main` memakai Better Auth (`hashPassword` dari `better-auth/crypto`, bukan bcrypt secara default). Kalau `bpti-project-main` yang mau diajukan sebagai deliverable PKL, ini butuh verifikasi eksplisit algoritma hash Better Auth yang benar-benar dipakai, atau ganti ke bcrypt langsung agar sesuai SRS yang sudah disahkan.
2. **Nama organisasi tidak konsisten**: `bpti-project-main/src/app/login/page.tsx` menampilkan "**Balai** Pelatihan dan Pengembangan Teknologi Informasi" dan email seed `admin@bpti.go.id`. Dokumen resmi menulis "**Badan** Pengembangan Teknologi Informasi" tanpa indikasi domain `.go.id`. Kemungkinan besar belum sempat disilangcek dengan dokumen resmi saat ditulis — **perlu diperbaiki sebelum demo ke mentor Mufki**, karena salah nama instansi sendiri di halaman login akan terlihat buruk di evaluasi.
3. **Konsep "peminjaman" berbeda secara fundamental** (lihat tabel §2, baris "Model peminjaman") — ini bukan sekadar field yang kurang, tapi model relasi yang berbeda (loan bertenggat-waktu vs custody tanpa batas waktu). Tidak bisa direkonsiliasi dengan menambah kolom; salah satu model harus dipilih.
4. **Timeline**: SRS resmi menjadwalkan Minggu 2 (minggu ini) untuk "Migrasi skema database Prisma ke MySQL" dan "Implementasi sistem login" — hal paling dasar. Jika `bpti-project-main` yang dipakai, tim secara teknis **sudah jauh melampaui Minggu 2**, yang baik untuk kecepatan tapi berisiko tidak sinkron dengan progres 3 rekan tim lain yang mungkin mengerjakan `inventaris-bpti` sesuai jadwal charter.

## 5. Keputusan — dikonfirmasi 2026-09-24

`bpti-project-main` **adalah proyek tim PKL** — bukan eksplorasi pribadi terpisah dari salah satu anggota. Tim (Imam, Indra, Bintang, Reval) secara nyata membangun sistem yang jauh lebih luas daripada yang tertulis di `Project_Charter_Sistem_Inventaris_BPTI_UHAMKA.docx`/`SRS_Inventaris_BPTI_UHAMKA_Lengkap.docx`.

**Implikasi praktis yang tetap berlaku terlepas dari alasan di balik perluasan scope ini** (dicatat agar tidak terlewat sebelum demo ke Mufki 31 Oktober):
- Dua dokumen resmi (Charter + SRS) **tidak lagi mencerminkan** apa yang sedang dibangun. Kalau salah satunya perlu ditunjukkan ke mentor/penilai PKL, sebaiknya diperbarui dulu (atau setidaknya ditambahkan adendum) supaya paper trail proyek konsisten dengan kode — keputusan memperbarui atau tidak ada di tangan tim.
- Temuan §4 (nama instansi, Bcrypt vs Better Auth) tetap berlaku dan layak diperbaiki.
- Seri dokumen `docs/04`–`docs/32` **dilanjutkan untuk `bpti-project-main`** sebagai sistem yang benar-benar dibangun tim.
- Tabel §3 (pola yang bisa dipakai ulang) dan poin 2 di §4 (nama instansi salah di UI) berlaku terlepas dari alasan di balik perluasan scope — representasi identitas BPTI yang salah tidak pernah benar untuk dibiarkan.

Dokumen ini berstatus **selesai/resolved** — tersimpan sebagai catatan keputusan (mirip ADR ringan) untuk referensi di kemudian hari, bukan pertanyaan terbuka lagi.
