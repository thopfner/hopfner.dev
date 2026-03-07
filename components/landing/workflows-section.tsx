import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

type LayoutVariant = "accordion" | "stacked" | "two_column" | "cards"

export function WorkflowsSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  title,
  subtitle,
  eyebrow,
  items,
  layoutVariant = "accordion",
  rhythm,
  surface,
  contentDensity,
  dividerMode,
  headingTreatment,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  panelStyle?: CSSProperties
  title: string
  subtitle?: string
  eyebrow?: string
  items: Array<{ title: string; body: string; bodyHtml?: string }>
  layoutVariant?: LayoutVariant
  rhythm?: string
  surface?: string
  contentDensity?: string
  dividerMode?: string
  headingTreatment?: string
}) {
  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const hasSubtitle = (subtitle ?? "").trim().length > 0

  const headerBlock = (
    <div className="space-y-1">
      {hasEyebrow ? (
        <p className="text-eyebrow text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <SectionHeading id="examples-title" title={title} />
      {hasSubtitle ? (
        <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      ) : null}
    </div>
  )

  if (layoutVariant === "stacked") {
    return (
      <SectionShell
        id={sectionId}
        labelledBy="examples-title"
        sectionClassName={sectionClassName}
        sectionStyle={sectionStyle}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
      >
        {headerBlock}
        <div className="space-y-3">
          {items.map((item, idx) => (
            <div
              key={`${item.title}-${idx}`}
              className="rounded-xl border border-border/50 bg-card/30 px-4 py-3"
              style={panelStyle}
            >
              <p className="text-sm font-semibold">{item.title}</p>
              {item.bodyHtml?.trim() ? (
                <div
                  className={cn("mt-1 text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                  dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
                />
              ) : item.body ? (
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              ) : null}
            </div>
          ))}
        </div>
      </SectionShell>
    )
  }

  if (layoutVariant === "two_column") {
    return (
      <SectionShell
        id={sectionId}
        labelledBy="examples-title"
        sectionClassName={sectionClassName}
        sectionStyle={sectionStyle}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
      >
        {headerBlock}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {items.map((item, idx) => (
            <div
              key={`${item.title}-${idx}`}
              className="rounded-xl border border-border/50 bg-card/30 px-4 py-3"
              style={panelStyle}
            >
              <p className="text-sm font-semibold">{item.title}</p>
              {item.bodyHtml?.trim() ? (
                <div
                  className={cn("mt-1 text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                  dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
                />
              ) : item.body ? (
                <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
              ) : null}
            </div>
          ))}
        </div>
      </SectionShell>
    )
  }

  if (layoutVariant === "cards") {
    return (
      <SectionShell
        id={sectionId}
        labelledBy="examples-title"
        sectionClassName={sectionClassName}
        sectionStyle={sectionStyle}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
      >
        {headerBlock}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {items.map((item, idx) => (
            <Card
              key={`${item.title}-${idx}`}
              className="surface-panel interactive-lift gap-2 py-4"
              style={panelStyle}
            >
              <CardContent className="space-y-1 px-4">
                <p className="text-sm font-semibold">{item.title}</p>
                {item.bodyHtml?.trim() ? (
                  <div
                    className={cn("text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                    dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
                  />
                ) : item.body ? (
                  <p className="text-sm text-muted-foreground">{item.body}</p>
                ) : null}
              </CardContent>
            </Card>
          ))}
        </div>
      </SectionShell>
    )
  }

  // Default accordion layout
  return (
    <SectionShell
      id={sectionId}
      labelledBy="examples-title"
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
      rhythm={rhythm as any}
      surface={surface as any}
    >
      {headerBlock}

      <Accordion
        type="single"
        collapsible
        className="surface-panel px-4"
        style={panelStyle}
      >
        {items.map((item) => (
          <AccordionItem key={item.title} value={item.title}>
            <AccordionTrigger className="py-3.5 text-sm sm:text-base">
              {item.title}
            </AccordionTrigger>
            <AccordionContent className="pb-4 text-muted-foreground">
              {item.bodyHtml?.trim() ? (
                <div
                  className={cn("text-sm", RICH_TEXT_CLASS)}
                  dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
                />
              ) : (
                <p className="text-sm">{item.body}</p>
              )}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </SectionShell>
  )
}
