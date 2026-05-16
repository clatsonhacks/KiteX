import express from "express";
import cors from "cors";
import { config } from "./config";
import { tryConnect } from "./lib/mongo";
import { startOrchestrator } from "./orchestrator";
import { logger, logBanner } from "./lib/logger";

import dashboardRoutes from "./routes/dashboard";
import agentRoutes from "./routes/agents";
import positionRoutes from "./routes/positions";
import eventRoutes from "./routes/events";
import treasuryRoutes from "./routes/treasury";
import demoRoutes from "./routes/demo";
import logRoutes from "./routes/logs";

async function main() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Request logger middleware. Skip noisy read polls so the terminal stays
  // readable — log writes, demo triggers, and errors only.
  // Use originalUrl (preserved across sub-routers) and match by suffix to avoid
  // Express's req.path mutation inside mounted routers.
  const QUIET_GET_SUFFIXES = [
    "/logs",
    "/health",
    "/dashboard",
    "/agents",
    "/positions",
    "/events",
    "/demo/info",
  ];
  app.use((req, _res, next) => {
    const start = Date.now();
    const original = req.originalUrl.split("?")[0];
    _res.on("finish", () => {
      const failed = _res.statusCode >= 400;
      const isQuietGet =
        req.method === "GET" &&
        (QUIET_GET_SUFFIXES.some((s) => original.endsWith(s)) ||
          /^\/api\/agents\/[^/]+$/.test(original));
      if (isQuietGet && !failed) return;
      logger[failed ? "warn" : "info"]("API", `${req.method} ${original}`, {
        status: _res.statusCode,
        ms: Date.now() - start,
      });
    });
    next();
  });

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
  app.use("/api", logRoutes);

  await tryConnect();

  app.listen(config.port, () => {
    logBanner("KITEX BACKEND");
    logger.success("SYSTEM", `listening on http://localhost:${config.port}`);
    logger.info("SYSTEM", "CapitalRouter", { address: config.capitalRouterAddress });
    logger.info("SYSTEM", "KitexAuditLog", { address: config.auditLogAddress });
    logger.info("SYSTEM", "AlgebraPool",   { address: config.algebraPoolAddress });
    logger.info("SYSTEM", "Goldsky",       { endpoint: config.goldskyEndpoint });
    logger.info("SYSTEM", "Chain",         { chainId: config.chainId });
  });

  if (process.env.START_ORCHESTRATOR !== "false") {
    startOrchestrator();
  } else {
    logger.warn("SYSTEM", "orchestrator disabled (START_ORCHESTRATOR=false)");
  }
}

main().catch((e) => {
  logger.error("SYSTEM", "fatal startup error", { error: (e as Error).message });
  process.exit(1);
});
