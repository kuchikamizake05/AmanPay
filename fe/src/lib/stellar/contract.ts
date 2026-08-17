import {
  Address,
  BASE_FEE,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import { stellarConfig } from "@/config/stellar";
import type { DealInput } from "@/features/deals/model/deal";
import type { DealAction } from "@/features/deals/model/lifecycle";
import {
  createDealArgs,
  normalizeChainDeal,
  bytes32ScVal,
  enumScVal,
  type ChainDeal,
} from "./codec";

export { createDealArgs, verifyMetadata, type ChainDeal } from "./codec";

const server = new rpc.Server(stellarConfig.rpcUrl);

export type SignTransaction = (xdr: string) => Promise<string>;

export async function createContractDeal(
  input: DealInput,
  termsHash: string,
  signTransaction: SignTransaction,
) {
  if (!stellarConfig.contractId)
    throw new Error("Contract ID belum dikonfigurasi");
  const account = await server.getAccount(input.seller);
  const contract = new Contract(stellarConfig.contractId);
  let transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: stellarConfig.networkPassphrase,
  })
    .addOperation(
      contract.call("create_deal", ...createDealArgs(input, termsHash)),
    )
    .setTimeout(180)
    .build();

  const simulation = await server.simulateTransaction(transaction);
  if (rpc.Api.isSimulationError(simulation)) {
    throw new Error(`Simulasi gagal: ${simulation.error}`);
  }
  transaction = rpc.assembleTransaction(transaction, simulation).build();
  const signedXdr = await signTransaction(transaction.toXDR());
  const signed = TransactionBuilder.fromXDR(
    signedXdr,
    stellarConfig.networkPassphrase,
  );
  const submission = await server.sendTransaction(signed);
  if (submission.status === "ERROR")
    throw new Error("Transaksi ditolak jaringan");

  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    const result = await server.getTransaction(submission.hash);
    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return {
        dealId: BigInt(scValToNative(result.returnValue!)).toString(),
        txHash: submission.hash,
      };
    }
    if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaksi gagal dikonfirmasi");
    }
  }
  throw new Error("Konfirmasi transaksi terlalu lama");
}

export async function readContractDeal(id: string): Promise<ChainDeal> {
  if (!stellarConfig.contractId || !stellarConfig.readSource) {
    throw new Error("Contract ID atau STELLAR_READ_SOURCE belum dikonfigurasi");
  }
  const account = await server.getAccount(stellarConfig.readSource);
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: stellarConfig.networkPassphrase,
  })
    .addOperation(
      new Contract(stellarConfig.contractId).call(
        "get_deal",
        nativeToScVal(BigInt(id), { type: "u64" }),
      ),
    )
    .setTimeout(30)
    .build();
  const simulation = await server.simulateTransaction(transaction);
  if (!rpc.Api.isSimulationSuccess(simulation) || !simulation.result)
    throw new Error("Deal tidak ditemukan");
  return normalizeChainDeal(
    scValToNative(simulation.result.retval) as Record<string, unknown>,
  );
}

function parseContractError(errorStr: string): Error {
  const match = errorStr.match(/Error\(Contract,\s*(?:ErrorM\()?(\d+)\)?\)/i);
  if (match) {
    const code = parseInt(match[1], 10);
    switch (code) {
      case 1: return new Error("Asset tidak diaktifkan pada kontrak");
      case 2: return new Error("Nominal tidak valid (harus > 0)");
      case 3: return new Error("Batas waktu pengiriman tidak valid (harus di masa depan)");
      case 4: return new Error("Periode review atau periode revisi tidak valid");
      case 5: return new Error("Pihak-pihak deal tidak valid");
      case 6: return new Error("Resolver tidak valid");
      case 7: return new Error("Deal tidak ditemukan");
      case 8: return new Error("Status deal saat ini tidak memperbolehkan aksi ini");
      case 9: return new Error("Batas waktu pengiriman belum terlewati");
      case 10: return new Error("Batas waktu review belum terlewati");
      case 11: return new Error("Batas jumlah revisi sudah tercapai");
      case 12: return new Error("Anda bukan pihak yang berwenang untuk aksi ini");
      case 13: return new Error("Kesalahan aritmatika pada kontrak");
      case 14: return new Error("Batas waktu pengiriman sudah terlewati");
      case 15: return new Error("Batas waktu review sudah terlewati");
    }
  }
  return new Error(`Simulasi gagal: ${errorStr}`);
}

