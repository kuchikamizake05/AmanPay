# Phase 2 — Frontend Basic Flow

## Summary

Bangun frontend Next.js di `fe/` dengan TypeScript, Tailwind CSS, Supabase minimal, dan Stellar Wallets Kit. UI berbahasa Indonesia dengan gaya rekber modern: ramah pengguna non-crypto dan tetap menyediakan detail blockchain sebagai informasi lanjutan.

Phase 2 selesai ketika pengguna dapat menghubungkan wallet, membuat deal nyata di testnet, membuka link deal publik, serta melihat dashboard berdasarkan wallet.

## Implementation Changes

- Buat landing page tiga bagian: problem/value AmanPay, cara kerja escrow, dan CTA membuat deal.
- Buat create flow adaptif untuk `Service`, `DigitalGoods`, dan `Custom`.
  - Wallet aktif otomatis menjadi seller dan tidak dapat diedit.
  - Buyer wajib berbeda dari seller.
  - Resolver memakai default environment tetapi dapat diedit.
  - Asset selector menyediakan native XLM dan mock USDC dari deployment Phase 1.
  - Deadline, review period, revision limit, dan revision period tersedia dengan preset yang dapat diedit.
- Buat canonical metadata schema versi 1 berisi network, contract ID, tipe deal, title, description, seluruh pihak, asset, amount dalam stroops, deadline, dan aturan review/revisi.
  - Serialize menggunakan stable key ordering dan UTF-8.
  - Hash dengan SHA-256 menjadi `terms_hash`.
  - Tampilkan ringkasan final sebelum wallet menandatangani `create_deal`.
- Integrasikan Stellar Wallets Kit dengan testnet-only guard, reconnect session, account/network validation, simulasi transaksi, signing, submission, polling confirmation, dan pencegahan double-submit.
- Generate atau gunakan typed TypeScript contract bindings agar encoding enum, `i128`, `u64`, address, dan `BytesN<32>` tidak ditulis manual di komponen UI.
- Setelah transaksi berhasil, ambil deal ID dari return value lalu registrasikan metadata ke Supabase. Registrasi dapat diulang jika transaksi sukses tetapi penyimpanan metadata gagal.

## Pages, Data, and Interfaces

- `/` — landing page.
- `/deals/new` — preset selector, form, review terms, dan create transaction.
- `/deals/[id]` — halaman publik yang menggabungkan data contract dan metadata serta menampilkan status, buyer/seller role, nominal, deadline, resolver, terms hash, dan explorer link.
- `/dashboard` — daftar deal Supabase tempat wallet terhubung menjadi buyer atau seller.
- `POST /api/deals/register`
  - Input: contract deal ID, transaction hash, dan canonical metadata.
  - Server membaca deal testnet, menghitung ulang hash, memverifikasi seller/asset/amount/parties, lalu menyimpan record immutable.
  - Duplicate identik bersifat idempotent; konflik metadata ditolak.
- `GET /api/deals/[id]`
  - Membaca `get_deal` melalui RPC tanpa mengharuskan pengunjung connect wallet.
  - Menggabungkan metadata Supabase dan mengembalikan `termsHashVerified`.
- Supabase menyediakan tabel `deals` dengan unique key `(network, contract_id, contract_deal_id)`. Data deal dapat dibaca publik; penulisan hanya melalui server route setelah verifikasi on-chain.
- Environment mencakup RPC URL, network passphrase, contract ID, XLM/USDC SAC IDs, default resolver, public read-source account, serta Supabase URL/keys. Tidak ada private key wallet dalam repo atau browser.

## UX and Failure Handling

- Arah visual: warm paper background, deep ink text, trust-green primary, dan amber sebagai penanda action; tipografi editorial ringan tanpa estetika dashboard DeFi.
- Status diterjemahkan menjadi bahasa rekber: “Menunggu Pendanaan”, “Dana Terkunci”, “Terkirim”, dan seterusnya.
- Detail hash, contract ID, dan transaction XDR ditempatkan dalam panel “Detail Blockchain”.
- Berikan error khusus untuk wallet ditolak, network salah, akun belum funded, alamat tidak valid, asset tidak aktif, simulasi gagal, transaksi kedaluwarsa, deal tidak ditemukan, serta metadata/hash mismatch.
- Halaman deal tetap berguna tanpa wallet; connect hanya diperlukan untuk membuat deal.
- Funding, delivery, revision, release, dispute, dan timeout action tetap di luar Phase 2 dan masuk Phase 3.

## Test Plan

- Unit test canonical serialization/hash dengan golden fixtures, konversi amount 7 desimal, validasi address/party/deadline, dan pemetaan status contract.
- API test untuk registrasi valid, hash mismatch, field on-chain mismatch, duplicate retry, deal tidak ditemukan, dan kegagalan Supabase.
- Component test untuk wallet states, preset form, review screen, transaction progress, dashboard filtering, dan public deal rendering.
- Playwright test untuk landing → connect mocked wallet → create → confirmation → direct deal link.
- Testnet acceptance dengan wallet nyata:
  - Buat masing-masing satu Service, Digital Goods, dan Custom deal.
  - Verifikasi XLM dan mock USDC dapat dipilih.
  - Buka link deal di browser tanpa wallet.
  - Pastikan data contract, metadata, role buyer/seller, dan hash cocok.
  - Pastikan deal muncul pada dashboard kedua pihak.

## Assumptions

- Tetap memakai deployment testnet dan dua SAC yang tercatat di README Phase 1.
- Tidak ada perubahan smart contract untuk Phase 2; listing dashboard berasal dari Supabase karena contract tidak menyediakan enumerasi deal.
- npm menjadi package manager frontend karena repo belum memiliki JavaScript workspace.
- Default preset: Service memakai review 48 jam/revisi 2×; Digital Goods memakai review 24 jam/tanpa revisi; Custom memakai review 48 jam/tanpa revisi. Semua nilai dapat diedit sebelum signing.
- Supabase menyimpan metadata publik non-sensitif saja; tidak menyimpan chat mentah, private key, atau credential wallet.
