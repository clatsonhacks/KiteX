import { expect } from "chai";
import { ethers } from "hardhat";
import { CapitalRouter } from "../typechain-types";

describe("CapitalRouter", function () {
  let capitalRouter: CapitalRouter;
  let owner: any;
  let user: any;
  let mockUSDC: any;

  const LIQUIDITY_DID = ethers.encodeBytes32String("LiquidityAgent");
  const ARB_DID = ethers.encodeBytes32String("ArbitrageAgent");
  const RISK_DID = ethers.encodeBytes32String("RiskAgent");

  beforeEach(async function () {
    [owner, user] = await ethers.getSigners();

    // Deploy a mock ERC20 for USDC.e in tests
    const MockERC20 = await ethers.getContractFactory("MockERC20");
    mockUSDC = await MockERC20.deploy("USD Coin", "USDC", 6);

    const CapitalRouter = await ethers.getContractFactory("CapitalRouter");
    capitalRouter = await CapitalRouter.deploy(await mockUSDC.getAddress());
  });

  describe("registerAgent", function () {
    it("registers three agents correctly", async function () {
      await capitalRouter.registerAgent(LIQUIDITY_DID, 5000, 100);
      await capitalRouter.registerAgent(ARB_DID, 2000, 100);
      await capitalRouter.registerAgent(RISK_DID, 3000, 100);

      const dids = await capitalRouter.getAllAgentDIDs();
      expect(dids.length).to.equal(3);
    });

    it("reverts if agent already registered", async function () {
      await capitalRouter.registerAgent(LIQUIDITY_DID, 5000, 100);
      await expect(
        capitalRouter.registerAgent(LIQUIDITY_DID, 5000, 100)
      ).to.be.revertedWith("Already registered");
    });
  });

  describe("deposit / withdraw", function () {
    it("accepts USDC.e deposit", async function () {
      const amount = ethers.parseUnits("10", 6);
      await mockUSDC.mint(user.address, amount);
      await mockUSDC.connect(user).approve(await capitalRouter.getAddress(), amount);
      await capitalRouter.connect(user).deposit(amount);
      expect(await capitalRouter.getTreasuryBalance()).to.equal(amount);
    });

    it("owner can withdraw", async function () {
      const amount = ethers.parseUnits("10", 6);
      await mockUSDC.mint(owner.address, amount);
      await mockUSDC.approve(await capitalRouter.getAddress(), amount);
      await capitalRouter.deposit(amount);
      await capitalRouter.withdraw(amount);
      expect(await capitalRouter.getTreasuryBalance()).to.equal(0);
    });
  });

  describe("updateReputation", function () {
    it("recomputes allocations proportionally", async function () {
      await capitalRouter.registerAgent(LIQUIDITY_DID, 5000, 60);
      await capitalRouter.registerAgent(ARB_DID, 2000, 40);

      const amount = ethers.parseUnits("100", 6);
      await mockUSDC.mint(owner.address, amount);
      await mockUSDC.approve(await capitalRouter.getAddress(), amount);
      await capitalRouter.deposit(amount);

      // LiquidityAgent has 60% reputation weight → should get 60% allocation
      const liquidityAlloc = await capitalRouter.getAllocation(LIQUIDITY_DID);
      expect(liquidityAlloc).to.equal(ethers.parseUnits("60", 6));

      // Update: ArbitrageAgent earns more reputation
      await capitalRouter.updateReputation(ARB_DID, 60);

      // Now 50/50 split
      const arbAlloc = await capitalRouter.getAllocation(ARB_DID);
      expect(arbAlloc).to.equal(ethers.parseUnits("50", 6));
    });
  });
});
