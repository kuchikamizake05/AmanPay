import { Networks } from "@stellar/stellar-sdk";

export const stellarConfig = {
  network: "testnet" as const,
  networkPassphrase: Networks.TESTNET,
  rpcUrl:
    process.env.NEXT_PUBLIC_STELLAR_RPC_URL ??
    "https://soroban-testnet.stellar.org",
  contractId: process.env.NEXT_PUBLIC_AMANPAY_CONTRACT_ID ?? "",
  readSource: process.env.STELLAR_READ_SOURCE ?? "",
  defaultResolver: process.env.NEXT_PUBLIC_DEFAULT_RESOLVER ?? "",
  assets: [
    {
      code: "XLM",
      name: "Stellar Lumens",
      contractId:
        process.env.NEXT_PUBLIC_XLM_SAC_ID ??
        "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC",
    },
    {
      code: "USDC",
      name: "Mock USDC",
      contractId:
        process.env.NEXT_PUBLIC_USDC_SAC_ID ??
        "CD72G634XB5BMTMGJ43ER7Q5QLEYX7XGS6JT7BOMDJTOGTBL3EP4JD66",
    },
  ],
};
