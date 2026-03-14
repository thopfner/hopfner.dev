"use client"

import { useState, useEffect } from "react"
import Cal, { getCalApi } from "@calcom/embed-react"

type Props = {
  calLink: string
  name?: string
  email?: string
  onBookingComplete?: () => void
}

function normalizeCalLink(raw: string): string {
  return raw.replace(/^https?:\/\/(www\.)?cal\.com\//, "")
}

function buildCalUrl(calLink: string, name?: string, email?: string): string {
  const params = [
    name ? `name=${encodeURIComponent(name)}` : "",
    email ? `email=${encodeURIComponent(email)}` : "",
  ].filter(Boolean).join("&")
  return `https://cal.com/${calLink}${params ? `?${params}` : ""}`
}

export function BookingCalEmbed({ calLink: rawCalLink, name, email, onBookingComplete }: Props) {
  const calLink = normalizeCalLink(rawCalLink)
  const [showFallback, setShowFallback] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const timer = setTimeout(() => {
      setShowFallback(true)
    }, 20000)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    if (!onBookingComplete) return
    let cancelled = false
    ;(async () => {
      const cal = await getCalApi()
      cal("on", {
        action: "bookingSuccessful",
        callback: () => {
          if (!cancelled) onBookingComplete()
        },
      })
    })()
    return () => { cancelled = true }
  }, [onBookingComplete])

  if (!mounted) return null

  return (
    <div>
      <Cal
        calLink={calLink}
        config={{
          ...(name ? { name } : {}),
          ...(email ? { email } : {}),
          layout: "month_view",
          theme: "dark",
        }}
        style={{ width: "100%", minHeight: "500px", overflow: "auto" }}
      />
      {!showFallback ? (
        <p className="text-xs text-muted-foreground text-center mt-3 animate-pulse">
          Loading calendar&hellip;
        </p>
      ) : (
        <p className="text-xs text-muted-foreground text-center mt-3">
          Having trouble?{" "}
          <a
            href={buildCalUrl(calLink, name, email)}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground transition-colors"
          >
            Open scheduling page &rarr;
          </a>
        </p>
      )}
    </div>
  )
}
