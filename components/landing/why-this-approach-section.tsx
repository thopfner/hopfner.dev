import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { FadeIn } from "@/components/landing/motion-primitives"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import type { ResolvedSectionUi } from "@/lib/design-system/tokens"
import { resolveCardPresentation } from "@/lib/design-system/component-families"
import { HEADING_TREATMENT_CLASSES, LABEL_STYLE_CLASSES } from "@/lib/design-system/presentation"
import { cn } from "@/lib/utils"
import type { CSSProperties } from "react"

export function WhyThisApproachSection({
  sectionId,
  sectionClassName,
  containerClassName,
  sectionStyle,
  containerStyle,
  panelStyle,
  title,
  heading,
  bodyHtml,
  eyebrow,
  ui,
}: {
  sectionId?: string
  sectionClassName?: string
  containerClassName?: string
  sectionStyle?: CSSProperties
  containerStyle?: CSSProperties
  panelStyle?: CSSProperties
  title: string
  heading: string
  bodyHtml: string
  eyebrow?: string
  ui?: ResolvedSectionUi
}) {
  const hasEyebrow = (eyebrow ?? "").trim().length > 0
  const labelStyle = ui?.labelStyle ?? "default"
  const headingId = sectionId ? `${sectionId}-heading` : "why-title"
  const { cardClass, isInlineAccent, spacing } = resolveCardPresentation(ui)

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
          </div>
        </FadeIn>

        <FadeIn delay={0.1}>
        <div className={cn(cardClass, spacing.gap, spacing.rootPadding)} style={panelStyle}>
          {isInlineAccent ? (
            <div aria-hidden className="mb-1 h-0.5 w-6 rounded-full bg-accent/50" />
          ) : null}
          <div className={cn("space-y-2", spacing.bodyPadding)}>
            <h3 className={cn("text-sm font-semibold", HEADING_TREATMENT_CLASSES[ui?.headingTreatment ?? "default"])}>{heading}</h3>
            <div
              className={cn("text-sm text-muted-foreground", RICH_TEXT_CLASS)}
              dangerouslySetInnerHTML={{ __html: bodyHtml }}
            />
          </div>
        </div>
        </FadeIn>
    </SectionShell>
  )
}
