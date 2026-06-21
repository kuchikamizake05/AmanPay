"use client";

import { useEffect, useState } from "react";
import { Shield, User, ArrowLeftRight, Check, Loader2 } from "lucide-react";
import { useWallet } from "./wallet-provider";

export function DemoSwitcher() {
  const wallet = useWallet();
  const [activeRole, setActiveRole] = useState<"seller" | "buyer" | null>(null);
  const [loadingRole, setLoadingRole] = useState<"seller" | "buyer" | null>(null);
  const [isOpen, setIsOpen] = useState(true);

  useEffect(() => {
    if (wallet.address && wallet.isSimulator) {
      const active = localStorage.getItem("amanpay:simulator:active") as "seller" | "buyer" | null;
      setActiveRole(active);
    } else {
      setActiveRole(null);
    }
  }, [wallet.address, wallet.isSimulator]);

  const handleSwitch = async (role: "seller" | "buyer") => {
    if (loadingRole) return;
    setLoadingRole(role);
    try {
      await wallet.connectSimulator(role);
    } finally {
      setLoadingRole(null);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-50 p-3 bg-[#116149] hover:bg-[#116149]/90 text-white rounded-full shadow-lg cursor-pointer flex items-center justify-center transition-all hover:scale-105"
        title="Buka Simulator Rekber"
      >
        <ArrowLeftRight size={20} />
      </button>
    );
  }

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-sm w-80 bg-white/70 backdrop-blur-md border border-[#d8d2c3] rounded-xl shadow-xl p-5 text-[#17231e] font-sans transition-all animate-rise">
      <div className="flex items-center justify-between border-b border-[#d8d2c3]/60 pb-3 mb-3.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-[#116149]/10 text-[#116149] rounded-lg">
            <Shield size={16} />
          </div>
          <div>
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#17231e]">
              AmanPay Simulator
            </h4>
            <span className="text-[9px] font-bold text-[#667068] block">
              STELLAR TESTNET ESCROW
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-xs text-[#667068] hover:text-[#17231e] cursor-pointer"
        >
          Sembunyikan
        </button>
      </div>

      <p className="text-[11px] text-[#667068] leading-relaxed mb-4">
        Simulasikan alur transaksi seller & buyer secara instan pada Soroban contract tanpa menginstal Freighter extension.
      </p>

      <div className="flex flex-col gap-2.5">
        {/* Seller Button */}
        <button
          type="button"
          onClick={() => handleSwitch("seller")}
          disabled={wallet.connecting}
          className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all cursor-pointer ${
            activeRole === "seller"
              ? "bg-[#116149] border-[#116149] text-white shadow-sm"
              : "bg-white hover:bg-[#dceadf] border-[#d8d2c3] text-[#17231e] hover:text-[#116149]"
          }`}
        >
          <div className="flex items-center gap-2">
            <User size={14} />
            <span>Simulasikan Seller</span>
          </div>
          {loadingRole === "seller" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : activeRole === "seller" ? (
            <Check size={14} className="text-emerald-300" />
          ) : null}
        </button>

        {/* Buyer Button */}
        <button
          type="button"
          onClick={() => handleSwitch("buyer")}
          disabled={wallet.connecting}
          className={`w-full py-2.5 px-4 rounded-lg text-xs font-semibold flex items-center justify-between border transition-all cursor-pointer ${
            activeRole === "buyer"
              ? "bg-[#116149] border-[#116149] text-white shadow-sm"
              : "bg-white hover:bg-[#dceadf] border-[#d8d2c3] text-[#17231e] hover:text-[#116149]"
          }`}
        >
          <div className="flex items-center gap-2">
            <User size={14} />
            <span>Simulasikan Buyer</span>
          </div>
          {loadingRole === "buyer" ? (
            <Loader2 size={14} className="animate-spin" />
          ) : activeRole === "buyer" ? (
            <Check size={14} className="text-emerald-300" />
          ) : null}
        </button>
      </div>

      {wallet.connecting && (
        <div className="mt-3 text-[10px] text-[#116149] flex items-center gap-1.5 justify-center bg-[#dceadf]/40 py-1.5 rounded">
          <Loader2 size={12} className="animate-spin" />
          <span>Mendanai XLM & Meminta Challenge...</span>
        </div>
      )}

      {activeRole && wallet.address && (
        <div className="mt-3.5 pt-3 border-t border-[#d8d2c3]/60 text-center">
          <span className="text-[10px] text-[#667068]">
            Wallet Aktif: <code>{wallet.address.slice(0, 6)}…{wallet.address.slice(-6)}</code>
          </span>
        </div>
      )}
    </div>
  );
}
