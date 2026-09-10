import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr/ArrowUpRight";

import { Plate } from "@/components/Plate";
import { Reveal } from "@/components/Reveal";
import { projects, type Project } from "@/lib/site-data";

/** 12 列错位 bento：7/5 + 4/8，两行互为镜像，不留空格子。 */
const SPANS = [
  "lg:col-span-7",
  "lg:col-span-5",
  "lg:col-span-4",
  "lg:col-span-8",
];

const MIN_H = [
  "min-h-[500px] md:min-h-[560px]",
  "min-h-[380px] md:min-h-[420px]",
  "min-h-[420px] md:min-h-[480px]",
  "min-h-[420px] md:min-h-[480px]",
];

function PlainCell({ project }: { project: Project }) {
  const snippet = project.snippet;

  return (
    <div
      className="relative flex grow basis-0 flex-col justify-center gap-6 overflow-hidden px-6 py-8 md:px-8"
      style={{
        background:
          "color-mix(in oklab, var(--accent) 9%, var(--surface-raised))",
      }}
    >
      {snippet ? (
        <>
          <p className="font-mono text-[13px] leading-[1.85] md:text-[15px]">
            <span className="text-accent-text">{snippet.head}</span>
            <span className="block text-muted">{snippet.sub}</span>
          </p>
          <dl className="flex flex-col gap-2.5 font-mono text-[11.5px] md:text-[12px]">
            {snippet.rows.map(([key, value]) => (
              <div key={key} className="flex flex-wrap items-baseline gap-x-3">
                <dt className="text-ink">{key}</dt>
                <dd className="text-faint">{value}</dd>
              </div>
            ))}
          </dl>
        </>
      ) : (
        <p className="max-w-[28ch] text-[15px] leading-relaxed text-muted">
          {project.summary}
        </p>
      )}
    </div>
  );
}

function WorkCard({ project, eager }: { project: Project; eager?: boolean }) {
  const shell = "frame flex h-full flex-col overflow-hidden bg-surface";

  const body = (
    <>
      {project.image ? (
        <Plate
          src={project.image}
          alt={`${project.title} 截图`}
          width={1200}
          height={900}
          eager={eager}
          className="grow basis-0"
        />
      ) : (
        <PlainCell project={project} />
      )}

      <div className="shrink-0 border-t border-line bg-surface px-5 py-5 md:px-6 md:py-6">
        <div className="flex items-start justify-between gap-4">
          <h3 className="text-lg font-medium tracking-[-0.015em] text-ink md:text-[22px]">
            {project.title}
          </h3>
          {project.href ? (
            <ArrowUpRight
              size={18}
              weight="light"
              aria-hidden
              className="mt-1 shrink-0 text-faint transition-[color,transform] duration-500 group-hover/plate:-translate-y-0.5 group-hover/plate:translate-x-0.5 group-hover/plate:text-accent"
            />
          ) : null}
        </div>
        <p className="mt-2 max-w-[52ch] text-[14.5px] leading-relaxed text-muted">
          {project.summary}
        </p>
        <p className="mt-3.5 font-mono text-[11.5px] tracking-[0.05em] text-faint">
          {project.meta}
        </p>
      </div>
    </>
  );

  // 没填 href 就是展示卡片，不给它一个假的点击暗示
  if (!project.href) {
    return <article className={shell}>{body}</article>;
  }

  return (
    <a
      href={project.href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`查看项目 ${project.title}`}
      className={`group/plate ${shell}`}
    >
      {body}
    </a>
  );
}

export function Works() {
  return (
    <section id="works" className="border-t border-line">
      <div className="shell section-y">
        <Reveal>
          <h2 className="text-[clamp(2rem,4.6vw,3.3rem)] font-medium leading-[1.04] tracking-[-0.035em] text-ink">
            做过的东西
          </h2>
          <p className="mt-3 max-w-[46ch] text-[15px] leading-relaxed text-muted md:text-base">
            上一份工作里从零搭起来的几样东西。新公司的项目还没到能写出来的时候。
          </p>
        </Reveal>

        <div className="mt-10 grid gap-3 md:mt-14 md:gap-4 lg:grid-cols-12">
          {projects.map((project, index) => (
            <Reveal
              key={project.title}
              delay={index * 0.05}
              className={`${SPANS[index] ?? "lg:col-span-6"} ${MIN_H[index] ?? ""} h-full`}
            >
              <WorkCard project={project} eager={index === 0} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
