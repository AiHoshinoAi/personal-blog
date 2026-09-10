import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Hero } from "@/components/Hero";
import { Logs } from "@/components/Logs";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { Works } from "@/components/Works";

/**
 * 入口按钮的列表来自运行时环境变量（见 lib/agent-gate.ts）。
 * 整页按需渲染，改完环境变量重启即生效，不需要重新构建。
 */
export const dynamic = "force-dynamic";

export default function Home() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Works />
        <About />
        <Logs />
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
