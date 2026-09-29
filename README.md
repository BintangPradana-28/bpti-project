# docs/README.md — Dokumentasi Pendukung PRD/SRS
# BPTI Inventory & Asset Management System

**Jenis dokumen:** Indeks dokumentasi + Register Temuan (Gap Register)
**Status:** Baseline audit — untuk validasi System Analyst/Full-stack Developer
**Versi:** 1.0.0
**Tanggal:** 2026-09-24
**Disusun mengikuti:** kerangka "Pre-Coding Engineering Package", `AGENTS.md` §2.5 (Evidence Discipline), dan legenda status `SRS.md` §2

---

## 0. Cara membaca folder `docs/`

Repo ini sudah memiliki dua dokumen inti yang **kuat dan tidak perlu dibuat ulang**: `SRS.md` (kebutuhan produk/sistem, dengan ID `FR-*`/`NFR-*`/`BR-*`/`TAR-*`) dan `AGENTS.md` (konstitusi cara kerja AI agent, 100 pasal). File-file di `docs/` ini **melengkapi** keduanya — mengisi lapisan Domain, Data, Arsitektur, Keamanan, dan Traceability yang di-*refer* oleh SRS/AGENTS tetapi belum punya artefak tersendiri.

Setiap dokumen di sini:
1. **Ditelusuri ke kode sungguhan** — setiap klaim faktual mencantumkan path file dan nomor baris dari snapshot yang diaudit (lihat §1).
2. **Memakai legenda status yang sama dengan `SRS.md`** (§2 di bawah), plus satu label tambahan `[VERIFIED-IN-CODE]` untuk klaim yang diverifikasi langsung dari source code (bukan dari dokumentasi resmi/eksternal).
3. **Tidak mengarang jawaban** untuk pertanyaan yang menurut `SRS.md` §39 ("Open Requirements") atau `implementation_plan.md` masih terbuka. Jika sebuah dokumen butuh keputusan bisnis yang belum ada, ditandai `[TBD]`/`[OPEN]` — sama seperti `SRS.md` sendiri melakukannya.

## 1. Identitas snapshot yang diaudit

| Snapshot | Arsip | Diunggah | SHA-256 (12 char pertama) |
|---|---|---|---|
| **v1** | `bpti-project-main.zip` | 2026-09-21 | `ac46e1420ca6…` |
| **v2** | `bpti-project-main__2_.zip` | 2026-09-24 | `e05b9237d1d5…` |
| **v3** | `bpti-project-main.zip` (re-upload) | 2026-09-24 | `0f7b7230e23c…` |
| **v4** (diaudit) | `bpti-project-main__1_.zip` | 2026-09-24 | `ece9775729…` |

Seluruh dokumen dalam `docs/` ini mengaudit **v4** kecuali disebutkan lain. Setiap transisi versi diverifikasi dengan `diff -rq` per-file (bukan tebakan) — v1→v2 dirangkum di §4, v2→v3→v4 dirangkum di §4a. Proyek ini jelas dikerjakan **sangat aktif** (4 snapshot dalam satu hari) — bagian yang paling cepat basi di seluruh `docs/` adalah §5 (Register Temuan) dan `32-traceability-matrix.md`, karena keduanya bergantung pada "apa yang benar-benar terhubung ke UI hari ini", bukan pada struktur kode yang lebih stabil (schema, pola arsitektur).

**Cara memperbarui saat kode berubah lagi:** ambil snapshot baru dan jalankan ulang bagian ini — `diff` terhadap v4 (bukan menulis ulang dari nol) supaya cepat dan akurat.

## 2. Legenda status (identik dengan `SRS.md` §2, ditambah satu label)

| Label | Makna |
|---|---|
| `[CONFIRMED]` | Ditetapkan eksplisit oleh konteks proyek/klien |
| `[USER-PROVIDED]` | Disuplai eksplisit oleh tim |
| `[PROPOSED]` | Rekomendasi engineering, menunggu konfirmasi |
| `[ASSUMPTION]` | Asumsi sementara agar perencanaan bisa jalan |
| `[TBD]` | Wajib dikonfirmasi |
| `[OPEN]` | Requirement belum terselesaikan |
| `[OPTIONAL]` | Boleh diimplementasikan jika waktu/scope mengizinkan |
| `[FUTURE]` | Di luar baseline saat ini |
| `[VERIFIED]` | Diverifikasi terhadap sumber teknis otoritatif **eksternal** (dokumentasi resmi framework/library) |
| `[VERIFIED-IN-CODE]` *(baru)* | Diverifikasi langsung dengan membaca **source code** pada snapshot v2 yang disebut di §1. Kutipan `file:baris` selalu menyertainya. |

## 3. Peta 49 Artefak "Master Blueprint" → status di repo ini

