# Person 1 Deliverables — Blockchain, Contracts, Indexing

Complete record of everything built and deployed for Kitex.

---

## Deployed Contracts (Kite Mainnet — Chain 2366)

| Contract | Address |
|----------|---------|
| CapitalRouter | `0xa952E8aC92BCE001b5Ef4Ddb1A4027a7b9D2868E` |
| KitexAuditLog | `0x2725111582b68539DF62d57F579EAfCEbFb870b0` |

Explorer:
- https://kitescan.ai/address/0xa952E8aC92BCE001b5Ef4Ddb1A4027a7b9D2868E
- https://kitescan.ai/address/0x2725111582b68539DF62d57F579EAfCEbFb870b0

Deployer wallet: `0xCD8F91DC7929E973DDc071838904434297aB4673`

---

## Algebra DEX (Already Deployed — Do Not Redeploy)

| Contract | Address |
|----------|---------|
| AlgebraFactory | `0x10253594A832f967994b44f33411940533302ACb` |
| SwapRouter | `0x03f8B4b140249Dc7B2503C928E7258CCe1d91F1A` |
| NonfungiblePositionManager | `0xD637cbc214Bc3dD354aBb309f4fE717ffdD0B28C` |
| USDC.e/WKITE Pool | `0xfB971C3200c3DB4Ef23F991D2d1F0D329A1Bf036` |

---

## Tokens (Kite Mainnet)

| Token | Address | Decimals |
|-------|---------|----------|
| USDC.e | `0x7aB6f3ed87C42eF0aDb67Ed95090f8bF5240149e` | 6 |
| WKITE | `0xcc788DC0486CD2BaacFf287eea1902cc09FbA570` | 18 |

---

## Agent DIDs (bytes32 — registered in CapitalRouter on-chain)

| Agent | DID | Base Allocation | Initial Reputation |
|-------|-----|-----------------|-------------------|
| LiquidityAgent | `0x4c69717569646974794167656e74000000000000000000000000000000000000` | 50% | 100 |
| ArbitrageAgent | `0x4172626974726167654167656e74000000000000000000000000000000000000` | 20% | 100 |
| RiskAgent | `0x5269736b4167656e740000000000000000000000000000000000000000000000` | 30% | 100 |

Registration txs on Kite mainnet:
- LiquidityAgent: `0xb149831cec95386ca1a8b2a3f09f7b7e7288a5e09426500deddfe802f750f4c2`
- ArbitrageAgent: `0xf85d858e3928fa51f28d5efa370212355a50d4783bf88886c5ea29542a2a990e`
- RiskAgent: `0xc57e9e60b0ee2eb6727947dbad90dbffade1e7e3c4bb1925c51517fb5b300d4b`

---

## Kite Passport

| Field | Value |
|-------|-------|
| Owner email | `austinjeremiah04@gmail.com` |
| Owner ID | `user_019df9c0-e372-7331-ab73-867b128df928` |
| Agent ID | `agent_019df9c2-f07b-7845-a15a-1bb1b8c3b726` |
| Agent type | `LiquidityAgent` |

---

## Goldsky Subgraph

| Field | Value |
|-------|-------|
| Project ID | `project_cmot2ezts01ox01vf2zo90141` |
| Subgraph name | `kitex-kite-ai/1.0.0` |
| GraphQL endpoint | `https://api.goldsky.com/api/public/project_cmot2ezts01ox01vf2zo90141/subgraphs/kitex-kite-ai/1.0.0/gn` |
| Indexes | KitexAuditLog events + Algebra USDC.e/WKITE pool swaps |

---

## Infrastructure

| Service | Value |
|---------|-------|
| Kite RPC | `https://rpc.gokite.ai/` |
| Bundler RPC | `https://bundler-service.staging.gokite.ai/rpc/` |
| Kitescan explorer | `https://kitescan.ai` |

---

## Files Delivered

```
onchain/
├── contracts/
│   ├── CapitalRouter.sol          — treasury + reputation-weighted allocation
│   ├── KitexAuditLog.sol          — immutable on-chain event log
│   ├── MockERC20.sol              — test only, not deployed
│   └── abis/
│       ├── CapitalRouter.json
│       ├── KitexAuditLog.json
│       └── AlgebraPool.json
├── scripts/
│   ├── deploy.ts                  — deploys both contracts
│   └── registerAgents.ts          — registers 3 agents in CapitalRouter
├── test/
│   ├── CapitalRouter.test.ts      — 5 tests, all passing
│   └── KitexAuditLog.test.ts      — 6 tests, all passing
├── subgraph/
│   ├── schema.graphql             — Goldsky entity schema
│   ├── subgraph.yaml              — data sources + event handlers
│   └── src/mappings.ts            — AssemblyScript event handlers
├── hardhat.config.ts              — Kite mainnet config
├── deployed-addresses.json        — deployed contract addresses
└── .env.example                   — all env vars documented

backend/
├── lib/
│   ├── algebra.ts                 — ethers.js wrappers for Algebra reads
│   └── sessionKey.ts              — gokite-aa-sdk session key wrapper
└── .env.example                   — all values pre-filled for Person 2
```

---

## Test Results

```
11 passing

CapitalRouter
  ✔ registers three agents correctly
  ✔ reverts if agent already registered
  ✔ accepts USDC.e deposit
  ✔ owner can withdraw
  ✔ recomputes allocations proportionally

KitexAuditLog
  ✔ owner can log
  ✔ authorized backend can log
  ✔ unauthorized caller is rejected
  ✔ emits LPPositionOpened with correct args
  ✔ emits ArbitrageExecuted
  ✔ emits ReputationUpdated
```

---

## Team Integration Handoff

**Person 2 (Backend):**
- Copy `backend/.env.example` to `backend/.env` — all values pre-filled except `PRIVATE_KEY`
- Use `backend/lib/algebra.ts` for all Algebra pool reads
- Use `backend/lib/sessionKey.ts` for session key issuance via gokite-aa-sdk
- Agent DIDs above are already registered in CapitalRouter on-chain

**Person 3 (Frontend):**
- Set `NEXT_PUBLIC_GOLDSKY_ENDPOINT` to the Goldsky URL above
- Set `BACKEND_URL` to wherever Person 2 runs the Express server
- All contract ABIs are in `onchain/contracts/abis/`
