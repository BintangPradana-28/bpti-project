**SOFTWARE REQUIREMENTS SPECIFICATION (SRS)**

**Sistem Informasi Pengelolaan Barang Inventaris Kantor BPTI UHAMKA**

  ------------------------------------------------------------------------------------------------------------------------
  **Nama Dokumen**                    Software Requirements Specification (SRS) Lengkap
  ----------------------------------- ------------------------------------------------------------------------------------
  **Instansi Mitra / Lokasi**         Badan Pengembangan Teknologi Informasi (BPTI) UHAMKA

  **Model Akses & Lingkungan**        Khusus Admin (Single-Role), Operasional Lokal (localhost:3000)

  **Stack Arsitektur**                Next.js 14+ (App Router, Server Actions), TypeScript, MySQL, Prisma ORM, Shadcn UI
  ------------------------------------------------------------------------------------------------------------------------

**BAB 1: PENDAHULUAN**

**1.1 Tujuan Penulisan Dokumen**

Dokumen Software Requirements Specification (SRS) ini disusun sebagai dokumen spesifikasi rekayasa perangkat lunak resmi untuk proyek pembangunan Sistem Informasi Pengelolaan Barang Inventaris Kantor pada Badan Pengembangan Teknologi Informasi (BPTI) UHAMKA. Tujuan utama dokumen ini adalah memberikan pedoman teknis yang presisi, lengkap, dan mengikat bagi tim pengembang (4 mahasiswa PKL) dalam merancang arsitektur perangkat lunak, memodelkan basis data relasional MySQL, mengimplementasikan logika sirkulasi, serta melakukan verifikasi pengujian sistem secara terstruktur.

**1.2 Ruang Lingkup Sistem**

Sistem ini merupakan aplikasi berbasis web internal satu pintu yang dirancang untuk mempermudah pencatatan, pemantauan, dan pemutakhiran sirkulasi barang inventaris kantor (seperti proyektor, kabel konverter/adaptor, perlengkapan jaringan, laptop operasional, dan peralatan teknis lainnya). Sistem dikendalikan secara penuh oleh Administrator internal BPTI.

**1.3 Definisi, Akronim, dan Singkatan**

-   **BPTI UHAMKA:** Badan Pengembangan Teknologi Informasi Universitas Muhammadiyah Prof. DR. HAMKA.

-   **CRUD:** Operasi dasar basis data yang meliputi Create (Tambah), Read (Lihat), Update (Ubah), dan Delete (Hapus).

-   **Prisma ORM:** Object-Relational Mapping, pustaka penghubung antara kode TypeScript dan basis data MySQL.

-   **Server Actions:** Fitur mutasi data asinkron langsung dari sisi server pada Next.js App Router.

-   **Atomisitas (Prisma \$transaction):** Mekanisme pengeksekusian transaksi basis data di mana seluruh kueri berhasil sepenuhnya atau dibatalkan sama sekali jika terjadi kegagalan.

-   **Shadcn UI:** Kumpulan komponen antarmuka pengguna berbasis Tailwind CSS dan Radix UI primitives.

**BAB 2: DESKRIPSI UMUM SISTEM**

**2.1 Perspektif Produk & Lingkungan Operasional**

Sistem ini adalah perangkat lunak mandiri (standalone web application) yang beroperasi pada jaringan intranet/lokal (localhost:3000) BPTI UHAMKA. Sistem tidak bergantung pada layanan cloud publik berbayar. Pengelolaan infrastruktur server dan hosting jangka panjang berada di bawah wewenang divisi infrastruktur BPTI setelah masa PKL selesai.

**2.2 Karakteristik Pengguna (Single-Role)**

Sistem hanya memiliki 1 (satu) tipe peran pengguna, yaitu Administrator Inventaris BPTI. Karakteristik pengguna meliputi:

-   **Otoritas Master Data:** Memiliki kewenangan mutlak untuk mengelola katalog master barang (tambah, ubah informasi aset, hapus barang).

-   **Pencatat Sirkulasi:** Bertindak sebagai operator tunggal yang melayani dan mencatat peminjaman barang saat staf mengambil barang secara fisik di kantor BPTI.

