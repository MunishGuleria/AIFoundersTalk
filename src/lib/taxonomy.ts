export const PILLARS = {
  "founder-interviews": {
    label: "Founder Stories & Practical Talks",
    shortLabel: "Founder Stories",
    icon: "🎙️",
    description: "Real conversations with founders sharing what works, what fails, and how they grow.",
    slug: "founder-interviews",
  },
  "tool-guides": {
    label: "Simple AI Tool Guides & Reviews",
    shortLabel: "Tool Guides",
    icon: "⚡",
    description: "Honest, jargon-free reviews of the best AI tools to save time and automate daily work.",
    slug: "tool-guides",
  },
  "aeo-ai-search": {
    label: "Getting Found on AI Search (AEO)",
    shortLabel: "AI Search & AEO",
    icon: "🔍",
    description: "Simple steps to help your business get recommended when people ask ChatGPT, Perplexity, and Google.",
    slug: "aeo-ai-search",
  },
  "competitive-intelligence": {
    label: "Market & Competitor Insights",
    shortLabel: "Market Insights",
    icon: "📊",
    description: "Practical ways to understand your competitors and win more deals with confidence.",
    slug: "competitive-intelligence",
  },
  "crm-pipeline": {
    label: "Sales & Customer Workflow Guides",
    shortLabel: "Sales Workflows",
    icon: "💼",
    description: "How to organize customer conversations, track deals, and cut down manual admin tasks.",
    slug: "crm-pipeline",
  },
  "news-digest": {
    label: "AI News in Plain English",
    shortLabel: "Weekly Digest",
    icon: "📰",
    description: "What changed in AI this week and what it actually means for your business.",
    slug: "news-digest",
  },
  "problems-solutions": {
    label: "Common Problems & Easy Solutions",
    shortLabel: "Problem Solvers",
    icon: "💡",
    description: "Everyday bottlenecks business owners face, solved with simple step-by-step AI workflows.",
    slug: "problems-solutions",
  },
  "seminar-recaps": {
    label: "Keynote & Workshop Takeaways",
    shortLabel: "Event Summaries",
    icon: "🎯",
    description: "Quick summaries of major conferences and workshops so you get the insights in 5 minutes.",
    slug: "seminar-recaps",
  },
} as const;

export type PillarKey = keyof typeof PILLARS;

export const PILLAR_KEYS = Object.keys(PILLARS) as PillarKey[];

export function getPillar(key: string) {
  return PILLARS[key as PillarKey] || null;
}

export function getPillarLabel(key: string): string {
  return PILLARS[key as PillarKey]?.label || key;
}