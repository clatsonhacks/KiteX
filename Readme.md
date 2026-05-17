# Kitex

**Autonomous market making on Kite AI — three agents, one treasury, zero human intervention**

Kitex is a three-agent system that solves the two reasons liquidity providers keep losing money on concentrated liquidity DEXs. One agent places and manages LP positions on Kite's native Algebra Integral DEX. A second agent self-arbitrages those positions before external arbitrageurs can drain them. A third agent monitors directional exposure and rebalances ranges to stay neutral. Each agent has its own Kite Agent Passport, its own session key spending limits enforced on-chain, and its own reputation score that controls how much capital it gets to touch — all settling in Kite stablecoin on mainnet.

---

## Table of Contents

1. [Problem](#1-problem)
2. [Solution](#2-solution)
3. [How It Works — Full Technical Flow](#3-how-it-works--full-technical-flow)
4. [What Is Live on Kite Mainnet](#4-what-is-live-on-kite-mainnet)
5. [Architecture Overview](#5-architecture-overview)
6. [Kite AI Stack — What We Use and Why](#6-kite-ai-stack--what-we-use-and-why)
7. [Smart Contracts](#7-smart-contracts)
8. [Frontend — Pages, Design, and User Flow](#8-frontend--pages-design-and-user-flow)
9. [Backend — Services, APIs, and Integration](#9-backend--services-apis-and-integration)
10. [How Everything Connects](#10-how-everything-connects)
11. [Team Split and Responsibilities](#11-team-split-and-responsibilities)
12. [End Products Per Person](#12-end-products-per-person)
13. [Demo Structure](#13-demo-structure)
14. [Cost Breakdown](#14-cost-breakdown)
15. [Docs and References](#15-docs-and-references)

---


## 1. Problem

Concentrated liquidity on DEXs is the most capital-efficient form of on-chain market making that exists. But liquidity providers consistently lose money. Two separate problems cause this:

### Problem 1 — Toxic Orderflow

When the real market price moves away from what your LP is offering, arbitrageurs immediately trade against your stale price. They buy cheap from your LP and sell at the higher real price elsewhere. You are the counterparty to every one of those trades. The arbitrageur profits. You lose. This is called toxic flow because every swap against your LP in this condition is a loss for you.

The LP has no way to react fast enough manually. By the time a human notices the price divergence and removes or adjusts liquidity, the arb has already happened multiple times.

### Problem 2 — Impermanent Loss

As price moves through your LP range, you accumulate more of the token that is going down in price and less of the token going up. When you withdraw, you have less total value than if you had just held the tokens. This is impermanent loss. In a concentrated range, the effect is amplified because your capital is dense — small price moves cause large shifts in your position composition.

The only way to truly eliminate impermanent loss is to either never let price leave your range, or hedge the directional exposure as it accumulates.

### Why Existing Solutions Fail

Automated liquidity managers like Gamma and ICHI rebalance ranges but they do not address toxic flow — they still lose to arbitrageurs. They also do not hedge exposure, they just move the range and hope price follows. They operate as dumb bots with no identity, no accountability, and no economic skin in the game.

There is no system today that combines: active self-arbitrage to capture toxic flow, dynamic range management to minimize IL, reputation-weighted capital delegation so agents earn authority by proving themselves, and stablecoin-native settlement with cryptographic spending constraints per agent.

---

## 2. Solution

Kitex splits the market making role into three specialized autonomous agents. Each agent has a single job, a Kite Agent Passport giving it a verifiable on-chain identity, a session key that caps exactly how much it can spend per operation, and a reputation score that grows or shrinks based on real on-chain PnL.

A CapitalRouter contract holds the shared treasury in USDC.e. It reads each agent's reputation score and allocates capital proportionally. A new agent starts with minimal capital. A proven agent gets more. A failing agent gets defunded automatically. No human touches a configuration file.

The three agents:

**LiquidityAgent** — places concentrated liquidity positions on Kite's Algebra Integral DEX. Monitors price and rebalances ranges when price approaches the boundary. Every add/remove LP action uses a session key capped to the allocation it has earned through reputation.

**ArbitrageAgent** — watches the LP positions for price divergence against external reference prices. The moment the LP is offering a stale price, it executes a swap through Algebra's SwapRouter against its own LP — capturing the toxic flow itself before external arbitrageurs can. Every arb that generates profit increases the agent's reputation. Every failed arb decreases it.

**RiskAgent** — monitors the directional delta accumulating in the LP positions from retail swaps. When exposure exceeds a threshold, it either triggers a range rebalance or logs a hedge intent on-chain. Its decisions are the slowest and most conservative — it requires the highest reputation to operate because it is the last line of defense against large directional losses.

---

## 3. How It Works — Full Technical Flow

### Step 1 — User deposits capital

The user connects their wallet to Kitex and deposits USDC.e into the CapitalRouter contract. They set global parameters: maximum total exposure, minimum reputation threshold for each agent to receive capital, and a rebalance frequency limit. These parameters are stored on-chain in CapitalRouter and enforced programmatically — no agent can exceed them regardless of its own logic.

### Step 2 — Agent Passports registered

Three agents are registered with the Kite Agent Passport system. Each receives a unique DID. Each is bound to the owner's wallet through cryptographic delegation. The Passports contain the agent type (LiquidityAgent, ArbitrageAgent, RiskAgent), their initial reputation scores, and their authorized function selectors (what on-chain functions they are allowed to call).

### Step 3 — CapitalRouter allocates based on reputation

On every cycle (configurable, default every block or every N blocks), CapitalRouter reads the reputation scores from each Agent Passport and computes allocations:

- LiquidityAgent: base 50% of treasury, scaled by reputation ratio
- ArbitrageAgent: base 20% of treasury, scaled by reputation ratio
- RiskAgent: base 30% of treasury, scaled by reputation ratio

These allocations are not transfers — they are on-chain authorization limits. Each agent's session key valueLimit is set to its current allocation. If an agent tries to spend beyond its allocation, the session key rejects it at the protocol level.

### Step 4 — LiquidityAgent places LP position

LiquidityAgent calls the Algebra NonfungiblePositionManager to mint a concentrated liquidity position in a tight price range around the current market price for the USDC.e/WKITE pair (or whichever pair is configured). The position is an ERC-721 NFT owned by the CapitalRouter contract. The agent used its session key to authorize this action — the session key has a value limit matching its current capital allocation and expires in 60 seconds after the operation.

The LP position is now active. Retail swappers trading through Algebra will interact with this liquidity. Fees accumulate. Price moves through the range.

### Step 5 — ArbitrageAgent monitors for stale prices

The backend feeds ArbitrageAgent a reference price from an external source (computed from recent Algebra pool state and any available price feed). ArbitrageAgent computes the current effective price the LP is offering versus what the real market price is.

If the LP price has diverged by more than the configured threshold (for example, 0.3%), the ArbitrageAgent constructs a swap transaction: it buys the underpriced token from the LP at the stale price and immediately the LP rebalances its accounting. The agent captured what would have been toxic flow. The profit from this arb goes back into the treasury. The agent's reputation increases.

This swap is executed through Algebra's SwapRouter using a session key scoped to ArbitrageAgent's current allocation. The transaction is gasless via Kite's bundler.

### Step 6 — RiskAgent monitors directional exposure

As retail swaps flow through the LP, the position composition shifts. If many buyers are buying WKITE from the LP, the pool now holds more USDC.e and less WKITE — a short WKITE exposure. RiskAgent tracks this delta accumulation by reading the pool state from Algebra's pool contract.

When delta exposure exceeds a threshold (for example, more than 15% of position value in one direction), RiskAgent does one of two things:

If the LiquidityAgent has available capacity: RiskAgent signals a range rebalance. LiquidityAgent removes the current position and places a new one centered on the updated price. This resets delta exposure.

If rebalancing is too frequent or cost-inefficient: RiskAgent logs a HedgeIntent event on-chain with the exact exposure amount, direction, and timestamp. This is a permanent record. In a future version with a live perp DEX on Kite, this intent would trigger a real hedge. For now it is a verifiable audit trail of risk management decisions.

RiskAgent's reputation grows every time its rebalance signal successfully reduced IL over the following N blocks.

### Step 7 — Reputation updates

After every ArbitrageAgent swap, the backend computes realized PnL. If profitable, it calls the Kite Passport system to increment ArbitrageAgent's reputation score. If the arb failed or cost more in gas than it earned, reputation decreases.

After every LiquidityAgent rebalance, the backend checks whether the new range captured more fees than the old range would have. Reputation updates accordingly.

After every RiskAgent decision, the backend checks whether delta exposure actually decreased in the following blocks. Reputation updates accordingly.

All reputation updates flow through the Kite Agent Passport system — they are permanent, cryptographically verifiable, and public.

### Step 8 — CapitalRouter reallocates

On the next cycle, CapitalRouter reads the updated reputation scores and recomputes allocations. An agent that performed well gets a larger share of the next cycle's capital. An agent that consistently underperforms gets its allocation reduced toward zero. This loop runs continuously without human intervention.

---

## 4. What Is Live on Kite Mainnet

Everything Kitex needs is already deployed. No DEX contracts to write or deploy.

### Algebra Integral DEX (Mainnet)

| Contract | Address |
|----------|---------|
| AlgebraFactory | `0x10253594A832f967994b44f33411940533302ACb` |
| SwapRouter | `0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A` |
| NonfungiblePositionManager | `0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C` |
| Multicall3 | `0xE3104A157cc4C0d3c7C3a8c655092668D068c149` |

### Tokens (Mainnet)

| Token | Address | Decimals |
|-------|---------|----------|
| USDC.e | `0x7aB6f3ed87C42eF0aDb67Ed95090f8bF5240149e` | 6 |
| USDT | `0x3Fdd283C4c43A60398bf93CA01a8a8BD773a755b` | 6 |
| WKITE | `0xcc788DC0486CD2BaacFf287eea1902cc09FbA570` | 18 |
| WETH | `0x3D66d6c3201190952e8EA973F59c4428b32D5F9b` | 18 |

### What Kitex Deploys On Top

Only two contracts need to be deployed by the team:

- `CapitalRouter.sol` — treasury, allocation logic, reputation-weighted capital distribution
- `KitexAuditLog.sol` — on-chain log of every agent decision, arb execution, and hedge intent

Everything else (DEX, tokens, Agent Passport) is already live.

---

## 5. Architecture Overview

```
+----------------------------------------------------------+
|                   FRONTEND (Next.js)                     |
|  Dashboard · Agent Monitor · Position View · Demo Page   |
+--------------------+--------------------+----------------+
                     |                    |
          HTTP via   |         Direct GraphQL poll
          API routes |                    |
+--------------------v-----+   +---------v--------------+
|  BACKEND (Node.js)       |   |  GOLDSKY SUBGRAPH       |
|  Agent Orchestrator      |   |  kite-ai mainnet        |
|  Price Monitor           |   |  KitexAuditLog events   |
|  Reputation Engine       |   |  Algebra pool events    |
|  Session Key Manager     |   |  GraphQL endpoint       |
+---+----------+-------+---+   +------------------------+
    |          |       |
+---v---+ +----v---+ +-v-----------+
| AGENT | |ALGEBRA | | KITE        |
| LOGIC | |DEX     | | PASSPORT    |
| Liq   | |Pool    | | DIDs        |
| Arb   | |Swap    | | Reputation  |
| Risk  | |PosMgr  | | Session Keys|
+---+---+ +----+---+ +-------------+
    |           |
+---v-----------v-------------------+
|  KITE MAINNET                     |
|  CapitalRouter.sol                |
|  KitexAuditLog.sol                |
|  Algebra DEX (already deployed)   |
|  USDC.e / WKITE                   |
+-----------------------------------+
```

---

## 6. Kite AI Stack — What We Use and Why

### Kite Agent Passport

Each of the three agents has a registered Agent Passport on Kite mainnet. The Passport is the agent's verifiable on-chain identity. It stores the agent type, the owner's wallet address (cryptographic binding), the agent's authorized function selectors, and the current reputation score.

The reputation score stored in the Passport is the single number that CapitalRouter reads to compute capital allocation. It is tamper-evident — only the Passport system can update it, and every update is an on-chain event.

Docs: `https://docs.gokite.ai/kite-agent-passport/developer-guide`
Portal: `https://x402-portal-eight.vercel.app/`

### Kite Session Keys

`addSessionKeyRule(address sessionKeyAddress, bytes32 agentId, bytes4 functionSelector, uint256 valueLimit)`

Every agent action uses a session key scoped to that specific operation. The `valueLimit` is set to the agent's current capital allocation from CapitalRouter. The `functionSelector` is scoped to the exact function being called (mint LP, swap, etc.). Keys expire in 60 seconds.

This means even if an agent's logic malfunctions, it cannot spend more than its session key allows. The spending constraint is enforced at the protocol level, not in application code.

### Kite Gasless Transactions

All agent transactions are gasless. The Kite bundler covers gas fees. Agents hold zero KITE for gas. They only hold USDC.e for the actual trading capital. This is critical for autonomous operation — the agent never needs to be topped up with gas tokens.

Bundler RPC: `https://bundler-service.staging.gokite.ai/rpc/`

### Algebra Integral DEX

The concentrated liquidity DEX already deployed on Kite mainnet. Uniswap V3 compatible interfaces — same math, same position management via NFT, same tick-based liquidity. The Kitex agents interact with three Algebra contracts:

NonfungiblePositionManager — for minting, adjusting, and burning LP positions.
SwapRouter — for executing swaps (both retail flow and self-arb swaps).
AlgebraFactory — for reading pool state and computing pool addresses.

Algebra docs: `https://docs.algebra.finance/algebra-integral-documentation`

### x402 Payment Protocol

Agent-to-agent coordination payments (for example, when RiskAgent signals LiquidityAgent to rebalance) use x402 format. The payment intent is a signed authorization that includes the action, the amount, and the session key. This creates a verifiable record of inter-agent coordination.

Spec: `https://github.com/coinbase/x402/blob/main/specs/x402-specification.md`

---

## 7. Smart Contracts

Kitex deploys two contracts on Kite mainnet. Everything else is already live.

### Contract 1 — CapitalRouter.sol

The treasury and capital allocation engine. This is the financial heart of Kitex.

Storage:
```
owner: address
totalDeposited: uint256 (in USDC.e base units)
agents: mapping(bytes32 => AgentConfig)
  AgentConfig {
    passportDID: bytes32
    baseAllocationBps: uint256  (basis points, e.g. 5000 = 50%)
    currentAllocationBps: uint256
    reputationScore: uint256
    lastReputationUpdate: uint256
    isActive: bool
  }
totalReputationWeight: uint256
```

Events:
- `CapitalDeposited(owner, amount, timestamp)`
- `CapitalWithdrawn(owner, amount, timestamp)`
- `AllocationUpdated(agentDID, oldBps, newBps, reputationScore, timestamp)`
- `SessionKeyAuthorized(agentDID, sessionKey, valueLimit, functionSelector, timestamp)`

Functions:
- `deposit(uint256 amount)` — user deposits USDC.e into treasury
- `withdraw(uint256 amount)` — user withdraws USDC.e from treasury
- `updateReputation(bytes32 agentDID, uint256 newScore)` — called by backend after PnL computation, updates score and recomputes allocation
- `authorizeSessionKey(bytes32 agentDID, address sessionKey, bytes4 selector)` — issues a session key for the agent scoped to its current allocation
- `getAllocation(bytes32 agentDID) returns (uint256)` — returns current USDC.e allocation for an agent
- `getAgentConfig(bytes32 agentDID) returns (AgentConfig)` — full agent config read

The allocation computation logic: each agent's allocation in basis points = (agent reputation score / total reputation weight) * 10000. This means if LiquidityAgent has 60% of total reputation weight, it gets 60% of the treasury. The percentages shift every time updateReputation is called.

### Contract 2 — KitexAuditLog.sol

Immutable on-chain log of every agent decision. Used by the frontend for charts and by judges for verification.

Events:
- `LPPositionOpened(agentDID, poolAddress, tickLower, tickUpper, liquidity, timestamp)`
- `LPPositionClosed(agentDID, tokenId, feesCollected, timestamp)`
- `LPPositionRebalanced(agentDID, oldTickLower, oldTickUpper, newTickLower, newTickUpper, timestamp)`
- `ArbitrageExecuted(agentDID, tokenIn, tokenOut, amountIn, amountOut, profit, timestamp)`
- `ArbitrageFailed(agentDID, reason, timestamp)`
- `HedgeIntentLogged(agentDID, deltaExposure, direction, timestamp)`
- `ReputationUpdated(agentDID, oldScore, newScore, reason, timestamp)`

Functions:
- `logLPOpen(...)` — called by backend after NonfungiblePositionManager mint
- `logLPClose(...)` — called by backend after position burn
- `logLPRebalance(...)` — called by backend after range adjustment
- `logArb(...)` — called by backend after SwapRouter execution
- `logHedgeIntent(...)` — called by RiskAgent backend logic
- `logReputation(...)` — called alongside CapitalRouter.updateReputation

Deployment: Hardhat with Kite mainnet config.
Kite mainnet RPC: `https://rpc.gokite.ai/`
Kite mainnet Chain ID: 2368 (confirm from docs)
Explorer: `https://kitescan.ai`

---

## 8. Frontend — Pages, Design, and User Flow

The frontend is built in Next.js. It serves the user who deposited capital and judges who need to see what is happening. Every screen needs to be immediately readable without explanation.

### Design Principles

Dark background, monospace for all numbers and addresses, color used only for status. Green means profitable or active. Red means loss or inactive. Amber means pending or borderline. No gradients, no animations except live chart updates. The visual language is a trading terminal, not a DeFi app.

Layout: fixed left sidebar with navigation, main content area fills the right. All live data updates in place — no page reloads.

### Page 1 — Dashboard (default landing)

The overview of the entire system at a glance.

Top row — four stat cards:
- Total treasury value in USDC.e (live, from CapitalRouter)
- Total fees earned today across all positions
- Total arb profit today from ArbitrageAgent
- Net PnL today (fees + arb profit minus gas costs and any IL)

Below stats — three agent cards side by side, one per agent:

Each agent card shows:
- Agent name and truncated Passport DID
- Reputation score (large number, colored green/amber/red based on trend)
- Current capital allocation in USDC.e and percentage
- Status: ACTIVE / IDLE / REBALANCING
- Last action timestamp
- Last action type (LP placed, arb executed, rebalance triggered, hedge logged)

Below agent cards — two columns:

Left (60% width): Live action feed. Every event from KitexAuditLog, newest first. Each row shows: timestamp, agent name, action type, amount involved, profit/loss if applicable. Color coded by agent (each agent has a distinct accent color).

Right (40% width): Treasury allocation pie chart. Shows current percentage split between the three agents, updating as reputation scores change. Below that: a small line chart of total treasury value over the session.

### Page 2 — Agent Detail Page

URL: `/agent/[did]`

Full view of one agent's performance and current state.

Header: Agent name, full Passport DID, status badge, current reputation score, current capital allocation.

Left panel (55% width):
- Reputation history chart: line chart of reputation score over last 50 decisions. X axis is decision number, Y axis is score. Shows the upward trend for a well-performing agent, downward for failing.
- Below that: PnL history chart showing cumulative profit/loss per action.

Right panel (45% width):
- For LiquidityAgent: current LP position details — pool address, tick range, current price vs range, liquidity amount, fees earned. Link to position NFT on Kitescan explorer.
- For ArbitrageAgent: arb success rate (successful arbs / total attempts), average profit per arb, last 10 arbs with profit/loss per row.
- For RiskAgent: current delta exposure reading, last rebalance signal, last hedge intent with timestamp and exposure amount.

Bottom: Full decision history table. Every action this agent took, with on-chain transaction link to Kitescan.

### Page 3 — Positions

URL: `/positions`

Shows all active and historical LP positions managed by LiquidityAgent.

Active positions table: position NFT token ID, pool pair, tick range, current price, in-range status (green/red), liquidity amount, fees earned since open, time open.

Position detail: clicking any row expands to show the full tick range visualization — a price bar with the current price cursor and the LP range highlighted. When price is inside the range, the bar is green. When outside, it turns red and shows how far out of range.

Historical positions table: closed positions with open time, close time, fees earned, and final PnL.

### Page 4 — Demo Page

URL: `/demo`

This page exists for the hackathon demonstration. It is an honest tool, not a fake simulation.

Three panels side by side, one per agent. Each panel shows a live chart of the agent's key metric updating in real time as the backend processes decisions.

Control panel at the bottom:

- "Trigger Price Divergence" button — executes a real swap on Algebra that moves the price outside the LP range. This is a real mainnet transaction. It causes ArbitrageAgent to detect the divergence and self-arb.
- "Simulate High Retail Volume" button — executes a series of real swaps through the pool, accumulating delta exposure. This triggers RiskAgent to log a hedge intent.
- "Force Rebalance" button — signals LiquidityAgent to remove the current position and place a new one. Real transactions.

All buttons trigger real on-chain activity. The charts update from KitexAuditLog events as blocks confirm. Nothing is mocked.

Below the control panel: live transaction feed showing the last 10 Kitescan transaction hashes with links and confirmation status.

### Page 5 — How It Works

URL: `/how-it-works`

Static explainer. Three sections:

1. The problem — why LPs lose to arbs and accumulate IL, with a simple diagram
2. The three agents — what each one does in plain language
3. The reputation system — how capital flows to proven agents, with a flow diagram

This page is for judges who want the conceptual explanation without reading the code.

### Frontend to Backend Connection

All frontend data requests go through Next.js API routes (`/app/api/...`) that proxy to the Express backend. The frontend never calls the backend directly. One environment variable `BACKEND_URL` controls the backend address.

Live event feeds use polling via React Query every 3 seconds against the backend's `/api/events` endpoint, which returns the latest KitexAuditLog events parsed from Kite mainnet.

Position data is fetched from the backend which reads directly from Algebra's NonfungiblePositionManager on-chain.

Reputation data is fetched from the backend which reads from the Kite Agent Passport system.

Charts use Recharts. No Three.js, no canvas complexity.

---

## 9. Backend — Services, APIs, and Integration

The backend is a Node.js Express server. It is the brain of Kitex — it runs the agent logic loops, reads on-chain state, makes trading decisions, and executes transactions.

### Agent Orchestrator

The core loop. Runs on a configurable interval (default every 15 seconds or every new block). On each cycle:

1. Read current Algebra pool state: current price, tick, liquidity
2. Read all active LP positions from NonfungiblePositionManager for the CapitalRouter address
3. Read current reputation scores from Kite Agent Passport for all three agents
4. Compute current allocations from CapitalRouter
5. Run LiquidityAgent logic
6. Run ArbitrageAgent logic
7. Run RiskAgent logic
8. Execute any decided transactions via gokite-aa-sdk
9. Compute PnL from any completed actions
10. Update reputation scores in CapitalRouter and Kite Passport
11. Log all decisions to KitexAuditLog on-chain

### LiquidityAgent Logic

Inputs: current price, current position tick range, current price distance from range boundaries, current fees earned.

Decision tree:
- If no active position: place a new position centered on current price with a configured width (for example, plus or minus 2% from current price)
- If current price is more than 80% of the way to either boundary: trigger rebalance
- If rebalance cooldown has not elapsed: skip
- If rebalance would cost more in gas than expected additional fees: skip

Action: call NonfungiblePositionManager `mint()` or `burn()` and `mint()` for rebalance. Executed via session key scoped to LiquidityAgent's current allocation.

### ArbitrageAgent Logic

Inputs: current Algebra pool price, reference external price (computed from recent trade history or a price feed), LP position current composition.

Decision tree:
- Compute price divergence: (algebra price - reference price) / reference price
- If divergence magnitude exceeds threshold (default 0.3%): arb opportunity detected
- Compute expected arb profit: (divergence * swap amount) minus estimated gas cost
- If expected profit is positive: execute arb swap

Action: call SwapRouter `exactInputSingle()` to trade against the pool. Token direction depends on whether Algebra price is above or below reference. Executed via session key scoped to ArbitrageAgent's allocation.

After execution: compute actual profit from output vs input. Update reputation via CapitalRouter. Log to KitexAuditLog.

### RiskAgent Logic

Inputs: current LP position composition (how much USDC.e vs WKITE is currently in the position), original position composition at time of placement, delta exposure percentage.

Decision tree:
- Compute delta: (current WKITE value in USD - original WKITE value in USD) / total position value
- If absolute delta exceeds threshold (default 15%): risk event
- If rebalance is available and cost-efficient: signal LiquidityAgent to rebalance
- Otherwise: log HedgeIntent to KitexAuditLog with exact delta value and direction

After rebalance signal: monitor the following 5 blocks to verify delta decreased. If yes: reputation increase. If no: reputation decrease.

### Session Key Manager

Wraps gokite-aa-sdk. Before every agent transaction:
1. Check current agent allocation from CapitalRouter
2. Generate a new session key address
3. Call `addSessionKeyRule(sessionKeyAddress, agentDID, functionSelector, allocationLimit)`
4. Sign the UserOperation with the session key
5. Submit via `sendUserOperationAndWait()`
6. Return transaction hash

After every transaction: log result, check gas used, compute net PnL.

gokite-aa-sdk bundler: `https://bundler-service.staging.gokite.ai/rpc/`
Kite mainnet RPC: `https://rpc.gokite.ai/`

### Kite Agent Passport Integration

The backend interacts with the Kite Agent Passport API for:
- Reading current reputation scores for all three agents
- Updating reputation scores after PnL computation
- Verifying agent DID ownership before executing any transaction

All Passport API calls use the owner's signing key. The Passport API endpoint and authentication method are provided by Kite upon Passport registration.

Docs: `https://docs.gokite.ai/kite-agent-passport/developer-guide`

### Algebra Pool Reader

Reads on-chain state from Algebra contracts via ethers.js:

- `AlgebraPool.globalState()` — current price (sqrtPriceX96), current tick, current fee
- `NonfungiblePositionManager.positions(tokenId)` — full position details for any LP NFT
- `AlgebraPool.liquidity()` — total active liquidity in range
- `AlgebraPool.token0()` and `token1()` — pool pair addresses

These reads happen at the start of every orchestrator cycle. They are view calls — no gas, no transactions.

### API Endpoints

**GET /api/dashboard**
Returns all data needed for the dashboard in one call: treasury value, agent cards, today's PnL stats.

**GET /api/agents**
Returns all three agents with current reputation, allocation, status, and last action.

**GET /api/agents/[did]**
Returns full detail for one agent: full decision history, PnL history, reputation history.

**GET /api/positions**
Returns all LP positions: active and historical. Reads from NonfungiblePositionManager and KitexAuditLog.

**GET /api/events**
Returns the last 50 KitexAuditLog events parsed from Kite mainnet. Used by the live feed on the dashboard and the demo page.

**POST /api/deposit**
Called when user deposits USDC.e. Approves USDC.e spend and calls CapitalRouter.deposit().

**POST /api/withdraw**
Called when user withdraws. Calls CapitalRouter.withdraw().

**POST /api/demo/trigger-divergence**
Demo only. Executes a real swap on Algebra to move price outside LP range. Triggers ArbitrageAgent.

**POST /api/demo/trigger-volume**
Demo only. Executes a series of swaps to accumulate delta exposure. Triggers RiskAgent.

**POST /api/demo/trigger-rebalance**
Demo only. Forces LiquidityAgent to rebalance immediately regardless of cooldown.

### Database

MongoDB. Two collections:

`decisions` — one document per agent decision:
```
agentDID: string
action: string (LP_OPEN, LP_CLOSE, LP_REBALANCE, ARB_EXECUTED, ARB_FAILED, HEDGE_LOGGED)
txHash: string
inputAmount: number
outputAmount: number
profit: number
gasUsed: number
netPnL: number
reputationBefore: number
reputationAfter: number
timestamp: number
blockNumber: number
```

`cycleState` — one document updated every orchestrator cycle:
```
cycleNumber: number
poolPrice: number
poolTick: number
activeLPTokenId: number
positionTickLower: number
positionTickUpper: number
deltaExposure: number
lastUpdated: timestamp
```

---

## 10. How Everything Connects

### Connection 1 — Frontend to Backend

Next.js API routes proxy all requests to the Express backend. Frontend never calls backend directly. `BACKEND_URL` environment variable controls address. React Query polls key endpoints every 3 seconds for live data.

### Connection 2 — Backend to Goldsky

The backend queries Goldsky GraphQL for historical data needed by agent logic: ArbitrageAgent queries recent swap prices to compute reference price. RiskAgent queries hedge history to distinguish sustained drift from temporary spikes. LiquidityAgent queries fee history to evaluate rebalance cost-efficiency. All queries use the public GraphQL endpoint — no authentication needed.

Environment variable `GOLDSKY_ENDPOINT` controls the subgraph URL.

### Connection 3 — Frontend to Goldsky

The dashboard live event feed and agent detail charts call the Goldsky GraphQL endpoint directly from the browser via React Query polling every 3 seconds. This is separate from the backend — the frontend does not need to go through the API for live event data. Same `NEXT_PUBLIC_GOLDSKY_ENDPOINT` environment variable.

### Connection 2b — Backend to Kite Mainnet

ethers.js connects to Kite mainnet RPC (`https://rpc.gokite.ai/`). All contract reads (pool state, position data, CapitalRouter state) are direct RPC calls. All writes go through gokite-aa-sdk for gasless UserOperation submission via the bundler.

### Connection 3 — Backend to Algebra Contracts

Direct ethers.js calls to the four deployed Algebra contracts using their mainnet addresses. NonfungiblePositionManager for LP management. SwapRouter for arb execution. AlgebraFactory for pool lookup. All Algebra interfaces are Uniswap V3 compatible — use Uniswap V3 ABIs directly.

Algebra interface docs: `https://docs.algebra.finance/algebra-integral-documentation/technical-reference`

### Connection 4 — Backend to Kite Agent Passport

Passport API calls for reading and updating reputation scores. The owner's signing key authorizes all Passport updates. Agent DIDs are used as the primary identifier across the entire system.

### Connection 5 — Backend to CapitalRouter Contract

ethers.js calls to CapitalRouter for: reading allocations, updating reputation scores, authorizing session keys. The backend's signing wallet must be the CapitalRouter owner to call restricted functions.

### Connection 6 — Backend to KitexAuditLog Contract

After every agent action, the backend calls the relevant log function on KitexAuditLog. This creates the permanent on-chain record used by the frontend's event feed and the demo page's transaction list.

### Connection 7 — Agent Orchestrator Loop

The orchestrator is a `setInterval` loop running in the backend process. Every cycle: read state → run agent logic → execute transactions → update reputation → log decisions → sleep until next cycle. This loop is the engine. Everything else is plumbing around it.

### Connection 8 — Demo Page Controls

Demo page buttons call backend endpoints that execute real mainnet transactions. The `/api/demo/trigger-divergence` endpoint calls the SwapRouter directly (not through an agent session key — this is a demo admin action). The frontend then polls `/api/events` and shows the new ArbitrageAgent response as it arrives in subsequent blocks.

---

## 11. Team Split and Responsibilities

Three parallel tracks. After Day 1 environment setup, all three can work independently.

### Person 1 — Blockchain, Contracts, and Indexing

Primary ownership:
- `CapitalRouter.sol` — write, test, deploy to Kite mainnet
- `KitexAuditLog.sol` — write, test, deploy to Kite mainnet
- Algebra contract interaction layer in backend (ethers.js wrappers for pool reads and LP management calls)
- gokite-aa-sdk integration for session key issuance and UserOperation submission
- Agent Passport registration for all three agents via Kite portal
- Deployment scripts and contract verification on Kitescan
- Goldsky subgraph — schema, mappings, and deployment on `kite-ai` mainnet chain slug
- Subgraph indexes KitexAuditLog events and Algebra pool Swap/Mint/Burn events
- Confirm GraphQL endpoint is live and returning real data after first contract events emit
- Share Goldsky endpoint URL with Person 2 and Person 3 as integration checkpoint

Docs to use:
- `https://docs.gokite.ai/kite-chain/building-dapps`
- `https://docs.gokite.ai/kite-chain/account-abstraction-sdk`
- `https://docs.algebra.finance/algebra-integral-documentation`
- `https://docs.gokite.ai/kite-agent-passport/developer-guide`
- `https://docs.goldsky.com/chains/kite-ai`
- `https://docs.goldsky.com/subgraphs/deploying-subgraphs`
- `https://docs.goldsky.com/subgraphs/guides/create-a-no-code-subgraph`
- Kite mainnet explorer: `https://kitescan.ai`
- Algebra NonfungiblePositionManager ABI: same as Uniswap V3 NonfungiblePositionManager

Checkpoint for integration: deployed contract addresses, contract ABIs, three Agent Passport DIDs, working session key issuance test, and live Goldsky GraphQL endpoint URL returning real indexed events.

### Person 2 — Backend and Agent Logic

Primary ownership:
- Node.js Express server with all endpoints from Section 9
- Agent Orchestrator loop
- LiquidityAgent logic module
- ArbitrageAgent logic module (uses Goldsky `poolSwaps` query for reference price)
- RiskAgent logic module (uses Goldsky `hedgeEvents` query for delta history)
- LiquidityAgent rebalance cost check (uses Goldsky `lpEvents` query for fee history)
- Goldsky GraphQL client in backend (`backend/lib/goldsky.ts`) — all queries used by agent logic
- Kite Agent Passport API integration for reputation reads and updates
- MongoDB setup with both collections
- Price divergence computation
- PnL calculation and reputation update logic
- Demo endpoint implementations

Docs to use:
- `https://docs.gokite.ai/kite-agent-passport/developer-guide`
- `https://docs.algebra.finance/algebra-integral-documentation/technical-reference`
- `https://docs.goldsky.com/subgraphs/querying`
- gokite-aa-sdk npm package
- `https://github.com/coinbase/x402/blob/main/specs/x402-specification.md`

Checkpoint for integration: working orchestrator cycle that reads pool state from both ethers.js AND Goldsky, makes a real LP decision, executes one real transaction on mainnet, and returns a response to `/api/dashboard`.

### Person 3 — Frontend and Demo

Primary ownership:
- Next.js application setup
- All five pages (Dashboard, Agent Detail, Positions, Demo, How It Works)
- React Query polling for live data — dashboard feed and agent charts query Goldsky directly from browser
- Goldsky GraphQL client in frontend (`frontend/lib/goldsky.ts`) — live event feed and chart queries
- Recharts charts (reputation line chart, PnL chart, treasury allocation pie)
- LP range visualization on Positions page
- Demo page with control buttons and live transaction feed (polls Goldsky for latest arb and LP events)
- Next.js API route proxies to backend
- Environment variables: `NEXT_PUBLIC_GOLDSKY_ENDPOINT` and `BACKEND_URL`
- Demo rehearsal with full team

Docs to use:
- Backend API spec from Section 9
- Goldsky GraphQL endpoint URL (from Person 1)
- Goldsky queries from Section 16
- `https://tanstack.com/query/latest` for React Query
- Recharts documentation
- Kite mainnet explorer for transaction links: `https://kitescan.ai`

Checkpoint for integration: Dashboard showing live agent cards from backend AND live event feed from Goldsky directly. Demo page buttons triggering real transactions and charts updating from Goldsky within 2-3 blocks.

---

## 12. End Products Per Person

### Person 1 Delivers

1. `CapitalRouter.sol` — deployed and verified on Kite mainnet with address
2. `KitexAuditLog.sol` — deployed and verified on Kite mainnet with address
3. `contracts/abis/` — ABI files for both contracts
4. `contracts/deploy.ts` — deployment script
5. Three Agent Passport DIDs — LiquidityAgent, ArbitrageAgent, RiskAgent
6. `backend/lib/algebra.ts` — ethers.js wrappers for all Algebra contract reads
7. `backend/lib/sessionKey.ts` — gokite-aa-sdk wrapper for session key issuance and UserOp submission
8. `subgraph/` — schema, subgraph.yaml, and AssemblyScript mappings for Goldsky
9. Live Goldsky GraphQL endpoint URL indexing both KitexAuditLog and Algebra pool events
10. Working test: one real LP position opened on Kite mainnet via session key, confirmed in Goldsky

### Person 2 Delivers

1. `backend/` — complete Express app with all endpoints
2. `backend/orchestrator/` — agent loop with all three agent logic modules
3. `backend/lib/passport.ts` — Kite Agent Passport API integration
4. `backend/lib/goldsky.ts` — Goldsky GraphQL client with all queries used by agent logic
5. `backend/lib/pnl.ts` — PnL calculation and reputation update logic
6. `backend/.env.example` — all required environment variables documented including `GOLDSKY_ENDPOINT`
7. MongoDB running with both collections seeded with initial state
8. `backend/README.md` — how to run locally
9. Working test: full orchestrator cycle using Goldsky for price history, completing one arb detection and execution on mainnet

### Person 3 Delivers

1. `frontend/` — complete Next.js application
2. All five pages implemented and navigable
3. Dashboard with live agent cards from backend AND live event feed from Goldsky confirmed updating
4. Agent detail page with reputation and PnL charts pulling from Goldsky
5. Positions page with in-range visualization
6. Demo page with all three control buttons working end-to-end, transaction feed from Goldsky
7. `frontend/lib/goldsky.ts` — Goldsky GraphQL client for browser-side queries
8. `frontend/.env.example` — frontend environment variables including `NEXT_PUBLIC_GOLDSKY_ENDPOINT`
9. Full demo rehearsal completed with team at least once before submission

---

## 13. Demo Structure

The demo is 3 minutes. One story: agents work autonomously, the arb fires on a real divergence, reputation changes, capital moves.

### Pre-demo setup (done before judges)

- Both contracts deployed and verified on Kite mainnet
- All three Agent Passports registered with baseline reputation scores
- $15 of USDC.e deposited into CapitalRouter
- LiquidityAgent has already placed one real LP position (USDC.e/WKITE)
- Dashboard showing all three agents active, LP position in range
- Demo page open in browser, not minimized
- Kitescan open in a second tab

### Minute 1 — Show the system working normally

Dashboard open. Three agent cards visible. LiquidityAgent shows active position. Show the reputation scores and allocation percentages.

Click LiquidityAgent detail. Show the LP position — tick range, current price cursor inside the range, fees earned. Click the Kitescan link for the LP position NFT. Judges see a real on-chain position.

Come back to dashboard. Point to the live event feed updating as the orchestrator cycles. "Every 15 seconds, three agents check the pool state and decide if any action is needed. All of this is autonomous. No human triggered any of it."

### Minute 2 — Trigger the arb

Go to Demo page. Press "Trigger Price Divergence". This executes a real swap on Algebra mainnet that pushes price 0.5% outside the LP range.

Watch the event feed. Within 1-2 blocks (Kite is fast — sub-second finality on Avalanche L1), ArbitrageAgent detects the divergence and fires a self-arb swap. The event appears in the feed: "ARB EXECUTED — profit: $X".

Click the transaction hash. Kitescan opens showing the real ArbitrageAgent swap transaction — inputs, outputs, profit.

Go back. Show ArbitrageAgent's reputation score — it just increased. Show the allocation percentages — ArbitrageAgent's share just grew. "The system rewarded the agent that just performed. No human touched a config file."

### Minute 3 — Show the audit trail

On Kitescan, show the KitexAuditLog contract's event history:
1. LPPositionOpened — when the session started
2. ArbitrageExecuted — the arb that just happened, with profit embedded in the event
3. ReputationUpdated — reputation change after the arb

"Every decision this system makes is permanently on-chain. You can see when each agent acted, what it did, and what the outcome was. If an agent starts losing money, its reputation drops, its capital allocation drops, and it effectively gets defunded by the protocol — automatically, on-chain, no human intervention."

Final line: "On a standard DEX, your LP bleeds to arbitrageurs. On Kitex, your LP IS the arbitrageur — and the better it performs, the more capital it earns to protect."

---

## 14. Cost Breakdown

Kite is an Avalanche L1. Gas fees are extremely low.

KITE token price as of early May 2026: approximately $0.15

| Action | Estimated Gas | Estimated Cost USD |
|--------|--------------|-------------------|
| Deploy CapitalRouter.sol | ~600,000 gas | ~$0.01 |
| Deploy KitexAuditLog.sol | ~400,000 gas | ~$0.007 |
| Open LP position | ~250,000 gas | ~$0.004 |
| Execute arb swap | ~150,000 gas | ~$0.002 |
| Close LP position | ~200,000 gas | ~$0.003 |
| Update reputation | ~80,000 gas | ~$0.001 |
| Log audit event | ~60,000 gas | ~$0.001 |

Total estimated cost for full hackathon including demo (100 transactions): under $2 in KITE gas fees.

You also need actual USDC.e for the LP position and trading capital. $10-15 of USDC.e is more than sufficient for a demo LP position and several arb swaps.

**Total out of pocket: under $20 including all gas and trading capital.**

---

## 15. Docs and References

### Kite AI

| Topic | URL |
|-------|-----|
| Main docs | `https://docs.gokite.ai` |
| Account Abstraction SDK | `https://docs.gokite.ai/kite-chain/account-abstraction-sdk` |
| Building dApps | `https://docs.gokite.ai/kite-chain/building-dapps` |
| Agent Passport developer guide | `https://docs.gokite.ai/kite-agent-passport/developer-guide` |
| Smart contracts list | `https://docs.gokite.ai/kite-chain/3-developing/smart-contracts-list` |
| Gasless integration | `https://docs.gokite.ai/kite-chain/stablecoin-gasless-transfer` |
| Kite mainnet RPC | `https://rpc.gokite.ai/` |
| Kite mainnet explorer | `https://kitescan.ai` |
| Kite Portal (Passport) | `https://x402-portal-eight.vercel.app/` |
| Bundler RPC | `https://bundler-service.staging.gokite.ai/rpc/` |

### Algebra Integral DEX (Kite Mainnet)

| Contract | Address |
|----------|---------|
| AlgebraFactory | `0x10253594A832f967994b44f33411940533302ACb` |
| SwapRouter | `0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A` |
| NonfungiblePositionManager | `0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C` |
| Multicall3 | `0xE3104A157cc4C0d3c7C3a8c655092668D068c149` |

| Topic | URL |
|-------|-----|
| Algebra docs | `https://docs.algebra.finance/algebra-integral-documentation` |
| Algebra technical reference | `https://docs.algebra.finance/algebra-integral-documentation/technical-reference` |
| Algebra adding liquidity | `https://docs.algebra.finance/algebra-integral-documentation/liquidity-provisioning-tutorials-and-faqs/adding-liquidity` |

### Tokens (Kite Mainnet)

| Token | Address | Decimals |
|-------|---------|----------|
| USDC.e | `0x7aB6f3ed87C42eF0aDb67Ed95090f8bF5240149e` | 6 |
| USDT | `0x3Fdd283C4c43A60398bf93CA01a8a8BD773a755b` | 6 |
| WKITE | `0xcc788DC0486CD2BaacFf287eea1902cc09FbA570` | 18 |
| WETH | `0x3D66d6c3201190952e8EA973F59c4428b32D5F9b` | 18 |

### x402

| Topic | URL |
|-------|-----|
| Specification | `https://github.com/coinbase/x402/blob/main/specs/x402-specification.md` |

### Kite AA Contracts (Existing, Do Not Redeploy)

| Contract | Address |
|----------|---------|
| GokiteAccount | `0x93F5310eFd0f09db0666CA5146E63CA6Cdc6FC21` |
| GokiteAccountFactory | `0xF0Fc19F0dc393867F19351d25EDfc5E099561cb7` |
| Settlement Token | `0x0fF5393387ad2f9f691FD6Fd28e07E3969e27e63` |

---

*Built for Kite AI Agentic Trading and Portfolio Management Track*
*Kitex — three agents, one treasury, autonomous market making with reputation-weighted capital delegation on Kite mainnet*

---

## 16. Goldsky Subgraph

Goldsky indexes historical on-chain data from two sources: KitexAuditLog events and Algebra pool events. Without this, historical charts, agent logic that depends on price history, and the audit trail on the frontend would require either slow block scanning or storing everything off-chain in MongoDB — which loses the on-chain verification story.

### Chain Slug

`kite-ai` (Kite mainnet)

Goldsky Kite AI docs: `https://docs.goldsky.com/chains/kite-ai`

### What Gets Indexed

**From KitexAuditLog.sol:**
- `LPPositionOpened` → stored as `LPEvent` with tickLower, tickUpper, liquidity, timestamp
- `LPPositionClosed` → stored as `LPEvent` with feesCollected, timestamp
- `LPPositionRebalanced` → stored as `LPEvent` with old and new tick ranges
- `ArbitrageExecuted` → stored as `ArbEvent` with amountIn, amountOut, profit, timestamp
- `ArbitrageFailed` → stored as `ArbEvent` with reason, timestamp
- `HedgeIntentLogged` → stored as `HedgeEvent` with deltaExposure, direction, timestamp
- `ReputationUpdated` → stored as `ReputationEvent` with old score, new score, reason, timestamp

**From Algebra USDC.e/WKITE Pool:**
- `Swap` events → stored as `PoolSwap` with amount0, amount1, sqrtPriceX96, tick, timestamp
- `Mint` events → stored as `PoolMint` with tickLower, tickUpper, amount, timestamp
- `Burn` events → stored as `PoolBurn` with tickLower, tickUpper, amount, timestamp

### Schema

```graphql
type Agent @entity {
  id: ID!
  did: String!
  agentType: String!
  currentReputation: BigInt!
  events: [AgentEvent!]! @derivedFrom(field: "agent")
}

type AgentEvent @entity {
  id: ID!
  agent: Agent!
  eventType: String!
  txHash: Bytes!
  timestamp: BigInt!
  blockNumber: BigInt!
  profit: BigDecimal
  metricValue: BigDecimal
}

type LPEvent @entity {
  id: ID!
  agentDID: String!
  action: String!
  tickLower: Int!
  tickUpper: Int!
  liquidity: BigInt!
  feesCollected: BigDecimal
  timestamp: BigInt!
  txHash: Bytes!
}

type ArbEvent @entity {
  id: ID!
  agentDID: String!
  success: Boolean!
  amountIn: BigDecimal!
  amountOut: BigDecimal!
  profit: BigDecimal!
  timestamp: BigInt!
  txHash: Bytes!
}

type HedgeEvent @entity {
  id: ID!
  agentDID: String!
  deltaExposure: BigDecimal!
  direction: String!
  timestamp: BigInt!
  txHash: Bytes!
}

type ReputationEvent @entity {
  id: ID!
  agentDID: String!
  oldScore: BigInt!
  newScore: BigInt!
  reason: String!
  timestamp: BigInt!
  txHash: Bytes!
}

type PoolSwap @entity {
  id: ID!
  amount0: BigDecimal!
  amount1: BigDecimal!
  sqrtPriceX96: BigInt!
  tick: Int!
  timestamp: BigInt!
  txHash: Bytes!
}
```

### Deployment

```bash
goldsky subgraph deploy kitex-kite-ai/1.0.0 \
  --path ./subgraph \
  --network kite-ai
```

Or use Goldsky no-code wizard with KitexAuditLog ABI and Algebra pool ABI.

GraphQL endpoint format:
`https://api.goldsky.com/api/public/PROJECT_ID/subgraphs/kitex-kite-ai/1.0.0/gn`

Stored as `GOLDSKY_ENDPOINT` environment variable.

### Key Queries Used by the System

**ArbitrageAgent price history (backend agent logic):**
```graphql
query RecentSwaps($limit: Int!) {
  poolSwaps(
    orderBy: timestamp
    orderDirection: desc
    first: $limit
  ) {
    sqrtPriceX96
    tick
    timestamp
    amount0
    amount1
  }
}
```
ArbitrageAgent uses the last 20 swap prices to compute a rolling reference price and detect divergence from current pool price.

**Reputation history for agent detail chart (frontend):**
```graphql
query ReputationHistory($did: String!) {
  reputationEvents(
    where: { agentDID: $did }
    orderBy: timestamp
    orderDirection: asc
    first: 50
  ) {
    oldScore
    newScore
    reason
    timestamp
    txHash
  }
}
```

**Arb PnL history for agent detail chart (frontend):**
```graphql
query ArbHistory($did: String!) {
  arbEvents(
    where: { agentDID: $did }
    orderBy: timestamp
    orderDirection: asc
    first: 50
  ) {
    success
    profit
    amountIn
    amountOut
    timestamp
    txHash
  }
}
```

**Live event feed for dashboard (frontend, polled every 3 seconds):**
```graphql
query LatestEvents($since: BigInt!) {
  agentEvents(
    where: { timestamp_gt: $since }
    orderBy: timestamp
    orderDirection: desc
    first: 20
  ) {
    agent { did agentType }
    eventType
    profit
    metricValue
    timestamp
    txHash
  }
}
```

**RiskAgent delta history (backend agent logic):**
```graphql
query DeltaHistory($did: String!, $limit: Int!) {
  hedgeEvents(
    where: { agentDID: $did }
    orderBy: timestamp
    orderDirection: desc
    first: $limit
  ) {
    deltaExposure
    direction
    timestamp
  }
}
```

### Where Goldsky Fits in Each Component

**Backend agent logic:**
- ArbitrageAgent queries `poolSwaps` to compute rolling reference price before each divergence check
- RiskAgent queries `hedgeEvents` to see if delta has been consistently high across multiple cycles (sustained drift vs temporary spike)
- LiquidityAgent queries `lpEvents` to compute average fee rate per block and decide if a rebalance is cost-efficient

**Backend API endpoints:**
- `/api/agents/[did]` returns reputation history and PnL history from Goldsky, combined with current on-chain state from ethers.js
- `/api/events` returns latest agentEvents from Goldsky for the dashboard feed

**Frontend direct queries:**
- Dashboard live event feed polls Goldsky GraphQL directly every 3 seconds
- Agent detail page charts (reputation, PnL) fetch from Goldsky directly
- Demo page transaction feed polls Goldsky for latest arbEvents and lpEvents

### Updated Person 1 Responsibilities

Person 1 adds to their existing blockchain responsibilities:
- Write `subgraph/schema.graphql` using the schema above
- Write `subgraph/subgraph.yaml` pointing at KitexAuditLog and Algebra pool contract addresses with `kite-ai` network
- Write AssemblyScript mappings for KitexAuditLog events
- Deploy subgraph via Goldsky CLI: `goldsky subgraph deploy kitex-kite-ai/1.0.0`
- Confirm GraphQL endpoint is live and returning data after first contract events emit
- Share endpoint URL with Person 2 and Person 3

Goldsky deploy docs: `https://docs.goldsky.com/subgraphs/deploying-subgraphs`
Goldsky no-code wizard: `https://docs.goldsky.com/subgraphs/guides/create-a-no-code-subgraph`
Goldsky query docs: `https://docs.goldsky.com/subgraphs/querying`
