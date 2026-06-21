import { NextResponse } from "next/server";
import { z } from "zod";
import {
  asCanonicalValue,
  type CanonicalDealTerms,
} from "@/features/deals/model/metadata";
import { hashTerms } from "@/features/deals/model/terms";
import { readContractDeal, verifyMetadata } from "@/lib/stellar/contract";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const requestSchema = z.object({
  dealId: z.string().regex(/^\d+$/),
  txHash: z.string().min(32),
  metadata: z.object({
    schemaVersion: z.literal(1),
    network: z.literal("testnet"),
    contractId: z.string(),
    dealType: z.enum(["Service", "DigitalGoods", "Custom"]),
    title: z.string(),
    description: z.string(),
    seller: z.string(),
    buyer: z.string(),
    resolver: z.string(),
    asset: z.string(),
    amountStroops: z.string(),
    deliveryDeadline: z.number(),
    reviewPeriodSeconds: z.number(),
    revisionLimit: z.number(),
    revisionPeriodSeconds: z.number(),
  }),
});

export async function POST(request: Request) {
  try {
    const body = requestSchema.parse(await request.json());
    const metadata = body.metadata as CanonicalDealTerms;
    const [chain, termsHash] = await Promise.all([
      readContractDeal(body.dealId),
      hashTerms(asCanonicalValue(metadata)),
    ]);
    if (!verifyMetadata(chain, metadata, termsHash)) {
      return NextResponse.json(
        { error: "Metadata tidak cocok dengan deal on-chain" },
        { status: 422 },
      );
    }
    const supabase = getSupabaseAdmin();
    if (!supabase)
      return NextResponse.json(
        { error: "Supabase belum dikonfigurasi" },
        { status: 503 },
      );
    const { error } = await supabase.from("deals").upsert(
      {
        network: metadata.network,
        contract_id: metadata.contractId,
        contract_deal_id: body.dealId,
        tx_hash: body.txHash,
        deal_type: metadata.dealType,
        title: metadata.title,
        description: metadata.description,
        seller_address: metadata.seller,
        buyer_address: metadata.buyer,
        resolver_address: metadata.resolver,
        asset_address: metadata.asset,
        amount_stroops: metadata.amountStroops,
        terms_hash: termsHash,
        metadata,
      },
      {
        onConflict: "network,contract_id,contract_deal_id",
        ignoreDuplicates: true,
      },
    );
    if (error) throw error;
    return NextResponse.json({ ok: true, dealId: body.dealId });
  } catch (cause) {
    const message =
      cause instanceof Error ? cause.message : "Permintaan tidak valid";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
