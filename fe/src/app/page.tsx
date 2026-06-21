import Link from "next/link";
import {
  ArrowRight,
  Check,
  FileCheck2,
  LockKeyhole,
  MessagesSquare,
} from "lucide-react";

export default function Home() {
  return (
    <main>
      <section className="hero shell">
        <div className="hero__copy reveal">
          <p className="eyebrow">Rekber untuk transaksi dari chat</p>
          <h1>
            Deal jelas.
            <br />
            <em>Dana tetap aman.</em>
          </h1>
          <p className="hero__lede">
            Ubah kesepakatan WhatsApp, Telegram, atau DM menjadi deal bersama.
            Dana baru berpindah saat aturan terpenuhi.
          </p>
          <div className="hero__actions">
            <Link className="button button--primary" href="/deals/new">
              Buat deal aman <ArrowRight size={18} />
            </Link>
            <Link className="text-link" href="/dashboard">
              Lihat deal saya
            </Link>
          </div>
          <p className="microcopy">
            <Check size={14} /> Berjalan di Stellar Testnet · Non-custodial
          </p>
        </div>
        <div
          className="receipt-card reveal reveal--late"
          aria-label="Contoh status deal"
        >
          <div className="receipt-card__top">
            <span>AMANPAY / 001</span>
            <span className="live-dot">LIVE</span>
          </div>
          <p className="receipt-card__label">Pembuatan landing page</p>
          <strong className="receipt-card__amount">Rp 500.000</strong>
          <div className="secure-line">
            <LockKeyhole size={18} />
            <div>
              <b>Dana terkunci aman</b>
              <span>Menunggu seller mengirim hasil</span>
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
            TERVERIFIKASI
            <br />
            <small>STELLAR</small>
          </div>
        </div>
      </section>

      <section className="trust-strip">
        <span>Terms tercatat</span>
        <i /> <span>Dana non-custodial</span>
        <i /> <span>Status bisa diverifikasi</span>
      </section>

      <section className="section shell">
        <div className="section-heading">
          <p className="eyebrow">Dari obrolan menjadi kepastian</p>
          <h2>
            Rekber manual punya admin.
            <br />
            AmanPay punya aturan.
          </h2>
        </div>
        <div className="steps-grid">
          <article>
            <span className="step-number">01</span>
            <MessagesSquare />
            <h3>Tulis kesepakatan</h3>
            <p>
              Tentukan pekerjaan, nominal, deadline, dan pihak yang terlibat.
            </p>
          </article>
          <article>
            <span className="step-number">02</span>
            <LockKeyhole />
            <h3>Buyer kunci dana</h3>
            <p>
              Dana masuk escrow contract, bukan rekening admin atau AmanPay.
            </p>
          </article>
          <article>
            <span className="step-number">03</span>
            <FileCheck2 />
            <h3>Selesaikan dengan bukti</h3>
            <p>
              Seller mengirim hasil. Buyer menyetujui, lalu dana diteruskan.
            </p>
          </article>
        </div>
      </section>

      <section className="cta-band shell">
        <div>
          <p className="eyebrow">Satu link, satu sumber kebenaran</p>
          <h2>Mulai deal tanpa rasa “katanya”.</h2>
        </div>
        <Link className="button button--paper" href="/deals/new">
          Susun deal sekarang <ArrowRight size={18} />
        </Link>
      </section>
    </main>
  );
}
