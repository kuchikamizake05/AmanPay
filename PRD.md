# PRD — AmanPay

## Deal OS & Programmable Rekber for Informal Digital Commerce

## 1. Ringkasan Produk

**AmanPay** adalah Deal OS dan rekber programmable untuk transaksi digital lintas-platform di Indonesia/APAC. AmanPay membantu buyer, seller, dan freelancer mengubah kesepakatan informal dari WhatsApp, Telegram, X, Facebook Marketplace, Discord, Instagram DM, atau grup komunitas menjadi **structured deal link** yang disetujui kedua pihak dan dijamin oleh escrow Soroban.

AmanPay tidak mencoba menjadi marketplace baru. AmanPay adalah **trust and execution layer** untuk transaksi yang sudah terjadi di luar marketplace: merapikan terms, mengunci dana, mencatat delivery, dan menghasilkan bukti penyelesaian yang dapat diverifikasi.

### One-liner

**AmanPay turns messy chat deals into mutually approved, escrow-backed transactions.**

### Versi Indonesia

**AmanPay mengubah kesepakatan berantakan dari chat atau grup mana pun menjadi transaksi rekber yang terstruktur, aman, dan terverifikasi.**

---

## 2. Masalah yang Diselesaikan

Banyak transaksi digital di Indonesia terjadi di luar marketplace formal, misalnya melalui:

* WhatsApp
* Telegram
* X/Twitter
* Facebook Marketplace
* Grup Facebook
* Discord
* Instagram DM
* Forum komunitas

Masalah yang sering muncul:

1. **Buyer takut seller/freelancer kabur setelah dibayar.**
2. **Seller/freelancer takut buyer tidak membayar setelah barang/jasa dikirim.**
3. **Kesepakatan transaksi tercecer di chat.**
4. **Jasa rekber tradisional masih bergantung pada admin manusia.**
5. **Dana rekber tradisional dipegang pihak ketiga, bukan smart contract.**
6. **Sulit menangani milestone, revisi, deadline, partial release, dan dispute secara rapi.**
7. **Bukti penyelesaian transaksi tidak portable lintas-platform.**

---

## 3. Target Pengguna

### Primary User

#### 1. Freelancer / penyedia jasa digital

Contoh:

* Desainer logo/poster
* Editor video
* Developer website kecil
* UI/UX designer
* Copywriter
* Social media manager
* Commission artist
* Photographer/editor
* Jasa digital komunitas

Pain point:

* Hasil kerja sudah dikirim tapi buyer ghosting.
* Scope kerja berubah-ubah.
* Revisi tidak jelas.
* Tidak ada jaminan pembayaran.

#### 2. Seller produk digital

Contoh:

* Seller template
* Seller akun/item game
* Seller domain
* Seller preset/editing pack
* Seller source code kecil
* Seller file digital
* Seller akses komunitas
* Seller lisensi digital

Pain point:

* Buyer minta kirim dulu baru bayar.
* Buyer mengaku belum menerima.
* Penipuan sering terjadi di grup komunitas.
* Butuh bukti transaksi yang jelas.

#### 3. Buyer / client

Pain point:

* Takut seller kabur setelah dibayar.
* Takut freelancer tidak menyelesaikan pekerjaan.
* Butuh status transaksi yang jelas.
* Butuh bukti bahwa dana aman sebelum barang/jasa diterima.

#### 4. Buyer dan seller transaksi digital umum

Contoh:

* Transaksi domain atau lisensi digital
* Pembelian akses komunitas
* Transaksi antarpengguna dari forum atau grup
* Kesepakatan digital custom yang tidak cocok dengan template marketplace

Pain point:

* Kesepakatan tidak memiliki format baku.
* Kedua pihak membutuhkan aturan release dan refund yang jelas.
* Tidak ingin bergantung pada admin rekber yang memegang dana.

---

## 4. Value Proposition

AmanPay memberikan:

1. **Non-admin-custodial escrow**
   Dana dikunci dan dipindahkan oleh aturan Soroban smart contract, bukan dipegang oleh admin rekber.

2. **Cross-platform transaction protection**
   Link AmanPay bisa dikirim ke WhatsApp, Telegram, X, Facebook, Discord, atau platform mana pun.

