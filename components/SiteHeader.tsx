import { StarFour } from "@phosphor-icons/react/dist/ssr/StarFour";

import { ThemeToggle } from "@/components/ThemeToggle";
import { site } from "@/lib/site-data";

const links = [
  { href: "#works", label: "做过" },
  { href: "#logs", label: "近况" },
  { href: "#about", label: "关于" },
  { href: "#contact", label: "联系" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 backdrop-blur-md">
      <div
        className="shell flex h-[68px] items-center justify-between gap-3"
        style={{ backgroundColor: "color-mix(in oklab, var(--bg) 72%, transparent)" }}
      >
        <a
          href="#top"
          className="group flex items-baseline gap-2.5 whitespace-nowrap"
          aria-label={`${site.latin} ${site.cjk} 首页`}
        >
          <StarFour
            size={13}
            weight="fill"
            aria-hidden
            className="translate-y-[-1px] text-accent transition-transform duration-700 group-hover:rotate-90"
          />
          <span className="text-[19px] font-medium tracking-[-0.02em] text-ink lowercase">
            {site.latin}
          </span>
          <span className="hidden text-[13px] tracking-[0.3em] text-faint sm:inline">
            {site.cjk}
          </span>
        </a>

        <div className="flex items-center gap-2 sm:gap-5">
          <nav
            aria-label="页面导航"
            className="hidden items-center gap-3.5 text-[13px] whitespace-nowrap text-muted min-[360px]:flex md:gap-6 md:text-[14px]"
          >
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="relative py-1 transition-colors duration-300 hover:text-ink"
              >
                {link.label}
              </a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
