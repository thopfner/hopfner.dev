import { SectionShell } from "@/components/landing/section-primitives"
import { FadeIn } from "@/components/landing/motion-primitives"
import { LogoTicker } from "@/components/landing/logo-ticker"
import {
  HEADING_TREATMENT_CLASSES,
  LABEL_STYLE_CLASSES,
  DENSITY_SECTION_GAP,
  GRID_GAP_CLASSES,
} from "@/lib/design-system/presentation"
import { resolveCardClasses } from "@/lib/design-system/component-families"
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
  const headingTreatment = ui?.headingTreatment ?? "default"
  const density = ui?.density ?? "standard"
  const gridGap = ui?.gridGap ?? "standard"

  // Logo grid tiles use logo_tile family internally (not exposed as admin control)
  const logoTile = resolveCardClasses("logo_tile")

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
      <FadeIn>
        <div className={cn("text-center", DENSITY_SECTION_GAP[density])}>
          {/* Heading cluster */}
          {(hasEyebrow || hasTitle || hasSubtitle) ? (
            <div className="space-y-1.5">
              {hasEyebrow ? (
                <p className={cn(LABEL_STYLE_CLASSES[labelStyle], "mx-auto")}>{eyebrow}</p>
              ) : null}

              {hasTitle ? (
                <p
                  className={cn(
                    "text-sm font-medium tracking-wide text-muted-foreground",
                    HEADING_TREATMENT_CLASSES[headingTreatment]
                  )}
                >
                  {title}
                </p>
              ) : null}

              {hasSubtitle ? (
                <p className="text-xs text-muted-foreground/60">{subtitle}</p>
              ) : null}
            </div>
          ) : null}

          {/* Logo display */}
          {hasLogos ? (
            layoutVariant === "marquee" ? (
              <LogoTicker items={logos.map((l) => ({ label: l.label, value: "", imageUrl: l.imageUrl }))} />
            ) : layoutVariant === "grid" ? (
              <div className={cn(
                "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
                GRID_GAP_CLASSES[gridGap]
              )}>
                {logos.map((logo) => (
                  <div
                    key={logo.label}
                    className={cn(logoTile.cardClass, "px-5 py-3.5 transition-colors hover:bg-card/[0.08]")}
                  >
                    {logo.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={logo.imageUrl}
                        alt={logo.alt || logo.label}
                        className="h-7 max-w-[110px] object-contain opacity-55 grayscale transition-all duration-300 hover:opacity-80 hover:grayscale-0"
                      />
                    ) : (
                      <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/55">
                        {logo.label}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              /* inline layout */
              <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-5">
                {logos.map((logo) =>
                  logo.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      key={logo.label}
                      src={logo.imageUrl}
                      alt={logo.alt || logo.label}
                      className="h-6 w-auto object-contain opacity-50 grayscale transition-all duration-300 hover:opacity-80 hover:grayscale-0"
                    />
                  ) : (
                    <span
                      key={logo.label}
                      className="text-xs font-semibold uppercase tracking-widest text-muted-foreground/50 transition-colors hover:text-muted-foreground/70"
                    >
                      {logo.label}
                    </span>
                  )
                )}
              </div>
            )
          ) : null}

          {/* Trust badges */}
          {hasBadges ? (
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {badges.map((badge) => (
                <span
                  key={badge.text}
                  className={cn("inline-flex items-center gap-1.5", LABEL_STYLE_CLASSES[labelStyle])}
                >
                  {badge.icon ? <span className="text-xs">{badge.icon}</span> : null}
                  {badge.text}
                </span>
              ))}
            </div>
          ) : null}

          {/* Trust note */}
          {hasTrustNote ? (
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground/40">{trustNote}</p>
          ) : null}
        </div>
      </FadeIn>
    </SectionShell>
  )
}
