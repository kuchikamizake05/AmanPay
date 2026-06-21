import { createHmac, timingSafeEqual } from "node:crypto";

export const SESSION_COOKIE = "amanpay_session";

export type WalletSession = { wallet: string; expiresAt: number };

const encode = (value: string) => Buffer.from(value).toString("base64url");
const sign = (payload: string, secret: string) =>
  createHmac("sha256", secret).update(payload).digest("base64url");

function validateSecret(secret: string) {
  if (secret.length < 32) throw new Error("AUTH_SESSION_SECRET minimal 32 karakter");
}

export function createSessionToken(session: WalletSession, secret: string) {
  validateSecret(secret);
  const payload = encode(JSON.stringify(session));
  return `${payload}.${sign(payload, secret)}`;
}

export function verifySessionToken(token: string, secret: string, now = Math.floor(Date.now() / 1_000)) {
  validateSecret(secret);
  const [payload, signature] = token.split(".");
  if (!payload || !signature) throw new Error("Session tidak valid");
  const expected = sign(payload, secret);
  const actualBytes = Buffer.from(signature);
  const expectedBytes = Buffer.from(expected);
  if (actualBytes.length !== expectedBytes.length || !timingSafeEqual(actualBytes, expectedBytes)) {
    throw new Error("Session tidak valid");
  }
  const session = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as WalletSession;
  if (!session.wallet || !Number.isFinite(session.expiresAt)) throw new Error("Session tidak valid");
  if (now > session.expiresAt) throw new Error("Session sudah kedaluwarsa");
  return session;
}
