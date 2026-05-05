import { BigDecimal, BigInt, Bytes } from "@graphprotocol/graph-ts";
import {
  LPPositionOpened,
  LPPositionClosed,
  LPPositionRebalanced,
  ArbitrageExecuted,
  ArbitrageFailed,
  HedgeIntentLogged,
  ReputationUpdated,
} from "../../generated/KitexAuditLog/KitexAuditLog";
import { Swap } from "../../generated/AlgebraPool/AlgebraPool";
import {
  Agent,
  AgentEvent,
  LPEvent,
  ArbEvent,
  HedgeEvent,
  ReputationEvent,
  PoolSwap,
} from "../../generated/schema";

function getOrCreateAgent(did: string): Agent {
  let agent = Agent.load(did);
  if (!agent) {
    agent = new Agent(did);
    agent.did = did;
    agent.agentType = "unknown";
    agent.currentReputation = BigInt.fromI32(0);
    agent.save();
  }
  return agent;
}

export function handleLPPositionOpened(event: LPPositionOpened): void {
  const did = event.params.agentDID.toHexString();
  const agent = getOrCreateAgent(did);

  const lpEvent = new LPEvent(event.transaction.hash.toHexString() + "-open");
  lpEvent.agentDID = did;
  lpEvent.action = "OPEN";
  lpEvent.tickLower = event.params.tickLower;
  lpEvent.tickUpper = event.params.tickUpper;
  lpEvent.liquidity = event.params.liquidity;
  lpEvent.feesCollected = BigDecimal.fromString("0");
  lpEvent.timestamp = event.params.timestamp;
  lpEvent.txHash = event.transaction.hash;
  lpEvent.save();

  const agentEvent = new AgentEvent(event.transaction.hash.toHexString() + "-ae-open");
  agentEvent.agent = agent.id;
  agentEvent.eventType = "LP_OPEN";
  agentEvent.txHash = event.transaction.hash;
  agentEvent.timestamp = event.params.timestamp;
  agentEvent.blockNumber = event.block.number;
  agentEvent.profit = BigDecimal.fromString("0");
  agentEvent.metricValue = event.params.liquidity.toBigDecimal();
  agentEvent.save();
}

export function handleLPPositionClosed(event: LPPositionClosed): void {
  const did = event.params.agentDID.toHexString();
  const agent = getOrCreateAgent(did);

  const lpEvent = new LPEvent(event.transaction.hash.toHexString() + "-close");
  lpEvent.agentDID = did;
  lpEvent.action = "CLOSE";
  lpEvent.tickLower = 0;
  lpEvent.tickUpper = 0;
  lpEvent.liquidity = BigInt.fromI32(0);
  lpEvent.feesCollected = event.params.feesCollected.toBigDecimal();
  lpEvent.timestamp = event.params.timestamp;
  lpEvent.txHash = event.transaction.hash;
  lpEvent.save();

  const agentEvent = new AgentEvent(event.transaction.hash.toHexString() + "-ae-close");
  agentEvent.agent = agent.id;
  agentEvent.eventType = "LP_CLOSE";
  agentEvent.txHash = event.transaction.hash;
  agentEvent.timestamp = event.params.timestamp;
  agentEvent.blockNumber = event.block.number;
  agentEvent.profit = BigDecimal.fromString("0");
  agentEvent.metricValue = event.params.feesCollected.toBigDecimal();
  agentEvent.save();
}

export function handleLPPositionRebalanced(event: LPPositionRebalanced): void {
  const did = event.params.agentDID.toHexString();
  const agent = getOrCreateAgent(did);

  const lpEvent = new LPEvent(event.transaction.hash.toHexString() + "-rebalance");
  lpEvent.agentDID = did;
  lpEvent.action = "REBALANCE";
  lpEvent.tickLower = event.params.newTickLower;
  lpEvent.tickUpper = event.params.newTickUpper;
  lpEvent.liquidity = BigInt.fromI32(0);
  lpEvent.feesCollected = BigDecimal.fromString("0");
  lpEvent.timestamp = event.params.timestamp;
  lpEvent.txHash = event.transaction.hash;
  lpEvent.save();

  const agentEvent = new AgentEvent(event.transaction.hash.toHexString() + "-ae-rebalance");
  agentEvent.agent = agent.id;
  agentEvent.eventType = "LP_REBALANCE";
  agentEvent.txHash = event.transaction.hash;
  agentEvent.timestamp = event.params.timestamp;
  agentEvent.blockNumber = event.block.number;
  agentEvent.profit = BigDecimal.fromString("0");
  agentEvent.metricValue = BigDecimal.fromString("0");
  agentEvent.save();
}

