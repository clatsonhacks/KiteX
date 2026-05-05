import { ethers } from "ethers";

// gokite-aa-sdk — install: npm install gokite-aa-sdk
// Docs: https://docs.gokite.ai/kite-chain/account-abstraction-sdk
let sdk: any;
try {
  sdk = require("gokite-aa-sdk");
} catch {
  console.warn("gokite-aa-sdk not installed. Run: npm install gokite-aa-sdk");
}

const BUNDLER_RPC = process.env.BUNDLER_RPC || "https://bundler-service.staging.gokite.ai/rpc/";
const KITE_RPC = process.env.KITE_RPC_URL || "https://rpc.gokite.ai/";

export interface SessionKeyResult {
  txHash: string;
  sessionKeyAddress: string;
  valueLimit: bigint;
}

/**
 * Issues a session key for an agent scoped to a specific function and value limit.
 * Calls addSessionKeyRule on the Kite AA system.
 */
export async function issueSessionKey(
  agentDID: string,
  functionSelector: string,
  valueLimit: bigint
): Promise<SessionKeyResult> {
  if (!sdk) throw new Error("gokite-aa-sdk not installed");
  if (!process.env.PRIVATE_KEY) throw new Error("PRIVATE_KEY not set");

  const wallet = new ethers.Wallet(process.env.PRIVATE_KEY);
  const sessionKeyWallet = ethers.Wallet.createRandom();

  const client = await sdk.createSmartAccountClient({
    privateKey: process.env.PRIVATE_KEY,
    bundlerUrl: BUNDLER_RPC,
    rpcUrl: KITE_RPC,
  });

  const txHash = await client.addSessionKeyRule({
    sessionKeyAddress: sessionKeyWallet.address,
    agentId: agentDID,
    functionSelector,
    valueLimit,
  });

  return {
    txHash,
    sessionKeyAddress: sessionKeyWallet.address,
    valueLimit,
  };
}

/**
 * Submits a signed UserOperation through the Kite bundler and waits for confirmation.
 */
export async function submitUserOp(userOp: any): Promise<string> {
  if (!sdk) throw new Error("gokite-aa-sdk not installed");

  const client = await sdk.createSmartAccountClient({
    privateKey: process.env.PRIVATE_KEY,
    bundlerUrl: BUNDLER_RPC,
    rpcUrl: KITE_RPC,
  });

  const txHash = await client.sendUserOperationAndWait(userOp);
  return txHash;
}
