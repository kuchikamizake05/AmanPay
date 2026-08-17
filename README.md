# AmanPay

**Deal OS & Programmable Non-Custodial Escrow for Informal Digital Commerce on Stellar Soroban**  
Transform messy informal chat deals from WhatsApp, Telegram, X, and Discord into structured, legally clear, and escrow-backed on-chain transactions.

[**Live Web Application**](https://fe-steel-pi.vercel.app) · [**Stellar Testnet Contract**](https://stellar.expert/explorer/testnet/contract/CDY2ANSND433R2QPOZXUNFXEZU5H5KGJHEFR5EVQL5PST2XJINYZPO52) · [**Architecture Spec**](./ARCHITECTURE.md) · [**PRD**](./PRD.md)

[![Stellar Soroban Testnet](https://img.shields.io/badge/Stellar-Soroban%20Testnet%20(Deployed)-000000?style=flat-square&logo=stellar)](https://stellar.expert/explorer/testnet/contract/CDY2ANSND433R2QPOZXUNFXEZU5H5KGJHEFR5EVQL5PST2XJINYZPO52) [![Soroban Rust Tests](https://img.shields.io/badge/Soroban%20Rust-20%20Tests%20Passing-orange?style=flat-square&logo=rust)](https://github.com/kuchikamizake05/kelpie) [![Frontend Vitest](https://img.shields.io/badge/Vitest%20TypeScript-30%20Tests%20Passing-38BDF8?style=flat-square&logo=vitest)](https://github.com/kuchikamizake05/kelpie) [![AI Multimodal Parser](https://img.shields.io/badge/Gemini%201.5%20Flash-Vision%20%26%20Schema%20Structured-4E75F6?style=flat-square&logo=google)](https://github.com/kuchikamizake05/kelpie)

---

## Evaluation Guide (Interactive Walkthrough)

Evaluators can test the complete, end-to-end non-custodial rekber (escrow) flow without needing external wallet extensions using our built-in **Wallet Simulator**:

1. **AI Deal Autofill (`/deals/new`)**: Paste messy chat text or upload a WhatsApp/Telegram screenshot. The Gemini multimodal parser extracts key transaction parameters into structured form fields automatically.
2. **Dual-Role Wallet Simulator**: Switch seamlessly between **Seller** and **Buyer** with instant auto-funding via Stellar Friendbot.
3. **Escrow State Machine Lifecycle**: Experience state transitions from `Created` -> `Funded` -> `Delivered` -> `Approved & Released` or test permissionless timeouts and mutual cancellations.
4. **Verified Public Receipts (`/deals/[id]/receipt`)**: Inspect verifiable on-chain settlement receipts with single-click WhatsApp/Telegram sharing.
5. **Reputation Profiles (`/profiles/[address]`)**: Audit transparent seller/buyer track records, dispute rates, and completed transaction volumes.

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
| **Default Dispute Resolver** | `GBUYER...` (Configurable via `.env`) | `ACTIVE` |

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
npm install
npm run dev
```

Run test suite:
```bash
npm run test
```

---

## License
MIT License. Developed for the Stellar Soroban Ecosystem.
