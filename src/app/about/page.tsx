import { Metadata } from "next";
import Link from "next/link";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { absoluteUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "AI Founders Talk is a plain-English guide helping business owners, founders, and everyday professionals understand and use AI with zero confusion.",
  openGraph: {
    type: "website",
    title: "About Us | AI Founders Talk",
    description:
      "AI Founders Talk is a plain-English guide helping business owners, founders, and everyday professionals understand and use AI with zero confusion.",
    url: absoluteUrl("/about"),
  },
  alternates: {
    canonical: absoluteUrl("/about"),
  },
};

export default function AboutPage() {
  return (
    <>
      <WebPageJsonLd
        title="About Us | AI Founders Talk"
        description="AI Founders Talk is a plain-English guide helping business owners, founders, and everyday professionals understand and use AI with zero confusion."
        url="/about"
        type="AboutPage"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "About", url: "/about" },
        ]}
      />

      <div className="container-content py-12">
        <Breadcrumbs items={[{ label: "About" }]} />

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-black" style={{ fontFamily: "var(--font-serif)" }}>
          About AI Founders Talk
        </h1>

        <div className="prose">
          <p className="text-base text-gray-700 leading-relaxed">
            Most AI websites are written for machine learning engineers and tech insiders. <strong>AI Founders Talk is built for the rest of us.</strong>
          </p>
          <p className="text-base text-gray-700 leading-relaxed">
            Whether you run a small agency, manage a sales team, work as a solo founder, or lead an established business, our mission is simple: <strong>to help you understand, choose, and use AI tools to save time and grow your business—without needing any technical background.</strong>
          </p>

          <h2>What We Write About</h2>
          <p>
            We focus on practical, actionable topics that deliver real results:
          </p>
          <ul>
            <li>
              <strong>Simple AI Tool Reviews:</strong> We test and evaluate tools like ChatGPT, Claude, Microsoft Copilot, and sales automation software to tell you honestly which ones are worth your time and money. Browse our latest <Link href="/resources" className="text-blue-600 hover:underline font-medium">AI Resources &amp; Guides</Link>.
            </li>
            <li>
              <strong>Getting Found on AI Search (AEO):</strong> Practical steps to make sure your website and business show up when prospective customers ask questions on ChatGPT, Perplexity, and Google. Explore our <Link href="/articles" className="text-blue-600 hover:underline font-medium">AI Articles &amp; Analysis</Link>.
            </li>
            <li>
              <strong>Real Founder Stories:</strong> Unfiltered conversations with entrepreneurs sharing the exact workflows, mistakes, and tools they used to grow. Read our <Link href="/interviews" className="text-blue-600 hover:underline font-medium">Founder Talks &amp; Interviews</Link>.
            </li>
            <li>
              <strong>Live Industry Trends:</strong> Real-time tracking of AI innovations and startup discussions across the ecosystem. Discover <Link href="/trending" className="text-blue-600 hover:underline font-medium">AI &amp; Startup Trending</Link>.
            </li>
          </ul>

          <h2>Our Editorial Promise</h2>
          <ul>
            <li>
              <strong>Plain English First:</strong> If an idea sounds too complicated, we rewrite it until anyone can understand it in under 60 seconds.
            </li>
            <li>
              <strong>No Pay-For-Play Reviews:</strong> Companies cannot pay to get positive reviews in our guides. We write honest recommendations based on real-world testing. Read our full <Link href="/editorial-policy" className="text-blue-600 hover:underline font-medium">Editorial Policy</Link>.
            </li>
            <li>
              <strong>Practical Over Hype:</strong> We skip the sci-fi speculation and focus on what AI can actually do for your business right now.
            </li>
          </ul>

          <h2>Get in Touch</h2>
          <p>
            Have a question, a founder story to share, or a topic you&apos;d like us to cover? We&apos;d love to hear from you at{" "}
            <a href="mailto:editorial@aifounderstalk.com" className="text-blue-600 hover:text-blue-800 underline font-medium">
              editorial@aifounderstalk.com
            </a>.
          </p>
        </div>
      </div>
    </>
  );
}
