export type LandingNavItem = {
  label: string
  href: `#${string}`
}

export type LandingContent = {
  nav: {
    items: LandingNavItem[]
    separator: string
    cta: { label: string; href: `#${string}` }
  }
  hero: {
    headline: string
    subheadline: string
    bullets: string[]
    primaryCta: { label: string; href: `#${string}` }
    secondaryCta: { label: string; href: `#${string}` }
    trustLine: string
  }
  whatIDeliver: {
    id: `#${string}`
    title: string
    items: Array<{
      title: string
      text: string
      youGetLabel: string
      youGet: string
      bestForLabel: string
      bestFor: string
    }>
  }
  howItWorks: {
    id: `#${string}`
    title: string
    steps: string[]
  }
  workflows: {
    id: `#${string}`
    title: string
    items: Array<{ title: string; body: string }>
  }
  whyThisApproach: {
    title: string
    heading: string
    body: string
  }
  techStack: {
    title: string
    items: Array<{ label: string; value: string }>
  }
  faq: {
    id: `#${string}`
    title: string
    items: Array<{ q: string; a: string }>
  }
  finalCta: {
    title: string
    headline: string
    body: string
    primaryCta: { label: string; href: `#${string}` }
    secondaryCta: { label: string; href: `#${string}` }
  }
  contact: {
    id: `#${string}`
    title: string
    body: string
    primaryCta: { label: string; href: `#${string}` }
    secondaryCta: { label: string; href: `#${string}` }
  }
}

// TODO(next): Swap this static object for DB-backed content + an admin UI that can CRUD these fields.
export const landingContent = {
  nav: {
    items: [
      { label: "How it works", href: "#how-it-works" },
      { label: "Services", href: "#services" },
      { label: "Examples", href: "#examples" },
      { label: "FAQ", href: "#faq" },
      { label: "Contact", href: "#contact" },
    ],
    separator: "·",
    cta: { label: "Book a 15-min call", href: "#contact" },
  },
  hero: {
    headline: "Ops & Finance Automations for SMEs — shipped in 10 days",
    subheadline:
      "I help finance and operations teams eliminate manual reporting, reconciliations, approvals, and tool-to-tool busywork using n8n + Postgres (and a lightweight web app when you need a UI).",
    bullets: [
      "✅ One workflow end-to-end per sprint (fixed scope, clear outcome)",
      "✅ Audit trail, logging, retries, and alerts included",
      "✅ Automations first; web app only when it truly needs a UI",
    ],
    primaryCta: { label: "Book a 15-min call", href: "#contact" },
    secondaryCta: { label: "Get a 48-hour Automation Audit", href: "#services" },
    trustLine:
      "Built for modern SMEs using tools like Slack/Teams, HubSpot, Stripe, QuickBooks/Xero, Jira, Notion, Google Workspace.",
  },
  whatIDeliver: {
    id: "#services",
    title: "What I deliver",
    items: [
      {
        title: "48-Hour Automation Audit",
        text: "A rapid assessment of one workflow with a prioritized plan and ROI estimate.",
        youGetLabel: "You get:",
        youGet:
          "workflow map · backlog of fixes · architecture sketch · rough hours saved/week",
        bestForLabel: "Best for:",
        bestFor: "deciding what to automate first (and what not to)",
      },
      {
        title: "10-Day Automation Sprint",
        text: "One production-ready workflow shipped end-to-end using n8n + Postgres.",
        youGetLabel: "You get:",
        youGet:
          "automation + monitoring · audit logs · handover docs + walkthrough video",
        bestForLabel: "Best for:",
        bestFor: "removing a recurring bottleneck immediately",
      },
      {
        title: "Ongoing Automation Retainer",
        text: "Monthly improvements + maintenance for your automation layer.",
        youGetLabel: "You get:",
        youGet:
          "new workflows + enhancements · reliability fixes · monitoring and support",
        bestForLabel: "Best for:",
        bestFor: "continuous ops/finance efficiency gains",
      },
    ],
  },
  howItWorks: {
    id: "#how-it-works",
    title: "How it works",
    steps: [
      "Pick one workflow",
      'Confirm scope + success metric (include example: “Reduce weekly reporting from 4 hours to 20 minutes” or “Cut invoice exceptions by 60%.”)',
      "Build & ship (n8n + Postgres, logging/retries/alerts)",
      "Handover + iterate (docs + walkthrough video)",
    ],
  },
  workflows: {
    id: "#examples",
    title: "Common workflows",
    items: [
      {
        title: "Weekly finance reporting pack",
        body: "Pull data from key tools → normalize in Postgres → scheduled report + anomaly alerts.",
      },
      {
        title: "Invoice/payment reconciliation + exception queue",
        body: "Match records → flag mismatches → notify finance → keep an audit trail.",
      },
      {
        title: "Approvals with audit trail (Slack/Teams)",
        body: "Request → approve/deny → log decision → update downstream systems.",
      },
      {
        title: "Customer/vendor onboarding",
        body: "Collect inputs → validate → create records → notify stakeholders → track status.",
      },
      {
        title: "Collections nudges",
        body: "Overdue triggers → reminders + internal escalation → log outcomes.",
      },
      {
        title: "Tool-to-tool integration",
        body: "Connect systems safely with rate limits, retries, and observability.",
      },
    ],
  },
  whyThisApproach: {
    title: "Why this approach",
    heading: "Automations first, UI only when needed.",
    body: "Most SMEs don’t need a full platform on day one. They need the manual work gone, reliably. When a workflow needs a dashboard, queue view, or admin tools, I wrap it in a lightweight Next.js full-stack app.",
  },
  techStack: {
    title: "Tech stack",
    items: [
      { label: "Automations:", value: "n8n" },
      { label: "Data layer:", value: "Postgres" },
      { label: "Web app (when required):", value: "Next.js / React (full stack)" },
      {
        label: "Ops:",
        value: "logging, alerts, retries, role-based access where needed",
      },
    ],
  },
  faq: {
    id: "#faq",
    title: "FAQ",
    items: [
      {
        q: "Do you do design?",
        a: "I don’t provide visual design services. I build clean, functional interfaces using component libraries (like shadcn) and focus on reliability, usability, and speed.",
      },
      {
        q: "How do you price?",
        a: "Most clients start with the 48-Hour Audit, then move into a 10-Day Sprint. Pricing depends on workflow complexity and integrations.",
      },
      {
        q: "What access do you need?",
        a: "Typically tool admin/API access for systems involved in the workflow, plus a process owner who can validate edge cases.",
      },
      {
        q: "How do you handle security?",
        a: "Least-privilege access, audit logs, and no storing of sensitive data unless required. Clear documentation of what runs where.",
      },
      {
        q: "What can be done in 10 days?",
        a: "A single workflow end-to-end, production-ready, with monitoring. If it’s bigger, we break it into sprints.",
      },
    ],
  },
  finalCta: {
    title: "Final CTA",
    headline: "Ready to remove a recurring ops/finance bottleneck?",
    body: "Book a 15-minute call and tell me the workflow that steals the most time each week.",
    primaryCta: { label: "Book a 15-min call", href: "#contact" },
    secondaryCta: { label: "Get the 48-hour Audit", href: "#services" },
  },
  contact: {
    id: "#contact",
    title: "Contact",
    body: "Book a 15-minute call and tell me the workflow that steals the most time each week.",
    primaryCta: { label: "Book a 15-min call", href: "#contact" },
    secondaryCta: { label: "Get the 48-hour Audit", href: "#services" },
  },
} as const satisfies LandingContent

