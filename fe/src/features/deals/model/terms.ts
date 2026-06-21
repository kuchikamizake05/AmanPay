const STROOPS_PER_UNIT = 10_000_000n;

export type CanonicalValue =
  | null
  | boolean
  | number
  | string
  | CanonicalValue[]
  | { [key: string]: CanonicalValue };

export function parseAmountToStroops(value: string): bigint {
  const normalized = value.trim();
  if (!/^\d+(?:\.\d+)?$/.test(normalized)) {
    throw new Error("Nominal tidak valid");
  }

  const [whole, fraction = ""] = normalized.split(".");
  if (fraction.length > 7) {
    throw new Error("Maksimal 7 angka desimal");
  }

  const result = BigInt(whole) * STROOPS_PER_UNIT + BigInt(fraction.padEnd(7, "0") || "0");
  if (result <= 0n) {
    throw new Error("Nominal harus lebih dari 0");
  }
  return result;
}

export function canonicalizeTerms(value: CanonicalValue): string {
  if (value === null || typeof value !== "object") {
    return JSON.stringify(value);
  }
  if (Array.isArray(value)) {
    return `[${value.map(canonicalizeTerms).join(",")}]`;
  }

  return `{${Object.keys(value)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${canonicalizeTerms(value[key])}`)
    .join(",")}}`;
}

export async function hashTerms(value: CanonicalValue): Promise<string> {
  const bytes = new TextEncoder().encode(canonicalizeTerms(value));
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}
