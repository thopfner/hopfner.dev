"use client"

import { useState } from "react"

export function CookiePreferencesDialog({
  initialAnalytics,
  onSave,
  onCancel,
}: {
  initialAnalytics: boolean
  onSave: (analytics: boolean) => void
  onCancel: () => void
}) {
  const [analytics, setAnalytics] = useState(initialAnalytics)

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-background/60 backdrop-blur-sm"
        onClick={onCancel}
        aria-hidden
      />

      {/* Dialog */}
      <div className="relative w-full max-w-md rounded-xl border border-border/50 bg-card shadow-xl">
        <div className="border-b border-border/30 px-5 py-4">
          <h2 className="text-base font-semibold text-card-foreground">
            Cookie preferences
          </h2>
          <p className="mt-1 text-xs text-muted-foreground">
            Choose which cookies you allow. Your choice is saved locally.
          </p>
        </div>

        <div className="space-y-3 px-5 py-4">
          {/* Necessary — always on */}
          <div className="flex items-center justify-between rounded-lg border border-border/30 bg-muted/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-card-foreground">
                Necessary
              </p>
              <p className="text-xs text-muted-foreground">
                Required for the site to function. Always enabled.
              </p>
            </div>
            <div
              className="relative inline-flex h-5 w-9 cursor-not-allowed items-center rounded-full bg-accent/60 opacity-60"
              aria-label="Necessary cookies always enabled"
            >
              <span className="absolute right-0.5 h-4 w-4 rounded-full bg-accent-foreground shadow-sm" />
            </div>
          </div>

          {/* Analytics — toggleable */}
          <div className="flex items-center justify-between rounded-lg border border-border/30 px-4 py-3">
            <div>
              <p className="text-sm font-medium text-card-foreground">
                Analytics
              </p>
              <p className="text-xs text-muted-foreground">
                Helps us understand how you use the site.
              </p>
            </div>
            <button
              type="button"
              role="switch"
              aria-checked={analytics}
              onClick={() => setAnalytics(!analytics)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                analytics ? "bg-accent" : "bg-muted"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-card-foreground shadow-sm transition-transform ${
                  analytics ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 border-t border-border/30 px-5 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border/50 bg-background/50 px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSave(analytics)}
            className="rounded-lg bg-accent px-4 py-2 text-xs font-medium text-accent-foreground transition-colors hover:bg-accent/90"
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  )
}
