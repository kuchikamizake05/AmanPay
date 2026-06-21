import { NextResponse } from "next/server";
import { stellarConfig } from "@/config/stellar";
import {
  asCanonicalValue,
  type CanonicalDealTerms,
} from "@/features/deals/model/metadata";
import { hashTerms } from "@/features/deals/model/terms";
import { readContractDeal } from "@/lib/stellar/contract";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { getSessionWallet } from "../../auth/session-helper";

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
    let timeline: any[] = [];
    let deliveries: any[] = [];
    let privateNotes: any[] = [];
    let stateMismatch = false;

    const sessionWallet = await getSessionWallet();

    if (supabase) {
      // 1. Fetch metadata and creation tx hash
      const { data: deal } = await supabase
        .from("deals")
        .select("metadata,tx_hash")
        .eq("contract_deal_id", id)
        .eq("network", stellarConfig.network)
        .eq("contract_id", stellarConfig.contractId)
        .maybeSingle();
      metadata = (deal?.metadata as CanonicalDealTerms | undefined) ?? null;
      txHash = deal?.tx_hash ?? null;

      // 2. Fetch public timeline events
      const { data: events } = await supabase
        .from("deal_events")
        .select("*")
        .eq("contract_deal_id", id)
        .order("created_at", { ascending: true });
      timeline = events ?? [];

      // 3. Detect state mismatch (e.g. if contract status doesn't match last event)
      if (chain.status !== "Created") {
        const lastEvent = timeline.length > 0 ? timeline[timeline.length - 1] : null;
        if (!lastEvent || lastEvent.resulting_status !== chain.status) {
          stateMismatch = true;
        }
      }

      // 4. Fetch private data if user session is authorized
      let showPrivate = false;
      if (sessionWallet) {
        if (sessionWallet === chain.buyer || sessionWallet === chain.seller) {
          showPrivate = true;
        } else if (sessionWallet === chain.resolver && chain.status === "Disputed") {
          showPrivate = true;
        }
      }

      if (showPrivate) {
        const { data: delivs } = await supabase
          .from("deliveries")
          .select("*")
          .eq("contract_deal_id", id)
          .order("revision", { ascending: true });
        deliveries = delivs ?? [];

        const { data: notes } = await supabase
          .from("deal_private_notes")
          .select("*")
          .eq("contract_deal_id", id)
          .order("created_at", { ascending: true });
        privateNotes = notes ?? [];
      }
    }

    const metadataHash = metadata
      ? await hashTerms(asCanonicalValue(metadata))
      : null;

    return NextResponse.json({
      chain,
      metadata,
      txHash,
      termsHashVerified: metadataHash === chain.termsHash,
      timeline,
      privateData: sessionWallet && (chain.buyer === sessionWallet || chain.seller === sessionWallet || (chain.resolver === sessionWallet && chain.status === "Disputed"))
        ? { deliveries, privateNotes }
        : null,
      stateMismatch,
      sessionWallet,
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
