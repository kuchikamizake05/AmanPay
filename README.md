# AmanPay

**Deal OS & Programmable Non-Custodial Escrow for Informal Digital Commerce on Stellar Soroban**  
Transform messy informal chat deals from WhatsApp, Telegram, X, and Discord into structured, legally clear, and escrow-backed on-chain transactions.

[**Live Web Application**](https://fe-steel-pi.vercel.app) · [**Stellar Testnet Contract**](https://stellar.expert/explorer/testnet/contract/CDY2ANSND433R2QPOZXUNFXEZU5H5KGJHEFR5EVQL5PST2XJINYZPO52) · [**Architecture Spec**](./ARCHITECTURE.md) · [**PRD**](./PRD.md)

[![Stellar Soroban Testnet](https://img.shields.io/badge/Stellar-Soroban%20Testnet%20(Deployed)-000000?style=flat-square&logo=stellar)](https://stellar.expert/explorer/testnet/contract/CDY2ANSND433R2QPOZXUNFXEZU5H5KGJHEFR5EVQL5PST2XJINYZPO52) [![Soroban Rust Tests](https://img.shields.io/badge/Soroban%20Rust-20%20Tests%20Passing-orange?style=flat-square&logo=rust)](https://github.com/kuchikamizake05/kelpie) [![Frontend Vitest](https://img.shields.io/badge/Vitest%20TypeScript-30%20Tests%20Passing-38BDF8?style=flat-square&logo=vitest)](https://github.com/kuchikamizake05/kelpie) [![AI Multimodal Parser](https://img.shields.io/badge/Gemini%201.5%20Flash-Vision%20%26%20Schema%20Structured-4E75F6?style=flat-square&logo=google)](https://github.com/kuchikamizake05/kelpie)

---

## White Belt Evaluation Guide

AmanPay includes native XLM payment proof alongside its Soroban escrow flow. Configure Freighter for **Stellar Testnet** before testing.

1. Open `/dashboard`, click **Connect Wallet**, select Freighter, and approve wallet-signature login.
2. Confirm **Native XLM Balance** appears in dashboard and beside connected address in header. Balance comes from Horizon Testnet account data, not XLM SAC escrow balance.
3. In **Send native XLM**, enter funded Testnet recipient and positive XLM amount with at most seven decimals.
4. Click **Send XLM on Testnet**, approve Freighter signature, then confirm success state and transaction-hash StellarExpert link.
5. Click disconnect icon in header. Address and native balance clear.

Native payment sends `Asset.native()` XLM directly between accounts. AmanPay deal funding remains separate Soroban escrow funding with configured SAC assets.

### Required submission screenshots

Capture real Testnet evidence after completing above flow and add files under `docs/screenshots/` before submitting:

- `wallet-connected.png`
- `balance-displayed.png`
- `payment-success.png`
- `transaction-result.png`

Do not use simulated or fabricated transaction evidence.

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
