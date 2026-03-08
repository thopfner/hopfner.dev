export type SectionType =
  | "hero_cta"
  | "card_grid"
  | "steps_list"
  | "title_body_list"
  | "rich_text_block"
  | "label_value_list"
  | "faq_list"
  | "cta_block"
  | "nav_links"
  | "footer_grid"

export type SectionInput = {
  key: string | null
  section_type: SectionType
  enabled: boolean
  position: number
  version: {
    status: "published"
    title: string | null
    subtitle: string | null
    cta_primary_label: string | null
    cta_primary_href: string | null
    cta_secondary_label: string | null
    cta_secondary_href: string | null
    background_media_url: string | null
    formatting: Record<string, unknown>
    content: Record<string, unknown>
  }
}

export type PageInput = {
  slug: string
  title: string
  sections: SectionInput[]
}

const F_NAV = { maxWidth: "max-w-5xl", paddingY: "py-4", textAlign: "left", widthMode: "content" }
const F_HERO = { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "center", sectionRhythm: "hero", sectionSurface: "spotlight_stage", headingTreatment: "display", widthMode: "full" }
const F_PROOF = { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left", sectionRhythm: "proof", cardFamily: "proof", cardChrome: "outlined", contentDensity: "tight" }
const F_SERVICE = { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left", sectionRhythm: "standard", cardFamily: "service", cardChrome: "elevated", contentDensity: "airy", sectionSurface: "spotlight_stage", accentRule: "left", gridGap: "wide" }
const F_PROCESS = { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left", sectionRhythm: "standard", cardFamily: "process", cardChrome: "outlined", accentRule: "left", labelStyle: "mono" }
const F_COMPACT = { maxWidth: "max-w-5xl", paddingY: "py-4", textAlign: "left", sectionRhythm: "compact", contentDensity: "tight", labelStyle: "mono" }
const F_CTA = { maxWidth: "max-w-5xl", paddingY: "py-8", textAlign: "center", sectionRhythm: "cta", sectionSurface: "contrast_band", headingTreatment: "display" }
const F_LEFT = { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left" }
const F_CENTER = { maxWidth: "max-w-5xl", paddingY: "py-8", textAlign: "center" }

// Elite formatting presets for home page sections
const F_WHO = { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left", sectionRhythm: "standard", sectionSurface: "soft_band", headingTreatment: "gradient", cardFamily: "quiet", cardChrome: "outlined", contentDensity: "standard", accentRule: "top" }
const F_OUTCOMES = { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left", sectionRhythm: "proof", sectionSurface: "soft_band", cardFamily: "proof", cardChrome: "outlined", contentDensity: "standard", labelStyle: "pill", accentRule: "inline", gridGap: "wide" }
const F_TIMELINE = { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left", sectionRhythm: "standard", sectionSurface: "none", cardFamily: "process", cardChrome: "outlined", accentRule: "left", labelStyle: "mono", headingTreatment: "mono" }
const F_METRICS = { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "center", sectionRhythm: "proof", sectionSurface: "accent_glow", headingTreatment: "gradient_accent", cardFamily: "metric", cardChrome: "flat", contentDensity: "standard" }
const F_FINAL_CTA = { maxWidth: "max-w-5xl", paddingY: "py-8", textAlign: "center", sectionRhythm: "cta", sectionSurface: "contrast_band", headingTreatment: "display", cardFamily: "cta", cardChrome: "glow" }

export const BLUEPRINT_SOURCE_PATH =
  "/var/www/html/claw.hopfner.dev/data/openclaw-workspace/public/hopfner-dev-website-blueprint.md"

export const BLUEPRINT_PAGES: PageInput[] = [
  {
    slug: "home",
    title: "Home",
    sections: [
      // ── Navigation ──
      {
        key: "nav",
        section_type: "nav_links",
        enabled: true,
        position: 0,
        version: {
          status: "published",
          title: null,
          subtitle: null,
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_NAV,
          content: {
            logo: { alt: "Site logo", url: "", widthPx: 140 },
            links: [
              { href: "/home", label: "Home", anchorId: "services" },
              { href: "/services", label: "Services", anchorId: "examples" },
              { href: "/process", label: "Processes", anchorId: "faq" },
              { href: "/contact", label: "Contact", anchorId: "contact" },
              { href: "/blog", label: "Blog", anchorId: "" },
            ],
          },
        },
      },
      // ── Hero ── (HIGH energy: spotlight_stage + display heading + terminal mockup)
      {
        key: "hero",
        section_type: "hero_cta",
        enabled: true,
        position: 1,
        version: {
          status: "published",
          title: "Turn AI and Automation Into Measurable Business Efficiency",
          subtitle:
            "I help teams map, redesign, and automate business workflows — reducing operational drag, increasing speed, and getting more output from the same headcount.",
          cta_primary_label: "Book a Workflow Mapping Call",
          cta_primary_href: "/book-a-call",
          cta_secondary_label: "See Services",
          cta_secondary_href: "/services",
          background_media_url: null,
          formatting: F_HERO,
          content: {
            eyebrow: "AI & Automation Consulting",
            layoutVariant: "split",
            proofPanel: {
              type: "mockup",
              headline: "",
              mockupVariant: "terminal",
              items: [
                { label: "hopfner analyze --workflows", value: "\u2192 Scanning 47 business processes..." },
                { label: "", value: "\u2192 Found 12 automation opportunities" },
                { label: "", value: "\u2192 Estimated efficiency gain: 340 hrs/quarter" },
                { label: "hopfner deploy --priority high", value: "\u2713 Workflow automation deployed" },
                { label: "", value: "\u2713 Integration tests passed" },
                { label: "", value: "\u2713 Monitoring active" },
              ],
            },
            heroStats: [
              { value: "50+", label: "Workflows" },
              { value: "40%", label: "Time saved" },
              { value: "95%", label: "Retention" },
            ],
            trustItems: [
              { text: "No long-term contracts" },
              { text: "ROI-focused delivery" },
              { text: "SME & startup specialists" },
            ],
            trustLine: "Built for teams who need execution, not theory.",
            bullets: [],
          },
        },
      },
      // ── Who It’s For ── (LOW energy: soft_band + gradient heading + cards layout)
      {
        key: "who-its-for",
        section_type: "title_body_list",
        enabled: true,
        position: 2,
        version: {
          status: "published",
          title: "Who It’s For",
          subtitle: "Teams that need operational leverage, not slide decks.",
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_WHO,
          content: {
            layoutVariant: "cards",
            items: [
              {
                title: "SMEs Scaling Faster Than Operations Can Handle",
                body: "Your team is growing but your processes haven’t kept up. Manual handoffs, context switching, and tribal knowledge are creating bottlenecks that compound every quarter.",
              },
              {
                title: "Startup Teams Buried in Manual Handoffs",
                body: "You’re spending engineering hours on repeatable tasks that should be automated. Every manual step is a risk to speed and quality.",
              },
              {
                title: "Leaders Driving AI Adoption for Real Gains",
                body: "You’ve seen the demos — now you need repeatable execution. Practical AI integration that your team actually uses, with measurable outcomes tied to business KPIs.",
              },
            ],
          },
        },
      },
      // ── Core Outcomes ── (MEDIUM energy: soft_band + proof/outlined cards + pill labels)
      {
        key: "core-outcomes",
        section_type: "card_grid",
        enabled: true,
        position: 3,
        version: {
          status: "published",
          title: "Core Outcomes",
          subtitle: null,
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_OUTCOMES,
          content: {
            eyebrow: "What You Get",
            sectionVariant: "value_pillars",
            cards: [
              {
                title: "Reduce Process Friction",
                text: "Remove repetitive manual steps across sales, ops, and delivery workflows. Fewer touches per transaction, fewer errors per cycle.",
                icon: "⚡",
                image: { url: "", alt: "", widthPx: 240 },
                display: { showTitle: true, showText: true, showImage: false, showYouGet: false, showBestFor: false, youGetMode: "block", bestForMode: "block" },
              },
              {
                title: "Accelerate Decision Cycles",
                text: "Turn fragmented data and tasks into automated flows and clearer execution paths. Decisions that took days now take hours.",
                icon: "📈",
                image: { url: "", alt: "", widthPx: 240 },
                display: { showTitle: true, showText: true, showImage: false, showYouGet: false, showBestFor: false, youGetMode: "block", bestForMode: "block" },
              },
              {
                title: "Increase Team Leverage",
                text: "Free your team from admin work so they focus on high-value tasks. Same headcount, measurably more output.",
                icon: "🔧",
                image: { url: "", alt: "", widthPx: 240 },
                display: { showTitle: true, showText: true, showImage: false, showYouGet: false, showBestFor: false, youGetMode: "block", bestForMode: "block" },
              },
            ],
          },
        },
      },
      // ── Service Snapshot ── (HIGH energy: spotlight_stage + service/elevated + airy + youGet)
      {
        key: "service-snapshot",
        section_type: "card_grid",
        enabled: true,
        position: 4,
        version: {
          status: "published",
          title: "Services",
          subtitle: "Practical AI and automation systems — scoped, built, and deployed.",
          cta_primary_label: "Explore Services",
          cta_primary_href: "/services",
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_SERVICE,
          content: {
            eyebrow: "What I Do",
            sectionVariant: "services",
            cards: [
              {
                title: "Workflow Automation",
                text: "End-to-end automation of repetitive, cross-functional workflows. Less manual work, fewer errors, faster cycle times.",
                youGet: ["Process mapping & redesign", "Automation build & deploy", "Integration with existing tools", "Monitoring & optimization"],
                bestFor: "Teams with repeatable processes that consume 10+ hours/week",
                image: { url: "", alt: "", widthPx: 240 },
                display: { showTitle: true, showText: true, showImage: false, showYouGet: true, showBestFor: true, youGetMode: "list", bestForMode: "block" },
              },
              {
                title: "AI & Automation Adoption",
                text: "Strategic rollout support so AI and automation tools are actually used by teams — not just purchased.",
                youGet: ["Readiness assessment", "Governance framework", "Role-based enablement", "Adoption tracking"],
                bestFor: "Organizations with AI tools but inconsistent usage",
                image: { url: "", alt: "", widthPx: 240 },
                display: { showTitle: true, showText: true, showImage: false, showYouGet: true, showBestFor: true, youGetMode: "list", bestForMode: "block" },
              },
              {
                title: "Enterprise Efficiency Programs",
                text: "Efficiency-focused transformation across key operational workflows. Measurable gains in speed, quality, and capacity.",
                youGet: ["Bottleneck analysis", "Process redesign", "Automation roadmap", "KPI framework"],
                bestFor: "Operations teams tracking cycle time, throughput, or error rates",
                image: { url: "", alt: "", widthPx: 240 },
                display: { showTitle: true, showText: true, showImage: false, showYouGet: true, showBestFor: true, youGetMode: "list", bestForMode: "block" },
              },
            ],
          },
        },
      },
      // ── How Engagements Work ── (LOW energy: none surface + timeline + mono heading)
      {
        key: "how-engagements-work",
        section_type: "steps_list",
        enabled: true,
        position: 5,
        version: {
          status: "published",
          title: "How Engagements Work",
          subtitle: "A structured path from diagnosis to measurable operational gains.",
          cta_primary_label: "Book Your Optimization Review",
          cta_primary_href: "/book-a-call",
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_TIMELINE,
          content: {
            layoutVariant: "timeline",
            steps: [
              {
                title: "Workflow Mapping",
                body: "Map current-state processes, identify bottlenecks, and document where time and quality are being lost. You get a clear operational baseline.",
              },
              {
                title: "Opportunity Prioritization",
                body: "Rank automation and redesign opportunities by ROI, complexity, and speed-to-impact. Focus resources on the highest-leverage changes first.",
              },
              {
                title: "Build + Integrate",
                body: "Implement practical automations and AI-enabled workflows. Test, validate edge cases, and deploy with your existing tool stack.",
              },
              {
                title: "Optimize + Scale",
                body: "Run a tuning cadence to improve workflows, resolve drift, and expand automation scope. Track KPIs to prove and compound gains.",
              },
            ],
          },
        },
      },
      // ── Trust Proof ── (MEDIUM-HIGH energy: accent_glow + gradient_accent heading + metrics_grid)
      {
        key: "trust-proof",
        section_type: "label_value_list",
        enabled: true,
        position: 6,
        version: {
          status: "published",
          title: "Proven Track Record",
          subtitle: null,
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_METRICS,
          content: {
            layoutVariant: "metrics_grid",
            items: [
              { label: "Workflows automated", value: "50+" },
              { label: "Avg time saved per process", value: "40%" },
              { label: "Client retention rate", value: "95%" },
              { label: "Platforms integrated", value: "30+" },
            ],
          },
        },
      },
      // ── Final CTA ── (HIGH energy: contrast_band + display heading + high_contrast layout)
      {
        key: "final-cta",
        section_type: "cta_block",
        enabled: true,
        position: 7,
        version: {
          status: "published",
          title: "Ready to Find Your Highest-ROI Automation Opportunities?",
          subtitle: null,
          cta_primary_label: "Book a Workflow Mapping Call",
          cta_primary_href: "/book-a-call",
          cta_secondary_label: "See Services",
          cta_secondary_href: "/services",
          background_media_url: null,
          formatting: F_FINAL_CTA,
          content: {
            layoutVariant: "high_contrast",
            body: "In one focused call, we’ll identify bottlenecks, shortlist automation opportunities, and define practical next steps. No generic strategy deck — you leave with concrete actions.",
          },
        },
      },
    ],
  },
  {
    slug: "services",
    title: "Services",
    sections: [
      {
        key: "intro",
        section_type: "rich_text_block",
        enabled: true,
        position: 0,
        version: {
          status: "published",
          title: "Services",
          subtitle: "Practical AI + automation systems for measurable efficiency improvements.",
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_LEFT,
          content: {
            bodyRichText: {
              type: "doc",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "I design and deploy practical AI + automation systems for teams that want speed, reliability, and measurable efficiency improvements." }] },
              ],
            },
          },
        },
      },
      {
        key: "service-cards",
        section_type: "card_grid",
        enabled: true,
        position: 1,
        version: {
          status: "published",
          title: "Service Snapshot",
          subtitle: null,
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_LEFT,
          content: {
            cards: [
              { title: "Workflow Automation", text: "End-to-end automation of repetitive, cross-functional workflows. Outcome: less manual work, fewer errors, faster cycle times.", image: { url: "", alt: "", widthPx: 240 }, display: { showTitle: true, showText: true, showImage: false, showYouGet: false, showBestFor: false, youGetMode: "block", bestForMode: "block" } },
              { title: "Enterprise AI & Automation Adoption", text: "Readiness, prioritization, governance guardrails, and enablement. Outcome: faster adoption and reduced implementation risk.", image: { url: "", alt: "", widthPx: 240 }, display: { showTitle: true, showText: true, showImage: false, showYouGet: false, showBestFor: false, youGetMode: "block", bestForMode: "block" } },
              { title: "Enterprise Efficiency Programs", text: "Process audits, bottleneck analysis, automation roadmap, and KPI tracking. Outcome: measurable operational efficiency.", image: { url: "", alt: "", widthPx: 240 }, display: { showTitle: true, showText: true, showImage: false, showYouGet: false, showBestFor: false, youGetMode: "block", bestForMode: "block" } },
            ],
          },
        },
      },
      {
        key: "cta",
        section_type: "cta_block",
        enabled: true,
        position: 2,
        version: {
          status: "published",
          title: "Need clarity on where to start?",
          subtitle: null,
          cta_primary_label: "Book a Workflow Mapping Call",
          cta_primary_href: "/book-a-call",
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_CENTER,
          content: { body: "Built for operators who need execution, not theory." },
        },
      },
    ],
  },
  {
    slug: "workflow-automation",
    title: "Workflow Automation",
    sections: [
      { key: "problem-framing", section_type: "rich_text_block", enabled: true, position: 0, version: { status: "published", title: "Your team is spending too much time on repeatable processes.", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { bodyRichText: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Manual handoffs, repetitive updates, and delayed approvals compound into operational drag." }] }] } } } },
      { key: "what-gets-automated", section_type: "title_body_list", enabled: true, position: 1, version: { status: "published", title: "What Gets Automated", subtitle: "Prioritized workflow categories", cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { items: [{ title: "Lead routing", body: "Move qualified leads to the right owner instantly." }, { title: "Onboarding", body: "Standardize data collection, handoffs, and kickoff steps." }, { title: "Reporting", body: "Auto-generate recurring summaries and KPI updates." }, { title: "Approvals & alerts", body: "Trigger the right reviews with clear escalation paths." }] } } },
      { key: "implementation-approach", section_type: "steps_list", enabled: true, position: 2, version: { status: "published", title: "Implementation Approach", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { steps: [{ title: "Discovery", body: "Map current-state process and constraints." }, { title: "Design", body: "Define target workflow and automation logic." }, { title: "Build + QA", body: "Implement, test, and validate edge cases." }, { title: "Deployment", body: "Launch with monitoring and owner handoff." }] } } },
      { key: "integrations-stack", section_type: "label_value_list", enabled: true, position: 3, version: { status: "published", title: "Integrations & Stack", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { items: [{ label: "CRM", value: "Add your real tools" }, { label: "Project / work management", value: "Add your real tools" }, { label: "Communication", value: "Add your real tools" }, { label: "Data / BI", value: "Add your real tools" }] } } },
      { key: "expected-outcomes", section_type: "card_grid", enabled: true, position: 4, version: { status: "published", title: "Expected Outcomes", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { cards: [{ title: "Time saved", text: "Reduce repetitive admin work per workflow.", image: { url: "", alt: "", widthPx: 240 }, display: { showTitle: true, showText: true, showImage: false, showYouGet: false, showBestFor: false, youGetMode: "block", bestForMode: "block" } }, { title: "Error reduction", text: "Replace fragile manual steps with consistent automation.", image: { url: "", alt: "", widthPx: 240 }, display: { showTitle: true, showText: true, showImage: false, showYouGet: false, showBestFor: false, youGetMode: "block", bestForMode: "block" } }, { title: "Throughput increase", text: "Move more work through the same team capacity.", image: { url: "", alt: "", widthPx: 240 }, display: { showTitle: true, showText: true, showImage: false, showYouGet: false, showBestFor: false, youGetMode: "block", bestForMode: "block" } }] } } },
      { key: "faq", section_type: "faq_list", enabled: true, position: 5, version: { status: "published", title: "Workflow Automation FAQ", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { items: [{ question: "How long does implementation take?", answer: "Most initial workflows ship in a few weeks depending on scope and integrations." }, { question: "How much team involvement is needed?", answer: "A process owner and one technical contact are usually enough for fast execution." }, { question: "Do you provide maintenance?", answer: "Yes. We can set a lightweight optimization cadence to keep workflows healthy." }] } } },
      { key: "cta", section_type: "cta_block", enabled: true, position: 6, version: { status: "published", title: "Bring one messy workflow to the call.", subtitle: "We’ll map it live and identify optimization opportunities.", cta_primary_label: "Book a Workflow Mapping Call", cta_primary_href: "/book-a-call", cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_CENTER, content: { body: "Practical recommendations you can implement fast." } } },
    ],
  },
  {
    slug: "enterprise-ai-automation-adoption",
    title: "Enterprise AI & Automation Adoption",
    sections: [
      { key: "why-adoption-fails", section_type: "title_body_list", enabled: true, position: 0, version: { status: "published", title: "Why Adoption Fails", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { items: [{ title: "Scattered pilots", body: "Experiments happen, but nothing becomes operational." }, { title: "No operating model", body: "Unclear ownership and execution cadence stall adoption." }, { title: "Weak accountability", body: "No governance or success metrics tied to adoption." }] } } },
      { key: "adoption-framework", section_type: "steps_list", enabled: true, position: 1, version: { status: "published", title: "Adoption Framework", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { steps: [{ title: "Readiness", body: "Assess process, data, and team fit." }, { title: "Governance", body: "Define guardrails, ownership, and controls." }, { title: "Enablement", body: "Train teams with practical role-based workflows." }, { title: "Rollout", body: "Sequence implementation for reliable adoption." }] } } },
      { key: "engagement-deliverables", section_type: "title_body_list", enabled: true, position: 2, version: { status: "published", title: "Engagement Deliverables", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { items: [{ title: "Adoption roadmap", body: "Pragmatic phases and owners." }, { title: "Priority use cases", body: "Shortlist tied to measurable outcomes." }, { title: "Implementation plan", body: "Execution timeline with checkpoints." }] } } },
      { key: "change-management", section_type: "rich_text_block", enabled: true, position: 3, version: { status: "published", title: "Change Management & Enablement", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { bodyRichText: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Adoption improves when teams have clear operating rhythms, practical training, and explicit ownership." }] }] } } } },
      { key: "risk-controls", section_type: "label_value_list", enabled: true, position: 4, version: { status: "published", title: "Risk and Controls", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { items: [{ label: "Compliance", value: "Document role-based access and usage policy" }, { label: "Safety", value: "Define human review and escalation paths" }, { label: "Quality", value: "Track adoption and output quality metrics" }] } } },
      { key: "faq", section_type: "faq_list", enabled: true, position: 5, version: { status: "published", title: "Adoption FAQ", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { items: [{ question: "Can this work if we already bought AI tools?", answer: "Yes. This service focuses on consistent operational usage, not just tool selection." }, { question: "Do you support governance setup?", answer: "Yes. Governance and guardrails are a core part of the rollout framework." }] } } },
      { key: "cta", section_type: "cta_block", enabled: true, position: 6, version: { status: "published", title: "If your team has AI tools but inconsistent usage, this is the fastest path to operational adoption.", subtitle: null, cta_primary_label: "Book a Workflow Mapping Call", cta_primary_href: "/book-a-call", cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_CENTER, content: { body: "Built for operators who need execution, not theory." } } },
    ],
  },
  {
    slug: "enterprise-efficiency-programs",
    title: "Enterprise Efficiency Programs",
    sections: [
      { key: "efficiency-baseline", section_type: "rich_text_block", enabled: true, position: 0, version: { status: "published", title: "Efficiency Baseline", subtitle: "Where execution time is currently lost", cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { bodyRichText: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Start with a clear baseline for cycle time, bottlenecks, and manual overhead." }] }] } } } },
      { key: "bottleneck-mapping", section_type: "title_body_list", enabled: true, position: 1, version: { status: "published", title: "Bottleneck Mapping", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { items: [{ title: "Handoffs", body: "Find where ownership changes slow execution." }, { title: "Approvals", body: "Remove unnecessary gates and waiting time." }, { title: "Context switching", body: "Reduce fragmented work across tools." }, { title: "Data silos", body: "Connect systems so teams work from one flow." }] } } },
      { key: "intervention-plan", section_type: "steps_list", enabled: true, position: 2, version: { status: "published", title: "Intervention Plan", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { steps: [{ title: "Redesign", body: "Simplify process steps and ownership." }, { title: "Automate", body: "Implement high-impact workflow automation." }, { title: "Operate", body: "Install execution cadence and accountability." }] } } },
      { key: "kpi-framework", section_type: "label_value_list", enabled: true, position: 3, version: { status: "published", title: "KPI Framework", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { items: [{ label: "Cycle time", value: "Track end-to-end completion speed" }, { label: "Error rates", value: "Measure quality and rework reduction" }, { label: "Throughput", value: "Monitor completed work volume" }, { label: "Team capacity", value: "Measure high-value time regained" }] } } },
      { key: "optimization-cadence", section_type: "rich_text_block", enabled: true, position: 4, version: { status: "published", title: "Optimization Cadence", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { bodyRichText: { type: "doc", content: [{ type: "paragraph", content: [{ type: "text", text: "Run a monthly tuning cycle to improve workflows, resolve drift, and expand automation scope." }] }] } } } },
      { key: "faq", section_type: "faq_list", enabled: true, position: 5, version: { status: "published", title: "Efficiency Program FAQ", subtitle: null, cta_primary_label: null, cta_primary_href: null, cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_LEFT, content: { items: [{ question: "How quickly can we see impact?", answer: "Most teams see early wins once top bottlenecks are removed in the first implementation cycle." }, { question: "Can this run with existing tools?", answer: "Yes. The program is designed to improve outcomes with your current stack where possible." }] } } },
      { key: "cta", section_type: "cta_block", enabled: true, position: 6, version: { status: "published", title: "Ready to increase execution velocity across your operations?", subtitle: null, cta_primary_label: "Book a Workflow Mapping Call", cta_primary_href: "/book-a-call", cta_secondary_label: null, cta_secondary_href: null, background_media_url: null, formatting: F_CENTER, content: { body: "Focus on measurable gains in speed, quality, and capacity." } } },
    ],
  },
  {
    slug: "process",
    title: "Process",
    sections: [
      {
        key: "process-steps",
        section_type: "steps_list",
        enabled: true,
        position: 0,
        version: {
          status: "published",
          title: "How We Work",
          subtitle: null,
          cta_primary_label: "Book a Workflow Mapping Call",
          cta_primary_href: "/book-a-call",
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_LEFT,
          content: {
            steps: [
              { title: "Diagnose", body: "Map current workflows and identify bottlenecks." },
              { title: "Prioritize", body: "Rank opportunities by ROI, complexity, and speed-to-impact." },
              { title: "Implement", body: "Build practical automations + AI-enabled workflows." },
              { title: "Operationalize", body: "Adoption support, team enablement, KPI tracking." },
              { title: "Optimize", body: "Iterative improvements and scale-out roadmap." },
            ],
          },
        },
      },
    ],
  },
  {
    slug: "case-studies",
    title: "Case Studies",
    sections: [
      {
        key: "intro",
        section_type: "rich_text_block",
        enabled: true,
        position: 0,
        version: {
          status: "published",
          title: "Operational results, not theory.",
          subtitle: null,
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_LEFT,
          content: {
            bodyRichText: {
              type: "doc",
              content: [
                { type: "paragraph", content: [{ type: "text", text: "Start with selected engagement outcomes using anonymized data until full case studies are ready." }] },
              ],
            },
          },
        },
      },
      {
        key: "template",
        section_type: "title_body_list",
        enabled: true,
        position: 1,
        version: {
          status: "published",
          title: "Case Study Template",
          subtitle: null,
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_LEFT,
          content: {
            items: [
              { title: "Client profile", body: "Industry, company size." },
              { title: "Initial challenge", body: "What operational issue was blocking execution." },
              { title: "Implementation", body: "What was built and integrated." },
              { title: "Time-to-value", body: "When outcomes started appearing." },
              { title: "Quantified result", body: "Time saved, cost avoided, or speed increase." },
              { title: "Client quote", body: "Add when available." },
            ],
          },
        },
      },
      {
        key: "cta",
        section_type: "cta_block",
        enabled: true,
        position: 2,
        version: {
          status: "published",
          title: "Discuss Similar Outcomes for Your Team",
          subtitle: null,
          cta_primary_label: "Book a Workflow Mapping Call",
          cta_primary_href: "/book-a-call",
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_CENTER,
          content: { body: "Focus on measurable gains in speed, quality, and capacity." },
        },
      },
    ],
  },
  {
    slug: "about",
    title: "About",
    sections: [
      {
        key: "about-items",
        section_type: "title_body_list",
        enabled: true,
        position: 0,
        version: {
          status: "published",
          title: "About",
          subtitle: null,
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_LEFT,
          content: {
            items: [
              { title: "Operator profile", body: "Practical AI + automation partner." },
              { title: "Philosophy", body: "Execution-first, measurable outcomes." },
              { title: "Why clients hire", body: "Speed, business-first lens, technical depth." },
              { title: "Working style", body: "Hands-on, no-jargon, ROI-focused." },
            ],
          },
        },
      },
      {
        key: "cta",
        section_type: "cta_block",
        enabled: true,
        position: 1,
        version: {
          status: "published",
          title: "Book a Workflow Mapping Call",
          subtitle: null,
          cta_primary_label: "Book a Workflow Mapping Call",
          cta_primary_href: "/book-a-call",
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_CENTER,
          content: { body: "No generic strategy deck. You leave with concrete actions." },
        },
      },
    ],
  },
  {
    slug: "book-a-call",
    title: "Book a Call",
    sections: [
      {
        key: "hero",
        section_type: "hero_cta",
        enabled: true,
        position: 0,
        version: {
          status: "published",
          title: "Book Your Workflow Mapping & Optimization Review",
          subtitle:
            "In one focused call, we’ll identify operational bottlenecks, shortlist high-impact automation opportunities, and define practical next steps.",
          cta_primary_label: "Book Call Now",
          cta_primary_href: "#book-call-form",
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_CENTER,
          content: {
            bullets: [
              "Quick diagnostic of one core workflow",
              "Prioritized optimization opportunities",
              "Recommended first implementation path",
            ],
            trustLine: "No generic strategy deck. You leave with concrete actions.",
          },
        },
      },
      {
        key: "qualification-fields",
        section_type: "label_value_list",
        enabled: true,
        position: 1,
        version: {
          status: "published",
          title: "Qualification Fields",
          subtitle: null,
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_LEFT,
          content: {
            items: [
              { label: "Company", value: "Required" },
              { label: "Team size", value: "Required" },
              { label: "Current tools", value: "Required" },
              { label: "Main process bottleneck", value: "Required" },
              { label: "Desired outcome in next 90 days", value: "Required" },
            ],
          },
        },
      },
    ],
  },
]
