import { createHmac } from "crypto"

export type N8nBookingPayload = {
  event: string
  intakeId: string | null
  calBookingUid: string
  attendee: {
    fullName: string
    workEmail: string
    company: string
    jobTitle: string
    functionArea: string
  }
  qualification: {
    teamSize: string
    currentTools: string
    mainBottleneck: string
    desiredOutcome90d: string
  }
  booking: {
    startUtc: string
    startLocal: string
    timezone: string
    rescheduleUrl: string
    cancelUrl: string
  }
  urls: {
    bookACall: string
    adminBookings: string
  }
}

/**
 * Fire a webhook to n8n with the booking payload.
 * Errors are logged but never thrown.
 */
export async function fireN8nWebhook(payload: N8nBookingPayload): Promise<boolean> {
  const url = process.env.N8N_WEBHOOK_URL
  if (!url) {
    console.log("[n8n] N8N_WEBHOOK_URL not configured, skipping")
    return false
  }

  try {
    const body = JSON.stringify(payload)
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    const secret = process.env.N8N_WEBHOOK_SECRET
    if (secret) {
      const signature = createHmac("sha256", secret).update(body).digest("hex")
      headers["x-webhook-signature"] = signature
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000)

    const res = await fetch(url, {
      method: "POST",
      headers,
      body,
      signal: controller.signal,
    })

    clearTimeout(timeout)

    if (!res.ok) {
      console.error(`[n8n] Webhook returned ${res.status}: ${await res.text().catch(() => "")}`)
      return false
    }

    return true
  } catch (err) {
    console.error("[n8n] Webhook failed:", err)
    return false
  }
}
