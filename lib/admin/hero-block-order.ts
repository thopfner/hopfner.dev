export const ALL_BLOCK_KEYS = ["ctas", "stats", "trust"] as const
export type BlockKey = (typeof ALL_BLOCK_KEYS)[number]
export const BLOCK_LABELS: Record<BlockKey, string> = { ctas: "CTAs", stats: "Stats", trust: "Trust" }

export function resolveHeroBlockOrder(raw: string[]): BlockKey[] {
  const valid = raw.filter((k): k is BlockKey => (ALL_BLOCK_KEYS as readonly string[]).includes(k))
  for (const k of ALL_BLOCK_KEYS) {
    if (!valid.includes(k)) valid.push(k)
  }
  return valid
}
