import type { CSSProperties } from "react"
import Link from "next/link"

import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { tiptapJsonToSanitizedHtml } from "@/lib/cms/rich-text"

type BlockType =
  | "heading" | "subtitle" | "rich_text" | "cards" | "faq" | "image" | "list" | "cta"
  | "logo_strip" | "metrics_row" | "badge_group" | "proof_card" | "testimonial"
  | "media_panel" | "workflow_diagram" | "comparison" | "stat_chip_row"

type ComposerBlock = {
  id: string
  type: BlockType
  title?: string
  body?: string
  bodyRichText?: unknown
  imageUrl?: string
  listStyle?: "basic" | "steps"
  items?: string[]
  steps?: Array<{ title?: string; body?: string }>
  cards?: Array<{ title: string; body: string }>
  faqs?: Array<{ q: string; a: string; aRichText?: unknown }>
  ctaPrimaryLabel?: string
  ctaPrimaryHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
  // New block fields
  logos?: Array<{ label: string; imageUrl?: string }>
  metrics?: Array<{ value: string; label: string; icon?: string }>
  badges?: Array<{ text: string; icon?: string }>
  author?: string
  role?: string
  quote?: string
  beforeLabel?: string
  afterLabel?: string
  beforeItems?: string[]
  afterItems?: string[]
  flowSteps?: Array<{ label: string; description?: string }>
  stats?: Array<{ value: string; label: string }>
}

type ComposerColumn = { id: string; blocks: ComposerBlock[] }
type ComposerRow = { id: string; columns: ComposerColumn[] }
type ComposerSchema = {
  tokens?: {
    widthMode?: "content" | "full"
    textAlign?: "left" | "center"
    spacingY?: "py-4" | "py-6" | "py-8" | "py-10"
  }
  rows?: ComposerRow[]
}

function asSchema(raw: Record<string, unknown> | undefined): ComposerSchema {
  return (raw ?? {}) as ComposerSchema
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
}

function withCustomContent(block: ComposerBlock, customBlocks: Record<string, unknown>): ComposerBlock {
  const override = asRecord(customBlocks[block.id])
  return {
    ...block,
    ...override,
  } as ComposerBlock
}

