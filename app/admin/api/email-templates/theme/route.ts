import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"

export async function GET() {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const supabase = getSupabaseAdmin()
  const { data: theme, error } = await supabase
    .from("email_theme_settings")
    .select("id, logo_url, footer_text")
    .limit(1)
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ theme })
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const body = await request.json()
  const supabase = getSupabaseAdmin()

  const payload = {
    logo_url: body.logo_url || null,
    footer_text: body.footer_text,
    updated_at: new Date().toISOString(),
  }

  // Get existing theme ID
  const { data: existing } = await supabase
    .from("email_theme_settings")
    .select("id")
    .limit(1)
    .single()

  if (existing) {
    const { error } = await supabase
      .from("email_theme_settings")
      .update(payload)
      .eq("id", existing.id)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  } else {
    const { error } = await supabase
      .from("email_theme_settings")
      .insert(payload)

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