Ini memetakan **persis** daftar 00–48 dari kerangka "Pre-Coding Engineering Package" (§62) ke kondisi nyata repo. "Ada" berarti isinya benar-benar ditemukan saat dibaca, bukan hanya nama filenya cocok.

| # | Artefak | Status | Lokasi / catatan |
|---|---|---|---|
| 00 | Product Brief | ❌ **Tidak ada** | `README.md` root hanya deskripsi teknis 1 paragraf + stack. Bukan product brief. |
| 01 | PRD | ⚠️ **Tidak ada sebagai file terpisah** | `SRS.md` §3–§9 memuat sebagian materi PRD (definisi produk, objectives, scope, persona, stakeholder) tapi bercampur dengan requirement teknis. Lihat §6 di bawah. |
| 02 | SRS | ✅ **Ada — kuat** | `SRS.md` (46 KB, 50 bagian, ID `FR-*/NFR-*/BR-*/TAR-*`). Tidak perlu dibuat ulang. |
| 03 | Domain Model | ✅ **Dibuat sekarang** | `03-domain-model.md` |
| 04 | Business Rules | ✅ **Dibuat sekarang** | `04-business-rules.md` (memperluas `SRS.md` §12 BR-001..010) |
| 05 | State Machines | ✅ **Dibuat sekarang** | `05-state-machines.md` |
| 06 | Context Map | ⚠️ **Sebagian** | Dicakup ringkas di `03-domain-model.md` §1 (sistem tidak punya integrasi eksternal saat ini — tidak ada email service, storage service, atau API pihak ketiga yang terhubung). |
| 07 | UX Spec | ❌ Belum | Butuh keputusan desain/produk nyata — lihat §7 Fase 2. |
| 08 | Information Architecture | ⚠️ **Sebagian ada** | `SRS.md` §26 sudah proposed; cocok dengan navigasi `sidebar.tsx` yang diimplementasi. Tidak butuh dokumen baru — cukup tandai `SRS.md` §26 sebagai `[VERIFIED-IN-CODE]`. |
| 09 | User Flows | ❌ Belum | `SRS.md` §15–17 sudah berisi flow tekstual; belum ada versi per-halaman dengan error/empty state. |
| 10 | Design System | ❌ Belum sebagai dokumen | Ada secara *implisit* di `src/components/ui/*` + `AGENTS.md` §25/§91, tapi belum didokumentasikan sebagai token/skala formal. |
| 11 | Accessibility | ⚠️ **Checklist ada, hasil audit belum** | `SRS.md` §43 berisi checklist kosong; belum pernah dijalankan terhadap UI aktual. |
| 12 | Architecture | ⚠️ **Diusulkan ≠ dibangun** | `SRS.md` §24 (TAR) + `AGENTS.md` §7 menetapkan gaya modular monolith. `13-module-boundaries.md` (dibuat sekarang) mendokumentasikan **arsitektur as-built**, yang menyimpang dari struktur folder yang diusulkan `SRS.md` §25. |
| 13 | Module Boundaries | ✅ **Dibuat sekarang** | `13-module-boundaries.md` |
| 14 | Dependency Rules | ✅ **Tercakup** | Di dalam `13-module-boundaries.md` §3 |
| 15 | ADR | ❌ Belum ada satupun | Direkomendasikan mulai dari 2 keputusan yang sudah *de-facto* diambil kode: (a) struktur modul flat vs layered, (b) permission hardcoded vs tabel `RolePermission`. Lihat §7 Fase 2. |
| 16 | Data Model | ✅ **Tercakup** | `prisma/schema.prisma` adalah data model itu sendiri; `03-domain-model.md` menjelaskan maknanya. |
| 17 | Data Dictionary | ✅ **Dibuat sekarang** | `17-data-dictionary.md` |
| 18 | Database Rules | ⚠️ **Sebagian** | `AGENTS.md` §14 sudah menetapkan prinsip; `17-data-dictionary.md` §4 menambahkan verifikasi konkret (indeks, FK, constraint apa yang benar-benar ada). |
| 19 | Migration Strategy | ❌ Belum | Proyek masih memakai `prisma db push` (lihat `README.md` root), belum ada folder `prisma/migrations/`. Perlu keputusan sebelum produksi — lihat Register Temuan #7. |
| 20 | API Contract | N/A saat ini | Tidak ada Route Handler HTTP selain `[...all]` Better Auth. Semua mutasi lewat Server Actions (bukan REST/HTTP API publik), jadi kontrak API formal (OpenAPI) belum relevan — `AGENTS.md` §86 secara eksplisit menyatakan ini pilihan yang benar untuk mutasi internal. Akan relevan begitu ada konsumen eksternal. |
| 21 | Error Contract | ⚠️ **Ada, tidak konsisten** | Semua Server Action mengembalikan `{success, error}` — polanya seragam (lihat `13-module-boundaries.md` §2) tapi belum didokumentasikan sebagai kontrak formal dengan kode error terstruktur (`SRS.md` tidak mensyaratkan `error.code` terstruktur). |
| 22 | Authorization Matrix | ✅ **Dibuat sekarang** | `22-authorization-matrix.md` (merekonsiliasi `SRS.md` §19) |
| 23 | Threat Model | ✅ **Dibuat sekarang** | `23-threat-model.md` |
| 24 | Attack Surface | ✅ **Tercakup** | Di dalam `23-threat-model.md` §2 |
| 25 | Security Requirements | ✅ **Sudah ada di SRS** | `SRS.md` §23 (NFR-SEC-001..010). `23-threat-model.md` memetakan status implementasi tiap ID. |
| 26 | Privacy | ⚠️ **Prinsip ada, dokumen belum** | `AGENTS.md` §65 menetapkan prinsip; belum ada `PRIVACY.md` khusus karena field PII di schema minim (nama, email — lihat `17-data-dictionary.md`). Rendah prioritas untuk MVP internal, tapi wajib sebelum data pegawai riil dimasukkan. |
| 27 | Quality Attributes | ✅ **Sudah ada di SRS** | `SRS.md` §23 (semua kategori NFR). Tidak perlu diduplikasi. |
| 28 | Performance Budget | ❌ Belum ada angka | `SRS.md` §23 NFR-PERF eksplisit menyatakan `[TBD]` karena klien belum memberi target beban. Tidak bisa diisi tanpa data nyata — lihat §7 Fase 2. |
| 29 | Reliability | ⚠️ **Prinsip ada** | `SRS.md` §23 NFR-REL. Backup/restore konkret → lihat baris 36. |
| 30 | Test Strategy | ✅ **Sudah ada di SRS** | `SRS.md` §34. Realitas implementasi (Vitest saja, RTL/Playwright belum terpasang) → Register Temuan #6 dan `32-traceability-matrix.md`. |
| 31 | Test Cases | ⚠️ **Sebagian** | 3 file `src/__tests__/*.test.ts` ada dan lulus secara struktural (lihat `05-state-machines.md` §4), tapi hanya menguji fungsi murni (RBAC lookup, tidak menguji service/Prisma/transaction). `SRS.md` §35 E2E-001..009 belum ada satupun implementasinya. |
| 32 | Traceability Matrix | ✅ **Dibuat sekarang** | `32-traceability-matrix.md` — mengisi tabel kosong di `SRS.md` §37 yang secara eksplisit diminta untuk "diperbarui seiring implementasi berjalan". |
| 33 | Deployment | ⚠️ **Sebagian** | `docker-compose.yml` mendefinisikan MySQL lokal saja; hosting produksi masih `[TBD]` di `SRS.md` §33. |
| 34 | Environment | ✅ **Ada** | `.env.example` + `SRS.md` §32. Cukup lengkap untuk baseline. |
| 35 | Observability | ⚠️ **Sebagian** | `src/lib/logger.ts` (Pino) ada dan dipakai di `audit.ts`; belum ada correlation ID per-request (`NFR-OBS-002` belum terpenuhi). |
| 36 | Backup & DR | ❌ Belum | `SRS.md` §31 RPO/RTO eksplisit `[TBD]`. Tidak bisa diisi tanpa keputusan infrastruktur — §7 Fase 2. |
| 37 | Runbook | ❌ Belum | Butuh target hosting nyata dulu (lihat baris 33). |
| 38 | Incident Response | ❌ Belum | Sama — bergantung pada organisasi/hosting nyata. |
| 39 | Contributing | ❌ Belum | Belum ada `CONTRIBUTING.md`. Rendah urgensi selama tim masih 1 developer + agent. |
| 40 | Coding Standards | ✅ **Sudah ada di AGENTS.md** | `AGENTS.md` §90–91, §9–10. Tidak perlu diduplikasi. |
| 41 | Dependency Policy | ✅ **Sudah ada di AGENTS.md** | `AGENTS.md` §42. |
| 42 | Git Workflow | ✅ **CI sekarang ada** | `AGENTS.md` §69–70 menyebut konvensi branch/CI; `.github/workflows/ci.yml` **ditambahkan sejak v3** (install → `prisma generate` → lint → unit test). Belum ada job `build` atau E2E — lihat Register Temuan #6. |
| 43 | AGENTS.md (AI Constitution) | ✅ **Ada — sangat lengkap** | `AGENTS.md` (45 KB, 100 pasal). Kualitasnya di atas rata-rata; tidak perlu disentuh. |
| 44 | AI Coding Rules | ✅ **Tercakup oleh AGENTS.md + 1 file tambahan** | `AI_CODING_MASTER_RULES_CONSTRAINTS_CLEAN_VIBE_2026.md` dan `AI_IDE_CLEAN_VIBE_CODING_2026_OMNICOMPREHENSIVE_MASTER_GUIDE.md` adalah kerangka **generik lintas-proyek** (isinya juga membahas WhatsApp CTA, landing page, testimonial — relevan untuk proyek berbasis web pada umumnya, tidak semua relevan untuk BPTI). `AGENTS.md` adalah distilasi khusus-BPTI dari keduanya. `gpt-6-astra.md` (546 KB, system prompt agent coding generik) **sudah dihapus sejak v3** — pembersihan yang tepat karena isinya bukan fakta proyek. Tidak ada tindakan diperlukan di sini. |
| 45 | Handover | ❌ Belum | Terlalu dini — sistem belum production-ready (lihat Register Temuan). |
| 46 | User Guide | ❌ Belum | Sama. |
| 47 | Admin Guide | ❌ Belum | Sama. |
| 48 | Changelog | ❌ Belum | Direkomendasikan mulai sekarang secara manual: `CHANGELOG.md` dengan entri v1→v2 dari §4 di bawah sebagai entri pertama. |

