import { NextRequest, NextResponse } from "next/server"

import { getSupabaseAdmin } from "@/lib/supabase/server-admin"
import { validateIntakeSubmission, isHoneypotFilled } from "@/lib/booking/validation"
import { checkRateLimit } from "@/lib/booking/rate-limit"
import type { IntakeSubmission } from "@/lib/booking/types"

export async function POST(request: NextRequest) {
  let body: IntakeSubmission
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON" }, { status: 400 })
  }

  // Honeypot — return 200 silently so bots think it worked
  if (isHoneypotFilled(body)) {
    return NextResponse.json({ ok: true, intakeId: "00000000-0000-0000-0000-000000000000" })
  }

  // Rate limiting
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown"
  const email = (body.workEmail || "").trim()
  const rl = checkRateLimit(ip, email)
  if (!rl.allowed) {
    return NextResponse.json({ ok: false, error: rl.reason }, { status: 429 })
  }

  // Validation
  const errors = validateIntakeSubmission(body)
  if (errors.length > 0) {
    return NextResponse.json({ ok: false, errors }, { status: 422 })
  }

  // Persist
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase
    .from("booking_intakes")
    .insert({
      full_name: body.fullName?.trim(),
      work_email: body.workEmail?.trim().toLowerCase(),
      company: body.company?.trim() || null,
      job_title: body.jobTitle?.trim() || null,
      team_size: body.teamSize?.trim() || null,
      function_area: body.functionArea?.trim() || null,
      current_tools: body.currentTools?.trim() || null,
      main_bottleneck: body.mainBottleneck?.trim() || null,
      desired_outcome_90d: body.desiredOutcome90d?.trim() || null,
      intake_data: body,
      utm_source: body.utmSource || null,
      utm_medium: body.utmMedium || null,
      utm_campaign: body.utmCampaign || null,
      referrer: body.referrer || null,
      user_agent: request.headers.get("user-agent") || null,
      ip_address: ip,
      status: "submitted",
    })
    .select("id")
    .single()

  if (error) {
    console.error("[booking/intake] insert error:", error)
    return NextResponse.json({ ok: false, error: "Failed to save submission" }, { status: 500 })
  }

  return NextResponse.json({ ok: true, intakeId: data.id })
}
