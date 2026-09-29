# 17-data-dictionary.md — Data Dictionary
# BPTI Inventory & Asset Management System

**Snapshot diaudit:** v4 (`bpti-project-main__1_.zip`, 2026-09-24) — lihat `README.md` §1
**Sumber:** `prisma/schema.prisma` (472 baris) — **belum berubah sama sekali sejak v1**, jadi dokumen ini adalah yang paling stabil di seluruh `docs/`.
**Legenda status:** lihat `README.md` §2. Seluruh isi dokumen ini `[VERIFIED-IN-CODE]` — ditranskripsi langsung dari schema, bukan diringkas.

---

## Cara membaca

- **PK** = primary key, **FK** = foreign key, **UK** = unique constraint (selain PK).
- **onDelete** hanya dicantumkan untuk FK yang menyimpang dari default Prisma (`Restrict` implisit untuk relasi wajib) — `Cascade`/`SetNull` eksplisit selalu ditulis karena itu keputusan desain yang disengaja.
- Kolom "Terpakai?" mencatat apakah field benar-benar dibaca/ditulis oleh kode aplikasi (`src/`, di luar `prisma/seed.ts`) pada snapshot v4 — silang (❌) menandai *dead field*.

## 1. Authentication & Access Control

### `User`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | String (cuid) | PK | |
| `name` | String | wajib | |
| `email` | String | **UK**, indexed | |
| `emailVerified` | Boolean | default `false` | Di-set `true` otomatis oleh `UserService.createUser()` — tidak ada alur verifikasi email sungguhan. |
| `image` | String? | opsional | ❌ tidak ada UI upload foto profil. |
| `roleId` | String? | FK → `Role`, indexed | Opsional secara skema, tapi tidak ada alur membuat User tanpa role di kode aplikasi. |
| `departmentId` | String? | FK → `Department`, indexed | |
| `isActive` | Boolean | default `true` | Field ada, **tidak pernah diperiksa** di `requirePermission()`/`getCurrentUser()` — user nonaktif secara teknis tetap bisa login selama sesinya valid (lihat `23-threat-model.md`). |
| `createdAt`/`updatedAt` | DateTime | auto | |
| Relasi | — | — | `sessions`, `accounts`, `assignedAssets` (holder saat ini), `assignmentsMade`/`assignmentsHeld`, `stockMovements` (actor), `transfersMade`/`transfersFrom`/`transfersTo`, `maintenanceRequests`, `auditLogs` |

### `Session` / `Account` / `Verification` — dikelola Better Auth
| Model | Field kunci | Catatan |
|---|---|---|
| `Session` | `token` (**UK**), `expiresAt`, `ipAddress?`, `userAgent?` | `onDelete: Cascade` dari `User` — sesi ikut terhapus jika User dihapus (User sendiri tidak pernah dihapus di kode aplikasi). |
| `Account` | `providerId`, `password?` (hash) | `password` diisi lewat `hashPassword()` dari `better-auth/crypto` di `UserService.createUser()`. |
| `Verification` | `identifier`, `value`, `expiresAt` | ❌ Tidak ada kode aplikasi yang menulis ke tabel ini secara eksplisit — murni infrastruktur internal Better Auth, disiapkan untuk alur reset-password/verifikasi email yang belum diaktifkan. |

### `Role`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `id` | String | PK | |
| `name` | String | **UK** | Komentar schema mendaftar 6 nilai yang dipakai: `SUPER_ADMIN, INVENTORY_ADMIN, IT_STAFF, MANAGER, AUDITOR, VIEWER` — **bukan enum database**, jadi tidak ada constraint yang mencegah nama role lain dibuat. Kecocokan dengan `ROLE_DEFAULT_PERMISSIONS` di `rbac.ts` murni konvensi penamaan, bukan dipaksakan skema. |
| `description` | String? | | |
| Relasi | — | `users`, `permissions` (via `RolePermission`) | |

