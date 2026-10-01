# 23-threat-model.md — Threat Model & Attack Surface
# BPTI Inventory & Asset Management System

**Snapshot diaudit:** v4 (`bpti-project-main__1_.zip`, 2026-09-24) — lihat `README.md` §1
**Mencakup Blueprint #23 (Threat Model), #24 (Attack Surface), dan status implementasi `SRS.md` §23 NFR-SEC-001..010.**
**Legenda status:** lihat `README.md` §2. Dua klaim di dokumen ini `[VERIFIED]` terhadap dokumentasi resmi eksternal (dicek langsung ke sumbernya, bukan diasumsikan dari ingatan) — ditandai eksplisit di §3.

---

## 1. Aktor & batas kepercayaan (trust boundary)

| Aktor | Deskripsi |
|---|---|
| Pengunjung tak-terautentikasi | Siapa pun yang mengakses domain aplikasi tanpa sesi valid |
| Pengguna terautentikasi (6 peran) | Login berhasil lewat `/login` — lihat `22-authorization-matrix.md` untuk matriks lengkap |
| Aktor jahat internal | Pengguna sah dengan peran rendah (mis. `VIEWER`) yang mencoba mengakses data di luar kewenangannya lewat browser biasa (bukan exploit teknis) |
| Operator database lokal | Siapa pun yang punya akses ke `DATABASE_URL`/kredensial MySQL — lihat §5 |

```mermaid
graph LR
    subgraph "Tidak Dipercaya"
        B["Browser Pengguna"]
    end
    subgraph "Batas Kepercayaan 1: Edge"
        MW["middleware.ts<br/>cek keberadaan cookie"]
    end
    subgraph "Batas Kepercayaan 2: Server Runtime"
        RSC["Server Components<br/>(BACA — tanpa cek peran)"]
        SA["Server Actions<br/>(TULIS — requirePermission)"]
        API["/api/reports/export<br/>(requirePermission)"]
    end
    subgraph "Dipercaya Penuh"
        DB[("MySQL")]
    end
    B -->|HTTPS| MW --> RSC & SA & API
    RSC --> DB
    SA --> DB
    API --> DB
```

## 2. Titik masuk (entry points) — lengkap, diverifikasi lewat `find`/`grep`

| Titik masuk | Jenis | Proteksi saat ini |
|---|---|---|
| `POST /api/auth/[...all]` | Route Handler (Better Auth internal) | Ditangani penuh oleh Better Auth |
| `/login` (Server Action `sign-in` via `authClient`) | Form submit | Rate-limit: lihat §4 T4 |
| 10 Server Action (`actions/*.ts`) | Mutasi | `requirePermission` → Zod → service |
| `GET /api/reports/export?type=X` | Route Handler | `requirePermission(REPORT_EXPORT)`, **tanpa Zod** pada query param `type`/filter (perlu diverifikasi lebih lanjut apakah `type` divalidasi terhadap daftar enum yang diizinkan sebelum dipakai membangun query) |
| 9 halaman `app/*/page.tsx` | Server Component (baca) | **Hanya `middleware.ts`** (cek keberadaan cookie) — lihat T1 |

## 3. Klarifikasi teknis penting — hasil verifikasi eksternal, bukan asumsi

Dua fakta berikut awalnya berpotensi disalahpahami; masing-masing sudah diverifikasi terhadap dokumentasi resmi sebelum dipakai sebagai dasar analisis di bawah:

- **`[VERIFIED]` Next.js Server Actions punya proteksi CSRF bawaan** — memverifikasi header `Origin` terhadap host yang diizinkan secara otomatis untuk setiap pemanggilan Server Action, tanpa konfigurasi tambahan (berlaku sejak Next.js 14+, dikonfirmasi dari dokumentasi resmi Next.js). **Implikasi:** ke-10 Server Action di aplikasi ini sudah punya lapisan CSRF tanpa perlu kode tambahan — bukan gap.
- **`[VERIFIED]` Cookie sesi Better Auth ditandatangani (signed) dan diverifikasi ulang lewat `auth.api.getSession()`** — dikonfirmasi dari dokumentasi resmi Better Auth (cookie sesi `httpOnly`, dan di mode produksi `secure`, dengan tanda tangan berbasis `BETTER_AUTH_SECRET`). **Implikasi penting:** cookie palsu/rekaan tidak akan lolos `getCurrentUser()`/`requirePermission()` — jadi **T1 di bawah bukan soal "cookie bisa dipalsukan"**, melainkan murni soal **tidak adanya pemeriksaan peran pada jalur baca**, yang berlaku sama untuk sesi asli sekalipun.

