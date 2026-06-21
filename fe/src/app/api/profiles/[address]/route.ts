import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  try {
    const { address } = await params;
    if (!address || !/^[GC][A-Z2-7]{55}$/.test(address)) {
      return NextResponse.json({ error: "Alamat wallet tidak valid" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({
        wallet: address,
        stats: { completedCount: 0, disputedCount: 0, totalVolume: "0" },
        completedDeals: [],
      });
    }

    // 1. Fetch all deals where user is seller or buyer
    const { data: deals, error: dealsError } = await supabase
      .from("deals")
      .select("contract_deal_id,title,deal_type,amount_stroops,seller_address,buyer_address,asset_address,created_at")
      .or(`seller_address.eq.${address},buyer_address.eq.${address}`)
      .order("created_at", { ascending: false });

    if (dealsError) {
      throw new Error(dealsError.message);
    }

    if (!deals || deals.length === 0) {
      return NextResponse.json({
        wallet: address,
        stats: { completedCount: 0, disputedCount: 0, totalVolume: "0" },
        completedDeals: [],
      });
    }

    const dealIds = deals.map((d) => d.contract_deal_id);

    // 2. Fetch all events for these deals to calculate status
    const { data: events, error: eventsError } = await supabase
      .from("deal_events")
      .select("contract_deal_id,event_type,resulting_status,created_at")
      .in("contract_deal_id", dealIds)
      .order("created_at", { ascending: true });

    if (eventsError) {
      throw new Error(eventsError.message);
    }

    // Process status for each deal
    const dealStatusMap: Record<string, string> = {};
    const dealEverDisputed = new Set<string>();

    if (events) {
      for (const ev of events) {
        dealStatusMap[ev.contract_deal_id] = ev.resulting_status;
        if (ev.resulting_status === "Disputed" || ev.event_type === "open_dispute") {
          dealEverDisputed.add(ev.contract_deal_id);
        }
      }
    }

    let completedCount = 0;
    let totalVolumeStroops = BigInt(0);
    const completedDeals: any[] = [];

    for (const deal of deals) {
      const status = dealStatusMap[deal.contract_deal_id] || "Created";
      if (status === "Released") {
        completedCount++;
        totalVolumeStroops += BigInt(deal.amount_stroops || 0);
        completedDeals.push({
          ...deal,
          status,
        });
      }
    }

    const disputedCount = dealEverDisputed.size;

    return NextResponse.json({
      wallet: address,
      stats: {
        completedCount,
        disputedCount,
        totalVolume: String(totalVolumeStroops),
      },
      completedDeals,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
