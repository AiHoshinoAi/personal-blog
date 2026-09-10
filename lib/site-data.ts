/**
 * 全站文案集中在这里。改这一个文件就能换掉整站内容，不需要动组件。
 *
 * 已填真实信息：城市、职业、出生日期（年龄由代码算）、邮箱、备案号。
 * projects 写的是上一份工作从零搭的 AI 中台（已脱敏，不点名雇主）；
 * logs 是 2025—2026 的真实节点。图片仍是 picsum 占位图。
 * 给某条 project 填上 href，卡片会自动变成外链。
 */

export type Project = {
  title: string;
  summary: string;
  meta: string;
  /** 可选。填了才渲染成外链卡片，不填就是纯展示卡片 */
  href?: string;
  image?: string;
  /** 布局权重：wide = 大格，tall = 竖格，plain = 纯色格 */
  size: "wide" | "tall" | "plain";
  /** plain 格子里的等宽字体小样 */
  snippet?: {
    head: string;
    sub: string;
    rows: [string, string][];
  };
};

export type LogEntry = {
  date: string;
  title: string;
  body: string;
};

export const site = {
  latin: "hoshino",
  cjk: "星野",
  role: "AI 产品工程师",
  city: "南京",
  /** 出生日期。页面上的年龄由 lib/age.ts 按这天实时计算，不写死 */
  birth: "2003-09-03",
  tagline: "把模型做成能用的产品，也记录每次抬头。",
  intro: {
    lead: "在做 AI 产品，也在做自己的东西。",
    body: "不太想把个人网站做成简历。这里放着上一份工作里做过的东西、换城市前后的一些记录，还有一个只有口令能进的小工具。",
  },
  email: "wthywanxiang@gmail.com",
  /** 本站源码的开源仓库。label 是链接文字，handle 是仓库名 */
  repo: {
    label: "开源仓库",
    handle: "AiHoshinoAi/personal-blog",
    href: "https://github.com/AiHoshinoAi/personal-blog",
  },
} as const;

export const projects: Project[] = [
  {
    title: "公司 AI 中台",
    summary:
      "上家公司（北京一家电商 ERP 公司）从 0 到 1 的 AI 平台，我和几个同事一起搭：网关、认证、配置打底，对话、知识库、模型调度、开放接口长在上面。",
    meta: "后端 · 2025—2026 · 在职作品",
    image: "https://picsum.photos/seed/hoshino-ai-platform-blueprint/1200/860",
    size: "wide",
  },
  {
    title: "知识库与 RAG",
    summary: "文档进去，答案出来。",
    meta: "Spring AI · Milvus",
    size: "plain",
    snippet: {
      head: "upload(doc) -> chunks -> vectors",
      sub: "ask(q) -> recall -> rerank -> answer",
      rows: [
        ["解析", "PDF / DOCX / 语雀自动同步"],
        ["治理", "未命中回流，补知识的人看得到"],
        ["权限", "分类与场景各管各的"],
      ],
    },
  },
  {
    title: "LLM 网关",
    summary: "十几家模型渠道收进一个入口：Prompt 带版本，Token 记成本，业务方不直连供应商。",
    meta: "Dubbo · 中台服务",
    image: "https://picsum.photos/seed/hoshino-llm-gateway-tower/900/1200",
    size: "tall",
  },
  {
    title: "开放平台与 SDK",
    summary: "反馈分析、图搜商品、销售语音分析包成签名接口，再封一层 Java SDK——接入方照着示例半天跑通。",
    meta: "Open API · SDK",
    size: "plain",
  },
];

export const logs: LogEntry[] = [
  {
    date: "2026.06",
    title: "换了座城市",
    body: "到南京一家 AI 业务高速发展的公司做 AI 产品工程师。职业生涯还在继续...",
  },
  {
    date: "2026.05",
    title: "结束了第一份工作",
    body: "在北京 995 了整一年，看着中台从白板走到线上。学到的很多，被消耗的也很多，离开不是一时冲动。",
  },
  {
    date: "2025.10",
    title: "中台第一次被业务方调用",
    body: "对话和知识库链路跑通那天，通宵到了第二天凌晨。累，但确实高兴。",
  },
  {
    date: "2025.07",
    title: "毕业即入职",
    body: "本科毕设刚交，拖着箱子去北京，进一家电商 ERP 公司写 Java，被分进一个还没成型的 AI 团队。",
  },
];

/** 备案信息：非广东省备案悬挂服务/主体备案号，并链接工信部备案首页。 */
export const beian = {
  icp: "鲁ICP备2026052204号",
  icpUrl: "https://beian.miit.gov.cn/",
  /** 公安备案号审核通过后填这里，例如 "鲁公网安备 3701xx02xxxxxx号" */
  mps: null as string | null,
  mpsUrl: "https://beian.mps.gov.cn/#/query/record",
} as const;
