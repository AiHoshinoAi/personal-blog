import { Age } from "@/components/Age";
import { Plate } from "@/components/Plate";
import { Reveal } from "@/components/Reveal";
import { site } from "@/lib/site-data";

function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline gap-3 border-t border-line pt-3">
      <dt className="w-[4.5em] shrink-0 font-mono text-[11px] tracking-[0.08em] text-faint">
        {label}
      </dt>
      <dd className="text-[14.5px] leading-relaxed text-ink">{children}</dd>
    </div>
  );
}

export function About() {
  return (
    <section id="about" className="border-t border-line">
      <div className="shell section-y grid gap-10 md:gap-14 lg:grid-cols-12 lg:items-center">
        <Reveal className="lg:col-span-5">
          <div className="frame">
            <Plate
              src="https://picsum.photos/seed/hoshino-portrait-night-window/900/1125"
              alt={`${site.cjk}的肖像照片（占位图）`}
              width={900}
              height={1125}
              ratio="4 / 5"
            />
          </div>
        </Reveal>

        <div className="lg:col-span-6 lg:col-start-7">
          <Reveal delay={0.05}>
            <h2 className="text-[clamp(2rem,4.6vw,3.3rem)] font-medium leading-[1.04] tracking-[-0.035em] text-ink">
              关于我
            </h2>
            <p className="mt-6 text-[clamp(1.05rem,1.9vw,1.35rem)] leading-[1.5] tracking-[-0.01em] text-ink">
              {site.intro.lead}
            </p>
            <p className="mt-4 max-w-[58ch] text-[15px] leading-[1.85] text-muted md:text-base">
              {site.intro.body}
            </p>
            <p className="mt-4 max-w-[58ch] text-[15px] leading-[1.85] text-muted md:text-base">
              hoshino 是日文里「星野」的读法，意思是星空落地的地方。
            </p>

            <dl className="mt-10 grid gap-x-10 gap-y-4 sm:grid-cols-2">
              <Fact label="坐标">{site.city}</Fact>
              <Fact label="职业">{site.role}</Fact>
              <Fact label="年龄">
                <Age />
              </Fact>
              <Fact label="邮箱">
                <a
                  href={`mailto:${site.email}`}
                  className="underline decoration-line-strong decoration-1 underline-offset-4 transition-colors duration-300 hover:text-accent-text hover:decoration-accent"
                >
                  {site.email}
                </a>
              </Fact>
            </dl>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
