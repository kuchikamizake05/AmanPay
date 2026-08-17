import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileCheck2,
  LockKeyhole,
  MessagesSquare,
  Gamepad2,
  KeyRound,
  ShieldAlert,
  Code2,
} from "lucide-react";

export default function Home() {
  return (
    <main>
      <section className="hero shell">
        <div className="hero__copy reveal">
          <p className="eyebrow">Zero-Scam Escrow for Facebook Groups, Messenger & Digital Commerce</p>
          <h1>
            Clear terms.
            <br />
            <em>Non-custodial escrow.</em>
          </h1>
          <p className="hero__lede">
            Trading game accounts, software licenses, in-game assets, subscriptions, or freelance services with strangers on Facebook Groups & Messenger? Replace corrupt human middlemen with automated, trustless Stellar Soroban smart contracts.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" href="/deals/new">
              Create Secure Deal <ArrowRight size={18} />
            </Link>
            <Link className="text-link" href="/dashboard">
              View My Deals
            </Link>
          </div>
          <p className="microcopy">
            <Check size={14} /> Running on Stellar Testnet · 100% Non-Custodial · No Middleman Risk
          </p>
        </div>
        <div
          className="receipt-card reveal reveal--late"
          aria-label="Example deal card"
        >
          <div className="receipt-card__top">
            <span>AMANPAY / 001</span>
            <span className="live-dot">LIVE ESCROW</span>
          </div>
          <p className="receipt-card__label">Valorant Radiant Account + Email Access</p>
          <strong className="receipt-card__amount">50.00 USDC</strong>
          <div className="secure-line">
            <LockKeyhole size={18} />
            <div>
              <b>Funds Locked in Smart Contract</b>
              <span>Awaiting seller credentials & buyer verification</span>
            </div>
          </div>
          <div className="receipt-card__parties">
            <span>
              Buyer
              <br />
              <b>GBUY…4H2A</b>
            </span>
            <span>
              Seller
              <br />
              <b>GSELL…P91K</b>
            </span>
          </div>
          <div className="receipt-card__seal">
            VERIFIED
            <br />
            <small>STELLAR</small>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <span>Immutable Terms Hash</span>
        <i /> <span>Zero Human Middlemen</span>
        <i /> <span>Verifiable Settlement Receipts</span>
      </section>

      {/* Real-world Problem & Use Cases */}
      <section className="section shell">
        <div className="section-heading">
          <p className="eyebrow">The Real Problem with Social Commerce</p>
          <h2>
            Human &ldquo;Rekber&rdquo; admins exit-scam.
            <br />
            AmanPay smart contracts enforce pure math.
          </h2>
          <p className="max-w-2xl text-sm text-[#667068] mt-2">
            Millions trade digital assets in unmoderated Facebook Groups and chat apps every day. Traditional manual middlemen hold your money in personal bank accounts, impersonate trusted admins, or vanish with funds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 my-8">
          <div className="bg-white/60 border border-[#d8d2c3] p-6 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-red-100 text-red-600 flex items-center justify-center mb-4">
              <ShieldAlert size={20} />
            </div>
            <h3 className="font-bold text-base text-[#17231e] mb-1">Human Middleman Risks</h3>
            <p className="text-xs text-[#667068] leading-relaxed">
              Fake admin clones, slow manual transfers, and exit scams. If the middleman gets compromised, both parties lose everything.
            </p>
          </div>

          <div className="bg-white/60 border border-[#d8d2c3] p-6 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mb-4">
              <Gamepad2 size={20} />
            </div>
            <h3 className="font-bold text-base text-[#17231e] mb-1">Game Accounts & Currency</h3>
            <p className="text-xs text-[#667068] leading-relaxed">
              Trading high-tier accounts (MLBB, Steam, Valorant) or in-game items? Lock buyer funds until credentials and full email access are transferred.
            </p>
          </div>

          <div className="bg-white/60 border border-[#d8d2c3] p-6 rounded-xl">
            <div className="w-10 h-10 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center mb-4">
              <KeyRound size={20} />
            </div>
            <h3 className="font-bold text-base text-[#17231e] mb-1">Subscriptions, Keys & Freelance</h3>
            <p className="text-xs text-[#667068] leading-relaxed">
              Trading premium software access, Notion templates, source code, or design commissions. Automated review windows and milestone deliveries.
            </p>
          </div>
        </div>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <p className="eyebrow">How It Works</p>
          <h2>From Messenger Chat to On-Chain Finality</h2>
        </div>
        <div className="steps-grid">
          <article>
            <span className="step-number">01</span>
            <MessagesSquare />
            <h3>AI Intake from Chat</h3>
            <p>
              Paste conversation text or upload a screenshot from Facebook Messenger or WhatsApp. Gemini AI extracts items, price, and deadlines instantly.
            </p>
          </article>
          <article>
            <span className="step-number">02</span>
            <LockKeyhole />
            <h3>Smart Contract Custody</h3>
            <p>
              Buyer locks USDC or XLM into the Soroban escrow. Funds remain untouched by any human intermediary until terms are met.
            </p>
          </article>
          <article>
            <span className="step-number">03</span>
            <FileCheck2 />
            <h3>Deliver & Settle</h3>
            <p>
              Seller submits delivery proof. Buyer approves (or review timer expires), instantly releasing payment directly to the seller with a verifiable receipt.
            </p>
          </article>
        </div>
      </section>
    </main>
  );
}