## 4. Ancaman terverifikasi

### 🔴 T1 — Tidak ada pemeriksaan otorisasi berbasis peran pada 9 halaman baca
**Bukti:** `grep -rn "requirePermission(\|requireAuth(\|getCurrentUser(" src/app` = 0 hasil, diverifikasi ulang pada snapshot v4 (tidak berubah sejak v2 — tiga iterasi kode berturut-turut tidak menyentuh ini).
**Skenario konkret:** akun `VIEWER` (dimaksudkan `SRS.md` §9.6 untuk "restricted read-only information", dan `rbac.ts` memang hanya memberinya `inventory.read`/`asset.read`/`monitoring.read`) login sah dengan sesi valid, lalu mengetik URL `/users`, `/audit`, atau `/reports` langsung di address bar — dan **berhasil melihat data penuh yang sama seperti `SUPER_ADMIN`**, termasuk daftar seluruh pengguna sistem dan log audit (siapa mengubah apa, kapan).
**Kelas OWASP:** Broken Access Control (A01:2021) — spesifiknya *missing function/row-level authorization*, bukan *broken authentication* (lihat §3).
**Terkait:** `NFR-SEC-003`, `NFR-SEC-006` (IDOR/BOLA); `AGENTS.md` §39.
**Status mitigasi:** ❌ belum ada, di tiga snapshot berturut-turut. Ini satu-satunya temuan keamanan besar yang belum tersentuh sejak v2 — lihat `README.md` §4a.

### 🟡 T2 — `maintenance.approve` dipegang MANAGER tapi tidak pernah bisa dipakai
Bukan celah keamanan (arahnya *fail-closed* — MANAGER kehilangan kemampuan, bukan mendapat akses berlebih), tapi bug otorisasi yang nyata. Detail lengkap di `22-authorization-matrix.md` §3.

### 🟢 T3 — Kredensial admin default ditampilkan sebagai teks biasa di halaman login
**Bukti:** `login/page.tsx` sebelumnya menampilkan `admin@uhamka.ac.id` / `AdminBpti2026!` langsung di UI. Identik dengan yang ditulis `prisma/seed.ts`.
**Dampak:** Nyaman untuk demo internal tim, tapi harus disembunyikan di balik pemeriksaan `NODE_ENV !== "production"` sebelum demo ke mentor atau deployment nyata mana pun.

### 🔴 T4 — Tidak ada rate limiting pada `/login`
**Bukti:** Tidak ditemukan middleware/pustaka rate-limiting apa pun (`grep -rn "rate-limit\|rateLimit\|ratelimit"` = 0 hasil di seluruh `src/`, `next.config.ts`). Better Auth sendiri **tidak** menyediakan rate-limiting bawaan untuk `emailAndPassword` sign-in secara default — ini perlu ditambahkan eksplisit (plugin/middleware terpisah) kalau diinginkan.
**Dampak:** Akun mana pun (termasuk admin default di T3) rentan terhadap percobaan *brute-force*/*credential stuffing* tanpa pembatasan.
**Terkait:** `SRS.md` §42 mendaftar "Rate limiting reviewed" sebagai item checklist keamanan — status `[OPEN]`, belum ada keputusan tercatat.

### 🟡 T5 (BARU sejak v4) — Kredensial database di-hardcode sebagai fallback di source code
**Bukti:** `prisma.config.ts:6-8` dan `prisma/seed.ts:6-10` — `process.env.DATABASE_URL || "mysql://bpti_user:bpti_secret_2026@localhost:3306/bpti_db"`.
**Kelas OWASP:** A05:2021 (Security Misconfiguration) — *hardcoded credentials* adalah salah satu contoh baku kategori ini.
**Dampak:** Rendah untuk database lokal murni; risiko naik kalau developer lain meng-clone repo dan lupa mengganti env var sebelum konek ke instance non-lokal, atau kalau repo ini di-*publish* untuk portofolio tanpa membersihkan riwayat git.
**Rekomendasi:** Hapus fallback string-nya — biarkan aplikasi gagal eksplisit (`throw`) kalau `DATABASE_URL` tidak diset.

### 🟡 T6 — Tiket maintenance bisa dibuka untuk aset yang seharusnya sudah keluar sirkulasi
Sudah dijelaskan penuh sebagai BR-016 di `04-business-rules.md` — dicantumkan di sini sebagai kelas *Tampering*/business-logic abuse dalam kerangka STRIDE, bukan celah akses.

