import Link from "next/link";
import { PILLARS, PillarKey } from "@/lib/taxonomy";

export function Footer() {
  const pillarEntries = Object.entries(PILLARS) as [PillarKey, (typeof PILLARS)[PillarKey]][];

  return (
    <footer className="bg-neutral-950 text-neutral-300 border-t border-neutral-800/80 mt-16 sm:mt-20">
      <div className="container-wide px-4 sm:px-6 lg:px-8 py-10 sm:py-12 lg:py-14">
        {/* Main 4-Column Responsive Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-10 lg:gap-12">
          {/* Brand & Publication Scope */}
          <div className="space-y-3">
            <Link
              href="/"
              className="inline-block no-underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white rounded"
              aria-label="AI Founders Talk Homepage"
            >
              <span className="font-serif text-lg sm:text-xl font-bold text-white tracking-tight">
                AI Founders Talk
              </span>
            </Link>
            <p className="text-xs text-neutral-400 leading-relaxed max-w-xs sm:max-w-xs">
              Independent trade publication covering agentic AI architectures, RevOps automation, and enterprise competitive intelligence.
            </p>
            <div className="pt-2">
              <span className="text-[11px] uppercase tracking-wider font-semibold text-neutral-400 block mb-1">
                Editorial Inquiries
              </span>
              <a
                href="mailto:editorial@aifounderstalk.com"
                className="text-xs text-neutral-300 hover:text-white underline underline-offset-2 break-all sm:break-normal transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
              >
                editorial@aifounderstalk.com
              </a>
            </div>
          </div>

          {/* Coverage Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 !text-neutral-400 mb-3 sm:mb-4" style={{ color: "#a3a3a3" }}>
              Coverage
            </h3>
            <ul className="space-y-2 sm:space-y-1.5 list-none p-0 m-0">
              {pillarEntries.slice(0, 4).map(([key, pillar]) => (
                <li key={key}>
                  <Link
                    href={`/articles?pillar=${key}`}
                    className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors duration-150 inline-block py-1 sm:py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
                  >
                    {pillar.shortLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Analysis Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 !text-neutral-400 mb-3 sm:mb-4" style={{ color: "#a3a3a3" }}>
              Analysis
            </h3>
            <ul className="space-y-2 sm:space-y-1.5 list-none p-0 m-0">
              {pillarEntries.slice(4).map(([key, pillar]) => (
                <li key={key}>
                  <Link
                    href={`/articles?pillar=${key}`}
                    className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors duration-150 inline-block py-1 sm:py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
                  >
                    {pillar.shortLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Navigation Section */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 !text-neutral-400 mb-3 sm:mb-4" style={{ color: "#a3a3a3" }}>
              Navigation
            </h3>
            <ul className="space-y-2 sm:space-y-1.5 list-none p-0 m-0">
              {[
                { href: "/", label: "Home" },
                { href: "/articles", label: "Articles" },
                { href: "/interviews", label: "Founder Talks" },
                { href: "/resources", label: "Resources" },
                { href: "/trending", label: "Trending" },
                { href: "/about", label: "About" },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link
                    href={href}
                    className="text-xs sm:text-sm text-neutral-300 hover:text-white transition-colors duration-150 inline-block py-1 sm:py-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Strip: Copyright & Legal Policies */}
        <div className="mt-10 sm:mt-12 pt-6 sm:pt-8 border-t border-neutral-800/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <p className="text-xs text-neutral-400 m-0 order-2 sm:order-1">
            &copy; {new Date().getFullYear()} AI Founders Talk. All rights reserved.
          </p>
          <nav aria-label="Legal and policy links" className="flex flex-wrap items-center gap-x-3 sm:gap-x-4 gap-y-1.5 text-xs text-neutral-400 order-1 sm:order-2">
            <Link
              href="/privacy"
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded py-0.5"
            >
              Privacy
            </Link>
            <span className="text-neutral-600 select-none hidden sm:inline" aria-hidden="true">
              &middot;
            </span>
            <Link
              href="/terms"
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded py-0.5"
            >
              Terms
            </Link>
            <span className="text-neutral-600 select-none hidden sm:inline" aria-hidden="true">
              &middot;
            </span>
            <Link
              href="/editorial-policy"
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded py-0.5"
            >
              Editorial Policy
            </Link>
            <span className="text-neutral-600 select-none hidden sm:inline" aria-hidden="true">
              &middot;
            </span>
            <Link
              href="/sitemap"
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded py-0.5"
            >
              Sitemap
            </Link>
            <span className="text-neutral-600 select-none hidden sm:inline" aria-hidden="true">
              &middot;
            </span>
            <Link
              href="/newsletter"
              className="hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-white rounded py-0.5"
            >
              Newsletter
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}