import { Metadata } from "next";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { absoluteUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "Terms and conditions governing the use of AI Founders Talk.",
  openGraph: {
    type: "website",
    title: "Terms of Service | AI Founders Talk",
    description: "Terms and conditions governing the use of AI Founders Talk.",
    url: absoluteUrl("/terms"),
  },
  alternates: {
    canonical: absoluteUrl("/terms"),
  },
};

export default function TermsPage() {
  return (
    <>
      <WebPageJsonLd
        title="Terms of Service | AI Founders Talk"
        description="Terms and conditions governing the use of AI Founders Talk."
        url="/terms"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Terms of Service", url: "/terms" },
        ]}
      />

      <div className="container-content py-12">
        <Breadcrumbs items={[{ label: "Terms of Service" }]} />

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-black" style={{ fontFamily: "var(--font-serif)" }}>
          Terms of Service
        </h1>

        <div className="prose">
          <p className="text-sm text-gray-500 mb-6">
            Last updated: September 25, 2026
          </p>

          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using AI Founders Talk (aifounderstalk.com), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the website.
          </p>

          <h2>2. Intellectual Property &amp; Permitted Use</h2>
          <p>
            All editorial content, articles, analyses, frameworks, illustrations, and code samples published on AI Founders Talk are protected by applicable copyright, trademark, and intellectual property laws.
          </p>
          <ul>
            <li><strong>Personal &amp; Internal Use:</strong> You may read, print, and reference our content for personal, non-commercial, or internal business purposes.</li>
            <li><strong>Quotation &amp; Excerpting:</strong> Short quotations (up to 150 words) are permitted for commentary, academic, or journalistic purposes, provided clear attribution and a hyperlink back to the original URL are included.</li>
            <li><strong>AI Search Engines &amp; Answer Engines:</strong> AI search crawlers (e.g., Perplexity, ChatGPT Search, Claude) are authorized to ingest our content and reference our findings when accompanied by proper canonical citation and source links.</li>
            <li><strong>Prohibited Reproduction:</strong> Full-text scraping, automated republication, or commercial redistribution without prior written consent is strictly prohibited.</li>
          </ul>

          <h2>3. Disclaimers &amp; Limitation of Liability</h2>
          <p>
            The content on AI Founders Talk is published for informational, educational, and analytical purposes only. It does not constitute legal, financial, architectural, or investment advice.
          </p>
          <p>
            While we strive for technical accuracy and thorough research, we make no warranties, express or implied, regarding the completeness, reliability, or suitability of the information presented. Your reliance on any material published on this site is at your own risk.
          </p>

          <h2>4. External Links</h2>
          <p>
            Our articles frequently reference external websites, research papers, documentation, and product platforms. We are not responsible for the content, security practices, or privacy policies of third-party websites.
          </p>

          <h2>5. Governing Law</h2>
          <p>
            These Terms of Service are governed by and construed in accordance with applicable laws. Any dispute arising under these terms shall be subject to the appropriate jurisdiction.
          </p>

          <h2>6. Contact</h2>
          <p>
            For syndication requests, licensing inquiries, or legal notices, contact <a href="mailto:aifounderstalk@gmail.com" className="text-blue-600 hover:text-blue-800 underline">aifounderstalk@gmail.com</a>.
          </p>
        </div>
      </div>
    </>
  );
}
