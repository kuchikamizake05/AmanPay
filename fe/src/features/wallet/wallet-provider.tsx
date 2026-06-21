"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { stellarConfig } from "@/config/stellar";
import { Keypair, TransactionBuilder, rpc } from "@stellar/stellar-sdk";

type WalletContextValue = {
  address: string | null;
  connecting: boolean;
  isSimulator: boolean;
  connect: () => Promise<void>;
  connectSimulator: (role: "seller" | "buyer") => Promise<void>;
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
  const [isSimulator, setIsSimulator] = useState(false);

  useEffect(() => {
    fetch("/api/auth/verify")
      .then((res) => res.json())
      .then((data) => {
        if (data.wallet) {
          setAddress(data.wallet);
          const activeSim = localStorage.getItem("amanpay:simulator:active");
          if (activeSim) {
            setIsSimulator(true);
          }
        }
      })
      .catch(() => {});
  }, []);

  const connect = useCallback(async () => {
    setConnecting(true);
    try {
      const kit = await loadKit();
      const result = await new Promise<{ address: string }>(
        (resolve, reject) => {
          void kit.openModal({
            modalTitle: "Pilih wallet Stellar",
            onClosed: () => reject(new Error("UserCancelled")),
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

                // Request Challenge
                const chalRes = await fetch("/api/auth/challenge", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ wallet: account.address }),
                });
                const chalData = await chalRes.json();
                if (!chalRes.ok) {
                  throw new Error(chalData.error || "Gagal membuat auth challenge");
                }

                // Sign Challenge via Wallet
                const signedTx = await kit.signTransaction(chalData.challenge, {
                  address: account.address,
                  networkPassphrase: stellarConfig.networkPassphrase,
                });

                // Verify Challenge
                const verifyRes = await fetch("/api/auth/verify", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    signedXdr: signedTx.signedTxXdr,
                    wallet: account.address,
                  }),
                });
                const verifyData = await verifyRes.json();
                if (!verifyRes.ok) {
                  throw new Error(verifyData.error || "Gagal memverifikasi auth challenge");
                }

                localStorage.removeItem("amanpay:simulator:active");
                setIsSimulator(false);
                resolve(account);
              } catch (cause) {
                reject(cause);
              }
            },
          });
        },
      );
      setAddress(result.address);
    } catch (err) {
      if (err instanceof Error && err.message === "UserCancelled") {
        return;
      }
      console.error("Gagal menghubungkan wallet:", err);
      alert(err instanceof Error ? err.message : "Gagal menghubungkan wallet");
    } finally {
      setConnecting(false);
    }
  }, []);

  const connectSimulator = useCallback(async (role: "seller" | "buyer") => {
    setConnecting(true);
    try {
      // 1. Get or generate simulator keypair
      const keyKey = `amanpay:simulator:${role}`;
      let secret = localStorage.getItem(keyKey);
      let keypair: Keypair;
      if (!secret) {
        keypair = Keypair.random();
        secret = keypair.secret();
        localStorage.setItem(keyKey, secret);
      } else {
        keypair = Keypair.fromSecret(secret);
      }

      const pubKey = keypair.publicKey();

      // 2. Check and fund if needed
      let needsFunding = false;
      try {
        const balanceRes = await fetch(`https://horizon-testnet.stellar.org/accounts/${pubKey}`);
        if (!balanceRes.ok) {
          needsFunding = true;
        }
      } catch {
        needsFunding = true;
      }

      if (needsFunding) {
        const fundRes = await fetch(`https://friendbot.stellar.org/?addr=${pubKey}`);
        if (!fundRes.ok) {
          throw new Error("Gagal mendanai wallet simulator lewat Friendbot.");
        }
        // Wait for confirmation
        await new Promise((r) => setTimeout(r, 2000));
      }

      // 3. Request challenge
      const chalRes = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: pubKey }),
      });
      const chalData = await chalRes.json();
      if (!chalRes.ok) {
        throw new Error(chalData.error || "Gagal meminta auth challenge");
      }

      // 4. Sign locally
      const tx = TransactionBuilder.fromXDR(chalData.challenge, stellarConfig.networkPassphrase);
      tx.sign(keypair);
      const signedXdr = tx.toXDR();

      // 5. Verify challenge
      const verifyRes = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signedXdr,
          wallet: pubKey,
        }),
      });
      const verifyData = await verifyRes.json();
      if (!verifyRes.ok) {
        throw new Error(verifyData.error || "Gagal memverifikasi auth challenge");
      }

      localStorage.setItem("amanpay:simulator:active", role);
      setIsSimulator(true);
      setAddress(pubKey);
    } catch (err: any) {
      console.error("Gagal menghubungkan wallet simulator:", err);
      alert(err.message || "Gagal menghubungkan simulator");
    } finally {
      setConnecting(false);
    }
  }, []);

  const disconnect = useCallback(async () => {
    try {
      if (!isSimulator) {
        const kit = await loadKit();
        await kit.disconnect();
      }
      localStorage.removeItem("amanpay:simulator:active");
      setIsSimulator(false);
      await fetch("/api/auth/logout", { method: "POST" });
    } catch (err) {
      console.error("Gagal memutuskan wallet:", err);
    } finally {
      setAddress(null);
    }
  }, [isSimulator]);

  const signTransaction = useCallback(
    async (xdr: string) => {
      if (!address) throw new Error("Hubungkan wallet terlebih dahulu");
      if (isSimulator) {
        const role = localStorage.getItem("amanpay:simulator:active");
        const secret = role ? localStorage.getItem(`amanpay:simulator:${role}`) : null;
        if (!secret) throw new Error("Kunci privat simulator tidak ditemukan");

        const keypair = Keypair.fromSecret(secret);
        const tx = TransactionBuilder.fromXDR(xdr, stellarConfig.networkPassphrase);
        tx.sign(keypair);
        return tx.toXDR();
      } else {
        const kit = await loadKit();
        const result = await kit.signTransaction(xdr, {
          address,
          networkPassphrase: stellarConfig.networkPassphrase,
        });
        return result.signedTxXdr;
      }
    },
    [address, isSimulator],
  );

  const value = useMemo(
    () => ({
      address,
      connecting,
      isSimulator,
      connect,
      connectSimulator,
      disconnect,
      signTransaction,
    }),
    [address, connect, connectSimulator, connecting, disconnect, isSimulator, signTransaction],
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
