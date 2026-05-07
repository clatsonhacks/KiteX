# Kitex Frontend

Next.js dashboard for monitoring and controlling the Kitex autonomous market making system on Kite AI.

## Overview

This is a trading terminal-style interface built with Next.js 16, TypeScript, and Tailwind CSS. It provides real-time monitoring of three autonomous agents managing liquidity positions on Kite's Algebra Integral DEX.

## Design System

- **Typography:**
  - IBM Plex Sans (body text)
  - IBM Plex Mono (numbers, addresses, technical data)
  - Bebas Neue (display headings)

- **Color Palette:**
  - Background: `oklch(0.08 0 0)` (near-black)
  - Foreground: `oklch(0.95 0 0)` (off-white)
  - Accent: `oklch(0.7 0.2 45)` (orange)
  - Muted: `oklch(0.25 0 0)` (dark gray)
  - Border Radius: 0 (sharp corners throughout)

- **Agent Colors:**
  - LiquidityAgent: Blue (`oklch(0.55 0.8 250)`)
  - ArbitrageAgent: Orange (`oklch(0.7 0.2 45)`)
  - RiskAgent: Emerald (`oklch(0.55 0.8 140)`)

## Pages

### 1. Dashboard (`/dashboard`)
- **Default landing page**
- Treasury statistics (total value, fees, arb profit, net PnL)
- Three agent cards with reputation, allocation, status
- Live activity feed (polling Goldsky every 3 seconds)
- Treasury allocation pie chart

### 2. Agents List (`/agents`)
- Grid view of all three agents
- Quick overview of reputation and status
- Links to individual agent detail pages

### 3. Agent Detail (`/agent/[did]`)
- Full agent profile with current metrics
- Reputation history chart (line chart, last 50 decisions)
- PnL history chart (for ArbitrageAgent)
- LP event history (for LiquidityAgent)
- Delta exposure history (for RiskAgent)
- Full decision history table with Kitescan links

### 4. Positions (`/positions`)
- Active LP positions with in-range visualization
- Price range bar showing current price vs tick range
- Historical positions table
- Live LP events feed from Goldsky

### 5. Demo (`/demo`)
- **Hackathon demonstration controls**
- Three trigger buttons:
  1. Price Divergence (push up/down)
  2. High Volume (simulate 5 swaps)
  3. Force Rebalance
- Manual cycle trigger
- Live transaction feed (last 10 events)
- Contract addresses and Goldsky endpoint info

### 6. How It Works (`/how-it-works`)
- Static explainer page
- Three sections:
  1. The Problem (toxic orderflow + impermanent loss)
  2. The Three Agents (what each does)
  3. The Reputation System (capital allocation)
  4. Tech Stack

## Key Components

### Shared Components (`components/kitex/`)

- **StatCard** — Treasury metric card with label, value, trend indicator
- **AgentCard** — Agent summary card with reputation, allocation, status
- **LiveFeed** — Real-time event feed polling Goldsky
- **ReputationChart** — Line chart for reputation history (Recharts)
- **PnLChart** — Line chart for cumulative PnL (Recharts)
- **KitexNav** — Fixed left sidebar navigation

### Data Fetching

- **Backend API** (`lib/api.ts`) — REST endpoints to Express backend
- **Goldsky GraphQL** (`lib/goldsky.ts`) — Direct queries to subgraph for live data
- **React Query** — 3-second polling for real-time updates

## Environment Variables

Create a `.env.local` file in the `frontend/` directory:

```bash
# Backend API URL (required)
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001

# Goldsky GraphQL endpoint (required)
NEXT_PUBLIC_GOLDSKY_ENDPOINT=https://api.goldsky.com/api/public/project_XXXXX/subgraphs/kitex-kite-ai/1.0.0/gn
```

Get the Goldsky endpoint from Person 1's deliverables.

## Quick Start

```bash
# Install dependencies
npm install --legacy-peer-deps

# Copy environment variables
cp .env.example .env.local

# Edit .env.local and add:
# - NEXT_PUBLIC_BACKEND_URL (default: http://localhost:3001)
# - NEXT_PUBLIC_GOLDSKY_ENDPOINT (from Person 1)

# Start development server
npm run dev

# Open http://localhost:3000
# You will be redirected to /dashboard
```

## Integration with Backend

