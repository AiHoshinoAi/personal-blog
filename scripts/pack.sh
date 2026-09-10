#!/usr/bin/env bash
# 打一份可直接部署的 standalone 包。
#
#   ./scripts/pack.sh
#
# 产出 dist/hoshino-blog/（解压后的目录）与 dist/hoshino-blog-<时间>.tar.gz（+ .sha256）。
# dist/ 已在 .gitignore 里，且包内含真实口令，别提交、别外发。
set -euo pipefail
cd "$(dirname "$0")/.."

ENV_FILE=${ENV_FILE:-.env}
PKG=dist/hoshino-blog
STAMP=$(date +%Y%m%d-%H%M)
TARBALL="dist/hoshino-blog-${STAMP}.tar.gz"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "找不到 ${ENV_FILE}（口令与入口都在里面）。用 ENV_FILE=.env.local ./scripts/pack.sh 指定。" >&2
  exit 1
fi

echo "==> 构建"
npm run build

echo "==> 组装 ${PKG}"
rm -rf dist
mkdir -p "${PKG}/.next"
cp -R .next/standalone/. "${PKG}"/
cp -R .next/static "${PKG}/.next/static"
[[ -d public ]] && cp -R public "${PKG}/public"

echo "==> 放入启动器与文档"
cp packaging/start.mjs packaging/env-file.mjs packaging/doctor.mjs packaging/start.sh "${PKG}"/
cp packaging/启动说明.md "${PKG}"/
chmod +x "${PKG}/start.sh"
mkdir -p "${PKG}/deploy"
cp deploy-template/hoshino-blog.service "${PKG}/deploy/"

echo "==> 只带本站用到的变量（${ENV_FILE}）"
grep '^HOSHINO_AGENT_' "${ENV_FILE}" > "${PKG}/.env"
chmod 600 "${PKG}/.env"
if ! grep -q '^HOSHINO_AGENT_TARGETS=' "${PKG}/.env" && ! grep -q '^HOSHINO_AGENT_TARGET=' "${PKG}/.env"; then
  echo "   警告：${ENV_FILE} 里没有 HOSHINO_AGENT_TARGETS / HOSHINO_AGENT_TARGET，首屏不会渲染入口按钮。" >&2
fi

echo "==> 剥掉 macOS 专用的 sharp（本站没用 next/image，运行时不需要它）"
rm -rf "${PKG}/node_modules/sharp" "${PKG}/node_modules/@img"
NATIVE=$(find "${PKG}" \( -name "*.node" -o -name "*.wasm" -o -name "*.dylib" -o -name "*.so" \) | wc -l | tr -d ' ')
if [[ "${NATIVE}" != "0" ]]; then
  echo "   警告：包里还剩 ${NATIVE} 个原生文件，可能不跨平台：" >&2
  find "${PKG}" \( -name "*.node" -o -name "*.wasm" -o -name "*.dylib" -o -name "*.so" \) | head >&2
fi

echo "==> 打包"
tar czf "${TARBALL}" -C dist hoshino-blog
shasum -a 256 "${TARBALL}" > "${TARBALL}.sha256"

echo
echo "完成："
echo "  ${TARBALL} ($(du -h "${TARBALL}" | awk '{print $1}'), sha256 $(cut -d' ' -f1 "${TARBALL}.sha256" | cut -c1-12)…)"
echo "  原生文件数：${NATIVE}（0 = 纯 JS，Linux x64/arm64 都能跑）"
echo
echo "服务器上："
echo "  tar xzf $(basename "${TARBALL}") && cd hoshino-blog"
echo "  node doctor.mjs && node start.mjs"
