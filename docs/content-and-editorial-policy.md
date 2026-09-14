# AI Founders Talk — Content Model & Editorial Guidelines

This document outlines the content structure, taxonomic pillars, provenance labeling, and MDX frontmatter standards for **AI Founders Talk**.

---

## 1. Content Pillars & Taxonomy (`src/lib/taxonomy.ts`)

Every published article, talk, guide, and resource maps to one of five core subject pillars:

| Pillar Key | Public Display Label | Scope & Editorial Focus |
| :--- | :--- | :--- |
| `ai-systems` | **AI Systems & Agents** | Multi-agent architectures, tool calling, context engineering, evals, and autonomous enterprise systems. |
| `gtm-revops` | **GTM & RevOps** | Pipeline hygiene, CRM automation, lead scoring, sales engineering workflows, and revenue analytics. |
| `competitive-intel`| **Competitive Intelligence** | Market monitoring, competitor teardowns, win-loss benchmarking, pricing intelligence, and feature tracking. |
| `sales-workflows` | **Sales Workflows** | SDR/AE automation, conversational intelligence, AI copilot integrations, and sales enablement. |
| `business-strategy`| **Business Implementation** | Unit economics, LLM inference cost optimization, security/governance compliance, and enterprise AI ROI. |

---

## 2. Founder Talks Provenance & Editorial Standards

To ensure transparency and ethical compliance, AI Founders Talk enforces unambiguous labeling across all conversational and case study content:

### Approved Labeling Taxonomy
- **Founder Talk**: Public presentation, keynote, or fireside chat delivered by an AI startup founder.
- **Sourced Founder Interview**: Curated third-party video/podcast interview conducted by an external host (e.g. Y Combinator, 20VC, SaaStr).
- **Podcast Conversation**: Public podcast episode featuring AI founders or revenue executives.
- **Conference Talk**: Presentation or panel discussion at an industry conference.
- **Practitioner Perspective**: Technical case study, system breakdown, or workflow teardown from enterprise practitioners.
- **AI Founders Talk Original**: **Strictly reserved** for direct, first-party interviews conducted by the AI Founders Talk editorial team.

### Provenance Guardrails
1. **No Fake Personas**: All author references represent verified real-world identities or our institutional `"editorial-team"`.
2. **No Deceptive First-Party Phrasing**: Never use phrases like *"We spoke with"* or *"Our exclusive interview"* on third-party curated content.
3. **No Full Transcripts**: Never republish full third-party verbatim transcripts. Sourced talks provide structured executive takeaways, architectural diagrams, and key lessons accompanied by official embedded players and direct links.

---

## 3. MDX Frontmatter Standards

### Standard Article Frontmatter (`content/articles/<slug>.mdx`)
```yaml
---
title: "Enterprise Multi-Agent Orchestration: Production Architecture & Evals"
slug: "enterprise-multi-agent-orchestration-evals"
pillar: "ai-systems"
author: "editorial-team"
publishedAt: "2026-09-10"
excerpt: "A technical breakdown of multi-agent orchestration patterns, eval harnesses, and failure recovery in enterprise production environments."
tags: ["ai-agents", "orchestration", "evals", "architecture"]
coverImage: "/images/articles/multi-agent-orchestration.jpg"
coverImageAlt: "Architectural diagram of multi-agent supervisor and worker node hierarchy"
featured: true
readingTime: "8 min read"
citations:
  - url: "https://arxiv.org/abs/2401.00000"
    title: "Evaluating Multi-Agent Systems in Production"
---
```

### Founder Talk Frontmatter (`content/interviews/<slug>.mdx`)
```yaml
---
title: "Building Enterprise AI Agents: Key Takeaways from Jane Doe (Acme AI)"
slug: "building-enterprise-ai-agents-founder-talk"
pillar: "founder-interviews"
author: "editorial-team"
publishedAt: "2026-09-10"
format: "founder-talk"
sourcePublisher: "Y Combinator"
sourceUrl: "https://www.youtube.com/watch?v=EXAMPLE_ID"
embedUrl: "https://www.youtube.com/embed/EXAMPLE_ID"
embeddable: true
speakerName: "Jane Doe"
speakerCompany: "Acme AI"
coverImage: "/images/interviews/cover.jpg"
coverImageAlt: "Jane Doe presenting on stage discussing AI agent architectures"
tags: ["ai-agents", "founder-talk", "b2b-saas"]
featured: false
citations:
  - url: "https://www.youtube.com/watch?v=EXAMPLE_ID"
    title: "Original Video: Jane Doe on Y Combinator"
---
```

---

## 4. Visual Assets & SEO Standards

- **Alt Text Mandatory**: Every image must define descriptive, context-rich `alt` text.
- **Aspect Ratio**: Standard cover images must be optimized for `1200x630px` (1.91:1 ratio) for Open Graph and Twitter summary cards.
- **Licensing**: Transparent attribution recorded in `imageCredit` frontmatter for all external visuals.