3. **Mutually approved deal terms**
   Buyer dan seller bertransaksi berdasarkan terms hash yang sama. Terms tidak dapat diubah sepihak setelah deal dibuat.

4. **Programmable deal rules**
   Transaksi bisa punya deadline, delivery proof, review window, approval, timeout refund, dan dispute state.

5. **AI-assisted deal creation**
   User bisa paste isi chat atau deskripsi transaksi, lalu AmanPay membantu mengekstrak harga, item/jasa, deadline, dan aturan pembayaran.

6. **Verified deal receipt**
   Setiap transaksi punya halaman status yang menunjukkan apakah dana sudah funded, delivered, released, refunded, atau disputed.

7. **Portable verified deal history**
   Seller/freelancer dapat menunjukkan riwayat deal yang benar-benar selesai tanpa mengklaim skor reputasi yang mudah dimanipulasi.

---

## 5. Positioning

### AmanPay bukan:

* Bukan marketplace freelance.
* Bukan e-wallet.
* Bukan payment gateway biasa.
* Bukan crowdfunding.
* Bukan jasa rekber manual.
* Bukan invoice app biasa.

### AmanPay adalah:

**A Deal OS for informal digital commerce: from messy chat agreements to structured, escrow-backed transactions.**

### Product Principle

* **Contract tetap generik:** core deal engine tidak dikunci pada satu industri.
* **UX berbasis preset:** Service Deal dan Digital Goods Sale menjadi alur utama; Custom Deal menjaga AmanPay tetap berguna sebagai rekber umum.
* **AI assists, humans approve:** AI hanya menyusun terms. Buyer dan seller tetap memeriksa dan menyetujui hasilnya.
* **Escrow executes agreed terms:** dana hanya bergerak berdasarkan state transition, authorization, dan timeout yang eksplisit.

---

## 6. Scope MVP

MVP harus fokus agar realistis dibuat solo sebelum deadline.

### MVP menyediakan 3 preset di atas satu deal engine generik:

## A. Service Deal

Untuk freelance/jasa digital.

Flow:

1. Creator membuat deal.
2. Buyer/client fund escrow.
3. Freelancer submit hasil kerja.
4. Buyer approve atau request revision/dispute.
5. Dana release ke freelancer setelah approve.

Field utama:

* Deal title
* Description
* Amount
* Buyer wallet
* Seller/freelancer wallet
* Deadline
* Deliverable description
* Revision limit
* Status
* Delivery proof URL

---

## B. Digital Goods Sale

Untuk jual-beli produk digital.

Flow:

1. Seller membuat deal.
2. Buyer fund escrow.
3. Seller submit delivery proof.
4. Buyer approve.
5. Dana release ke seller.

Field utama:

* Deal title
* Product description
* Amount
* Buyer wallet
* Seller wallet
* Delivery proof URL
* Status

---

## C. Custom Deal

Untuk transaksi digital umum yang tidak cocok dengan dua preset utama.

Flow tetap sama:

1. Creator menyusun terms dasar.
2. Counterparty memeriksa terms dan fund escrow sebagai bentuk acceptance.
3. Seller submit delivery proof.
4. Buyer approve, dispute, atau menggunakan jalur timeout sesuai state.

Custom Deal tidak memiliki automasi khusus per industri pada MVP. Ia hanya menggunakan field generik: title, description, amount, buyer, seller, deadline, delivery rule, dan terms hash.

---

## 7. Core User Flow

### Flow 1 — Seller/Freelancer membuat deal

1. User masuk ke AmanPay.
2. Connect wallet menggunakan Freighter.
3. Pilih tipe deal:

   * Service Deal
   * Digital Goods Sale
   * Custom Deal
4. Isi form manual atau paste chat transaksi.
5. AmanPay membuat structured deal summary.
6. User review detail deal.
7. Frontend membuat canonical metadata dan `terms_hash`.
8. User klik “Create Escrow Deal” dan menyetujui terms sebagai creator.
9. Smart contract membuat immutable deal record.
10. AmanPay menghasilkan shareable deal link.
11. User membagikan link ke buyer/client.

---

### Flow 2 — Buyer/client melakukan funding

