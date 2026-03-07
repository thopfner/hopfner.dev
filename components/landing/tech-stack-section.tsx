import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import { Metric } from "@/components/ui/metric"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

type LayoutVariant = "default" | "metrics_grid" | "trust_strip" | "tool_badges" | "logo_row"

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
  contentDensity,
  labelStyle,
  rhythm,
  surface,
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
  contentDensity?: string
  labelStyle?: string
  rhythm?: string
  surface?: string
}) {
  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const hasSubtitle = (subtitle ?? "").trim().length > 0

  if (layoutVariant === "trust_strip") {
    return (
      <SectionShell
        id={sectionId}
        sectionClassName={sectionClassName}
        sectionStyle={sectionStyle}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        rhythm={(rhythm ?? "compact") as Parameters<typeof SectionShell>[0]["rhythm"]}
        surface={surface as Parameters<typeof SectionShell>[0]["surface"]}
      >
          {title ? (
            <p className="text-eyebrow mb-3 text-center text-muted-foreground">
              {title}
            </p>
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
        rhythm={(rhythm ?? "compact") as Parameters<typeof SectionShell>[0]["rhythm"]}
        surface={surface as Parameters<typeof SectionShell>[0]["surface"]}
      >
          {title ? (
            <p className="text-eyebrow mb-3 text-center text-muted-foreground">
              {title}
            </p>
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

  if (layoutVariant === "tool_badges") {
    return (
      <SectionShell
        id={sectionId}
        labelledBy="tech-title"
        sectionClassName={sectionClassName}
        sectionStyle={sectionStyle}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        rhythm={rhythm as Parameters<typeof SectionShell>[0]["rhythm"]}
        surface={surface as Parameters<typeof SectionShell>[0]["surface"]}
      >
        <div className="space-y-1">
          {hasEyebrow ? (
            <p className="text-eyebrow text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <SectionHeading id="tech-title" title={title} />
          {hasSubtitle ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        <div className="flex flex-wrap gap-2">
          {items.map((item) => (
            <span
              key={item.label}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/50 bg-card/30 px-3 py-1.5 text-xs font-medium"
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
        labelledBy="tech-title"
        sectionClassName={sectionClassName}
        sectionStyle={sectionStyle}
        containerClassName={containerClassName}
        containerStyle={containerStyle}
        rhythm={rhythm as Parameters<typeof SectionShell>[0]["rhythm"]}
        surface={surface as Parameters<typeof SectionShell>[0]["surface"]}
      >
        <div className="space-y-1">
          {hasEyebrow ? (
            <p className="text-eyebrow text-muted-foreground">
              {eyebrow}
            </p>
          ) : null}
          <SectionHeading id="tech-title" title={title} />
          {hasSubtitle ? (
            <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
          ) : null}
        </div>

        <div className={cn(
          "grid gap-3",
          compact ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}>
          {items.map((item) => (
            <div
              key={item.label}
              className={cn(
                "rounded-xl border border-border/50 bg-card/30 p-4 text-center",
                !compact && "interactive-lift"
              )}
              style={panelStyle}
            >
              {item.icon ? <span className="mb-1 block text-xl">{item.icon}</span> : null}
              <p className={cn("text-metric", compact ? "text-xl" : "text-2xl lg:text-3xl")}>
                {item.value}
              </p>
              <p className="text-label-mono mt-0.5 text-muted-foreground">{item.label}</p>
            </div>
          ))}
        </div>
      </SectionShell>
    )
  }

  // Default layout
  return (
    <SectionShell
      id={sectionId}
      labelledBy="tech-title"
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
      rhythm={rhythm as Parameters<typeof SectionShell>[0]["rhythm"]}
      surface={surface as Parameters<typeof SectionShell>[0]["surface"]}
    >
      <div className="space-y-1">
        {hasEyebrow ? (
          <p className="text-xs font-semibold uppercase tracking-[0.15em] text-muted-foreground">
            {eyebrow}
          </p>
        ) : null}
        <SectionHeading id="tech-title" title={title} />
        {hasSubtitle ? (
          <p className="max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
      </div>

      <div className={cn("grid grid-cols-1 sm:grid-cols-2", contentDensity === "tight" ? "gap-2" : "gap-3")}>
        {items.map((item) => (
          <Metric
            key={item.label}
            label={item.label}
            value={<p className="text-muted-foreground">{item.value}</p>}
            icon={item.icon ? <span>{item.icon}</span> : undefined}
            className={cn("interactive-lift")}
            style={panelStyle}
          />
        ))}
      </div>
    </SectionShell>
  )
}
