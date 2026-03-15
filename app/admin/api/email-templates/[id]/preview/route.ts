import { NextRequest, NextResponse } from "next/server"

import { requireAdmin } from "@/lib/auth/require-admin"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"
import { renderEmailLayout } from "@/lib/booking/email-layout"
import { resolveBodyJson } from "@/lib/booking/email"
import { resolveEmailColors } from "@/lib/theme/resolve-email-colors"

type Params = { params: Promise<{ id: string }> }

export async function POST(request: NextRequest, { params }: Params) {
  const auth = await requireAdmin()
  if (!auth.ok) return NextResponse.json({ error: auth.error }, { status: auth.status })

  const { id } = await params
  const body = await request.json()
  const variables: Record<string, string> = body.variables || {}
  const versionOverride = body.version

  const supabase = getSupabaseAdmin()

  // Load site theme colors
  const colors = await resolveEmailColors()

  // Load branding (logo, footer)
  const { data: theme } = await supabase
    .from("email_theme_settings")
    .select("logo_url, footer_text")
    .limit(1)
    .single()

  // Use version override if provided, otherwise load from DB
  let version = versionOverride
  if (!version) {
    const { data, error } = await supabase
      .from("email_template_versions")
      .select("*")
      .eq("template_id", id)
      .in("status", ["published", "draft"])
      .order("version", { ascending: false })
      .limit(1)
      .single()

    if (error || !data) {
      return NextResponse.json({ error: "No version found" }, { status: 404 })
    }
    version = data
  }

  // Resolve variables
  const resolveVars = (str: string) =>
    str.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] || `{{${key}}}`)

  const subject = resolveVars(version.subject || "")
  const previewText = resolveVars(version.preview_text || "")
  const ctaLabel = resolveVars(version.cta_label || "")
  const ctaHref = resolveVars(version.cta_href || "")

  // Resolve body using shared theme-aware resolver
  const bodyHtml = resolveBodyJson(
    version.body_json,
    variables,
    { text: colors.text, muted: colors.muted, border: "#2a2a2a" },
  )

  const html = renderEmailLayout({
    bodyHtml,
    subject,
    previewText,
    ctaLabel,
    ctaHref,
    theme: theme || undefined,
    colors,
  })

  return NextResponse.json({ html })
}