### `Permission` / `RolePermission`
| Field | Tipe | Keterangan |
|---|---|---|
| `Permission.name` | String, **UK** | Format `domain.action` (mis. `asset.assign`) — **tidak ada baris `Permission` yang pernah dibuat oleh kode manapun** (tidak di seed, tidak di aplikasi); tabel ini kosong pada database yang baru di-seed. |
| `RolePermission` | `@@unique([roleId, permissionId])` | **Tidak pernah diisi** oleh `seed.ts` maupun kode aplikasi manapun — lihat `README.md` Temuan #5. Izin efektif sepenuhnya berasal dari `ROLE_DEFAULT_PERMISSIONS` hardcoded di `rbac.ts`, bukan dari tabel ini. |

### `Department`
| Field | Tipe | Constraint |
|---|---|---|
| `code` | String | **UK** |
| `name` | String | wajib |
| `description` | String? | |
| Relasi | — | `users`, `locations`, `assets` |

## 2. Locations (pohon hierarkis)

**Enum `LocationType`:** `ORGANIZATION`, `BUILDING`, `FLOOR`, `ROOM` (default `ROOM`).

### `Location`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `code` | String | **UK** | |
| `name` | String | wajib | |
| `type` | LocationType | default `ROOM` | |
| `parentId` | String? | FK self-relation, `onDelete: SetNull` | Lihat `03-domain-model.md` Invariant I-7/I-8 (tidak ada proteksi siklus). |
| `departmentId` | String? | FK → `Department` | |
| Relasi | — | `stocks`, `assets`, `assignments`, `movements`, `transfersFrom`/`transfersTo` (masing-masing relasi bernama eksplisit) | |

## 3. Inventory Item & Stock Ledger

### `Category`
| Field | Tipe | Constraint |
|---|---|---|
| `code` | String | **UK** |
| `name` | String | wajib |

### `InventoryItem`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `code` | String | **UK**, indexed | |
| `name` | String | wajib | |
| `description` | String? `@db.Text` | | |
| `categoryId` | String | FK → `Category`, indexed, wajib | |
| `unit` | String | default `"pcs"` | Teks bebas (`pcs`, `box`, `roll`, `meter`, dst.) — bukan enum. |
| `minStock` / `maxStock` | Int | default `5` / `1000` | Dipakai `MonitoringService` untuk deteksi *low stock*. |
| `isActive` | Boolean | default `true` | ❌ Tidak ada UI untuk menonaktifkan item (soft-delete via field ini belum ada jalurnya). |

### `Stock`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `itemId` | String | FK → `InventoryItem`, `onDelete: Cascade` | Menghapus `InventoryItem` **akan** menghapus baris `Stock`-nya (berbeda dari `StockMovement` yang `Restrict`) — tapi karena tidak ada kode yang menghapus `InventoryItem`, ini teori belum praktik. |
| `locationId` | String | FK → `Location`, `onDelete: Cascade` | |
| `quantity` | Int | default `0` | *Derived state* dari ledger `StockMovement` — lihat `03-domain-model.md` Invariant I-2. |
| `reservedQty` | Int | default `0` | ❌ **Dead field** — tidak pernah dibaca/ditulis kode manapun. |
| `@@unique([itemId, locationId])` | | | Satu baris stok per kombinasi item+lokasi. |

**Enum `MovementType`:** `IN`, `OUT`, `RETURN`, `ADJUSTMENT`, `TRANSFER`.

