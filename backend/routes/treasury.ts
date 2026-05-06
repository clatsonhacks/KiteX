import { Router, Request, Response } from "express";
import { ethers } from "ethers";
import { config } from "../config";
import { getCapitalRouter, getSigner } from "../lib/contracts";
import { TOKENS } from "../lib/algebra";

const router = Router();

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address owner) external view returns (uint256)",
];

router.post("/deposit", async (req: Request, res: Response) => {
  try {
    const { amountUsdc } = req.body as { amountUsdc?: number };
    if (!amountUsdc || amountUsdc <= 0) {
      return res.status(400).json({ error: "amountUsdc must be > 0" });
    }
    const signer = getSigner();
    const amount = BigInt(Math.floor(amountUsdc * 1e6));

    const usdc = new ethers.Contract(TOKENS.USDC_E, ERC20_ABI, signer);
    const approveTx = await usdc.approve(config.capitalRouterAddress, amount);
    await approveTx.wait();

    const cr = getCapitalRouter(signer);
    const tx = await cr.deposit(amount);
    const receipt = await tx.wait();

    res.json({ txHash: receipt.hash, amountUsdc });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

router.post("/withdraw", async (req: Request, res: Response) => {
  try {
    const { amountUsdc } = req.body as { amountUsdc?: number };
    if (!amountUsdc || amountUsdc <= 0) {
      return res.status(400).json({ error: "amountUsdc must be > 0" });
    }
    const cr = getCapitalRouter(getSigner());
    const tx = await cr.withdraw(BigInt(Math.floor(amountUsdc * 1e6)));
    const receipt = await tx.wait();
    res.json({ txHash: receipt.hash, amountUsdc });
  } catch (e) {
    res.status(500).json({ error: (e as Error).message });
  }
});

export default router;
