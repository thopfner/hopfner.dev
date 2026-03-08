import { SectionShell } from "@/components/landing/section-primitives"
import { FadeIn } from "@/components/landing/motion-primitives"
import { LogoTicker } from "@/components/landing/logo-ticker"
import { LABEL_STYLE_CLASSES } from "@/lib/design-system/presentation"
import type { ResolvedSectionUi } from "@/lib/design-system/tokens"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

type LayoutVariant = "inline" | "marquee" | "grid"

export function SocialProofStripSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  title,
  subtitle,
  eyebrow,
  logos,
  badges,
  trustNote,
  layoutVariant = "inline",
  ui,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  title?: string
  subtitle?: string
  eyebrow?: string
  logos: Array<{ label: string; imageUrl?: string; alt?: string; href?: string }>
  badges: Array<{ text: string; icon?: string }>
  trustNote?: string
  layoutVariant?: LayoutVariant
  ui?: ResolvedSectionUi
}) {
  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const hasTitle = (title ?? "").trim().length > 0
  const hasSubtitle = (subtitle ?? "").trim().length > 0
  const hasBadges = badges.length > 0
  const hasLogos = logos.length > 0
  const hasTrustNote = (trustNote ?? "").trim().length > 0
  const labelStyle = ui?.labelStyle ?? "default"

  return (
    <SectionShell
      id={sectionId}
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
      rhythm={ui?.rhythm ?? "compact"}
      surface={ui?.surface}
      density={ui?.density}
    >
      <FadeIn>
        <div className="space-y-4 text-center">
          {hasEyebrow ? (
            <p className="text-eyebrow text-muted-foreground">{eyebrow}</p>
          ) : null}

          {hasTitle ? (
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
          ) : null}

          {hasSubtitle ? (
            <p className="text-xs text-muted-foreground/70">{subtitle}</p>
          ) : null}

          {hasLogos ? (
            layoutVariant === "marquee" ? (
              <LogoTicker items={logos.map((l) => ({ label: l.label, value: "", imageUrl: l.imageUrl }))} />
            ) : layoutVariant === "grid" ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
                {logos.map((logo) => (
                  <div
                    key={logo.label}
                    className="flex items-center justify-center rounded-lg border border-border/30 bg-card/20 px-4 py-3"
                  >
                    {logo.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo.imageUrl}
                        alt={logo.alt || logo.label}
                        className="h-6 max-w-[100px] object-contain opacity-60 grayscale transition-opacity hover:opacity-80"
                      />
                    ) : (
                      <span className="text-xs font-medium text-muted-foreground/60">{logo.label}</span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
                {logos.map((logo) =>
                  logo.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={logo.label}
                      src={logo.imageUrl}
                      alt={logo.alt || logo.label}
                      className="h-6 w-auto object-contain opacity-50 grayscale transition-opacity hover:opacity-80"
                    />
                  ) : (
                    <span
                      key={logo.label}
                      className="text-xs font-medium text-muted-foreground/60"
                    >
                      {logo.label}
                    </span>
                  )
                )}
              </div>
            )
          ) : null}

          {hasBadges ? (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {badges.map((badge) => (
                <span
                  key={badge.text}
                  className={cn("inline-flex items-center gap-1.5", LABEL_STYLE_CLASSES[labelStyle])}
                >
                  {badge.icon ? <span>{badge.icon}</span> : null}
                  {badge.text}
                </span>
              ))}
            </div>
          ) : null}

          {hasTrustNote ? (
            <p className="text-xs text-muted-foreground/50">{trustNote}</p>
          ) : null}
        </div>
      </FadeIn>
    </SectionShell>
  )
}
