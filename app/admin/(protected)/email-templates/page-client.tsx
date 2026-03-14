"use client"

import { useEffect, useState, useCallback } from "react"
import {
  Box,
  Button,
  Divider,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
  Switch,
  Alert,
  Chip,
  Stack,
} from "@mui/material"
import { MediaPickerMenu } from "@/components/media-picker-menu"
import { MediaLibraryModal } from "@/components/media-library-modal"
import { uploadMedia } from "@/lib/media/upload"
import type { MediaItem } from "@/lib/media/types"

type EmailTemplate = {
  id: string
  key: string
  name: string
  enabled: boolean
}

type EmailVersion = {
  id: string
  version: number
  status: "draft" | "published" | "archived"
  subject: string
  preview_text: string
  body_json: unknown
  cta_label: string
  cta_href: string
}

type EmailTheme = {
  id: string
  logo_url: string
  footer_text: string
}

const TEMPLATE_VARIABLES = [
  "{{first_name}}",
  "{{full_name}}",
  "{{company}}",
  "{{job_title}}",
  "{{function_area}}",
  "{{booking_status}}",
  "{{booking_start_local}}",
  "{{booking_start_utc}}",
  "{{booking_timezone}}",
  "{{reschedule_url}}",
  "{{cancel_url}}",
  "{{book_a_call_url}}",
]

const SAMPLE_VARIABLES: Record<string, string> = {
  first_name: "Jane",
  full_name: "Jane Smith",
  work_email: "jane@acme.co",
  company: "Acme Corp",
  job_title: "Head of Operations",
  function_area: "operations",
  booking_status: "booked",
  booking_start_local: "Thursday, March 20, 2026 at 2:00 PM",
  booking_start_utc: "2026-03-20T14:00:00Z",
  booking_timezone: "America/New_York",
  reschedule_url: "https://cal.com/reschedule/abc123",
  cancel_url: "https://cal.com/cancel/abc123",
  book_a_call_url: "https://hopfner.dev/book-a-call",
}