**Ringkasan cakupan (final, seluruh seri selesai):** dari 49 artefak Master Blueprint, **8 dibuat penuh di seri `docs/` ini** (03, 04, 05, 13, 17, 22, 23, 32) ditambah dokumen ke-9 (`00-RECONCILIATION.md`, di luar penomoran Blueprint) sebagai catatan keputusan scope, **~14 sudah tercakup memadai** oleh `SRS.md`/`AGENTS.md` yang sudah ada (tidak perlu file baru), **~10 sebagian/perlu keputusan tim**, **~16 belum ada** dan sebagian besar di antaranya (UX Spec, Backup/DR, Deployment, Handover) memang belum bisa dikerjakan secara jujur tanpa keputusan bisnis/infrastruktur nyata — mengarangnya akan melanggar prinsip "no silent guessing" di `AGENTS.md` §2.4 sendiri. Daftar lengkap dan detail Fase 2 ada di §7 di bawah.

## 4. Apa yang berubah antara v1 → v2 (diverifikasi dengan `diff`, bukan diasumsikan)

Dua snapshot awal (v1, v2) mencerminkan iterasi nyata dalam satu rentang waktu singkat — berikut ringkasannya, juga baris pertama yang layak masuk `CHANGELOG.md`:

**Ditambahkan di v2:**
- `src/middleware.ts` — gerbang route berbasis keberadaan cookie sesi
- `src/lib/session.ts` — `getCurrentUser()`, `requireAuth()`, `requirePermission()`
- `src/app/login/page.tsx` — halaman login
- `src/lib/validations/{asset,inventory,maintenance}.ts` — skema Zod
- `src/actions/{asset,inventory,maintenance}-actions.ts` — 8 Server Action (RBAC → Zod → service)
- `src/components/modals/{asset,assignment,inventory}-modal.tsx` + `src/components/ui/dialog.tsx` — UI form untuk 8 aksi di atas
- `prisma/seed.ts`: admin sekarang punya password ter-hash (`hashPassword` dari `better-auth/crypto`) — di v1 login **mustahil** karena tidak ada baris `Account` sama sekali
- `prisma/schema.prisma`: 4 relasi (`AssetAssignment`, `AssetTransfer`, `MaintenanceRecord` → `Asset`/`InventoryItem`) diubah dari `onDelete: Cascade` menjadi `onDelete: Restrict` — mencegah riwayat transaksi ikut terhapus jika Asset/Item dihapus
- `recordAudit()` ditambahkan ke `assignAsset`, `returnAsset`, `transferAsset`, `transactStock`, `createTicket` (di v1 kelima mutasi ini **tidak** menulis audit log sama sekali)

