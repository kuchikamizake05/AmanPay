"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  LoaderCircle,
  ShieldCheck,
} from "lucide-react";
import { stellarConfig } from "@/config/stellar";
import { useWallet } from "@/features/wallet/wallet-provider";
import { createContractDeal } from "@/lib/stellar/contract";
import { dealInputSchema, type DealInput, type DealType } from "../model/deal";
import { asCanonicalValue, buildCanonicalTerms } from "../model/metadata";
import { hashTerms } from "../model/terms";

const presets: Record<
  DealType,
  {
    label: string;
    hint: string;
    review: number;
    revisions: number;
    revisionHours: number;
  }
> = {
  Service: {
    label: "Jasa digital",
    hint: "Freelance, desain, development",
    review: 48,
    revisions: 2,
    revisionHours: 48,
  },
  DigitalGoods: {
    label: "Produk digital",
    hint: "Template, file, lisensi",
    review: 24,
    revisions: 0,
    revisionHours: 0,
  },
  Custom: {
    label: "Deal lainnya",
    hint: "Transaksi digital fleksibel",
    review: 48,
    revisions: 0,
    revisionHours: 0,
  },
};

function defaultDeadline() {
  const date = new Date(Date.now() + 7 * 24 * 60 * 60 * 1_000);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000)
    .toISOString()
    .slice(0, 16);
}

