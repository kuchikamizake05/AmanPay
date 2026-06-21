import {
  Account,
  Keypair,
  Operation,
  Transaction,
  TransactionBuilder,
} from "@stellar/stellar-sdk";
import { stellarConfig } from "@/config/stellar";

const CHALLENGE_KEY = "amanpay_auth";

type ChallengeInput = {
  wallet: string;
  sequence: string;
  nonce: string;
  now: number;
  expiresAt: number;
};

export function buildAuthChallenge(input: ChallengeInput) {
  if (input.nonce.length > 64) throw new Error("Nonce terlalu panjang");
  return new TransactionBuilder(new Account(input.wallet, input.sequence), {
    fee: "100",
    networkPassphrase: stellarConfig.networkPassphrase,
    timebounds: { minTime: input.now, maxTime: input.expiresAt },
  })
    .addOperation(Operation.manageData({ name: CHALLENGE_KEY, value: input.nonce }))
    .build();
}

type VerifyInput = {
  signedXdr: string;
  wallet: string;
  nonce: string;
  now: number;
  expiresAt: number;
};

export function verifyAuthChallenge(input: VerifyInput) {
  if (input.now > input.expiresAt) throw new Error("Challenge sudah kedaluwarsa");
  const transaction = TransactionBuilder.fromXDR(input.signedXdr, stellarConfig.networkPassphrase);
  if (!(transaction instanceof Transaction)) throw new Error("Challenge XDR tidak valid");
  if (transaction.source !== input.wallet) throw new Error("Source challenge tidak valid");
  if (!transaction.timeBounds || Number(transaction.timeBounds.maxTime) !== input.expiresAt) {
    throw new Error("Time bounds challenge tidak valid");
  }
  if (transaction.operations.length !== 1) throw new Error("Operation challenge tidak valid");
  const operation = transaction.operations[0];
  if (operation.type !== "manageData" || operation.name !== CHALLENGE_KEY) {
    throw new Error("Operation challenge tidak valid");
  }
  const nonce = operation.value?.toString("utf8") ?? "";
  if (nonce !== input.nonce) throw new Error("Nonce challenge tidak valid");

  const keypair = Keypair.fromPublicKey(input.wallet);
  const valid = transaction.signatures.some((decorated) =>
    keypair.verify(transaction.hash(), decorated.signature()),
  );
  if (!valid) throw new Error("Signature challenge tidak valid");
  return true;
}
