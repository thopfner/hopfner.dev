import { Badge } from "@/components/ui/badge"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/landing/motion-primitives"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"
import type { ResolvedSectionUi } from "@/lib/design-system/tokens"
import { resolveCardPresentation } from "@/lib/design-system/component-families"
import {
  DENSITY_ITEM_SPACING,
  DENSITY_SECTION_GAP,
  GRID_GAP_CLASSES,
  DIVIDER_CLASSES,
  LABEL_STYLE_CLASSES,
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
  const gridGapToken = ui?.gridGap ?? "standard"
  const dividerMode = ui?.dividerMode ?? "none"
  const headingId = sectionId ? `${sectionId}-heading` : "how-it-works-title"

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
        labelledBy={headingId}
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
              <p className={cn(LABEL_STYLE_CLASSES[ui?.labelStyle ?? "default"], "text-muted-foreground")}>
                {eyebrow}
              </p>
            ) : null}
            <SectionHeading id={headingId} title={title} headingTreatment={ui?.headingTreatment} />
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
                        <p className="text-sm font-medium text-foreground sm:text-base">{step.title}</p>
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
        labelledBy={headingId}
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
              <p className={cn(LABEL_STYLE_CLASSES[ui?.labelStyle ?? "default"], "text-muted-foreground")}>
                {eyebrow}
              </p>
            ) : null}
            <SectionHeading id={headingId} title={title} headingTreatment={ui?.headingTreatment} />
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
                <p className="text-sm font-medium text-foreground">{step.title}</p>
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
    // Process-family cards with structural left-rail personality
    const processCard = resolveCardPresentation(
      ui?.componentFamily
        ? ui
        : {
            rhythm: ui?.rhythm ?? "standard",
            surface: ui?.surface ?? "none",
            density: ui?.density ?? "standard",
            gridGap: ui?.gridGap ?? "standard",
            headingTreatment: ui?.headingTreatment ?? "default",
            labelStyle: ui?.labelStyle ?? "default",
            dividerMode: ui?.dividerMode ?? "none",
            componentFamily: "process",
            componentChrome: ui?.componentChrome,
            accentRule: ui?.accentRule,
          },
      { mode: "compact" }
    )
    const gridGap = ui?.gridGap ?? "standard"
    const labelStyle = ui?.labelStyle ?? "default"
    // Connector color follows accentRule
    const connectorColor =
      ui?.accentRule === "left" || ui?.accentRule === "inline" || ui?.accentRule === "top"
        ? "bg-accent/30"
        : "bg-border/40"
    const arrowColor =
      ui?.accentRule === "left" || ui?.accentRule === "inline" || ui?.accentRule === "top"
        ? "text-accent/50"
        : "text-muted-foreground/30"

    return (
      <SectionShell
        id={sectionId}
        labelledBy={headingId}
        sectionClassName={sectionClassName}
        sectionStyle={sectionStyle}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        rhythm={ui?.rhythm}
        surface={ui?.surface}
        density={ui?.density}
      >
        <div className={DENSITY_SECTION_GAP[density]}>
          <FadeIn>
            <div className="space-y-1.5">
              {hasEyebrow ? (
                <p className={cn(LABEL_STYLE_CLASSES[labelStyle])}>{eyebrow}</p>
              ) : null}
              <SectionHeading id={headingId} title={title} headingTreatment={ui?.headingTreatment} />
              {hasSubtitle ? (
                <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
              ) : null}
            </div>
          </FadeIn>

          {/* Process diagram: horizontal on desktop, vertical on mobile */}
          <StaggerContainer className={cn(
            "grid grid-cols-1 sm:grid-cols-2",
            steps.length === 2 ? "lg:grid-cols-2"
              : steps.length === 3 ? "lg:grid-cols-3"
              : "lg:grid-cols-4",
            GRID_GAP_CLASSES[gridGap]
          )}>
            {steps.map((step, idx) => (
              <StaggerItem key={`${idx}-${step.title}`} className="relative h-full">
                <div
                  className={cn(
                    "h-full flex flex-col",
                    processCard.cardClass,
                    processCard.spacing.rootPadding
                  )}
                  style={panelStyle}
                >
                  {processCard.isInlineAccent ? (
                    <div aria-hidden className="mb-2 h-0.5 w-6 rounded-full bg-accent/50" />
                  ) : null}
                  {/* Step indicator */}
                  <div className="mb-2 flex items-center gap-2.5">
                    {labelStyle === "pill" ? (
                      <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-accent/20 px-2 text-xs font-semibold text-accent">
                        {step.icon || (idx + 1)}
                      </span>
                    ) : labelStyle === "micro" ? (
                      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-muted text-[10px] font-bold text-muted-foreground">
                        {idx + 1}
                      </span>
                    ) : (
                      <span className="text-label-mono flex h-7 min-w-7 items-center justify-center rounded-full bg-accent/10 text-xs text-accent">
                        {step.icon || (idx + 1)}
                      </span>
                    )}
                    {step.stat ? (
                      <span className="text-metric text-sm font-semibold text-accent/80">{step.stat}</span>
                    ) : null}
                  </div>
                  <p className="text-sm font-semibold tracking-tight text-foreground">{step.title}</p>
                  {step.bodyHtml?.trim() ? (
                    <div
                      className={cn("mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground", RICH_TEXT_CLASS)}
                      dangerouslySetInnerHTML={{ __html: step.bodyHtml }}
                    />
                  ) : step.body ? (
                    <p className="mt-1.5 flex-1 text-xs leading-relaxed text-muted-foreground">{step.body}</p>
                  ) : null}
                </div>
                {/* Connector arrow (visible between cards on desktop) */}
                {idx < steps.length - 1 ? (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute -right-4 top-1/2 z-10 hidden -translate-y-1/2 lg:block"
                    style={{ right: `calc(-${gridGap === "tight" ? "0.375" : gridGap === "wide" ? "1" : "0.625"}rem - 4px)` }}
                  >
                    <span className={cn("text-lg", arrowColor)}>&#8594;</span>
                  </div>
                ) : null}
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </SectionShell>
    )
  }

  // Default grid layout
  const gridCard = resolveCardPresentation(ui, { mode: "compact" })

  return (
    <SectionShell
      id={sectionId}
      labelledBy={headingId}
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
            <p className={cn(LABEL_STYLE_CLASSES[ui?.labelStyle ?? "default"])}>{eyebrow}</p>
          ) : null}
          <SectionHeading id={headingId} title={title} headingTreatment={ui?.headingTreatment} />
          {hasSubtitle ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </FadeIn>

      <StaggerContainer className={cn("grid grid-cols-1 lg:grid-cols-2", GRID_GAP_CLASSES[gridGapToken], dividerMode !== "none" ? DIVIDER_CLASSES[dividerMode] : "")}>
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
                    <p className="text-sm font-medium text-foreground sm:text-base">{step.title}</p>
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
