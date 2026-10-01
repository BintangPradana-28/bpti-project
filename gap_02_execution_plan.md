# RENCANA PELAKSANAAN GAP-02: MANAJEMEN SIKLUS HIDUP LOKASI
**Proyek:** SIM-Inventaris & Aset BPTI UHAMKA  
**Tanggal:** 1 Oktober 2026  
**Dokumen Acuan:** `GAP_AUDIT_REPORT_V7.md`, `03-domain-model.md`, `04-business-rules.md`, `13-module-boundaries.md`, `22-authorization-matrix.md`, `AGENTS.md`, `stop-slop.md`  
**Status:** Draf Perencanaan Siap Dieksekusi

---

## 1. Analisis Situasi & Masalah (Root Cause Analysis)

### A. Kondisi Saat Ini (Current State)
Berdasarkan audit kode pada modul lokasi:
- File `src/modules/locations/location-service.ts`: Hanya memiliki metode `getLocations`, `getLocationById`, dan `createLocation`. Tidak ada fungsionalitas mutasi pembaruan (`updateLocation`) maupun penghapusan/deaktivasi (`deleteLocation`).
- File `src/actions/location-actions.ts`: Hanya mengekspos Server Action tunggal `createLocationAction`.
- File `src/lib/validations/location.ts`: Hanya memiliki skema Zod `createLocationSchema`. Tidak ada validasi untuk payload edit lokasi maupun ID target penghapusan.
- File `src/app/locations/page.tsx` & `src/components/modals/location-modal.tsx`: Tabel antarmuka menampilkan kolom `Kode`, `Nama`, `Tipe`, `Induk`, `Departemen`, `Sub-lokasi`, `Item Stok`, dan `Aset`. Kolom `Aksi` sama sekali belum tersedia, sehingga administrator tidak memiliki kontrol antarmuka untuk mengoreksi typo, mengubah nama ruangan, memindahkan lantai gedung, atau menghapus ruangan yang salah input.

### B. Risiko Teknis & Integritas Data
1. **Bahaya Siklus Hierarki Pohon (Tree Hierarchy Cycle):**
   Model `Location` memiliki relasi rekursif self-referencing:
   ```prisma
   parentId String?
   parent Location? @relation("LocationHierarchy", fields: [parentId], references: [id], onDelete: SetNull)
   children Location[] @relation("LocationHierarchy")
   ```
   Jika sebuah node (misal Gedung A) diubah induknya menjadi salah satu anak/cucunya (misal Ruang 101 di Lantai 1 Gedung A), maka struktur pohon akan terjebak dalam loop siklus tak hingga (infinite cyclic loop). Hal ini dapat menyebabkan rekursi tanpa batas (stack overflow) saat penelusuran hierarki.
2. **Bahaya Yatim Relasi (Orphan Relational Cascade):**
   Tabel `stocks`, `assets`, `stock_movements`, dan `asset_assignments` berelasi langsung dengan tabel `locations`. Menghapus lokasi yang sedang menampung stok barang atau aset fisik secara gegabah akan melanggar konsistensi data riil gudang kampus.

---

## 2. Arsitektur Solusi & Aturan Bisnis (Business Rules)

### A. Aturan Pembaruan Lokasi (Update Location Invariants)
1. **Pemeriksaan Keberadaan:** Lokasi target harus terdaftar dalam basis data.
2. **Keunikan Kode (Code Uniqueness):** Jika `code` diubah, kode baru tidak boleh dipakai oleh lokasi lain (`WHERE code = newCode AND id != targetId`).
3. **Pencegahan Self-Parent:** `parentId` tidak boleh bernilai sama dengan `id` lokasi itu sendiri.
4. **Pencegahan Siklus Hierarki (Cycle Guard Traversal):**
   Jika `parentId` diisi dengan ID baru, sistem wajib menelusuri rantai leluhur (ancestor chain) dari calon parent tersebut ke atas. Jika ID lokasi target ditemukan di rantai leluhur calon parent, pembaruan wajib ditolak seketika:
   ```
   Target: Lokasi A
   Calon Parent Baru: Lokasi C
   Penelusuran: Lokasi C -> Parent: Lokasi B -> Parent: Lokasi A (Ditemukan! Ditolak karena siklus)
   ```

