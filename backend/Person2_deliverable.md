# Person 2 Deliverables — Backend, Orchestrator, Integrations

Complete record of everything built for the Kitex backend on top of Person 1's contracts and subgraph.

---

## Stack

| Layer | Choice |
|-------|--------|
| Runtime | Node.js 20+ / TypeScript |
| HTTP | Express 4 |
| Chain reads/writes | ethers.js v6 |
| Subgraph | graphql-request → Goldsky `kitex-kite-ai/1.0.0` |
| Account Abstraction | `gokite-aa-sdk` (via `lib/sessionKey.ts`) |
| Persistence | MongoDB (soft-connect — server boots without it) |

---

## REST API (Express, default port 3001)

| Method | Path | Returns |
|--------|------|---------|
| GET  | `/health` | server + chain config |
| GET  | `/api/dashboard` | treasury value, today's PnL, all agent cards, recent decisions |
| GET  | `/api/agents` | the three agent cards with last action |
| GET  | `/api/agents/:did` | full detail: reputation history, arb history, LP history, decision log |
| GET  | `/api/positions` | active LP positions + historical `lpevents` |
| GET  | `/api/events?since=<unix>` | latest `agentEvents` from Goldsky |
| POST | `/api/deposit` `{ amountUsdc }` | approves USDC.e and calls CapitalRouter.deposit |
| POST | `/api/withdraw` `{ amountUsdc }` | calls CapitalRouter.withdraw |
| POST | `/api/demo/trigger-divergence` `{ direction, amountUsdc }` | real swap that pushes pool price |
| POST | `/api/demo/trigger-volume` `{ swaps, amountUsdc }` | series of real swaps |
| POST | `/api/demo/trigger-rebalance` | runs one orchestrator cycle live |
| POST | `/api/demo/run-cycle` `{ dryRun }` | run one cycle, optionally read-only |
| GET  | `/api/demo/info` | contract addresses + Goldsky endpoint |

---

## Agent Orchestrator

`runCycle()` in `orchestrator/index.ts` executes one full pass:

1. Read Algebra pool state (`globalState`, `liquidity`, `token0/1`).
2. Read each agent's `AgentConfig` from CapitalRouter (allocation, reputation, active flag).
3. **LiquidityAgent** — open if no position; rebalance if price ≥80% across the range AND past cooldown; otherwise skip.
4. **ArbitrageAgent** — pull last 20 pool swaps from Goldsky, compute median reference price, compare against current pool price. If |divergence| > 0.3% AND expected profit > gas, execute. Otherwise skip.
5. **RiskAgent** — approximate composition delta from tick drift; require sustained drift across recent hedge events before signalling. If rebalance is available and cost-efficient, signal it; otherwise log a `HedgeIntent`.
6. PnL is computed for any executed action. Reputation is written to both the Passport API (best-effort) and CapitalRouter on-chain (authoritative). Decision is persisted to Mongo and emitted via `KitexAuditLog`.
7. Cycle state row is written to Mongo.

Standalone runner: `npm run orchestrator` (no HTTP server).

---

## Tuning Knobs (env vars)

| Var | Default | Meaning |
|-----|---------|---------|
| `CYCLE_INTERVAL_MS` | 15000 | How often the orchestrator wakes up |
| `ARB_DIVERGENCE_BPS` | 30 | Min divergence (in bps) to consider an arb |
| `RISK_DELTA_BPS` | 1500 | Min composition delta (in bps) to trigger Risk |
| `REBALANCE_COOLDOWN_SEC` | 120 | Min time between LP rebalances |
| `LP_RANGE_WIDTH_BPS` | 200 | Half-width of LP range, ±2% |
| `START_ORCHESTRATOR` | true | Set to `false` to boot the API server only |

---

## Files Delivered

```
backend/
├── server.ts                 — Express entrypoint (also boots orchestrator)
├── config.ts                 — env loader + agent DID lookup
├── package.json              — runtime deps + dev scripts
├── tsconfig.json
├── README.md                 — setup, endpoint reference, run instructions
├── .env.example              — pre-filled with Person 1's deployed addresses
├── lib/
│   ├── algebra.ts            — Person 1: Algebra pool + position reads
│   ├── sessionKey.ts         — Person 1: gokite-aa-sdk wrapper
│   ├── contracts.ts          — CapitalRouter + KitexAuditLog ethers wrappers
│   ├── goldsky.ts            — GraphQL client + 7 typed queries
│   ├── passport.ts           — Kite Passport API + on-chain reputation sync
│   ├── pnl.ts                — PnL math + reputation update logic
│   ├── mongo.ts              — Mongo client + `decisions` and `cycleState` collections
│   └── abis/
│       ├── CapitalRouter.json
│       ├── KitexAuditLog.json
│       └── AlgebraPool.json
├── orchestrator/
│   ├── index.ts              — runCycle() + interval loop
│   ├── run.ts                — standalone orchestrator entrypoint
│   ├── liquidityAgent.ts     — LP open/rebalance decisions
│   ├── arbitrageAgent.ts     — divergence detection + arb action
│   └── riskAgent.ts          — delta exposure + hedge intent / rebalance signal
├── routes/
│   ├── dashboard.ts          — GET /api/dashboard
│   ├── agents.ts             — GET /api/agents, GET /api/agents/:did
│   ├── positions.ts          — GET /api/positions
│   ├── events.ts             — GET /api/events
│   ├── treasury.ts           — POST /api/deposit, /api/withdraw
│   └── demo.ts               — POST /api/demo/{trigger-divergence,trigger-volume,trigger-rebalance,run-cycle}
└── tests/
    ├── cycle.ts              — single-cycle dry-run smoke test
    └── readonly.ts           — full read-only mainnet integration test
```