export function handleArbitrageExecuted(event: ArbitrageExecuted): void {
  const did = event.params.agentDID.toHexString();
  const agent = getOrCreateAgent(did);

  const profit = event.params.profit.toBigDecimal();

  const arbEvent = new ArbEvent(event.transaction.hash.toHexString() + "-arb");
  arbEvent.agentDID = did;
  arbEvent.success = true;
  arbEvent.amountIn = event.params.amountIn.toBigDecimal();
  arbEvent.amountOut = event.params.amountOut.toBigDecimal();
  arbEvent.profit = profit;
  arbEvent.timestamp = event.params.timestamp;
  arbEvent.txHash = event.transaction.hash;
  arbEvent.save();

  const agentEvent = new AgentEvent(event.transaction.hash.toHexString() + "-ae-arb");
  agentEvent.agent = agent.id;
  agentEvent.eventType = "ARB_EXECUTED";
  agentEvent.txHash = event.transaction.hash;
  agentEvent.timestamp = event.params.timestamp;
  agentEvent.blockNumber = event.block.number;
  agentEvent.profit = profit;
  agentEvent.metricValue = event.params.amountIn.toBigDecimal();
  agentEvent.save();
}

export function handleArbitrageFailed(event: ArbitrageFailed): void {
  const did = event.params.agentDID.toHexString();
  const agent = getOrCreateAgent(did);

  const arbEvent = new ArbEvent(event.transaction.hash.toHexString() + "-arb-fail");
  arbEvent.agentDID = did;
  arbEvent.success = false;
  arbEvent.amountIn = BigDecimal.fromString("0");
  arbEvent.amountOut = BigDecimal.fromString("0");
  arbEvent.profit = BigDecimal.fromString("0");
  arbEvent.timestamp = event.params.timestamp;
  arbEvent.txHash = event.transaction.hash;
  arbEvent.save();

  const agentEvent = new AgentEvent(event.transaction.hash.toHexString() + "-ae-arb-fail");
  agentEvent.agent = agent.id;
  agentEvent.eventType = "ARB_FAILED";
  agentEvent.txHash = event.transaction.hash;
  agentEvent.timestamp = event.params.timestamp;
  agentEvent.blockNumber = event.block.number;
  agentEvent.profit = BigDecimal.fromString("0");
  agentEvent.metricValue = BigDecimal.fromString("0");
  agentEvent.save();
}

export function handleHedgeIntentLogged(event: HedgeIntentLogged): void {
  const did = event.params.agentDID.toHexString();
  const agent = getOrCreateAgent(did);

  const hedgeEvent = new HedgeEvent(event.transaction.hash.toHexString() + "-hedge");
  hedgeEvent.agentDID = did;
  hedgeEvent.deltaExposure = event.params.deltaExposure.toBigDecimal();
  hedgeEvent.direction = event.params.direction;
  hedgeEvent.timestamp = event.params.timestamp;
  hedgeEvent.txHash = event.transaction.hash;
  hedgeEvent.save();

  const agentEvent = new AgentEvent(event.transaction.hash.toHexString() + "-ae-hedge");
  agentEvent.agent = agent.id;
  agentEvent.eventType = "HEDGE_LOGGED";
  agentEvent.txHash = event.transaction.hash;
  agentEvent.timestamp = event.params.timestamp;
  agentEvent.blockNumber = event.block.number;
  agentEvent.profit = BigDecimal.fromString("0");
  agentEvent.metricValue = event.params.deltaExposure.toBigDecimal();
  agentEvent.save();
}

export function handleReputationUpdated(event: ReputationUpdated): void {
  const did = event.params.agentDID.toHexString();
  const agent = getOrCreateAgent(did);
  agent.currentReputation = event.params.newScore;
  agent.save();

  const repEvent = new ReputationEvent(event.transaction.hash.toHexString() + "-rep");
  repEvent.agentDID = did;
  repEvent.oldScore = event.params.oldScore;
  repEvent.newScore = event.params.newScore;
  repEvent.reason = event.params.reason;
  repEvent.timestamp = event.params.timestamp;
  repEvent.txHash = event.transaction.hash;
  repEvent.save();

  const agentEvent = new AgentEvent(event.transaction.hash.toHexString() + "-ae-rep");
  agentEvent.agent = agent.id;
  agentEvent.eventType = "REPUTATION_UPDATED";
  agentEvent.txHash = event.transaction.hash;
  agentEvent.timestamp = event.params.timestamp;
  agentEvent.blockNumber = event.block.number;
  agentEvent.profit = BigDecimal.fromString("0");
  agentEvent.metricValue = event.params.newScore.toBigDecimal();
  agentEvent.save();
}

export function handleSwap(event: Swap): void {
  const swap = new PoolSwap(event.transaction.hash.toHexString() + "-" + event.logIndex.toString());
  swap.amount0 = event.params.amount0.toBigDecimal();
  swap.amount1 = event.params.amount1.toBigDecimal();
  swap.sqrtPriceX96 = event.params.price;
  swap.tick = event.params.tick;
  swap.timestamp = event.block.timestamp;
  swap.txHash = event.transaction.hash;
  swap.save();
}
