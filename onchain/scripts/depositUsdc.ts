import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const CAPITAL_ROUTER_ADDRESS = process.env.CAPITAL_ROUTER_ADDRESS!;
const USDC_E_ADDRESS = "0x7aB6f3ed87C42eF0aDb67Ed95090f8bF5240149e";

// Amount to deposit — edit before running.
// Leave at least 2 USDC.e in deployer wallet so the orchestrator can execute real arb swaps.
const DEPOSIT_AMOUNT_USDC = "5"; // 5 USDC.e into CapitalRouter

const ERC20_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function balanceOf(address account) external view returns (uint256)",
  "function decimals() external view returns (uint8)",
  "function allowance(address owner, address spender) external view returns (uint256)",
];

const ROUTER_ABI = [
  "function deposit(uint256 amountUsdc) external",
  "function getTreasuryBalance() external view returns (uint256)",
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Depositing from:", deployer.address);

  const usdc = new ethers.Contract(USDC_E_ADDRESS, ERC20_ABI, deployer);
  const router = new ethers.Contract(CAPITAL_ROUTER_ADDRESS, ROUTER_ABI, deployer);

  const decimals = await usdc.decimals();
  const amount = ethers.parseUnits(DEPOSIT_AMOUNT_USDC, decimals);

  const balance = await usdc.balanceOf(deployer.address);
  console.log(`Wallet USDC.e balance: ${ethers.formatUnits(balance, decimals)}`);
  if (balance < amount) {
    console.error(`Insufficient balance. Need ${DEPOSIT_AMOUNT_USDC}, have ${ethers.formatUnits(balance, decimals)}`);
    process.exit(1);
  }

  const allowance = await usdc.allowance(deployer.address, CAPITAL_ROUTER_ADDRESS);
  if (allowance < amount) {
    console.log("Approving USDC.e spend...");
    const approveTx = await usdc.approve(CAPITAL_ROUTER_ADDRESS, amount);
    await approveTx.wait();
    console.log(`✓ Approved — tx: ${approveTx.hash}`);
  } else {
    console.log("Allowance already sufficient, skipping approve.");
  }

  console.log(`Depositing ${DEPOSIT_AMOUNT_USDC} USDC.e into CapitalRouter...`);
  const depositTx = await router.deposit(amount);
  await depositTx.wait();
  console.log(`✓ Deposit done — tx: ${depositTx.hash}`);

  const treasury = await router.getTreasuryBalance();
  console.log(`Treasury balance now: ${ethers.formatUnits(treasury, decimals)} USDC.e`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
