"use client";

import { FormEvent, useState } from "react";
import { Send } from "lucide-react";
import { sendNativeXlm } from "@/lib/stellar/payment";
import { useWallet } from "@/features/wallet/wallet-provider";

export function NativePayment() {
  const wallet = useWallet();
  const [destination, setDestination] = useState("");
  const [amount, setAmount] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!wallet.address) return;
    setSubmitting(true);
    setError(null);
    setTxHash(null);
    setStatus("Waiting for wallet signature…");
    try {
      const result = await sendNativeXlm(
        wallet.address,
        destination.trim(),
        amount.trim(),
        wallet.signTransaction,
      );
      setTxHash(result.txHash);
      setStatus("XLM payment confirmed on Stellar Testnet.");
      await wallet.refreshBalance();
    } catch (cause) {
      setStatus(null);
      setError(cause instanceof Error ? cause.message : "XLM payment failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white/60 border border-[#d8d2c3] p-5 rounded-xl my-6">
      <div className="flex items-start justify-between gap-4 mb-4">
        <div>
          <p className="eyebrow">Stellar Testnet payment</p>
          <h2 className="text-xl font-bold text-[#17231e]">Send native XLM</h2>
          <p className="text-sm text-[#667068] mt-1">
            This sends native XLM directly. It does not fund an AmanPay escrow contract.
          </p>
        </div>
        <span className="text-sm font-bold text-[#116149] whitespace-nowrap">
          Balance: {wallet.balanceLoading ? "…" : `${wallet.nativeBalance ?? "—"} XLM`}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-3 max-w-2xl">
        <label className="grid gap-1 text-sm font-semibold text-[#17231e]">
          Recipient Stellar address
          <input
            required
            value={destination}
            onChange={(event) => setDestination(event.target.value)}
            placeholder="G…"
            className="w-full rounded-lg border border-[#d8d2c3] bg-white px-3 py-2 font-mono text-sm"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-[#17231e]">
          Amount XLM
          <input
            required
            inputMode="decimal"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            placeholder="1.5"
            className="w-full rounded-lg border border-[#d8d2c3] bg-white px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={submitting}
          className="button button--primary w-fit disabled:opacity-60"
        >
          <Send size={16} /> {submitting ? "Sending XLM…" : "Send XLM on Testnet"}
        </button>
      </form>

      {status ? <p className="mt-4 text-sm text-[#116149]" aria-live="polite">{status}</p> : null}
      {error ? <p className="mt-4 text-sm text-red-700" role="alert">{error}</p> : null}
      {txHash ? (
        <p className="mt-4 text-sm text-[#17231e]" aria-live="polite">
          Transaction hash: {" "}
          <a
            className="text-link font-mono break-all"
            href={`https://stellar.expert/explorer/testnet/tx/${txHash}`}
            target="_blank"
            rel="noreferrer"
          >
            {txHash}
          </a>
        </p>
      ) : null}
    </section>
  );
}
