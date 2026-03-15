import type { EmailColors } from "@/lib/theme/resolve-email-colors"

type EmailTheme = {
  logo_url?: string
  footer_text?: string
}

type LayoutOptions = {
  bodyHtml: string
  subject: string
  previewText?: string
  ctaLabel?: string
  ctaHref?: string
  theme?: EmailTheme
  colors?: EmailColors
}

export function renderEmailLayout({
  bodyHtml,
  subject,
  previewText,
  ctaLabel,
  ctaHref,
  theme,
  colors,
}: LayoutOptions): string {
  const primaryColor = colors?.primary || "#5b63e0"
  const bgColor = colors?.background || "#141414"
  const cardBg = colors?.cardBackground || "#1e1e22"
  const textColor = colors?.text || "#fafafa"
  const mutedColor = colors?.muted || "#b0b0b0"
  const accentLight = colors?.accentLight || "#7a82e8"
  const footerText = theme?.footer_text || "hopfner.dev"
  const logoUrl = theme?.logo_url || ""

  const ctaHtml = ctaLabel && ctaHref
    ? `<table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:24px 0">
        <tr>
          <td style="background:linear-gradient(135deg, ${primaryColor}, ${accentLight});border-radius:8px;padding:14px 32px">
            <a href="${escapeHtml(ctaHref)}" style="color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;display:inline-block">${escapeHtml(ctaLabel)}</a>
          </td>
        </tr>
      </table>`
    : ""

  const logoHtml = logoUrl
    ? `<img src="${escapeHtml(logoUrl)}" alt="" width="140" style="display:block;margin:0 auto 24px;max-width:140px" />`
    : ""

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(subject)}</title>
  <!--[if mso]><noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript><![endif]-->
</head>
<body style="margin:0;padding:0;background-color:${bgColor};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:${textColor}">
  ${previewText ? `<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(previewText)}${"&zwnj;&nbsp;".repeat(40)}</div>` : ""}
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color:${bgColor}">
    <tr>
      <td align="center" style="padding:32px 16px">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px;background-color:${cardBg};border-radius:12px;border:1px solid #2a2a2a;border-top:4px solid ${primaryColor}">
          <tr>
            <td style="padding:40px 36px">
              ${logoHtml}
              ${bodyHtml}
              ${ctaHtml}
            </td>
          </tr>
        </table>
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="max-width:600px">
          <tr>
            <td style="padding:24px 36px 16px;text-align:center;font-size:13px;color:${mutedColor}">
              Sent by ${escapeHtml(footerText)}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export type { EmailTheme }

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
}
