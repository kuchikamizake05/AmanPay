import {
  BASE_FEE,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
} from "@stellar/stellar-sdk";
import { stellarConfig } from "@/config/stellar";
import type { DealInput } from "@/features/deals/model/deal";
import { createDealArgs, normalizeChainDeal, type ChainDeal } from "./codec";

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
