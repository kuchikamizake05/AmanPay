<p align="center">
  <img src="./assets/amanpay-icon.png" alt="AmanPay Logo" width="120" />
</p>

<h1 align="center">AmanPay</h1>

<p align="center">
  <strong>Deal OS & programmable non-custodial escrow for informal digital commerce on Stellar Soroban.</strong><br>
  Turn chat-based digital deals into structured terms and on-chain escrow workflows.
</p>

<p align="center">
  <a href="https://amanpay-fi.vercel.app"><strong>Live App</strong></a> ·
  <a href="https://amanpay-fi.vercel.app/proof"><strong>Product Proof</strong></a> ·
  <a href="https://stellar.expert/explorer/testnet/contract/CDY2ANSND433R2QPOZXUNFXEZU5H5KGJHEFR5EVQL5PST2XJINYZPO52"><strong>Stellar Testnet Contract</strong></a> ·
  <a href="./ARCHITECTURE.md"><strong>Architecture</strong></a> ·
  <a href="./PRD.md"><strong>PRD</strong></a>
</p>

---

## Product Overview

AmanPay is built for informal digital commerce where deal terms, payment, and delivery often live across chat messages. It converts agreement details into structured deal terms, anchors them with a cryptographic hash, and executes payment rules through Stellar Soroban escrow.

### Core Capabilities

- **Multimodal deal intake:** Parse chat text or screenshots into reviewable structured terms.
- **Programmable escrow:** Lock XLM or USDC SAC assets under explicit delivery, review, cancellation, and dispute rules.
- **Wallet-native access:** Connect Freighter, authenticate through wallet signatures, inspect native XLM balance, and send native XLM on Stellar Testnet.
- **Settlement visibility:** Completed deals expose public receipts, wallet track records, terms hashes, and Testnet explorer links.
- **Product data layer:** Supabase stores public metadata and timelines while role-gated delivery and dispute data remain private.

