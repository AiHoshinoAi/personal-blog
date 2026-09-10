/**
 * 全站文案集中在这里。改这一个文件就能换掉整站内容，不需要动组件。
 *
 * 已填真实信息：城市、职业、出生日期（年龄由代码算）、邮箱、备案号。
 * 仍需替换：projects 与 logs 目前是示例条目，换成你自己的；
 * 图片是 picsum 占位图。给某条 project 填上 href，卡片会自动变成外链。
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
    body: "不太想把个人网站做成简历。这里放着我在做的东西、一些零散的记录，还有一个只有口令能进的小工具。",
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
    title: "观星笔记",
    summary: "把肉眼看到的东西记成一份能搜索的星表。离线可用，数据留在自己手里。",
    meta: "Web · 自用",
    image: "https://picsum.photos/seed/hoshino-star-notes-atlas/1200/860",
    size: "wide",
  },
  {
    title: "评测台",
    summary: "同一批 case、同一套评分维度，换模型只改一行配置。",
    meta: "AI · 内部工具",
    size: "plain",
    snippet: {
      head: "eval(model, cases)",
      sub: "-> scorecard(dims, notes)",
      rows: [
        ["cases", "120 条固定回归集"],
        ["dims", "准确性 / 可用性 / 成本 / 时延"],
        ["run", "一轮大约 3 分钟"],
      ],
    },
  },
  {
    title: "小星座",
    summary: "讲给小朋友听的八十八星座，一页一个故事。",
    meta: "小程序",
    image: "https://picsum.photos/seed/hoshino-little-constellations-children/900/1200",
    size: "tall",
  },
  {
    title: "对话原型",
    summary: "两天内把想法做成能点的东西，找十个人试，看他们在哪一步停下来。",
    meta: "AI · 原型",
    image: "https://picsum.photos/seed/hoshino-chat-prototype-desk-night/1200/800",
    size: "plain",
  },
];

export const logs: LogEntry[] = [
  {
    date: "2026.08",
    title: "把评测流程收进一条命令",
    body: "以前换模型要改三处配置，现在只改一行，跑完直接出对比表。",
  },
  {
    date: "2026.06",
    title: "开始每月一次抬头",
    body: "不带相机，只带本子。记录下来的比拍到的多。",
  },
  {
    date: "2026.03",
    title: "重写了这个首页",
    body: "星图从 SVG 换成 canvas，六千颗星还能稳住帧率。",
  },
  {
    date: "2025.12",
    title: "给入口加了口令",
    body: "口令和目标地址都只存在服务端环境变量里，前端看不到。",
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
