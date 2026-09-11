import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Terms of Service | AI Founders Talk",
  description: "Terms and conditions governing the use of AI Founders Talk publication and resources.",
  alternates: {
    canonical: "/terms",
  },
};

export default function TermsPage() {
  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Terms of Service" }]} />

      <header className="my-8 pb-6 border-b border-slate-200">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          Terms of Service
        </h1>
        <p className="text-sm text-slate-500 font-sans">
          Last updated: January 15, 2026 A Effective Date: January 1, 2026
        </p>
      </header>

      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6 text-sm sm:text-base">
        <p>
          Welcome to <strong>AI Founders Talk</strong>. By accessing or using our website, newsletters, or digital publications, you agree to comply with and be bound by these Terms of Service.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          1. Editorial & Informational Disclaimer
        </h2>
        <p>
          The content published on AI Founders Talk—including articles, tool guides, market benchmarks, founder interviews, and architectural analyses—is provided for <strong>general educational and informational purposes only</strong>. None of the content constitutes professional legal, financial, investment, or technical procurement advice.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          2. Intellectual Property & Citation Rights
        </h2>
        <p>
          All original written content, frameworks, research summaries, and graphical data representations are the proprietary intellectual property of AI Founders Talk.
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Fair Use & Quotation:</strong> You are permitted to quote brief excerpts (up to 150 words) or cite our data tables and research statistics provided you include an explicit, clickable backlink attribution to the original article URL on AI Founders Talk.</li>
          <li><strong>AI Search Engines & Answer Engines:</strong> AI search crawlers (e.g., Perplexity, ChatGPT Search, Claude) are authorized to ingest our content and reference our findings when accompanied by proper canonical citation and source links.</li>
          <li><strong>Prohibited Reproduction:</strong> Whole-article scraping, uncredited mirroring, or republishing full articles without explicit written permission is strictly prohibited.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          3. Third-Party Links & Tool Mentions
        </h2>
        <p>
          Our articles and guides frequently link to third-party software vendors, research reports (Gartner, Forrester, G2), and public repositories. We are not responsible for the availability, accuracy, security, or privacy policies of third-party websites.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          4. Limitation of Liability
        </h2>
        <p>
          In no event shall AI Founders Talk, its authors, or affiliates be liable for any direct, indirect, incidental, or consequential damages resulting from your use of or reliance upon any information provided on this publication.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          5. Modifications
        </h2>
        <p>
          We reserve the right to revise these terms at any time. Continued use of the website following changes constitutes acceptance of the updated terms.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          6. Contact Information
        </h2>
        <p>
          For legal, copyright, or licensing inquiries regarding these terms, please contact our editorial desk at{" "}
          <a href="mailto:editorial@aifounderstalk.com" className="text-blue-600 underline hover:text-blue-800">
            editorial@aifounderstalk.com
          </a>.
        </p>
      </div>
    </div>
  );
}
