import { FaqSection } from "@/components/landing/faq-section"
import { FinalCtaSection } from "@/components/landing/final-cta-section"
import { HeroSection } from "@/components/landing/hero-section"
import { HowItWorksSection } from "@/components/landing/how-it-works-section"
import { SiteHeader, type HeaderNavLink } from "@/components/landing/site-header"
import { TechStackSection } from "@/components/landing/tech-stack-section"
import { WhatIDeliverSection } from "@/components/landing/what-i-deliver-section"
import { WhyThisApproachSection } from "@/components/landing/why-this-approach-section"
import { WorkflowsSection } from "@/components/landing/workflows-section"
import { getSafeFormatting } from "@/lib/cms/formatting"
import { getPublishedPageBySlug } from "@/lib/cms/get-published-page"
import { tiptapJsonToSanitizedHtml } from "@/lib/cms/rich-text"
import type { CmsPublishedSection, CmsSectionTypeDefault } from "@/lib/cms/types"
import { cn } from "@/lib/utils"

export const dynamic = "force-dynamic"

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
}

function asStringArray(v: unknown): string[] {
  return Array.isArray(v) ? (v as unknown[]).filter((x) => typeof x === "string") as string[] : []
}

function asRecordArray(v: unknown): Record<string, unknown>[] {
  return Array.isArray(v)
    ? (v as unknown[]).filter((x) => x && typeof x === "object" && !Array.isArray(x)) as Record<string, unknown>[]
    : []
}

function isPlainObject(v: unknown): v is Record<string, unknown> {
  return v !== null && typeof v === "object" && !Array.isArray(v)
}

function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>) {
  const out: Record<string, unknown> = { ...base }
  Object.entries(override).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    if (Array.isArray(value)) {
      out[key] = value
      return
    }
    if (isPlainObject(value) && isPlainObject(out[key])) {
      out[key] = deepMerge(out[key] as Record<string, unknown>, value)
      return
    }
    out[key] = value
  })
  return out
}

function pickText(primary: string | null | undefined, fallback: string | null | undefined) {
  const p = (primary ?? "").trim()
  if (p) return p
  const f = (fallback ?? "").trim()
  return f
}

function sectionContainerProps(
  formatting: Record<string, unknown>,
  whitelist: Set<string>,
  sectionKey?: string | null
) {
  const f = getSafeFormatting(formatting, whitelist)
  return {
    sectionId: sectionKey ?? undefined,
    sectionClassName: cn(f.paddingY || "py-6", f.sectionClass),
    containerClassName: cn(
      f.maxWidth || "max-w-5xl",
      f.containerClass,
      f.textAlignClass
    ),
  }
}

