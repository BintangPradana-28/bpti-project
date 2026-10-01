# RENCANA PELAKSANAAN GAP-03: MANAJEMEN KATALOG KATEGORI BARANG
**Proyek:** SIM-Inventaris & Aset BPTI UHAMKA  
**Tanggal:** 1 Oktober 2026  
**Dokumen Acuan:** `GAP_AUDIT_REPORT_V7.md`, `03-domain-model.md`, `04-business-rules.md`, `13-module-boundaries.md`, `22-authorization-matrix.md`, `AGENTS.md`, `stop-slop.md`  
**Status:** Draf Perencanaan Siap Dieksekusi

---

## 1. Analisis Situasi & Masalah (Root Cause Analysis)

### A. Kondisi Saat Ini (Current State)
Berdasarkan investigasi basis kode:
- Model Prisma `Category` (`prisma/schema.prisma:191-202`) telah didefinisikan dengan atribut `id`, `code` (unique), `name`, `description`, `createdAt`, `updatedAt`, dan relasi `items InventoryItem[]`.
- Kategori saat ini hanya tercipta secara implisit lewat proses impor massal Excel (`src/actions/bulk-import-actions.ts:123-140`) atau file seed awal (`prisma/seed.ts`).
- Di seluruh aplikasi, tidak ada Service Layer, Server Action, skema validasi Zod, maupun komponen UI antarmuka untuk manajemen CRUD kategori barang secara mandiri.
- Administrator dan staf gudang tidak dapat menambahkan kategori baru secara langsung lewat aplikasi web (misalnya saat ada kelompok barang baru seperti "Alat Jaringan Fiber Optic" atau "Perangkat IoT"). Mereka terpaksa membuat file Excel dummy hanya untuk memicu pembuatan kategori.
- Administrator tidak dapat memperbaiki kesalahan ketik nama/kode kategori maupun menghapus kategori lama yang sudah tidak digunakan.

### B. Risiko Teknis & Integritas Relasional
1. **Integritas Relasi Barang Inventaris (Foreign Key Restrict):**
   Model `InventoryItem` mewajibkan `categoryId String`. Menghapus kategori yang masih memiliki relasi item barang aktif akan memicu galat foreign key atau membuat barang kehilangan klasifikasi katalog.
2. **Keunikan Kode Kategori (Code Collision):**
   Kolom `code` memiliki constraint `@unique`. Pembaruan atau pembuatan kategori harus divalidasi agar tidak terjadi tabrakan kode antarkategori.

---

## 2. Arsitektur Solusi & Aturan Bisnis (Business Rules)

### A. Aturan Pembuatan & Pembaruan Kategori (Create & Update Invariants)
1. **Validasi Format Kode:** Kode kategori wajib alfanumerik kapital (contoh: `KAT-NET`, `KAT-KBL`, `ELEKTRONIK`), minimal 2 karakter, maksimal 30 karakter.
2. **Keunikan Kode:** Kode kategori tidak boleh menduplikasi kode yang sudah ada di basis data.
3. **Validasi Nama:** Nama kategori minimal 2 karakter dan maksimal 100 karakter.
4. **Audit Trail:** Setiap aktivitas pembuatan (`category.create`) dan pembaruan (`category.update`) wajib dicatat ke tabel `audit_logs` dengan snapshot data sebelum dan sesudah mutasi.

### B. Aturan Perlindungan Penghapusan Kategori (Strict Referential Guard)
Kategori hanya boleh dihapus jika dan hanya jika:
- Jumlah item barang terhubung bernilai nol (`_count.items === 0`).

Jika kategori masih memuat satu atau lebih barang inventaris, sistem wajib memblokir penghapusan dengan pesan penolakan yang gamblang:
*"Kategori tidak dapat dihapus karena masih digunakan oleh [X] item barang inventaris. Pindahkan atau hapus item barang terkait terlebih dahulu."*

---

## 3. Rencana Implementasi Bertahap

```
+--------------------------------------------------------------------------+
| Tahap 1: Skema Validasi Zod (src/lib/validations/category.ts)            |
|  - createCategorySchema (code, name, description)                        |
|  - updateCategorySchema (id, code, name, description)                    |
|  - deleteCategorySchema (id)                                             |
+--------------------------------------------------------------------------+
                                     │
                                     ▼
+--------------------------------------------------------------------------+
| Tahap 2: Domain Service Layer (src/modules/inventory/category-service.ts) |
|  - getCategories(): daftar kategori + _count.items                       |
|  - createCategory(): validasi duplikasi code + recordAudit               |
|  - updateCategory(): validasi keberadaan & keunikan code + recordAudit   |
|  - deleteCategory(): evaluasi _count.items === 0 + recordAudit           |
+--------------------------------------------------------------------------+
                                     │
                                     ▼
+--------------------------------------------------------------------------+
| Tahap 3: Server Actions & RBAC (src/actions/category-actions.ts)         |
|  - createCategoryAction() -> requirePermission(INVENTORY_CREATE)         |
|  - updateCategoryAction() -> requirePermission(INVENTORY_UPDATE)         |
|  - deleteCategoryAction() -> requirePermission(INVENTORY_DELETE)         |
|  - Revalidasi path: /inventory, /dashboard, /reports, /audit             |
+--------------------------------------------------------------------------+
                                     │
                                     ▼
+--------------------------------------------------------------------------+
| Tahap 4: Antarmuka UI (src/components/modals/category-modal.tsx)         |
|  - Komponen CategoryManagementModal di samping Bulk Import & Add Item    |
|  - Tampilan daftar kategori beserta badge jumlah item terhubung          |
|  - Form penambahan kategori baru                                         |
|  - Form edit kategori inline / modal dialog                              |
|  - Konfirmasi hapus kategori yang terproteksi guard beban                |
|  - Integrasi ke src/app/inventory/page.tsx                               |
+--------------------------------------------------------------------------+
                                     │
                                     ▼
+--------------------------------------------------------------------------+
| Tahap 5: Pengujian & Kualitas (src/__tests__/category-management.test.ts)|
|  - Uji validasi Zod create, update, delete                               |
|  - Uji penolakan duplikasi kode kategori                                 |
|  - Uji proteksi penghapusan kategori yang masih memiliki item barang     |
|  - Uji keberhasilan CRUD dan audit logging                               |
|  - Verifikasi: vitest, tsc, eslint, next build                           |
+--------------------------------------------------------------------------+
```

