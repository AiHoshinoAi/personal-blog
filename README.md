# hoshino · 星野

一个 React（Next.js App Router）写的个人主页：整页是一张会自转的星空，附一个需要口令的 **agent 助手** 入口。

## 快速开始

```bash
npm install
cp .env.example .env.local      # 填入你自己的口令与目标地址
npm run dev                     # http://localhost:3000
```

生产构建：

```bash
npm run build
npm run start
```

## agent 入口（口令与地址都在服务器端）

首屏右侧的按钮**由服务器环境变量里的入口数组决定**：配几条就渲染几个，按钮字样也是配置里的 `label`。点按钮 → 弹窗输入口令 → 校验通过后跳转到那条入口自己的地址。

**口令和目标地址都只存在服务器环境变量里，不会被打进前端 JS。** 前端只知道「第几条入口 + 按钮字样」；浏览器发的是 `POST /api/agent-gate`，带 `{password, index}`，只有校验通过，服务器才把那条入口的地址返回来。

| 环境变量 | 作用 | 示例 |
| --- | --- | --- |
| `HOSHINO_AGENT_PASSWORD` | 全局口令，条目没单独写 `password` 时用它 | `a-quiet-meteor` |
| `HOSHINO_AGENT_TARGETS` | 入口数组（JSON），每项 `label` / `href` / 可选 `password` | 见下 |
| `HOSHINO_AGENT_TARGET` | 旧写法：只配一条入口时的地址 | `/agent` |
| `HOSHINO_AGENT_LABEL` | 旧写法：那一条按钮的字样，默认 `agent 助手` | `我的工作台` |

```json
HOSHINO_AGENT_TARGETS=[
  {"label":"agent 助手","href":"/agent"},
  {"label":"数据看板","href":"https://dash.hoshino.cloud"},
  {"label":"内网后台","href":"https://admin.hoshino.cloud","password":"另一条口令"}
]
```

- 每条入口可以有自己的 `password`；省略就用全局口令。
- 同站路径写 `/agent`；外部地址写完整的 `https://…`。`//evil.com`、`javascript:` 这类会被拒绝。
- 单条不合法（label 空、href 非法、没口令）只跳过那一条并在服务端日志写明原因，不会连累其它入口。
- 最多 12 条，按钮字样最长 32 字，超出部分截断，避免撑破排版。
- 一条都没配好时：首屏不渲染任何按钮，接口返回 503，服务端日志提示缺哪个变量。
- 每个来源 IP 在 5 分钟内最多试 8 次（所有入口共用这个额度），超出返回 429。
- 因为按钮列表来自运行时环境变量，首页改成按需渲染（`app/page.tsx` 里的 `force-dynamic`）：改完 env 重启服务就生效，不用重新 build。

### 环境变量放哪里

| 场景 | 做法 |
| --- | --- |
| 本地开发 | `.env.local`（已在 `.gitignore` 里） |
| Docker | `docker run -e HOSHINO_AGENT_PASSWORD=… -e 'HOSHINO_AGENT_TARGETS=[…]' …`（整段 JSON 用单引号包住） |
| systemd | 在 unit 里加 `Environment=HOSHINO_AGENT_PASSWORD=…`，JSON 那条建议写进 `EnvironmentFile=`，省掉转义 |
| pm2 | `pm2 start npm --name hoshino -- start` 前 `export`，或写 `ecosystem.config.cjs` 的 `env` |
| Vercel / 函数计算 | 在控制台 Environment Variables 里添加（注意 Vercel 上内存限流是每个实例各自计数） |

### 想再加一层保护

这道口令门是**轻量的隐私遮挡**，不是账号体系。若里面放的东西真的重要，请在目标路径本身再挂一层认证（例如 Nginx `auth_basic`、OAuth、或在你的 Agent 应用里独立登录），口令门只负责挡住随手乱点的人。

## 改内容

全站文案集中在 [`lib/site-data.ts`](./lib/site-data.ts)：城市、职业、出生日期、邮箱、项目、近况、备案号都在那一个文件里，改它不用动组件。

