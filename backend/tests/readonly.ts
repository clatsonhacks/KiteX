/**
 * Read-only integration test for the Kitex backend.
 *
 * Hits live Kite mainnet RPC + Goldsky. Does NOT send any transactions.
 * Each check is independent — one failing read won't stop the rest.
 *
 * Run:  npx ts-node tests/readonly.ts
 */
import { config, ALL_AGENT_DIDS, didToAgentType } from "../config";
import { getPoolState, sqrtPriceX96ToPrice } from "../lib/algebra";
import {
  getAgentConfig,
  getAllocation,
  getTreasuryBalance,
  getAllAgentDIDs,
} from "../lib/contracts";
import {
  recentSwaps,
  reputationHistory,
  arbHistory,
  lpHistory,
  deltaHistory,
  latestEvents,
  computeReferencePrice,
} from "../lib/goldsky";
import { readReputation } from "../lib/passport";
import { runCycle } from "../orchestrator";
import { tryConnect, close } from "../lib/mongo";
import { PAIR } from "../orchestrator/liquidityAgent";

type Status = "PASS" | "FAIL";
const results: Array<{ name: string; status: Status; detail: string }> = [];

// Capture console.warn during a check — any warning fails the check, so a silently-
// swallowed Goldsky error or a fallback path can't pass unnoticed.
const realWarn = console.warn.bind(console);

async function check(name: string, fn: () => Promise<string>) {
  const t0 = Date.now();
  const warnings: string[] = [];
  console.warn = (...args: unknown[]) => warnings.push(args.map(String).join(" "));
  try {
    const detail = await fn();
    const ms = Date.now() - t0;
    if (warnings.length > 0) {
      const w = warnings.join(" | ");
      results.push({ name, status: "FAIL", detail: `silent warning: ${w}` });
      console.log(`  FAIL  ${name}`);
      console.log(`        silent warning: ${w}`);
      return;
    }
    results.push({ name, status: "PASS", detail: `${detail} (${ms}ms)` });
    console.log(`  PASS  ${name}`);
    console.log(`        ${detail}`);
  } catch (e) {
    results.push({ name, status: "FAIL", detail: (e as Error).message });
    console.log(`  FAIL  ${name}`);
    console.log(`        ${(e as Error).message}`);
  } finally {
    console.warn = realWarn;
  }
}

