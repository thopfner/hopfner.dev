import { cache } from "react"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"
import { oklchToHex } from "./oklch-to-hex"

export type EmailColors = {
  primary: string
  accentLight: string
  background: string
  cardBackground: string
  text: string
  muted: string
}

const FALLBACKS: EmailColors = {
  primary: "#5b63e0",
  accentLight: "#7a82e8",
  background: "#141414",
  cardBackground: "#1e1e22",
  text: "#fafafa",
  muted: "#b0b0b0",
}

/**
 * Read site theme tokens from site_formatting_settings and convert oklch → hex
 * for email-compatible colors. Deduplicated per request via React cache().
 */
export const resolveEmailColors = cache(async (): Promise<EmailColors> => {
  try {
    const supabase = getSupabaseAdmin()
    const { data } = await supabase
      .from("site_formatting_settings")
      .select("settings")
      .eq("id", "default")
      .single()

    const tokens = data?.settings?.tokens
    if (!tokens) return FALLBACKS

    const primary = tokens.accentColor
      ? oklchToHex(tokens.accentColor, FALLBACKS.primary)
      : FALLBACKS.primary

    // Derive accentLight by bumping lightness +0.08
    let accentLight = FALLBACKS.accentLight
    if (tokens.accentColor) {
      const match = tokens.accentColor.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/)
      if (match) {
        const bumpedL = Math.min(1, parseFloat(match[1]) + 0.08)
        accentLight = oklchToHex(`oklch(${bumpedL} ${match[2]} ${match[3]})`, FALLBACKS.accentLight)
      }
    }

    const background = tokens.backgroundColor
      ? oklchToHex(tokens.backgroundColor, FALLBACKS.background)
      : FALLBACKS.background

    const cardBackground = tokens.cardBackgroundColor
      ? oklchToHex(tokens.cardBackgroundColor, FALLBACKS.cardBackground)
      : FALLBACKS.cardBackground

    const text = tokens.textColor
      ? oklchToHex(tokens.textColor, FALLBACKS.text)
      : FALLBACKS.text

    const muted = tokens.mutedTextColor
      ? oklchToHex(tokens.mutedTextColor, FALLBACKS.muted)
      : FALLBACKS.muted

    return { primary, accentLight, background, cardBackground, text, muted }
  } catch {
    return FALLBACKS
  }
})
