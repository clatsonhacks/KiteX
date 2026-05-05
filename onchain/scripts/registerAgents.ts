import { ethers } from "hardhat";
import * as dotenv from "dotenv";

dotenv.config();

const CAPITAL_ROUTER_ADDRESS = process.env.CAPITAL_ROUTER_ADDRESS!;

const AGENTS = [
  {
    name: "LiquidityAgent",
    did: "0x4c69717569646974794167656e74000000000000000000000000000000000000",
    baseAllocationBps: 5000,
    initialReputation: 100,
  },
  {
    name: "ArbitrageAgent",
    did: "0x4172626974726167654167656e74000000000000000000000000000000000000",
    baseAllocationBps: 2000,
    initialReputation: 100,
  },
  {
    name: "RiskAgent",
    did: "0x5269736b4167656e740000000000000000000000000000000000000000000000",
    baseAllocationBps: 3000,
    initialReputation: 100,
  },
];

const ABI = [
  "function registerAgent(bytes32 agentDID, uint256 baseAllocationBps, uint256 initialReputation) external",
  "function getAgentConfig(bytes32 agentDID) external view returns (tuple(bytes32 passportDID, uint256 baseAllocationBps, uint256 currentAllocationBps, uint256 reputationScore, uint256 lastReputationUpdate, bool isActive))",
];

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Registering agents with:", deployer.address);

  const capitalRouter = new ethers.Contract(CAPITAL_ROUTER_ADDRESS, ABI, deployer);

  for (const agent of AGENTS) {
    console.log(`\nRegistering ${agent.name}...`);
    const tx = await capitalRouter.registerAgent(
      agent.did,
      agent.baseAllocationBps,
      agent.initialReputation
    );
    await tx.wait();
    console.log(`✓ ${agent.name} registered — tx: ${tx.hash}`);
  }

  console.log("\n── Verifying registrations ──────────────────────────────");
  for (const agent of AGENTS) {
    const config = await capitalRouter.getAgentConfig(agent.did);
    console.log(`${agent.name}: active=${config.isActive} reputation=${config.reputationScore} bps=${config.currentAllocationBps}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
