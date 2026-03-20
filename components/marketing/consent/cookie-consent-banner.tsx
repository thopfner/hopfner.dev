"use client"

export function CookieConsentBanner({
  onAcceptAll,
  onRejectAll,
  onManage,
}: {
  onAcceptAll: () => void
  onRejectAll: () => void
  onManage: () => void
}) {
  return (
    <div
      role="dialog"
      aria-label="Cookie consent"
      className="fixed inset-x-0 bottom-0 z-[9999] p-4 sm:p-6"
    >
      <div className="mx-auto max-w-2xl rounded-xl border border-border/50 bg-card/95 shadow-lg backdrop-blur-md">
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-5">
          <p className="flex-1 text-sm leading-relaxed text-card-foreground/80">
            We use cookies to understand how you use our site and improve your
            experience. You can accept, reject, or manage your preferences.
          </p>
          <div className="flex shrink-0 flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onRejectAll}
              className="rounded-lg border border-border/50 bg-background/50 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Reject all
            </button>
            <button
              type="button"
              onClick={onManage}
              className="rounded-lg border border-border/50 bg-background/50 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
            >
              Manage
            </button>
            <button
              type="button"
              onClick={onAcceptAll}
              className="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/90"
            >
              Accept all
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
