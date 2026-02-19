export type SectionType =
  | "hero_cta"
  | "card_grid"
  | "steps_list"
  | "title_body_list"
  | "rich_text_block"
  | "label_value_list"
  | "faq_list"
  | "cta_block"

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

const F_LEFT = { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left" }
const F_CENTER = { maxWidth: "max-w-5xl", paddingY: "py-8", textAlign: "center" }

export const BLUEPRINT_SOURCE_PATH =
  "/var/www/html/claw.hopfner.dev/data/openclaw-workspace/public/hopfner-dev-website-blueprint.md"

export const BLUEPRINT_PAGES: PageInput[] = [
  {
    slug: "home",
    title: "Home",
    sections: [
      {
        key: "hero",
        section_type: "hero_cta",
        enabled: true,
        position: 0,
        version: {
          status: "published",
          title: "Turn AI and Automation Into Measurable Business Efficiency",
          subtitle:
            "I help teams map, redesign, and automate business workflows so you reduce operational drag, increase speed, and get more output from the same headcount.",
          cta_primary_label: "Book a Workflow Mapping Call",
          cta_primary_href: "/book-a-call",
          cta_secondary_label: "See Services",
          cta_secondary_href: "/services",
          background_media_url: null,
          formatting: F_CENTER,
          content: {
            bullets: ["20–30 minutes.", "Practical review.", "No fluff."],
            trustLine: "Built for English-speaking SMEs and startups in the Western hemisphere.",
          },
        },
      },
      {
        key: "who-its-for",
        section_type: "title_body_list",
        enabled: true,
        position: 1,
        version: {
          status: "published",
          title: "Who It’s For",
          subtitle: null,
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_LEFT,
          content: {
            items: [
              { title: "SMEs scaling faster than operations can handle", body: "" },
              { title: "Startup teams buried in manual handoffs", body: "" },
              {
                title: "Leaders who need AI adoption to create operational gains",
                body: "Not just demos—repeatable execution.",
              },
            ],
          },
        },
      },
      {
        key: "core-outcomes",
        section_type: "card_grid",
        enabled: true,
        position: 2,
        version: {
          status: "published",
          title: "Core Outcomes",
          subtitle: null,
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_LEFT,
          content: {
            cards: [
              {
                title: "Reduce Process Friction",
                text: "Remove repetitive manual steps across sales, ops, and delivery workflows.",
                image: { url: "", alt: "", widthPx: 240 },
                display: {
                  showTitle: true,
                  showText: true,
                  showImage: false,
                  showYouGet: false,
                  showBestFor: false,
                  youGetMode: "block",
                  bestForMode: "block",
                },
              },
              {
                title: "Accelerate Decision Cycles",
                text: "Turn fragmented data and tasks into automated flows and clearer execution.",
                image: { url: "", alt: "", widthPx: 240 },
                display: {
                  showTitle: true,
                  showText: true,
                  showImage: false,
                  showYouGet: false,
                  showBestFor: false,
                  youGetMode: "block",
                  bestForMode: "block",
                },
              },
              {
                title: "Increase Team Leverage",
                text: "Free your team from admin work so they focus on high-value tasks.",
                image: { url: "", alt: "", widthPx: 240 },
                display: {
                  showTitle: true,
                  showText: true,
                  showImage: false,
                  showYouGet: false,
                  showBestFor: false,
                  youGetMode: "block",
                  bestForMode: "block",
                },
              },
            ],
          },
        },
      },
      {
        key: "service-snapshot",
        section_type: "card_grid",
        enabled: true,
        position: 3,
        version: {
          status: "published",
          title: "Service Snapshot",
          subtitle: null,
          cta_primary_label: "See Services",
          cta_primary_href: "/services",
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_LEFT,
          content: {
            cards: [
              { title: "Workflow Automation", text: "End-to-end automation of repetitive business workflows.", image: { url: "", alt: "", widthPx: 240 }, display: { showTitle: true, showText: true, showImage: false, showYouGet: false, showBestFor: false, youGetMode: "block", bestForMode: "block" } },
              { title: "Enterprise AI & Automation Adoption", text: "Strategic rollout support so AI and automation are actually used by teams.", image: { url: "", alt: "", widthPx: 240 }, display: { showTitle: true, showText: true, showImage: false, showYouGet: false, showBestFor: false, youGetMode: "block", bestForMode: "block" } },
              { title: "Enterprise Efficiency Programs", text: "Efficiency-focused transformation across key operational workflows.", image: { url: "", alt: "", widthPx: 240 }, display: { showTitle: true, showText: true, showImage: false, showYouGet: false, showBestFor: false, youGetMode: "block", bestForMode: "block" } },
            ],
          },
        },
      },
      {
        key: "how-engagements-work",
        section_type: "steps_list",
        enabled: true,
        position: 4,
        version: {
          status: "published",
          title: "How Engagements Work",
          subtitle: null,
          cta_primary_label: "Book Your Optimization Review",
          cta_primary_href: "/book-a-call",
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_LEFT,
          content: {
            steps: [
              { title: "Workflow Mapping", body: "" },
              { title: "Opportunity Prioritization", body: "" },
              { title: "Build + Integrate", body: "" },
              { title: "Optimize + Scale", body: "" },
            ],
          },
        },
      },
      {
        key: "trust-proof",
        section_type: "label_value_list",
        enabled: true,
        position: 5,
        version: {
          status: "published",
          title: "Proof Metrics (Placeholder)",
          subtitle: null,
          cta_primary_label: null,
          cta_primary_href: null,
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_LEFT,
          content: {
            items: [
              { label: "Workflows built", value: "Add your metric" },
              { label: "Average time saved per process", value: "Add your metric" },
              { label: "Tools/platforms integrated", value: "Add your metric" },
              { label: "Industries served", value: "Add your metric" },
            ],
          },
        },
      },
      {
        key: "final-cta",
        section_type: "cta_block",
        enabled: true,
        position: 6,
        version: {
          status: "published",
          title: "Ready to find your highest-ROI automation opportunities?",
          subtitle: null,
          cta_primary_label: "Book a Workflow Mapping Call",
          cta_primary_href: "/book-a-call",
          cta_secondary_label: null,
          cta_secondary_href: null,
          background_media_url: null,
          formatting: F_CENTER,
          content: { body: "Practical recommendations you can implement fast." },
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