1. Buyer membuka deal link.
2. Buyer melihat detail transaksi:

   * Judul
   * Deskripsi
   * Nominal
   * Seller/freelancer
   * Deadline
   * Rule escrow
3. Buyer connect wallet.
4. Buyer memastikan terms yang ditampilkan sesuai dengan `terms_hash`.
5. Buyer klik “Accept & Fund Escrow”.
6. Dana masuk ke Soroban escrow contract; transaksi funding menjadi acceptance buyer.
7. Status berubah menjadi “Funded”.
8. Seller/freelancer mendapat status bahwa pekerjaan/pengiriman bisa dimulai.

---

### Flow 3 — Seller/freelancer submit delivery

1. Seller/freelancer membuka dashboard deal.
2. Klik “Submit Delivery”.
3. Masukkan delivery proof:

   * Link Google Drive
   * Link Figma
   * Link website
   * Link file
   * Deskripsi pengiriman
4. Status berubah menjadi “Delivered”.
5. Buyer mendapat halaman untuk review.

---

### Flow 4 — Buyer approve

1. Buyer membuka halaman deal.
2. Melihat delivery proof.
3. Klik “Approve & Release”.
4. Smart contract mengirim dana ke seller/freelancer.
5. Status berubah menjadi “Released”.
6. Deal receipt terbentuk.

---

### Flow 5 — Buyer atau seller membuka dispute

1. Salah satu pihak menemukan masalah setelah deal funded.
2. Pihak tersebut klik “Open Dispute” dan menyertakan evidence/reason hash.
3. Status berubah menjadi “Disputed”.
4. Untuk MVP, dispute belum diselesaikan otomatis.
5. Halaman deal menampilkan status dispute dan evidence timeline.

Catatan MVP:
Dispute menggunakan resolver yang telah ditentukan dan terlihat sebelum funding. AmanPay tidak membangun marketplace arbitrator, voting DAO, atau sistem legal dispute penuh.

---

### Flow 6 — Timeout protection

* Jika seller tidak mengirim delivery sampai deadline, fungsi timeout mengembalikan dana ke buyer.
* Jika buyer tidak merespons sampai review window berakhir dan tidak ada revision/dispute, fungsi timeout melepas dana ke seller.
* UI menampilkan kapan action timeout tersedia dan siapa penerima dana sebelum transaksi dikirim.

---

## 8. Smart Contract Requirement

### Contract: AmanPayEscrow

Contract bertugas menyimpan deal generik, mengunci dana, mengikat transaksi pada terms yang disetujui, menegakkan state transition, serta melakukan release/refund secara deterministik.

### State Machine

```text
Created ──fund──> Funded ──submit delivery──> Delivered ──approve──> Released
   │                  │                          │
   └──cancel──> Cancelled                       ├──request revision──> RevisionRequested
                      │                          ├──open dispute──────> Disputed
                      └──delivery timeout──> Refunded

Delivered ──review timeout without dispute──> Released
RevisionRequested ──resubmit delivery──> Delivered
Disputed ──resolver decision──> Released or Refunded
```

Tidak ada cron otomatis di Soroban. Jalur timeout dieksekusi melalui fungsi contract yang dapat dipanggil setelah ledger timestamp melewati batas yang ditentukan.

### Deal Status

```text
Created
Funded
Delivered
RevisionRequested
Disputed
Released
Refunded
Cancelled
```

### Deal Type

```text
Service
DigitalGoods
Custom
```

### Dispute Resolution

```text
RefundBuyer
ReleaseSeller
```

Partial split dan pergantian resolver berada di luar scope MVP.

### Data Structure

```rust
Deal {
  id: u64,
  deal_type: DealType,
  seller: Address,
  buyer: Address,
  resolver: Address,
  asset: Address,
  amount: i128,
  terms_hash: BytesN<32>,
  delivery_hash: Option<BytesN<32>>,
  dispute_hash: Option<BytesN<32>>,
  delivery_deadline: u64,
  review_period: u64,
  review_deadline: Option<u64>,
  revision_limit: u32,
  revision_period: u64,
  revision_count: u32,
  status: DealStatus,
  created_at: u64,
  funded_at: Option<u64>,
  delivered_at: Option<u64>,
  closed_at: Option<u64>,
}
```

