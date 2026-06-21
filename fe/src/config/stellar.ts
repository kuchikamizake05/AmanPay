import { Networks } from "@stellar/stellar-sdk";

const networkEnv = process.env.NEXT_PUBLIC_STELLAR_NETWORK || "testnet";
const isPublic = networkEnv === "public";

export const stellarConfig = {
  network: (isPublic ? "public" : "testnet") as "public" | "testnet",
  networkPassphrase: isPublic ? Networks.PUBLIC : Networks.TESTNET,
  rpcUrl:
    process.env.NEXT_PUBLIC_STELLAR_RPC_URL ??
    (isPublic
      ? "https://soroban-rpc.mainnet.stellar.org"
      : "https://soroban-testnet.stellar.org"),
  contractId: process.env.NEXT_PUBLIC_AMANPAY_CONTRACT_ID ?? "",
  readSource: process.env.STELLAR_READ_SOURCE ?? "",
  defaultResolver: process.env.NEXT_PUBLIC_DEFAULT_RESOLVER ?? "",
  assets: [
    {
      code: "XLM",
      name: "Stellar Lumens",
      contractId:
        process.env.NEXT_PUBLIC_XLM_SAC_ID ??
        (isPublic
          ? "CAS3JONLEKX7YZJCTGL63EPURNCZ5AE2GGQCJP3OKG5K625Q5JF6G7SO"
          : "CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC"),
    },
    {
      code: "USDC",
      name: isPublic ? "USD Coin" : "Mock USDC",
      contractId:
        process.env.NEXT_PUBLIC_USDC_SAC_ID ??
        (isPublic
          ? "CCW67TSZV3SSS2HXMBQ5JFGCKJNXKZM7UQUWUZPUTHXSTZLEO7SJMI75"
          : "CD72G634XB5BMTMGJ43ER7Q5QLEYX7XGS6JT7BOMDJTOGTBL3EP4JD66"),
    },
  ],
};