### B. Aturan Penghapusan Lokasi yang Aman (Safe Deletion Guard)
Lokasi hanya boleh dihapus secara fisik jika dan hanya jika:
1. Memiliki 0 sub-lokasi aktif (`_count.children === 0`).
2. Memiliki 0 stok barang inventaris (`_count.stocks === 0`).
3. Memiliki 0 aset fisik terdaftar (`_count.assets === 0`).
4. Memiliki 0 rekam jejak mutasi historis (`movements === 0`, `transfersFrom === 0`, `transfersTo === 0`, `assignments === 0`).

Bila salah satu dari dependensi di atas bernilai lebih dari 0, sistem wajib memblokir penghapusan dengan pesan informatif dalam Bahasa Indonesia:
*"Lokasi tidak dapat dihapus karena masih menampung [X] aset / [Y] item stok / memiliki sub-lokasi. Pindahkan atau bersihkan data terkait terlebih dahulu."*

---

## 3. Rencana Implementasi Bertahap

```
+-------------------------------------------------------------+
| Tahap 1: Validasi Zod (src/lib/validations/location.ts)      |
|  - updateLocationSchema                                     |
|  - deleteLocationSchema                                     |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Tahap 2: Domain Service (location-service.ts)               |
|  - checkHierarchyCycle(targetId, newParentId, tx)           |
|  - updateLocation(dto: UpdateLocationDTO) + recordAudit     |
|  - deleteLocation(id: string, actorId: string) + recordAudit|
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Tahap 3: Server Actions (location-actions.ts)               |
|  - updateLocationAction (requirePermission: LOCATION_MANAGE)|
|  - deleteLocationAction (requirePermission: LOCATION_MANAGE)|
|  - Revalidasi path /locations, /inventory, /assets, /audit  |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Tahap 4: Antarmuka UI (location-modal.tsx & locations/page) |
|  - EditLocationModal dialog                                 |
|  - DeleteLocationDialog konfirmasi aman                     |
|  - Kolom 'Aksi' pada tabel data locations/page.tsx          |
+-------------------------------------------------------------+
                               |
                               v
+-------------------------------------------------------------+
| Tahap 5: Pengujian & Kualitas (location-management.test.ts) |
|  - Uji validasi Zod                                         |
|  - Uji deteksi siklus pohon hierarki                        |
|  - Uji pencegahan penghapusan lokasi berisi aset/stok       |
|  - Verifikasi vitest, tsc, eslint, next build               |
+-------------------------------------------------------------+
```

---

## 4. Rincian Teknis Tiap Lapisan

### A. Lapisan Validasi (`src/lib/validations/location.ts`)
```typescript
export const updateLocationSchema = z.object({
  id: z.string().min(1, "ID lokasi wajib diisi"),
  code: z
    .string()
    .min(2, "Kode lokasi minimal 2 karakter")
    .max(50, "Kode lokasi maksimal 50 karakter")
    .regex(/^[A-Za-z0-9_-]+$/, "Kode lokasi hanya boleh berisi huruf, angka, strip, atau underscore"),
  name: z
    .string()
    .min(2, "Nama lokasi minimal 2 karakter")
    .max(100, "Nama lokasi maksimal 100 karakter"),
  type: z.nativeEnum(LocationType, {
    errorMap: () => ({ message: "Tipe lokasi tidak valid" }),
  }),
  description: z.string().max(255).optional().nullable(),
  parentId: z.string().optional().nullable(),
  departmentId: z.string().optional().nullable(),
});

export const deleteLocationSchema = z.object({
  id: z.string().min(1, "ID lokasi wajib diisi"),
});
```

