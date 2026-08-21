import {
  Asset,
  BASE_FEE,
  Horizon,
  Operation,
  StrKey,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { stellarConfig } from "@/config/stellar";
import type { SignTransaction } from "./contract";

const horizon = new Horizon.Server(stellarConfig.horizonUrl);
const amountPattern = /^(?:0|[1-9]\d*)(?:\.\d{1,7})?$/;

export function validateNativePayment(destination: string, amount: string) {
  if (!StrKey.isValidEd25519PublicKey(destination)) {
    throw new Error("Recipient must be a valid Stellar public key");
  }
  if (!amountPattern.test(amount) || Number(amount) <= 0) {
    throw new Error("Amount must be greater than 0 with up to 7 decimals");
  }
}

export async function sendNativeXlm(
  source: string,
  destination: string,
  amount: string,
  signTransaction: SignTransaction,
) {
  if (!StrKey.isValidEd25519PublicKey(source)) {
    throw new Error("Connected wallet has an invalid Stellar public key");
  }
  validateNativePayment(destination, amount);

  const account = await horizon.loadAccount(source);
  const transaction = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: stellarConfig.networkPassphrase,
  })
    .addOperation(
      Operation.payment({
        destination,
        asset: Asset.native(),
        amount,
      }),
    )
    .setTimeout(180)
    .build();

  const signedXdr = await signTransaction(transaction.toXDR());
  const signed = TransactionBuilder.fromXDR(
    signedXdr,
    stellarConfig.networkPassphrase,
  );
  const result = await horizon.submitTransaction(signed);
  return { txHash: result.hash, ledger: result.ledger };
}
