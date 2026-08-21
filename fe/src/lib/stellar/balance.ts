import { stellarConfig } from "@/config/stellar";

type HorizonBalance = {
  asset_type?: string;
  balance?: string;
};

type HorizonAccount = {
  balances?: HorizonBalance[];
};

export function nativeBalanceFromAccount(account: HorizonAccount): string {
  const balance = account.balances?.find(
    (entry) => entry.asset_type === "native",
  )?.balance;
  if (!balance) throw new Error("Native XLM balance not found");
  return balance;
}

export async function fetchNativeBalance(address: string): Promise<string> {
  const response = await fetch(
    `${stellarConfig.horizonUrl}/accounts/${encodeURIComponent(address)}`,
  );
  if (!response.ok) throw new Error("Could not fetch wallet balance");
  return nativeBalanceFromAccount((await response.json()) as HorizonAccount);
}
