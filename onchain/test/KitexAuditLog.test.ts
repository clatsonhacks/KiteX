import { expect } from "chai";
import { ethers } from "hardhat";
import { KitexAuditLog } from "../typechain-types";

describe("KitexAuditLog", function () {
  let auditLog: KitexAuditLog;
  let owner: any;
  let backend: any;
  let stranger: any;

  const AGENT_DID = ethers.encodeBytes32String("LiquidityAgent");
  const POOL_ADDRESS = "0x0000000000000000000000000000000000000001";

  beforeEach(async function () {
    [owner, backend, stranger] = await ethers.getSigners();

    const KitexAuditLog = await ethers.getContractFactory("KitexAuditLog");
    auditLog = await KitexAuditLog.deploy();

    // Authorize the backend wallet
    await auditLog.setAuthorized(backend.address, true);
  });

  describe("access control", function () {
    it("owner can log", async function () {
      await expect(auditLog.logLPOpen(AGENT_DID, POOL_ADDRESS, -100, 100, 1000n))
        .to.emit(auditLog, "LPPositionOpened");
    });

    it("authorized backend can log", async function () {
      await expect(auditLog.connect(backend).logLPOpen(AGENT_DID, POOL_ADDRESS, -100, 100, 1000n))
        .to.emit(auditLog, "LPPositionOpened");
    });

    it("unauthorized caller is rejected", async function () {
      await expect(
        auditLog.connect(stranger).logLPOpen(AGENT_DID, POOL_ADDRESS, -100, 100, 1000n)
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("events", function () {
    it("emits LPPositionOpened with correct args", async function () {
      await expect(auditLog.logLPOpen(AGENT_DID, POOL_ADDRESS, -887272, 887272, 500000n))
        .to.emit(auditLog, "LPPositionOpened")
        .withArgs(AGENT_DID, POOL_ADDRESS, -887272, 887272, 500000n, await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
    });

    it("emits ArbitrageExecuted", async function () {
      const tokenIn = "0x7aB6f3ed87C42eF0aDb67Ed95090f8bF5240149e";
      const tokenOut = "0xcc788DC0486CD2BaacFf287eea1902cc09FbA570";
      await expect(
        auditLog.logArb(AGENT_DID, tokenIn, tokenOut, 1000000n, 1003000n, 3000n)
      ).to.emit(auditLog, "ArbitrageExecuted");
    });

    it("emits ReputationUpdated", async function () {
      await expect(
        auditLog.logReputation(AGENT_DID, 100, 110, "profitable arb")
      ).to.emit(auditLog, "ReputationUpdated")
        .withArgs(AGENT_DID, 100, 110, "profitable arb", await ethers.provider.getBlock("latest").then(b => b!.timestamp + 1));
    });
  });
});