-   **Verifikator Pengembalian:** Memeriksa kondisi fisik barang yang kembali dan mengonfirmasi penyelesaian transaksi pengembalian barang pada sistem.

**2.3 Batasan dan Asumsi Desain**

-   **Asumsi Browser:** Pengguna mengakses sistem melalui browser modern (Google Chrome, Microsoft Edge, Mozilla Firefox) pada perangkat desktop/laptop kantor.

-   **Asumsi Lingkungan:** Basis data MySQL dan runtime Node.js telah terpasang dan berjalan aktif di lingkungan lokal tempat aplikasi dioperasikan.

-   **Batasan Akses:** Tidak ada modul login atau pendaftaran akun bagi staf/pegawai umum (Viewer ditiadakan).

-   **Batasan Notifikasi:** Tidak ada integrasi dengan SMS/WhatsApp Gateway otomatis; pencatatan kontak peminjam berfungsi sebagai arsip manual untuk dihubungi Admin.

**BAB 3: PEMBAGIAN TANGGUNG JAWAB PENGEMBANGAN (DEV SLICING - 4 ORANG)**

Agar proses koding berjalan paralel dan bebas dari konflik cabang repositori Git (merge conflict), seluruh pengerjaan modul dibagi secara vertikal (vertical feature slicing):

  ------------------------------------------------------------------------------------------------------------------------
  **Developer**           **Fokus Modul & Tanggung Jawab Koding**                     **Area Direktori Kerja (Next.js)**
  ----------------------- ----------------------------------------------------------- ------------------------------------
  **Dev 1**               Modul Autentikasi & Arsitektur Utama:\                      app/(auth)/\*\
                          \* Konfigurasi koneksi MySQL via Prisma ORM\                lib/auth/\*\
                          \* Enkripsi password Admin dengan Bcrypt\                   middleware.ts\
                          \* Manajemen cookie sesi & Next.js Middleware route guard   prisma/schema.prisma

  **Dev 2**               Modul Master Data Barang (CRUD Aset):\                      app/(dashboard)/barang/\*\
                          \* Implementasi Server Actions master barang\               actions/item-actions.ts\
                          \* Form modal dialog Tambah & Edit Barang\                  components/items/\*
                          \* Validasi form dengan skema Zod\                          
                          \* Proteksi stok total vs unit dipinjam                     

  **Dev 3**               Modul Sirkulasi Peminjaman & Stok Atomik:\                  app/(dashboard)/sirkulasi/\*\
                          \* Server Actions pencatatan pinjam & kembali\              actions/borrow-actions.ts\
                          \* Transaksi atomik Prisma (\$transaction)\                 components/borrow/\*
                          \* Validasi kuota stok tersedia (availableQuantity)\        
                          \* Perhitungan dan penandaan status terlambat               

  **Dev 4**               Modul Tampilan Dasbor, Pencarian & QA:\                     components/dashboard/\*\
                          \* Setup layout utama dasbor (Shadcn UI)\                   components/tables/\*\
                          \* Komponen tabel interaktif & badge status\                components/ui/\*\
                          \* Fitur pencarian instan (live search debounce)\           lib/utils.ts
                          \* Pengujian fungsi end-to-end & bug logging                
  ------------------------------------------------------------------------------------------------------------------------

**BAB 4: KEBUTUHAN FUNGSIONAL (FUNCTIONAL REQUIREMENTS)**

**4.1 Modul Autentikasi & Manajemen Sesi (Dev 1)**

-   **FR-AUTH-01 (Form Login):** Sistem menyediakan halaman antarmuka login khusus Administrator dengan input Nama Pengguna (username) dan Kata Sandi (password).

-   **FR-AUTH-02 (Verifikasi Bcrypt):** Sistem memvalidasi kredensial login dengan mencocokkan kata sandi terenkripsi menggunakan algoritma Bcrypt (minimal 10 salt rounds).

-   **FR-AUTH-03 (Proteksi Rute Middleware):** Sistem menerapkan Next.js Middleware untuk melindungi seluruh rute private (/dashboard/\*, /barang/\*, /sirkulasi/\*). Setiap permintaan rute tanpa cookie sesi valid dialihkan paksa ke halaman login.

