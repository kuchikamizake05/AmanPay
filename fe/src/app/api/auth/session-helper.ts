import { cookies } from "next/headers";
import { SESSION_COOKIE, verifySessionToken } from "@/lib/auth/session";

export async function getSessionWallet() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(SESSION_COOKIE)?.value;
    if (!token) return null;

    const secret = process.env.AUTH_SESSION_SECRET;
    if (!secret) {
      console.error("AUTH_SESSION_SECRET tidak dikonfigurasi di server");
      return null;
    }

    const session = verifySessionToken(token, secret);
    return session.wallet;
  } catch {
    return null;
  }
}
