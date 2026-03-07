import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

type LayoutVariant = "grid" | "timeline" | "connected_flow"

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
  cardFamily,
  accentRule,
  labelStyle,
  dividerMode,
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
  steps: Array<{ title: string; body?: string; bodyHtml?: string }>
  layoutVariant?: LayoutVariant
  cardFamily?: string
  accentRule?: string
  labelStyle?: string
  dividerMode?: string
}) {
  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const hasSubtitle = (subtitle ?? "").trim().length > 0

  if (layoutVariant === "timeline") {
    // Timeline line color intensity: accentRule controls emphasis
    const timelineLineClass =
      accentRule === "left" || accentRule === "inline"
        ? "bg-accent/40"
        : accentRule === "top"
          ? "bg-accent/25"
          : accentRule === "none"
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
      >
        <div className="space-y-1">
          {hasEyebrow ? (
            <p className="text-eyebrow text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <SectionHeading id="how-it-works-title" title={title} />
          {hasSubtitle ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        <div className="relative">
          {/* Timeline line */}
          <div
            aria-hidden
            className={cn("absolute left-4 top-0 hidden h-full w-px sm:block", timelineLineClass)}
          />
          <ol className="space-y-4 sm:pl-12">
            {steps.map((step, idx) => (
              <li key={`${idx}-${step.title}`} className="relative">
                {/* Timeline dot */}
                <div
                  aria-hidden
                  className="absolute -left-12 top-4 hidden h-3 w-3 rounded-full border-2 border-accent/60 bg-background sm:block"
                  style={{ left: "-2.25rem" }}
                />
                <Card className="surface-panel gap-2 py-3" style={panelStyle}>
                  <CardContent className="space-y-1.5 px-4">
                    <div className="flex items-center gap-2">
                      {labelStyle === "pill" ? (
                        <span className="flex h-6 min-w-6 items-center justify-center rounded-full bg-accent/20 px-1.5 text-xs font-medium text-accent">
                          {idx + 1}
                        </span>
                      ) : labelStyle === "mono" ? (
                        <span className="text-label-mono flex h-6 w-6 items-center justify-center rounded-full bg-accent/10 text-accent">
                          {idx + 1}
                        </span>
                      ) : labelStyle === "micro" ? (
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
                  </CardContent>
                </Card>
              </li>
            ))}
          </ol>
        </div>
      </SectionShell>
    )
  }

  if (layoutVariant === "connected_flow") {
    return (
      <SectionShell
        id={sectionId}
        labelledBy="how-it-works-title"
        sectionClassName={sectionClassName}
        sectionStyle={sectionStyle}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
      >
        <div className="space-y-1">
          {hasEyebrow ? (
            <p className="text-eyebrow text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <SectionHeading id="how-it-works-title" title={title} />
          {hasSubtitle ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-col gap-0 sm:flex-row sm:items-stretch sm:gap-0">
          {steps.map((step, idx) => (
            <div key={`${idx}-${step.title}`} className="flex flex-1 flex-col items-center sm:flex-row">
              <div
                className="flex w-full flex-1 flex-col rounded-xl border border-border/50 bg-card/30 p-4 text-center"
                style={panelStyle}
              >
                {labelStyle === "pill" ? (
                  <span className="mx-auto mb-2 flex h-8 min-w-8 items-center justify-center rounded-full bg-accent/20 px-2 text-sm font-medium text-accent">
                    {idx + 1}
                  </span>
                ) : labelStyle === "mono" ? (
                  <span className="text-label-mono mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
                    {idx + 1}
                  </span>
                ) : labelStyle === "micro" ? (
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
            </div>
          ))}
        </div>
      </SectionShell>
    )
  }

  // Default grid layout

  // Resolve accentRule: explicit prop wins; fall back to "left" when cardFamily="process" for backward compat
  const resolvedAccentRule = accentRule ?? (cardFamily === "process" ? "left" : "none")

  const accentClasses: Record<string, string> = {
    left: "border-l-2 border-l-accent/50",
    top: "border-t-2 border-t-accent/50",
    inline: "", // inline accent is rendered inside the card, not via class
    none: "",
  }

  return (
    <SectionShell
      id={sectionId}
      labelledBy="how-it-works-title"
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
    >
      <div className="space-y-1">
        {hasEyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <SectionHeading id="how-it-works-title" title={title} />
        {hasSubtitle ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      <ol className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        {steps.map((step, idx) => (
          <li key={`${idx}-${step.title}`} className="relative">
            <Card className={cn(
              "gap-3 py-4",
              cardFamily === "process" ? "border border-border/30 bg-card/15" : "surface-panel interactive-lift",
              accentClasses[resolvedAccentRule] ?? ""
            )} style={panelStyle}>
              <CardContent className="space-y-2 px-4">
                {/* Inline accent: small accent bar before the step header */}
                {resolvedAccentRule === "inline" ? (
                  <div aria-hidden className="mb-1 h-0.5 w-6 rounded-full bg-accent/50" />
                ) : null}
                <div className="flex items-center gap-2">
                  {labelStyle === "pill" ? (
                    <span className="flex h-7 min-w-7 items-center justify-center rounded-full bg-accent/20 px-2 text-xs font-medium text-accent">
                      {idx + 1}
                    </span>
                  ) : labelStyle === "mono" ? (
                    <>
                      <Badge variant="secondary" className="text-label-mono min-w-7 justify-center rounded-full">
                        {idx + 1}
                      </Badge>
                      <span className="text-label-mono text-xs uppercase tracking-wide text-muted-foreground">Step {idx + 1}</span>
                    </>
                  ) : labelStyle === "micro" ? (
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
              </CardContent>
            </Card>
          </li>
        ))}
      </ol>
    </SectionShell>
  )
}