Metadata detail seperti deskripsi, delivery proof, dan hasil AI parser disimpan off-chain. Representasi metadata harus diubah ke format canonical sebelum di-hash agar frontend dan contract selalu merujuk ke terms yang sama.

Terms bersifat immutable setelah `create_deal`. Jika creator ingin mengubah terms sebelum funding, deal lama dibatalkan dan deal baru dibuat. Ini menghindari perubahan sepihak dan kompleksitas multi-signature amendment pada MVP.

### Contract Functions

```rust
create_deal(...)
fund_deal(deal_id)
submit_delivery(deal_id, delivery_hash)
request_revision(deal_id, reason_hash)
approve_release(deal_id)
open_dispute(deal_id, opener, reason_hash)
refund_expired_undelivered(deal_id)
release_after_review_timeout(deal_id)
resolve_dispute(deal_id, resolution)
cancel_unfunded_deal(deal_id)
get_deal(deal_id)
set_asset_enabled(asset, enabled)
is_asset_enabled(asset)
```

### Access Rules

* Pada MVP, seller adalah creator. Seller harus melakukan authorization saat membuat deal; aksi ini menjadi acceptance seller.
* Hanya buyer yang bisa fund. Funding juga menjadi acceptance buyer terhadap `terms_hash` yang tersimpan.
* Hanya seller/freelancer yang bisa submit delivery.
* Hanya buyer yang bisa request revision dan approve release.
* Buyer atau seller bisa open dispute setelah deal funded sesuai state yang diizinkan.
* Seller sebagai creator bisa cancel deal hanya jika belum funded.
* Setelah delivery deadline terlewati tanpa delivery, refund ke buyer dapat dieksekusi secara deterministik.
* Setelah review window terlewati tanpa revision/dispute, release ke seller dapat dieksekusi secara deterministik.
* Penyelesaian dispute pada MVP menggunakan resolver yang dipilih dan ditampilkan saat deal dibuat. Resolver tidak memegang dana, tetapi hanya dapat menentukan distribusi saat status `Disputed`.
* Fungsi timeout dapat dipanggil siapa pun setelah waktunya tercapai karena penerima dana sudah ditentukan secara deterministik oleh state contract.

### Fund Safety Invariants

* Total release dan refund tidak boleh melebihi amount yang didanai.
* Deal final (`Released`, `Refunded`, `Cancelled`) tidak dapat diaktifkan kembali.
* Semua transfer menggunakan Stellar Asset Contract client dan checked arithmetic.
* Seluruh fungsi sensitif memverifikasi role dengan `require_auth()`.
* Tidak ada perubahan buyer, seller, asset, amount, atau terms setelah funding.
* Hanya Stellar Asset Contract yang sudah masuk admin allowlist dapat dipakai untuk deal baru; menonaktifkan aset tidak menghambat settlement deal lama.

---

## 9. Frontend Requirement

### Pages

#### 1. Landing Page

Isi:

* Problem statement
* “Create safe escrow link”
* Cara kerja 3 langkah
* Use case: Service Deal, Digital Goods Sale, dan Custom Deal
* CTA: Create Deal

#### 2. Create Deal Page

Input:

* Deal type
* Title
* Description
* Amount
* Buyer address
* Seller address
* Deadline
* Delivery rule
* Revision limit untuk Service Deal
* Optional: paste chat/deal text

Output:

* Structured deal preview
* Create escrow button

#### 3. Deal Detail Page

Menampilkan:

* Deal title
* Amount
* Buyer
* Seller
* Status
* Timeline
* Deadline
* Delivery proof
* Action button sesuai role:

  * Fund
  * Submit Delivery
  * Approve Release
  * Request Revision
  * Open Dispute

#### 4. Dashboard

Menampilkan:

* Created deals
* Funded deals
* Delivered deals
* Released deals
* Disputed deals

#### 5. Public Receipt Page

Menampilkan:

* Deal ID
* Status akhir
* Amount
* Released/refunded timestamp
* Buyer/seller wallet
* Metadata hash
* Transaction hash

---

## 10. AI Deal Parser Requirement