### B. Lapisan Layanan Domain (`src/modules/locations/location-service.ts`)
- Fungsi pendeteksi siklus:
  ```typescript
  static async checkHierarchyCycle(
    locationId: string,
    targetParentId: string | null | undefined,
    tx: PrismaClientOrTransaction
  ): Promise<void> {
    if (!targetParentId) return;
    if (targetParentId === locationId) {
      throw new Error("Siklus hierarki terdeteksi: Lokasi tidak dapat menjadi induk bagi dirinya sendiri.");
    }

    let currentId: string | null = targetParentId;
    while (currentId) {
      if (currentId === locationId) {
        throw new Error(
          "Siklus hierarki terdeteksi: Lokasi tidak dapat dipindahkan ke bawah sub-lokasi miliknya sendiri."
        );
      }
      const record = await tx.location.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      });
      currentId = record ? record.parentId : null;
    }
  }
  ```
- Fungsi `updateLocation`: Mengambil data lama, memvalidasi duplikasi kode, memvalidasi siklus hierarki, mengeksekusi update, dan mencatat `location.update` ke audit log.
- Fungsi `deleteLocation`: Menghitung relasi aktif (`children`, `stocks`, `assets`, `movements`, `assignments`). Jika bersih (nol), melakukan penghapusan fisik dan mencatat `location.delete` ke audit log.

### C. Lapisan Server Actions (`src/actions/location-actions.ts`)
- `updateLocationAction(input: UpdateLocationInput)`:
  - Validasi sesi pengguna dengan `requirePermission(PERMISSIONS.LOCATION_MANAGE)`.
  - Parse input via `updateLocationSchema`.
  - Panggil `LocationService.updateLocation`.
  - Revalidasi rute `/locations`, `/inventory`, `/assets`, `/assignments`, `/dashboard`, `/audit`.
- `deleteLocationAction(id: string)`:
  - Validasi sesi pengguna dengan `requirePermission(PERMISSIONS.LOCATION_MANAGE)`.
  - Parse input via `deleteLocationSchema`.
  - Panggil `LocationService.deleteLocation`.
  - Revalidasi rute terkait.

### D. Lapisan Antarmuka (`src/components/modals/location-modal.tsx` & `src/app/locations/page.tsx`)
- Komponen `EditLocationModal`:
  - Form pre-populated dengan data lokasi saat ini.
  - Dropdown parent locations otomatis memfilter dirinya sendiri (dan sub-lokasinya) agar tidak bisa dipilih sebagai induk.
  - Penanganan status loading dan error yang jelas.
- Komponen `DeleteLocationDialog`:
  - Dialog peringatan konfirmasi sebelum eksekusi penghapusan.
  - Indikasi jumlah aset dan stok yang ditampung lokasi.
- Tabel `src/app/locations/page.tsx`:
  - Menambahkan kolom header `Aksi` di paling kanan.
  - Menempatkan tombol Edit (`Pencil` icon) dan tombol Hapus (`Trash2` icon).

---

## 5. Rencana Pengujian Otomatis (`src/__tests__/location-management.test.ts`)

1. **Uji Validasi Skema:**
   - Validasi payload pembaruan yang valid berhasil.
   - Penolakan format kode lokasi yang tidak valid (karakter spesial terlarang).
   - Penolakan ID lokasi yang kosong.
2. **Uji Pencegahan Siklus Hierarki (Cycle Guard):**
   - Menolak jika lokasi menetapkan dirinya sendiri sebagai induk (`parentId === id`).
   - Menolak pemindahan node induk ke bawah node keturunan (cucu/anak).
   - Mengizinkan pemindahan ke node yang sah (non-keturunan) atau kembali ke level root (`parentId: null`).
3. **Uji Perlindungan Penghapusan Lokasi (Deletion Guard):**
   - Menolak penghapusan lokasi yang masih memiliki sub-lokasi (`children > 0`).
   - Menolak penghapusan lokasi yang masih memiliki item stok (`stocks > 0`).
   - Menolak penghapusan lokasi yang masih memiliki aset fisik (`assets > 0`).
   - Mengizinkan penghapusan lokasi bersih tanpa dependensi aktif.
