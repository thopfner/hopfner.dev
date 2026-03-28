export type FormattingState = {
  containerClass: string
  sectionClass: string
  paddingY: string
  outerSpacing: string
  spacingTop: string
  spacingBottom: string
  maxWidth: string
  textAlign: string
  heroRightAlign: string
  widthMode: "content" | "full"
  heroMinHeight: "auto" | "70svh" | "100svh"
  shadowMode: "inherit" | "off" | "on"
  innerShadowMode: "inherit" | "off" | "on"
  innerShadowStrength: number
  sectionRhythm?: string
  contentDensity?: string
  gridGap?: string
  sectionSurface?: string
  cardFamily?: string
  cardChrome?: string
  accentRule?: string
  dividerMode?: string
  headingTreatment?: string
  labelStyle?: string
  subtitleSize?: string
  sectionPresetKey?: string
  mobile?: {
    containerClass: string
    sectionClass: string
    paddingY: string
  }
}