AI parser adalah pembeda, tapi untuk MVP jangan terlalu kompleks.

### Input

User paste teks seperti:

```text
Aku mau beli template Notion finance tracker harga 150 ribu. Seller kirim link Google Drive setelah aku bayar. Kalau file tidak bisa dibuka, refund.
```

Atau:

```text
Bikin landing page 3 section, deadline Jumat, harga 500 ribu, revisi maksimal 2x, final file dikirim via GitHub.
```

### Output

```json
{
  "deal_type": "Service",
  "title": "Landing page 3 section",
  "amount": "500000",
  "deadline": "Friday",
  "deliverable": "GitHub link / deployed website",
  "revision_limit": 2,
  "refund_rule": "Refund if not delivered by deadline"
}
```

### MVP Implementation Option

Untuk hackathon, AI parser bisa dibuat sebagai:

* Rule-based parser sederhana; atau
* API LLM jika memungkinkan; atau
* Mocked parser dengan realistic output untuk demo.

Yang penting: user melihat AmanPay bisa mengubah deal informal menjadi structured escrow.

---

## 11. Backend Requirement

Backend digunakan untuk menyimpan metadata off-chain.

### Tech Stack Suggested

* Next.js / React frontend
* Node.js API route atau Express backend
* PostgreSQL / Supabase
* Soroban smart contract Rust
* Freighter wallet integration
* Stellar testnet
* Optional AI API

### Database Tables

#### deals

```sql
id
contract_deal_id
deal_type
title
description
amount
asset
buyer_address
seller_address
creator_address
deadline
review_deadline
status
terms_hash
resolver_address
metadata_hash
created_at
updated_at
```

#### deal_events

```sql
id
deal_id
event_type
actor_address
description
metadata_hash
tx_hash
created_at
```

#### deliveries

```sql
id
deal_id
delivery_url
delivery_note
metadata_hash
submitted_by
created_at
```

#### profiles

```sql
id
wallet_address
display_name
completed_deals_count
disputed_deals_count
created_at
```

---

## 12. Key Differentiators

### 1. Deal OS, bukan sekadar escrow

Messy chat agreements become structured terms that both parties can inspect and approve.

### 2. Non-admin-custodial rekber

Traditional rekber requires users to trust an admin. AmanPay locks funds in Soroban escrow.

### 3. Cross-platform link

AmanPay can be used from any social platform: WhatsApp, Telegram, X, Facebook, Discord, Instagram, or forum.

### 4. AI deal-to-escrow

Messy chat agreements become structured escrow terms.

### 5. Programmable rules

Support for delivery proof, deadline, revision, dispute, refund, and release.

### 6. Verified deal history

Completed deals produce portable receipts and verifiable history. AmanPay does not assign a trust score in the MVP.

---

## 13. Success Metrics for Hackathon

### Product Metrics

* User can create a deal end-to-end.
* Buyer can fund escrow on Stellar testnet.
* Seller can submit delivery proof.
* Buyer can release funds.
* Undelivered funded deals can follow a deterministic timeout refund path.
* Delivered deals can follow a deterministic review-timeout release path.
* Deal status updates correctly.
* Public receipt page works.
* At least 2 demo scenarios work:

  * Freelance/service deal
  * Digital goods sale

### Technical Metrics

* Smart contract deployed to testnet.
* Frontend integrated with Freighter.
* Real testnet transaction shown.
* Contract states are queryable.
* Metadata hash generated and stored.
* Demo does not rely only on mock data.

### Presentation Metrics

* Problem is understandable in under 30 seconds.
* Stellar/Soroban role is obvious.
* Demo can be completed in 3–5 minutes.
* Product feels usable by real Indonesian social-commerce users.

---

## 14. Out of Scope for MVP

Tidak perlu dibuat untuk MVP:

* Full arbitration system
* Fiat on-ramp/off-ramp
* QRIS integration
* Mobile app native
* KYC
* Multi-currency production settlement
* Real legal dispute resolution
* Reputation score or anti-Sybil algorithm
* Marketplace discovery
* Chat platform bot integration
* Automatic delivery verification
* Admin panel kompleks
* Terms amendment after deal creation
* Marketplace of dispute resolvers

