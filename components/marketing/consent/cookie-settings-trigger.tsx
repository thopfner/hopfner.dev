"use client"

export function CookieSettingsTrigger({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      type="button"
      onClick={onOpen}
      aria-label="Cookie settings"
      className="fixed bottom-4 left-4 z-[9998] flex h-8 items-center gap-1.5 rounded-full border border-border/40 bg-card/90 px-3 text-[11px] font-medium text-muted-foreground shadow-sm backdrop-blur-sm transition-all hover:border-border/60 hover:text-foreground hover:shadow-md"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <circle cx="12" cy="12" r="3" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </svg>
      Cookies
    </button>
  )
}