**Tidak berubah (masih identik byte-untuk-byte dengan v1):** `SRS.md`, `AGENTS.md`, `package.json`, seluruh 9 file `src/app/*/page.tsx` (dashboard, assets, inventory, assignments, maintenance, locations, reports, audit, users), `location-service.ts`, `user-service.ts`.

Baris terakhir itu penting: **semua komponen UI baru di v2 (modal + Server Action + Zod + RBAC) tidak pernah dipasang ke halaman manapun** di v2 — lihat riwayatnya di Temuan #1 di bawah (sudah selesai sejak v3).

## 4a. Apa yang berubah v2 → v3 → v4 (progres sangat cepat — 3 snapshot dalam satu hari)

**v2 → v3:**
- Keempat modal (`AssetModal`, `AssignmentModals`, `InventoryModals`, + `MaintenanceModal` baru) **dipasang ke halamannya masing-masing** — menutup Temuan #1 untuk alur *create*.
- `.github/workflows/ci.yml` ditambahkan (install → `prisma generate` → `pnpm run lint` → `pnpm test`, tanpa job `build`/E2E).
- `gpt-6-astra.md` dihapus (pembersihan yang tepat, bukan requirement proyek).
- `LEGAL_TRANSITIONS`/`isValidAssetTransition()` dan `calculateNewStock()` diekstrak jadi fungsi murni yang diekspor terpisah — perilaku identik, hanya lebih mudah di-unit-test (dua file test baru: `asset-lifecycle.test.ts`, `inventory-logic.test.ts`, sekarang menguji fungsi ini langsung, bukan lewat RBAC saja).
- ⚠️ `package.json`: skrip `"lint"` diarahkan ke `"tsc --noEmit"` — duplikat dari `"typecheck"`, artinya **ESLint tidak pernah benar-benar berjalan di CI**, walau job CI bernama "Lint, Test & Build".

