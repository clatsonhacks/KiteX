/**
 * Central logger. Writes to terminal with ANSI colors and to an in-memory ring
 * buffer so the frontend can poll /api/logs and display live system activity.
 */

export type LogCategory =
  | "ORCHESTRATOR"
  | "AGENT"
  | "CHAIN"
  | "GOLDSKY"
  | "API"
  | "TX"
  | "DEMO"
  | "SYSTEM";

export interface LogEntry {
  id: number;
  timestamp: number;
  category: LogCategory;
  level: "info" | "success" | "warn" | "error";
  message: string;
  meta?: Record<string, unknown>;
}

const BUFFER_LIMIT = 500;
const buffer: LogEntry[] = [];
let nextId = 1;

const ANSI = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  gray: "\x1b[90m",
};

const CATEGORY_COLOR: Record<LogCategory, string> = {
  ORCHESTRATOR: ANSI.magenta,
  AGENT: ANSI.cyan,
  CHAIN: ANSI.blue,
  GOLDSKY: ANSI.yellow,
  API: ANSI.green,
  TX: ANSI.bold + ANSI.green,
  DEMO: ANSI.bold + ANSI.magenta,
  SYSTEM: ANSI.gray,
};

const LEVEL_COLOR: Record<LogEntry["level"], string> = {
  info: ANSI.reset,
  success: ANSI.green,
  warn: ANSI.yellow,
  error: ANSI.red,
};

function pad(s: string, len: number): string {
  return s.length >= len ? s : s + " ".repeat(len - s.length);
}

function metaString(meta?: Record<string, unknown>): string {
  if (!meta) return "";
  const parts = Object.entries(meta).map(([k, v]) => `${ANSI.dim}${k}=${ANSI.reset}${v}`);
  return parts.length ? "  " + parts.join(" ") : "";
}

export function log(
  category: LogCategory,
  message: string,
  meta?: Record<string, unknown>,
  level: LogEntry["level"] = "info"
): void {
  const entry: LogEntry = {
    id: nextId++,
    timestamp: Date.now(),
    category,
    level,
    message,
    meta,
  };
  buffer.push(entry);
  if (buffer.length > BUFFER_LIMIT) buffer.shift();

  const ts = new Date(entry.timestamp).toISOString().slice(11, 23);
  const catColor = CATEGORY_COLOR[category];
  const levelColor = LEVEL_COLOR[level];
  const line =
    `${ANSI.gray}${ts}${ANSI.reset} ` +
    `${catColor}[${pad(category, 12)}]${ANSI.reset} ` +
    `${levelColor}${message}${ANSI.reset}` +
    metaString(meta);

  if (level === "error") console.error(line);
  else console.log(line);
}

export const logger = {
  info: (cat: LogCategory, msg: string, meta?: Record<string, unknown>) =>
    log(cat, msg, meta, "info"),
  success: (cat: LogCategory, msg: string, meta?: Record<string, unknown>) =>
    log(cat, msg, meta, "success"),
  warn: (cat: LogCategory, msg: string, meta?: Record<string, unknown>) =>
    log(cat, msg, meta, "warn"),
  error: (cat: LogCategory, msg: string, meta?: Record<string, unknown>) =>
    log(cat, msg, meta, "error"),
};

export function getLogsSince(sinceId: number = 0, limit: number = 100): LogEntry[] {
  const filtered = buffer.filter((e) => e.id > sinceId);
  return filtered.slice(-limit);
}

export function logBanner(title: string): void {
  const line = "─".repeat(60);
  console.log(`\n${ANSI.bold}${ANSI.cyan}${line}${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}  ${title}${ANSI.reset}`);
  console.log(`${ANSI.bold}${ANSI.cyan}${line}${ANSI.reset}\n`);
}

export function kitescanTx(hash: string): string {
  return `https://kitescan.ai/tx/${hash}`;
}
