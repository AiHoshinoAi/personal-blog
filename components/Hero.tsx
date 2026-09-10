import type { CSSProperties } from "react";

import { AgentGateButton } from "@/components/AgentGate";
import { publicEntries } from "@/lib/agent-gate";
import { site } from "@/lib/site-data";

const LETTERS = [...site.latin];

// 入口列表来自服务器环境变量：有几个就渲染几个按钮，地址不下发给前端
const entries = publicEntries();

export function Hero() {
  return (
    <section
      id="top"
      className="shell relative flex min-h-[calc(100dvh-68px)] flex-col justify-end pt-16 pb-[clamp(56px,10vh,120px)]"
    >
      <h1 className="relative">
        <span className="sr-only">{`${site.latin} ${site.cjk}，个人主页`}</span>

        <span
          aria-hidden
          className="block text-[clamp(3.4rem,13.2vw,10.5rem)] font-medium lowercase leading-[0.84] tracking-[-0.055em] text-ink"
        >
          {LETTERS.map((letter, index) => (
            <span
              key={`${letter}-${index}`}
              className="letter inline-block will-change-transform"
              style={{ "--i": index } as CSSProperties}
            >
              {letter}
            </span>
          ))}
        </span>

        <span aria-hidden className="mt-4 flex items-center gap-5 sm:mt-6 sm:gap-8">
          <span className="text-[clamp(1.05rem,2.3vw,1.5rem)] tracking-[0.44em] whitespace-nowrap text-muted">
            {site.cjk}
          </span>
          <span className="rule-draw h-px flex-1 bg-line-strong" />
        </span>
      </h1>

      <div className="mt-9 flex flex-col items-start gap-8 md:mt-14 md:flex-row md:items-end md:justify-between md:gap-14">
        <p
          className="soft-rise max-w-[32ch] text-[clamp(1rem,1.5vw,1.18rem)] leading-relaxed text-muted"
          style={{ animationDelay: "900ms" } as CSSProperties}
        >
          {site.tagline}
        </p>

        {entries.length > 0 ? (
          <div
            className="soft-rise flex w-full flex-wrap items-stretch gap-3 md:w-auto md:max-w-[54%] md:justify-end"
            style={{ animationDelay: "1050ms" } as CSSProperties}
          >
            {entries.map((entry, i) => (
              <AgentGateButton
                key={entry.index}
                index={entry.index}
                label={entry.label}
                primary={i === 0}
              />
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