-   **FR-AUTH-04 (Penghapusan Sesi Logout):** Sistem menyediakan tombol Keluar (Logout) yang secara aman menghapus cookie sesi otentikasi dari peramban dan mengarahkan pengguna ke halaman login.

**4.2 Modul Master Data Barang / CRUD Aset (Dev 2)**

-   **FR-ITEM-01 (Pencatatan Barang Baru):** Admin dapat menambahkan aset baru melalui modal dialog form dengan data wajib: Kode Barang (unik), Nama Barang, Kategori, Total Stok, Lokasi Penyimpanan, dan Kondisi Fisik.

-   **FR-ITEM-02 (Inisialisasi Stok Tersedia):** Saat aset baru disimpan, sistem secara otomatis menginisialisasi nilai kuota tersedia (availableQuantity) sama dengan kuota total barang (totalQuantity).

-   **FR-ITEM-03 (Ubah Informasi Barang):** Admin dapat memperbarui spesifikasi barang (nama, kategori, lokasi rak, kondisi fisik aset).

-   **FR-ITEM-04 (Validasi Kuota Total vs Dipinjam):** Sistem melarang keras perubahan kuota total barang (totalQuantity) menjadi lebih kecil dari jumlah unit barang yang sedang aktif dipinjam oleh staf.

-   **FR-ITEM-05 (Proteksi Hapus Aset Terikat):** Sistem menolak penghapusan data master aset jika barang tersebut memiliki catatan riwayat peminjaman yang aktif atau belum diselesaikan (kebijakan integritas relasi onDelete: Restrict).

**4.3 Modul Transaksi Sirkulasi & Stok Atomik (Dev 3)**

-   **FR-TRX-01 (Input Transaksi Peminjaman):** Admin dapat mencatat peminjaman baru dengan memilih aset, memasukkan nama staf peminjam, nomor kontak (WhatsApp), jumlah unit yang dipinjam, tanggal pinjam, tenggat pengembalian, dan catatan keperluan.

-   **FR-TRX-02 (Validasi Batas Stok Siap Pakai):** Sistem menolak penyimpanan transaksi jika jumlah unit yang diajukan (borrowQuantity) bernilai kurang dari 1 atau melebihi kuota stok tersedia (availableQuantity).

-   **FR-TRX-03 (Atomisitas Peminjaman Stok):** Sistem mengeksekusi pencatatan transaksi peminjaman (status: DIPINJAM) dan pemotongan availableQuantity secara atomik dalam satu blok transaksi Prisma (\$transaction).

-   **FR-TRX-04 (Pemrosesan Pengembalian Fisik):** Admin dapat memproses pengembalian barang fisik dengan menekan aksi pengembalian, mencatat tanggal aktual kembali, serta memperbarui kondisi fisik barang saat diserahkan.

-   **FR-TRX-05 (Atomisitas Pemulihan Stok):** Sistem memperbarui status transaksi menjadi DIKEMBALIKAN dan menambah kembali kuota availableQuantity secara atomik via Prisma (\$transaction).

-   **FR-TRX-06 (Deteksi Keterlambatan Sirkulasi):** Sistem secara otomatis mendeteksi dan memberi tanda visual (badge status TERLAMBAT) jika tanggal hari ini melampaui tenggat tanggal kembali (dueDate) dan barang belum dikembalikan.

**4.4 Modul Dasbor, Tabel Interaktif & Filter (Dev 4)**

-   **FR-UI-01 (Kartu Ringkasan Metrik):** Menampilkan kartu metrik statistik pada halaman utama: Total Jenis Aset, Total Unit Fisik, Unit Sedang Dipinjam, dan Unit Siap Pakai.

-   **FR-UI-02 (Tabel Interaktif Shadcn UI):** Menampilkan seluruh data master aset dan riwayat transaksi sirkulasi dalam bentuk tabel interaktif dengan tata letak responsif.

-   **FR-UI-03 (Pencarian Cepat Live Search):** Menyediakan fitur pencarian langsung (live search dengan teknik debounce) berdasarkan nama barang dan kode inventaris tanpa memuat ulang (reload) peramban.

