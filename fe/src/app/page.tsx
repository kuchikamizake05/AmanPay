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
import { InteractiveBackdrop } from "@/features/landing/components/interactive-backdrop";
import { LifecyclePreview } from "@/features/landing/components/lifecycle-preview";

const trustMarks = [
  "Immutable Terms Hash",
  "Zero Human Middlemen",
  "Verifiable Settlement Receipts",
  "Soroban Smart Contracts",
  "Non-Custodial Escrow",
];

function TrustMarks({ hidden = false }: { hidden?: boolean }) {
  return (
    <div className="trust-strip__group" aria-hidden={hidden || undefined}>
      {trustMarks.map((mark) => (
        <span key={mark}>
          {mark}
          <i aria-hidden="true" />
        </span>
      ))}
    </div>
  );
}

export default function Home() {
  return (
    <main className="landing-page">
      <section className="hero shell hero--interactive">
        <InteractiveBackdrop />
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
        <LifecyclePreview />
      </section>

      <section className="trust-strip" aria-label="AmanPay escrow guarantees">
        <div className="trust-strip__track">
          <TrustMarks />
          <TrustMarks hidden />
        </div>
      </section>

      {/* Real-world Problem & Use Cases */}
      <section className="section shell" id="use-cases">
        <div className="section-heading">
          <p className="eyebrow">The Real Problem with Social Commerce</p>
          <h2>
            Human &ldquo;Rekber&rdquo; admins exit-scam.
            <br />
            AmanPay smart contracts enforce pure math.
          </h2>
          <p className="section-heading__lede">
            Millions trade digital assets in unmoderated Facebook Groups and chat apps every day. Traditional manual middlemen hold your money in personal bank accounts, impersonate trusted admins, or vanish with funds.
          </p>
        </div>

        <div className="landing-card-grid">
          <article className="landing-card landing-card--danger">
            <div className="landing-card__icon landing-card__icon--danger">
              <ShieldAlert size={20} />
            </div>
            <h3>Human Middleman Risks</h3>
            <p>
              Fake admin clones, slow manual transfers, and exit scams. If the middleman gets compromised, both parties lose everything.
            </p>
          </article>

          <article className="landing-card">
            <div className="landing-card__icon landing-card__icon--green">
              <Gamepad2 size={20} />
            </div>
            <h3>Game Accounts & Currency</h3>
            <p>
              Trading high-tier accounts (MLBB, Steam, Valorant) or in-game items? Lock buyer funds until credentials and full email access are transferred.
            </p>
          </article>

          <article className="landing-card">
            <div className="landing-card__icon landing-card__icon--amber">
              <KeyRound size={20} />
            </div>
            <h3>Subscriptions, Keys & Freelance</h3>
            <p>
              Trading premium software access, Notion templates, source code, or design commissions. Automated review windows and milestone deliveries.
            </p>
          </article>
        </div>
      </section>

      <section className="section shell" id="how-it-works">
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

      <section className="section shell" id="security">
        <div className="section-heading">
          <p className="eyebrow">Security by default</p>
          <h2>Rules replace trust.</h2>
          <p className="section-heading__lede">
            AmanPay never takes custody of funds. Deal terms are hashed, escrow state is enforced on-chain, and completed transactions produce public receipts.
          </p>
        </div>
      </section>

      <section className="landing-cta shell" aria-labelledby="closing-cta-heading">
        <div className="cta-band">
          <div>
            <p className="eyebrow">Start with verifiable terms</p>
            <h2 id="closing-cta-heading">Make next deal clear before money moves.</h2>
            <p>Draft terms first. Connect your wallet only when ready to create an on-chain escrow.</p>
          </div>
          <div className="landing-cta__actions">
            <Link className="button button--paper" href="/deals/new">
              Create Secure Deal <ArrowRight size={18} />
            </Link>
            <Link className="landing-cta__proof" href="/proof">
              See Product Proof
            </Link>
          </div>
        </div>
      </section>

      <footer className="landing-footer shell">
        <div className="landing-footer__brand">
          <strong>AmanPay</strong>
          <p>Non-custodial escrow rules on Stellar Soroban Testnet.</p>
        </div>
        <nav aria-label="Footer navigation">
          <a href="#how-it-works">How It Works</a>
          <a href="#use-cases">Use Cases</a>
          <a href="#security">Security</a>
          <Link href="/proof">Proof</Link>
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/deals/new">Create Deal</Link>
        </nav>
      </footer>
    </main>
  );
}