The frontend expects the backend (Person 2's deliverable) to be running at `NEXT_PUBLIC_BACKEND_URL`.

### Backend Endpoints Used:

- `GET /api/dashboard` → Treasury stats + agent cards
- `GET /api/agents` → All agents list
- `GET /api/agents/:did` → Agent detail with decision history
- `GET /api/positions` → Active and historical LP positions
- `GET /api/events?since=<unix>` → Recent events
- `POST /api/demo/trigger-divergence` → Trigger price divergence
- `POST /api/demo/trigger-volume` → Trigger high volume
- `POST /api/demo/trigger-rebalance` → Force rebalance
- `POST /api/demo/run-cycle` → Run one orchestrator cycle

### Goldsky Queries Used:

- `getRecentSwaps(limit)` → Last N pool swaps
- `getReputationHistory(did)` → Agent reputation events
- `getArbHistory(did)` → ArbitrageAgent profit history
- `getLPHistory(did)` → LiquidityAgent position events
- `getDeltaHistory(did, limit)` → RiskAgent hedge events
- `getLatestEvents(since)` → Live event feed
- `getAllLPEvents()` → All LP events for positions page

## Data Flow

```
Frontend (Next.js)
  ├─ Static Data → Backend REST API (/api/dashboard, /api/agents, etc.)
  ├─ Live Events → Goldsky GraphQL (direct polling every 3s)
  └─ Demo Actions → Backend REST API (POST /api/demo/*)

Backend polls Goldsky for price history in agent logic.
Frontend polls Goldsky for live event feed on dashboard.
```

## Build & Deploy

```bash
# Production build
npm run build

# Start production server
npm start
```

## File Structure

```
frontend/
├── app/
│   ├── (kitex)/                    # Route group for all Kitex pages
│   │   ├── layout.tsx              # Kitex-specific layout (nav + query provider)
│   │   ├── dashboard/page.tsx      # Main dashboard
│   │   ├── agents/page.tsx         # Agents list
│   │   ├── agent/[did]/page.tsx    # Agent detail (dynamic route)
│   │   ├── positions/page.tsx      # LP positions
│   │   ├── demo/page.tsx           # Demo controls
│   │   └── how-it-works/page.tsx   # Static explainer
│   ├── layout.tsx                  # Root layout (fonts, noise overlay)
│   ├── page.tsx                    # Root redirect to /dashboard
│   └── globals.css                 # Tailwind + design tokens
├── components/
│   ├── kitex/
│   │   ├── agent-card.tsx          # Agent summary card
│   │   ├── stat-card.tsx           # Metric card
│   │   ├── live-feed.tsx           # Real-time event feed
│   │   ├── reputation-chart.tsx    # Recharts line chart
│   │   ├── pnl-chart.tsx           # Cumulative PnL chart
│   │   └── kitex-nav.tsx           # Fixed sidebar navigation
│   ├── query-provider.tsx          # React Query provider
│   └── ui/                         # shadcn/ui components
├── lib/
│   ├── api.ts                      # Backend REST client
│   ├── goldsky.ts                  # Goldsky GraphQL client + queries
│   └── utils.ts                    # cn() utility
├── .env.example                    # Environment variable template
└── README.md                       # This file
```

## Dependencies

### Core
- **Next.js 16** (App Router)
- **React 19**
- **TypeScript 5**
- **Tailwind CSS 4**

### Data Fetching
- **@tanstack/react-query** — Real-time data polling
- **graphql-request** — Goldsky GraphQL client
- **ethers.js** — (for future wallet integration)

### UI
- **Recharts** — Charts (reputation, PnL)
- **Radix UI** — Accessible primitives (via shadcn/ui)
- **Lucide React** — Icons
- **Framer Motion** — Animations (inherited from template)

## Notes for Judges

- All data is **real mainnet data** from Kite AI
- No mocked or simulated data in production mode
- Live event feed updates every 3 seconds via Goldsky
- Demo page triggers **real on-chain transactions**
- Every transaction links to Kitescan explorer for verification

## Known Issues & Future Improvements

- [ ] Add wallet connect for user deposits/withdrawals
- [ ] Implement mobile-responsive navigation
- [ ] Add error boundaries for better error handling
- [ ] Cache Goldsky responses to reduce query load
- [ ] Add loading skeletons for better UX

## Team Integration

**Person 1 (Blockchain)** provides:
- Deployed contract addresses
- Agent Passport DIDs
- Goldsky GraphQL endpoint URL

**Person 2 (Backend)** provides:
- Running Express server at NEXT_PUBLIC_BACKEND_URL
- All API endpoints documented above
- Orchestrator running to generate events

**Person 3 (Frontend — this deliverable):**
- Consumes both backend REST API and Goldsky GraphQL
- Polls for real-time updates
- Provides demo controls for hackathon presentation

---

Built for **Kite AI Agentic Trading and Portfolio Management Track**
Kitex — three agents, one treasury, autonomous market making with reputation-weighted capital delegation on Kite mainnet.
