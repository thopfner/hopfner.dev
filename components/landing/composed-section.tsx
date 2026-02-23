import type { CSSProperties } from "react"
import Link from "next/link"

import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

type BlockType = "heading" | "subtitle" | "rich_text" | "cards" | "faq" | "image" | "list" | "cta"

type ComposerBlock = {
  id: string
  type: BlockType
  title?: string
  body?: string
  imageUrl?: string
  listStyle?: "basic" | "steps"
  items?: string[]
  steps?: Array<{ title?: string; body?: string }>
  cards?: Array<{ title: string; body: string }>
  faqs?: Array<{ q: string; a: string }>
  ctaPrimaryLabel?: string
  ctaPrimaryHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
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
                            <AccordionContent>{faq.a}</AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    )
                  }

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
                })}
              </div>
            ))}
          </div>
        )
      })}
    </SectionShell>
  )
}
