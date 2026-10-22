import { Metadata } from "next";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { absoluteUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "Editorial Policy",
  description:
    "Our editorial standards, disclosure policies, citation practices, and AI usage guidelines.",
  openGraph: {
    type: "website",
    title: "Editorial Policy | AI Founders Talk",
    description:
      "Our editorial standards, disclosure policies, citation practices, and AI usage guidelines.",
    url: absoluteUrl("/editorial-policy"),
  },
  alternates: {
    canonical: absoluteUrl("/editorial-policy"),
  },
};

export default function EditorialPolicyPage() {
  return (
    <>
      <WebPageJsonLd
        title="Editorial Policy | AI Founders Talk"
        description="Our editorial standards, disclosure policies, citation practices, and AI usage guidelines."
        url="/editorial-policy"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Editorial Policy", url: "/editorial-policy" },
        ]}
      />

      <div className="container-content py-12">
        <Breadcrumbs items={[{ label: "Editorial Policy" }]} />

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-black" style={{ fontFamily: "var(--font-serif)" }}>
          Editorial Policy
        </h1>

        <div className="prose">
          <p className="text-sm text-gray-500 mb-6">
            Last updated: September 25, 2026
          </p>

          <h2>Mission &amp; Scope</h2>
          <p>
            AI Founders Talk is an independent trade publication providing technical and strategic analysis of artificial intelligence, revenue operations, CRM architecture, answer engine optimization (AEO), and competitive intelligence. Our primary audience includes enterprise software founders, chief revenue officers, heads of RevOps, and technical practitioners.
          </p>

          <h2>Editorial Independence</h2>
          <p>
            Our editorial decisions are made independently of commercial interests. We do not accept payment, equity, or commercial favors in exchange for favorable editorial coverage, product reviews, or interview placement.
          </p>

          <h2>Research &amp; Sourcing Standards</h2>
          <ul>
            <li><strong>Primary Sourcing:</strong> We prioritize firsthand accounts, primary technical documentation, public filings, and verified product specifications over secondary reporting.</li>
            <li><strong>Data Integrity:</strong> Quantitative claims (market sizing, benchmarks, performance metrics) are cited to their original methodology and source whenever technically feasible.</li>
            <li><strong>Attribution:</strong> All direct quotations, proprietary frameworks, and borrowed data points are attributed to the originating author, organization, or publication.</li>
          </ul>

          <h2>AI Tooling &amp; Content Generation Policy</h2>
          <p>
            We cover AI systems and utilize AI tools within our research workflow under strict human supervision:
          </p>
          <ul>
            <li><strong>Human Authorship &amp; Review:</strong> Every article, guide, and interview is conceived, structured, fact-checked, and edited by human editorial staff.</li>
            <li><strong>Assisted Research:</strong> AI tools may be employed for data synthesis, transcript indexing, and literature search, but are never solely relied upon for factual claims without independent corroboration.</li>
            <li><strong>Synthetic Media:</strong> Any AI-generated visual assets or illustrations are labeled with clear provenance indicators in the image credit and alt metadata.</li>
          </ul>

          <h2>Corrections &amp; Updates</h2>
          <p>
            We are committed to correcting substantive errors promptly and transparently. When an error is identified:
          </p>
          <ul>
            <li>The content is amended with an explicit update timestamp.</li>
            <li>A correction notice is appended explaining the nature of the change when a factual inaccuracy altered the core argument.</li>
            <li>Corrections may be submitted to <a href="mailto:aifounderstalk@gmail.com" className="text-blue-600 hover:text-blue-800 underline">aifounderstalk@gmail.com</a>.</li>
          </ul>

          <h2>Commercial Disclosures</h2>
          <p>
            Where an affiliate relationship or commercial partnership exists between AI Founders Talk and a featured vendor, clear and conspicuous disclosure is provided on the relevant page prior to any commercial link.
          </p>
        </div>
      </div>
    </>
  );
}