**v3 → v4:**
- `UserService.createUser()` + `createUserAction` + `UserModal` — **menutup sebagian besar Temuan #4** untuk User (transaksi: buat `User` + `Account` berhash sekaligus, tercatat di `AuditLog`). Belum ada update/nonaktifkan/reset password.
- `LocationService.createLocation()` + `createLocationAction` + `LocationModal` — **menutup sebagian besar Temuan #4** untuk Location. Belum ada update/hapus, dan belum ada pemeriksaan siklus pohon lokasi (lihat `03-domain-model.md` Invariant I-8).
- `src/app/api/reports/export/route.ts` — Route Handler CSV **sungguhan** (bukan tombol dekoratif lagi), dilindungi `requirePermission(PERMISSIONS.REPORT_EXPORT)`, escaping CSV benar, BOM UTF-8 untuk kompatibilitas Excel. Menutup bagian ekspor dari Temuan sebelumnya.
- `MonitoringService` diperkaya: distribusi status aset (donut chart), tren mutasi stok 6 bulan — murni penyajian data, tidak mengubah temuan keamanan apa pun.
- ⚠️ **Temuan baru**: `prisma.config.ts` dan `prisma/seed.ts` sekarang punya *fallback* connection string dengan kredensial database di-hardcode (`mysql://bpti_user:bpti_secret_2026@localhost:3306/bpti_db`) langsung di source code — lihat Temuan #9 baru di bawah.
- **Tidak berubah sama sekali sejak v2:** tidak satu pun dari 9 halaman `src/app/*/page.tsx` memanggil `getCurrentUser`/`requireAuth`/`requirePermission` — **Temuan #2 (tidak ada otorisasi di halaman baca) masih 100% terbuka** setelah tiga iterasi perbaikan berturut-turut yang menutup temuan lain. Ini sekarang celah tersisa paling signifikan.

## 5. Register Temuan (Gap Audit) — status terkini di snapshot v4

Register ini diperbarui mengikuti setiap snapshot baru. Setiap temuan menyertakan bukti `file:baris`, dampak, ID SRS terkait, dan rekomendasi. Diurutkan dari yang paling menentukan fungsi sistem **hari ini** — urutan ini sudah berubah dari audit v2 karena beberapa temuan lama sudah selesai.

### ✅ #1 (RESOLVED sejak v3) — Komponen mutasi UI sempat dibangun tapi tidak terpasang
**Riwayat:** Di v2, `AssetModal`/`AssignmentModals`/`InventoryModals` sudah benar memanggil Server Action tapi tidak diimpor di halaman manapun (`grep` menghasilkan nol hasil). **Sejak v3, keempat modal (termasuk `MaintenanceModal` baru) sudah diimpor dan dirender dengan benar** di `assets/page.tsx`, `inventory/page.tsx`, `assignments/page.tsx`, `maintenance/page.tsx` — diverifikasi ulang di v4, masih terpasang.
**Sisa pekerjaan kecil:** `MaintenanceModal` hanya memanggil `createMaintenanceTicketAction` (buat tiket baru); belum ada UI untuk `updateMaintenanceStatusAction` (mengubah status tiket yang sudah ada REQUESTED→APPROVED→IN_PROGRESS→dst).