Explore [Product Proof](https://amanpay-fi.vercel.app/proof), open [dashboard](https://amanpay-fi.vercel.app/dashboard), or create a [Testnet deal](https://amanpay-fi.vercel.app/deals/new).

---

## How It Works

1. **Structure deal:** Buyer and seller review title, scope, asset, amount, deadlines, and review rules.
2. **Fund escrow:** Buyer signs a Soroban transaction to lock supported XLM or USDC SAC asset.
3. **Submit delivery:** Seller adds delivery proof for buyer review.
4. **Settle by rules:** Buyer approval, review timeout, mutual cancellation, or dispute resolution moves funds according to contract state.

Native XLM wallet payments use `Asset.native()` directly between accounts. This remains separate from Soroban SAC escrow funding.

---

## Verification Surfaces

- `/proof` explains terms-hash, escrow, receipt, and wallet-history verification.
- `/deals/[id]/receipt` publishes finalized `Released` or `Refunded` settlement receipts.
- `/profiles/[address]` displays recorded public Testnet settlement history.
- [StellarExpert Testnet](https://stellar.expert/explorer/testnet) independently verifies submitted transaction hashes.

---

## Executive Summary

Digital freelancers and peer-to-peer digital merchants across emerging markets (Indonesia/APAC) conduct billions in commerce over chat platforms (WhatsApp, Telegram, Discord, Facebook Marketplace).

However, traditional informal trade suffers from critical pain points:
- **Buyer Risk**: Fear of paying upfront and getting ghosted.
- **Seller Risk**: Work is delivered, but the client vanishes before making payment.
- **Human Admin Rekber**: Traditional manual escrow depends on third-party bank accounts, slow response times, and high human trust risks.
- **Vague Agreements**: Key terms, revision limits, and deliverables get buried across chat histories.

**AmanPay solves this by decoupling negotiation from execution:**
1. **Multimodal AI Intake**: Converts unstructured chat agreements or screenshot proofs into standardized deal terms and deterministic cryptographic hashes.
2. **Soroban Smart Contract Escrow**: Holds funds trustlessly in native XLM or USDC SAC with strict rule-based state transitions.
3. **Automated Safety & Resolution**: Includes mutual cancellation without mediator fees, permissionless timeout refunds/releases, and cryptographic evidence hashing.

---

## Deployed Addresses & Endpoints (Stellar Testnet)

| Component | Target / Contract Address | Status |
| :--- | :--- | :--- |
| **AmanPay Escrow Contract** | [`CDY2ANSND433R2QPOZXUNFXEZU5H5KGJHEFR5EVQL5PST2XJINYZPO52`](https://stellar.expert/explorer/testnet/contract/CDY2ANSND433R2QPOZXUNFXEZU5H5KGJHEFR5EVQL5PST2XJINYZPO52) | `DEPLOYED & VERIFIED` |
| **Native XLM SAC** | `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC` | `ENABLED` |
| **Mock USDC SAC** | `CD72G634XB5BMTMGJ43ER7Q5QLEYX7XGS6JT7BOMDJTOGTBL3EP4JD66` | `ENABLED` |
| **Default Dispute Resolver** | Configure a real Testnet `G…` address in `.env.local` | `OPTIONAL` |

---

## System Architecture & State Machine Flow

```text
  +------------------+       +-------------------+
  |      Seller      |       |       Buyer       |
  +--------+---------+       +---------+---------+
           | 1. Create Deal (Terms Hash)|
           v                            |
   =====================================+==================================
                      AMANPAY ESCROW SMART CONTRACT
   ------------------------------------------------------------------------
   [CREATED] ------------(2. Fund Deal: Locks Asset)------------> [FUNDED]
      |                                                              |
      +--(Seller Cancel before funding)--> [CANCELLED]               |
                                                                     |
   [DELIVERED] <---------(3. Submit Delivery Hash)-------------------+
      |   |   |
      |   |   +--(Review Timeout / Buyer Approve)--------------> [RELEASED]
      |   |
      |   +------(Buyer Revision Limit Check)------------------> [REVISION_REQ]
      |                                                              |
      +----------(Buyer / Seller Open Dispute)-----------------> [DISPUTED]
                                                                     |
   [MUTUAL CANCEL] <----(Both Parties Confirm Mutual Cancel)---------+
      |
      +--------------------------------------------------------> [REFUNDED]
   ========================================================================
```

---

## Repository Map

```text
.
├── contract/amanpay-escrow/     # Soroban Rust smart contract
│   ├── src/
│   │   ├── lib.rs              # Contract entrypoints, settlement & fee logic
│   │   ├── types.rs            # Deal structs, DealStatus, DealType enums
│   │   ├── storage.rs          # Storage keys & persistent TTL extensions
│   │   ├── events.rs           # Soroban contract events
│   │   ├── error.rs            # Custom typed contract error codes
│   │   └── test.rs             # 20 exhaustive unit & invariant tests
│   └── Cargo.toml
├── fe/                         # Next.js App Router frontend
│   ├── src/
│   │   ├── app/                # Pages & Route Handlers (API)
│   │   ├── components/         # Global header, layout wrappers
│   │   ├── config/             # Stellar testnet contract & asset configuration
│   │   ├── features/           # Feature slices (deals, wallet, dashboard)
│   │   │   ├── deals/          # Deal models, components, parser, & timeline
│   │   │   └── wallet/         # Freighter & dual-role simulator provider
│   │   └── lib/                # Stellar SDK encoders, decoders, & Supabase client
│   └── vitest.config.ts        # Unit test configuration
├── supabase/migrations/        # Database schema for off-chain metadata & timeline
├── ARCHITECTURE.md             # Complete architecture specification
├── PRD.md                      # Product requirement document
└── scripts/testnet-smoke.sh    # Stellar CLI testnet smoke test script
```

---

## Local Development & Testing

### 1. Smart Contract (Rust & Soroban)
Requirements: Rust toolchain with `wasm32v1-none` target and `stellar-cli`.

```bash
cd contract/amanpay-escrow
cargo test
stellar contract build
```

### 2. Frontend Application (Next.js)
Requirements: Node.js 18+ and npm.

```bash
cd fe
cp .env.example .env.local
npm ci
npm run dev
```

Run checks:
```bash
npm run lint
npm run test
npm run build
```

`.env.local` accepts `NEXT_PUBLIC_STELLAR_HORIZON_URL` when using a custom Horizon instance. Default is `https://horizon-testnet.stellar.org` for Testnet.

### 3. Supabase product data

AmanPay persists public deal metadata/timeline and role-gated private delivery or dispute data in Supabase. Set matching values from one active Supabase project:

```env
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<server-only-service-role-key>
AUTH_SESSION_SECRET=<at-least-32-random-characters>
```

Never expose `SUPABASE_SERVICE_ROLE_KEY` in `NEXT_PUBLIC_*`, browser code, screenshots, or Git. Before applying migrations to an existing project, inspect migration history and create a database backup. Never run `supabase db reset` on production.

```bash
supabase login
supabase link --project-ref <project-ref>
supabase migration list
supabase db push
```

This applies `supabase/migrations/202606210001_create_deals.sql` and `supabase/migrations/202606210002_phase3_tables.sql`. After changing environment values, restart local server or redeploy before retrying wallet login.

---

## License
MIT License. Developed for the Stellar Soroban Ecosystem.