已经填好的真实信息：`site.city`（南京）、`site.role`（AI 产品工程师）、`site.birth`（2003-09-03）、`site.email`（wthywanxiang@gmail.com）、`site.repo`（本仓库地址，渲染在「联系」区）、`beian.icp`。

**还需要你替换的**：`projects`（4 条）与 `logs`（4 条）目前是按你的方向写的示例条目，换成你真实做过的事；图片仍是 `picsum.photos` 占位图，共 4 处：

1. 在做的东西 · 观星笔记（大图）
2. 在做的东西 · 小星座（竖图）
3. 在做的东西 · 对话原型（宽图）
4. 关于我 · 肖像

把真实图片放进 `public/images/`，再把 `lib/site-data.ts` 里的 URL 换成 `/images/xxx.jpg`（About 那处在 `components/About.tsx`）。

站点域名在 `app/layout.tsx` 的 `metadataBase`，当前是 `https://hoshino.cloud`，换域名改这一处（影响 `og:url` 与分享卡片）。

### 项目卡片要不要可点

`projects[].href` 留空时渲染成纯展示卡片：没有外链箭头、没有新窗口，也不给悬停点击暗示。填上地址后自动变成外链卡片。原先的 GitHub / 开源链接已按现状移除，以后真有公开仓库，把 `href` 填回去即可。

### 年龄是算出来的

页面上的年龄不是写死的。`site.birth` 是唯一事实，`lib/age.ts` 由它算周岁和距下一个生日的天数，`components/Age.tsx` 在「关于我」里渲染。静态构建时先算一次（禁用 JS 也看得到），浏览器里再按访问者本地时间重算，跨过生日不会停在旧数字。

## 备案号悬挂

按[《网站添加备案号》](./备案号悬挂说明.md)的要求，备案号放在**页脚**并链接到工信部备案官网首页。备案地为山东（非广东省），悬挂主体/服务备案号即可。号码前缀跟核准地走，与你现在住在哪个城市无关，照你拿到的原样悬挂：

```
鲁ICP备2026052204号  →  https://beian.miit.gov.cn/
```

代码位置：[`components/SiteFooter.tsx`](./components/SiteFooter.tsx)，数据在 `lib/site-data.ts` 的 `beian` 字段。

公安备案通过后，把号码填进 `beian.mps`，页脚会自动多出一行并链接到 [全国互联网安全管理服务平台](https://beian.mps.gov.cn/)：

```ts
export const beian = {
  icp: "鲁ICP备2026052204号",
  icpUrl: "https://beian.miit.gov.cn/",
  mps: "鲁公网安备 3701xx02xxxxxx号", // 拿到后填这里
  mpsUrl: "https://beian.mps.gov.cn/#/query/record",
};
```

另外记得：主域名和 `www.` 都要能访问，且两个域名的页脚都要有备案号（在 Nginx/CDN 里把 `www` 301 到裸域，或都指到同一个服务即可，因为备案号是组件级渲染的）。

## 设计备忘

- **技术**：Next.js 16（React 19）+ Tailwind v4 + Motion + Phosphor 图标，TypeScript 全量。
- **字体**：`Space Grotesk Variable` 与 `JetBrains Mono Variable`，通过 `@fontsource-variable` 自托管，不请求任何第三方字体 CDN（国内可正常访问）。中文回落系统字族（PingFang SC / Noto Sans CJK / 微软雅黑）。
- **色彩**：冷调夜空（`#06080f` 起步，非纯黑）+ 单一星光琥珀色 `#f0b64f`，全站只有一个强调色，无紫色渐变。
- **两种模式**：进页面固定是夜晚（星空可见），可切白天（冷银底，星星隐去）。不跟随系统 `prefers-color-scheme`，只记忆用户手动切换的选择（`localStorage` 键 `hoshino-mode`）。
- **动效**：星空缓慢绕极轴自转、三层视差、呼吸式闪烁、偶发流星；全部尊重 `prefers-reduced-motion`（退化为一次静态绘制）。
- **形状语言**：全站直角（0 圆角），靠发丝线分隔，像印刷星图，不做卡片堆卡片。
