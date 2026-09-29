# 22-authorization-matrix.md — Authorization Matrix
# BPTI Inventory & Asset Management System

**Snapshot diaudit:** v4 (`bpti-project-main__1_.zip`, 2026-09-24) — lihat `README.md` §1
**Sumber utama:** `src/lib/rbac.ts` (identik sejak v1 — belum pernah berubah), `src/lib/session.ts`, seluruh `src/actions/*.ts`
**Legenda status:** lihat `README.md` §2

---

## 0. Ringkasan eksekutif

Dari **23 permission** yang didefinisikan di `rbac.ts`, hanya **10 (43%)** yang benar-benar dikonsumsi oleh `requirePermission()` di suatu tempat pada snapshot v4 `[VERIFIED-IN-CODE]`. Sisanya **13 (57%)** terdaftar di model RBAC tapi tidak pernah diperiksa oleh kode manapun — baik karena operasinya belum punya UI (mis. `ASSET_RETIRE`), atau karena operasinya sudah ada tapi tidak pernah dijaga permission (mis. semua operasi `*_READ`, lihat `README.md` Temuan #2). Angka ini naik dari 7/23 (30%) di v2 menjadi 10/23 (43%) di v4 — progres nyata, terutama dari `USER_MANAGE`, `LOCATION_MANAGE`, dan `REPORT_EXPORT` yang baru mulai ditegakkan sejak v4.

## 1. Matriks Peran × Izin (definisi, dari `rbac.ts:38-92`)

`✓` = ada di `ROLE_DEFAULT_PERMISSIONS[role]`. `SUPER_ADMIN` selalu `Object.values(PERMISSIONS)` (baris 39) — seluruh 23 izin otomatis.

| Permission | SUPER_ADMIN | INVENTORY_ADMIN | IT_STAFF | MANAGER | AUDITOR | VIEWER | **Ditegakkan di kode?** |
|---|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| `inventory.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ❌ tidak pernah |
| `inventory.create` | ✓ | ✓ | ✓ | – | – | – | ✅ `inventory-actions.ts` |
| `inventory.update` | ✓ | ✓ | – | – | – | – | ❌ tidak pernah |
| `inventory.delete` | ✓ | ✓ | – | – | – | – | ❌ tidak pernah (juga: tidak ada UI sama sekali) |
| `stock.transact` | ✓ | ✓ | ✓ | – | – | – | ✅ `inventory-actions.ts` |
| `stock.adjust` | ✓ | ✓ | – | – | – | – | ❌ tidak pernah (skema `StockMovement.ADJUSTMENT` ada, action-nya tidak) |
| `asset.read` | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | ❌ tidak pernah |
| `asset.create` | ✓ | ✓ | – | – | – | – | ✅ `asset-actions.ts` |
| `asset.update` | ✓ | ✓ | – | – | – | – | ❌ tidak pernah (`updateStatus()` di service ada, action-nya tidak — lihat `04-business-rules.md` BR-015) |
| `asset.assign` | ✓ | ✓ | ✓ | – | – | – | ✅ `asset-actions.ts` (dipakai 2×: assign & return) |
| `asset.transfer` | ✓ | ✓ | ✓ | – | – | – | ✅ `asset-actions.ts` |
| `asset.retire` | ✓ | – | – | – | – | – | ❌ tidak pernah — **hanya `SUPER_ADMIN` yang punya izin ini, dan tidak ada kode yang memeriksanya** |
| `maintenance.read` | ✓ | ✓ | ✓ | ✓ | ✓ | – | ❌ tidak pernah |
| `maintenance.create` | ✓ | ✓ | ✓ | – | – | – | ✅ `maintenance-actions.ts` |
| `maintenance.update` | ✓ | ✓ | ✓ | – | – | – | ✅ `maintenance-actions.ts` |
| `maintenance.approve` | ✓ | – | – | **✓** | – | – | ❌ tidak pernah — lihat §3 |
| `monitoring.read` | ✓ | ✓ | ✓ | ✓ | – | ✓ | ❌ tidak pernah |
| `report.read` | ✓ | ✓ | – | ✓ | ✓ | – | ❌ tidak pernah |
| `report.export` | ✓ | ✓ | – | ✓ | – | – | ✅ `api/reports/export/route.ts` *(baru sejak v4)* |
| `audit.read` | ✓ | – | – | – | ✓ | – | ❌ tidak pernah |
| `user.manage` | ✓ | – | – | – | – | – | ✅ `user-actions.ts` *(baru sejak v4)* |
| `role.manage` | ✓ | – | – | – | – | – | ❌ tidak pernah — tidak ada UI Role Management sama sekali |
| `location.manage` | ✓ | ✓ | – | – | – | – | ✅ `location-actions.ts` *(baru sejak v4)* |

## 2. Rekonsiliasi dengan `SRS.md` §19 (matriks yang diusulkan sebelum coding)

`SRS.md` §19 menulis beberapa sel sebagai `[PROPOSED]`/"maybe"/"approve/view" yang belum tegas. Kode v4 sekarang memberi jawaban de-facto untuk sebagian besar:

| Pertanyaan terbuka di `SRS.md` §19 | Jawaban de-facto dari kode v4 |
|---|---|
| "Stock adjustment: IT_STAFF = maybe" | **Tidak** — `IT_STAFF` tidak punya `stock.adjust` di `rbac.ts`, dan operasi ini juga belum punya action sama sekali. |
| "Manager: approve/view untuk maintenance" | **Ambigu, dan berpotensi salah desain** — lihat temuan §3 di bawah. |
| "Siapa boleh audit.read?" | `SUPER_ADMIN` dan `AUDITOR` saja per `rbac.ts` — tapi karena `audit.read` tidak pernah ditegakkan (lihat §1), siapa pun yang login **saat ini** bisa membuka `/audit` terlepas dari baris ini. |
| "Viewer: restricted read-only" | `VIEWER` di `rbac.ts` memang paling sedikit izinnya (`inventory.read`, `asset.read`, `monitoring.read` saja) — **niatnya benar**, tapi karena tidak ada halaman yang menegakkan permission baca apa pun (`README.md` Temuan #2), niat ini tidak berefek di UI: VIEWER yang login tetap bisa membuka `/users`, `/audit`, `/reports`, `/maintenance` dan melihat data penuh. |

**Kesimpulan:** desain matriks di `rbac.ts` sendiri sudah cukup masuk akal dan sejalan dengan niat `SRS.md` — masalahnya bukan di definisi izin, tapi di **penegakannya** (lihat §4).

## 3. Temuan spesifik: `maintenance.approve` dipegang MANAGER tapi tidak pernah bisa dipakai

**Bukti:** `rbac.ts` memberi `MAINTENANCE_APPROVE` ke `MANAGER` (bukan ke `IT_STAFF`/`INVENTORY_ADMIN`). Tapi satu-satunya action yang mengubah status tiket, `updateMaintenanceStatusAction` (`maintenance-actions.ts`), memeriksa `MAINTENANCE_UPDATE` — bukan `MAINTENANCE_APPROVE` — dan `MANAGER` **tidak** memiliki `MAINTENANCE_UPDATE` di `rbac.ts`.

**Akibat konkret:** dengan kode saat ini, `MANAGER` login, membuka tiket maintenance berstatus `REQUESTED`, tapi mencoba mengubah statusnya ke `APPROVED` akan **ditolak server-side** (`requirePermission` gagal) — walau menurut definisi izinnya sendiri, "approve" jelas kedengarannya seperti hal yang seharusnya bisa dilakukan `MANAGER`. Sebaliknya `IT_STAFF` yang punya `MAINTENANCE_UPDATE` bisa mengubah status apa pun (termasuk efektif "menyetujui") walau tidak pernah diberi izin `MAINTENANCE_APPROVE` secara eksplisit.

**Ini bukan bug fatal** (tidak ada lubang keamanan — arahnya *fail-closed*, MANAGER hanya kehilangan kemampuan yang seharusnya dimiliki, bukan mendapat akses berlebih) — tapi ini kesenjangan desain-vs-implementasi yang nyata dan spesifik, bukan generik.

**Rekomendasi:** salah satu dari dua — (a) `updateMaintenanceStatusAction` memeriksa `MAINTENANCE_UPDATE` **atau** `MAINTENANCE_APPROVE` tergantung status tujuan (mis. transisi ke `APPROVED` butuh `MAINTENANCE_APPROVE`, transisi lain butuh `MAINTENANCE_UPDATE`), atau (b) beri `MANAGER` juga `MAINTENANCE_UPDATE` di `rbac.ts` dan perlakukan `MAINTENANCE_APPROVE` sebagai alias/tidak dipakai.

## 4. Kesenjangan inti: definisi izin vs penegakan izin

Tabel §1 menunjukkan pola yang konsisten: **hampir semua permission `*_READ` (dan `audit.read`, `monitoring.read`) tidak pernah ditegakkan**, sementara hampir semua permission mutasi yang **punya UI aktif** sudah ditegakkan dengan benar. Ini bukan kebetulan — ini karena penegakan otorisasi saat ini hanya ditambahkan di lapisan Server Action (`actions/*.ts`), dan Server Component halaman (`app/*/page.tsx`) tidak pernah dilewati lapisan itu. Detail teknis lengkap (termasuk mengapa ini bukan sekadar "session cookie bisa dipalsukan", melainkan murni ketiadaan pemeriksaan role) ada di `23-threat-model.md`.

## 5. Rekomendasi konkret, terurut prioritas

1. **Tambahkan pemeriksaan permission di lapisan baca** (`getCurrentUser()` + `hasPermission()` sebelum setiap `*Service.getX()` di `app/*/page.tsx`) — ini menutup 13 dari 13 permission yang belum ditegakkan sekaligus, karena polanya seragam di semua halaman.
2. Perbaiki `maintenance.approve` vs `maintenance.update` (§3) — perubahan satu-dua baris.
3. Bangun UI Role Management yang menegakkan `role.manage` — saat ini satu-satunya permission `SUPER_ADMIN`-eksklusif yang benar-benar tanpa jalan sama sekali untuk dipakai.
4. Putuskan nasib `asset.retire`, `inventory.delete`, `stock.adjust` — apakah memang sengaja belum in-scope (lihat `SRS.md` §39 pertanyaan terbuka terkait), atau perlu dibangun.
