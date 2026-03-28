import { NextResponse } from "next/server"

import { rollbackAgentDraftSnapshot } from "@/lib/agent/execution/snapshots"
import { readAgentDraftApplyResult } from "@/lib/agent/execution/idempotency"
import { AgentJobNotFoundError } from "@/lib/agent/jobs/errors"
import { getAgentJobDetail } from "@/lib/agent/jobs/service"
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
    const detail = await getAgentJobDetail(supabase, jobId)
    const phase3 = readAgentDraftApplyResult(detail.job.result)

    if (
      detail.job.status !== "completed" ||
      !phase3 ||
      phase3.applyState !== "applied" ||
      !phase3.rollbackSnapshotId
    ) {
      return NextResponse.json(
        { error: "Rollback is only available for completed apply-mode draft jobs." },
        { status: 400 }
      )
    }

    await rollbackAgentDraftSnapshot(supabase, phase3.rollbackSnapshotId)

    return NextResponse.json({
      ok: true,
      snapshotId: phase3.rollbackSnapshotId,
      touchedPageSlugs: phase3.touchedPageSlugs,
    })
  } catch (error) {
    if (error instanceof AgentJobNotFoundError) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    const message = error instanceof Error ? error.message : "Failed to rollback agent job."
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
