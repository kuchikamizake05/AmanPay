import { NextResponse } from "next/server";
import { stellarConfig } from "@/config/stellar";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const wallet = new URL(request.url).searchParams.get("wallet");
  if (!wallet || !/^[GC][A-Z2-7]{55}$/.test(wallet)) {
    return NextResponse.json({ error: "Wallet tidak valid" }, { status: 400 });
  }
  const supabase = getSupabaseAdmin();
  if (!supabase) return NextResponse.json({ deals: [], configured: false });
  const { data, error } = await supabase
    .from("deals")
    .select(
      "contract_deal_id,title,deal_type,amount_stroops,asset_address,seller_address,buyer_address,created_at",
    )
    .or(`seller_address.eq.${wallet},buyer_address.eq.${wallet}`)
    .eq("network", stellarConfig.network)
    .eq("contract_id", stellarConfig.contractId)
    .order("created_at", { ascending: false });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ deals: data, configured: true });
}
