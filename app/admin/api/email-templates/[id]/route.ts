import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

type Params = { params: Promise<{ id: string }> }

export async function GET(_request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const supabase = getSupabaseAdmin()

  // Get latest version (prefer published, then draft)
  const { data: version, error } = await supabase
    .from("email_template_versions")
    .select("*")
    .eq("template_id", id)
    .in("status", ["published", "draft"])
    .order("version", { ascending: false })
    .limit(1)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ version })
}

export async function PUT(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const body = await request.json()
  const supabase = getSupabaseAdmin()

  // Handle enabled toggle
  if (typeof body.enabled === "boolean") {
    const { error } = await supabase
      .from("email_templates")
      .update({ enabled: body.enabled, updated_at: new Date().toISOString() })
      .eq("id", id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ ok: true })
  }

  // Handle version save
  if (body.version) {
    const v = body.version
    const publish = body.publish === true

    // Get current max version
    const { data: maxRow } = await supabase
      .from("email_template_versions")
      .select("version")
      .eq("template_id", id)
      .order("version", { ascending: false })
      .limit(1)
      .single()

    const nextVersion = (maxRow?.version || 0) + 1

    // If publishing, archive all previous published versions
    if (publish) {
      await supabase
        .from("email_template_versions")
        .update({ status: "archived", updated_at: new Date().toISOString() })
        .eq("template_id", id)
        .eq("status", "published")
    }

    // Also archive previous drafts
    await supabase
      .from("email_template_versions")
      .update({ status: "archived", updated_at: new Date().toISOString() })
      .eq("template_id", id)
      .eq("status", "draft")

    // Insert new version
    const { data: newVersion, error } = await supabase
      .from("email_template_versions")
      .insert({
        template_id: id,
        version: nextVersion,
        status: publish ? "published" : "draft",
        subject: v.subject || null,
        preview_text: v.preview_text || null,
        body_json: typeof v.body_json === "string" ? JSON.parse(v.body_json) : v.body_json,
        cta_label: v.cta_label || null,
        cta_href: v.cta_href || null,
      })
      .select("*")
      .single()

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
    return NextResponse.json({ version: newVersion })
  }

  return NextResponse.json({ error: "Invalid request" }, { status: 400 })
}
