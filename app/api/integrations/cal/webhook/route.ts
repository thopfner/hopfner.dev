import { NextRequest, NextResponse } from "next/server"
import { createHmac, timingSafeEqual } from "crypto"

import { getSupabaseAdmin } from "@/lib/supabase/server-admin"
import { sendBookingEmail, type EmailVariables } from "@/lib/booking/email"
import { fireN8nWebhook, type N8nBookingPayload } from "@/lib/booking/n8n"

function verifySignature(payload: string, rawSignature: string | null, secret: string): boolean {
  if (!rawSignature) return false
  // Cal.com may send raw hex or prefixed with "sha256="
  const signature = rawSignature.replace(/^sha256=/, "")
  const expected = createHmac("sha256", secret).update(payload).digest("hex")
  try {
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(expected, "hex"))
  } catch {
    return false
  }
}

type CalAttendee = {
  name?: string
  email?: string
  timeZone?: string
}

type CalPayload = {
  triggerEvent?: string
  payload?: {
    uid?: string
    title?: string
    startTime?: string
    endTime?: string
    organizer?: CalAttendee
    attendees?: CalAttendee[]
    rescheduleUid?: string
    metadata?: Record<string, unknown>
    responses?: Record<string, unknown>
  }
}

export async function POST(request: NextRequest) {
  const secret = process.env.CAL_WEBHOOK_SECRET
  const rawBody = await request.text()

  // Verify HMAC if secret is configured
  if (secret) {
    // Cal.com uses x-cal-signature-256; check common alternatives too
    const signature =
      request.headers.get("x-cal-signature-256") ||
      request.headers.get("x-webhook-signature") ||
      request.headers.get("x-signature")
    if (!signature || signature === "no-secret-provided") {
      // Cal.com ping test doesn't sign — accept it but don't process
      console.log("[cal/webhook] Unsigned request (Cal.com ping test)")
      return NextResponse.json({ ok: true, ping: true })
    }
    if (!verifySignature(rawBody, signature, secret)) {
      console.error("[cal/webhook] Invalid signature — received header value:", signature.slice(0, 16) + "...")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }
  }

  let body: CalPayload
  try {
    body = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const eventType = body.triggerEvent || "UNKNOWN"
  const calPayload = body.payload || {}
  const calBookingUid = calPayload.uid || ""

  if (!calBookingUid) {
    return NextResponse.json({ error: "Missing booking UID" }, { status: 400 })
  }

  const supabase = getSupabaseAdmin()

  // Deduplicate by (cal_booking_uid, event_type)
  const dedupeKey = `${calBookingUid}:${eventType}`
  const { data: existing } = await supabase
    .from("booking_webhook_events")
    .select("id")
    .eq("dedupe_key", dedupeKey)
    .limit(1)
    .single()

  if (existing) {
    return NextResponse.json({ ok: true, deduplicated: true })
  }

  // Extract attendee info
  const attendees = calPayload.attendees || []
  const attendee = attendees[0] || {}
  const attendeeEmail = (attendee.email || "").toLowerCase().trim()
  const attendeeName = attendee.name || ""
  const timezone = attendee.timeZone || "UTC"

  // Find matching intake by email (most recent)
  let intakeId: string | null = null
  let intakeData: Record<string, string> = {}

  if (attendeeEmail) {
    const { data: intake } = await supabase
      .from("booking_intakes")
      .select("*")
      .eq("work_email", attendeeEmail)
      .order("created_at", { ascending: false })
      .limit(1)
      .single()

    if (intake) {
      intakeId = intake.id
      intakeData = {
        fullName: intake.full_name || "",
        workEmail: intake.work_email || "",
        company: intake.company || "",
        jobTitle: intake.job_title || "",
        teamSize: intake.team_size || "",
        functionArea: intake.function_area || "",
        currentTools: intake.current_tools || "",
        mainBottleneck: intake.main_bottleneck || "",
        desiredOutcome90d: intake.desired_outcome_90d || "",
      }
    }
  }

  // Map Cal event type to our status
  const statusMap: Record<string, string> = {
    BOOKING_CREATED: "booked",
    BOOKING_RESCHEDULED: "rescheduled",
    BOOKING_CANCELLED: "cancelled",
  }
  const newStatus = statusMap[eventType] || "booked"

  // Update intake status
  if (intakeId) {
    await supabase
      .from("booking_intakes")
      .update({
        cal_booking_uid: calBookingUid,
        status: newStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", intakeId)
  }

  // Build reschedule/cancel URLs
  const baseUrl = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "")
  const rescheduleUrl = `https://cal.com/reschedule/${calBookingUid}`
  const cancelUrl = `https://cal.com/cancel/${calBookingUid}`

  // Format booking time
  const startUtc = calPayload.startTime || ""
  const startLocal = startUtc
    ? new Date(startUtc).toLocaleString("en-US", { timeZone: timezone, dateStyle: "full", timeStyle: "short" })
    : ""

  // Insert webhook event
  const emailVars: EmailVariables = {
    first_name: (intakeData.fullName || attendeeName).split(" ")[0] || "",
    full_name: intakeData.fullName || attendeeName,
    work_email: intakeData.workEmail || attendeeEmail,
    company: intakeData.company || "",
    job_title: intakeData.jobTitle || "",
    function_area: intakeData.functionArea || "",
    booking_status: newStatus,
    booking_start_local: startLocal,
    booking_start_utc: startUtc,
    booking_timezone: timezone,
    reschedule_url: rescheduleUrl,
    cancel_url: cancelUrl,
    book_a_call_url: `${baseUrl}/book-a-call`,
  }

  // Send emails based on event type
  let resendStatus = "skipped"
  const templateMap: Record<string, { client: string; internal: string }> = {
    BOOKING_CREATED: { client: "booking_confirmed_client", internal: "booking_confirmed_internal" },
    BOOKING_RESCHEDULED: { client: "booking_rescheduled_client", internal: "booking_rescheduled_internal" },
    BOOKING_CANCELLED: { client: "booking_cancelled_client", internal: "booking_cancelled_internal" },
  }

  const templates = templateMap[eventType]
  if (templates) {
    const [clientOk, internalOk] = await Promise.all([
      sendBookingEmail(templates.client, emailVars),
      sendBookingEmail(templates.internal, emailVars),
    ])
    resendStatus = clientOk || internalOk ? "sent" : "failed"
  }

  // Fire n8n webhook
  let n8nStatus = "skipped"
  const n8nPayload: N8nBookingPayload = {
    event: eventType,
    intakeId,
    calBookingUid,
    attendee: {
      fullName: intakeData.fullName || attendeeName,
      workEmail: intakeData.workEmail || attendeeEmail,
      company: intakeData.company || "",
      jobTitle: intakeData.jobTitle || "",
      functionArea: intakeData.functionArea || "",
    },
    qualification: {
      teamSize: intakeData.teamSize || "",
      currentTools: intakeData.currentTools || "",
      mainBottleneck: intakeData.mainBottleneck || "",
      desiredOutcome90d: intakeData.desiredOutcome90d || "",
    },
    booking: {
      startUtc,
      startLocal,
      timezone,
      rescheduleUrl,
      cancelUrl,
    },
    urls: {
      bookACall: `${baseUrl}/book-a-call`,
      adminBookings: `${baseUrl}/admin/bookings`,
    },
  }

  const n8nOk = await fireN8nWebhook(n8nPayload)
  n8nStatus = n8nOk ? "sent" : "failed"

  // Persist webhook event
  await supabase.from("booking_webhook_events").insert({
    cal_booking_uid: calBookingUid,
    event_type: eventType,
    dedupe_key: dedupeKey,
    payload: body,
    signature_valid: true,
    resend_status: resendStatus,
    n8n_status: n8nStatus,
    intake_id: intakeId,
  })

  return NextResponse.json({ ok: true })
}
