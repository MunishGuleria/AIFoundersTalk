import { Metadata } from "next";
import { BreadcrumbJsonLd } from "@/components/seo/JsonLd";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "About Us | AI Founders Talk",
  description:
    "AI Founders Talk is a plain-English guide helping business owners, founders, and everyday professionals understand and use AI with zero confusion.",
};

export default function AboutPage() {
  return (
    <>
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
              <strong>Simple AI Tool Reviews:</strong> We test and evaluate tools like ChatGPT, Claude, Microsoft Copilot, and sales automation software to tell you honestly which ones are worth your time and money.
            </li>
            <li>
              <strong>Getting Found on AI Search (AEO):</strong> Practical steps to make sure your website and business show up when prospective customers ask questions on ChatGPT, Perplexity, and Google.
            </li>
            <li>
              <strong>Real Founder Stories:</strong> Unfiltered conversations with entrepreneurs sharing the exact workflows, mistakes, and tools they used to grow.
            </li>
            <li>
              <strong>Everyday Workflows & Time Savers:</strong> Step-by-step guides on automating administrative work, email follow-ups, and customer tracking so you can focus on what matters most.
            </li>
          </ul>

          <h2>Our Editorial Promise</h2>
          <ul>
            <li>
              <strong>Plain English First:</strong> If an idea sounds too complicated, we rewrite it until anyone can understand it in under 60 seconds.
            </li>
            <li>
              <strong>No Pay-For-Play Reviews:</strong> Companies cannot pay to get positive reviews in our guides. We write honest recommendations based on real-world testing.
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