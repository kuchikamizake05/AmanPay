import { NextResponse } from "next/server";
import { rpc, xdr, scValToNative, Networks, StrKey, Transaction, TransactionBuilder } from "@stellar/stellar-sdk";
import { stellarConfig } from "@/config/stellar";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { readContractDeal } from "@/lib/stellar/contract";
import { hashPrivateMetadata } from "@/features/deals/model/private-metadata";
import { getSessionWallet } from "../../../auth/session-helper";

// Helper to convert Uint8Array/Buffer to hex string
function toHex(value: unknown): string {
  if (!value) return "";
  if (value instanceof Uint8Array || Buffer.isBuffer(value)) {
    return Array.from(value, (b) => b.toString(16).padStart(2, "0")).join("");
  }
  return String(value);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { txHash, eventType, payload } = body;

    if (!txHash || !eventType) {
      return NextResponse.json({ error: "Parameter tidak lengkap" }, { status: 400 });
    }

    const supabase = getSupabaseAdmin();
    if (!supabase) {
      return NextResponse.json({ error: "Database tidak terhubung" }, { status: 500 });
    }

    // Idempotency: check if event already recorded
    const { data: existingEvent } = await supabase
      .from("deal_events")
      .select("id")
      .eq("tx_hash", txHash)
      .maybeSingle();

    if (existingEvent) {
      return NextResponse.json({ success: true, message: "Event sudah terdaftar" });
    }

    // Fetch transaction from RPC
    const server = new rpc.Server(stellarConfig.rpcUrl);
    const txResult = await server.getTransaction(txHash);

    if (txResult.status !== rpc.Api.GetTransactionStatus.SUCCESS) {
      return NextResponse.json({ error: "Transaksi tidak sukses atau belum dikonfirmasi" }, { status: 400 });
    }

    // Parse envelope XDR
    const tx = TransactionBuilder.fromXDR(txResult.envelopeXdr as unknown as string, stellarConfig.networkPassphrase);
    if (!(tx instanceof Transaction)) {
      return NextResponse.json({ error: "Bukan standard transaction" }, { status: 400 });
    }

    const operations = tx.tx.operations();
    const op = operations[0];

    if (!op || op.body().switch().name !== "invokeHostFunction") {
      return NextResponse.json({ error: "Bukan transaksi contract call" }, { status: 400 });
    }

    const invokeOp = op.body().invokeHostFunctionOp();
    const hostFunction = invokeOp.hostFunction();

    if (hostFunction.switch().name !== "hostFunctionTypeInvokeContract") {
      return NextResponse.json({ error: "Bukan transaksi invocation contract" }, { status: 400 });
    }

    const invokeContract = hostFunction.invokeContract();
    const encodedContractId = StrKey.encodeContract(invokeContract.contractAddress().contractId() as any);
    const parsedFunctionName = invokeContract.functionName().toString();
    const parsedArgs = invokeContract.args();

    // Verify Contract ID
    if (encodedContractId !== stellarConfig.contractId) {
      return NextResponse.json({ error: "Target contract tidak cocok" }, { status: 400 });
    }

    // Verify Method Name
    const actionToMethodMap: Record<string, string> = {
      fund: "fund_deal",
      cancel: "cancel_unfunded_deal",
      submit_delivery: "submit_delivery",
      approve: "approve_release",
      request_revision: "request_revision",
      open_dispute: "open_dispute",
      refund_timeout: "refund_expired_undelivered",
      release_timeout: "release_after_review_timeout",
      resolve_refund: "resolve_dispute",
      resolve_release: "resolve_dispute",
    };

    const expectedMethod = actionToMethodMap[eventType];
    if (parsedFunctionName !== expectedMethod) {
      return NextResponse.json({ error: "Method invocation tidak cocok" }, { status: 400 });
    }

    // Verify Deal ID (first parameter)
    const firstArg = parsedArgs[0];
    const parsedDealId = firstArg ? String(scValToNative(firstArg)) : "";
    if (parsedDealId !== id) {
      return NextResponse.json({ error: "Deal ID invocation tidak cocok" }, { status: 400 });
    }

    // Role-based auth verification (except for timeouts)
    const isTimeout = eventType === "refund_timeout" || eventType === "release_timeout";
    const sessionWallet = await getSessionWallet();
    const chainDeal = await readContractDeal(id);

    if (!isTimeout) {
      if (!sessionWallet) {
        return NextResponse.json({ error: "Session tidak valid" }, { status: 401 });
      }

      let isAuthorized = false;
      if (eventType === "fund" && sessionWallet === chainDeal.buyer) isAuthorized = true;
      if (eventType === "cancel" && sessionWallet === chainDeal.seller) isAuthorized = true;
      if (eventType === "submit_delivery" && sessionWallet === chainDeal.seller) isAuthorized = true;
      if (eventType === "approve" && sessionWallet === chainDeal.buyer) isAuthorized = true;
      if (eventType === "request_revision" && sessionWallet === chainDeal.buyer) isAuthorized = true;
      if (eventType === "open_dispute" && (sessionWallet === chainDeal.buyer || sessionWallet === chainDeal.seller)) isAuthorized = true;
      if ((eventType === "resolve_refund" || eventType === "resolve_release") && sessionWallet === chainDeal.resolver) isAuthorized = true;

      if (!isAuthorized) {
        return NextResponse.json({ error: "Anda tidak memiliki wewenang untuk aksi ini" }, { status: 403 });
      }
    }

    // Verify Private Metadata Payloads and Insert them
    let metadataHash: string | null = null;
    if (eventType === "submit_delivery") {
      if (!payload) return NextResponse.json({ error: "Payload delivery proof wajib ada" }, { status: 400 });
      const calculatedHash = await hashPrivateMetadata(payload);
      const onChainHash = toHex(scValToNative(parsedArgs[1]));

      if (calculatedHash !== onChainHash) {
        return NextResponse.json({ error: "Hash delivery proof tidak cocok dengan on-chain" }, { status: 400 });
      }

      metadataHash = calculatedHash;

      // Insert delivery proof
      const { error: deliveryErr } = await supabase.from("deliveries").insert({
        contract_deal_id: id,
        revision: payload.revisionNumber,
        private_url: payload.url,
        private_note: payload.note,
        payload,
        hash: calculatedHash,
        submitter: payload.seller,
      });

      if (deliveryErr) {
        return NextResponse.json({ error: "Gagal menyimpan data pengiriman privat" }, { status: 500 });
      }
    } else if (eventType === "request_revision") {
      if (!payload) return NextResponse.json({ error: "Payload alasan revisi wajib ada" }, { status: 400 });
      const calculatedHash = await hashPrivateMetadata(payload);
      const onChainHash = toHex(scValToNative(parsedArgs[1]));

      if (calculatedHash !== onChainHash) {
        return NextResponse.json({ error: "Hash alasan revisi tidak cocok dengan on-chain" }, { status: 400 });
      }

      metadataHash = calculatedHash;

      // Insert revision reason
      const { error: noteErr } = await supabase.from("deal_private_notes").insert({
        contract_deal_id: id,
        revision_number: payload.revisionNumber,
        note_type: "revision_reason",
        buyer: payload.buyer,
        reason: payload.reason,
        evidence_url: payload.evidenceUrl,
        payload,
        hash: calculatedHash,
      });

      if (noteErr) {
        return NextResponse.json({ error: "Gagal menyimpan alasan revisi privat" }, { status: 500 });
      }
    } else if (eventType === "open_dispute") {
      if (!payload) return NextResponse.json({ error: "Payload alasan dispute wajib ada" }, { status: 400 });
      const calculatedHash = await hashPrivateMetadata(payload);
      const onChainHash = toHex(scValToNative(parsedArgs[2]));

      if (calculatedHash !== onChainHash) {
        return NextResponse.json({ error: "Hash dispute tidak cocok dengan on-chain" }, { status: 400 });
      }

      metadataHash = calculatedHash;

      // Insert dispute reason
      const { error: noteErr } = await supabase.from("deal_private_notes").insert({
        contract_deal_id: id,
        note_type: "dispute_reason",
        opener: payload.opener,
        reason: payload.reason,
        evidence_url: payload.evidenceUrl,
        payload,
        hash: calculatedHash,
      });

      if (noteErr) {
        return NextResponse.json({ error: "Gagal menyimpan alasan dispute privat" }, { status: 500 });
      }
    }

    // Determine the resulting state of the deal
    const resultingStatus = chainDeal.status;
    const actor = sessionWallet || tx.source;

    // Insert into deal_events
    const { error: eventErr } = await supabase.from("deal_events").insert({
      contract_deal_id: id,
      event_type: eventType,
      actor,
      tx_hash: txHash,
      resulting_status: resultingStatus,
      metadata_hash: metadataHash,
      ledger: BigInt(txResult.ledger),
    });

    if (eventErr) {
      return NextResponse.json({ error: "Gagal menyimpan deal event" }, { status: 500 });
    }

    return NextResponse.json({ success: true, resultingStatus });
  } catch (cause) {
    return NextResponse.json(
      { error: cause instanceof Error ? cause.message : "Terjadi kesalahan internal" },
      { status: 500 },
    );
  }
}
