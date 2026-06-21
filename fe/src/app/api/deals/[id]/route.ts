import { NextResponse } from "next/server";
import { stellarConfig } from "@/config/stellar";
import {
  asCanonicalValue,
  type CanonicalDealTerms,
} from "@/features/deals/model/metadata";
import { hashTerms } from "@/features/deals/model/terms";
import { readContractDeal } from "@/lib/stellar/contract";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  _: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const chain = await readContractDeal(id);
    const supabase = getSupabaseAdmin();
    let metadata: CanonicalDealTerms | null = null;
    let txHash: string | null = null;
    if (supabase) {
      const { data } = await supabase
        .from("deals")
        .select("metadata,tx_hash")
        .eq("contract_deal_id", id)
        .eq("network", stellarConfig.network)
        .eq("contract_id", stellarConfig.contractId)
        .maybeSingle();
      metadata = (data?.metadata as CanonicalDealTerms | undefined) ?? null;
      txHash = data?.tx_hash ?? null;
    }
    const metadataHash = metadata
      ? await hashTerms(asCanonicalValue(metadata))
      : null;
    return NextResponse.json({
      chain,
      metadata,
      txHash,
      termsHashVerified: metadataHash === chain.termsHash,
    });
  } catch (cause) {
    return NextResponse.json(
      {
        error: cause instanceof Error ? cause.message : "Deal tidak ditemukan",
      },
      { status: 404 },
    );
  }
}
