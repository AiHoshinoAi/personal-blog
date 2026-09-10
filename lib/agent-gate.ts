/**
 * 服务端口令门。只在 API route 与服务端组件里引用，
 * 口令与目标地址都不会进入前端产物；前端只拿到「第几个门 + 按钮字样」。
 *
 * 环境变量（服务器端）：
 *
 *   HOSHINO_AGENT_PASSWORD  全局口令，条目没单独写 password 时用它
 *   HOSHINO_AGENT_TARGETS   JSON 数组，一个对象一个入口：
 *                           [{"label":"agent 助手","href":"/agent"},
 *                            {"label":"数据看板","href":"https://dash.hoshino.cloud","password":"另一条口令"}]
 *
 * 兼容旧写法（只配一个入口时）：
 *   HOSHINO_AGENT_TARGET    单个地址
 *   HOSHINO_AGENT_LABEL     该按钮的字样，默认 "agent 助手"
 */

import { createHash, timingSafeEqual } from "node:crypto";

const PASSWORD_ENV = "HOSHINO_AGENT_PASSWORD";
const TARGETS_ENV = "HOSHINO_AGENT_TARGETS";
const LEGACY_TARGET_ENV = "HOSHINO_AGENT_TARGET";
const LEGACY_LABEL_ENV = "HOSHINO_AGENT_LABEL";

const DEFAULT_LABEL = "agent 助手";
const MAX_LABEL = 32;
const MAX_ENTRIES = 12;

const WINDOW_MS = 5 * 60 * 1000;
const MAX_ATTEMPTS = 8;

/** 服务端内部使用的完整条目 */
type Entry = { label: string; href: string; password: string };

/** 可以安全地渲染到 HTML 上的部分 */
export type PublicEntry = { index: number; label: string };

export type GateOutcome =
  | { ok: true; target: string }
  | { ok: false; status: 400 | 401 | 429 | 503; message: string };

type Bucket = { count: number; resetAt: number };
const buckets = new Map<string, Bucket>();

function readEnv(name: string): string {
  const raw = process.env[name];
  return typeof raw === "string" ? raw.trim() : "";
}

/** 先哈希再比较，避免因长度不同而提前返回，泄露口令长度。 */
function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

function matches(candidate: string, expected: string): boolean {
  return timingSafeEqual(digest(candidate), digest(expected));
}

function blocked(key: string, now: number): boolean {
  const bucket = buckets.get(key);
  if (!bucket) return false;
  if (bucket.resetAt <= now) {
    buckets.delete(key);
    return false;
  }
  return bucket.count >= MAX_ATTEMPTS;
}

function registerFailure(key: string, now: number): void {
  const bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return;
  }
  bucket.count += 1;
}

/**
 * 只接受同站绝对路径或 http(s) 完整地址。
 * 拒绝 //evil.com 这类协议相对写法，也拒绝 javascript: 之类协议。
 */
export function resolveTarget(raw: string): string | null {
  if (!raw) return null;

  if (raw.startsWith("/")) {
    if (raw.startsWith("//") || raw.startsWith("/\\")) return null;
    return raw;
  }

  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

function warn(...parts: string[]): void {
  console.error(`[agent-gate] ${parts.join(" ")}`);
}

/**
 * 解析入口列表。任何一条不合法就跳过那一条并写日志，
 * 不会因为一个错别字把整组入口弄没。
 */
function parseEntries(): Entry[] {
  const globalPassword = readEnv(PASSWORD_ENV);
  const raw = readEnv(TARGETS_ENV);

  if (raw) {
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      warn(`${TARGETS_ENV} 不是合法 JSON，已忽略。`);
      return [];
    }

    if (!Array.isArray(parsed)) {
      warn(`${TARGETS_ENV} 必须是数组，已忽略。`);
      return [];
    }

    const entries: Entry[] = [];
    parsed.forEach((item, i) => {
      const label = typeof item?.label === "string" ? item.label.trim() : "";
      const href = resolveTarget(
        typeof item?.href === "string" ? item.href.trim() : "",
      );
      const own =
        typeof item?.password === "string" ? item.password.trim() : "";
      const password = own || globalPassword;

      if (!label || !href || !password) {
        warn(`第 ${i + 1} 条入口缺少 label / 非法 href / 无可用口令，已跳过。`);
        return;
      }
      if (entries.length >= MAX_ENTRIES) {
        warn(`入口数量超过 ${MAX_ENTRIES} 个，多余的已忽略。`);
        return;
      }
      let finalLabel = label;
      if (finalLabel.length > MAX_LABEL) {
        warn(`第 ${i + 1} 条入口的 label 超过 ${MAX_LABEL} 字，已截断显示。`);
        finalLabel = finalLabel.slice(0, MAX_LABEL);
      }
      entries.push({ label: finalLabel, href, password });
    });

    return entries;
  }

  // 旧写法：单入口
  const href = resolveTarget(readEnv(LEGACY_TARGET_ENV));
  if (!href) return [];
  if (!globalPassword) {
    warn(`${PASSWORD_ENV} 缺失，单入口模式无法校验。`);
    return [];
  }
  return [
    { label: readEnv(LEGACY_LABEL_ENV) || DEFAULT_LABEL, href, password: globalPassword },
  ];
}

let warnedEmpty = false;

/** 给服务端组件用：只返回按钮字样与序号，不含地址与口令。 */
export function publicEntries(): PublicEntry[] {
  const entries = parseEntries();

  if (entries.length === 0 && !warnedEmpty) {
    warnedEmpty = true;
    warn(
      `没有可渲染的入口：请配置 ${TARGETS_ENV}（JSON 数组）或 ${LEGACY_TARGET_ENV}，并配 ${PASSWORD_ENV}。`,
    );
  }

  return entries.map((entry, index) => ({ index, label: entry.label }));
}

export function clientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]!.trim();
  return request.headers.get("x-real-ip") ?? "local";
}

export function verifyAgentGate(
  request: Request,
  candidate: string,
  index: number,
): GateOutcome {
  const now = Date.now();
  const key = clientKey(request);

  if (blocked(key, now)) {
    return {
      ok: false,
      status: 429,
      message: "尝试次数太多了，过几分钟再来。",
    };
  }

  const entries = parseEntries();

  if (entries.length === 0) {
    warn(
      `没有可用入口：${PASSWORD_ENV} 与 ${TARGETS_ENV}（或 ${LEGACY_TARGET_ENV}）需要配对配置。`,
    );
    return {
      ok: false,
      status: 503,
      message: "入口暂时没有开放，请稍后再试。",
    };
  }

  const entry = entries[index];

  if (!entry) {
    // 不回显入口数量，只说这个门不存在
    return { ok: false, status: 400, message: "这个入口不存在，刷新页面试试。" };
  }

  if (typeof candidate !== "string" || candidate.length === 0) {
    return { ok: false, status: 400, message: "请先输入口令。" };
  }

  if (!matches(candidate, entry.password)) {
    registerFailure(key, now);
    return { ok: false, status: 401, message: "口令不正确。" };
  }

  buckets.delete(key);
  return { ok: true, target: entry.href };
}
