**PROJECT CHARTER**

**SISTEM INFORMASI PENGELOLAAN BARANG INVENTARIS KANTOR**

**Badan Pengembangan Teknologi Informasi (BPTI)**

**Universitas Muhammadiyah Prof. DR. HAMKA (UHAMKA)**

  -------------------------------------------------------------------------------------------------------
  **1. Informasi Proyek**   
  ------------------------- -----------------------------------------------------------------------------
  **Nama Proyek**           Sistem Informasi Inventaris Barang Berbasis Web (SIM-Inventaris BPTI)

  **Instansi Mitra**        Badan Pengembangan Teknologi Informasi (BPTI) UHAMKA

  **Periode Pengerjaan**    14 September 2026 -- 31 Oktober 2026 (\~7 Minggu)

  **Status Proyek**         Inisiasi & Perencanaan (PKL / Magang)

  **Teknologi Utama**       Next.js (Fullstack App Router), MySQL, Prisma ORM, Tailwind CSS / Shadcn UI
  -------------------------------------------------------------------------------------------------------

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **2. LATAR BELAKANG & TUJUAN**
  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  Proses pencatatan aset operasional dan sirkulasi peminjaman barang saat ini belum tersentralisasi secara digital, sehingga menyulitkan pelacakan letak barang dan status ketersediaannya. Proyek ini bertujuan membangun sistem basis data inventaris terpadu satu pintu yang dikelola penuh oleh Admin Perlengkapan untuk memastikan akurasi data aset, meminimalisir kehilangan barang, dan mempercepat proses layanan peminjaman operasional.

  --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

+-------------------------------------------------------------------------------------------------------------------------------+
| **3. RUANG LINGKUP**                                                                                                          |
+===============================================================================================================================+
| **A. In-Scope (Fitur yang Dikerjakan)**                                                                                       |
+-------------------------------------------------------------------------------------------------------------------------------+
| **1. Sistem Autentikasi & Hak akses**                                                                                         |
+-------------------------------------------------------------------------------------------------------------------------------+
| -   Pembuatan arsitektur *Single Role* (Khusus Admin).                                                                        |
|                                                                                                                               |
| -   Fitur pencatatan master data barang (kode, kategori, merk, kondisi, lokasi).                                              |
|                                                                                                                               |
| -   Modul mutasi dan pemetaan penempatan barang per ruangan.                                                                  |
|                                                                                                                               |
| -   Modul pencatatan transaksi masuk/keluar (peminjaman dan pengembalian) oleh pegawai yang diinput secara manual oleh Admin. |
|                                                                                                                               |
| -   Halaman *dashboard* analitik untuk visibilitas ringkasan aset.                                                            |
+-------------------------------------------------------------------------------------------------------------------------------+
| **2. Tidak Termasuk (Out-of-Scope)**                                                                                          |
+-------------------------------------------------------------------------------------------------------------------------------+
| -   Portal mandiri/katalog publik untuk pegawai (*Viewer Role*).                                                              |
|                                                                                                                               |
| -   Sistem *Approval Workflow* untuk pengajuan peminjaman *online*.                                                           |
|                                                                                                                               |
| -   Integrasi *Single Sign-On* (SSO) email kantor pegawai.                                                                    |
|                                                                                                                               |
| -   Pembuatan dan pemindaian QR Code aset fisik.                                                                              |
+-------------------------------------------------------------------------------------------------------------------------------+

+----------------------------------------------------------------------------------------------------+
| **4. KRITERIA KEBERHASILAN**                                                                       |
+====================================================================================================+
| -   Admin dapat memasukkan 100% master data barang operasional ke dalam sistem.                    |
|                                                                                                    |
| -   Pencarian status ketersediaan barang dan lokasi terakhirnya dapat dilakukan di bawah 10 detik. |
|                                                                                                    |
| -   Laporan sirkulasi barang (dipinjam, tersedia, rusak) dapat dihasilkan secara *real-time*.      |
+----------------------------------------------------------------------------------------------------+

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **5. SUSUNAN TIM & PEMBAGIAN TANGGUNG JAWAB**                                                                              
  ----------------------------------------------- ------------------------------------ ------------------------------------- -------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Nama Anggota**                                **Peran**                            **Fokus pengembangan**                **Tanggung Jawab Utama**

  **Imam Maula**                                  **PM & Core Architect**              Auth, Security & Database Setup       Inisialisasi repositori Git, konfigurasi koneksi MySQL via Prisma ORM, enkripsi Bcrypt, Next.js Middleware route guard, dan manajemen sesi login Admin.

  **Indra Dharmawan**                             **UI/UX & Frontend Specialist**      Master Data Barang (CRUD) & Form      Pembuatan halaman CRUD master barang, modal dialog penambahan & pengeditan aset, validasi skema form menggunakan Zod, dan batasan kuota stok total vs tersedia.

  **Muhan Bintang**                               **System Analyst & Fullstack Dev**   Sirkulasi Peminjaman & SOP Logic      Penerjemahan SOP kantor ke Server Actions sirkulasi, implementasi transaksi atomik (Prisma.\$transaction), kalkulasi stok dinamis, dan validasi status terlambat.

  **Reval Delsiyano**                             **QA / QC Engineer & Layout Dev**    Dashboard, Search, Filter & Testing   Pengembangan main layout dasbor (Shadcn UI), komponen tabel interaktif, fitur live search instan, filter kategori, pengujian validasi sistem, serta dokumentasi.
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

