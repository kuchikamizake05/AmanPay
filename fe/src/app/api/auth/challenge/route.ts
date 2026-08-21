import { NextResponse } from "next/server";
import { rpc } from "@stellar/stellar-sdk";
import { randomBytes } from "node:crypto";
import { stellarConfig } from "@/config/stellar";
import { buildAuthChallenge } from "@/lib/auth/challenge";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { wallet } = body;

    if (!wallet || typeof wallet !== "string" || !/^G[A-Z2-7]{55}$/.test(wallet)) {
      return NextResponse.json({ error: "Address wallet tidak valid" }, { status: 400 });
    }

    const server = new rpc.Server(stellarConfig.rpcUrl);
    let sequence = "0";
    try {
      const account = await server.getAccount(wallet);
      sequence = account.sequenceNumber();
    } catch {
      // Account might be unfunded/new, fallback to "0"
    }

    const nonce = randomBytes(16).toString("hex");
    const now = Math.floor(Date.now() / 1_000);
    const expiresAt = now + 300; // 5 minutes

    const challengeTx = buildAuthChallenge({
      wallet,
      sequence,
      nonce,
      now,
      expiresAt,
    });
    const challengeXdr = challengeTx.toXDR();

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database tidak terhubung" }, { status: 500 });
    }

    const { error: dbError } = await supabase.from("auth_challenges").insert({
      wallet,
      challenge_xdr: challengeXdr,
      nonce,
      expires_at: new Date(expiresAt * 1_000).toISOString(),
    });

    if (dbError) {
      console.error("Supabase challenge persistence failed", {
        code: dbError.code,
        message: dbError.message,
        details: dbError.details,
        hint: dbError.hint,
      });
      return NextResponse.json({ error: "Gagal menyimpan challenge" }, { status: 500 });
    }

    return NextResponse.json({ challenge: challengeXdr, expiresAt });
  } catch (cause) {
    return NextResponse.json(
      { error: cause instanceof Error ? cause.message : "Terjadi kesalahan internal" },
      { status: 500 },
    );
  }
}