### 🔴 #2 — Tidak ada pemeriksaan otorisasi pada seluruh halaman baca (read)
**Bukti:** `grep -rn "requirePermission(\|requireAuth(\|getCurrentUser(" src/app` = 0 hasil. Kesembilan halaman (`dashboard`, `assets`, `inventory`, `assignments`, `maintenance`, `locations`, `reports`, `audit`, `users`) memanggil `*Service.getX()` langsung tanpa memeriksa peran/izin pengguna yang sedang login.
**Dampak — diverifikasi, bukan diasumsikan:** `middleware.ts:20-22` hanya memeriksa **keberadaan** cookie bernama `better-auth.session_token`, bukan validitas tanda tangannya. Cookie sesi Better Auth memang ditandatangani dan diverifikasi ulang di `auth.api.getSession()` — tapi fungsi itu **hanya dipanggil di 8 Server Action** (lewat `requirePermission()`), tidak pernah di halaman baca manapun. Konsekuensinya: begitu seseorang berhasil login dengan peran apa pun (termasuk `VIEWER`, yang menurut `SRS.md` §9.6 seharusnya hanya dapat "restricted read-only information"), ia melihat data yang **identik** dengan `SUPER_ADMIN` di `/users`, `/audit` (termasuk IP address setiap aktor), `/reports`, dan `/maintenance` — karena tidak ada baris kode yang membedakan.
**Terkait:** `NFR-SEC-003`, `NFR-SEC-006` (IDOR/BOLA), `BR-001`; `AGENTS.md` §39 "Every resource access must perform authorization against the authenticated actor."
**Rekomendasi:** Tambahkan pemanggilan `getCurrentUser()` + pemeriksaan permission yang sesuai (`hasPermission`) di setiap Server Component sebelum query, atau — lebih terpusat — pindahkan gerbang ini ke satu titik (mis. layout per-route-group) agar tidak diduplikasi 9 kali.

### 🟡 #3 — Dua mekanisme validasi transisi status Asset yang tidak saling terhubung
**Bukti:** `LEGAL_TRANSITIONS` (`asset-service.ts:7-16`) adalah tabel transisi formal, tapi hanya dikonsumsi oleh `updateStatus()` (baris 148-182) — method yang **tidak pernah dipanggil** dari action manapun (`updateAssetStatusSchema` di `validations/asset.ts:47-53` juga terekspor tapi tidak pernah diimpor oleh actions/). Sebaliknya, `assignAsset()`, `returnAsset()`, `MaintenanceService.createTicket()`, dan `MaintenanceService.updateStatus()` masing-masing menulis status secara langsung dengan pemeriksaan ad-hoc miliknya sendiri.
**Dampak:** Saat ini keempat jalur ad-hoc itu kebetulan konsisten dengan `LEGAL_TRANSITIONS`, **kecuali satu**: `MaintenanceService.createTicket()` (`maintenance-service.ts:38-60`) memaksa status Asset menjadi `IN_REPAIR` **tanpa memeriksa status asal sama sekali** — secara teknis memungkinkan tiket maintenance dibuka untuk aset berstatus `RETIRED`, `DISPOSED`, atau `LOST`, yang menurut `LEGAL_TRANSITIONS` seharusnya tidak bisa berpindah ke `IN_REPAIR`.
**Terkait:** `BR-005`, `FR-ASSET-STATE-001/002`.
**Rekomendasi:** Detail lengkap ada di `04-business-rules.md` (BR-015, BR-016) dan `05-state-machines.md`.

### 🟡 #4 (Sebagian RESOLVED sejak v4) — Manajemen User & Location kini punya jalur *create*; Role masih belum
**Riwayat:** Di v1–v3, `UserService`/`LocationService` hanya berisi method `get*`, tidak ada jalur mutasi sama sekali. **Sejak v4:** `UserService.createUser()` (`user-service.ts:75-130`, ditransaksikan dengan pembuatan `Account` berhash) dan `LocationService.createLocation()` (`location-service.ts:93-122`) sudah ada, masing-masing dipanggil lewat `createUserAction`/`createLocationAction` (RBAC `USER_MANAGE`/`LOCATION_MANAGE` → Zod → service → `recordAudit`) dan terpasang di `UserModal`/`LocationModal` pada halamannya.
**Yang masih tersisa:** Tidak ada `update`/`deactivate` User, tidak ada `update`/`delete` Location, dan **belum ada UI Role/RolePermission Management sama sekali** — satu-satunya cara mengubah peran atau menonaktifkan akun tetap mengedit `prisma/seed.ts`. Invariant I-8 di `03-domain-model.md` (proteksi siklus pohon lokasi) juga masih belum ditegakkan di `createLocation()`.
**Terkait:** `FR-USER-003/004`, `FR-ROLE-001/002` — belum terimplementasi; `FR-USER-002`/`FR-LOCATION-001` sudah `[VERIFIED-IN-CODE]` sejak v4.
**Rekomendasi:** Role Management sekarang jadi prioritas berikutnya yang paling jelas di kategori ini.

