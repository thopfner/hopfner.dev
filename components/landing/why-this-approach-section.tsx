import { RICH_TEXT_CLASS } from "@/components/landing/rich-text-class"
import { FadeIn } from "@/components/landing/motion-primitives"
import { SectionHeading, SectionShell } from "@/components/landing/section-primitives"
import type { ResolvedSectionUi } from "@/lib/design-system/tokens"
import { resolveCardPresentation } from "@/lib/design-system/component-families"
import { HEADING_TREATMENT_CLASSES } from "@/lib/design-system/presentation"
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
  ui?: ResolvedSectionUi
}) {
  const { cardClass, spacing } = resolveCardPresentation(ui)

  return (
    <SectionShell
      id={sectionId}
      labelledBy="why-title"
      sectionClassName={sectionClassName}
      sectionStyle={sectionStyle}
      containerClassName={containerClassName}
      containerStyle={containerStyle}
      rhythm={ui?.rhythm}
      surface={ui?.surface}
      density={ui?.density}
    >
        <FadeIn>
          <SectionHeading id="why-title" title={title} headingTreatment={ui?.headingTreatment} />
        </FadeIn>

        <FadeIn delay={0.1}>
        <div className={cn(cardClass, spacing.gap, spacing.rootPadding)} style={panelStyle}>
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
