import type { EditorDraft, EditorDraftMeta } from "./types"

// ---------------------------------------------------------------------------
// Path utilities
// ---------------------------------------------------------------------------

/** Get a value at a dot-separated path within a nested object/array tree. */
export function getAtPath(obj: unknown, path: string): unknown {
  if (!path) return obj
  const parts = path.split(".")
  let current = obj
  for (const part of parts) {
    if (current == null || typeof current !== "object") return undefined
    if (Array.isArray(current)) {
      const idx = Number(part)
      current = Number.isFinite(idx) ? current[idx] : undefined
    } else {
      current = (current as Record<string, unknown>)[part]
    }
  }
  return current
}

/** Immutably set a value at a dot-separated path. */
export function setAtPath(
  obj: Record<string, unknown>,
  path: string,
  value: unknown
): Record<string, unknown> {
  const parts = path.split(".")
  if (parts.length === 1) {
    return { ...obj, [parts[0]]: value }
  }
  const [head, ...rest] = parts
  const restPath = rest.join(".")
  const existing = obj[head]
  if (Array.isArray(existing)) {
    const idx = Number(rest[0])
    const next = existing.slice()
    if (rest.length === 1) {
      next[idx] = value
    } else {
      const item = next[idx]
      next[idx] = setAtPath(
        item && typeof item === "object" && !Array.isArray(item)
          ? (item as Record<string, unknown>)
          : {},
        rest.slice(1).join("."),
        value
      )
    }
    return { ...obj, [head]: next }
  }
  const child =
    existing && typeof existing === "object" && !Array.isArray(existing)
      ? (existing as Record<string, unknown>)
      : {}
  return { ...obj, [head]: setAtPath(child, restPath, value) }
}

// ---------------------------------------------------------------------------
// Shallow value comparison (no serialization)
// ---------------------------------------------------------------------------

/** Cheaply compare two values. Primitives use ===. Objects/arrays use shallow key check. */
function valuesEqualShallow(a: unknown, b: unknown): boolean {
  if (a === b) return true
  if (a == null || b == null) return a === b
  if (typeof a !== typeof b) return false
  if (typeof a !== "object") return false
  // Both are objects — shallow compare
  if (Array.isArray(a) !== Array.isArray(b)) return false
  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false
    }
    return true
  }
  const aObj = a as Record<string, unknown>
  const bObj = b as Record<string, unknown>
  const aKeys = Object.keys(aObj)
  const bKeys = Object.keys(bObj)
  if (aKeys.length !== bKeys.length) return false
  for (const key of aKeys) {
    if (aObj[key] !== bObj[key]) return false
  }
  return true
}

// ---------------------------------------------------------------------------
// Full dirty computation (used only at hydrate / reset time, not hot path)
// ---------------------------------------------------------------------------

export function computeDirtyPaths(
  current: EditorDraft,
  base: EditorDraft | null
): Set<string> {
  if (!base) return new Set<string>()

  const dirty = new Set<string>()

  // Meta fields — cheap string comparison
  const metaKeys: (keyof EditorDraftMeta)[] = [
    "title",
    "subtitle",
    "ctaPrimaryLabel",
    "ctaPrimaryHref",
    "ctaSecondaryLabel",
    "ctaSecondaryHref",
    "backgroundMediaUrl",
  ]
  for (const key of metaKeys) {
    if (current.meta[key] !== base.meta[key]) {
      dirty.add(`meta.${key}`)
    }
  }

  // Formatting — shallow key comparison (no serialization)
  if (!isFormattingClean(current.formatting, base.formatting)) {
    dirty.add("formatting")
  }

  // Content — shallow top-level key comparison
  if (!isContentClean(current.content, base.content)) {
    dirty.add("content")
  }

  return dirty
}

// ---------------------------------------------------------------------------
// Formatting comparison (shallow, no serialization)
// ---------------------------------------------------------------------------

function isFormattingClean(
  current: Record<string, unknown>,
  base: Record<string, unknown>
): boolean {
  const allKeys = new Set([...Object.keys(current), ...Object.keys(base)])
  for (const key of allKeys) {
    if (current[key] !== base[key]) return false
  }
  return true
}

// ---------------------------------------------------------------------------
// Content comparison (shallow top-level, no serialization)
// ---------------------------------------------------------------------------

function isContentClean(
  current: Record<string, unknown>,
  base: Record<string, unknown>
): boolean {
  const allKeys = new Set([...Object.keys(current), ...Object.keys(base)])
  for (const key of allKeys) {
    if (current[key] !== base[key]) return false
  }
  return true
}

// ---------------------------------------------------------------------------
// Incremental dirty updates (hot path — no serialization)
// ---------------------------------------------------------------------------

/** Update dirty paths for a single meta field change. */
export function updateDirtyPathForMeta(
  dirtyPaths: Set<string>,
  field: keyof EditorDraftMeta,
  currentValue: string,
  base: EditorDraft | null
): Set<string> {
  const path = `meta.${field}`
  const baseValue = base?.meta[field] ?? ""
  const next = new Set(dirtyPaths)
  if (currentValue === baseValue) {
    next.delete(path)
  } else {
    next.add(path)
  }
  return next
}

/** Update dirty path for a single content path change. No deep comparison. */
export function updateDirtyPathForContentPath(
  dirtyPaths: Set<string>,
  path: string,
  currentValue: unknown,
  base: EditorDraft | null
): Set<string> {
  const dirtyKey = `content.${path}`
  const baseValue = base ? getAtPath(base.content, path) : undefined
  const next = new Set(dirtyPaths)
  if (valuesEqualShallow(currentValue, baseValue)) {
    next.delete(dirtyKey)
  } else {
    next.add(dirtyKey)
  }
  return next
}

/** Update dirty path for a single formatting path change. No deep comparison. */
export function updateDirtyPathForFormattingPath(
  dirtyPaths: Set<string>,
  path: string,
  currentValue: unknown,
  base: EditorDraft | null
): Set<string> {
  const dirtyKey = `formatting.${path}`
  const baseValue = base ? getAtPath(base.formatting, path) : undefined
  const next = new Set(dirtyPaths)
  if (valuesEqualShallow(currentValue, baseValue)) {
    next.delete(dirtyKey)
  } else {
    next.add(dirtyKey)
  }
  return next
}

/** Mark formatting dirty/clean after a bulk formatting update. Shallow comparison. */
export function updateDirtyPathForFormatting(
  dirtyPaths: Set<string>,
  currentFormatting: Record<string, unknown>,
  base: EditorDraft | null
): Set<string> {
  const next = new Set(dirtyPaths)
  if (base && isFormattingClean(currentFormatting, base.formatting)) {
    next.delete("formatting")
  } else if (base) {
    next.add("formatting")
  }
  return next
}

/** Mark content dirty after a bulk content update (add/remove operations). Always marks dirty. */
export function updateDirtyPathForContent(
  dirtyPaths: Set<string>,
  _currentContent: Record<string, unknown>,
  base: EditorDraft | null
): Set<string> {
  const next = new Set(dirtyPaths)
  if (base) {
    next.add("content")
  }
  return next
}