### 🟡 #5 — Tabel `RolePermission` di database tidak pernah terisi atau dipakai
**Bukti:** `session.ts:56-63` menggabungkan `user.role.permissions` (dari tabel `RolePermission`) dengan `ROLE_DEFAULT_PERMISSIONS` (peta hardcoded di `rbac.ts`). `prisma/seed.ts` membuat baris `Role` tapi **tidak pernah** membuat baris `RolePermission`. Tidak ada kode lain yang menulis ke tabel itu.
**Dampak:** Bukan bug — sistem tetap berfungsi karena peta hardcoded menjadi fallback yang selalu dipakai. Tapi ini berarti tabel `RolePermission` murni dekoratif saat ini: mengedit izin lewat database tidak akan berpengaruh apa-apa sampai ada kode yang menulis ke sana, dan `SRS.md` §19's premis "role management UI" mengasumsikan tabel ini hidup.
**Rekomendasi:** Putuskan salah satu secara sadar (lalu catat sebagai ADR): (a) hapus lapisan DB, jadikan RBAC 100% kode-sebagai-sumber-kebenaran (lebih sederhana, cocok untuk tim kecil), atau (b) bangun UI Role Management yang menulis ke `RolePermission` dan jadikan itu sumber kebenaran utama.

### 🟡 #6 (Sebagian RESOLVED sejak v3) — Baseline teknis yang dinyatakan di SRS/AGENTS belum sepenuhnya terpasang
**Bukti:** `react-hook-form`, `@testing-library/react`, `@playwright/test` **masih tidak ada** di `package.json` walau disebut baseline di `SRS.md` TAR-010/`AGENTS.md` §6 — formulir tetap memakai `useState` biasa. Tidak ada folder `prisma/migrations/` — skema masih didorong lewat `prisma db push`. **Sejak v3**, `.github/workflows/ci.yml` sudah ada (install → `prisma generate` → lint → test) — tapi skrip `"lint"` di `package.json` diarahkan ke `tsc --noEmit`, sama persis dengan `"typecheck"`, sehingga **ESLint tidak pernah benar-benar dijalankan** meski job CI-nya bernama "Lint, Test & Build". Tidak ada job `build` di CI walau namanya menjanjikan itu.
**Dampak:** Rendah-menengah untuk tahap sekarang; CI yang "hijau" saat ini memberi rasa aman yang sedikit palsu karena tidak benar-benar melakukan lint maupun build check.
**Terkait:** `NFR-TEST-004`, `TAR-010`.
**Rekomendasi (cepat, 1 baris):** ganti `"lint": "tsc --noEmit"` menjadi `"lint": "next lint"` (nilai aslinya di v1/v2) di `package.json`, dan tambahkan langkah `pnpm run build` di `ci.yml`.

### 🟢 #7 — Kredensial admin default ditampilkan sebagai teks biasa di halaman login
**Bukti:** `login/page.tsx:123-133` menampilkan `admin@bpti.go.id` / `AdminBpti2026!` langsung di UI sebagai "Kredensial Default (Seeded Administrator)".
**Dampak:** Nyaman untuk demo/pengembangan, tapi harus dihapus atau disembunyikan di balik flag `NODE_ENV !== "production"` sebelum deployment nyata mana pun — kredensial ini identik dengan yang ditulis `prisma/seed.ts:81` dan `docker-compose.yml`.

### 🔴 #9 (BARU sejak v4) — Kredensial database di-hardcode sebagai fallback di source code
**Bukti:** `prisma.config.ts:6-8` dan `prisma/seed.ts:6-10` sama-sama menulis `process.env.DATABASE_URL || "mysql://bpti_user:bpti_secret_2026@localhost:3306/bpti_db"` — kalau `DATABASE_URL` tidak diset, aplikasi diam-diam jatuh ke kredensial ini, yang berarti kredensial itu **tersimpan permanen di riwayat git** begitu file ini di-commit.
**Dampak:** Untuk database lokal murni, risikonya rendah. Tapi ini pola berbahaya: siapa pun yang meng-clone repo (termasuk kalau repo ini nanti jadi publik untuk portofolio) langsung punya username/password database yang valid untuk *default*-nya, dan pola *fallback*-nya membuat mudah lupa mengganti kredensial ini saat pindah ke staging/produksi karena aplikasi tidak pernah "gagal keras" saat env var lupa diset.
**Terkait:** `SRS.md` §32 (`AUTH_SECRET`, dll. seharusnya tidak pernah punya default hardcoded); `AGENTS.md` §38 (secrets hygiene).
**Rekomendasi:** Hapus fallback string-nya, biarkan aplikasi gagal secara eksplisit (`throw`) kalau `DATABASE_URL` tidak diset — jauh lebih aman daripada diam-diam terhubung ke kredensial yang salah/lama.