function renderBlock(b: ComposerBlock, panelStyle?: CSSProperties) {
  // --- Original block types ---

  if (b.type === "heading") {
    return (
      <h2
        key={b.id}
        className="text-2xl font-semibold tracking-tight"
        style={{ color: "var(--foreground)" }}
      >
        {b.title || "Heading"}
      </h2>
    )
  }

  if (b.type === "subtitle") {
    return <p key={b.id} className="text-base text-muted-foreground">{b.body || "Subtitle"}</p>
  }

  if (b.type === "rich_text") {
    const html = tiptapJsonToSanitizedHtml(b.bodyRichText)
    if (html) {
      return (
        <div
          key={b.id}
          className={cn("text-sm text-muted-foreground", RICH_TEXT_CLASS)}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )
    }
    return <p key={b.id} className="text-sm text-muted-foreground">{b.body || "Rich text"}</p>
  }

  if (b.type === "image") {
    return b.imageUrl ? (
      // eslint-disable-next-line @next/next/no-img-element
      <img key={b.id} src={b.imageUrl} alt={b.title || "Section image"} className="w-full rounded-md border border-border/60" />
    ) : (
      <div key={b.id} className="rounded-md border border-dashed border-border px-3 py-6 text-sm text-muted-foreground">Image block</div>
    )
  }

  if (b.type === "list") {
    const stepsRaw = Array.isArray(b.steps) ? b.steps : []
    const itemsRaw = Array.isArray(b.items) ? b.items : []
    const items = (stepsRaw.length
      ? stepsRaw.map((step) => ({
          title: (step.title ?? "").trim() || "Step",
          body: (step.body ?? "").trim(),
        }))
      : (itemsRaw.length ? itemsRaw : ["Step 1 | Describe step"]).map((line) => {
          const [title, ...rest] = line.split("|")
          return {
            title: title.trim() || "Step",
            body: rest.join("|").trim(),
          }
        }))

    if (b.listStyle === "basic") {
      return (
        <ul key={b.id} className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
          {items.map((x, i) => <li key={`${b.id}-${i}`}>{x.title}</li>)}
        </ul>
      )
    }

    return (
      <ol key={b.id} className="grid grid-cols-1 gap-4">
        {items.map((step, idx) => (
          <li key={`${b.id}-${idx}`} className="relative">
            <Card className="surface-panel interactive-lift gap-3 py-4" style={panelStyle}>
              <CardContent className="space-y-2 px-4">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="min-w-7 justify-center rounded-full">
                    {idx + 1}
                  </Badge>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">Step {idx + 1}</span>
                </div>
                <div className="space-y-1.5">
                  <p className="text-sm font-medium sm:text-base">{step.title}</p>
                  {step.body ? <p className="text-sm text-muted-foreground">{step.body}</p> : null}
                </div>
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    )
  }

  if (b.type === "cards") {
    const cards = Array.isArray(b.cards) ? b.cards : []
    return (
      <div key={b.id} className="space-y-2">
        {(cards.length ? cards : [{ title: "Card", body: "Card body" }]).map((card, i) => (
          <Card key={`${b.id}-${i}`} className="surface-panel interactive-lift gap-3 py-4" style={panelStyle}>
            <CardHeader className="gap-1 px-4 pb-0">
              <h3 className="text-sm font-semibold leading-none">{card.title}</h3>
              {card.body ? <p className="text-sm text-muted-foreground">{card.body}</p> : null}
            </CardHeader>
            {!card.body ? <CardContent className="px-4" /> : null}
          </Card>
        ))}
      </div>
    )
  }

  if (b.type === "faq") {
    const faqs = Array.isArray(b.faqs) ? b.faqs : []
    const entries = faqs.length ? faqs : [{ q: "Question", a: "Answer" }]
    return (
      <Accordion key={b.id} type="single" collapsible className="surface-panel px-3" style={panelStyle}>
        {entries.map((faq, i) => (
          <AccordionItem key={`${b.id}-${i}`} value={`${b.id}-${i}`}>
            <AccordionTrigger>{faq.q}</AccordionTrigger>
            <AccordionContent>
              {(() => {
                const html = tiptapJsonToSanitizedHtml(faq.aRichText)
                if (html) {
                  return (
                    <div
                      className={cn("text-sm", RICH_TEXT_CLASS)}
                      dangerouslySetInnerHTML={{ __html: html }}
                    />
                  )
                }
                return faq.a
              })()}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    )
  }

  if (b.type === "cta") {
    return (
      <div key={b.id} className="flex flex-wrap items-center gap-2">
        <Button asChild variant="secondary" size="sm">
          <Link href={b.ctaPrimaryHref || "#"}>{b.ctaPrimaryLabel || "Primary"}</Link>
        </Button>
        {b.ctaSecondaryLabel ? (
          <Button asChild size="sm">
            <Link href={b.ctaSecondaryHref || "#"}>{b.ctaSecondaryLabel}</Link>
          </Button>
        ) : null}
      </div>
    )
  }

  // --- New block types ---

  if (b.type === "logo_strip") {
    const logos = Array.isArray(b.logos) ? b.logos : []
    return (
      <div key={b.id} className="space-y-2">
        {b.title ? (
          <p className="text-center text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">{b.title}</p>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-6">
          {logos.map((logo, i) =>
            logo.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={`${b.id}-${i}`}
                src={logo.imageUrl}
                alt={logo.label}
                className="h-6 w-auto object-contain opacity-50 grayscale transition-opacity hover:opacity-80"
              />
            ) : (
              <span key={`${b.id}-${i}`} className="text-xs font-medium text-muted-foreground/60">
                {logo.label}
              </span>
            )
          )}
        </div>
      </div>
    )
  }

  if (b.type === "metrics_row") {
    const metrics = Array.isArray(b.metrics) ? b.metrics : []
    return (
      <div key={b.id} className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {metrics.map((m, i) => (
          <div
            key={`${b.id}-${i}`}
            className="rounded-xl border border-border/50 bg-card/30 p-4 text-center"
            style={panelStyle}
          >
            {m.icon ? <span className="mb-1 block text-xl">{m.icon}</span> : null}
            <p className="text-2xl font-bold tracking-tight">{m.value}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{m.label}</p>
          </div>
        ))}
      </div>
    )
  }

  if (b.type === "badge_group") {
    const badges = Array.isArray(b.badges) ? b.badges : []
    return (
      <div key={b.id} className="flex flex-wrap gap-2">
        {badges.map((badge, i) => (
          <span
            key={`${b.id}-${i}`}
            className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/30 px-3 py-1.5 text-xs font-medium"
            style={panelStyle}
          >
            {badge.icon ? <span>{badge.icon}</span> : null}
            {badge.text}
          </span>
        ))}
      </div>
    )
  }

  if (b.type === "proof_card") {
    return (
      <Card key={b.id} className="surface-panel gap-2 py-4" style={panelStyle}>
        <CardContent className="space-y-2 px-4">
          {b.title ? <p className="text-sm font-semibold">{b.title}</p> : null}
          {b.body ? <p className="text-sm text-muted-foreground">{b.body}</p> : null}
          {b.stats && b.stats.length > 0 ? (
            <div className="flex flex-wrap gap-4 pt-1">
              {b.stats.map((s, i) => (
                <div key={`${b.id}-s-${i}`}>
                  <p className="text-lg font-bold">{s.value}</p>
                  <p className="text-xs text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          ) : null}
        </CardContent>
      </Card>
    )
  }

  if (b.type === "testimonial") {
    return (
      <div
        key={b.id}
        className="rounded-xl border border-border/50 bg-card/30 px-5 py-4"
        style={panelStyle}
      >
        {b.quote ? (
          <blockquote className="text-sm italic text-muted-foreground">
            &ldquo;{b.quote}&rdquo;
          </blockquote>
        ) : null}
        <div className="mt-3 flex items-center gap-2">
          {b.imageUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={b.imageUrl} alt={b.author || ""} className="h-8 w-8 rounded-full object-cover" />
          ) : null}
          <div>
            {b.author ? <p className="text-sm font-medium">{b.author}</p> : null}
            {b.role ? <p className="text-xs text-muted-foreground">{b.role}</p> : null}
          </div>
        </div>
      </div>
    )
  }

  if (b.type === "media_panel") {
    return (
      <div key={b.id} className="space-y-2">
        {b.title ? <p className="text-sm font-medium">{b.title}</p> : null}
        {b.imageUrl ? (
          <div className="overflow-hidden rounded-lg border border-border/40 bg-card/20">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.imageUrl} alt={b.title || ""} className="h-auto w-full" />
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center rounded-lg border border-dashed border-border bg-card/10 text-sm text-muted-foreground/40">
            Media panel
          </div>
        )}
        {b.body ? <p className="text-xs text-muted-foreground">{b.body}</p> : null}
      </div>
    )
  }

  if (b.type === "workflow_diagram") {
    const flowSteps = Array.isArray(b.flowSteps) ? b.flowSteps : []
    return (
      <div key={b.id} className="space-y-2">
        {b.title ? <p className="text-sm font-medium">{b.title}</p> : null}
        <div className="flex flex-col gap-0 sm:flex-row sm:items-center sm:gap-0">
          {flowSteps.map((step, idx) => (
            <div key={`${b.id}-${idx}`} className="flex flex-1 flex-col items-center sm:flex-row">
              <div className="flex w-full flex-1 flex-col rounded-lg border border-border/50 bg-card/30 p-3 text-center">
                <p className="text-sm font-medium">{step.label}</p>
                {step.description ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">{step.description}</p>
                ) : null}
              </div>
              {idx < flowSteps.length - 1 ? (
                <div aria-hidden className="flex items-center justify-center">
                  <span className="block h-3 w-px bg-border/60 sm:h-px sm:w-4" />
                  <span className="hidden text-xs text-muted-foreground/40 sm:block">&#8594;</span>
                  <span className="block text-xs text-muted-foreground/40 sm:hidden">&#8595;</span>
                  <span className="block h-3 w-px bg-border/60 sm:h-px sm:w-4" />
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (b.type === "comparison") {
    const beforeItems = Array.isArray(b.beforeItems) ? b.beforeItems : []
    const afterItems = Array.isArray(b.afterItems) ? b.afterItems : []
    return (
      <div key={b.id} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/50 bg-card/20 p-4" style={panelStyle}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            {b.beforeLabel || "Before"}
          </p>
          <ul className="space-y-1.5">
            {beforeItems.map((item, i) => (
              <li key={`${b.id}-b-${i}`} className="flex items-start gap-2 text-sm text-muted-foreground">
                <span className="mt-0.5 text-red-400/60">&#10005;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-xl border border-accent/30 bg-accent/[0.04] p-4" style={panelStyle}>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-accent/80">
            {b.afterLabel || "After"}
          </p>
          <ul className="space-y-1.5">
            {afterItems.map((item, i) => (
              <li key={`${b.id}-a-${i}`} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 text-green-400/80">&#10003;</span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    )
  }

  if (b.type === "stat_chip_row") {
    const stats = Array.isArray(b.stats) ? b.stats : []
    return (
      <div key={b.id} className="flex flex-wrap items-center justify-center gap-4">
        {stats.map((s, i) => (
          <div
            key={`${b.id}-${i}`}
            className="rounded-lg border border-border/40 bg-card/20 px-4 py-2 text-center"
            style={panelStyle}
          >
            <p className="text-lg font-bold tracking-tight">{s.value}</p>
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{s.label}</p>
          </div>
        ))}
      </div>
    )
  }

  // Fallback for unknown types - render as CTA
  return (
    <div key={b.id} className="flex flex-wrap items-center gap-2">
      <Button asChild variant="secondary" size="sm">
        <Link href={b.ctaPrimaryHref || "#"}>{b.ctaPrimaryLabel || "Primary"}</Link>
      </Button>
      {b.ctaSecondaryLabel ? (
        <Button asChild size="sm">
          <Link href={b.ctaSecondaryHref || "#"}>{b.ctaSecondaryLabel}</Link>
        </Button>
      ) : null}
    </div>
  )
}

export function ComposedSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  schema,
  content,
  title,
  subtitle,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  panelStyle?: CSSProperties
  schema?: Record<string, unknown>
  content?: Record<string, unknown>
  title?: string
  subtitle?: string
}) {
  const s = asSchema(schema)
  const customBlocks = asRecord(content?.customBlocks)
  const rows = Array.isArray(s.rows) ? s.rows : []
  const textAlignClass = s.tokens?.textAlign === "center" ? "text-center" : "text-left"

  return (
    <SectionShell
      id={sectionId}
      sectionClassName={cn(s.tokens?.spacingY ?? "py-6", sectionClassName)}
      sectionStyle={sectionStyle}
      containerClassName={cn(textAlignClass, containerClassName)}
      containerStyle={containerStyle}
    >
      {title?.trim() ? <SectionHeading id={`${sectionId ?? "composed"}-title`} title={title.trim()} /> : null}
      {subtitle?.trim() ? <p className="max-w-3xl text-sm text-muted-foreground sm:text-base">{subtitle.trim()}</p> : null}

      {rows.map((row) => {
        const cols = Array.isArray(row.columns) ? row.columns : []
        const colClass = cols.length >= 3 ? "lg:grid-cols-3" : cols.length === 2 ? "md:grid-cols-2" : "grid-cols-1"

        return (
          <div key={row.id} className={cn("grid grid-cols-1 gap-4", colClass)}>
            {cols.map((col) => (
              <div key={col.id} className="space-y-3">
                {(Array.isArray(col.blocks) ? col.blocks : []).map((rawBlock) => {
                  const b = withCustomContent(rawBlock, customBlocks)
                  return renderBlock(b, panelStyle)
                })}
              </div>
            ))}
          </div>
        )
      })}
    </SectionShell>
  )
}
