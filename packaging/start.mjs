/**
 * 启动器：先把同目录 .env 读进 process.env，再拉起 Next standalone 服务。
 * Next 的 server.js 不会自己读 .env（那是 next start 的行为），
 * 直接 `node server.js` 会因为拿不到配置而让口令门返回 503。用本文件启动没这个问题。
 *
 *   node start.mjs
 *   PORT=8080 node start.mjs      真实环境变量优先，不被 .env 覆盖
 */
import { pathToFileURL } from "node:url";
import path from "node:path";
import { dirOf, loadFromDir } from "./env-file.mjs";

const dir = dirOf(import.meta.url);
const { file, loaded, kept } = loadFromDir(dir);

if (file) {
  if (loaded.length) console.log(`[start] 已从 .env 载入：${loaded.join(", ")}`);
  if (kept.length) console.log(`[start] 真实环境已提供，忽略 .env 同名项：${kept.join(", ")}`);
} else {
  console.log("[start] 未找到 .env，只用真实环境变量。");
}

await import(pathToFileURL(path.join(dir, "server.js")).href);