---

## 15. Demo Script

### Scenario 1 — Freelance Service Deal

1. Freelancer mendapat order landing page dari chat.
2. Freelancer paste kesepakatan ke AmanPay.
3. AI parser mengekstrak:

   * Landing page 3 section
   * Harga $50 testnet
   * Deadline
   * Revisi maksimal 2x
4. Freelancer membuat escrow deal.
5. Link dikirim ke client.
6. Client membuka link dan fund escrow.
7. Status berubah menjadi Funded.
8. Freelancer submit delivery link.
9. Client approve.
10. Dana release ke freelancer.
11. Public receipt menunjukkan deal completed.

### Scenario 2 — Digital Goods Sale

1. Seller menjual template digital.
2. Seller membuat Digital Goods Sale deal.
3. Buyer fund escrow.
4. Seller submit delivery proof berupa link file.
5. Buyer approve.
6. Dana release.
7. Deal receipt muncul.

---

## 16. Development Milestones

## Phase 0 — Product Lock & Setup

**Target: 20–21 Juni 2026**

Tujuan:

* Mengunci scope MVP.
* Menentukan tech stack.
* Menyiapkan repo dan environment.

Tasks:

* Finalisasi nama produk: AmanPay.
* Finalisasi dua demo utama: Service Deal dan Digital Goods Sale.
* Finalisasi Custom Deal sebagai preset generik tanpa automasi industri.
* Buat wireframe kasar.
* Setup frontend.
* Setup Soroban contract workspace.
* Setup testnet account.
* Setup Freighter wallet test.
* Setup database jika dipakai.

Deliverable:

* Repo rapi.
* README awal.
* Wireframe.
* Environment jalan.

Acceptance Criteria:

* Frontend bisa run local.
* Contract bisa build.
* Freighter bisa connect ke app.

---

## Phase 1 — Smart Contract Core

**Target: 22–25 Juni 2026**

Tujuan:
Membangun escrow contract dasar.

Tasks:

* Definisikan struct Deal.
* Definisikan enum DealStatus.
* Implement create_deal.
* Implement fund_deal.
* Implement submit_delivery.
* Implement approve_release.
* Implement open_dispute.
* Implement refund dan release timeout.
* Implement resolver-only dispute resolution.
* Implement get_deal.
* Buat unit test state transition, authorization, timeout, dan fund invariants.
* Deploy ke Stellar testnet.

Deliverable:

* AmanPayEscrow contract.
* Test contract.
* Contract ID testnet.

Acceptance Criteria:

* Deal bisa dibuat.
* Deal bisa funded.
* Deal bisa delivered.
* Deal bisa released.
* Deal expired tanpa delivery bisa refunded.
* Deal delivered tanpa respons melewati review window bisa released.
* Deal final tidak bisa dibayar dua kali.
* Status berubah sesuai flow.
* Dana testnet berpindah sesuai rule.

---

## Phase 2 — Frontend Basic Flow

**Target: 26–29 Juni 2026**

Tujuan:
Membangun UI utama dan integrasi wallet.

Tasks:

* Buat landing page.
* Buat create deal page.
* Buat deal detail page.
* Buat dashboard sederhana.
* Integrasi Freighter connect wallet.
* Integrasi create_deal ke contract.
* Integrasi get_deal dari contract.
* Tampilkan status deal.

Deliverable:

* User bisa membuat deal dari UI.
* User bisa melihat detail deal.
* Wallet connect jalan.

Acceptance Criteria:

* Create deal dari frontend berhasil.
* Deal detail page membaca data contract.
* UI menampilkan role buyer/seller.
* Link deal bisa dibuka langsung.

---

## Phase 3 — Funding, Delivery, Release

**Target: 30 Juni–3 Juli 2026**

Tujuan:
Menyelesaikan flow transaksi end-to-end.

Tasks:

* Implement verifikasi `terms_hash` dan tombol Accept & Fund Escrow.
* Implement tombol Submit Delivery.
* Implement tombol Approve & Release.
* Implement tombol Open Dispute.
* Implement action timeout untuk refund/release.
* Simpan delivery proof ke database atau local metadata.
* Generate canonical metadata hash.
* Tampilkan timeline event.

