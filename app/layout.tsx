import type { Metadata, Viewport } from "next";

import "@fontsource-variable/space-grotesk/index.css";
import "@fontsource-variable/jetbrains-mono/index.css";
import "./globals.css";

import { Hero } from "@/components/Hero";
import { Logs } from "@/components/Logs";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { StarField } from "@/components/StarField";
import { Works } from "@/components/Works";
import { site } from "@/lib/site-data";
import { THEME_COLORS, themeInitScript } from "@/lib/theme";

export const metadata: Metadata = {
  metadataBase: new URL("https://hoshino.cloud"),
  title: `${site.latin} ${site.cjk} · 个人主页`,
  description: `${site.cjk}的个人主页。${site.tagline}`,
  keywords: ["hoshino", "星野", "个人主页", "AI 产品工程师", "南京", "星空"],
  authors: [{ name: site.latin }],
  openGraph: {
    type: "website",
    url: "/",
    siteName: `${site.latin} ${site.cjk}`,
    title: `${site.latin} ${site.cjk} · 个人主页`,
    description: site.tagline,
    locale: "zh_CN",
  },
  twitter: { card: "summary", title: `${site.latin} ${site.cjk}`, description: site.tagline },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  // 站点固定默认夜晚，所以这里只给一个值；切到白天时由脚本改写
  themeColor: THEME_COLORS.night,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" data-mode="night" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <StarField />
        <div className="grain" aria-hidden />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[90] focus:border focus:border-accent focus:bg-surface focus:px-4 focus:py-2 focus:text-sm"
        >
          跳到主要内容
        </a>
        {children}
      </body>
    </html>
  );
}
