import { Resend } from "resend"
import { getSupabaseAdmin } from "@/lib/supabase/server-admin"
import { renderEmailLayout } from "./email-layout"
import { resolveEmailColors } from "@/lib/theme/resolve-email-colors"

let resendClient: Resend | null = null

function getResend(): Resend {
  if (resendClient) return resendClient
  const key = process.env.RESEND_API_KEY
  if (!key) throw new Error("Missing RESEND_API_KEY")
  resendClient = new Resend(key)
  return resendClient
}

export type EmailVariables = Record<string, string>

type BodyColors = { text: string; muted: string; border: string }

/**
 * Load a published email template by key, resolve variables, render layout, and send via Resend.
 * Errors are logged but never thrown — callers should not depend on email success.
 */
export async function sendBookingEmail(templateKey: string, variables: EmailVariables): Promise<boolean> {
  try {
    const supabase = getSupabaseAdmin()

    // Load template
    const { data: template, error: tplErr } = await supabase
      .from("email_templates")
      .select("id, enabled")
      .eq("key", templateKey)
      .single()

    if (tplErr || !template) {
      console.error(`[email] Template not found: ${templateKey}`, tplErr)
      return false
    }

    if (!template.enabled) {
      console.log(`[email] Template disabled: ${templateKey}`)
      return false
    }

    // Load published version
    const { data: version, error: verErr } = await supabase
      .from("email_template_versions")
      .select("subject, preview_text, body_json, cta_label, cta_href")
      .eq("template_id", template.id)
      .eq("status", "published")
      .order("version", { ascending: false })
      .limit(1)
      .single()

    if (verErr || !version) {
      console.error(`[email] No published version for template: ${templateKey}`, verErr)
      return false
    }

    // Load site theme colors
    const colors = await resolveEmailColors()

    // Load branding (logo, footer) from email_theme_settings
    const { data: theme } = await supabase
      .from("email_theme_settings")
      .select("logo_url, footer_text")
      .limit(1)
      .single()

    // Resolve variables in subject and body
    const subject = resolveVariables(version.subject || "", variables)
    const previewText = resolveVariables(version.preview_text || "", variables)
    const bodyHtml = resolveBodyJson(version.body_json, variables, {
      text: colors.text,
      muted: colors.muted,
      border: "#2a2a2a",
    })
    const ctaLabel = resolveVariables(version.cta_label || "", variables)
    const ctaHref = resolveVariables(version.cta_href || "", variables)

    // Render full email HTML
    const html = renderEmailLayout({
      bodyHtml,
      subject,
      previewText,
      ctaLabel,
      ctaHref,
      theme: theme || undefined,
      colors,
    })

    // Determine recipient
    const to = variables.work_email || variables.workEmail || ""
    const isInternal = templateKey.endsWith("_internal")
    const recipient = isInternal
      ? (process.env.RESEND_REPLY_TO_EMAIL || process.env.RESEND_FROM_EMAIL || "")
      : to

    if (!recipient) {
      console.error(`[email] No recipient for template: ${templateKey}`)
      return false
    }

    const resend = getResend()
    const { error: sendErr } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "noreply@example.com",
      to: recipient,
      replyTo: process.env.RESEND_REPLY_TO_EMAIL || undefined,
      subject,
      html,
    })

    if (sendErr) {
      console.error(`[email] Send failed for ${templateKey}:`, sendErr)
      return false
    }

    return true
  } catch (err) {
    console.error(`[email] Unexpected error sending ${templateKey}:`, err)
    return false
  }
}

function resolveVariables(template: string, vars: EmailVariables): string {
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] || "")
}

export function resolveBodyJson(bodyJson: unknown, vars: EmailVariables, colors: BodyColors): string {
  if (typeof bodyJson === "string") {
    return resolveVariables(bodyJson, vars)
  }
  if (Array.isArray(bodyJson)) {
    return bodyJson
      .map((block) => {
        if (typeof block === "string") return resolveVariables(block, vars)
        if (block && typeof block === "object") {
          const b = block as Record<string, unknown>
          const content = typeof b.content === "string" ? resolveVariables(b.content, vars) : ""
          switch (b.type) {
            case "heading":
              return `<h2 style="margin:0 0 8px;font-size:20px;font-weight:600;letter-spacing:-0.01em;color:${colors.text}">${content}</h2>`
            case "paragraph":
              return `<p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:${colors.muted}">${content}</p>`
            case "divider":
              return `<hr style="border:none;border-top:1px solid ${colors.border};margin:16px 0" />`
            default:
              return `<p style="margin:0 0 12px;font-size:14px;line-height:1.7;color:${colors.muted}">${content}</p>`
          }
        }
        return ""
      })
      .join("\n")
  }
  return ""
}