### 🟢 #10 — Praktik yang sudah benar (agar audit ini tidak timpang sebelah)
Supaya register ini tidak hanya berisi hal negatif — dan supaya progres nyata dari v1→v4 tercatat:
- **Tim menutup 4 temuan besar dalam satu hari** (modal terpasang, CI ditambahkan, User+Location management, export CSV sungguhan) — kecepatan iterasi yang baik, dan setiap perbaikan mengikuti pola aman yang sama, bukan tambal-sulam berbeda-beda tiap kali.
- **Tidak ada satu pun `.delete()`/`.deleteMany()`** di seluruh `src/` — sejalan dengan `BR-004` (preservasi riwayat) dan filosofi audit trail immutable.
- **Password (admin maupun user baru)** konsisten di-hash dengan `better-auth/crypto`, bukan plaintext.
- **Seluruh Server Action** (kini 10: 8 sejak v2 + `createUserAction` + `createLocationAction`) secara konsisten mengikuti urutan `requirePermission → Zod.parse → Service call → recordAudit → revalidatePath`.
- **Relasi FK diperketat ke `Restrict`** untuk riwayat transaksi — mencegah kehilangan data audit akibat penghapusan.
- **Nol import lintas-modul** antar `*-service.ts` — batas modul dijaga dengan disiplin, bertahan sampai v4 (diverifikasi ulang lewat `grep`).
- **`AGENTS.md` dan `SRS.md`** sendiri berkualitas jauh di atas rata-rata proyek vibe-coding.

## 6. Soal "PRD" — pengamatan jujur

Dokumen pendukung yang diminta mencakup **PRD dan SRS**. Repo ini tidak memiliki file `PRD.md` terpisah. `SRS.md` §3–§9 (Executive System Definition, Problem Statement, Objectives, Scope, Stakeholders, Personas) secara substansi **melakukan sebagian pekerjaan PRD** tapi bercampur dengan bahasa requirement teknis. Ada dua opsi yang jujur, dan bagian ini sengaja tidak diam-diam memilihkan salah satu:
- **(a)** Ekstrak §3–§9 menjadi `PRD.md` tersendiri secara redaksional (tanpa informasi baru) — pekerjaan mekanis, bisa dikerjakan kapan pun diperlukan.
- **(b)** Putuskan secara sadar bahwa `SRS.md` **adalah** dokumen gabungan PRD+SRS proyek ini (umum untuk tim kecil), lalu ganti judul dokumennya menjadi "PRD & SRS" agar tidak ada pembaca lain yang mencari `PRD.md` yang tidak pernah ada.

Yang **tidak** dilakukan di sini: menulis PRD baru dari nol berisi visi produk/success metric/business objective yang sebenarnya — `SRS.md` §39 sendiri mendaftar 34 pertanyaan bisnis yang belum terjawab (siapa stakeholder sebenarnya, target volume pengguna, dsb.). Mengarang jawabannya akan melanggar prinsip evidence discipline yang dipegang proyek ini sendiri (`AGENTS.md` §2.4–2.5).

## 7. Rencana Fase 2 (butuh keputusan/input tim — bukan sesuatu yang bisa ditebak dari kode)

| Dokumen | Kenapa ditunda | Yang dibutuhkan dari tim |
|---|---|---|
| PRD.md | Lihat §6 | Pilih opsi (a) atau (b) |
| UX Spec + User Flows per-halaman | Perlu keputusan desain nyata, bukan reverse-engineer dari UI yang ada | Wireframe/preferensi, atau disusun dari pola UI yang sudah ada |
| ADR-001..00N | Perlu 2+ keputusan arsitektur disahkan | Konfirmasi: struktur modul flat dipertahankan? `RolePermission` dipakai atau dibuang? |
| Performance Budget | `SRS.md` sendiri menandai `[TBD]` — butuh target beban nyata | Estimasi jumlah user/aset/lokasi yang diharapkan |
| Backup/DR, Deployment, Runbook, Incident Response | Semua bergantung pada hosting production yang belum dipilih (`SRS.md` §33 `[TBD]`) | Target hosting (GCP/AWS/on-prem BPTI?) |
| Handover, User Guide, Admin Guide | Prematur — fitur inti (Temuan #1) belum bisa dipakai end-to-end | Selesaikan Temuan #1–#2 dulu |
| Privacy.md | Prioritas rendah untuk data seed, wajib sebelum data pegawai riil | Konfirmasi kapan data riil akan dimasukkan |

## 8. Daftar isi `docs/`

| File | Isi |
|---|---|
| `README.md` | Dokumen ini |
| `03-domain-model.md` | Entitas, agregat, hubungan, invariant |
| `04-business-rules.md` | Katalog BR-011 dst., memperluas `SRS.md` BR-001..010 |
| `05-state-machines.md` | Diagram & tabel transisi Asset/Assignment/Maintenance |
| `13-module-boundaries.md` | Arsitektur as-built, kepemilikan modul, aturan dependency |
| `17-data-dictionary.md` | Field-by-field seluruh 19 model Prisma |
| `22-authorization-matrix.md` | Matriks peran×izin nyata + izin yang tak terpakai |
| `23-threat-model.md` | Trust boundary, entry point, ancaman, mitigasi |
| `32-traceability-matrix.md` | Pemutakhiran tabel kosong `SRS.md` §37 |
