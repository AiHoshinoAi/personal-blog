import { beian, site } from "@/lib/site-data";

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="shell flex flex-col gap-3 py-8 md:flex-row md:items-center md:justify-between md:gap-6">
        <p className="text-[13px] text-muted">
          © 2026 {site.latin} {site.cjk}
        </p>

        <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[13px] text-muted">
          <a
            href={beian.icpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b border-transparent transition-colors duration-300 hover:border-accent hover:text-accent-text"
          >
            {beian.icp}
          </a>
          {beian.mps ? (
            <a
              href={beian.mpsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-transparent transition-colors duration-300 hover:border-accent hover:text-accent-text"
            >
              {beian.mps}
            </a>
          ) : null}
        </p>
      </div>
    </footer>
  );
}
