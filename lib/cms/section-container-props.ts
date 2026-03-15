/**
 * Shared section wrapper/container props resolver.
 * Extracted from the public page renderer to ensure parity between
 * public rendering and admin visual editor preview.
 *
 * This is the single source of truth for:
 * - sectionClassName (paddingY, custom section classes)
 * - containerClassName (maxWidth, alignment, custom container classes, text alignment)
 * - sectionStyle (spacing tokens, background styling)
 * - containerStyle (color overrides, accent vars, font overrides)
 * - panelStyle (shadow, panel opacity, card-level vars)
 */

import type { CSSProperties } from "react"
import { getSafeFormatting } from "@/lib/cms/formatting"
import type { TailwindWhitelist } from "@/lib/cms/types"

function asString(v: unknown): string {
  return typeof v === "string" ? v : ""
}

function clampNumber(value: unknown, min: number, max: number, fallback: number) {
  const n = Number(value)
  if (!Number.isFinite(n)) return fallback
  return Math.min(max, Math.max(min, n))
}

function accentDerivedVars(accentColor: string): Record<string, string> {
  if (!accentColor) return {}
  return {
    "--accent": accentColor,
    "--accent-glow": accentColor,
    "--accent-light": `color-mix(in oklch, ${accentColor} 70%, white)`,
    "--border": `color-mix(in srgb, ${accentColor} 45%, transparent)`,
    "--input": `color-mix(in srgb, ${accentColor} 38%, transparent)`,
    "--ring": `color-mix(in srgb, ${accentColor} 72%, white 8%)`,
  }
}

function buildInnerShadow(strength: number): string {
  if (strength <= 0) return "none"
  const topPx = Math.max(1, Math.round(2 * strength))
  const spreadY = Math.max(2, Math.round(12 * strength))
  const blur = Math.max(6, Math.round(20 * strength))
  const spread = Math.max(2, Math.round(10 * strength))
  return `inset 0 1px ${topPx}px color-mix(in srgb, white 24%, transparent), inset 0 ${spreadY}px ${blur}px -${spread}px color-mix(in srgb, var(--section-shadow-color) 34%, transparent)`
}

function spacingTokenToStyle(
  spacingTop: string,
  spacingBottom: string,
  outerSpacing: string
): CSSProperties {
  const style: CSSProperties = {}
  function tailwindToCss(token: string): string | undefined {
    const t = token.trim()
    const arb = t.match(/^\[(.+)\]$/)
    if (arb) return arb[1]
    if (t === "px") return "1px"
    if (t === "0") return "0px"
    if (/^\d+(?:\.\d+)?$/.test(t)) return `calc(var(--spacing) * ${t})`
    return undefined
  }
  function apply(raw: string) {
    if (!raw) return
    raw.split(/\s+/).forEach((tok) => {
      const pt = tok.match(/^pt-(.+)$/)
      if (pt) { const v = tailwindToCss(pt[1]); if (v) style.paddingTop = v; return }
      const pb = tok.match(/^pb-(.+)$/)
      if (pb) { const v = tailwindToCss(pb[1]); if (v) style.paddingBottom = v; return }
      const mt = tok.match(/^mt-(.+)$/)
      if (mt) { const v = tailwindToCss(mt[1]); if (v) style.marginTop = v; return }
      const mb = tok.match(/^mb-(.+)$/)
      if (mb) { const v = tailwindToCss(mb[1]); if (v) style.marginBottom = v; return }
      const my = tok.match(/^my-(.+)$/)
      if (my) { const v = tailwindToCss(my[1]); if (v) style.marginBlock = v }
    })
  }
  apply(spacingTop)
  apply(spacingBottom)
  apply(outerSpacing)
  return style
}

export type SectionContainerResult = {
  sectionId: string | undefined
  sectionClassName: string
  containerClassName: string
  sectionStyle: CSSProperties
  containerStyle: CSSProperties
  panelStyle: CSSProperties
}

