# Kitex Backend (Person 2)

Node.js + Express server. Runs the agent orchestrator loop, executes the three agents'
logic against Kite mainnet, exposes the REST API the frontend consumes, and persists
decisions to MongoDB.

## Stack

- **Node 20+ / TypeScript** — Express server.
- **ethers.js v6** — Kite mainnet RPC reads, CapitalRouter + KitexAuditLog writes.
- **graphql-request** — Goldsky subgraph queries.
- **gokite-aa-sdk** — session-key issuance + UserOp submission via the bundler (used
  by `lib/sessionKey.ts`, delivered by Person 1).
- **MongoDB** — `decisions` and `cycleState` collections.

## Layout

```
backend/
├── server.ts                 — Express entrypoint (also boots orchestrator)
├── config.ts                 — env loader + agent DID lookup
├── lib/
│   ├── algebra.ts            — Person 1: Algebra pool + position reads
│   ├── sessionKey.ts         — Person 1: gokite-aa-sdk wrapper
│   ├── contracts.ts          — CapitalRouter + KitexAuditLog ethers wrappers
│   ├── goldsky.ts            — GraphQL client + agent-logic queries
│   ├── passport.ts           — Kite Agent Passport API integration
│   ├── pnl.ts                — PnL math + reputation update logic
│   ├── mongo.ts              — Mongo client + collections
│   └── abis/                 — copies of CapitalRouter, KitexAuditLog, AlgebraPool ABIs
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
    └── cycle.ts              — single-cycle dry-run smoke test
```

## Setup

```sh
cd backend
npm install

cp .env.example .env
# Edit .env and set PRIVATE_KEY to the deployer wallet that owns CapitalRouter
# (0xCD8F91DC7929E973DDc071838904434297aB4673 from Person 1's deliverable).

# Optional: start a local MongoDB. The server will run without it (decisions just
# won't persist), but most endpoints work better with it up.
docker run -d -p 27017:27017 --name kitex-mongo mongo:7

# Sanity check — runs one orchestrator cycle in dry-run mode (no on-chain writes):
npm run test:cycle
```

## Running

```sh
# Dev: server + orchestrator with hot reload
npm run dev

# Just the orchestrator (no HTTP server)
npm run orchestrator

# Production
npm run build && npm start

# Start server without the orchestrator loop (useful for the frontend dev cycle)
START_ORCHESTRATOR=false npm run dev
```

The server listens on `http://localhost:3001` by default.

## API endpoints

| Method | Path | What it returns |
|--------|------|-----------------|
| GET  | `/health` | server + chain config |
| GET  | `/api/dashboard` | treasury value, today's PnL, all agent cards, recent decisions |
| GET  | `/api/agents` | the three agent cards with last action |
| GET  | `/api/agents/:did` | full detail: reputation history, arb history, LP history, decision log |
| GET  | `/api/positions` | active LP positions + historical `lpEvents` |
| GET  | `/api/events?since=<unix>` | latest `agentEvents` from Goldsky |
| POST | `/api/deposit` `{ amountUsdc }` | approves USDC.e and calls CapitalRouter.deposit |
| POST | `/api/withdraw` `{ amountUsdc }` | calls CapitalRouter.withdraw |
| POST | `/api/demo/trigger-divergence` `{ direction, amountUsdc }` | real swap that pushes pool price |
| POST | `/api/demo/trigger-volume` `{ swaps, amountUsdc }` | series of real swaps |
| POST | `/api/demo/trigger-rebalance` | runs one orchestrator cycle live |
| POST | `/api/demo/run-cycle` `{ dryRun }` | run one cycle, optionally read-only |
| GET  | `/api/demo/info` | contract addresses + Goldsky endpoint |

## Orchestrator cycle

`runCycle()` does, in order:

1. Read Algebra pool state (`globalState`, `liquidity`, `token0`/`token1`).
2. Read each agent's `AgentConfig` from CapitalRouter (allocation, reputation, active flag).
3. **LiquidityAgent** — open if no position; rebalance if price ≥80% across the range
   AND past cooldown; otherwise skip.
4. **ArbitrageAgent** — pull last 20 pool swaps from Goldsky, compute median reference
   price, compare against current pool price. If |divergence| > 0.3% AND expected
   profit > gas, execute and record. Otherwise skip.
5. **RiskAgent** — approximate composition delta from tick drift; require sustained
   drift across recent hedge events before signalling. If rebalance is available and
   cost-efficient, signal it; otherwise log a `HedgeIntent`.
6. PnL is computed for any executed action; reputation is written to both the Passport
   API (best-effort) and CapitalRouter on-chain (authoritative); decision is persisted
   to Mongo and emitted via `KitexAuditLog`.
7. Cycle state row is written to Mongo.

## Tuning knobs (env)

| Var | Default | Meaning |
|-----|---------|---------|
| `CYCLE_INTERVAL_MS` | 15000 | How often the orchestrator wakes up |
| `ARB_DIVERGENCE_BPS` | 30 | Min divergence (in bps) to consider an arb |
| `RISK_DELTA_BPS` | 1500 | Min composition delta (in bps) to trigger Risk |
| `REBALANCE_COOLDOWN_SEC` | 120 | Min time between LP rebalances |
| `LP_RANGE_WIDTH_BPS` | 200 | Half-width of LP range, ±2% |

## Wiring with Person 1 / Person 3

- **From Person 1**: deployed addresses, agent DIDs, Goldsky endpoint — all already
  pre-filled in `.env.example`. Only `PRIVATE_KEY` needs to be set locally.
- **For Person 3**: the frontend hits this server via the `BACKEND_URL` env var. Live
  event feeds can hit Goldsky directly (`NEXT_PUBLIC_GOLDSKY_ENDPOINT`) for lower
  latency; everything else flows through these REST endpoints.

## Smoke-test checklist

- `npm run test:cycle` returns a JSON summary with three `decisions` entries (one per
  agent), each containing `kind`/`action` and a `reason` if skipped.
- `GET /health` returns the configured contract addresses.
- `GET /api/dashboard` returns three agents with non-zero `reputation` (initially 100
  each, per Person 1's `registerAgents.ts`).
- `POST /api/demo/trigger-divergence` returns a Kitescan tx hash; the next
  orchestrator cycle should pick up the new pool price.
