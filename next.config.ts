import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // 产出只含运行必需文件的独立服务：node server.js 直接跑，不需要目标机再 npm install
  output: "standalone",
};

export default nextConfig;
