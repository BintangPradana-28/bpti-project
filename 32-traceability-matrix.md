# 32-traceability-matrix.md — Requirement Traceability Matrix
# BPTI Inventory & Asset Management System

**Snapshot diaudit:** v4 (`bpti-project-main__1_.zip`, 2026-09-24) — lihat `README.md` §1
**Memutakhirkan:** `SRS.md` §37, yang eksplisit hanya berisi 6 baris contoh berstatus `TBD` dan diminta "*update this matrix as implementation proceeds*".
**Legenda status:** lihat `README.md` §2.

---

## Cara membaca

Kolom **Status** memakai lima nilai (lebih presisi dari `TBD`/bukan-`TBD` biner):
- ✅ **Implemented & Reachable** — logika ada di service/action **dan** ada jalur UI/route nyata yang memicunya.
- ⚙️ **Implemented, Not UI-Reachable** — logika ada (biasanya di service layer, kadang bahkan actionnya juga ada), tapi tidak ada tombol/form yang memicunya dari browser.
- ❌ **Not Implemented** — tidak ada kode sama sekali untuk requirement ini, padahal statusnya baseline `[PROPOSED]`/`[CONFIRMED]` di SRS (seharusnya ada).
- ➖ **N/A (belum in-scope)** — requirement di SRS sendiri berstatus `[TBD]`/`[OPTIONAL]`/`[FUTURE]`, jadi wajar belum ada kode.
- 🔍 **Partial** — sebagian sub-requirement terpenuhi, sebagian tidak (dijelaskan di kolom Catatan).

## Ringkasan (baseline, di luar kategori `[OPTIONAL]`/`[FUTURE]`)

| Status | Jumlah |
|---|---|
| ✅ Implemented & Reachable | 33 |
| ⚙️ Implemented, Not UI-Reachable | 9 |
| ❌ Not Implemented | 11 |
| 🔍 Partial | 4 |
| ➖ N/A (di luar scope baseline: `FR-IMPORT-*`, `FR-QR-*`, `FR-ATTACH`, `FR-NOTIFY`, + beberapa `[TBD]`) | 15 |

**Observasi utama:** mayoritas ❌/⚙️ terkonsentrasi di dua tempat yang sudah dibahas mendalam di dokumen lain — jalur baca tanpa otorisasi (`23-threat-model.md` T1) dan modul yang belum punya UI mutasi sama sekali (Role Management, sebagian besar Category Management).

---

## FR-AUTH — Authentication

| Req ID | Requirement | User Story | Implementation | Status | Catatan |
|---|---|---|---|:-:|---|
| FR-AUTH-001 | User Login | US-AUTH-001 | `app/login/page.tsx`, `lib/auth.ts` (Better Auth) | ✅ | |
| FR-AUTH-002 | Logout | US-AUTH-001 | `header.tsx` (tombol logout via `authClient`) | ✅ | |
| FR-AUTH-003 | Session Security | US-AUTH-001 | Better Auth (cookie signed, `httpOnly`) | ✅ | Terverifikasi `[VERIFIED]` — lihat `23-threat-model.md` §3 |
| FR-AUTH-004 | Password Recovery | — | — | ➖ | `[TBD]` di SRS |
| FR-AUTH-005 | Account Verification | — | — | ➖ | `[TBD]` di SRS |

## FR-ACCESS — Authorization

| Req ID | Requirement | Implementation | Status | Catatan |
|---|---|---|:-:|---|
| FR-ACCESS-001 | RBAC ditegakkan server-side | `lib/rbac.ts`, `lib/session.ts` | 🔍 | Ditegakkan penuh untuk 10 mutasi; **tidak** ditegakkan untuk 9 halaman baca — lihat `22-authorization-matrix.md` |
| FR-ACCESS-002 | Permission check sebelum mutasi | `requirePermission()` di seluruh `actions/*.ts` | ✅ | 10/10 action |
| FR-ACCESS-003 | Response forbidden yang layak | `actions/*.ts` (return `{success:false, error}`) | ✅ | |
| FR-ACCESS-004 | Tidak ada akses berbasis tebak-ID (IDOR) | — | ❌ | Bertentangan langsung dengan `23-threat-model.md` T1 — halaman baca tidak memeriksa kepemilikan/peran sama sekali |

