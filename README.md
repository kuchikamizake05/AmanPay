# AmanPay - Deal OS & Programmable Rekber (Escrow)

**AmanPay turns messy chat deals into mutually approved, escrow-backed transactions.**

AmanPay adalah Deal OS dan *programmable rekber* untuk transaksi digital informal (freelance, jual-beli template/akun/file digital) lintas platform. AmanPay membantu buyer dan seller menyusun kesepakatan yang berantakan dari chat (WhatsApp, Telegram, X, Discord) menjadi transaksi terstruktur yang dijamin oleh Soroban smart contract di Stellar Testnet.

---

## 🌟 Fitur Utama

1. **Hybrid AI Deal Parser**:
   - Pengguna cukup menyalin obrolan kesepakatan informal, lalu parser mengekstrak parameter penting secara otomatis (tipe deal, judul, harga/nominal, tenggat waktu, deliverables, dan batas revisi).
   - Menggunakan model **Gemini 1.5 Flash** dengan schema terstruktur (`responseSchema`), dengan fallback otomatis ke parser regex lokal jika kunci API tidak terpasang.
2. **Soroban Smart Contract Escrow**:
   - Escrow non-custodial yang mengunci dana di blockchain. Pembayaran dilepaskan/dikembalikan hanya berdasarkan transisi state, persetujuan eksplisit, atau aturan batas waktu (*timeout*).
3. **Wallet Simulator (Zero-Extension Demo)**:
   - Memungkinkan pengujian transaksi Soroban nyata di testnet secara langsung tanpa harus memasang Freighter extension. Kunci generator, auto-funding lewat Friendbot, dan local signing diatur di latar belakang.
4. **Verified Profile & Public Receipts**:
   - Setiap transaksi yang berhasil diselesaikan menerbitkan resi publik terverifikasi yang dapat dibagikan ke media sosial (WhatsApp/Telegram-ready share).
   - Halaman profil publik menampilkan rekam jejak tepercaya berdasarkan statistik jumlah transaksi sukses, sengketa (disputes), dan volume transaksi yang berhasil.

---

## 🛠️ Project Structure

```text
├── contract/amanpay-escrow/   # Soroban Rust smart contract
│   ├── src/
│   │   ├── lib.rs            # Core contract entrypoints & state transitions
│   │   ├── types.rs          # Escrow structures, statuses & enums
│   │   └── test.rs           # 18 unit tests & security invariants
├── fe/                       # Next.js App Router frontend
│   ├── src/
│   │   ├── app/              # Page layouts & API endpoints
│   │   ├── components/       # Layout headers & global wrappers
│   │   ├── features/         # Feature-driven modules (deals, wallet, dashboard)
│   │   └── lib/              # Stellar helper clients & Supabase connection
│   └── vitest.setup.ts       # Vitest setup configuration
└── supabase/migrations/      # Database off-chain migrations for metadata & events
```

---

## 🚀 Persiapan & Instalasi Lokal

### 1. Smart Contract (Rust & WASM)
Pastikan Anda memiliki Rust, wasm target, dan Stellar CLI versi terbaru.

Jalankan perintah berikut untuk memformat kode, menjalankan test kontrak pintar, dan melakukan kompilasi file WASM:
```bash
cd contract/amanpay-escrow
cargo test -p amanpay-escrow
stellar contract build
```
File hasil build akan berada di `target/wasm32v1-none/release/amanpay_escrow.wasm`.

### 2. Database Migrations (Supabase)
Terapkan migration SQL yang ada di folder `supabase/migrations/` pada project database Supabase Anda untuk menginisialisasi tabel-tabel metadata, timeline events, deliveries, dan private notes.

### 3. Frontend Next.js
Pindah ke folder `fe`, salin contoh file environment, instal dependensi, dan jalankan server pengembangan:
```bash
cd fe
cp .env.example .env.local
npm install
npm run dev
```

