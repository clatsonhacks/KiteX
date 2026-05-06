import express from "express";
import cors from "cors";
import { config } from "./config";
import { tryConnect } from "./lib/mongo";
import { startOrchestrator } from "./orchestrator";

import dashboardRoutes from "./routes/dashboard";
import agentRoutes from "./routes/agents";
import positionRoutes from "./routes/positions";
import eventRoutes from "./routes/events";
import treasuryRoutes from "./routes/treasury";
import demoRoutes from "./routes/demo";

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({
      status: "ok",
      chainId: config.chainId,
      capitalRouter: config.capitalRouterAddress,
      auditLog: config.auditLogAddress,
      pool: config.algebraPoolAddress,
    });
  });

  app.use("/api", dashboardRoutes);
  app.use("/api", agentRoutes);
  app.use("/api", positionRoutes);
  app.use("/api", eventRoutes);
  app.use("/api", treasuryRoutes);
  app.use("/api", demoRoutes);

  await tryConnect();

  app.listen(config.port, () => {
    console.log(`[kitex] backend listening on http://localhost:${config.port}`);
    console.log(`[kitex] CapitalRouter ${config.capitalRouterAddress}`);
    console.log(`[kitex] AuditLog       ${config.auditLogAddress}`);
    console.log(`[kitex] Pool           ${config.algebraPoolAddress}`);
  });

  if (process.env.START_ORCHESTRATOR !== "false") {
    startOrchestrator();
  } else {
    console.log("[kitex] orchestrator disabled (START_ORCHESTRATOR=false)");
  }
}

main().catch((e) => {
  console.error("[kitex] fatal:", e);
  process.exit(1);
});