## FR-USER — User Management

| Req ID | Requirement | Implementation | Status | Catatan |
|---|---|---|:-:|---|
| FR-USER-001 | Lihat users | `users/page.tsx` → `UserService.getUsers()` | ✅ | Tanpa pembatasan peran (lihat FR-ACCESS-004) |
| FR-USER-002 | Buat users | `user-actions.ts` → `UserService.createUser()` → `UserModal` | ✅ | Baru sejak v4 |
| FR-USER-003 | Update users | — | ❌ | Tidak ada |
| FR-USER-004 | Nonaktifkan users | — | ❌ | `User.isActive` ada di schema, tidak ada UI/action |
| FR-USER-005 | User terkait Department | `User.departmentId` (schema), dipakai di `createUser()` | ✅ | |

## FR-ROLE — Role and Permission Management

| Req ID | Requirement | Implementation | Status | Catatan |
|---|---|---|:-:|---|
| FR-ROLE-001 | Kelola roles | — | ❌ | Role hanya via `seed.ts` |
| FR-ROLE-002 | Assign permissions | — | ❌ | `RolePermission` tabel tidak pernah diisi — `22-authorization-matrix.md` |
| FR-ROLE-003 | Perubahan permission auditable | — | ➖ | Tidak relevan selama FR-ROLE-002 belum ada |

## FR-ORG — Department Management

| Req ID | Requirement | Implementation | Status | Catatan |
|---|---|---|:-:|---|
| FR-ORG-001 | Dukungan Department | `Department` model, dipakai `User`/`Location`/`Asset` | ✅ | Hanya via seed — belum ada UI kelola Department sendiri |
| FR-ORG-002 | Relasi Department konsisten | FK di schema | ✅ | Dijamin skema (FK), bukan validasi aplikasi |

## FR-CATEGORY — Category Management

| Req ID | Requirement | Implementation | Status | Catatan |
|---|---|---|:-:|---|
| FR-CATEGORY-001 | Buat category | — | ❌ | Hanya via seed, tidak ada action |
| FR-CATEGORY-002 | Update category | — | ❌ | |
| FR-CATEGORY-003 | Hapus preservasi histori | — | ➖ | Tidak relevan selama create/update belum ada |

## FR-ITEM — Inventory Item Management

| Req ID | Requirement | Implementation | Status | Catatan |
|---|---|---|:-:|---|
| FR-ITEM-001 | Item master data | `InventoryService.createItem()`, `InventoryModal` | ✅ | Field persis sesuai kandidat SRS — lihat `17-data-dictionary.md` §3 |
| FR-ITEM-002 | Item search | `getItems({search})` | ✅ | |
| FR-ITEM-003 | Item filtering | `getItems({categoryId, status})` + `table-filter-bar.tsx` (baru v4) | ✅ | |
| FR-ITEM-004 | Item detail | `InventoryService.getItemById()` | ⚙️ | Method ada; perlu verifikasi apakah ada halaman detail per-item atau hanya expand di tabel — belum dikonfirmasi ada route `/inventory/[id]` |

## FR-STOCK — Stock Management

| Req ID | Requirement | Implementation | Status | Catatan |
|---|---|---|:-:|---|
| FR-STOCK-001 | Tampilkan kuantitas | `Stock.quantity` ditampilkan di `inventory/page.tsx` | ✅ | |
| FR-STOCK-002 | Preservasi histori movement | `StockMovement` ledger | ✅ | |
| FR-STOCK-003 | Stock In | `transactStock(type: IN)` + `InventoryModal` | ✅ | |
| FR-STOCK-004 | Stock Out | `transactStock(type: OUT)` + `InventoryModal` | ✅ | |
| FR-STOCK-005 | Return | `transactStock(type: RETURN)` di service/action | ⚙️ | **Tidak diekspos** di `InventoryModal` (hanya `IN`/`OUT` yang punya tombol — diverifikasi lewat pembacaan langsung `inventory-modal.tsx`) |
| FR-STOCK-006 | Adjustment | `transactStock(type: ADJUSTMENT)` di service/action | ⚙️ | Sama seperti Return — logika ada (`04-business-rules.md` BR-012), UI tidak |
| FR-STOCK-007 | Proteksi stok negatif | `calculateNewStock()` (`inventory-service.ts:25-58`) | ✅ | `04-business-rules.md` BR-011 |
| FR-STOCK-008 | Atomisitas | `prisma.$transaction` di `transactStock()` | ✅ | |