export async function invokeDealAction(
  action: DealAction,
  id: string,
  args: {
    deliveryHash?: string;
    reasonHash?: string;
    opener?: string;
  },
  sourceAccount: string,
  signTransaction: SignTransaction,
) {
  if (!stellarConfig.contractId) {
    throw new Error("Contract ID belum dikonfigurasi");
  }

  const account = await server.getAccount(sourceAccount);
  const contract = new Contract(stellarConfig.contractId);

  let method = "";
  let scArgs: xdr.ScVal[] = [];
  const dealIdVal = nativeToScVal(BigInt(id), { type: "u64" });

  switch (action) {
    case "fund":
      method = "fund_deal";
      scArgs = [dealIdVal];
      break;
    case "cancel":
      method = "cancel_unfunded_deal";
      scArgs = [dealIdVal];
      break;
    case "submit_delivery":
      method = "submit_delivery";
      if (!args.deliveryHash) throw new Error("Delivery hash wajib diisi");
      scArgs = [dealIdVal, bytes32ScVal(args.deliveryHash)];
      break;
    case "approve":
      method = "approve_release";
      scArgs = [dealIdVal];
      break;
    case "request_revision":
      method = "request_revision";
      if (!args.reasonHash) throw new Error("Reason hash wajib diisi");
      scArgs = [dealIdVal, bytes32ScVal(args.reasonHash)];
      break;
    case "open_dispute":
      method = "open_dispute";
      if (!args.opener) throw new Error("Opener address wajib diisi");
      if (!args.reasonHash) throw new Error("Reason hash wajib diisi");
      scArgs = [
        dealIdVal,
        new Address(args.opener).toScVal(),
        bytes32ScVal(args.reasonHash),
      ];
      break;
    case "refund_timeout":
      method = "refund_expired_undelivered";
      scArgs = [dealIdVal];
      break;
    case "release_timeout":
      method = "release_after_review_timeout";
      scArgs = [dealIdVal];
      break;
    case "resolve_refund":
      method = "resolve_dispute";
      scArgs = [dealIdVal, enumScVal("RefundBuyer")];
      break;
    case "resolve_release":
      method = "resolve_dispute";
      scArgs = [dealIdVal, enumScVal("ReleaseSeller")];
      break;
    case "mutual_cancel":
      method = "request_or_confirm_mutual_cancel";
      if (!args.opener) throw new Error("Caller address wajib diisi");
      scArgs = [dealIdVal, new Address(args.opener).toScVal()];
      break;
    default:
      throw new Error(`Aksi tidak didukung: ${action}`);
  }

  let transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: stellarConfig.networkPassphrase,
  })
    .addOperation(contract.call(method, ...scArgs))
    .setTimeout(180)
    .build();

  const simulation = await server.simulateTransaction(transaction);
  if (rpc.Api.isSimulationError(simulation)) {
    throw parseContractError(simulation.error);
  }

  transaction = rpc.assembleTransaction(transaction, simulation).build();
  const signedXdr = await signTransaction(transaction.toXDR());
  const signed = TransactionBuilder.fromXDR(
    signedXdr,
    stellarConfig.networkPassphrase,
  );

  const submission = await server.sendTransaction(signed);
  if (submission.status === "ERROR") {
    throw new Error("Transaksi ditolak jaringan");
  }

  for (let attempt = 0; attempt < 30; attempt += 1) {
    await new Promise((resolve) => setTimeout(resolve, 1_000));
    const result = await server.getTransaction(submission.hash);
    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      return {
        txHash: submission.hash,
        ledger: result.ledger,
      };
    }
    if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error("Transaksi gagal dikonfirmasi");
    }
  }
  throw new Error("Konfirmasi transaksi terlalu lama");
}
