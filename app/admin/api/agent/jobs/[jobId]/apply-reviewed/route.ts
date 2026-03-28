import { NextResponse } from "next/server"

import { AgentJobNotFoundError, AgentJobValidationError } from "@/lib/agent/jobs/errors"
import {
  createReviewedPlanApplyJob,
  findActiveAgentJobConflict,
} from "@/lib/agent/jobs/service"
import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export const runtime = "nodejs"

type Params = {
  params: Promise<{ jobId: string }>
}

export async function POST(_request: Request, { params }: Params) {
  const guard = await requireAdmin()
  if (!guard.ok) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    const { jobId } = await params
    const supabase = getSupabaseAdmin()
    const activeConflict = await findActiveAgentJobConflict(supabase, "site_build_draft")

    if (activeConflict) {
      return NextResponse.json(
        {
          error: "A site_build_draft job is already active on this deployment.",
          conflict: activeConflict,
        },
        { status: 409 }
      )
    }

    const job = await createReviewedPlanApplyJob(supabase, {
      sourceJobId: jobId,
      requestedBy: guard.userId,
    })

    return NextResponse.json(
      {
        ok: true,
        sourceJobId: jobId,
        job,
      },
      { status: 201 }
    )
  } catch (error) {
    if (error instanceof AgentJobNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    if (error instanceof AgentJobValidationError) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    const message =
      error instanceof Error ? error.message : "Failed to create reviewed-plan apply job."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