## FR-MOVE — Stock Movement

| Req ID | Requirement | Implementation | Status |
|---|---|---|:-:|
| FR-MOVE-001 | Setiap transaksi buat movement record | `transactStock()` baris 204-217 | ✅ |
| FR-MOVE-002 | Field movement lengkap | `StockMovement` model — 9 dari 10 field kandidat SRS ada (`referenceNumber` ada tapi selalu `null` dalam praktik) | 🔍 |

## FR-ASSET — Asset Management

| Req ID | Requirement | Implementation | Status | Catatan |
|---|---|---|:-:|---|
| FR-ASSET-001 | Asset individual tracked | `AssetService.createAsset()`, `AssetModal` | ✅ | Seluruh 12 field kandidat SRS ada di schema |
| FR-ASSET-002 | ID unik | `assetTag @unique` | ✅ | |
| FR-ASSET-003 | Kebijakan unik serial number | `serialNumber @unique` (opsional, unik kalau diisi) | ✅ | |
| FR-ASSET-004 | Lifecycle history | `getAssetById()` menyertakan `assignments`/`transfers`/`maintenances` | ✅ | |
| FR-ASSET-005 | Cegah mutasi tak berwenang | `requirePermission(ASSET_CREATE\|UPDATE\|...)` | 🔍 | Berlaku untuk create/assign/transfer; `asset.update`/`asset.retire` tidak pernah dipakai — lihat FR-ASSET-STATE-001 |

## FR-ASSET-STATE — Asset Lifecycle

| Req ID | Requirement | Implementation | Status | Catatan |
|---|---|---|:-:|---|
| FR-ASSET-STATE-001 | Server tegakkan transisi legal | `LEGAL_TRANSITIONS`, `updateStatus()` | ⚙️ | Logikanya benar tapi **method-nya tidak pernah dipanggil** — `04-business-rules.md` BR-016 |
| FR-ASSET-STATE-002 | Klien tak bisa set state bebas | — | 🔍 | Benar untuk `assignAsset`/`returnAsset` (status ditentukan logika server); **tidak** benar untuk `MaintenanceService.createTicket()` (memaksa `IN_REPAIR` tanpa validasi status asal) |

## FR-ASSIGN — Asset Assignment

| Req ID | Requirement | Implementation | Status |
|---|---|---|:-:|
| FR-ASSIGN-001 | Assign asset | `assignAsset()` + `AssignmentModals` | ✅ |
| FR-ASSIGN-002 | Preservasi histori assignment | `AssetAssignment` model, 9/9 field kandidat ada (kecuali `returnAt` bernama `returnedAt`, `approval reference` tidak ada — sesuai, karena approval workflow di luar scope PKL) | 🔍 |
| FR-ASSIGN-003 | Cegah assignment kontradiktif | `assignAsset()` baris 223-227 (hanya dari `AVAILABLE`) | ✅ |

## FR-TRANSFER — Asset Transfer

| Req ID | Requirement | Implementation | Status | Catatan |
|---|---|---|:-:|---|
| FR-TRANSFER-001 | Transfer asset | `transferAsset()` + `AssignmentModals` | ✅ | |
| FR-TRANSFER-002 | Preservasi info lama/baru | `AssetTransfer.fromLocationId/toLocationId/fromHolderId/toHolderId` | ✅ | |
| FR-TRANSFER-003 | Auditable | `recordAudit()` di `transferAsset()` | ✅ | |
| FR-TRANSFER-004 | Transaksional | `prisma.$transaction` | ✅ | |

## FR-LOCATION — Location Management

| Req ID | Requirement | Implementation | Status | Catatan |
|---|---|---|:-:|---|
| FR-LOCATION-001 | Dukungan lokasi hierarkis | `Location` self-relation, `createLocation()` + `LocationModal` | ✅ | Baru sejak v4; hierarki 4-level sesuai proposal SRS |
| FR-LOCATION-002 | Asset terhubung ke lokasi | `Asset.locationId` | ✅ | |
| FR-LOCATION-003 | Perubahan lokasi traceable | `AssetTransfer` | ✅ | |

