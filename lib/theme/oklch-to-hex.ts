/**
 * Convert an oklch() CSS color string to a hex #rrggbb string.
 * oklch(L C H) where L ∈ [0,1], C ∈ [0,0.4], H ∈ [0,360]
 */
export function oklchToHex(oklchStr: string, fallback = "#5b63e0"): string {
  const match = oklchStr.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*\)/)
  if (!match) return fallback

  const L = parseFloat(match[1])
  const C = parseFloat(match[2])
  const H = parseFloat(match[3])

  // oklch → oklab
  const hRad = (H * Math.PI) / 180
  const a = C * Math.cos(hRad)
  const b = C * Math.sin(hRad)

  // oklab → linear sRGB
  const l_ = L + 0.3963377774 * a + 0.2158037573 * b
  const m_ = L - 0.1055613458 * a - 0.0638541728 * b
  const s_ = L - 0.0894841775 * a - 1.2914855480 * b

  const l3 = l_ * l_ * l_
  const m3 = m_ * m_ * m_
  const s3 = s_ * s_ * s_

  const r_lin = +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3
  const g_lin = -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3
  const b_lin = -0.0041960863 * l3 - 0.7034186147 * m3 + 1.7076147010 * s3

  // linear sRGB → sRGB (gamma)
  const toSrgb = (c: number) => {
    const clamped = Math.max(0, Math.min(1, c))
    return clamped <= 0.0031308
      ? 12.92 * clamped
      : 1.055 * Math.pow(clamped, 1 / 2.4) - 0.055
  }

  const r = Math.round(toSrgb(r_lin) * 255)
  const g = Math.round(toSrgb(g_lin) * 255)
  const bl = Math.round(toSrgb(b_lin) * 255)

  const toHex = (n: number) => Math.max(0, Math.min(255, n)).toString(16).padStart(2, "0")
  return `#${toHex(r)}${toHex(g)}${toHex(bl)}`
}
