/**
 * 部署前自检：确认 .env 里的入口配置能被服务端接受。
 * 校验规则与 lib/agent-gate.ts 一致，这里过了线上就一定过。
 *
 *   node doctor.mjs            地址打码
 *   node doctor.mjs --show     显示完整地址（含 token，注意别留在日志里）
 */
import { dirOf, loadFromDir } from "./env-file.mjs";

const PASSWORD_ENV = "HOSHINO_AGENT_PASSWORD";
const TARGETS_ENV = "HOSHINO_AGENT_TARGETS";
const LEGACY_TARGET_ENV = "HOSHINO_AGENT_TARGET";
const LEGACY_LABEL_ENV = "HOSHINO_AGENT_LABEL";
const MAX_LABEL = 32;
const MAX_ENTRIES = 12;

loadFromDir(dirOf(import.meta.url));

const problems = [];
const notes = [];

function resolveTarget(raw) {
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

const [major, minor] = process.versions.node.split(".").map(Number);
const okNode = major > 20 || (major === 20 && minor >= 9);
console.log(`Node ${process.versions.node} ${okNode ? "ok" : "不满足：需要 20.9 以上"}`);
if (!okNode) problems.push("Node 版本过低");

const globalPassword = (process.env[PASSWORD_ENV] ?? "").trim();
console.log(
  `\n${PASSWORD_ENV}: ${globalPassword ? `已设置（${globalPassword.length} 位）` : "未设置"}`,
);

const rawTargets = (process.env[TARGETS_ENV] ?? "").trim();
let candidates = [];

if (rawTargets) {
  let parsed = null;
  try {
    parsed = JSON.parse(rawTargets);
  } catch (err) {
    problems.push(`${TARGETS_ENV} 不是合法 JSON：${err.message}`);
  }
  if (parsed && !Array.isArray(parsed)) {
    problems.push(`${TARGETS_ENV} 必须是数组`);
    parsed = null;
  }
  if (parsed) candidates = parsed.map((item, i) => ({ i, item }));
} else {
  const legacy = (process.env[LEGACY_TARGET_ENV] ?? "").trim();
  if (legacy) {
    notes.push(`用的是旧写法 ${LEGACY_TARGET_ENV}，单入口时没问题`);
    candidates = [
      {
        i: 0,
        item: {
          label: (process.env[LEGACY_LABEL_ENV] ?? "").trim() || "agent 助手",
          href: legacy,
        },
      },
    ];
  } else {
    problems.push(`${TARGETS_ENV} 与 ${LEGACY_TARGET_ENV} 都没配，首屏不会渲染按钮`);
  }
}

const usable = [];

for (const { i, item } of candidates) {
  const no = `第 ${i + 1} 条`;
  const label = typeof item?.label === "string" ? item.label.trim() : "";
  const rawHref = typeof item?.href === "string" ? item.href.trim() : "";
  const href = resolveTarget(rawHref);
  const own = typeof item?.password === "string" ? item.password.trim() : "";
  const password = own || globalPassword;

  const reasons = [];
  if (!label) reasons.push("label 为空");
  if (label.length > MAX_LABEL) reasons.push(`label 超过 ${MAX_LABEL} 字（线上会截断）`);
  if (!rawHref) reasons.push("href 为空");
  else if (!href) reasons.push(`href 非法（可能是 //开头、缺协议，或不是 http/https）`);
  if (!password) reasons.push("既没有条目口令也没有全局口令");
  if (usable.length >= MAX_ENTRIES) reasons.push(`超出 ${MAX_ENTRIES} 条上限`);

  if (reasons.length) {
    problems.push(`${no} 会被跳过：${reasons.join("；")}`);
    continue;
  }
  usable.push({
    label: label.slice(0, MAX_LABEL),
    href,
    from: own ? "条目口令" : "全局口令",
  });
}

const showAll = process.argv.includes("--show");
function mask(href) {
  if (showAll) return href;
  if (href.startsWith("/")) return `${href.slice(0, 10)}…（同站路径）`;
  try {
    const u = new URL(href);
    const hasSecret = Boolean(u.search || u.hash);
    return `${u.protocol}//${u.host}${u.pathname.slice(0, 6)}…${hasSecret ? "（含查询串/片段）" : ""}`;
  } catch {
    return "…";
  }
}

console.log(`\n可渲染入口：${usable.length} 个`);
usable.forEach((entry, i) => {
  console.log(`  [${i}] ${entry.label}  ->  ${mask(entry.href)}   (${entry.from})`);
});
if (!showAll && usable.length) {
  console.log("  （地址已打码，看完整地址：node doctor.mjs --show）");
}

if (usable.length === 0 && !problems.some((p) => p.includes("都没配"))) {
  problems.push("没有任何可用入口，接口会返回 503");
}

console.log("");
for (const n of notes) console.log(`提示  ${n}`);
if (problems.length) {
  for (const p of problems) console.log(`问题  ${p}`);
  console.log("\n结论：先把上面这些改掉再启动。");
  process.exit(1);
}
console.log("结论：配置可用。启动用 `node start.mjs`（或 ./start.sh）。");
