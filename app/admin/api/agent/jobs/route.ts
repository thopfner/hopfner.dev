import { NextResponse } from "next/server"

import { assertNoReviewedPlanApplyPayload } from "@/lib/agent/execution/reviewed-apply"
import { AgentJobValidationError } from "@/lib/agent/jobs/errors"
import { assertAgentJobKind } from "@/lib/agent/jobs/lifecycle"
import { enqueueAgentJob, findActiveAgentJobConflict, listAgentJobs } from "@/lib/agent/jobs/service"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

const DEFAULT_LIMIT = 50
const MAX_LIMIT = 200

function parseListLimit(url: URL) {
  const rawLimit = Number(url.searchParams.get("limit") ?? DEFAULT_LIMIT)
  return Number.isFinite(rawLimit)
    ? Math.min(Math.max(Math.trunc(rawLimit), 1), MAX_LIMIT)
    : DEFAULT_LIMIT
}

export async function GET(request: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    const supabase = getSupabaseAdmin()
    const limit = parseListLimit(new URL(request.url))
    const jobs = await listAgentJobs(supabase, { limit })
    return NextResponse.json({ jobs })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to list agent jobs."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    const supabase = getSupabaseAdmin()
    const body = (await request.json().catch(() => ({}))) as {
      kind?: unknown
      payload?: unknown
    }
    const kind = typeof body.kind === "string" ? body.kind : ""
    const normalizedKind = assertAgentJobKind(kind)
    if (normalizedKind === "site_build_draft") {
      assertNoReviewedPlanApplyPayload(body.payload)
    }
    const activeConflict = await findActiveAgentJobConflict(supabase, normalizedKind)

    if (activeConflict) {
      return NextResponse.json(
        {
          error: `A ${normalizedKind} job is already active on this deployment.`,
          conflict: activeConflict,
        },
        { status: 409 }
      )
    }

    const job = await enqueueAgentJob(supabase, {
      kind: normalizedKind,
      payload: body.payload,
      requestedBy: guard.userId,
    })

    return NextResponse.json({ job }, { status: 201 })
  } catch (error) {
    if (error instanceof AgentJobValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const message = error instanceof Error ? error.message : "Failed to enqueue agent job."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
