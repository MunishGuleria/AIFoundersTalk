import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Privacy Policy | AI Founders Talk",
  description: "Privacy policy, data collection practices, and cookie disclosures for AI Founders Talk.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="w-full max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Breadcrumbs items={[{ label: "Privacy Policy" }]} />

      <header className="my-8 pb-6 border-b border-slate-200">
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          Privacy Policy
        </h1>
        <p className="text-sm text-slate-500 font-sans">
          Last updated: January 15, 2026 &bull; Effective Date: January 1, 2026
        </p>
      </header>

      <div className="prose prose-slate max-w-none text-slate-700 leading-relaxed space-y-6 text-sm sm:text-base">
        <p>
          At <strong>AI Founders Talk</strong> (accessible from <Link href="/" className="text-slate-900 underline">www.aifounderstalk.com</Link>), the privacy of our visitors and subscribers is of paramount importance. This Privacy Policy document outlines the types of information collected and recorded by AI Founders Talk and how we use it.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          1. Information We Collect
        </h2>
        <p>
          We collect information to deliver high-quality research and news to our readers:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Newsletter Subscriptions:</strong> When you subscribe to our newsletter, we collect your email address and any voluntary preferences you specify.</li>
          <li><strong>Website Analytics:</strong> We collect non-personally identifiable log files including IP addresses, browser types, Internet Service Providers (ISP), referring/exit pages, operating system, date/time stamps, and clickstream data.</li>
          <li><strong>Contact Inquiries:</strong> When reaching out to our editorial team, we retain the correspondence to respond effectively.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          2. How We Use Your Information
        </h2>
        <p>
          We use collected information in the following ways:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>To distribute editorial newsletters, research briefs, and industry reports you have requested.</li>
          <li>To understand and analyze how readers use our publication to improve editorial coverage.</li>
          <li>To maintain website security and prevent fraudulent activities.</li>
          <li>We <strong>do not sell, rent, or trade</strong> your personal email address or data with third-party brokers.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          3. Cookies and Tracking Technologies
        </h2>
        <p>
          AI Founders Talk uses standard cookies to store visitor preferences and optimize page loading speeds. You can choose to disable cookies through your individual browser options.
        </p>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          4. GDPR & CCPA Privacy Rights
        </h2>
        <p>
          Under data protection frameworks (including GDPR for EU residents and CCPA for California residents), you possess rights including:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>The right to request access to copies of your personal data.</li>
          <li>The right to request rectification of inaccurate information.</li>
          <li>The right to request erasure of your personal data (the &quot;right to be forgotten&quot;).</li>
          <li>The right to unsubscribe from our newsletter at any time via the one-click unsubscribe link in every email.</li>
        </ul>

        <h2 className="text-xl font-bold text-slate-900 mt-8 mb-3" style={{ fontFamily: "var(--font-serif)" }}>
          5. Contact &amp; Inquiries
        </h2>
        <p>
          If you have questions about our Privacy Policy or data handling, please contact us at <a href="mailto:editorial@aifounderstalk.com" className="text-blue-600 hover:text-blue-800 underline font-medium">editorial@aifounderstalk.com</a>.
        </p>
      </div>
    </div>
  );
}
