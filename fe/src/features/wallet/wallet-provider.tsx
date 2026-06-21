"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { stellarConfig } from "@/config/stellar";

type WalletContextValue = {
  address: string | null;
  connecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (xdr: string) => Promise<string>;
};

const WalletContext = createContext<WalletContextValue | null>(null);
let kitPromise: ReturnType<typeof createKit> | null = null;

async function createKit() {
  const kit = await import("@creit.tech/stellar-wallets-kit");
  return new kit.StellarWalletsKit({
    network: kit.WalletNetwork.TESTNET,
    modules: [
      new kit.FreighterModule(),
      new kit.xBullModule(),
      new kit.LobstrModule(),
      new kit.AlbedoModule(),
    ],
  });
}

function loadKit() {
  kitPromise ??= createKit();
  return kitPromise;
}

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [address, setAddress] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const kit = await loadKit();
      const result = await new Promise<{ address: string }>(
        (resolve, reject) => {
          void kit.openModal({
            modalTitle: "Pilih wallet Stellar",
            onClosed: reject,
            onWalletSelected: async (option) => {
              try {
                kit.setWallet(option.id);
                const account = await kit.getAddress();
                const network = await kit.getNetwork();
                if (
                  network.networkPassphrase !== stellarConfig.networkPassphrase
                ) {
                  await kit.disconnect();
                  throw new Error("Ubah jaringan wallet ke Stellar Testnet");
                }
                resolve(account);
              } catch (cause) {
                reject(cause);
              }
            },
          });
        },
      );
      setAddress(result.address);
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    const kit = await loadKit();
    await kit.disconnect();
    setAddress(null);
  }, []);

  const signTransaction = useCallback(
    async (xdr: string) => {
      if (!address) throw new Error("Hubungkan wallet terlebih dahulu");
      const kit = await loadKit();
      const result = await kit.signTransaction(xdr, {
        address,
        networkPassphrase: stellarConfig.networkPassphrase,
      });
      return result.signedTxXdr;
    },
    [address],
  );

  const value = useMemo(
    () => ({ address, connecting, connect, disconnect, signTransaction }),
    [address, connect, connecting, disconnect, signTransaction],
  );
  return (
    <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context)
    throw new Error("useWallet harus dipakai di dalam WalletProvider");
  return context;
}
