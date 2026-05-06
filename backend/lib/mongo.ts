import { MongoClient, Db, Collection } from "mongodb";
import { config } from "../config";

let client: MongoClient | null = null;
let db: Db | null = null;

export interface DecisionDoc {
  agentDID: string;
  action:
    | "LP_OPEN"
    | "LP_CLOSE"
    | "LP_REBALANCE"
    | "ARB_EXECUTED"
    | "ARB_FAILED"
    | "HEDGE_LOGGED";
  txHash: string;
  inputAmount?: number;
  outputAmount?: number;
  profit?: number;
  gasUsed?: number;
  netPnL?: number;
  reputationBefore: number;
  reputationAfter: number;
  reason?: string;
  timestamp: number;
  blockNumber?: number;
}

export interface CycleStateDoc {
  _id?: any;
  cycleNumber: number;
  poolPrice: number;
  poolTick: number;
  activeLPTokenId: string | null;
  positionTickLower: number | null;
  positionTickUpper: number | null;
  deltaExposure: number;
  lastUpdated: number;
}

export async function getDb(): Promise<Db> {
  if (db) return db;
  client = new MongoClient(config.mongoUri, {
    serverSelectionTimeoutMS: 3000,
  });
  await client.connect();
  db = client.db();
  await ensureIndexes(db);
  return db;
}

async function ensureIndexes(d: Db) {
  await d.collection<DecisionDoc>("decisions").createIndex({ agentDID: 1, timestamp: -1 });
  await d.collection<DecisionDoc>("decisions").createIndex({ timestamp: -1 });
  await d.collection<CycleStateDoc>("cycleState").createIndex({ cycleNumber: -1 });
}

export async function decisions(): Promise<Collection<DecisionDoc>> {
  return (await getDb()).collection<DecisionDoc>("decisions");
}

export async function cycleState(): Promise<Collection<CycleStateDoc>> {
  return (await getDb()).collection<CycleStateDoc>("cycleState");
}

export async function recordDecision(d: DecisionDoc): Promise<void> {
  const c = await decisions();
  await c.insertOne(d);
}

export async function recordCycleState(s: CycleStateDoc): Promise<void> {
  const c = await cycleState();
  await c.insertOne(s);
}

export async function latestCycleState(): Promise<CycleStateDoc | null> {
  const c = await cycleState();
  return c.find().sort({ cycleNumber: -1 }).limit(1).next();
}

export async function nextCycleNumber(): Promise<number> {
  const last = await latestCycleState();
  return (last?.cycleNumber ?? 0) + 1;
}

export async function recentDecisions(
  limit = 50,
  agentDID?: string
): Promise<DecisionDoc[]> {
  const c = await decisions();
  const q = agentDID ? { agentDID } : {};
  return c.find(q).sort({ timestamp: -1 }).limit(limit).toArray();
}

// Best-effort soft connect — used by the server so we don't crash if Mongo is down.
export async function tryConnect(): Promise<boolean> {
  try {
    await getDb();
    return true;
  } catch (e) {
    console.warn("[mongo] connect failed:", (e as Error).message);
    return false;
  }
}

export async function close(): Promise<void> {
  if (client) {
    await client.close();
    client = null;
    db = null;
  }
}
