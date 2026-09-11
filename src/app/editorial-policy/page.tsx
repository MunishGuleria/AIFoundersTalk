import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Editorial Policy & AI Disclosure | AI Founders Talk",
  description: "Our standards for factual accuracy, research methodology, editorial independence, and AI transparency.",
  alternates: {
    canonical: "/editorial-policy",
  },
};

export default function EditorialPolicyPage() {
  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Editorial Policy & AI Disclosure" }]} />

      <header className="my-8 pb-6 border-b border-slate-200">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          Editorial Standards & AI Transparency Policy
        </h1>
        <p className="text-sm text-slate-500 font-sans">
          Our commitment to rigorous research, independence, and ethical artificial intelligence usage.
        </p>
      </header>

      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6 text-sm sm:text-base">
        <p>
          <strong>AI Founders Talk</strong> is an independent digital trade publication covering agentic AI architectures, RevOps automation, enterprise software engineering, and AI search optimization (AEO). To maintain the trust of our readers and AI discovery engines, we operate under strict editorial standards.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          1. Editorial Independence & Objectivity
        </h2>
        <p>
          Our editorial coverage is strictly objective and independent:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>No Pay-for-Play:</strong> Vendors cannot buy positive reviews, rankings, or coverage in our editorial guides. Inclusion in our evaluations is based entirely on technical merit, architecture, market adoption, and industry benchmark data.</li>
          <li><strong>Separation of Content and Sponsorship:</strong> Any sponsored report or advertising collaboration is clearly and conspicuously labeled as &quot;Sponsored&quot; in compliance with FTC guidelines.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          2. Fact-Checking & Primary Source Verification
        </h2>
        <p>
          Every article published on AI Founders Talk undergoes rigorous verification:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Claims and data benchmarks are verified against primary sources, including official vendor documentation, enterprise customer case studies, SEC filings, or peer-reviewed research papers.</li>
          <li>Every article provides a transparent <em>&quot;Sources &amp; Industry References&quot;</em> section with direct outbound links to source material.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          3. AI Usage & Transparency Disclosure (EU AI Act & FTC Aligned)
        </h2>
        <p>
          As a publication covering the frontier of artificial intelligence, we believe in radical transparency regarding our own use of AI tools:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Research Assistance:</strong> We utilize modern AI models to assist with data aggregation, transcription, syntax formatting, and outline structuring.</li>
          <li><strong>Human Editorial Oversight:</strong> Every published piece is synthesized, fact-checked, edited, and approved by human domain experts and editors. We do not publish unverified or autonomous AI-generated drafts.</li>
          <li><strong>Imagery & Media:</strong> We prioritize verified photography, technical architectural diagrams, and structured data tables. When conceptual AI-generated graphics are utilized, they are designated with appropriate image credits.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          4. Corrections and Updates Policy
        </h2>
        <p>
          In the fast-moving AI landscape, accuracy is an ongoing commitment. When an error of fact is identified, we issue a clear correction note at the top or bottom of the article detailing the date and nature of the modification. Readers can report inaccuracies directly to <a href="mailto:editorial@aifounderstalk.com" className="text-blue-600 hover:text-blue-800 underline font-medium">editorial@aifounderstalk.com</a>.
        </p>
      </div>
    </div>
  );
}