export function EmailTemplatesPageClient() {
  const [tab, setTab] = useState(0) // 0 = templates, 1 = branding
  const [templates, setTemplates] = useState<EmailTemplate[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [version, setVersion] = useState<EmailVersion | null>(null)
  const [theme, setTheme] = useState<EmailTheme | null>(null)
  const [previewHtml, setPreviewHtml] = useState("")
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [mediaLibOpen, setMediaLibOpen] = useState(false)

  // Load templates
  useEffect(() => {
    fetch("/admin/api/email-templates")
      .then((r) => r.json())
      .then((data) => {
        if (data.templates) setTemplates(data.templates)
      })
      .catch(console.error)
  }, [])

  // Load theme
  useEffect(() => {
    fetch("/admin/api/email-templates/theme")
      .then((r) => r.json())
      .then((data) => {
        if (data.theme) setTheme(data.theme)
      })
      .catch(console.error)
  }, [])

  // Load selected template version
  useEffect(() => {
    if (!selectedId) return
    fetch(`/admin/api/email-templates/${selectedId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.version) setVersion(data.version)
      })
      .catch(console.error)
  }, [selectedId])

  // Load preview when version changes
  const loadPreview = useCallback(async () => {
    if (!selectedId || !version) return
    try {
      const res = await fetch(`/admin/api/email-templates/${selectedId}/preview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variables: SAMPLE_VARIABLES, version }),
      })
      const data = await res.json()
      if (data.html) setPreviewHtml(data.html)
    } catch {
      console.error("Failed to load preview")
    }
  }, [selectedId, version])

  useEffect(() => {
    loadPreview()
  }, [loadPreview])

  const handleSaveVersion = useCallback(async () => {
    if (!selectedId || !version) return
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`/admin/api/email-templates/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Save failed")
        return
      }
      if (data.version) setVersion(data.version)
      setSuccess("Saved as draft")
    } catch {
      setError("Network error")
    } finally {
      setSaving(false)
    }
  }, [selectedId, version])

  const handlePublish = useCallback(async () => {
    if (!selectedId || !version) return
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch(`/admin/api/email-templates/${selectedId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ version, publish: true }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Publish failed")
        return
      }
      if (data.version) setVersion(data.version)
      setSuccess("Published successfully")
    } catch {
      setError("Network error")
    } finally {
      setSaving(false)
    }
  }, [selectedId, version])

  const handleToggleEnabled = useCallback(async (templateId: string, enabled: boolean) => {
    try {
      await fetch(`/admin/api/email-templates/${templateId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ enabled }),
      })
      setTemplates((prev) =>
        prev.map((t) => (t.id === templateId ? { ...t, enabled } : t))
      )
    } catch {
      console.error("Failed to toggle template")
    }
  }, [])

  const handleSaveTheme = useCallback(async () => {
    if (!theme) return
    setSaving(true)
    setError("")
    setSuccess("")
    try {
      const res = await fetch("/admin/api/email-templates/theme", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      })
      if (!res.ok) {
        setError("Failed to save branding")
        return
      }
      setSuccess("Branding saved")
      loadPreview()
    } catch {
      setError("Network error")
    } finally {
      setSaving(false)
    }
  }, [theme, loadPreview])

  const handleLogoUpload = useCallback(async (file: File) => {
    try {
      const result = await uploadMedia(file)
      if (result.url) {
        setTheme((t) => t ? { ...t, logo_url: result.url! } : t)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed")
    }
  }, [])

  const handleLogoSelect = useCallback((item: MediaItem) => {
    setTheme((t) => t ? { ...t, logo_url: item.url } : t)
    setMediaLibOpen(false)
  }, [])

  const bodyText = version?.body_json
    ? typeof version.body_json === "string"
      ? version.body_json
      : JSON.stringify(version.body_json, null, 2)
    : ""

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Email Templates
      </Typography>

      <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
        <Tab label="Templates" />
        <Tab label="Branding" />
      </Tabs>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      {tab === 0 && (
        <Box sx={{ display: "flex", gap: 3, minHeight: 600 }}>
          {/* Template list sidebar */}
          <Paper sx={{ width: 280, flexShrink: 0 }}>
            <List dense>
              {templates.map((tpl) => (
                <ListItemButton
                  key={tpl.id}
                  selected={selectedId === tpl.id}
                  onClick={() => setSelectedId(tpl.id)}
                >
                  <ListItemText
                    primary={tpl.name}
                    secondary={tpl.key}
                    primaryTypographyProps={{ fontSize: 13, fontWeight: selectedId === tpl.id ? 600 : 400 }}
                    secondaryTypographyProps={{ fontSize: 11 }}
                  />
                  <Switch
                    size="small"
                    checked={tpl.enabled}
                    onChange={(e) => {
                      e.stopPropagation()
                      handleToggleEnabled(tpl.id, !tpl.enabled)
                    }}
                    onClick={(e) => e.stopPropagation()}
                  />
                </ListItemButton>
              ))}
            </List>
          </Paper>

          {/* Editor pane */}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            {selectedId && version ? (
              <Stack spacing={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Typography variant="subtitle2">Version {version.version}</Typography>
                  <Chip
                    label={version.status}
                    size="small"
                    color={version.status === "published" ? "success" : "default"}
                  />
                </Box>

                <TextField
                  label="Subject"
                  fullWidth
                  size="small"
                  value={version.subject || ""}
                  onChange={(e) => setVersion((v) => v ? { ...v, subject: e.target.value } : v)}
                />
                <TextField
                  label="Preview text"
                  fullWidth
                  size="small"
                  value={version.preview_text || ""}
                  onChange={(e) => setVersion((v) => v ? { ...v, preview_text: e.target.value } : v)}
                />
                <TextField
                  label="Body (JSON blocks)"
                  fullWidth
                  multiline
                  rows={10}
                  size="small"
                  value={bodyText}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value)
                      setVersion((v) => v ? { ...v, body_json: parsed } : v)
                    } catch {
                      // Keep raw text until valid JSON
                      setVersion((v) => v ? { ...v, body_json: e.target.value } : v)
                    }
                  }}
                />
                <Box sx={{ display: "flex", gap: 2 }}>
                  <TextField
                    label="CTA label"
                    size="small"
                    value={version.cta_label || ""}
                    onChange={(e) => setVersion((v) => v ? { ...v, cta_label: e.target.value } : v)}
                    sx={{ flex: 1 }}
                  />
                  <TextField
                    label="CTA href"
                    size="small"
                    value={version.cta_href || ""}
                    onChange={(e) => setVersion((v) => v ? { ...v, cta_href: e.target.value } : v)}
                    sx={{ flex: 1 }}
                  />
                </Box>

                <Divider />

                <Typography variant="caption" color="text.secondary">
                  Available variables
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                  {TEMPLATE_VARIABLES.map((v) => (
                    <Chip key={v} label={v} size="small" variant="outlined" sx={{ fontSize: 11 }} />
                  ))}
                </Box>

                <Divider />

                <Box sx={{ display: "flex", gap: 1 }}>
                  <Button variant="outlined" size="small" onClick={handleSaveVersion} disabled={saving}>
                    Save draft
                  </Button>
                  <Button variant="contained" size="small" onClick={handlePublish} disabled={saving}>
                    Publish
                  </Button>
                  <Button variant="text" size="small" onClick={loadPreview} disabled={saving}>
                    Refresh preview
                  </Button>
                </Box>

                {/* Preview iframe */}
                {previewHtml && (
                  <>
                    <Divider />
                    <Typography variant="subtitle2">Preview</Typography>
                    <Box
                      sx={{
                        border: "1px solid",
                        borderColor: "divider",
                        borderRadius: 1,
                        overflow: "hidden",
                        height: 500,
                      }}
                    >
                      <iframe
                        title="Email preview"
                        srcDoc={previewHtml}
                        style={{ width: "100%", height: "100%", border: "none" }}
                        sandbox="allow-same-origin"
                      />
                    </Box>
                  </>
                )}
              </Stack>
            ) : (
              <Typography color="text.secondary" sx={{ mt: 4, textAlign: "center" }}>
                Select a template to edit
              </Typography>
            )}
          </Box>
        </Box>
      )}

      {tab === 1 && theme && (
        <Paper sx={{ p: 3, maxWidth: 500 }}>
          <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
            Email Branding
          </Typography>
          <Stack spacing={2}>
            {/* Logo picker */}
            <Typography variant="subtitle2">Logo</Typography>
            {theme.logo_url ? (
              <Box sx={{ display: "flex", alignItems: "flex-start", gap: 2 }}>
                <Box
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    p: 1,
                    bgcolor: "grey.900",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={theme.logo_url}
                    alt="Email logo"
                    style={{ display: "block", maxWidth: 140, maxHeight: 60 }}
                  />
                </Box>
                <Stack spacing={1}>
                  <MediaPickerMenu
                    label="Change"
                    onUploadFile={handleLogoUpload}
                    onChooseFromLibrary={() => setMediaLibOpen(true)}
                    onError={(msg) => setError(msg)}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    color="error"
                    onClick={() => setTheme((t) => t ? { ...t, logo_url: "" } : t)}
                  >
                    Remove
                  </Button>
                </Stack>
              </Box>
            ) : (
              <MediaPickerMenu
                label="Choose logo"
                onUploadFile={handleLogoUpload}
                onChooseFromLibrary={() => setMediaLibOpen(true)}
                onError={(msg) => setError(msg)}
              />
            )}

            <Divider />

            <TextField
              label="Footer text"
              size="small"
              value={theme.footer_text || ""}
              onChange={(e) => setTheme((t) => t ? { ...t, footer_text: e.target.value } : t)}
            />
            <Button variant="contained" size="small" onClick={handleSaveTheme} disabled={saving}>
              Save branding
            </Button>
          </Stack>

          <MediaLibraryModal
            opened={mediaLibOpen}
            onClose={() => setMediaLibOpen(false)}
            onSelect={handleLogoSelect}
            title="Choose email logo"
          />
        </Paper>
      )}
    </Box>
  )
}
