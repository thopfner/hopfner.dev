import { NextResponse } from "next/server"

import { AgentJobNotFoundError } from "@/lib/agent/jobs/errors"
import { cancelAgentJob } from "@/lib/agent/jobs/service"
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
    const result = await cancelAgentJob(supabase, {
      jobId,
      requestedBy: guard.userId,
    })

    return NextResponse.json({
      ok: true,
      transition: result.transition,
      cancellationState: result.cancellationState,
      job: result.job,
    })
  } catch (error) {
    if (error instanceof AgentJobNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    const message = error instanceof Error ? error.message : "Failed to cancel agent job."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
