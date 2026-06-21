# AmanPay

**AmanPay turns messy chat deals into mutually approved, escrow-backed transactions.**

AmanPay adalah Deal OS dan programmable rekber untuk transaksi digital informal. Contract Soroban mengunci aset, menegakkan lifecycle deal, melindungi kedua pihak dengan deadline/review timeout, dan menyediakan resolver untuk dispute tanpa memberi admin akses untuk mengambil dana escrow.

## Phase 1 Status

Contract core telah tersedia dengan:

- Generic deal types: `Service`, `DigitalGoods`, dan `Custom`
- Asset allowlist untuk Stellar Asset Contracts
- Create, fund, delivery, revision, approval, cancellation, dan dispute resolution
- Deterministic refund dan release timeout
- Persistent deal storage dengan TTL refresh
- Typed contract errors dan typed lifecycle events
- 18 unit tests dan 98.06% line coverage
- Testnet smoke flow nyata untuk native XLM dan mock USDC

AI parser, account profile, dan reputation belum termasuk phase kontrak ini. Lihat [PRD.md](PRD.md) untuk product scope lengkap.

## Phase 2 Status

Frontend dasar tersedia di `fe/` dengan:

- Landing page, create deal, public deal detail, dan wallet dashboard
- Stellar Wallets Kit untuk Freighter, xBull, LOBSTR, dan Albedo di testnet
- Integrasi nyata `create_deal` dan `get_deal`
- Canonical JSON + SHA-256 `terms_hash`
- Supabase metadata registration yang diverifikasi terhadap state on-chain
- XLM dan mock USDC selector
- Unit/component tests dengan coverage di atas 80%

Jalankan frontend:

```bash
cd fe
cp .env.example .env.local
npm install
npm run dev
```

Isi `STELLAR_READ_SOURCE`, `NEXT_PUBLIC_DEFAULT_RESOLVER`, dan credential Supabase di `.env.local`. Terapkan migration pada `supabase/migrations/` sebelum menguji metadata dan dashboard.

## Project Structure

```text
contract/amanpay-escrow/
├── Cargo.toml
├── src/
│   ├── lib.rs       # Public contract interface and state transitions
│   ├── types.rs     # Deal, status, type, and resolution
│   ├── error.rs     # Typed contract errors
│   ├── events.rs    # Typed contract events
│   ├── storage.rs   # Storage keys and TTL helpers
│   └── test.rs      # Unit and security tests
└── test_snapshots/

scripts/testnet-smoke.sh
```

## Requirements

- Rust 1.84 or newer
- `wasm32v1-none` Rust target
- Stellar CLI 27
- Ubuntu WSL recommended on this machine because Windows Application Control blocks Cargo build scripts

## Build and Test

Run from WSL:

```bash
cd /mnt/c/Users/ASUS/Documents/coding/web3/stelluy
cargo fmt --all -- --check
cargo test -p amanpay-escrow
stellar contract build
```

Build output:

```text
target/wasm32v1-none/release/amanpay_escrow.wasm
```

Coverage:

```bash
rustup component add llvm-tools-preview
cargo install cargo-llvm-cov --locked
cargo llvm-cov -p amanpay-escrow --summary-only --fail-under-lines 80
```

## Testnet Smoke Test

The script stores keys only in Stellar CLI's WSL configuration and never writes secrets to this repository.

```bash
./scripts/testnet-smoke.sh
```

It creates/funds test identities, prepares native XLM and mock USDC SACs, deploys AmanPay, and verifies two complete `create → fund → deliver → release` flows including final balances.

Latest verified testnet deployment:

- AmanPay: [`CDY2ANSND433R2QPOZXUNFXEZU5H5KGJHEFR5EVQL5PST2XJINYZPO52`](https://stellar.expert/explorer/testnet/contract/CDY2ANSND433R2QPOZXUNFXEZU5H5KGJHEFR5EVQL5PST2XJINYZPO52)
- Native XLM SAC: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- Mock USDC SAC: `CD72G634XB5BMTMGJ43ER7Q5QLEYX7XGS6JT7BOMDJTOGTBL3EP4JD66`
- XLM release transaction: [`52916b23…692b7d9`](https://stellar.expert/explorer/testnet/tx/52916b239f8a1da19efb5c16424335e454e86ae79b3816f7cce70f656692b7d9)
- USDC release transaction: [`7f128dbb…c8cabe2a`](https://stellar.expert/explorer/testnet/tx/7f128dbb32252cf96e75912532a050de6fa7ba4fe57611b618f1b812c8cabe2a)

Testnet can reset; rerun the smoke script to create a fresh deployment when required.

## Security Model

- Seller authorizes deal creation; buyer authorizes funding and release.
- Resolver must differ from buyer and seller and can act only after dispute.
- Admin can enable/disable assets for new deals but cannot transfer escrow funds.
- Final states cannot be reopened or paid twice.
- Token movement uses the Stellar Asset Contract interface.
- Timeout actions are permissionless but have deterministic recipients.

This is hackathon software deployed on testnet and has not received a production security audit.
