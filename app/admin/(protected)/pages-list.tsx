"use client"

import Link from "next/link"
import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  IconButton,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material"
import CloseRoundedIcon from "@mui/icons-material/CloseRounded"
import MoreVertIcon from "@mui/icons-material/MoreVert"

import { AdminPanel, AdminEmptyState, AdminErrorState, AdminLoadingState, CollectionPageHeader, CollectionToolbar, ADMIN_SURFACES, ADMIN_BORDERS, ADMIN_BLUR } from "@/components/admin/ui"
import { createCmsPage, validateCmsPageSlug } from "@/lib/cms/commands/pages"
import { createClient } from "@/lib/supabase/browser"
import { applyEditorError, toEditorErrorMessage } from "@/lib/cms/editor-error-message"

function formatDateTime(ts: string) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return ts
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d)
}

type PageRow = {
  id: string
  slug: string
  title: string
  updated_at: string
  publish_status: "published" | "unpublished"
  has_draft_changes: boolean
}

type PagesOverviewResponse = {
  pages: PageRow[]
  counts: {
    total_pages_count: number
    published_pages_count: number
    unpublished_pages_count: number
  }
}

type PublishAllResult = {
  ok: boolean
  pagesAffected: number
  sectionsPublished: number
  failures: Array<{ sectionId: string; pageId: string; message: string }>
}

type ToastItem = {
  id: string
  tone: "success" | "error" | "info"
  message: string
}

function Toast({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) {
  if (!items.length) return null
  return (
    <Box
      sx={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: (theme) => theme.zIndex.snackbar,
        display: "flex",
        flexDirection: "column",
        gap: 1,
        maxWidth: 420,
      }}
    >
      {items.map((item) => (
        <Alert
          key={item.id}
          variant="filled"
          severity={item.tone === "error" ? "error" : item.tone === "success" ? "success" : "info"}
          action={
            <IconButton
              aria-label="Dismiss notification"
              size="small"
              color="inherit"
              onClick={() => onDismiss(item.id)}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          }
        >
          {item.message}
        </Alert>
      ))}
    </Box>
  )
}