export default async function MarketingPage() {
  // TODO(next): Replace this fetch with a DB-backed CRUD admin UI (served under /admin).
  const { sections, tailwindWhitelist, sectionTypeDefaults } =
    await getPublishedPageBySlug("home")

  const header = sections.find((s) => s.section_type === "nav_links") ?? null
  const bodySections = sections.filter((s) => s.section_type !== "nav_links")

  function defaultsFor(type: string): CmsSectionTypeDefault | undefined {
    return sectionTypeDefaults[type as keyof typeof sectionTypeDefaults]
  }

  const headerDefaults = defaultsFor("nav_links")
  const headerContent = deepMerge(
    asRecord(headerDefaults?.default_content),
    asRecord(header?.published.content)
  )

  const headerLinks = asRecordArray(headerContent.links).map(
    (l): HeaderNavLink => ({
      label: asString(l.label),
      href: asString(l.href),
      anchorId: asString(l.anchorId) || undefined,
    })
  )

  const headerCta = {
    label: pickText(header?.published.cta_primary_label, headerDefaults?.default_cta_primary_label) || "Book a 15-min call",
    href: pickText(header?.published.cta_primary_href, headerDefaults?.default_cta_primary_href) || "#contact",
  }

  return (
    <div className="relative min-h-dvh bg-background">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(900px_circle_at_50%_0%,hsl(var(--foreground)/0.10),transparent_55%),radial-gradient(700px_circle_at_50%_100%,hsl(var(--foreground)/0.06),transparent_50%)]"
      />
      {header ? (
        <SiteHeader
          links={headerLinks}
          cta={headerCta}
          containerClassName={cn(
            sectionContainerProps(
              deepMerge(
                asRecord(headerDefaults?.default_formatting),
                asRecord(header.published.formatting)
              ),
              tailwindWhitelist,
              header.key
            ).containerClassName
          )}
        />
      ) : null}

      <main className="pb-10 pt-4">
        {bodySections.map((section) => {
          const v = section.published
          const defaults = defaultsFor(section.section_type)
          const content = deepMerge(
            asRecord(defaults?.default_content),
            asRecord(v.content)
          )
          const formatting = deepMerge(
            asRecord(defaults?.default_formatting),
            asRecord(v.formatting)
          )
          const props = sectionContainerProps(formatting, tailwindWhitelist, section.key)

          switch (section.section_type) {
            case "hero_cta": {
              return (
                <HeroSection
                  key={section.id}
                  {...props}
                  headline={pickText(v.title, defaults?.default_title)}
                  subheadline={pickText(v.subtitle, defaults?.default_subtitle)}
                  bullets={asStringArray(content.bullets)}
                  primaryCta={{
                    label: pickText(v.cta_primary_label, defaults?.default_cta_primary_label),
                    href: pickText(v.cta_primary_href, defaults?.default_cta_primary_href) || "#contact",
                  }}
                  secondaryCta={{
                    label: pickText(v.cta_secondary_label, defaults?.default_cta_secondary_label),
                    href: pickText(v.cta_secondary_href, defaults?.default_cta_secondary_href) || "#services",
                  }}
                  trustLine={asString(content.trustLine)}
                />
              )
            }
            case "card_grid": {
              const cards = asRecordArray(content.cards).map((c) => ({
                title: asString(c.title),
                text: asString(c.text),
                youGet: asStringArray(c.youGet),
                bestFor: asString(c.bestFor),
              }))
              return (
                <WhatIDeliverSection
                  key={section.id}
                  {...props}
                  title={pickText(v.title, defaults?.default_title)}
                  cards={cards}
                />
              )
            }
            case "steps_list": {
              const steps = asRecordArray(content.steps).map((s) => ({
                title: asString(s.title),
                body: asString(s.body),
              }))
              return (
                <HowItWorksSection
                  key={section.id}
                  {...props}
                  title={pickText(v.title, defaults?.default_title)}
                  steps={steps}
                />
              )
            }
            case "title_body_list": {
              const items = asRecordArray(content.items).map((i) => ({
                title: asString(i.title),
                body: asString(i.body),
              }))
              return (
                <WorkflowsSection
                  key={section.id}
                  {...props}
                  title={pickText(v.title, defaults?.default_title)}
                  items={items}
                />
              )
            }
            case "rich_text_block": {
              const bodyHtml = tiptapJsonToSanitizedHtml(content.bodyRichText)
              return (
                <WhyThisApproachSection
                  key={section.id}
                  {...props}
                  title={pickText(v.title, defaults?.default_title)}
                  heading={pickText(v.subtitle, defaults?.default_subtitle)}
                  bodyHtml={bodyHtml}
                />
              )
            }
            case "label_value_list": {
              const items = asRecordArray(content.items).map((i) => ({
                label: asString(i.label),
                value: asString(i.value),
              }))
              return (
                <TechStackSection
                  key={section.id}
                  {...props}
                  title={pickText(v.title, defaults?.default_title)}
                  items={items}
                />
              )
            }
            case "faq_list": {
              const items = asRecordArray(content.items).map((i) => ({
                question: asString(i.question),
                answerHtml: tiptapJsonToSanitizedHtml(i.answerRichText),
              }))
              return (
                <FaqSection
                  key={section.id}
                  {...props}
                  title={pickText(v.title, defaults?.default_title)}
                  items={items}
                />
              )
            }
            case "cta_block": {
              return (
                <FinalCtaSection
                  key={section.id}
                  {...props}
                  headline={pickText(v.title, defaults?.default_title)}
                  body={asString(content.body)}
                  primaryCta={{
                    label: pickText(v.cta_primary_label, defaults?.default_cta_primary_label),
                    href: pickText(v.cta_primary_href, defaults?.default_cta_primary_href) || "#contact",
                  }}
                  secondaryCta={{
                    label: pickText(v.cta_secondary_label, defaults?.default_cta_secondary_label),
                    href: pickText(v.cta_secondary_href, defaults?.default_cta_secondary_href) || "#services",
                  }}
                />
              )
            }
            default:
              return null
          }
        })}
      </main>
    </div>
  )
}
