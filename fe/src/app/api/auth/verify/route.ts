import { NextResponse } from "next/server";
import { Transaction, TransactionBuilder } from "@stellar/stellar-sdk";
import { verifyAuthChallenge } from "@/lib/auth/challenge";
import { createSessionToken, SESSION_COOKIE } from "@/lib/auth/session";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSessionWallet } from "../session-helper";
import { stellarConfig } from "@/config/stellar";

export async function POST(request: Request) {
  try {
    // CSRF / Origin Validation
    const origin = request.headers.get("origin");
    if (origin) {
      const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
      const originUrl = new URL(origin);
      const hostUrl = new URL(originUrl.protocol + "//" + host);
      if (originUrl.host !== hostUrl.host) {
        return NextResponse.json({ error: "Permintaan tidak diotorisasi" }, { status: 403 });
      }
    }

    const body = await request.json();
    const { signedXdr, wallet } = body;

    if (!signedXdr || !wallet) {
      return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
    }

    // Parse XDR to extract nonce
    let nonce = "";
    try {
      const transaction = TransactionBuilder.fromXDR(signedXdr, stellarConfig.networkPassphrase);
      if (!(transaction instanceof Transaction)) {
        return NextResponse.json({ error: "Transaction XDR tidak valid" }, { status: 400 });
      }
      if (transaction.operations.length !== 1) {
        return NextResponse.json({ error: "Transaction operation tidak valid" }, { status: 400 });
      }
      const op = transaction.operations[0];
      if (op.type !== "manageData" || op.name !== "amanpay_auth") {
        return NextResponse.json({ error: "Transaction operation tidak valid" }, { status: 400 });
      }
      nonce = op.value?.toString("utf8") ?? "";
    } catch {
      return NextResponse.json({ error: "Gagal membaca signed XDR" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database tidak terhubung" }, { status: 500 });
    }

    // Fetch challenge from database
    const { data: challenge, error: dbError } = await supabase
      .from("auth_challenges")
      .select("*")
      .eq("nonce", nonce)
      .eq("wallet", wallet)
      .is("consumed_at", null)
      .maybeSingle();

    if (dbError || !challenge) {
      return NextResponse.json({ error: "Challenge tidak ditemukan atau sudah digunakan" }, { status: 400 });
    }

    const now = Math.floor(Date.now() / 1_000);
    const expiresAt = Math.floor(new Date(challenge.expires_at).getTime() / 1_000);

    if (now > expiresAt) {
      return NextResponse.json({ error: "Challenge sudah kedaluwarsa" }, { status: 400 });
    }

    // Verify signature
    try {
      verifyAuthChallenge({
        signedXdr,
        wallet,
        nonce,
        now,
        expiresAt,
      });
    } catch (cause) {
      return NextResponse.json(
        { error: cause instanceof Error ? cause.message : "Signature challenge tidak valid" },
        { status: 400 },
      );
    }

    // Mark challenge as consumed
    await supabase
      .from("auth_challenges")
      .update({ consumed_at: new Date().toISOString() })
      .eq("nonce", nonce);

    // Create session token
    const secret = process.env.AUTH_SESSION_SECRET;
    if (!secret) {
      return NextResponse.json({ error: "Server tidak dikonfigurasi dengan benar" }, { status: 500 });
    }

    const sessionExpiresAt = now + 24 * 3600; // 24 hours
    const token = createSessionToken(
      { wallet, expiresAt: sessionExpiresAt },
      secret,
    );

    const response = NextResponse.json({ success: true, wallet });
    response.cookies.set(SESSION_COOKIE, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 24 * 3600,
      path: "/",
    });

    return response;
  } catch (cause) {
    return NextResponse.json(
      { error: cause instanceof Error ? cause.message : "Terjadi kesalahan internal" },
      { status: 500 },
    );
  }
}

export async function GET() {
  const wallet = await getSessionWallet();
  return NextResponse.json({ wallet });
}