-   **FR-UI-04 (Penyaringan Kategori & Status):** Menyediakan menu filter pemilihan berdasarkan kategori barang, kondisi fisik aset (Baik, Rusak Ringan, Rusak Berat), dan status sirkulasi.

-   **FR-UI-05 (Umpan Balik Visual Toast):** Menyediakan umpan balik visual instan (toast notification) untuk setiap aksi penambahan, pembaruan, maupun pesan kesalahan validasi menggunakan bahasa Indonesia baku.

**BAB 5: KEBUTUHAN NON-FUNGSIONAL (NON-FUNCTIONAL REQUIREMENTS)**

  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **Kode NFR**            **Parameter Kualitas**        **Spesifikasi Standar yang Wajib Dipenuhi**
  ----------------------- ----------------------------- ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------
  **NFR-PERF-01**         Kinerja & Waktu Respon        Eksekusi Server Actions pada lingkungan lokal wajib diselesaikan dalam waktu kurang dari 300 ms untuk seluruh operasi pembacaan dan penyimpanan data.

  **NFR-SEC-01**          Keamanan Sandi & Sesi         Kata sandi Admin wajib di-hash menggunakan algoritma Bcrypt (10 salt rounds). Nilai plain text tidak boleh tercatat dalam database atau log server.

  **NFR-REL-01**          Integritas Transaksi (ACID)   Seluruh mutasi peminjaman dan pengembalian stok wajib memenuhi kriteria ACID melalui blok prisma.\$transaction demi mencegah kesalahan selisih stok (zero stock mismatch).

  **NFR-ENV-01**          Kompatibilitas Runtime        Aplikasi berjalan penuh pada Node.js LTS (v18.17 ke atas) dan MySQL Server v8.0 / MariaDB pada lingkungan operasional lokal (port 3000).

  **NFR-USAB-01**         Usabilitas & Aksesibilitas    Seluruh elemen antarmuka, dialog konfirmasi penghapusan data, dan pesan validasi input wajib disajikan dalam bahasa Indonesia baku yang lugas.
  ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

**BAB 6: SPESIFIKASI BASIS DATA & KAMUS DATA (MYSQL)**

**6.1 Kamus Data Entitas Pengguna (Tabel: users)**

Menyimpan akun kredensial Administrator internal BPTI UHAMKA:

  -------------------------------------------------------------------------------------------------------------------
  **Nama Kolom**          **Tipe Data**   **Constraint**     **Keterangan Fungsi**                     **PIC**
  ----------------------- --------------- ------------------ ----------------------------------------- --------------
  id                      VARCHAR(36)     PK, NOT NULL       Pengenal unik akun Admin (UUID v4)        Dev 1

  username                VARCHAR(191)    UNIQUE, NOT NULL   Nama pengguna untuk autentikasi login     Dev 1

  password                VARCHAR(255)    NOT NULL           Hash kata sandi terenkripsi (Bcrypt)      Dev 1

  name                    VARCHAR(191)    NOT NULL           Nama lengkap petugas Administrator BPTI   Dev 1

  createdAt / updatedAt   DATETIME(3)     NOT NULL           Waktu pembuatan dan pembaruan akun        Dev 1
  -------------------------------------------------------------------------------------------------------------------

**6.2 Kamus Data Entitas Master Barang (Tabel: items)**

Menyimpan data master katalog barang fisik kantor BPTI:

  ------------------------------------------------------------------------------------------------------------------------------------------------
  **Nama Kolom**          **Tipe Data**   **Constraint**               **Keterangan Fungsi**                                        **PIC**
  ----------------------- --------------- ---------------------------- ------------------------------------------------------------ --------------
  id                      VARCHAR(36)     PK, NOT NULL                 Pengenal unik data barang (UUID v4)                          Dev 2

  code                    VARCHAR(191)    UNIQUE, NOT NULL             Kode inventaris barang kantor (misal: INV-001)               Dev 2

  name                    VARCHAR(191)    NOT NULL                     Nama deskriptif aset inventaris                              Dev 2

  category                VARCHAR(191)    NOT NULL                     Kelompok aset (Elektronik, Jaringan, Kabel, dll)             Dev 2

  totalQuantity           INT             NOT NULL, \>= 0              Jumlah total keseluruhan aset fisik yang dimiliki            Dev 2

  availableQuantity       INT             NOT NULL, \>= 0              Jumlah unit aset yang siap dan tidak dipinjam                Dev 2

  location                VARCHAR(191)    NOT NULL                     Lokasi penempatan barang (Rak Gudang, Server, dll)           Dev 2

  condition               ENUM            NOT NULL, DEFAULT \'BAIK\'   Status fisik (\'BAIK\', \'RUSAK_RINGAN\', \'RUSAK_BERAT\')   Dev 2

  createdAt / updatedAt   DATETIME(3)     NOT NULL                     Timestamp pencatatan dan pemutakhiran data aset              Dev 2
  ------------------------------------------------------------------------------------------------------------------------------------------------

