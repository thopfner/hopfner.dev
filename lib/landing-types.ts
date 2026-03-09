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
