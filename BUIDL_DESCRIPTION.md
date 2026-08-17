# AmanPay — BUIDL Project Submission

## Project Name
**AmanPay** — Deal OS & Programmable Non-Custodial Escrow for Informal Digital Commerce

---

## Tagline
**Turns messy chat deals into mutually approved, escrow-backed on-chain transactions on Stellar Soroban.**

---

## The Problem
Across emerging markets (Indonesia & APAC), digital freelancers and peer-to-peer digital merchants conduct billions of dollars in trade outside formal marketplaces (WhatsApp, Telegram, X, Discord, Facebook Marketplace).

However, informal digital commerce suffers from systemic issues:
1. **High Counterparty Risk**: Buyers fear sellers disappearing after advance payment; sellers/freelancers fear clients ghosting after work delivery.
2. **Centralized Human Rekber Risks**: Traditional manual escrow depends on human middlemen, personal bank accounts, and slow dispute arbitration with high fraud risk.
3. **Ambiguous Terms & Vague Scopes**: Key agreement terms, delivery deadlines, and revision allowances are scattered across chat history with no single source of truth.

---

## The Solution
AmanPay acts as a trust and execution layer for informal commerce:

1. **Multimodal AI Intake (Gemini 1.5 Flash)**:
   - Users paste informal chat logs or upload screenshots of WhatsApp/Telegram conversations.
   - The AI extracts structured parameters (deal type, title, price, deadline, deliverables, revision limits) with strict schema enforcement.
2. **Soroban Smart Contract Escrow**:
   - Non-custodial escrow contracts hold native XLM or USDC SAC on Stellar Testnet.
   - Payments are released or refunded only through state transitions, explicit authorizations, or permissionless timeout guarantees.
3. **Dual-Role Wallet Simulator**:
   - Enables instant testing and evaluation of live Stellar testnet smart contract transactions without installing the Freighter browser extension.
4. **Mutual Cancellation & Safety**:
   - Both parties can mutually agree to cancel an active escrow and trigger an immediate 100% refund without paying mediator fees.
5. **Verifiable Public Receipts & Reputation Profiles**:
   - Completed transactions produce cryptographic public receipts shareable via WhatsApp/Telegram.
   - Public profile ledgers display immutable seller/buyer track records and dispute histories.

---

## Deployed Smart Contracts & Links
- **Stellar Testnet Contract ID**: [`CDY2ANSND433R2QPOZXUNFXEZU5H5KGJHEFR5EVQL5PST2XJINYZPO52`](https://stellar.expert/explorer/testnet/contract/CDY2ANSND433R2QPOZXUNFXEZU5H5KGJHEFR5EVQL5PST2XJINYZPO52)
- **Native XLM SAC**: `CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC`
- **Mock USDC SAC**: `CD72G634XB5BMTMGJ43ER7Q5QLEYX7XGS6JT7BOMDJTOGTBL3EP4JD66`
- **GitHub Repository**: [https://github.com/kuchikamizake05/AmanPay](https://github.com/kuchikamizake05/AmanPay)
- **Pull Request**: [https://github.com/kuchikamizake05/AmanPay/pull/1](https://github.com/kuchikamizake05/AmanPay/pull/1)

---

## Video Demo Script & Walkthrough (3 Minutes)

### 0:00 – 0:45: Problem & AI Deal Autofill
1. Open the app at `/deals/new`.
2. Select the **"Jasa Web Design"** template or upload a screenshot of an informal WhatsApp deal chat.
3. Click **"Analisis Kesepakatan"**. Show how Gemini AI extracts the title, price in USDC/XLM, 5-day deadline, deliverables link, and 2x revision limit.
4. Click **"Terapkan ke Form"** to populate the escrow contract deployment form.

### 0:45 – 1:30: Deal Creation & Escrow Funding
1. Click **"Simulasikan Seller"** on the floating Simulator panel.
2. Click **"Review & buat deal"** to deploy the deal on-chain (`Status: Created`).
3. Click **"Simulasikan Buyer"** to switch wallet identity.
4. Open the deal URL and click **"Accept & Fund Escrow"**. The transaction locks the funds into the Soroban smart contract (`Status: Funded`).

### 1:30 – 2:15: Delivery & Review
1. Switch back to **Seller**.
2. Click **"Kirim Bukti" (Submit Delivery)**, paste a delivery link (e.g., GitHub/Google Drive), and submit (`Status: Delivered`).
3. Switch back to **Buyer**. Show options: *Approve & Release*, *Request Revision*, *Open Dispute*, or *Mutual Cancel*.

### 2:15 – 3:00: Settlement & Public Receipt
1. Click **"Setujui & Lepaskan Dana"** as Buyer.
2. The Soroban escrow transfers the asset directly to the seller's wallet (`Status: Released`).
3. Click **"Buka Resi Publik"** to display the verified cryptographic receipt.
4. Demonstrate the **"Update via WhatsApp"** sharing trigger and show the updated public reputation profile at `/profiles/[address]`.