export function PagesList() {
  const supabase = useMemo(() => createClient(), [])

  const [pages, setPages] = useState<PageRow[]>([])
  const [publishedCount, setPublishedCount] = useState(0)
  const [unpublishedCount, setUnpublishedCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const [newSlug, setNewSlug] = useState("home")
  const [newTitle, setNewTitle] = useState("Home")
  const [creating, setCreating] = useState(false)
  const [createDrawerOpen, setCreateDrawerOpen] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [sortMode, setSortMode] = useState<"slug_asc" | "updated_desc" | "status">("updated_desc")
  const [filterDialogOpen, setFilterDialogOpen] = useState(false)

  const [publishAllOpen, setPublishAllOpen] = useState(false)
  const [publishingAll, setPublishingAll] = useState(false)

  const [toasts, setToasts] = useState<ToastItem[]>([])

  const createDrawerTitleId = "create-page-drawer-title"
  const createDrawerDescriptionId = "create-page-drawer-description"

  const pushToast = useCallback((message: string, tone: ToastItem["tone"] = "info") => {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((prev) => [...prev, { id, tone, message }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const loadPages = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const candidates = ["/admin/api/pages/overview"]
      let payload: (Partial<PagesOverviewResponse> & { error?: string }) | null = null
      let ok = false
      let message = "Failed to load pages overview."

      for (const endpoint of candidates) {
        const res = await fetch(endpoint, {
          method: "GET",
          headers: { "content-type": "application/json" },
        })

        const parsed = (await res.json().catch(() => ({}))) as Partial<PagesOverviewResponse> & {
          error?: string
        }

        if (res.ok) {
          payload = parsed
          ok = true
          break
        }

        if (parsed.error) message = parsed.error
      }

      if (!ok || !payload) {
        applyEditorError({
          error: message,
          fallback: "Failed to load pages overview.",
          setError,
          pushToast,
        })
        setPages([])
        setPublishedCount(0)
        setUnpublishedCount(0)
        return
      }

      const nextPages = payload.pages ?? []
      setPages(nextPages)
      setPublishedCount(payload.counts?.published_pages_count ?? 0)
      setUnpublishedCount(payload.counts?.unpublished_pages_count ?? 0)
    } finally {
      setLoading(false)
    }
  }, [pushToast])

  async function onCreatePage() {
    setCreating(true)
    setError(null)
    setCreateError(null)
    try {
      const slug = newSlug.trim().toLowerCase()
      const title = newTitle.trim()
      const slugError = validateCmsPageSlug(slug)
      if (slugError) {
        setCreateError(slugError)
        pushToast(slugError, "error")
        return
      }
      if (!title) {
        const msg = "Title is required."
        setCreateError(msg)
        pushToast(msg, "error")
        return
      }
      try {
        await createCmsPage(supabase, { slug, title })
      } catch (error) {
        const msg = toEditorErrorMessage(error, "Failed to create page.")
        setCreateError(msg)
        pushToast(msg, "error")
        return
      }

      pushToast("Page created", "success")
      setCreateDrawerOpen(false)
      setCreateError(null)
      await loadPages()
    } finally {
      setCreating(false)
    }
  }

  async function onPublishAll() {
    setPublishingAll(true)
    setError(null)
    try {
      const candidates = ["/admin/api/pages/publish-all"]
      let payload: (PublishAllResult & { error?: string }) | null = null
      let ok = false
      let message = "Failed to publish all changes."

      for (const endpoint of candidates) {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
        })

        const parsed = (await res.json().catch(() => ({}))) as PublishAllResult & { error?: string }
        if (res.ok) {
          payload = parsed
          ok = true
          break
        }
        if (parsed.error) message = parsed.error
      }

      if (!ok || !payload) {
        applyEditorError({
          error: message,
          fallback: "Failed to publish all changes.",
          setError,
          pushToast,
        })
        return
      }

      const failureCount = payload.failures?.length ?? 0
      if (failureCount > 0) {
        const firstFailure = payload.failures?.[0]
        pushToast(
          `Published ${payload.sectionsPublished} sections across ${payload.pagesAffected} pages. ${failureCount} failed.`,
          "info"
        )
        if (firstFailure?.message) {
          const detail = toEditorErrorMessage(firstFailure.message, "One or more sections failed to publish.")
          setError(`Publish All partial failure: ${detail}`)
        }
        console.warn("[Pages] publish-all failures", payload.failures)
      } else {
        pushToast(
          `Published ${payload.sectionsPublished} sections across ${payload.pagesAffected} pages.`,
          "success"
        )
      }

      setPublishAllOpen(false)
      await loadPages()
    } finally {
      setPublishingAll(false)
    }
  }

  useEffect(() => {
    void loadPages()
  }, [loadPages])

  const filteredPages = useMemo(() => {
    const q = search.trim().toLowerCase()
    const base = q
      ? pages.filter((p) => p.slug.toLowerCase().includes(q) || p.title.toLowerCase().includes(q))
      : pages

    if (sortMode === "updated_desc") {
      return base.slice().sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    }

    if (sortMode === "status") {
      return base.slice().sort((a, b) => {
        if (a.publish_status === b.publish_status) return a.slug.localeCompare(b.slug)
        return a.publish_status === "published" ? -1 : 1
      })
    }

    return base.slice().sort((a, b) => a.slug.localeCompare(b.slug))
  }, [pages, search, sortMode])

  return (
    <Stack spacing={2}>
      <CollectionPageHeader
        title="Pages"
        description="Manage pages and their sections. Public site renders only published section versions."
        actions={
          <Button
            variant="contained"
            size="small"
            onClick={() => {
              setCreateError(null)
              setCreateDrawerOpen(true)
            }}
          >
            Create page
          </Button>
        }
      />

      {error && <AdminErrorState message={error} />}

      <CollectionToolbar>
        <TextField
          label="Search"
          placeholder="Search pages…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          size="small"
          sx={{ flex: "1 1 240px", minWidth: 0 }}
        />
        <Chip size="small" variant="outlined" label={`Total: ${pages.length}`} />
        <Chip size="small" color="success" variant="outlined" label={`Published: ${publishedCount}`} />
        <Chip size="small" color="warning" variant="outlined" label={`Unpublished: ${unpublishedCount}`} />
        <Button size="small" variant="outlined" startIcon={<MoreVertIcon fontSize="small" />} onClick={() => setFilterDialogOpen(true)}>
          Filters
        </Button>
        <Button
          size="small"
          variant="contained"
          color="secondary"
          onClick={() => setPublishAllOpen(true)}
          disabled={loading || !pages.length}
        >
          Publish All
        </Button>
      </CollectionToolbar>

      <AdminPanel sx={{ p: 0 }}>
          <TableContainer
            sx={{
              border: "1px solid",
              borderColor: "divider",
              borderRadius: 1.5,
              background: ADMIN_SURFACES.inset,
              display: { xs: "none", sm: "block" },
            }}
          >
            <Table size="small" sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow>
                  <TableCell>Slug</TableCell>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Updated</TableCell>
                  <TableCell align="right">Action</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <AdminLoadingState />
                    </TableCell>
                  </TableRow>
                ) : filteredPages.length ? (
                  filteredPages.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                          {p.slug}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                          {p.title}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          <Chip
                            size="small"
                            color={p.publish_status === "published" ? "success" : "default"}
                            label={p.publish_status === "published" ? "Published" : "Unpublished"}
                          />
                          {p.has_draft_changes ? (
                            <Chip size="small" color="warning" variant="outlined" label="Draft changes" />
                          ) : null}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: "normal" }}>
                          {formatDateTime(p.updated_at)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Button size="small" variant="outlined" color="primary" component={Link} href={`/admin/pages/${p.id}`}>
                          Edit
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5}>
                      <AdminEmptyState title="No pages found" description="No pages match your current search." />
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Stack spacing={1} sx={{ display: { xs: "flex", sm: "none" }, p: 1.25 }}>
            {loading ? (
              <AdminLoadingState />
            ) : filteredPages.length ? (
              filteredPages.map((p) => (
                <Paper key={p.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2, background: ADMIN_SURFACES.inset, borderColor: ADMIN_BORDERS.default }}>
                  <Stack spacing={0.75}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "flex-start" }}>
                      <Box sx={{ minWidth: 0 }}>
                        <Typography variant="body2" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                          {p.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                          /{p.slug}
                        </Typography>
                      </Box>
                      <Button size="small" variant="outlined" color="primary" component={Link} href={`/admin/pages/${p.id}`}>
                        Edit
                      </Button>
                    </Box>
                    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                      <Chip
                        size="small"
                        color={p.publish_status === "published" ? "success" : "default"}
                        label={p.publish_status === "published" ? "Published" : "Unpublished"}
                      />
                      {p.has_draft_changes ? (
                        <Chip size="small" color="warning" variant="outlined" label="Draft changes" />
                      ) : null}
                    </Box>
                    <Typography variant="caption" color="text.secondary">
                      Updated {formatDateTime(p.updated_at)}
                    </Typography>
                  </Stack>
                </Paper>
              ))
            ) : (
              <AdminEmptyState title="No pages found" description="No pages match your current search." />
            )}
          </Stack>
      </AdminPanel>

      <Drawer
        anchor="right"
        open={createDrawerOpen}
        ModalProps={{
          keepMounted: true,
          "aria-labelledby": createDrawerTitleId,
          "aria-describedby": createDrawerDescriptionId,
        }}
        onClose={() => {
          if (creating) return
          setCreateError(null)
          setCreateDrawerOpen(false)
        }}
        PaperProps={{
          role: "dialog",
          "aria-modal": true,
          "aria-labelledby": createDrawerTitleId,
          "aria-describedby": createDrawerDescriptionId,
          sx: {
            width: { xs: "100%", sm: 420 },
            p: 2,
            borderLeft: "1px solid",
            borderColor: ADMIN_BORDERS.default,
            background: ADMIN_SURFACES.overlay,
            backdropFilter: ADMIN_BLUR.overlay,
          },
        }}
      >
        <Stack spacing={2}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 1 }}>
            <Stack spacing={0.5}>
              <Typography id={createDrawerTitleId} variant="h6" fontWeight={700}>
                Create page
              </Typography>
              <Typography id={createDrawerDescriptionId} variant="body2" color="text.secondary">
                Add a new page slug and title.
              </Typography>
            </Stack>
            <IconButton
              aria-label="Close create page panel"
              onClick={() => {
                setCreateError(null)
                setCreateDrawerOpen(false)
              }}
              disabled={creating}
            >
              <CloseRoundedIcon fontSize="small" />
            </IconButton>
          </Box>

          {createError ? <Alert severity="error" variant="outlined">{createError}</Alert> : null}

          <Box
            component="form"
            onSubmit={(event) => {
              event.preventDefault()
              void onCreatePage()
            }}
          >
            <Stack spacing={1.5}>
              <TextField
                label="Slug"
                value={newSlug}
                onChange={(e) => setNewSlug(e.target.value.toLowerCase())}
                placeholder="home"
                size="small"
                autoFocus
                fullWidth
              />
              <TextField
                label="Title"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Home"
                size="small"
                fullWidth
              />

              <Stack direction="row" spacing={1} justifyContent="flex-end">
                <Button
                  onClick={() => {
                    setCreateError(null)
                    setCreateDrawerOpen(false)
                  }}
                  disabled={creating}
                >
                  Cancel
                </Button>
                <Button variant="contained" color="primary" disabled={creating} type="submit">
                  {creating ? "Creating…" : "Create page"}
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Stack>
      </Drawer>

      <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Page list filters</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <TextField
              select
              size="small"
              label="Sort"
              value={sortMode}
              onChange={(e) => setSortMode(e.target.value as typeof sortMode)}
              fullWidth
            >
              <MenuItem value="slug_asc">Sort: Slug (A-Z)</MenuItem>
              <MenuItem value="updated_desc">Sort: Last updated</MenuItem>
              <MenuItem value="status">Sort: Status</MenuItem>
            </TextField>
            <Stack direction="row" justifyContent="space-between">
              <Button variant="text" onClick={() => { setSortMode("updated_desc"); setSearch("") }}>
                Clear all
              </Button>
              <Button variant="contained" onClick={() => setFilterDialogOpen(false)}>
                Done
              </Button>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <Dialog
        open={publishAllOpen}
        onClose={() => {
          if (publishingAll) return
          setPublishAllOpen(false)
        }}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Publish all changes?</DialogTitle>
        <DialogContent>
          <Stack spacing={1.5} sx={{ pt: 0.5 }}>
            <Typography variant="body2">
              This will publish all draft changes across all pages using the same section publish workflow.
            </Typography>
            <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
              <Chip size="small" color="success" variant="outlined" label={`Published: ${publishedCount}`} />
              <Chip size="small" color="warning" variant="outlined" label={`Unpublished: ${unpublishedCount}`} />
            </Box>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPublishAllOpen(false)} disabled={publishingAll}>
            Cancel
          </Button>
          <Button variant="contained" color="warning" onClick={() => void onPublishAll()} disabled={publishingAll}>
            {publishingAll ? "Publishing…" : "Publish All"}
          </Button>
        </DialogActions>
      </Dialog>

      <Toast items={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </Stack>
  )
}
