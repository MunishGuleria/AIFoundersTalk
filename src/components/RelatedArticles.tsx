import Link from "next/link";
import Image from "next/image";
import { ContentMeta } from "@/lib/content";
import { getPillar } from "@/lib/taxonomy";

export function RelatedArticles({
  articles,
  title = "Suggested & Related Reads",
  layout = "grid",
}: {
  articles: ContentMeta[];
  title?: string;
  layout?: "grid" | "sidebar";
}) {
  if (!articles || articles.length === 0) return null;

  if (layout === "sidebar") {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 font-sans mb-4 pb-2 border-b border-slate-200">
          {title}
        </h3>
        <div className="space-y-4">
          {articles.slice(0, 4).map((item) => {
            const section =
              item.type === "article"
                ? "articles"
                : item.type === "interview"
                ? "interviews"
                : "resources";

            const pillarObj = getPillar(item.pillar);
            const pillarLabel = pillarObj?.shortLabel || item.pillar;

            return (
              <article key={item.slug} className="group flex gap-3 items-start">
                {item.coverImage && (
                  <div className="w-16 h-12 relative shrink-0 rounded-lg overflow-hidden bg-slate-100 border border-slate-200">
                    <Image
                      src={item.coverImage}
                      alt={item.coverImageAlt || `${item.title} - Related Analysis`}
                      fill
                      sizes="64px"
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5 font-sans">
                    {pillarLabel}
                  </span>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-slate-600 leading-snug line-clamp-2 font-sans transition-colors">
                    <Link
                      href={`/${section}/${item.slug}`}
                      className="text-inherit hover:text-slate-600 no-underline transition-colors font-sans"
                    >
                      {item.title}
                    </Link>
                  </h4>
                  <span className="text-[11px] text-slate-400 group-hover:text-slate-600 mt-1 block font-sans transition-colors">
                    {item.readingTime} · Read article →
                  </span>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section className="mt-12 pt-8 border-t border-slate-200">
      <h3
        className="text-lg font-bold text-slate-900 mb-6"
        style={{ fontFamily: "var(--font-serif)" }}
      >
        {title}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {articles.slice(0, 2).map((item) => {
          const section =
            item.type === "article"
              ? "articles"
              : item.type === "interview"
              ? "interviews"
              : "resources";

          const pillarObj = getPillar(item.pillar);
          const pillarLabel = pillarObj?.shortLabel || item.pillar;

          return (
            <article
              key={item.slug}
              className="p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs group flex flex-col justify-between"
            >
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1 font-sans">
                  {pillarLabel}
                </div>
                <h4
                  className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-slate-600 mb-2 line-clamp-2 transition-colors"
                  style={{ fontFamily: "var(--font-serif)" }}
                >
                  <Link
                    href={`/${section}/${item.slug}`}
                    className="text-inherit hover:text-slate-600 no-underline transition-colors"
                  >
                    {item.title}
                  </Link>
                </h4>
                <p className="text-xs text-slate-600 line-clamp-2 mb-3 font-sans">
                  {item.excerpt}
                </p>
              </div>
              <div className="text-xs font-semibold text-blue-600 group-hover:text-blue-800 transition-colors flex items-center gap-1 font-sans mt-auto">
                Read full analysis →
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
