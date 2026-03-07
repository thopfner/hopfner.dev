type ToastKind = "success" | "error" | "info"

type ApplyEditorErrorArgs = {
  error: unknown
  fallback: string
  setError: (message: string | null) => void
  pushToast?: (message: string, kind?: ToastKind) => void
}

function extractMessage(error: unknown): string | null {
  if (!error) return null
  if (typeof error === "string") return error.trim() || null
  if (error instanceof Error) return error.message?.trim() || null
  if (typeof error === "object") {
    const rec = error as Record<string, unknown>
    const direct = rec.message
    if (typeof direct === "string" && direct.trim()) return direct.trim()
    const nestedError = rec.error
    if (typeof nestedError === "string" && nestedError.trim()) return nestedError.trim()
    if (nestedError && typeof nestedError === "object") {
      const nested = (nestedError as Record<string, unknown>).message
      if (typeof nested === "string" && nested.trim()) return nested.trim()
    }
  }
  return null
}

export function toEditorErrorMessage(error: unknown, fallback: string): string {
  return extractMessage(error) ?? fallback
}

export function applyEditorError({ error, fallback, setError, pushToast }: ApplyEditorErrorArgs): void {
  const message = toEditorErrorMessage(error, fallback)
  setError(message)
  if (pushToast) pushToast(message, "error")
}
