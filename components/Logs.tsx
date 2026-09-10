import { Reveal } from "@/components/Reveal";
import { logs } from "@/lib/site-data";

export function Logs() {
  return (
    <section id="logs" className="border-t border-line">
      <div className="shell section-y">
        <Reveal>
          <h2 className="text-[clamp(2rem,4.6vw,3.3rem)] font-medium leading-[1.04] tracking-[-0.035em] text-ink">
            近况
          </h2>
          <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-muted md:text-base">
            最近在做的几件事，横向可以滑动。
          </p>
        </Reveal>

        <Reveal delay={0.08}>
          <ul
            className="logstrip mt-10 w-full md:mt-14"
            aria-label="近期记录"
            tabIndex={0}
            role="list"
          >
            {logs.map((entry) => (
              <li
                key={entry.date}
                className="flex h-full flex-col gap-3 border-l border-line py-1 pr-8 pl-6 first:border-l-0 first:pl-0"
              >
                <time className="font-mono text-[11.5px] tracking-[0.08em] text-accent-text">
                  {entry.date}
                </time>
                <h3 className="text-[19px] font-medium leading-snug tracking-[-0.015em] text-ink md:text-[21px]">
                  {entry.title}
                </h3>
                <p className="max-w-[34ch] text-[14.5px] leading-relaxed text-muted">
                  {entry.body}
                </p>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