#### Pengisian Environment `.env.local`
Isi variabel-variabel berikut di file `.env.local` Anda:
```env
# Stellar Deployment Configuration
NEXT_PUBLIC_AMANPAY_CONTRACT_ID=CDY2ANSND433R2QPOZXUNFXEZU5H5KGJHEFR5EVQL5PST2XJINYZPO52
NEXT_PUBLIC_DEFAULT_RESOLVER=GBUYER...   # Alamat wallet resolver (pihak ketiga pemutus dispute)
STELLAR_READ_SOURCE=GSELLER...          # Akun Stellar CLI testnet untuk kueri internal

# Supabase Configurations
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Optional AI API Key (Gemini)
GEMINI_API_KEY=your-gemini-api-key
```

---

## 🧪 Pengujian Unit & Integrasi (Vitest)

Frontend AmanPay memiliki cakupan pengujian unit yang sangat luas (29 unit tests lulus 100% green) mencakup parser teks, autentikasi session cookie, stable hash metadata kanonikal, decoder soroban, dan resi share message formatters.

Jalankan pengujian unit dari folder `fe`:
```bash
npm run test
```

---

## ⚡ Deployment Testnet Terverifikasi

Aplikasi ini berinteraksi langsung dengan Soroban Escrow Contract yang telah dideploy di Stellar Testnet:

- **AmanPay Escrow Contract**: [`CDY2ANSND433R2QPOZXUNFXEZU5H5KGJHEFR5EVQL5PST2XJINYZPO52`](https://stellar.expert/explorer/testnet/contract/CDY2ANSND433R2QPOZXUNFXEZU5H5KGJHEFR5EVQL5PST2XJINYZPO52)
- **Native XLM SAC Address**: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- **Mock USDC SAC Address**: `CD72G634XB5BMTMGJ43ER7Q5QLEYX7XGS6JT7BOMDJTOGTBL3EP4JD66`

---

## 📖 Skenario Uji Coba (Demo Walkthrough)

Anda dapat dengan mudah mendemokan siklus transaksi rekber AmanPay menggunakan **Wallet Simulator**:

1. **Aktivasi Seller**:
   - Buka aplikasi lokal Anda (`http://localhost:3000`).
   - Di pojok kanan bawah, klik tombol **"Simulasikan Seller"** pada panel Simulator. Klien akan secara otomatis mendaftarkan wallet seller baru dan menyuntikkan saldo XLM via Friendbot.
2. **Autofill Kesepakatan**:
   - Masuk ke halaman **Buat Deal** (`/deals/new`).
   - Klik salah satu template cepat (contoh: ** Jasa Web Design**) untuk menempel teks kesepakatan informal.
   - Klik **"Analisis Kesepakatan"**, periksa pratinjau data terstruktur, lalu klik **"Terapkan ke Form"**.
   - Isi alamat wallet buyer simulator Anda (misal klik "Simulasikan Buyer" sebentar untuk menyalin alamatnya, lalu kembali ke Seller).
   - Klik **"Review & buat deal"**, lalu tandatangani transaksi. Anda akan dialihkan ke halaman detail deal yang baru dibuat dengan status "Created".
3. **Funding oleh Buyer**:
   - Klik **"Simulasikan Buyer"** di panel Simulator untuk beralih peran secara instan.
   - Buka halaman link detail deal tadi, klik **"Accept & Fund Escrow"**. Status deal akan berubah menjadi "Funded" dan saldo XLM buyer akan terkunci aman di dalam escrow.
4. **Pengiriman oleh Seller**:
   - Alihkan kembali peran simulator ke **Seller**.
   - Di panel aksi, klik **"Submit Delivery"**, masukkan link google drive/github beserta catatan pengiriman, lalu submit. Status deal berubah menjadi "Delivered".
5. **Pelepasan Dana (Release)**:
   - Alihkan peran simulator kembali ke **Buyer**.
   - Periksa lampiran pengiriman seller, lalu klik **"Approve & Release"**.
   - Transaksi diproses di blockchain testnet, memindahkan saldo dari contract escrow ke dompet seller secara langsung. Status deal berubah menjadi "Released" (selesai).
6. **Resi & Profil**:
   - Klik tombol **"Buka Resi Publik"** yang muncul di halaman detail. Anda akan melihat serrated card receipt yang memuat hash bukti blockchain, terms, dan tombol bagikan cepat ke WhatsApp/Telegram.
   - Klik tautan alamat wallet di detail pihak deal untuk memeriksa riwayat reputasi transaksi sukses di halaman **Profil**.
