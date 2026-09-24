import { Metadata } from "next";
import { BreadcrumbJsonLd, WebPageJsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";
import { absoluteUrl } from "@/lib/siteUrl";

export const metadata: Metadata = {
  title: "Privacy Policy | AI Founders Talk",
  description: "How AI Founders Talk handles data, privacy, and analytics.",
  alternates: {
    canonical: absoluteUrl("/privacy"),
  },
};

export default function PrivacyPage() {
  return (
    <>
      <WebPageJsonLd
        title="Privacy Policy | AI Founders Talk"
        description="How AI Founders Talk handles data, privacy, and analytics."
        url="/privacy"
      />
      <BreadcrumbJsonLd
        items={[
          { name: "Home", url: "/" },
          { name: "Privacy Policy", url: "/privacy" },
        ]}
      />

      <div className="container-content py-12">
        <Breadcrumbs items={[{ label: "Privacy Policy" }]} />

        <h1 className="text-2xl sm:text-3xl font-bold mb-6 text-black" style={{ fontFamily: "var(--font-serif)" }}>
          Privacy Policy
        </h1>

        <div className="prose">
          <p className="text-sm text-gray-500 mb-6">
            Last updated: January 15, 2026
          </p>

          <h2>1. Introduction</h2>
          <p>
            AI Founders Talk (&ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects your privacy and is committed to protecting the personal information you share with us. This Privacy Policy describes how we collect, use, and safeguard information across our website (aifounderstalk.com) and associated newsletter services.
          </p>

          <h2>2. Information We Collect</h2>
          <ul>
            <li><strong>Newsletter Subscriptions:</strong> When you subscribe to our newsletter, we collect your email address. This is processed securely through our email service provider and used exclusively to deliver editorial updates and publication announcements.</li>
            <li><strong>Usage Analytics:</strong> We use privacy-respecting analytics tools to understand aggregate audience behavior, such as page views, referrers, and reading time. We do not track individual users across third-party websites or build behavioral advertising profiles.</li>
            <li><strong>Server Logs:</strong> Like most web servers, our hosting infrastructure records basic technical logs (IP address, user agent, requested URL) for diagnostic and security purposes. These logs are retained temporarily and purged on a rolling basis.</li>
          </ul>

          <h2>3. How We Use Information</h2>
          <p>
            We use collected information solely to:
          </p>
          <ul>
            <li>Deliver requested editorial content and newsletter editions.</li>
            <li>Maintain, secure, and improve site performance and reader experience.</li>
            <li>Respond to editorial inquiries, feedback, and correction requests.</li>
          </ul>

          <h2>4. Data Sharing &amp; Third Parties</h2>
          <p>
            We do not sell, rent, or trade reader personal information. We share data only with necessary service providers (such as hosting infrastructure and newsletter delivery platforms) bound by data protection obligations consistent with this policy.
          </p>

          <h2>5. Your Rights &amp; Choices</h2>
          <p>
            You may unsubscribe from our newsletter at any time by clicking the &ldquo;unsubscribe&rdquo; link in any email footer. To request deletion of your subscription record or inquire about your data, contact us at <a href="mailto:editorial@aifounderstalk.com" className="text-blue-600 hover:text-blue-800 underline">editorial@aifounderstalk.com</a>.
          </p>

          <h2>6. Updates to This Policy</h2>
          <p>
            We may update this policy periodically to reflect changes in our operational practices or applicable law. Revised policies will be posted to this page with an updated revision date.
          </p>
        </div>
      </div>
    </>
  );
}
