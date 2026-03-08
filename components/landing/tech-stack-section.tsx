import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { FadeIn, StaggerContainer, StaggerItem, AnimatedCounter } from "@/components/landing/motion-primitives"
import { LogoTicker } from "@/components/landing/logo-ticker"
import type { ResolvedSectionUi } from "@/lib/design-system/tokens"
import { resolveCardPresentation } from "@/lib/design-system/component-families"
import {
  GRID_GAP_CLASSES,
  LABEL_STYLE_CLASSES,
} from "@/lib/design-system/presentation"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

type LayoutVariant = "default" | "metrics_grid" | "trust_strip" | "tool_badges" | "logo_row" | "marquee"

export function TechStackSection({
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
  layoutVariant = "default",
  compact = false,
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
  items: Array<{ label: string; value: string; icon?: string; imageUrl?: string }>
  layoutVariant?: LayoutVariant
  compact?: boolean
  ui?: ResolvedSectionUi
}) {
  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const hasSubtitle = (subtitle ?? "").trim().length > 0
  const labelStyle = ui?.labelStyle ?? "default"
  const gridGap = ui?.gridGap ?? "standard"
  const headingId = sectionId ? `${sectionId}-heading` : "tech-title"
  const card = resolveCardPresentation(ui, { mode: "compact" })

  if (layoutVariant === "trust_strip") {
    return (
      <SectionShell
        id={sectionId}
        sectionClassName={sectionClassName}
        sectionStyle={sectionStyle}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        rhythm={ui?.rhythm}
        surface={ui?.surface}
        density={ui?.density}
      >
          {title ? (
            <FadeIn>
              <p className="text-eyebrow mb-3 text-center text-muted-foreground">
                {title}
              </p>
            </FadeIn>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            {items.map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                {item.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.imageUrl}
                    alt={item.label}
                    className="h-5 w-auto object-contain opacity-60 grayscale"
                  />
                ) : item.icon ? (
                  <span className="text-sm">{item.icon}</span>
                ) : null}
                <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                {item.value ? (
                  <span className="text-xs text-muted-foreground/60">{item.value}</span>
                ) : null}
              </div>
            ))}
          </div>
      </SectionShell>
    )
  }

  if (layoutVariant === "logo_row") {
    return (
      <SectionShell
        id={sectionId}
        sectionClassName={sectionClassName}
        sectionStyle={sectionStyle}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        rhythm={ui?.rhythm}
        surface={ui?.surface}
        density={ui?.density}
      >
          {title ? (
            <FadeIn>
              <p className="text-eyebrow mb-3 text-center text-muted-foreground">
                {title}
              </p>
            </FadeIn>
          ) : null}
          <div className="flex flex-wrap items-center justify-center gap-6">
            {items.map((item) =>
              item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={item.label}
                  src={item.imageUrl}
                  alt={item.label}
                  className="h-6 w-auto object-contain opacity-50 grayscale transition-opacity hover:opacity-80"
                />
              ) : (
                <span
                  key={item.label}
                  className="text-xs font-medium text-muted-foreground/60"
                >
                  {item.label}
                </span>
              )
            )}
          </div>
      </SectionShell>
    )
  }

  if (layoutVariant === "marquee") {
    return (
      <SectionShell
        id={sectionId}
        sectionClassName={sectionClassName}
        sectionStyle={sectionStyle}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        rhythm={ui?.rhythm}
        surface={ui?.surface}
        density={ui?.density}
      >
        {title ? (
          <FadeIn>
            <p className="text-eyebrow mb-3 text-center text-muted-foreground">
              {title}
            </p>
          </FadeIn>
        ) : null}
        <LogoTicker items={items} />
      </SectionShell>
    )
  }

  if (layoutVariant === "tool_badges") {
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
              <p className={cn(LABEL_STYLE_CLASSES[labelStyle])}>{eyebrow}</p>
            ) : null}
            <SectionHeading id={headingId} title={title} headingTreatment={ui?.headingTreatment} />
            {hasSubtitle ? (
              <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </FadeIn>

        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.label}
              className={cn("inline-flex items-center gap-1.5", LABEL_STYLE_CLASSES[labelStyle])}
              style={panelStyle}
            >
              {item.icon ? <span>{item.icon}</span> : null}
              {item.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.imageUrl} alt="" className="h-3.5 w-auto object-contain" />
              ) : null}
              {item.label}
              {item.value ? (
                <span className="text-muted-foreground">{item.value}</span>
              ) : null}
            </span>
          ))}
        </div>
      </SectionShell>
    )
  }

  if (layoutVariant === "metrics_grid") {
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
              <p className={cn(LABEL_STYLE_CLASSES[labelStyle])}>{eyebrow}</p>
            ) : null}
            <SectionHeading id={headingId} title={title} headingTreatment={ui?.headingTreatment} />
            {hasSubtitle ? (
              <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
            ) : null}
          </div>
        </FadeIn>

        <StaggerContainer className={cn(
          "grid",
          GRID_GAP_CLASSES[gridGap],
          compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}>
          {items.map((item) => (
            <StaggerItem key={item.label} className="h-full">
              <div
                className={cn(card.cardClass, card.spacing.rootPadding, "h-full flex flex-col text-center")}
                style={panelStyle}
              >
                {card.isInlineAccent ? (
                  <div aria-hidden className="mx-auto mb-1.5 h-0.5 w-6 rounded-full bg-accent/50" />
                ) : null}
                {item.icon ? <span className={cn("block text-xl", gridGap === "tight" ? "mb-0.5" : gridGap === "wide" ? "mb-2" : "mb-1")}>{item.icon}</span> : null}
                <p className={cn("text-metric text-gradient", compact ? "text-xl" : "text-2xl lg:text-3xl")}>
                  {(() => {
                    const match = item.value.match(/^([^0-9]*)([\d,.]+)(.*)$/)
                    if (match) {
                      const [, pre, numStr, suf] = match
                      const num = parseFloat(numStr.replace(/,/g, ""))
                      return (
                        <AnimatedCounter
                          target={num}
                          prefix={pre}
                          suffix={suf}
                        />
                      )
                    }
                    return item.value
                  })()}
                </p>
                <p className={cn(LABEL_STYLE_CLASSES[labelStyle], "mt-auto pt-0.5")}>{item.label}</p>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
      </SectionShell>
    )
  }

  // Default layout
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
            <p className={cn(LABEL_STYLE_CLASSES[labelStyle])}>{eyebrow}</p>
          ) : null}
          <SectionHeading id={headingId} title={title} headingTreatment={ui?.headingTreatment} />
          {hasSubtitle ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>
      </FadeIn>

      <StaggerContainer className={cn("grid grid-cols-1 sm:grid-cols-2", GRID_GAP_CLASSES[gridGap])}>
        {items.map((item) => (
          <StaggerItem key={item.label} className="h-full">
            <div
              className={cn(card.cardClass, card.spacing.rootPadding, "h-full flex flex-col")}
              style={panelStyle}
            >
              {card.isInlineAccent ? (
                <div aria-hidden className="mb-1.5 h-0.5 w-6 rounded-full bg-accent/50" />
              ) : null}
              {item.icon ? <span>{item.icon}</span> : undefined}
              <p className="text-muted-foreground">{item.value}</p>
              <p className={cn(LABEL_STYLE_CLASSES[labelStyle], "mt-auto pt-0.5")}>{item.label}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>
    </SectionShell>
  )
}