## FR-MAINT — Maintenance

| Req ID | Requirement | Implementation | Status | Catatan |
|---|---|---|:-:|---|
| FR-MAINT-001 | Buat maintenance record | `createTicket()` + `MaintenanceModal` | ✅ | |
| FR-MAINT-002 | Referensi ke asset | `MaintenanceRecord.assetId` | ✅ | |
| FR-MAINT-003 | Rekam status | `MaintenanceStatus` (6 nilai, persis sesuai kandidat SRS) | 🔍 | Field ada & ✅ *reachable* untuk `REQUESTED` (create); status lanjutan (`APPROVED` dst.) ⚙️ ada actionnya (`updateMaintenanceStatusAction`) tapi **tidak ada UI** yang memanggilnya — `05-state-machines.md` §3 |
| FR-MAINT-004 | Preservasi histori | `MaintenanceRecord` tidak pernah dihapus | ✅ | |
| FR-MAINT-005 | Cost & technician | `MaintenanceRecord.cost`, `.technician` | 🔍 | Field ada di schema; `technician` bisa diisi lewat `MaintenanceModal`, `cost` **tidak** ada input UI-nya |

## FR-MONITOR — Monitoring

| Req ID | Requirement | Implementation | Status |
|---|---|---|:-:|
| FR-MONITOR-001 | Dashboard monitoring | `dashboard/page.tsx` + `MonitoringService` | ✅ |
| FR-MONITOR-002 | KPI inventaris relevan | 11/11 KPI kandidat SRS ada (total/available/assigned/damaged/lost/retired/low-stock/out-of-stock/maintenance-due — via `MaintenanceStatus` count) | ✅ |
| FR-MONITOR-003 | Identifikasi kondisi perlu perhatian | Panel "System Alerts" (`SystemAlert`, `04-business-rules.md` BR-013) | ✅ |
| FR-MONITOR-004 | Indikator tertaut ke record actionable | — | ❌ | Alert ditampilkan sebagai teks statis, tidak ada tautan ke item/asset terkait |
| FR-MONITOR-005 | Angka dari state DB otoritatif | Query langsung Prisma | ✅ |
| FR-MONITOR-006 | Tidak ada data sintetis/palsu | — | ✅ | Tidak ditemukan hardcoded/mock data di path produksi |
| FR-MONITOR-007 | Real-time | Server-side query per page-load (bukan push/websocket) | ✅ | Sesuai `[ASSUMPTION]` baseline SRS sendiri |

## FR-AUDIT — Audit Trail

| Req ID | Requirement | Implementation | Status | Catatan |
|---|---|---|:-:|---|
| FR-AUDIT-001 | Audit trail untuk mutasi kritis | `recordAudit()` di 10/10 action | ✅ | Tapi **tidak** untuk event login/logout — `04-business-rules.md` BR-020 |
| FR-AUDIT-002 | Identifikasi aktor | `AuditLog.actorId` | ✅ | |
| FR-AUDIT-003 | Identifikasi resource terdampak | `AuditLog.entity/entityId` | ✅ | |
| FR-AUDIT-004 | Before/after state | `AuditLog.beforeState/afterState` (Json) | ✅ | Konsisten di seluruh 10 action |
| FR-AUDIT-005 | User biasa tak bisa ubah/hapus histori | Tidak ada `.update()`/`.delete()` pada `AuditLog` di kode aplikasi | ✅ | Integritas berbasis konvensi, bukan constraint DB — `23-threat-model.md` T7 |

## FR-REPORT — Reporting

| Req ID | Requirement | Implementation | Status | Catatan |
|---|---|---|:-:|---|
| FR-REPORT-001 | Laporan inventaris | `api/reports/export?type=inventory` | ✅ | |
| FR-REPORT-002 | Laporan asset | `api/reports/export?type=assets` | ✅ | |
| FR-REPORT-003 | Laporan movement | `api/reports/export?type=movements` | ✅ | |
| FR-REPORT-004 | Laporan maintenance | `api/reports/export?type=maintenance` | ✅ | |
| FR-REPORT-005 | Laporan audit | `api/reports/export?type=audit` | ✅ | |
| FR-REPORT-006 | Format ekspor | CSV dengan BOM UTF-8 | ✅ | XLSX/PDF belum ada — sesuai rekomendasi baseline SRS ("CSV/XLSX first") |

