/**
 * Smoke test: run a single orchestrator cycle in dry-run mode and print decisions.
 * Hits Kite mainnet RPC + Goldsky for reads, but does not send any tx.
 *
 * Run with:  npm run test:cycle
 */
import { runCycle } from "../orchestrator";
import { tryConnect, close } from "../lib/mongo";

(async () => {
  await tryConnect();
  console.log("[test] running one dry-run cycle...");
  const summary = await runCycle({ dryRun: true });
  console.log(JSON.stringify(summary, null, 2));
  await close();
})().catch((e) => {
  console.error("[test] failed:", e);
  process.exit(1);
});