(async () => {
  console.log("=== Kitex backend read-only integration test ===\n");
  console.log(`RPC:        ${config.rpcUrl}`);
  console.log(`Pool:       ${config.algebraPoolAddress}`);
  console.log(`Router:     ${config.capitalRouterAddress}`);
  console.log(`AuditLog:   ${config.auditLogAddress}`);
  console.log(`Goldsky:    ${config.goldskyEndpoint.slice(0, 70)}...\n`);

  await tryConnect();

  // ── lib/algebra ───────────────────────────────────────────────────────
  console.log("[1] lib/algebra");
  await check("algebra.getPoolState", async () => {
    const p = await getPoolState(config.algebraPoolAddress);
    if (p.sqrtPriceX96 === 0n) throw new Error("zero sqrtPriceX96");
    const price = sqrtPriceX96ToPrice(p.sqrtPriceX96, PAIR.decimals0, PAIR.decimals1);
    if (!Number.isFinite(price) || price <= 0) throw new Error(`bad price ${price}`);
    return `tick=${p.tick} price=${price.toFixed(6)} liq=${p.liquidity}`;
  });

  // ── lib/contracts ─────────────────────────────────────────────────────
  console.log("\n[2] lib/contracts (CapitalRouter reads)");
  await check("contracts.getTreasuryBalance", async () => {
    const t = await getTreasuryBalance();
    return `${(Number(t) / 1e6).toFixed(6)} USDC.e`;
  });

  await check("contracts.getAllAgentDIDs", async () => {
    const dids = await getAllAgentDIDs();
    if (dids.length !== 3) throw new Error(`expected 3 agents, got ${dids.length}`);
    return `${dids.length} agents registered`;
  });

  for (const a of ALL_AGENT_DIDS()) {
    await check(`contracts.getAgentConfig(${a.type})`, async () => {
      const c = await getAgentConfig(a.did);
      if (!c.isActive) throw new Error("agent not active");
      const alloc = await getAllocation(a.did);
      return `rep=${c.reputationScore} bps=${c.currentAllocationBps} alloc=${(Number(alloc) / 1e6).toFixed(6)} USDC.e`;
    });
  }

  // ── lib/goldsky ───────────────────────────────────────────────────────
  console.log("\n[3] lib/goldsky");
  await check("goldsky.recentSwaps", async () => {
    const swaps = await recentSwaps(20);
    return `${swaps.length} pool swaps indexed`;
  });

  await check("goldsky.computeReferencePrice", async () => {
    const swaps = await recentSwaps(20);
    if (swaps.length === 0) return "no swaps yet — reference price unavailable (expected for cold subgraph)";
    const ref = computeReferencePrice(swaps, PAIR.decimals0, PAIR.decimals1);
    if (ref === null) throw new Error("null reference price");
    return `reference price = ${ref.toFixed(6)}`;
  });

  for (const a of ALL_AGENT_DIDS()) {
    await check(`goldsky.reputationHistory(${a.type})`, async () => {
      const r = await reputationHistory(a.did);
      return `${r.length} reputation events`;
    });
  }

  await check("goldsky.arbHistory(ArbitrageAgent)", async () => {
    const r = await arbHistory(config.arbAgentDID);
    return `${r.length} arb events`;
  });

  await check("goldsky.lpHistory(LiquidityAgent)", async () => {
    const r = await lpHistory(config.liquidityAgentDID);
    return `${r.length} LP events`;
  });

  await check("goldsky.deltaHistory(RiskAgent)", async () => {
    const r = await deltaHistory(config.riskAgentDID, 10);
    return `${r.length} hedge events`;
  });

  await check("goldsky.latestEvents", async () => {
    const r = await latestEvents(0);
    return `${r.length} agent events since epoch`;
  });

  // ── lib/passport (read path only) ─────────────────────────────────────
  console.log("\n[4] lib/passport (read path; falls back to on-chain)");
  for (const a of ALL_AGENT_DIDS()) {
    await check(`passport.readReputation(${a.type})`, async () => {
      const r = await readReputation(a.did);
      if (!Number.isFinite(r)) throw new Error(`non-finite reputation ${r}`);
      return `reputation = ${r}`;
    });
  }

  // ── orchestrator (dry-run; no on-chain writes) ────────────────────────
  console.log("\n[5] orchestrator (dryRun: no on-chain writes)");
  await check("runCycle({ dryRun: true })", async () => {
    const summary = await runCycle({ dryRun: true });
    if (summary.decisions.length !== 3) {
      throw new Error(`expected 3 decisions, got ${summary.decisions.length}`);
    }
    const seen = new Set(summary.decisions.map((d) => d.agent));
    if (!(seen.has("Liquidity") && seen.has("Arbitrage") && seen.has("Risk"))) {
      throw new Error("missing agent decisions");
    }
    return `decisions: ${summary.decisions.map((d) => `${d.agent}=${d.action}`).join(", ")}`;
  });

  // ── summary ───────────────────────────────────────────────────────────
  const passed = results.filter((r) => r.status === "PASS").length;
  const failed = results.filter((r) => r.status === "FAIL").length;
  console.log("\n=== Summary ===");
  console.log(`PASS: ${passed}`);
  console.log(`FAIL: ${failed}`);
  if (failed > 0) {
    console.log("\nFailures:");
    for (const r of results.filter((r) => r.status === "FAIL")) {
      console.log(`  - ${r.name}: ${r.detail}`);
    }
  }

  await close();
  process.exit(failed > 0 ? 1 : 0);
})().catch((e) => {
  console.error("[test] fatal:", e);
  process.exit(1);
});