**6.3 Kamus Data Entitas Transaksi Sirkulasi (Tabel: borrow_records)**

Menyimpan transaksi sirkulasi peminjaman dan pengembalian barang:

  ----------------------------------------------------------------------------------------------------------------------------------------------------------
  **Nama Kolom**          **Tipe Data**   **Constraint**                   **Keterangan Fungsi**                                              **PIC**
  ----------------------- --------------- -------------------------------- ------------------------------------------------------------------ --------------
  id                      VARCHAR(36)     PK, NOT NULL                     Pengenal unik transaksi peminjaman (UUID v4)                       Dev 3

  borrowCode              VARCHAR(191)    UNIQUE, NOT NULL                 Kode transaksi peminjaman (misal: TRX-2026-001)                    Dev 3

  itemId                  VARCHAR(36)     FK, NOT NULL, Restrict           Kunci asing merujuk ke tabel items(id)                             Dev 3

  borrowerName            VARCHAR(191)    NOT NULL                         Nama lengkap staf / unit kerja peminjam                            Dev 3

  borrowerContact         VARCHAR(191)    NOT NULL                         Nomor telepon / kontak WhatsApp staf peminjam                      Dev 3

  borrowQuantity          INT             NOT NULL, \> 0                   Jumlah unit barang yang dipinjam                                   Dev 3

  borrowDate              DATETIME(3)     NOT NULL, DEFAULT NOW            Waktu dan tanggal barang diserahkan                                Dev 3

  dueDate                 DATETIME(3)     NOT NULL                         Batas waktu (tenggat) barang harus kembali                         Dev 3

  returnDate              DATETIME(3)     NULLABLE                         Waktu aktual barang diserahkan kembali fisik                       Dev 3

  status                  ENUM            NOT NULL, DEFAULT \'DIPINJAM\'   Status sirkulasi (\'DIPINJAM\', \'DIKEMBALIKAN\', \'TERLAMBAT\')   Dev 3

  returnCondition         ENUM            NULLABLE                         Kondisi fisik barang pasca pengembalian                            Dev 3

  notes                   TEXT            NULLABLE                         Catatan rincian keperluan peminjaman barang                        Dev 3

  createdAt / updatedAt   DATETIME(3)     NOT NULL                         Timestamp pencatatan dan perubahan status transaksi                Dev 3
  ----------------------------------------------------------------------------------------------------------------------------------------------------------

