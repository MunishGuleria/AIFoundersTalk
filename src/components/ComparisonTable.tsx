import React from "react";

/**
 * Modern Graphical Diagrams, Flowcharts & Data Components for Articles
 * Clean, responsive, lightweight, accessible SVG & CSS components.
 */

export interface FlowStepItem {
  number: string | number;
  title: string;
  subtitle: string;
  tag?: string;
  icon?: string;
  timeline?: string;
}

/** 1. Universal Graphical Step-by-Step Arrow Flowchart */
export function VisualFlowchart({
  title,
  subtitle,
  steps = [],
}: {
  title?: string;
  subtitle?: string;
  steps?: FlowStepItem[];
}) {
  if (!steps || steps.length === 0) return null;

  return (
    <figure className="my-10 rounded-2xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8 shadow-2xs">
      {title && (
        <div className="mb-8 text-center max-w-xl mx-auto">
          <span className="text-[11px] font-bold uppercase tracking-widest text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200 inline-block mb-2.5 shadow-2xs">
            Visual Step-by-Step Flow
          </span>
          <h3 className="text-base sm:text-xl font-bold text-slate-900 m-0" style={{ fontFamily: "var(--font-serif)" }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs sm:text-sm text-slate-600 mt-1.5 m-0 leading-relaxed">{subtitle}</p>
          )}
        </div>
      )}

      {/* Grid of Steps with Connecting Arrow Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 relative">
        {steps.map((step, idx) => (
          <div key={idx} className="flex flex-col relative group">
            <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs flex-1 flex flex-col justify-between hover:border-slate-300 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3.5">
                  <span className="w-8 h-8 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shadow-2xs">
                    {step.number || idx + 1}
                  </span>
                  {step.timeline ? (
                    <span className="text-[10px] font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {step.timeline}
                    </span>
                  ) : step.tag ? (
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {step.tag}
                    </span>
                  ) : null}
                </div>
                <h4 className="text-sm font-bold text-slate-900 mb-2 flex items-center gap-2">
                  {step.icon && <span className="text-base">{step.icon}</span>}
                  <span>{step.title}</span>
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed m-0">
                  {step.subtitle}
                </p>
              </div>
            </div>

            {/* Desktop Horizontal Arrow */}
            {idx < steps.length - 1 && (
              <div className="hidden lg:flex absolute -right-3.5 top-1/2 -translate-y-1/2 z-10 w-7 h-7 rounded-full bg-white border border-slate-300 items-center justify-center text-slate-600 shadow-sm text-xs font-bold pointer-events-none">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            )}

            {/* Mobile / Tablet Downward Connecting Arrow */}
            {idx < steps.length - 1 && (
              <div className="flex lg:hidden justify-center my-2 text-slate-400">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </figure>
  );
}

/** 2. AEO Pipeline Flowchart */
export function AEOFlowChart() {
  return (
    <VisualFlowchart
      title="How AI Answer Engines Choose What to Cite"
      subtitle="The 4-stage pipeline from web crawling to synthesized cited answer"
      steps={[
        {
          number: "1",
          icon: "🕷️",
          title: "Crawl",
          tag: "Discovery",
          subtitle: "AI bots (GPTBot, PerplexityBot) scan your web pages and structure.",
        },
        {
          number: "2",
          icon: "🧩",
          title: "Chunk",
          tag: "Parsing",
          subtitle: "Content is split into modular sections based on your headings.",
        },
        {
          number: "3",
          icon: "⚡",
          title: "Retrieve",
          tag: "Matching",
          subtitle: "When a user asks a question, the AI retrieves the most relevant chunks.",
        },
        {
          number: "4",
          icon: "🔗",
          title: "Cite",
          tag: "Synthesis",
          subtitle: "The AI answers the user and cites your website as the authoritative source.",
        },
      ]}
    />
  );
}

/** 3. Agentic AI Sales Flowchart */
export function AgenticWorkflowDiagram() {
  return (
    <VisualFlowchart
      title="Autonomous Agentic Sales Workflow"
      subtitle="How background AI agents handle repetitive work from conversation to CRM"
      steps={[
        {
          number: "1",
          icon: "💬",
          title: "Customer Talk",
          tag: "Input",
          subtitle: "Rep conducts call in Teams or sends follow-up email.",
        },
        {
          number: "2",
          icon: "🤖",
          title: "AI Analysis",
          tag: "Autonomous",
          subtitle: "Background agent extracts action items, pricing requests, and sentiment.",
        },
        {
          number: "3",
          icon: "📊",
          title: "Data Sync",
          tag: "Automation",
          subtitle: "Agent queries inventory/pricing and auto-updates CRM deal stage.",
        },
        {
          number: "4",
          icon: "✉️",
          title: "Draft & Alert",
          tag: "Execution",
          subtitle: "Rep gets a prepared proposal draft and channel alert in under 30 seconds.",
        },
      ]}
    />
  );
}

/** 4. Competitive Intelligence Flowchart */
export function CompetitiveIntelFlow() {
  return (
    <VisualFlowchart
      title="Real-Time Competitive Intelligence Loop"
      subtitle="Turning continuous market signals into instant in-workflow sales battlecards"
      steps={[
        {
          number: "1",
          icon: "📡",
          title: "Signal Monitor",
          tag: "Continuous",
          subtitle: "Web crawlers track competitor pricing changes, reviews, and news.",
        },
        {
          number: "2",
          icon: "🧠",
          title: "AI Synthesis",
          tag: "Context",
          subtitle: "LLM distills key feature differences, strengths, and objection counters.",
        },
        {
          number: "3",
          icon: "📋",
          title: "Live Battlecard",
          tag: "In-Workflow",
          subtitle: "Dynamic summary appears right inside your CRM or chat channel.",
        },
        {
          number: "4",
          icon: "🎯",
          title: "Win Deal",
          tag: "Outcome",
          subtitle: "Sales team answers difficult customer objections with 100% confidence.",
        },
      ]}
    />
  );
}

/** 5. Microsoft Copilot 4-Phase Roadmap Flowchart */
export function RoadmapFlowchart() {
  return (
    <VisualFlowchart
      title="Step-by-Step Copilot Rollout Roadmap"
      subtitle="The 4-stage implementation plan for rolling out autonomous sales agents"
      steps={[
        {
          number: "1",
          timeline: "Months 1–2",
          icon: "🧹",
          title: "Data Hygiene",
          subtitle: "Clean up CRM duplicate records and configure Microsoft Graph connectors.",
        },
        {
          number: "2",
          timeline: "Months 3–4",
          icon: "⚙️",
          title: "Copilot Studio",
          subtitle: "Build customized autonomous agents with specific deal qualification rules.",
        },
        {
          number: "3",
          timeline: "Months 5–6",
          icon: "💬",
          title: "Native Teams Sync",
          subtitle: "Roll out in-channel Adaptive Cards and automatic meeting summarization.",
        },
        {
          number: "4",
          timeline: "Ongoing",
          icon: "📈",
          title: "Audit & Scale",
          subtitle: "Monitor adoption metrics, Entra ID security permissions, and pipeline ROI.",
        },
      ]}
    />
  );
}

/** 6. RevOps Performance Timeline Flowchart */
export function RevOpsTimelineFlow() {
  return (
    <VisualFlowchart
      title="3-Phase Plan to Close the RevOps Gap"
      subtitle="How top-performing sales organizations eliminate manual admin friction"
      steps={[
        {
          number: "1",
          timeline: "Days 1–30",
          icon: "⚡",
          title: "In-Workflow Cards",
          subtitle: "Deploy native Teams Adaptive Cards to eliminate manual CRM meeting note entry.",
        },
        {
          number: "2",
          timeline: "Days 31–60",
          icon: "🔗",
          title: "Backend Sync",
          subtitle: "Connect ERP inventory & billing data for instant margin visibility inside chat.",
        },
        {
          number: "3",
          timeline: "Days 61–90",
          icon: "📊",
          title: "Live Forecasting",
          subtitle: "Replace gut-feel spreadsheets with algorithmic pipeline forecasting.",
        },
        {
          number: "4",
          timeline: "Scale",
          icon: "🏆",
          title: "Revenue Velocity",
          subtitle: "Achieve 3.4x faster pipeline velocity and sub-3% forecast accuracy variance.",
        },
      ]}
    />
  );
}

/** 7. 90-Day RevOps Unification Roadmap */
export function ImplementationRoadmapFlow() {
  return (
    <VisualFlowchart
      title="90-Day Enterprise Implementation Roadmap"
      subtitle="A structured 3-phase journey to unified multi-CRM and ERP intelligence"
      steps={[
        {
          number: "1",
          timeline: "Days 1–30",
          icon: "🔍",
          title: "Audit & Scoping",
          subtitle: "Map API integration touchpoints across Salesforce, Dynamics, and ERP stacks.",
        },
        {
          number: "2",
          timeline: "Days 31–60",
          icon: "🤖",
          title: "Agent Automation",
          subtitle: "Configure autonomous data pipelines and role-based access security controls.",
        },
        {
          number: "3",
          timeline: "Days 61–90",
          icon: "🚀",
          title: "Team Rollout",
          subtitle: "Conduct pilot with top reps and measure reduction in daily admin hours.",
        },
        {
          number: "4",
          timeline: "Day 90+",
          icon: "🎯",
          title: "Full Production",
          subtitle: "Full organization rollout with automated weekly pipeline telemetry reports.",
        },
      ]}
    />
  );
}

/** 8. Tool Evaluation Methodology Flowchart */
export function ToolEvaluationFlow() {
  return (
    <VisualFlowchart
      title="How to Evaluate Sales Intelligence Tools in Teams"
      subtitle="4 practical steps before committing to annual software contracts"
      steps={[
        {
          number: "1",
          icon: "🎯",
          title: "Define Triggers",
          tag: "Step 1",
          subtitle: "Identify which sales moments need automated battlecards (calls, emails, quotes).",
        },
        {
          number: "2",
          icon: "📱",
          title: "Test Chat UX",
          tag: "Step 2",
          subtitle: "Verify reps can access intel natively without opening another browser tab.",
        },
        {
          number: "3",
          icon: "🔒",
          title: "Security Review",
          tag: "Step 3",
          subtitle: "Audit Microsoft 365 tenant permissions, SSO, and SOC 2 Type II compliance.",
        },
        {
          number: "4",
          icon: "👥",
          title: "10-Rep Pilot",
          tag: "Step 4",
          subtitle: "Run a 14-day trial with real deal reviews and measure time saved per week.",
        },
      ]}
    />
  );
}

/** 9. Sentiment & Algorithmic Forecasting Pipeline */
export function SentimentForecastingFlow() {
  return (
    <VisualFlowchart
      title="Algorithmic Deal Sentiment & Forecasting Pipeline"
      subtitle="How modern AI copilots turn conversation signals into reliable pipeline forecasts"
      steps={[
        {
          number: "1",
          icon: "🎙️",
          title: "Signal Capture",
          tag: "Ingestion",
          subtitle: "Call transcripts, email reply times, and attendee seniority are aggregated.",
        },
        {
          number: "2",
          icon: "🧠",
          title: "Risk Scoring",
          tag: "Analysis",
          subtitle: "Natural language model flags deal blockers, competitor mentions, and sentiment.",
        },
        {
          number: "3",
          icon: "📉",
          title: "Velocity Model",
          tag: "Prediction",
          subtitle: "Algorithms dynamically adjust probability based on historical win patterns.",
        },
        {
          number: "4",
          icon: "🔔",
          title: "Manager Alert",
          tag: "Action",
          subtitle: "Revenue leaders receive proactive alerts before high-value deals stall.",
        },
      ]}
    />
  );
}

/** 10. Founder Execution Playbook Flowchart */
export function FounderPlaybookFlow() {
  return (
    <VisualFlowchart
      title="The 4-Step Founder Playbook for AI Sales Tools"
      subtitle="Practical execution advice from enterprise founders who scaled successfully"
      steps={[
        {
          number: "1",
          icon: "✂️",
          title: "Kill Tool Sprawl",
          tag: "Focus",
          subtitle: "Consolidate point solutions and bring workflows into your daily chat app.",
        },
        {
          number: "2",
          icon: "📥",
          title: "Context in Chat",
          tag: "Adoption",
          subtitle: "Deliver CRM history and customer notes where reps already talk all day.",
        },
        {
          number: "3",
          icon: "🤖",
          title: "Automate Admin",
          tag: "Efficiency",
          subtitle: "Let AI handle meeting logging, follow-up drafts, and basic task reminders.",
        },
        {
          number: "4",
          icon: "🚀",
          title: "Coach Reps",
          tag: "Growth",
          subtitle: "Use conversation telemetry to coach reps on objection handling in real time.",
        },
      ]}
    />
  );
}

/** 11. Visual Comparison Matrix: Old Way vs Modern AI Way */
export function ComparisonMatrix({
  title = "Old Manual Process vs. Modern AI Workflow",
  oldWayTitle = "Old Way (Manual & Frustrating)",
  oldWayItems = [],
  newWayTitle = "Modern Way (Simple AI Workflow)",
  newWayItems = [],
}: {
  title?: string;
  oldWayTitle?: string;
  oldWayItems?: string[];
  newWayTitle?: string;
  newWayItems?: string[];
}) {
  return (
    <figure className="my-8 rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-2xs">
      {title && (
        <h3 className="text-base sm:text-lg font-bold text-slate-900 mb-6 text-center" style={{ fontFamily: "var(--font-serif)" }}>
          {title}
        </h3>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Old Way */}
        <div className="rounded-xl border border-rose-200 bg-rose-50/40 p-5">
          <div className="flex items-center gap-2 mb-3 text-rose-950 font-bold text-sm">
            <span className="w-5 h-5 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center text-xs">✕</span>
            <span>{oldWayTitle}</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-rose-900 pl-0 list-none mb-0">
            {oldWayItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-rose-500 font-bold">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* New Way */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/40 p-5">
          <div className="flex items-center gap-2 mb-3 text-emerald-950 font-bold text-sm">
            <span className="w-5 h-5 rounded-full bg-emerald-200 text-emerald-800 flex items-center justify-center text-xs">✓</span>
            <span>{newWayTitle}</span>
          </div>
          <ul className="space-y-2.5 text-xs sm:text-sm text-emerald-900 pl-0 list-none mb-0">
            {newWayItems.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </figure>
  );
}

export interface DataRow {
  label: string;
  value: string;
  context?: string;
  source?: string;
}

export interface DataTableProps {
  title?: string;
  subtitle?: string;
  columns?: string[];
  rows?: string[][];
  caption?: string;
  sourceLabel?: string;
  sourceUrl?: string;
}

/** Generic editorial data table */
export function DataTable({
  title = "Research & Benchmark Data",
  subtitle,
  columns = [],
  rows = [],
  caption,
  sourceLabel,
  sourceUrl,
}: DataTableProps) {
  return (
    <figure className="my-8 overflow-x-auto" aria-label={title}>
      <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50">
          <h3 className="text-sm font-bold text-black m-0" style={{ fontFamily: "var(--font-serif)" }}>
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-gray-500 mt-0.5 m-0">{subtitle}</p>
          )}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm min-w-[500px]">
            <thead>
              <tr className="border-b border-gray-200">
                {columns.map((col, i) => (
                  <th
                    key={i}
                    className="py-2.5 px-4 text-[11px] font-bold uppercase tracking-wider text-gray-500 bg-gray-50"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-gray-50/60 transition-colors">
                  {row.map((cell, ci) => (
                    <td
                      key={ci}
                      className={`py-3 px-4 text-sm ${
                        ci === 0
                          ? "font-semibold text-black"
                          : "text-gray-700"
                      }`}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {(caption || sourceLabel) && (
          <div className="px-5 py-3 border-t border-gray-100 bg-gray-50 flex items-center justify-between gap-4">
            {caption && (
              <p className="text-xs text-gray-500 m-0 italic">{caption}</p>
            )}
            {sourceLabel && (
              <span className="text-[11px] text-gray-400 flex-shrink-0">
                {sourceUrl ? (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline hover:text-gray-600 transition-colors"
                  >
                    Source: {sourceLabel}
                  </a>
                ) : (
                  <>Source: {sourceLabel}</>
                )}
              </span>
            )}
          </div>
        )}
      </div>
    </figure>
  );
}

/** Stat card row */
export function StatGrid({ stats = [] }: { stats?: DataRow[] }) {
  if (!stats || stats.length === 0) return null;
  return (
    <div className="my-6 grid grid-cols-2 md:grid-cols-4 gap-3">
      {stats.map((stat, i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 bg-white p-4 text-center shadow-sm"
        >
          <div className="text-2xl font-bold text-black mb-1" style={{ fontFamily: "var(--font-serif)" }}>
            {stat.value}
          </div>
          <div className="text-xs font-semibold text-gray-700">{stat.label}</div>
          {stat.context && (
            <div className="text-[11px] text-gray-400 mt-0.5">{stat.context}</div>
          )}
        </div>
      ))}
    </div>
  );
}

/** Callout box */
export function Callout({
  type = "info",
  title,
  children,
}: {
  type?: "info" | "warning" | "quote" | "research";
  title?: string;
  children: React.ReactNode;
}) {
  const styles = {
    info: "border-blue-200 bg-blue-50/50 text-blue-950",
    warning: "border-amber-200 bg-amber-50/50 text-amber-950",
    quote: "border-purple-200 bg-purple-50/50 text-purple-950 italic",
    research: "border-slate-300 bg-slate-50 text-slate-900",
  };

  return (
    <aside className={`my-6 p-4 rounded-xl border ${styles[type]} shadow-2xs`}>
      {title && (
        <div className="font-bold text-xs uppercase tracking-wider mb-1.5 opacity-90 not-italic">
          {title}
        </div>
      )}
      <div className="text-sm leading-relaxed">{children}</div>
    </aside>
  );
}

/** Pre-built AEO Ranking Factors table */
export function AEORankingFactors() {
  return (
    <DataTable
      title="AEO Ranking Factors: How AI Search Engines Choose Sources (2026)"
      subtitle="Composite analysis across Perplexity, ChatGPT Search, Gemini, and Google AI Overviews"
      columns={["Factor", "Weight Signal", "Why It Matters", "Simple Action Plan"]}
      rows={[
        ["Direct Q&A Answer Format", "Very High", "AI engines scan for explicit Q&A patterns to generate direct answers", "Open each section with a direct question and 2-sentence direct answer"],
        ["Structured Schema Markup", "Very High", "Helps AI crawlers understand page facts without guessing", "Add FAQ and Article schema to your website pages"],
        ["Primary Source Citations", "High", "Citing trusted research builds authority and trust", "Link to recognized research reports and industry documentation"],
        ["Content Freshness & Dates", "High", "AI engines prefer up-to-date content for time-sensitive topics", "Show clear last-updated dates on your guides"],
        ["Clean Headings (H1/H2/H3)", "High", "Organized headings help AI parse document sections", "Use 1 main title, descriptive subheadings for each topic"],
        ["Clear, Simple Language", "Medium", "AI engines favor content readable by everyday business readers", "Use short sentences, explain acronyms, avoid filler jargon"],
        ["Internal Topic Links", "Medium", "Topic authority is built by linking related guides together", "Link to your related guides and case studies across your site"]
      ]}
      caption="Factors are ranked by frequency of citation in AI engine answers, not by proprietary algorithmic weight."
      sourceLabel="AI Founders Talk Research, 2026"
      sourceUrl="/articles?pillar=aeo-ai-search"
    />
  );
}

// Backward-compatible aliases
export { DataTable as ComparisonTable };