### `StockMovement` (ledger, append-only)
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `itemId` | String | FK → `InventoryItem`, **`onDelete: Restrict`** | |
| `locationId` | String | FK → `Location`, `onDelete: Cascade` | |
| `type` | MovementType | wajib | |
| `quantity` | Int | wajib | Selalu nilai positif (arah ditentukan `type`, bukan tanda field ini) — diverifikasi dari `calculateNewStock()` di `04-business-rules.md`. |
| `previousQty` / `resultingQty` | Int | wajib | Snapshot saldo sebelum/sesudah — memungkinkan rekonsiliasi ledger tanpa replay penuh. |
| `referenceNumber` | String? | opsional | ❌ Tidak pernah diisi kode aplikasi (selalu `null` dalam praktik saat ini). |
| `reason` | String? `@db.Text` | opsional | Dipakai untuk field `reason`/`notes` dari input `transactStock`. |
| `actorId` | String | FK → `User`, wajib | |
| Index | | `itemId`, `locationId`, `actorId`, `type`, `createdAt` | Desain indeks yang wajar untuk query laporan per-periode/per-tipe. |

## 4. Individually Tracked Assets

**Enum `AssetStatus`:** `AVAILABLE`, `ASSIGNED`, `IN_USE`, `IN_REPAIR`, `DAMAGED`, `LOST`, `RETIRED`, `DISPOSED` (8 nilai — lihat `05-state-machines.md` untuk tabel transisi lengkap).
**Enum `AssetCondition`:** `EXCELLENT`, `GOOD`, `FAIR`, `POOR`, `BROKEN` (default `EXCELLENT`).

### `Asset`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `assetTag` | String | **UK**, indexed | Format contoh di komentar schema: `BPTI-LAP-0001`. |
| `serialNumber` | String? | **UK**, indexed | Opsional — boleh `null`, tapi kalau diisi harus unik. |
| `name`/`brand`/`model` | String / String? / String? | | |
| `itemId` | String? | FK → `InventoryItem`, `onDelete: SetNull`, indexed | Tautan opsional ke katalog item — Asset boleh berdiri sendiri tanpa item katalog. |
| `locationId` | String? | FK → `Location`, `onDelete: SetNull`, indexed | |
| `departmentId` | String? | FK → `Department`, `onDelete: SetNull`, indexed | |
| `holderId` | String? | FK → `User` ("AssetCurrentHolder"), `onDelete: SetNull`, indexed | Pemegang **saat ini** — disinkronkan manual oleh `AssetService`, lihat `03-domain-model.md` Invariant I-6. |
| `condition` | AssetCondition | default `EXCELLENT` | |
| `status` | AssetStatus | default `AVAILABLE`, indexed | |
| `purchaseDate` | DateTime? | opsional | ❌ Tidak ada input UI untuk field ini pada `AssetModal` (perlu diverifikasi ulang bila `asset-modal.tsx` berubah). |
| `purchaseCost` | Decimal? `@db.Decimal(12,2)` | opsional | |
| `warrantyExpiry` | DateTime? | opsional | ❌ Tidak ada alert/notifikasi kedaluwarsa garansi di `MonitoringService` maupun `AlertType` (lihat enum `AlertType` — tidak ada nilai untuk ini). |
| `qrCode` | String? `@db.Text` | opsional | ❌ Field ada, tidak ada kode generate/scan QR (`FR-QR-*` di SRS berstatus `[OPTIONAL]`, konsisten dengan ini belum dibangun). |
| `notes` | String? `@db.Text` | | |

### `AssetAssignment` (riwayat penugasan)
**Enum `AssignmentStatus`:** `ACTIVE`, `RETURNED`.

| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `assetId` | String | FK → `Asset`, **`onDelete: Restrict`** | |
| `holderId` | String | FK → `User` ("AssignmentHolder"), `onDelete: Cascade`, wajib | |
| `locationId` | String? | FK → `Location`, `onDelete: SetNull` | Lokasi pada saat assignment dibuat (snapshot historis). |
| `assignedById` | String | FK → `User` ("AssignmentActor"), wajib | Aktor yang melakukan assignment — bisa berbeda dari `holderId`. |
| `returnedAt` | DateTime? | | `null` selama `status = ACTIVE`. |
| `returnCondition` | AssetCondition? | | Diisi saat `returnAsset()`. |
| **Catatan penting:** tidak ada field `dueDate`/tenggat waktu pada model ini — assignment bersifat **tanpa batas waktu** (custody), bukan pinjaman bertenggat. Bandingkan dengan konsep `borrow_records.dueDate` di skema resmi PKL (`00-RECONCILIATION.md` §2) — ini perbedaan model data yang fundamental, bukan sekadar field yang belum ditambahkan. |