---

## 4. Rincian Teknis Tiap Lapisan

### A. Lapisan Validasi (`src/lib/validations/category.ts`)
```typescript
export const createCategorySchema = z.object({
  code: z
    .string()
    .min(2, "Kode kategori minimal 2 karakter")
    .max(30, "Kode kategori maksimal 30 karakter")
    .regex(/^[A-Za-z0-9_-]+$/, "Kode kategori hanya boleh berisi huruf, angka, strip, atau underscore"),
  name: z
    .string()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(100, "Nama kategori maksimal 100 karakter"),
  description: z.string().max(255).optional().nullable(),
});

export const updateCategorySchema = z.object({
  id: z.string().min(1, "ID kategori wajib diisi"),
  code: z
    .string()
    .min(2, "Kode kategori minimal 2 karakter")
    .max(30, "Kode kategori maksimal 30 karakter")
    .regex(/^[A-Za-z0-9_-]+$/, "Kode kategori hanya boleh berisi huruf, angka, strip, atau underscore"),
  name: z
    .string()
    .min(2, "Nama kategori minimal 2 karakter")
    .max(100, "Nama kategori maksimal 100 karakter"),
  description: z.string().max(255).optional().nullable(),
});

export const deleteCategorySchema = z.object({
  id: z.string().min(1, "ID kategori wajib diisi"),
});
```

### B. Lapisan Domain Service (`src/modules/inventory/category-service.ts`)
- `CategoryService.getCategories()`: Mengambil daftar kategori dengan include `_count: { select: { items: true } }`, diurutkan berdasarkan `name: "asc"`.
- `CategoryService.createCategory(dto)`: Memastikan kode belum terpakai, membuat record di `prisma.category`, lalu memanggil `recordAudit`.
- `CategoryService.updateCategory(dto)`: Memastikan kategori ditemukan, memastikan kode tidak bentrok dengan ID lain, melakukan update, dan mencatat `beforeState` serta `afterState` ke audit log.
- `CategoryService.deleteCategory(id, actorId)`: Mengambil kategori beserta `_count.items`. Jika `items > 0`, melempar error. Jika 0, menghapus record dan mencatat `category.delete` ke audit log.

### C. Lapisan Server Actions (`src/actions/category-actions.ts`)
- Menggunakan directive `"use server"`.
- Proteksi otorisasi dengan `requirePermission(PERMISSIONS.INVENTORY_CREATE)`, `INVENTORY_UPDATE`, dan `INVENTORY_DELETE`.
- Revalidasi path `/inventory`, `/dashboard`, `/reports`, dan `/audit`.

### D. Lapisan Antarmuka Pengguna (`src/components/modals/category-modal.tsx`)
- Tombol pemicu: `Kelola Kategori` dengan icon `Tags` pada Action Bar [src/app/inventory/page.tsx](file:///c:/bpti%20project/src/app/inventory/page.tsx).
- Dialog interaktif memuat:
  1. Bagian atas: Form tambah kategori baru (cepat dan ringkas).
  2. Bagian bawah: Tabel daftar kategori lengkap dengan kolom `Kode`, `Nama`, `Deskripsi`, `Jumlah Item`, dan tombol `Edit` serta `Hapus`.
  3. Konfirmasi hapus yang menampilkan jumlah item terkait (tombol hapus nonaktif bila item > 0).

---

## 5. Rencana Pengujian Otomatis (`src/__tests__/category-management.test.ts`)

1. **Uji Validasi Skema:**
   - Validasi payload valid lulus.
   - Penolakan format kode dengan karakter terlarang (spasi atau simbol).
   - Penolakan payload dengan ID kosong pada mutasi update/delete.
2. **Uji Aturan Bisnis Service:**
   - Penolakan pembuatan kategori dengan kode yang sudah ada.
   - Penolakan pembaruan kategori dengan kode yang telah dipakai kategori lain.
   - Penolakan penghapusan kategori yang masih menampung item barang (`_count.items > 0`).
   - Keberhasilan penghapusan kategori bersih tanpa item.
   - Verifikasi pemanggilan `recordAudit` pada setiap mutasi.