**6.4 Kode Skema Prisma Lengkap (schema.prisma)**

  -----------------------------------------------------------------------------------
  datasource db {\
  provider = \"mysql\"\
  url = env(\"DATABASE_URL\")\
  }\
  \
  generator client {\
  provider = \"prisma-client-js\"\
  }\
  \
  enum Condition {\
  BAIK\
  RUSAK_RINGAN\
  RUSAK_BERAT\
  }\
  \
  enum BorrowStatus {\
  DIPINJAM\
  DIKEMBALIKAN\
  TERLAMBAT\
  }\
  \
  model User {\
  id String \@id \@default(uuid())\
  username String \@unique\
  password String\
  name String\
  createdAt DateTime \@default(now())\
  updatedAt DateTime \@updatedAt\
  \
  @@map(\"users\")\
  }\
  \
  model Item {\
  id String \@id \@default(uuid())\
  code String \@unique\
  name String\
  category String\
  totalQuantity Int\
  availableQuantity Int\
  location String\
  condition Condition \@default(BAIK)\
  createdAt DateTime \@default(now())\
  updatedAt DateTime \@updatedAt\
  borrowRecords BorrowRecord\[\]\
  \
  @@map(\"items\")\
  }\
  \
  model BorrowRecord {\
  id String \@id \@default(uuid())\
  borrowCode String \@unique\
  itemId String\
  item Item \@relation(fields: \[itemId\], references: \[id\], onDelete: Restrict)\
  borrowerName String\
  borrowerContact String\
  borrowQuantity Int\
  borrowDate DateTime \@default(now())\
  dueDate DateTime\
  returnDate DateTime?\
  status BorrowStatus \@default(DIPINJAM)\
  returnCondition Condition?\
  notes String? \@db.Text\
  createdAt DateTime \@default(now())\
  updatedAt DateTime \@updatedAt\
  \
  @@map(\"borrow_records\")\
  }
  -----------------------------------------------------------------------------------

  -----------------------------------------------------------------------------------

**BAB 7: LOGIKA ATURAN BISNIS & KONTRAK SERVER ACTIONS**

**7.1 SOP Transaksi Peminjaman (Dev 3 & Dev 2)**

1\. Staf mendatangi kantor BPTI untuk meminjam barang secara fisik.\
2. Admin membuka modal peminjaman dan memilih barang berdasarkan nama/kode inventaris.\
3. Sistem memeriksa apakah unit barang tersedia: borrowQuantity \<= availableQuantity. Jika kuota tidak cukup, sistem langsung mengembalikan pesan galat dan transaksi dibatalkan.\
4. Jika kuota valid, Server Action mengeksekusi prisma.\$transaction:\
\* Membuat record transaksi baru pada tabel borrow_records dengan status DIPINJAM.\
\* Mengurangi availableQuantity pada tabel items sejumlah unit yang dipinjam.\
5. Sistem menampilkan notifikasi sukses dan tabel diperbarui secara reaktif.

**7.2 SOP Transaksi Pengembalian Barang (Dev 3)**

1\. Staf mengembalikan barang secara fisik ke kantor BPTI.\
2. Admin memeriksa kelayakan fisik barang (kondisi: Baik, Rusak Ringan, atau Rusak Berat).\
3. Admin menekan tombol \'Kembalikan\' pada baris transaksi aktif.\
4. Server Action mengeksekusi prisma.\$transaction:\
\* Memperbarui status transaksi menjadi DIKEMBALIKAN, mencatat returnDate aktual, dan mencatat returnCondition.\
\* Menambah kembali availableQuantity pada tabel items sejumlah unit yang dikembalikan.\
5. Sistem menyegarkan data tabel dan menampilkan notifikasi keberhasilan.

**7.3 Logika Proteksi Integritas Data Master**

-   **Proteksi Penurunan Kuota Total:** Admin tidak dapat mengubah totalQuantity menjadi lebih kecil dari unit yang sedang aktif berstatus DIPINJAM.

-   **Proteksi Penghapusan Aset Aktif:** Operasi penghapusan data master barang dicegah secara mutlak (onDelete: Restrict) jika barang tersebut memiliki relasi catatan peminjaman aktif.

**BAB 8: SARAN PENGEMBANGAN LANJUTAN**

Berdasarkan analisis kebutuhan dan efisiensi waktu pelaksanaan PKL, fitur-fitur berikut tidak diimplementasikan pada rilis awal, namun direkomendasikan sebagai bahan pertimbangan pengembangan lanjutan oleh BPTI UHAMKA:

-   **Portal Pegawai (Self-Service Viewer):** Halaman antarmuka khusus staf kampus untuk melihat ketersediaan inventaris dan mengajukan reservasi secara mandiri.

-   **Single Sign-On (SSO) UHAMKA:** Integrasi login menggunakan akun Google Workspace institusi UHAMKA.

-   **Ekspor Laporan Otomatis:** Modul pencetakan laporan bulanan dan rekapitulasi ke dalam format Microsoft Excel (.xlsx) dan dokumen PDF resmi.

-   **Labelisasi Barcode / QR Code Fisik:** Pembuatan dan pencetakan label stiker kode QR fisik untuk ditempelkan pada masing-masing barang.