Deliverable:

* Full flow berjalan:

  * create
  * fund
  * deliver
  * release
* Timeline transaksi tampil.

Acceptance Criteria:

* Buyer bisa fund dari frontend.
* Seller bisa submit delivery.
* Buyer bisa release.
* Timeout refund dan release bisa dieksekusi dari UI.
* Status akhir Released tampil.
* Tx hash bisa dilihat.

---

## Phase 4 — AI Deal Parser & UX Differentiator

**Target: 4–6 Juli 2026**

Tujuan:
Menambahkan pembeda utama AmanPay.

Tasks:

* Buat input “Paste your deal/chat”.
* Implement parser untuk mengekstrak:

  * title
  * deal type
  * amount
  * deadline
  * deliverable
  * revision limit
* Tampilkan structured preview.
* User bisa edit hasil parser sebelum create deal.
* Buat template untuk Service Deal.
* Buat template untuk Digital Goods Sale.
* Custom Deal menggunakan form generik tanpa parser khusus.

Deliverable:

* AI-assisted create deal flow.

Acceptance Criteria:

* User bisa paste teks transaksi.
* Form otomatis terisi.
* User bisa review dan edit.
* Demo parser terlihat natural.

---

## Phase 5 — Receipt and Verified Deal History

**Target: 7–9 Juli 2026**

Tujuan:
Membuat AmanPay terasa seperti trust layer tanpa mengklaim reputation score yang belum tahan Sybil.

Tasks:

* Buat public receipt page.
* Buat seller/freelancer profile sederhana.
* Hitung completed deals.
* Hitung disputed deals.
* Tampilkan verified completed deal.
* Buat shareable receipt.
* Buat WhatsApp/Telegram-ready share message.

Deliverable:

* Receipt page.
* Public profile.
* Share message.

Acceptance Criteria:

* Deal completed menghasilkan receipt.
* Receipt bisa dibuka via link.
* Profile menampilkan jumlah completed deals.
* Share message bisa dicopy.

---

## Phase 6 — Polish, Edge Cases, and Demo Mode

**Target: 10–12 Juli 2026**

Tujuan:
Memastikan produk stabil untuk presentasi.

Tasks:

* Perbaiki UI copy.
* Tambahkan empty states.
* Tambahkan loading states.
* Tambahkan error handling.
* Tambahkan status badge.
* Tambahkan demo data.
* Tambahkan reset/demo path jika perlu.
* Test dengan dua wallet.
* Test ulang full scenario.

Deliverable:

* App stabil untuk demo.

Acceptance Criteria:

* Demo bisa dilakukan tanpa error besar.
* Semua button jelas.
* Flow bisa selesai dalam 3–5 menit.
* Tidak ada blocking bug.

---

## Phase 7 — Submission Package

**Target: 13–15 Juli 2026**

Tujuan:
Menyiapkan materi submission hackathon.

Tasks:

* Buat README lengkap.
* Buat architecture diagram.
* Buat demo video.
* Buat pitch deck singkat.
* Tulis problem, solution, tech stack, contract ID.
* Tulis how to run.
* Tulis demo scenario.
* Deploy frontend.
* Pastikan contract ID dan testnet link tercantum.

Deliverable:

* Final deployed app.
* Demo video.
* README.
* Pitch deck.
* Contract deployed.
* Submission siap.

Acceptance Criteria:

* Juri bisa membuka app.
* Juri bisa memahami value dalam 1 menit.
* Demo video menunjukkan transaksi testnet nyata.
* README menjelaskan cara kerja teknis.

---

## 17. Suggested Tech Stack

### Frontend

* Next.js
* TypeScript
* Tailwind CSS
* shadcn/ui optional
* Freighter API

### Backend

* Next.js API routes atau Express
* Supabase/PostgreSQL untuk metadata
* Optional: simple JSON storage untuk MVP

### Blockchain

* Soroban smart contract
* Rust
* Stellar testnet
* Test token atau native asset testnet

### AI Parser

* Option 1: LLM API
* Option 2: rule-based parser
* Option 3: mocked parser untuk demo awal

---

## 18. Architecture