export function CreateDealForm() {
  const router = useRouter();
  const wallet = useWallet();
  const [dealType, setDealType] = useState<DealType>("Service");
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const preset = useMemo(() => presets[dealType], [dealType]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!wallet.address)
      return setError("Hubungkan wallet seller terlebih dahulu");
    setError(null);
    const data = new FormData(event.currentTarget);
    const candidate = {
      dealType,
      title: data.get("title"),
      description: data.get("description"),
      seller: wallet.address,
      buyer: data.get("buyer"),
      resolver: data.get("resolver"),
      asset: data.get("asset"),
      amount: data.get("amount"),
      deliveryDeadline: data.get("deliveryDeadline"),
      reviewPeriodHours: Number(data.get("reviewPeriodHours")),
      revisionLimit: Number(data.get("revisionLimit")),
      revisionPeriodHours: Number(data.get("revisionPeriodHours")),
    };
    const parsed = dealInputSchema.safeParse(candidate);
    if (!parsed.success)
      return setError(
        parsed.error.issues[0]?.message ?? "Periksa kembali detail deal",
      );
    if (!stellarConfig.contractId)
      return setError("Contract ID belum dikonfigurasi di .env.local");

    setSubmitting(true);
    try {
      const input: DealInput = parsed.data;
      const metadata = buildCanonicalTerms(input, {
        contractId: stellarConfig.contractId,
        network: "testnet",
      });
      const termsHash = await hashTerms(asCanonicalValue(metadata));
      setStatus("Menyiapkan transaksi aman…");
      const result = await createContractDeal(
        input,
        termsHash,
        wallet.signTransaction,
      );
      setStatus("Mencatat detail deal…");
      const response = await fetch("/api/deals/register", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          dealId: result.dealId,
          txHash: result.txHash,
          metadata,
        }),
      });
      if (!response.ok) {
        localStorage.setItem(
          `amanpay:pending:${result.dealId}`,
          JSON.stringify({
            dealId: result.dealId,
            txHash: result.txHash,
            metadata,
          }),
        );
        router.push(`/deals/${result.dealId}?metadata=pending`);
        return;
      }
      router.push(`/deals/${result.dealId}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Deal gagal dibuat");
    } finally {
      setSubmitting(false);
      setStatus(null);
    }
  }

  return (
    <form className="deal-form" onSubmit={submit}>
      <section className="form-section">
        <span className="form-section__number">01</span>
        <div className="form-section__body">
          <h2>Pilih bentuk deal</h2>
          <p>Semua memakai escrow yang sama; bahasanya kami sesuaikan.</p>
          <div className="preset-grid">
            {(Object.keys(presets) as DealType[]).map((type) => (
              <button
                type="button"
                className={`preset ${dealType === type ? "preset--active" : ""}`}
                onClick={() => setDealType(type)}
                key={type}
              >
                <span>{presets[type].label}</span>
                <small>{presets[type].hint}</small>
                {dealType === type ? <CheckCircle2 size={18} /> : null}
              </button>
            ))}
          </div>
        </div>
      </section>
      <section className="form-section">
        <span className="form-section__number">02</span>
        <div className="form-section__body">
          <h2>Apa yang disepakati?</h2>
          <p>Tulis seperti menjelaskan deal kepada teman yang netral.</p>
          <div className="field-grid">
            <label className="field field--wide">
              <span>Judul deal</span>
              <input
                name="title"
                placeholder="Contoh: Landing page toko kopi"
                required
              />
            </label>
            <label className="field field--wide">
              <span>Deskripsi dan hasil yang diharapkan</span>
              <textarea
                name="description"
                rows={5}
                placeholder="Tiga section, mobile responsive, final file melalui GitHub…"
                required
              />
            </label>
            <label className="field">
              <span>Nominal</span>
              <div className="input-affix">
                <input
                  name="amount"
                  inputMode="decimal"
                  placeholder="500000"
                  required
                />
                <b>unit</b>
              </div>
            </label>
            <label className="field">
              <span>Aset</span>
              <select name="asset">
                {stellarConfig.assets.map((asset) => (
                  <option key={asset.code} value={asset.contractId}>
                    {asset.code} · {asset.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Deadline pengiriman</span>
              <input
                name="deliveryDeadline"
                type="datetime-local"
                defaultValue={defaultDeadline()}
                required
              />
            </label>
            <label className="field">
              <span>Wallet buyer</span>
              <input name="buyer" placeholder="G…" required />
            </label>
          </div>
        </div>
      </section>
      <section className="form-section">
        <span className="form-section__number">03</span>
        <div className="form-section__body">
          <h2>Aturan perlindungan</h2>
          <p>
            Nilai awal cocok untuk {preset.label.toLowerCase()}, tetapi bisa
            diubah.
          </p>
          <div className="field-grid">
            <label className="field">
              <span>Waktu review (jam)</span>
              <input
                key={`${dealType}-review`}
                name="reviewPeriodHours"
                type="number"
                min="1"
                defaultValue={preset.review}
              />
            </label>
            <label className="field">
              <span>Maksimal revisi</span>
              <input
                key={`${dealType}-limit`}
                name="revisionLimit"
                type="number"
                min="0"
                max="10"
                defaultValue={preset.revisions}
              />
            </label>
            <label className="field">
              <span>Waktu tiap revisi (jam)</span>
              <input
                key={`${dealType}-revision`}
                name="revisionPeriodHours"
                type="number"
                min="0"
                defaultValue={preset.revisionHours}
              />
            </label>
            <label className="field field--wide">
              <span>Wallet resolver</span>
              <input
                name="resolver"
                defaultValue={stellarConfig.defaultResolver}
                placeholder="G… pihak netral"
                required
              />
              <small>
                Resolver hanya dapat menentukan refund atau release ketika deal
                disputed.
              </small>
            </label>
          </div>
        </div>
      </section>
      <div className="sign-panel">
        <div>
          <ShieldCheck />
          <span>
            <b>Seller menandatangani pembuatan deal</b>
            <small>{wallet.address ?? "Wallet belum terhubung"}</small>
          </span>
        </div>
        {error ? (
          <p className="form-error" role="alert">
            {error}
          </p>
        ) : null}
        {status ? (
          <p className="form-status">
            <LoaderCircle className="spin" size={16} /> {status}
          </p>
        ) : null}
        <button
          className="button button--primary"
          type="submit"
          disabled={submitting}
        >
          {submitting ? "Memproses…" : "Review & buat deal"}
          <ArrowRight size={18} />
        </button>
      </div>
    </form>
  );
}
