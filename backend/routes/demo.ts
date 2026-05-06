import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { config } from "../config";
import { getSigner } from "../lib/contracts";
import { TOKENS } from "../lib/algebra";
import { runCycle } from "../orchestrator";

const router = Router();

const SWAP_ROUTER_ABI = [
  "function exactInputSingle((address tokenIn,address tokenOut,address recipient,uint256 deadline,uint256 amountIn,uint256 amountOutMinimum,uint160 limitSqrtPrice)) external payable returns (uint256 amountOut)",
];
const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) external view returns (uint256)",
];

const SWAP_ROUTER = "0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A";

/**
 * Demo: forces a price divergence by swapping a chunk of token0 for token1 (or vice versa)
 * through the Algebra SwapRouter. This is a real on-chain mainnet swap. ArbitrageAgent
 * picks up the new pool price on the next cycle and self-arbs.
 */
router.post("/demo/trigger-divergence", async (req: Request, res: Response) => {
  try {
    const direction = (req.body?.direction as "buy_wkite" | "sell_wkite") || "buy_wkite";
    const amount = BigInt(Math.floor((req.body?.amountUsdc ?? 1) * 1e6));
    const signer = getSigner();

    const tokenIn = direction === "buy_wkite" ? TOKENS.USDC_E : TOKENS.WKITE;
    const tokenOut = direction === "buy_wkite" ? TOKENS.WKITE : TOKENS.USDC_E;
    const inAmount = direction === "buy_wkite" ? amount : ethers.parseUnits("1", 18);

    const tokenInContract = new ethers.Contract(tokenIn, ERC20_ABI, signer);
    const approveTx = await tokenInContract.approve(SWAP_ROUTER, inAmount);
    await approveTx.wait();

    const sr = new ethers.Contract(SWAP_ROUTER, SWAP_ROUTER_ABI, signer);
    const params = {
      tokenIn,
      tokenOut,
      recipient: signer.address,
      deadline: Math.floor(Date.now() / 1000) + 600,
      amountIn: inAmount,
      amountOutMinimum: 0,
      limitSqrtPrice: 0,
    };
    const tx = await sr.exactInputSingle(params);
    const receipt = await tx.wait();

    res.json({ txHash: receipt.hash, direction, amountIn: inAmount.toString() });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.post("/demo/trigger-volume", async (req: Request, res: Response) => {
  try {
    const swaps = Math.min(5, Number(req.body?.swaps ?? 3));
    const amountPer = BigInt(Math.floor((req.body?.amountUsdc ?? 0.5) * 1e6));
    const signer = getSigner();

    const tokenInContract = new ethers.Contract(TOKENS.USDC_E, ERC20_ABI, signer);
    await (await tokenInContract.approve(SWAP_ROUTER, amountPer * BigInt(swaps))).wait();

    const sr = new ethers.Contract(SWAP_ROUTER, SWAP_ROUTER_ABI, signer);
    const txHashes: string[] = [];
    for (let i = 0; i < swaps; i++) {
      const tx = await sr.exactInputSingle({
        tokenIn: TOKENS.USDC_E,
        tokenOut: TOKENS.WKITE,
        recipient: signer.address,
        deadline: Math.floor(Date.now() / 1000) + 600,
        amountIn: amountPer,
        amountOutMinimum: 0,
        limitSqrtPrice: 0,
      });
      const r = await tx.wait();
      txHashes.push(r.hash);
    }
    res.json({ txHashes, swaps });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.post("/demo/trigger-rebalance", async (_req: Request, res: Response) => {
  try {
    const summary = await runCycle();
    res.json(summary);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.post("/demo/run-cycle", async (req: Request, res: Response) => {
  try {
    const dryRun = Boolean(req.body?.dryRun);
    const summary = await runCycle({ dryRun });
    res.json(summary);
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.get("/demo/info", (_req: Request, res: Response) => {
  res.json({
    capitalRouter: config.capitalRouterAddress,
    auditLog: config.auditLogAddress,
    pool: config.algebraPoolAddress,
    chainId: config.chainId,
    explorer: "https://kitescan.ai",
    goldskyEndpoint: config.goldskyEndpoint,
  });
});

export default router;