### `AssetTransfer` (riwayat mutasi lokasi/pemegang)
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `assetId` | String | FK → `Asset`, **`onDelete: Restrict`** | |
| `fromLocationId`/`toLocationId` | String? | FK → `Location`, `onDelete: SetNull` | |
| `fromHolderId`/`toHolderId` | String? | FK → `User`, `onDelete: SetNull` | |
| `transferredById` | String | FK → `User` ("TransferActor"), wajib | |
| `reason`/`notes` | String? `@db.Text` | | |

## 5. Asset Maintenance Workflow

**Enum `MaintenancePriority`:** `LOW`, `MEDIUM`, `HIGH`, `CRITICAL` (default `MEDIUM`).
**Enum `MaintenanceStatus`:** `REQUESTED`, `APPROVED`, `IN_PROGRESS`, `WAITING_PART`, `COMPLETED`, `CANCELLED` (default `REQUESTED`) — **6 nilai, tanpa tabel transisi legal di kode** (lihat `05-state-machines.md` §3).

### `MaintenanceRecord`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `assetId` | String | FK → `Asset`, **`onDelete: Restrict`** | |
| `requestedById` | String | FK → `User` ("MaintenanceRequester"), wajib | |
| `technician` | String? | opsional, teks bebas | Bukan FK ke `User` — teknisi tidak harus punya akun sistem. |
| `title` | String | wajib | |
| `description` | String `@db.Text` | **wajib** (bukan opsional) | |
| `priority` | MaintenancePriority | default `MEDIUM` | |
| `status` | MaintenanceStatus | default `REQUESTED`, indexed | |
| `cost` | Decimal? `@db.Decimal(12,2)` | opsional | ❌ Tidak ada input UI untuk field ini di `MaintenanceModal` (hanya create ticket, belum ada UI update dengan biaya). |
| `startedAt`/`completedAt` | DateTime? | opsional | Diisi oleh `updateMaintenanceStatusAction` — perlu verifikasi apakah logika pengisiannya mengikuti transisi status yang benar (lihat `05-state-machines.md`). |
| `resolutionNotes` | String? `@db.Text` | | |

## 6. Centralized Audit Logging

### `AuditLog`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `actorId` | String? | FK → `User`, `onDelete: SetNull` | **Opsional** — mengizinkan baris audit tanpa aktor (mis. proses sistem otomatis), meski saat ini semua pemanggilan `recordAudit()` menyertakan `actorId`. |
| `action` | String | wajib, indexed | Teks bebas, contoh di komentar schema: `auth.login`, `stock.adjust`, `asset.assign`, `role.update` — **`auth.login` dicontohkan tapi tidak ada kode yang benar-benar menuliskannya** (lihat `README.md` Temuan §Business Rules BR-020). |
| `entity`/`entityId` | String / String? | indexed (`entity`) | Referensi bebas (bukan FK sungguhan) — memungkinkan satu tabel audit menunjuk entitas apa pun, dengan trade-off tanpa integritas referensial untuk tabel ini. |
| `beforeState`/`afterState` | Json? | | Snapshot before/after, dipakai konsisten di 10 Server Action yang sudah terpasang. |
| `ipAddress`/`userAgent` | String? | opsional | ❌ **Tidak pernah diisi** oleh `recordAudit()` pada pemanggilan manapun yang diperiksa — selalu `null` dalam praktik, walau `audit/page.tsx` menampilkan fallback `"127.0.0.1"` saat `null` (berpotensi menyesatkan pembaca log, seolah-olah aksi itu benar dari localhost). |

