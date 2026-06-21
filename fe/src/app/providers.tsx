"use client";

import { WalletProvider } from "@/features/wallet/wallet-provider";
import { DemoSwitcher } from "@/features/wallet/demo-switcher";
import { stellarConfig } from "@/config/stellar";

export function Providers({ children }: { children: React.ReactNode }) {
  const isTestnet = stellarConfig.network === "testnet";

  return (
    <WalletProvider>
      {children}
      {isTestnet && <DemoSwitcher />}
    </WalletProvider>
  );
}
