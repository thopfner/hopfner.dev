const WINDOW_MS = 15 * 60 * 1000 // 15 minutes
const MAX_PER_IP = 5
const MAX_PER_EMAIL = 3

type Entry = { count: number; expiresAt: number }

const ipMap = new Map<string, Entry>()
const emailMap = new Map<string, Entry>()

function cleanExpired(map: Map<string, Entry>) {
  const now = Date.now()
  for (const [key, entry] of map) {
    if (entry.expiresAt <= now) map.delete(key)
  }
}

function check(map: Map<string, Entry>, key: string, max: number): boolean {
  cleanExpired(map)
  const now = Date.now()
  const entry = map.get(key)

  if (!entry || entry.expiresAt <= now) {
    map.set(key, { count: 1, expiresAt: now + WINDOW_MS })
    return true
  }

  if (entry.count >= max) return false

  entry.count++
  return true
}

export function checkRateLimit(ip: string, email: string): { allowed: boolean; reason?: string } {
  if (!check(ipMap, ip, MAX_PER_IP)) {
    return { allowed: false, reason: "Too many requests from this IP. Please try again later." }
  }
  if (!check(emailMap, email.toLowerCase().trim(), MAX_PER_EMAIL)) {
    return { allowed: false, reason: "Too many requests for this email. Please try again later." }
  }
  return { allowed: true }
}
