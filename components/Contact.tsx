import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr/EnvelopeSimple";
import { GithubLogo } from "@phosphor-icons/react/dist/ssr/GithubLogo";

import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site-data";

export function Contact() {
  return (
    <section id="contact" className="border-t border-line">
      <div className="shell section-y">
        <Reveal>
          <h2 className="max-w-[26ch] text-[clamp(2.2rem,6.2vw,4.4rem)] font-medium leading-[1.02] tracking-[-0.04em] text-ink">
            有问题想聊，写信就好。
          </h2>
        </Reveal>

        <Reveal delay={0.08}>
          <a
            href={`mailto:${site.email}`}
            className="mt-8 inline-flex items-center gap-3 border-b border-line-strong pb-2 text-[clamp(1.1rem,3.4vw,1.75rem)] tracking-[-0.02em] break-all text-ink transition-colors duration-500 hover:border-accent hover:text-accent-text md:mt-10"
          >
            <EnvelopeSimple size={22} weight="light" aria-hidden />
            {site.email}
          </a>
        </Reveal>

        <Reveal delay={0.14}>
          <p className="mt-8 max-w-[44ch] text-[15px] leading-[1.85] text-muted">
            产品的事、技术的事、或者只是想聊聊抬头看见的东西，都可以写过来。
            {site.city}的时区，看到就回。
          </p>
        </Reveal>

        <Reveal delay={0.2}>
          <a
            href={site.repo.href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`${site.repo.label}：${site.repo.handle}`}
            className="group mt-10 inline-flex max-w-full items-center gap-3 border border-line-strong px-5 py-3.5 text-[14px] text-ink transition-colors duration-300 hover:border-accent hover:text-accent-text md:mt-12"
          >
            <GithubLogo
              size={18}
              weight="light"
              aria-hidden
              className="shrink-0 text-faint transition-colors duration-300 group-hover:text-accent"
            />
            <span className="shrink-0">{site.repo.label}</span>
            <span className="truncate font-mono text-[12.5px] text-faint">
              {site.repo.handle}
            </span>
            <ArrowUpRight
              size={16}
              weight="light"
              aria-hidden
              className="ml-auto shrink-0 text-faint transition-[color,transform] duration-500 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-accent"
            />
          </a>
        </Reveal>
      </div>
    </section>
  );
}