## 7. Operational Monitoring & System Alerts

**Enum `AlertType`:** `LOW_STOCK`, `OUT_OF_STOCK`, `OVERDUE_RETURN`, `MAINTENANCE_DUE`, `MAINTENANCE_OVERDUE`, `UNVERIFIED_ASSET`.
**Enum `AlertSeverity`:** `INFO`, `WARNING`, `CRITICAL` (default `WARNING`).

### `SystemAlert`
| Field | Tipe | Constraint | Keterangan |
|---|---|---|---|
| `type` | AlertType | wajib | |
| `severity` | AlertSeverity | default `WARNING` | |
| `entity`/`entityId` | String? | tidak ada FK sungguhan | Sama seperti `AuditLog` — referensi bebas. |
| `isResolved` | Boolean | default `false`, indexed | |
| `resolvedAt` | DateTime? | | |
| **Catatan penting (dikoreksi):** ✅ `SystemAlert` **dibuat** oleh `InventoryService.transactStock()` (`inventory-service.ts:224-235`) setiap kali stok hasil transaksi jatuh ke ambang `minStock` (`LOW_STOCK`) atau ke nol (`OUT_OF_STOCK`) — perilaku ini sudah ada sejak v1. Baris ini **dibaca** oleh `MonitoringService` (`monitoring-service.ts:32-36`, mengambil 5 alert `isResolved: false` terbaru) dan **ditampilkan** di `dashboard/page.tsx` (baris ~148-165, panel "System Alerts"). Yang **belum ada**: tidak ada kode yang pernah menulis `isResolved: true` di mana pun (`grep isResolved` hanya menemukan penggunaannya sebagai filter baca) — begitu sebuah alert dibuat, ia akan terus tampil di dashboard tanpa cara menutupnya, sampai tergeser 5 alert lain yang lebih baru. Empat dari enam nilai `AlertType` (`OVERDUE_RETURN`, `MAINTENANCE_DUE`, `MAINTENANCE_OVERDUE`, `UNVERIFIED_ASSET`) juga tidak pernah dipakai — hanya `LOW_STOCK`/`OUT_OF_STOCK` yang benar-benar dibuat kode manapun. *(Catatan revisi: draf audit sebelumnya sempat menuliskan tabel ini "sepenuhnya tidak terhubung ke kode aplikasi" — itu keliru, berasal dari pemeriksaan awal yang tidak diverifikasi ulang terhadap file ini secara langsung. Sudah diperbaiki di atas setelah verifikasi ulang terhadap `inventory-service.ts` dan `monitoring-service.ts`.)* |

## 8. Ringkasan "dead" atau belum terhubung (referensi cepat)

| Field/Tabel | Didefinisikan di skema? | Terhubung ke kode? |
|---|:-:|:-:|
| `Stock.reservedQty` | ✓ | ❌ |
| `StockMovement.referenceNumber` | ✓ | ❌ (selalu `null`) |
| `Permission` (seluruh tabel) | ✓ | ❌ (0 baris pernah dibuat) |
| `RolePermission` (seluruh tabel) | ✓ | ❌ (0 baris pernah dibuat) |
| `SystemAlert` (seluruh tabel) | ✓ | ⚠️ dibuat & ditampilkan, tidak pernah "diselesaikan" (`isResolved`) |
| `AuditLog.ipAddress`/`userAgent` | ✓ | ❌ (selalu `null`) |
| `Asset.qrCode` | ✓ | ❌ |
| `Asset.warrantyExpiry` | ✓ | ⚠️ tersimpan, tidak ada alert terkait |
| `MaintenanceRecord.cost` | ✓ | ⚠️ tersimpan, tidak ada input UI |

Tabel ini berguna sebagai checklist cepat: setiap kali salah satu baris di atas mulai "hidup" (dapat kode yang memakainya), baris ini harus dipindah ke status terpakai dan dicatat di `CHANGELOG.md`.
