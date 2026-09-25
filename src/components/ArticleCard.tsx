import Link from "next/link";
import Image from "next/image";
import { ContentMeta } from "@/lib/content";
import { getPillar } from "@/lib/taxonomy";

export function ArticleCard({
  article,
  headingLevel: Heading = "h2",
}: {
  article: ContentMeta;
  headingLevel?: "h2" | "h3";
}) {
  const pillar = getPillar(article.pillar);
  const section =
    article.type === "article"
      ? "articles"
      : article.type === "interview"
        ? "interviews"
        : "resources";
  const href = `/${section}/${article.slug}`;

  const altText = article.coverImageAlt || `${article.title} - AI Founders Talk`;

  return (
    <article className="card group">
      <Link href={href} className="block no-underline">
        {/* Cover image (render ONLY when coverImage exists) */}
        {article.coverImage && (
          <div className="cover-image-container aspect-[16/9]">
            <Image
              src={article.coverImage}
              alt={altText}
              width={640}
              height={360}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 400px"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div className="p-5">
          {/* Pillar tag */}
          {pillar && (
            <span className="pillar-tag mb-3">
              <span>{pillar.shortLabel}</span>
            </span>
          )}

          {/* Title */}
          <Heading
            className="text-base font-bold leading-snug mb-2 transition-colors mt-2 text-slate-900 group-hover:text-slate-600"
            style={{
              fontFamily: "var(--font-serif)",
            }}
          >
            {article.title}
          </Heading>

          {/* Excerpt */}
          <p
            className="text-sm leading-relaxed mb-4 line-clamp-2"
            style={{ color: "var(--text-secondary)" }}
          >
            {article.excerpt}
          </p>

          {/* Meta */}
          <div
            className="flex items-center gap-3 text-xs"
            style={{ color: "var(--text-muted)" }}
          >
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <span>•</span>
            <span>{article.readingTime}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}

export function ArticleCardHero({ article }: { article: ContentMeta }) {
  const pillar = getPillar(article.pillar);
  const section =
    article.type === "article"
      ? "articles"
      : article.type === "interview"
        ? "interviews"
        : "resources";
  const href = `/${section}/${article.slug}`;

  const altText = article.coverImageAlt || `${article.title} - Featured Analysis`;

  return (
    <article className="card group">
      <Link href={href} className="block no-underline md:flex">
        {/* Cover image (render ONLY when coverImage exists) */}
        {article.coverImage && (
          <div className="cover-image-container aspect-[16/9] md:aspect-auto md:w-1/2 flex-shrink-0">
            <Image
              src={article.coverImage}
              alt={altText}
              width={800}
              height={450}
              sizes="(max-width: 768px) 100vw, 50vw"
              className="w-full h-full object-cover"
              priority
            />
          </div>
        )}

        <div className={`p-8 flex flex-col justify-center ${article.coverImage ? "" : "w-full"}`}>
          {/* Featured label */}
          <span
            className="text-xs font-semibold uppercase tracking-widest mb-3"
            style={{ color: "var(--accent)" }}
          >
            Featured
          </span>

          {/* Pillar tag */}
          {pillar && (
            <span className="pillar-tag mb-4 self-start">
              <span>{pillar.shortLabel}</span>
            </span>
          )}

          {/* Title */}
          <h2
            className="text-xl md:text-2xl font-bold leading-tight mb-3 text-slate-900 group-hover:text-slate-600 transition-colors"
            style={{
              fontFamily: "var(--font-serif)",
            }}
          >
            {article.title}
          </h2>

          {/* Excerpt */}
          <p
            className="text-base leading-relaxed mb-4"
            style={{ color: "var(--text-secondary)" }}
          >
            {article.excerpt}
          </p>

          {/* Meta */}
          <div
            className="flex items-center gap-3 text-sm"
            style={{ color: "var(--text-muted)" }}
          >
            <time dateTime={article.publishedAt}>
              {new Date(article.publishedAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </time>
            <span>•</span>
            <span>{article.readingTime}</span>
          </div>
        </div>
      </Link>
    </article>
  );
}