## FR-SEARCH — Search and Filtering

| Req ID | Requirement | Implementation | Status |
|---|---|---|:-:|
| FR-SEARCH-001 | Search record inventaris/aset | `getAssets({search})`, `getItems({search})`, dll. | ✅ |
| FR-SEARCH-002 | Filtering | `table-filter-bar.tsx` (baru v4) + parameter `status`/`categoryId`/`locationId`/dll. di tiap `getX()` | ✅ |

## FR-IMPORT, FR-QR, FR-ATTACH, FR-NOTIFY — `[OPTIONAL]`

| Req ID grup | Status |
|---|:-:|
| FR-IMPORT-001..004 | ➖ Tidak diimplementasikan, sesuai statusnya yang `[OPTIONAL]` |
| FR-QR-001..003 | ➖ `Asset.qrCode` ada di schema tapi tidak pernah diisi — konsisten dengan belum diimplementasikan |
| FR-ATTACH | ➖ Tidak diimplementasikan |
| FR-NOTIFY | ➖ Tidak diimplementasikan |

---

## Business Rules (BR-001..010 dari `SRS.md`, ditelusuri ke implementasi)

| BR | Judul (SRS) | Status | Bukti |
|---|---|:-:|---|
| BR-001 | Authorization | ✅ | `04-business-rules.md` BR-020 |
| BR-002 | Data Integrity | ✅ | FR-STOCK-007 |
| BR-003 | Stock Integrity | ✅ | FR-STOCK-007/008 |
| BR-004 | History Preservation | ✅ | FR-AUDIT-005, `04-business-rules.md` BR-021 |
| BR-005 | State Transition | 🔍 | `04-business-rules.md` BR-016 (didefinisikan lengkap, ditegakkan tidak konsisten) |
| BR-006 | Auditability | ✅ | FR-AUDIT-001..004 |
| BR-007 | Untrusted Client | ✅ | Validasi Zod di seluruh action |
| BR-008 | Server Authority | ✅ | Semua state-changing logic di server (Server Actions/service layer) |
| BR-009 | Concurrency | ✅ | `prisma.$transaction` di setiap mutasi majemuk |
| BR-010 | No Fake Data | ✅ | Sejalan FR-MONITOR-006 |

## Technical Architecture Requirements (TAR-001..012)

| TAR | Status | Catatan |
|---|:-:|---|
| TAR-001..009 | ✅ | Next.js App Router, Prisma, MySQL, Better Auth, Zod, Tailwind — seluruhnya sesuai `package.json` |
| TAR-010 (Testing stack) | 🔍 | Vitest ✅ terpasang & dipakai (3 file test); React Testing Library ❌ dan Playwright ❌ **tidak terpasang** meski disebut baseline — `README.md` Temuan #6 |
| TAR-011, 012 | ✅ | Pino logger, GitHub Actions CI (sejak v3) |

---

## Kesenjangan pengujian (melengkapi `SRS.md` §34–§35)

`SRS.md` §35 mendaftar skenario E2E-001 s.d. E2E-009 (Playwright). **Tidak satu pun ada implementasinya** — `@playwright/test` tidak terpasang (TAR-010). Tiga file test yang benar-benar ada (`asset-lifecycle.test.ts`, `inventory-logic.test.ts`, `rbac.test.ts`) menguji fungsi murni (`isValidAssetTransition`, `calculateNewStock`, lookup RBAC) — bukan E2E, bukan pengujian integrasi Prisma/database sungguhan. Ini berarti **tidak ada satu pun test otomatis yang memverifikasi jalur lengkap `browser → Server Action → database`** untuk requirement manapun di tabel-tabel di atas — seluruh status ✅/⚙️/❌ di dokumen ini berasal dari pembacaan kode langsung, bukan dari hasil test yang lulus.
