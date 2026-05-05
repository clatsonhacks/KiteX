import { ethers } from "hardhat";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config();

// USDC.e on Kite mainnet
const USDC_E_ADDRESS = "0x7aB6f3ed87C42eF0aDb67Ed95090f8bF5240149e";

async function main() {
  const [deployer] = await ethers.getSigners();

  const balance = await ethers.provider.getBalance(deployer.address);
  console.log("Deployer:", deployer.address);
  console.log("KITE balance:", ethers.formatEther(balance), "KITE");

  if (balance === 0n) {
    throw new Error("No KITE balance — cannot pay gas");
  }

  // ── Deploy KitexAuditLog first (cheaper, ~400k gas) ──────────────────────
  console.log("\nDeploying KitexAuditLog...");
  const AuditLog = await ethers.getContractFactory("KitexAuditLog");
  const auditLog = await AuditLog.deploy();
  await auditLog.waitForDeployment();
  const auditLogAddress = await auditLog.getAddress();
  console.log("✓ KitexAuditLog:", auditLogAddress);

  // ── Deploy CapitalRouter (~600k gas) ─────────────────────────────────────
  console.log("\nDeploying CapitalRouter...");
  const CapitalRouter = await ethers.getContractFactory("CapitalRouter");
  const capitalRouter = await CapitalRouter.deploy(USDC_E_ADDRESS);
  await capitalRouter.waitForDeployment();
  const capitalRouterAddress = await capitalRouter.getAddress();
  console.log("✓ CapitalRouter:", capitalRouterAddress);

  // ── Save addresses ────────────────────────────────────────────────────────
  const output = {
    KitexAuditLog: auditLogAddress,
    CapitalRouter: capitalRouterAddress,
    USDCe: USDC_E_ADDRESS,
    network: "kite-mainnet",
    chainId: 2368,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  fs.writeFileSync("deployed-addresses.json", JSON.stringify(output, null, 2));

  console.log("\n── Add these to your .env ───────────────────────────────");
  console.log(`CAPITAL_ROUTER_ADDRESS=${capitalRouterAddress}`);
  console.log(`AUDIT_LOG_ADDRESS=${auditLogAddress}`);
  console.log("\n── Verify on Kitescan ───────────────────────────────────");
  console.log(`https://kitescan.ai/address/${auditLogAddress}`);
  console.log(`https://kitescan.ai/address/${capitalRouterAddress}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
