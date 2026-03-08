import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/landing/motion-primitives"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import type { ResolvedSectionUi } from "@/lib/design-system/tokens"
import { resolveCardPresentation } from "@/lib/design-system/component-families"
import {
  DENSITY_ITEM_SPACING,
  DENSITY_GAP,
  DIVIDER_CLASSES,
} from "@/lib/design-system/presentation"
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
  ui,
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
  ui?: ResolvedSectionUi
}) {
  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const hasSubtitle = (subtitle ?? "").trim().length > 0
  const density = ui?.density ?? "standard"
  const dividerMode = ui?.dividerMode ?? "none"
  const dividerClass = dividerMode !== "none" ? DIVIDER_CLASSES[dividerMode] : ""
  const card = resolveCardPresentation(ui, { mode: "compact" })
  const accordionCard = resolveCardPresentation(ui, { mode: "accordion" })

  const headerBlock = (
    <div className="space-y-1">
      {hasEyebrow ? (
        <p className="text-eyebrow text-muted-foreground">
          {eyebrow}
        </p>
      ) : null}
      <SectionHeading id="examples-title" title={title} headingTreatment={ui?.headingTreatment} />
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
        rhythm={ui?.rhythm}
        surface={ui?.surface}
        density={ui?.density}
      >
        <FadeIn>{headerBlock}</FadeIn>
        <StaggerContainer className={cn(DENSITY_ITEM_SPACING[density], dividerClass)}>
          {items.map((item, idx) => (
            <StaggerItem key={`${item.title}-${idx}`}>
              <div
                className={cn(card.cardClass, card.spacing.rootPadding)}
                style={panelStyle}
              >
                <p className="text-sm font-semibold">{item.title}</p>
                {item.bodyHtml?.trim() ? (
                  <div
                    className={cn(card.spacing.gap, "text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                    dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
                  />
                ) : item.body ? (
                  <p className={cn(card.spacing.gap, "text-sm text-muted-foreground")}>{item.body}</p>
                ) : null}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
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
        rhythm={ui?.rhythm}
        surface={ui?.surface}
        density={ui?.density}
      >
        <FadeIn>{headerBlock}</FadeIn>
        <StaggerContainer className={cn("grid grid-cols-1 sm:grid-cols-2", DENSITY_GAP[density])}>
          {items.map((item, idx) => (
            <StaggerItem key={`${item.title}-${idx}`} className="h-full">
              <div
                className={cn(card.cardClass, card.spacing.rootPadding, "h-full flex flex-col")}
                style={panelStyle}
              >
                <p className="text-sm font-semibold">{item.title}</p>
                {item.bodyHtml?.trim() ? (
                  <div
                    className={cn(card.spacing.gap, "text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                    dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
                  />
                ) : item.body ? (
                  <p className={cn(card.spacing.gap, "text-sm text-muted-foreground")}>{item.body}</p>
                ) : null}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
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
        rhythm={ui?.rhythm}
        surface={ui?.surface}
        density={ui?.density}
      >
        <FadeIn>{headerBlock}</FadeIn>
        <StaggerContainer className={cn("grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3", DENSITY_GAP[density])}>
          {items.map((item, idx) => (
            <StaggerItem key={`${item.title}-${idx}`} className="h-full">
              <div
                className={cn(card.cardClass, card.spacing.rootPadding, "h-full flex flex-col")}
                style={panelStyle}
              >
                <p className="text-sm font-semibold">{item.title}</p>
                {item.bodyHtml?.trim() ? (
                  <div
                    className={cn(card.spacing.gap, "text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                    dangerouslySetInnerHTML={{ __html: item.bodyHtml }}
                  />
                ) : item.body ? (
                  <p className={cn(card.spacing.gap, "text-sm text-muted-foreground")}>{item.body}</p>
                ) : null}
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
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
      rhythm={ui?.rhythm}
      surface={ui?.surface}
      density={ui?.density}
    >
      <FadeIn>{headerBlock}</FadeIn>

      <Accordion
        type="single"
        collapsible
        className={cn(accordionCard.cardClass, accordionCard.spacing.rootPadding, dividerClass)}
        style={panelStyle}
      >
        {items.map((item) => (
          <AccordionItem key={item.title} value={item.title}>
            <AccordionTrigger className={cn("text-sm sm:text-base", accordionCard.spacing.headerPadding)}>
              {item.title}
            </AccordionTrigger>
            <AccordionContent className={cn("text-muted-foreground", accordionCard.spacing.bodyPadding)}>
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
