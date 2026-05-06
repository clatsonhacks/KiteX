import { startOrchestrator } from "./index";

startOrchestrator();

process.on("SIGINT", () => {
  console.log("\n[orchestrator] shutting down");
  process.exit(0);
});