---

## MongoDB Collections

```
decisions
  agentDID, action, txHash, inputAmount, outputAmount, profit, gasUsed,
  netPnL, reputationBefore, reputationAfter, reason, timestamp, blockNumber

cycleState
  cycleNumber, poolPrice, poolTick, activeLPTokenId,
  positionTickLower, positionTickUpper, deltaExposure, lastUpdated
```

Indexes: `decisions(agentDID, timestamp desc)`, `decisions(timestamp desc)`, `cycleState(cycleNumber desc)`.

---

## Test Results

Read-only mainnet integration test: `npx ts-node tests/readonly.ts`

```
19 PASS / 0 FAIL

[1] lib/algebra
  PASS  algebra.getPoolState                       tick=290471 price=4.115268

[2] lib/contracts (CapitalRouter reads)
  PASS  contracts.getTreasuryBalance               0.000000 USDC.e
  PASS  contracts.getAllAgentDIDs                  3 agents registered
  PASS  contracts.getAgentConfig(LiquidityAgent)   rep=100 bps=5000
  PASS  contracts.getAgentConfig(ArbitrageAgent)   rep=100 bps=2000
  PASS  contracts.getAgentConfig(RiskAgent)        rep=100 bps=3000

[3] lib/goldsky
  PASS  goldsky.recentSwaps                        20 pool swaps indexed
  PASS  goldsky.computeReferencePrice              reference price = 4.133480
  PASS  goldsky.reputationHistory(LiquidityAgent)  0 reputation events
  PASS  goldsky.reputationHistory(ArbitrageAgent)  0 reputation events
  PASS  goldsky.reputationHistory(RiskAgent)       0 reputation events
  PASS  goldsky.arbHistory(ArbitrageAgent)         0 arb events
  PASS  goldsky.lpHistory(LiquidityAgent)          0 LP events
  PASS  goldsky.deltaHistory(RiskAgent)            0 hedge events
  PASS  goldsky.latestEvents                       0 agent events since epoch

[4] lib/passport (read path)
  PASS  passport.readReputation(LiquidityAgent)    reputation = 100
  PASS  passport.readReputation(ArbitrageAgent)    reputation = 100
  PASS  passport.readReputation(RiskAgent)         reputation = 100

[5] orchestrator (dryRun)
  PASS  runCycle({ dryRun: true })
        decisions: Liquidity=OPEN, Arbitrage=EXECUTE, Risk=SKIP
```

The test captures `console.warn` per check, so a silently-swallowed Goldsky error or fallback path can't pass unnoticed.

Express server smoke-tested with `START_ORCHESTRATOR=false`: every read-only endpoint returns well-formed JSON pulled from live Kite mainnet + Goldsky.

---

## Bugs Found & Fixed Along The Way

| Commit | Issue |
|--------|-------|
| `9e4e70d` | Algebra Integral's `globalState()` returns 6 fields, not the 7-field Uniswap V3 layout. Decoding was failing with `BAD_DATA` on every cycle. |
| `0f3fdea` | Goldsky's query field for entity `LPEvent` is `lpevents` (full-lowercase), not `lpEvents`. Was returning `[]` silently while logging a warning. |

---

## Team Integration Handoff

**For Person 3 (Frontend):**

- Set `BACKEND_URL=http://localhost:3001` and `NEXT_PUBLIC_GOLDSKY_ENDPOINT` to the URL in Person 1's deliverable.
- Boot the backend with the orchestrator disabled while developing pages: `START_ORCHESTRATOR=false npm run dev`.
- Live event feed and agent charts can hit Goldsky directly for low latency. Everything else (treasury value, agent cards, position metadata, demo control buttons) goes through the REST API in the table above.
- All response shapes are documented in `routes/*.ts`. Each endpoint returns JSON suitable for direct consumption by React Query.
- Until the orchestrator runs without `dryRun`, the subgraph contains pool swaps but no `arbEvents` / `lpevents` / `hedgeEvents` / `reputationEvents` — empty-state UI needs to handle that cleanly.

**For end-to-end demo:**

- `POST /api/demo/trigger-divergence` performs a real on-chain swap that pushes the pool price outside the LP range — within 1–2 cycles, ArbitrageAgent will detect the divergence and arb, emitting `ArbitrageExecuted` to KitexAuditLog and bumping its reputation.
- `POST /api/demo/run-cycle` runs a single cycle on demand — useful for the demo if 15s feels too slow on stage.

---

## Quick Start

```sh
cd backend
npm install
cp .env.example .env
# set PRIVATE_KEY to the deployer wallet (CapitalRouter owner)

# Read-only sanity check (no on-chain writes):
npx ts-node tests/readonly.ts

# Dev server + orchestrator:
npm run dev

# API only, no orchestrator (best for frontend dev):
START_ORCHESTRATOR=false npm run dev
```
