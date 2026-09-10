#!/usr/bin/env bash
# 前台启动。口令与入口由同目录 .env 提供（start.mjs 会读）。
set -euo pipefail
cd "$(dirname "$0")"

export NODE_ENV=production
export PORT="${PORT:-3111}"
# 默认只监听回环，公网访问交给 Nginx / Caddy 反代。
# 需要直接对外：BIND_HOST=0.0.0.0 ./start.sh
export HOSTNAME="${BIND_HOST:-127.0.0.1}"

echo "hoshino 星野  http://${HOSTNAME}:${PORT}"
exec node start.mjs