```text
User
  ↓
AmanPay Frontend
  ↓
Freighter Wallet
  ↓
Soroban Escrow Contract
  ↓
Stellar Testnet

Frontend
  ↓
Backend / Supabase
  ↓
Deal Metadata, Delivery Proof, Timeline, Profile
```

On-chain:

* Deal ID
* Buyer/seller address
* Amount
* Asset
* Status
* Metadata hash
* Fund/release/refund state

Off-chain:

* Title
* Description
* Chat parsed result
* Delivery proof URL
* Timeline notes
* Profile display name
* Receipt view

---

## 19. Risk and Mitigation

### Risk 1: Scope terlalu luas

Mitigation:

* Satu generic deal engine digunakan oleh semua preset.
* Service Deal menjadi demo utama; Digital Goods dan Custom Deal memakai flow dasar yang sama.
* Tidak membuat marketplace.
* Tidak membuat arbitration penuh.

### Risk 2: AI parser memakan waktu

Mitigation:

* Buat parser sederhana dulu.
* LLM bisa ditambahkan jika waktu cukup.
* Demo tetap bisa jalan dengan manual form.

### Risk 3: Contract integration sulit

Mitigation:

* Selesaikan contract core lebih awal.
* Jangan menunggu UI sempurna.
* Test dengan CLI sebelum frontend integration.

### Risk 4: Dispute terlalu kompleks

Mitigation:

* Resolver ditentukan dan ditampilkan sebelum buyer funding.
* Resolver hanya aktif untuk deal berstatus `Disputed` dan tidak pernah memegang dana.
* Demo utama tetap fokus pada happy path serta satu timeout path.

### Risk 5: User tidak paham crypto

Mitigation:

* UI memakai bahasa rekber, bukan DeFi.
* Tampilkan “Fund Escrow”, bukan “Invoke Contract”.
* Blockchain detail ditaruh di advanced section.

### Risk 6: Verified history dimanipulasi

Mitigation:

* MVP hanya menampilkan fakta on-chain seperti jumlah deal selesai dan receipt.
* Tidak memberikan trust score atau label “trusted seller”.
* Anti-Sybil dan reputation weighting berada di luar scope MVP.

### Risk 7: Terms atau metadata tidak konsisten

Mitigation:

* Gunakan canonical JSON dengan field order dan encoding yang konsisten.
* Hash dibuat ulang saat halaman deal dibuka dan dibandingkan dengan `terms_hash` on-chain.
* Buyer tidak dapat funding jika metadata yang ditampilkan tidak cocok dengan hash contract.

---

## 20. Final MVP Definition

MVP dianggap selesai jika:

1. User bisa connect wallet.
2. User bisa membuat Service Deal.
3. User bisa membuat Digital Goods Sale.
4. User bisa membuat Custom Deal dengan flow generik.
5. Buyer bisa memverifikasi terms lalu accept dan fund escrow.
6. Seller/freelancer bisa submit delivery proof.
7. Buyer bisa approve dan release fund.
8. Deal memiliki refund dan release timeout yang deterministik.
9. Buyer atau seller bisa open dispute dengan resolver yang sudah diketahui.
10. Deal status bisa dilihat publik.
11. Receipt page tersedia.
12. Ada AI/paste-deal parser minimal yang hasilnya dapat diedit user.
13. Ada demo end-to-end di testnet.
14. Ada README dan demo video.

---

## 21. Final Product Narrative

Indonesia already uses rekber because trust problems in online social commerce are real. But the problem starts before payment: informal deals are scattered across chats, terms are ambiguous, and neither party has a shared source of truth. Traditional rekber is also manual, admin-based, fragmented, and not programmable.

AmanPay turns rekber into a Deal OS for informal digital commerce. Any deal from WhatsApp, Telegram, X, Facebook Marketplace, Discord, or a community group can become a structured agreement that both parties inspect and approve. AI helps organize messy chat terms, while Soroban binds the payment to an immutable terms hash and executes funding, delivery, release, refund, and dispute rules transparently.

AmanPay remains a general-purpose rekber through a generic deal engine, while Service Deal and Digital Goods presets make the experience easy for common use cases. It does not replace marketplaces. It protects and structures transactions that happen outside them.