export function resolveSectionContainerProps(
  formatting: Record<string, unknown>,
  whitelist: TailwindWhitelist,
  sectionKey?: string | null,
  _sectionType?: string
): SectionContainerResult {
  const f = getSafeFormatting(formatting, whitelist)
  const backgroundType = asString(formatting.backgroundType)
  const sectionStyle: CSSProperties = {}
  const overlayColor = asString(formatting.overlayColor)
  const overlayOpacityRaw = Number(formatting.overlayOpacity)
  const overlayOpacity = Number.isFinite(overlayOpacityRaw) ? Math.min(1, Math.max(0, overlayOpacityRaw)) : 0

  if (backgroundType === "color") {
    sectionStyle.background = asString(formatting.backgroundColor)
  } else if (backgroundType === "gradient") {
    const from = asString(formatting.gradientFrom)
    const to = asString(formatting.gradientTo)
    const dir = asString(formatting.gradientDirection) || "to bottom"
    if (from && to) sectionStyle.backgroundImage = `linear-gradient(${dir}, ${from}, ${to})`
  } else if (backgroundType === "image") {
    const imageUrl = asString(formatting.backgroundImageUrl)
    const focalX = Number(formatting.backgroundFocalX)
    const focalY = Number(formatting.backgroundFocalY)
    const x = Number.isFinite(focalX) ? Math.min(100, Math.max(0, focalX)) : 50
    const y = Number.isFinite(focalY) ? Math.min(100, Math.max(0, focalY)) : 50
    if (imageUrl) {
      const gradientOverlay = overlayColor && overlayOpacity > 0
        ? `linear-gradient(color-mix(in srgb, ${overlayColor} ${Math.round(overlayOpacity * 100)}%, transparent), color-mix(in srgb, ${overlayColor} ${Math.round(overlayOpacity * 100)}%, transparent)), `
        : ""
      sectionStyle.backgroundImage = `${gradientOverlay}url(${imageUrl})`
      sectionStyle.backgroundSize = asString(formatting.backgroundSize) || "cover"
      sectionStyle.backgroundPosition = `${x}% ${y}%`
    }
  }

  const containerStyle: CSSProperties = {}
  const panelStyle: CSSProperties = {}
  const cssVars = containerStyle as CSSProperties & Record<string, string>
  const fontFamily = asString(formatting.fontFamily)
  if (fontFamily) containerStyle.fontFamily = fontFamily
  const textColor = asString(formatting.textColor)
  const mutedTextColor = asString(formatting.mutedTextColor)
  const accentColor = asString(formatting.accentColor)
  const backgroundColor = asString(formatting.backgroundColorToken)
  const shadowMode = asString(formatting.shadowMode)
  const innerShadowMode = asString(formatting.innerShadowMode)
  const innerShadowStrength = clampNumber(formatting.innerShadowStrength, 0, 1.8, 0)
  const effectiveShadowScale = clampNumber(formatting.shadowScale, 0, 1.8, 1)
  const effectiveInnerShadowScale = clampNumber(formatting.innerShadowScale, 0, 1.8, innerShadowStrength)
  if (textColor) {
    containerStyle.color = textColor
    cssVars["--foreground"] = textColor
    cssVars["--card-foreground"] = textColor
    cssVars["--muted-foreground"] = mutedTextColor || `color-mix(in srgb, ${textColor} 72%, transparent)`
  } else if (mutedTextColor) {
    cssVars["--muted-foreground"] = mutedTextColor
  }
  Object.assign(cssVars, accentDerivedVars(accentColor))
  if (backgroundColor) cssVars["--background"] = backgroundColor
  const outerShadowOn = shadowMode === "off" ? false : effectiveShadowScale > 0.01
  const innerShadowOn =
    innerShadowMode === "on"
      ? effectiveInnerShadowScale > 0.01
      : innerShadowMode === "off"
        ? false
        : effectiveInnerShadowScale > 0.01

  if (!outerShadowOn) {
    cssVars["--section-shadow-ambient"] = "none"
    cssVars["--section-shadow-lift"] = "none"
    cssVars["--shadow-sm"] = "none"
    cssVars["--shadow"] = "none"
    cssVars["--shadow-lg"] = "none"
  }

  if (innerShadowMode === "on") {
    cssVars["--section-inner-shadow"] = buildInnerShadow(effectiveInnerShadowScale)
  } else if (innerShadowMode === "off") {
    cssVars["--section-inner-shadow"] = "none"
  }

  ;(panelStyle as CSSProperties & Record<string, string>)["--section-shadow-color"] =
    asString(formatting.shadowColorToken) || "var(--section-shadow-color)"

  const panelOpacity = clampNumber(formatting.pagePanelOpacity, 0, 1, 1)
  const panelVars = panelStyle as CSSProperties & Record<string, string>
  panelVars["--page-panel-opacity"] = String(panelOpacity)
  panelVars["--panel-bg"] = `color-mix(in srgb, var(--card) ${Math.round(panelOpacity * 100)}%, transparent)`

  const boxShadowLayers: string[] = []
  if (outerShadowOn) boxShadowLayers.push("var(--section-shadow-ambient)", "var(--section-shadow-lift)")
  if (innerShadowOn) boxShadowLayers.push("var(--section-inner-shadow)")
  panelVars["--panel-shadow"] = boxShadowLayers.length ? boxShadowLayers.join(", ") : "var(--shadow-sm)"

  const widthMode = asString(formatting.widthMode)
  const align = asString(formatting.alignment)
  const spacingTop = asString(formatting.spacingTop)
  const spacingBottom = asString(formatting.spacingBottom)
  const outerSpacing = asString(formatting.outerSpacing)

  Object.assign(sectionStyle, spacingTokenToStyle(spacingTop, spacingBottom, outerSpacing))

  const cn = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(" ")

  return {
    sectionId: sectionKey ?? undefined,
    sectionClassName: cn(f.paddingY, f.sectionClass),
    containerClassName: cn(
      widthMode === "full" ? "max-w-none" : f.maxWidth || "max-w-5xl",
      align === "left" ? "ml-0 mr-auto" : align === "right" ? "ml-auto mr-0" : "mx-auto",
      f.containerClass,
      f.textAlignClass
    ),
    sectionStyle,
    containerStyle,
    panelStyle,
  }
}
