/**
 * .env 解析（start.mjs 与 doctor.mjs 共用）。
 * 与 Next 的 dotenv 基本一致，差别只有一处：不去掉行内注释，
 * 因为跳转地址里可能带 `#token=`，去掉就错了。
 * 真实环境变量优先，不会被 .env 覆盖。
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

export function dirOf(importMetaUrl) {
  return path.dirname(fileURLToPath(importMetaUrl));
}

function stripQuotes(value) {
  if (value.length >= 2) {
    const a = value[0];
    const b = value[value.length - 1];
    if ((a === '"' && b === '"') || (a === "'" && b === "'")) {
      return value.slice(1, -1);
    }
  }
  return value;
}

export function parse(text) {
  const out = {};
  for (const rawLine of text.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim().replace(/^export\s+/, "");
    if (!key) continue;
    out[key] = stripQuotes(line.slice(eq + 1).trim());
  }
  return out;
}

/** 读 dir/.env 写入 process.env，返回载入情况。文件不存在则静默跳过。 */
export function loadFromDir(dir) {
  const file = path.join(dir, ".env");
  if (!fs.existsSync(file)) return { file: null, loaded: [], kept: [] };

  const parsed = parse(fs.readFileSync(file, "utf8"));
  const loaded = [];
  const kept = [];

  for (const [key, value] of Object.entries(parsed)) {
    if (Object.prototype.hasOwnProperty.call(process.env, key)) {
      kept.push(key);
      continue;
    }
    process.env[key] = value;
    loaded.push(key);
  }
  return { file, loaded, kept };
}