+---------------------------+--------------------------------+--------------------------------------+---------------------------------------------------------------------------------------------+
| **6. JADWAL PELAKSANAAN** |                                |                                      |                                                                                             |
+===========================+================================+======================================+=============================================================================================+
| **Minggu 1**              | 14 -- 20 September 2026        | Analisis & Inisiasi                  | -   Finalisasi Project Charter dan Software Requirements Specification (SRS).               |
|                           |                                |                                      |                                                                                             |
|                           |                                |                                      | -   Perancangan ERD database MySQL dan wireframe antarmuka pengguna.                        |
|                           |                                |                                      |                                                                                             |
|                           |                                |                                      | -   Inisialisasi repositori Git dan setup proyek Next.js.                                   |
+---------------------------+--------------------------------+--------------------------------------+---------------------------------------------------------------------------------------------+
| **Minggu 2**              | 21 -- 27 September 2026        | Database & Fondasi Autentikasi       | -   Migrasi skema database Prisma ke MySQL.                                                 |
|                           |                                |                                      |                                                                                             |
|                           |                                |                                      | -   Implementasi sistem login dan proteksi rute berbasis role (Admin & User).               |
|                           |                                |                                      |                                                                                             |
|                           |                                |                                      | -   Pembuatan layout utama (Sidebar, Navbar, Responsive Shell).                             |
+---------------------------+--------------------------------+--------------------------------------+---------------------------------------------------------------------------------------------+
| **Minggu 3**              | 28 September -- 4 Oktober 2026 | Modul Master Data Barang             | -   Implementasi antarmuka tabel master barang.                                             |
|                           |                                |                                      |                                                                                             |
|                           |                                |                                      | -   Integrasi API/Server Actions untuk penambahan, pengubahan, dan penghapusan data barang. |
+---------------------------+--------------------------------+--------------------------------------+---------------------------------------------------------------------------------------------+
| **Minggu 4**              | 5 -- 11 Oktober 2026           | Modul Sirkulasi Peminjaman           | -   Pembuatan alur form transaksi peminjaman barang.                                        |
|                           |                                |                                      |                                                                                             |
|                           |                                |                                      | -   Logika otomatisasi pengurangan stok_tersedia saat transaksi dibuat.                     |
+---------------------------+--------------------------------+--------------------------------------+---------------------------------------------------------------------------------------------+
| **Minggu 5**              | 12 -- 18 Oktober 2026          | Modul Pengembalian & Halaman User    | -   Pembuatan fitur konfirmasi barang kembali beserta pencatatan kondisi fisik.             |
|                           |                                |                                      |                                                                                             |
|                           |                                |                                      | -   Pembangunan halaman tabel *read-only* untuk akun User staf.                             |
+---------------------------+--------------------------------+--------------------------------------+---------------------------------------------------------------------------------------------+
| **Minggu 6**              | 19 -- 25 Oktober 2026          | Pengujian Sistem & Integrasi (QA/QC) | -   Uji coba alur transaksi end-to-end (Edge case: stok habis, input ganda).                |
|                           |                                |                                      |                                                                                             |
|                           |                                |                                      | -   Perbaikan bug, optimasi UI/UX, dan penyusunan User Manual.                              |
+---------------------------+--------------------------------+--------------------------------------+---------------------------------------------------------------------------------------------+
| **Minggu 7**              | 26 -- 31 Oktober 2026          | Evaluasi Akhir & Serah Terima Proyek | -   Demo aplikasi kepada mentor dan pimpinan BPTI UHAMKA.                                   |
|                           |                                |                                      |                                                                                             |
|                           |                                |                                      | -   Finalisasi laporan akhir PKL dan serah terima dokumentasi teknis                        |
+---------------------------+--------------------------------+--------------------------------------+---------------------------------------------------------------------------------------------+

**7. PERSETUJUAN (SIGN-OFF)**

  -------------------------------------------------------------------------------------
  **Disusun Oleh,**                      **Mengetahui / Menyetujui,**
  -------------------------------------- ----------------------------------------------
  **[Imam Maula]{.underline}**           **[Mufki]{.underline}**

  **Project Manager / Tim PKL**          **Mentor / Pembimbing Lapangan BPTI UHAMKA**
  -------------------------------------------------------------------------------------