### 🟢 T7 — Integritas `AuditLog` bertumpu pada konvensi kode, bukan jaminan level-database
**Bukti:** Tidak ada trigger/constraint database yang mencegah `UPDATE`/`DELETE` pada `AuditLog` — integritasnya sepenuhnya bergantung pada fakta bahwa tidak ada kode aplikasi yang melakukan itu (`04-business-rules.md` BR-021).
**Status:** Cukup untuk kebutuhan saat ini (audit trail internal). Kalau ke depannya dibutuhkan tamper-evidence yang lebih kuat (mis. untuk kebutuhan kepatuhan/compliance), pertimbangkan hash-chaining antar baris — dicatat sebagai `[FUTURE]`/`[OPTIONAL]`, bukan gap yang mendesak.

### 🟢 T8 — Ekspor CSV mengakses 5 model lintas-modul langsung, termasuk `AuditLog`
`api/reports/export/route.ts` (lihat `13-module-boundaries.md` §5) sudah dilindungi `requirePermission(REPORT_EXPORT)` dengan benar (dipegang `SUPER_ADMIN`/`INVENTORY_ADMIN`/`MANAGER`). Dicatat di sini sebagai *data aggregation point* yang layak diperhatikan kalau kebijakan privasi/kerahasiaan berubah di masa depan (mis. kalau `AuditLog` suatu saat menyimpan data lebih sensitif) — bukan gap saat ini.

## 5. Status implementasi `SRS.md` §23 (NFR-SEC-001..010) — ringkas

| ID | Status per v4 |
|---|---|
| NFR-SEC-001 (HTTPS) | `[TBD]` di SRS sendiri — bergantung hosting produksi yang belum dipilih |
| NFR-SEC-002 (Password hashing) | ✅ Terpenuhi — `better-auth/crypto` untuk seluruh User (admin & baru) |
| NFR-SEC-003 (Authorization server-side) | ⚠️ Terpenuhi untuk mutasi (10/10 action), **tidak terpenuhi untuk baca** (T1) |
| NFR-SEC-006 (IDOR/BOLA) | ❌ Belum — langsung berkaitan dengan T1 |
| Rate limiting (checklist §42) | ❌ Belum (T4) |
| Secrets hygiene | ⚠️ Sebagian — `.env.example` bersih, tapi lihat T5 |

## 6. Prioritas mitigasi (gabungan dengan `22-authorization-matrix.md` §5)

1. **T1** — tambahkan `getCurrentUser()`+`hasPermission()` di seluruh 9 halaman baca. Ini satu-satunya temuan yang polanya bisa diterapkan seragam ke semua halaman sekaligus (bukan 9 perbaikan berbeda).
2. **T4** — tambahkan rate limiting pada `/login` sebelum aplikasi diakses dari luar jaringan lokal/kampus.
3. **T5** — hapus fallback kredensial hardcoded (perbaikan satu baris, risiko rendah tapi murah untuk diperbaiki sekarang).
4. **T3** — sembunyikan kredensial default di balik flag environment sebelum demo ke mentor.
