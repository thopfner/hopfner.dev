import { Badge } from "@/components/ui/badge"
import { CardContent } from "@/components/ui/card"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/landing/motion-primitives"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"
import type { ResolvedSectionUi } from "@/lib/design-system/tokens"
import { resolveCardPresentation } from "@/lib/design-system/component-families"
import {
  DENSITY_GAP,
  DENSITY_ITEM_SPACING,
  DIVIDER_CLASSES,
} from "@/lib/design-system/presentation"

type LayoutVariant = "grid" | "timeline" | "connected_flow" | "workflow_visual"

export function HowItWorksSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  title,
  subtitle,
  eyebrow,
  steps,
  layoutVariant = "grid",
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
  steps: Array<{ title: string; body?: string; bodyHtml?: string; icon?: string; stat?: string }>
  layoutVariant?: LayoutVariant
  ui?: ResolvedSectionUi
}) {
  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const hasSubtitle = (subtitle ?? "").trim().length > 0
  const density = ui?.density ?? "standard"
  const dividerMode = ui?.dividerMode ?? "none"

  if (layoutVariant === "timeline") {
    const timelineCard = resolveCardPresentation(ui, { mode: "compact" })
    // Timeline line color intensity: accentRule controls emphasis
    const timelineLineClass =
      ui?.accentRule === "left" || ui?.accentRule === "inline"
        ? "bg-accent/40"
        : ui?.accentRule === "top"
          ? "bg-accent/25"
          : ui?.accentRule === "none"
            ? "bg-border/30"
            : "bg-border/60" // default (unset)

    return (
      <SectionShell
        id={sectionId}
        labelledBy="how-it-works-title"
        sectionClassName={sectionClassName}
        sectionStyle={sectionStyle}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        rhythm={ui?.rhythm}
        surface={ui?.surface}
        density={ui?.density}
      >
        <FadeIn>
          <div className="space-y-1">
            {hasEyebrow ? (
              <p className="text-eyebrow text-muted-foreground">
                {eyebrow}
              </p>
            ) : null}
            <SectionHeading id="how-it-works-title" title={title} headingTreatment={ui?.headingTreatment} />
            {hasSubtitle ? (
              <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </FadeIn>

        <div className="relative">
          {/* Timeline line */}
          <div
            aria-hidden
            className={cn("absolute left-4 top-0 hidden h-full w-px sm:block", timelineLineClass)}
          />
          <StaggerContainer className={cn(DENSITY_ITEM_SPACING[density], "sm:pl-12", dividerMode !== "none" ? DIVIDER_CLASSES[dividerMode] : "")}>
            {steps.map((step, idx) => (
              <StaggerItem key={`${idx}-${step.title}`}>
                <div className="relative">
                  {/* Timeline dot */}
                  <div
                    aria-hidden
                    className="absolute -left-12 top-4 hidden h-3 w-3 rounded-full border-2 border-accent/60 bg-background sm:block"
                    style={{ left: "-2.25rem" }}
                  />
                  <div className={cn(timelineCard.cardClass, timelineCard.spacing.gap, timelineCard.spacing.rootPadding)} style={panelStyle}>
                    <div className={cn(timelineCard.spacing.gap, timelineCard.spacing.bodyPadding)}>
                      <div className="flex items-center gap-2">
                        {ui?.labelStyle === "pill" ? (
                          <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent/20 px-1.5 text-xs font-medium text-accent">
                            {idx + 1}
                          </span>
                        ) : ui?.labelStyle === "mono" ? (
                          <span className="text-label-mono flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
                            {idx + 1}
                          </span>
                        ) : ui?.labelStyle === "micro" ? (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                            {idx + 1}
                          </span>
                        ) : (
                          /* default: mono style preserved from original */
                          <span className="text-label-mono flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
                            {idx + 1}
                          </span>
                        )}
                        <p className="text-sm font-medium sm:text-base">{step.title}</p>
                      </div>
                      {step.bodyHtml?.trim() ? (
                        <div
                          className={cn("pl-8 text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                          dangerouslySetInnerHTML={{ __html: step.bodyHtml }}
                        />
                      ) : step.body ? (
                        <p className="pl-8 text-sm text-muted-foreground">{step.body}</p>
                      ) : null}
                    </div>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </SectionShell>
    )
  }

  if (layoutVariant === "connected_flow") {
    const flowCard = resolveCardPresentation(ui, { mode: "compact" })
    return (
      <SectionShell
        id={sectionId}
        labelledBy="how-it-works-title"
        sectionClassName={sectionClassName}
        sectionStyle={sectionStyle}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        rhythm={ui?.rhythm}
        surface={ui?.surface}
        density={ui?.density}
      >
        <FadeIn>
          <div className="space-y-1">
            {hasEyebrow ? (
              <p className="text-eyebrow text-muted-foreground">
                {eyebrow}
              </p>
            ) : null}
            <SectionHeading id="how-it-works-title" title={title} headingTreatment={ui?.headingTreatment} />
            {hasSubtitle ? (
              <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </FadeIn>

        <StaggerContainer className="flex flex-col gap-0 sm:flex-row sm:items-stretch sm:gap-0">
          {steps.map((step, idx) => (
            <StaggerItem key={`${idx}-${step.title}`} className="flex flex-1 flex-col items-center sm:flex-row">
              <div
                className={cn("flex w-full flex-1 flex-col text-center", flowCard.cardClass, flowCard.spacing.rootPadding)}
                style={panelStyle}
              >
                {ui?.labelStyle === "pill" ? (
                  <span className="mx-auto mb-2 flex h-8 min-w-8 items-center justify-center rounded-full bg-accent/20 px-2 text-sm font-medium text-accent">
                    {idx + 1}
                  </span>
                ) : ui?.labelStyle === "mono" ? (
                  <span className="text-label-mono mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                    {idx + 1}
                  </span>
                ) : ui?.labelStyle === "micro" ? (
                  <span className="mx-auto mb-2 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                    {idx + 1}
                  </span>
                ) : (
                  /* default: preserve original mono style */
                  <span className="text-label-mono mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                    {idx + 1}
                  </span>
                )}
                <p className="text-sm font-medium">{step.title}</p>
                {step.bodyHtml?.trim() ? (
                  <div
                    className={cn("mt-1 text-xs text-muted-foreground", RICH_TEXT_CLASS)}
                    dangerouslySetInnerHTML={{ __html: step.bodyHtml }}
                  />
                ) : step.body ? (
                  <p className="mt-1 text-xs text-muted-foreground">{step.body}</p>
                ) : null}
              </div>
              {idx < steps.length - 1 ? (
                <div aria-hidden className="flex items-center justify-center">
                  <span className="block h-4 w-px bg-border/60 sm:h-px sm:w-6" />
                  <span className="hidden text-muted-foreground/40 sm:block">&#8594;</span>
                  <span className="block text-muted-foreground/40 sm:hidden">&#8595;</span>
                  <span className="block h-4 w-px bg-border/60 sm:h-px sm:w-6" />
                </div>
              ) : null}
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SectionShell>
    )
  }

  if (layoutVariant === "workflow_visual") {
    const flowCard = resolveCardPresentation(ui, { mode: "compact" })
    return (
      <SectionShell
        id={sectionId}
        labelledBy="how-it-works-title"
        sectionClassName={sectionClassName}
        sectionStyle={sectionStyle}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        rhythm={ui?.rhythm}
        surface={ui?.surface}
        density={ui?.density}
      >
        <FadeIn>
          <div className="space-y-1">
            {hasEyebrow ? (
              <p className="text-eyebrow text-muted-foreground">{eyebrow}</p>
            ) : null}
            <SectionHeading id="how-it-works-title" title={title} headingTreatment={ui?.headingTreatment} />
            {hasSubtitle ? (
              <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </FadeIn>

        {/* Horizontal workflow diagram with arrows */}
        <StaggerContainer className="flex flex-col gap-0 sm:flex-row sm:items-stretch sm:gap-0">
          {steps.map((step, idx) => (
            <StaggerItem key={`${idx}-${step.title}`} className="flex flex-1 flex-col items-center sm:flex-row">
              <div
                className={cn(
                  "flex w-full flex-1 flex-col items-center text-center",
                  flowCard.cardClass,
                  flowCard.spacing.rootPadding
                )}
                style={panelStyle}
              >
                {step.icon ? (
                  <span className="mb-2 block text-2xl">{step.icon}</span>
                ) : step.stat ? (
                  <span className="text-metric mb-1 text-xl font-semibold text-accent">{step.stat}</span>
                ) : (
                  <span className="text-label-mono mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                    {idx + 1}
                  </span>
                )}
                <p className="text-sm font-medium">{step.title}</p>
                {step.bodyHtml?.trim() ? (
                  <div
                    className={cn("mt-1 text-xs text-muted-foreground", RICH_TEXT_CLASS)}
                    dangerouslySetInnerHTML={{ __html: step.bodyHtml }}
                  />
                ) : step.body ? (
                  <p className="mt-1 text-xs text-muted-foreground">{step.body}</p>
                ) : null}
              </div>
              {idx < steps.length - 1 ? (
                <div aria-hidden className="flex items-center justify-center">
                  <span className="block h-4 w-px bg-border/60 sm:h-px sm:w-6" />
                  <span className="hidden text-muted-foreground/40 sm:block">&#8594;</span>
                  <span className="block text-muted-foreground/40 sm:hidden">&#8595;</span>
                  <span className="block h-4 w-px bg-border/60 sm:h-px sm:w-6" />
                </div>
              ) : null}
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SectionShell>
    )
  }

  // Default grid layout
  const gridCard = resolveCardPresentation(ui, { mode: "compact" })

  return (
    <SectionShell
      id={sectionId}
      labelledBy="how-it-works-title"
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
      rhythm={ui?.rhythm}
      surface={ui?.surface}
      density={ui?.density}
    >
      <FadeIn>
        <div className="space-y-1">
          {hasEyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <SectionHeading id="how-it-works-title" title={title} headingTreatment={ui?.headingTreatment} />
          {hasSubtitle ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </FadeIn>

      <StaggerContainer className={cn("grid grid-cols-1 lg:grid-cols-2", DENSITY_GAP[density], dividerMode !== "none" ? DIVIDER_CLASSES[dividerMode] : "")}>
        {steps.map((step, idx) => (
          <StaggerItem key={`${idx}-${step.title}`} className="h-full">
            <div className="relative h-full">
              <div className={cn(
                "h-full flex flex-col",
                gridCard.spacing.gap, gridCard.spacing.rootPadding,
                gridCard.cardClass
              )} style={panelStyle}>
                <div className={cn(gridCard.spacing.gap, gridCard.spacing.bodyPadding)}>
                  {/* Inline accent: small accent bar before the step header */}
                  {gridCard.isInlineAccent ? (
                    <div aria-hidden className="mb-1 h-0.5 w-6 rounded-full bg-accent/50" />
                  ) : null}
                  <div className="flex items-center gap-2">
                    {ui?.labelStyle === "pill" ? (
                      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-accent/20 px-2 text-xs font-medium text-accent">
                        {idx + 1}
                      </span>
                    ) : ui?.labelStyle === "mono" ? (
                      <>
                        <Badge variant="secondary" className="text-label-mono min-w-7 justify-center rounded-full">
                          {idx + 1}
                        </Badge>
                        <span className="text-label-mono text-xs uppercase tracking-wide text-muted-foreground">Step {idx + 1}</span>
                      </>
                    ) : ui?.labelStyle === "micro" ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
                        {idx + 1}
                      </span>
                    ) : (
                      /* default label style */
                      <>
                        <Badge variant="secondary" className="min-w-7 justify-center rounded-full">
                          {idx + 1}
                        </Badge>
                        <span className="text-xs uppercase tracking-wide text-muted-foreground">Step {idx + 1}</span>
                      </>
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-sm font-medium sm:text-base">{step.title}</p>
                    {step.bodyHtml?.trim() ? (
                      <div
                        className={cn("text-sm text-muted-foreground", RICH_TEXT_CLASS)}
                        dangerouslySetInnerHTML={{ __html: step.bodyHtml }}
                      />
                    ) : step.body ? (
                      <p className="text-sm text-muted-foreground">{step.body}</p>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </SectionShell>
  )
}
