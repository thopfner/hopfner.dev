"use client"

import { useCallback, useEffect, useMemo, useState, type MouseEvent } from "react"
import {
  Alert,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Menu,
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
import MoreVertIcon from "@mui/icons-material/MoreVert"
import useMediaQuery from "@mui/material/useMediaQuery"
import { useTheme } from "@mui/material/styles"

import { AdminPageHeader, AdminPanel } from "@/components/admin/ui"
import { BlogContentPreview } from "@/components/blog/blog-content-preview"

type BlogListItem = {
  articleId: string
  externalId: string
  slug: string
  versionId: string
  version: number
  status: "draft" | "approved" | "published" | "rejected"
  title: string
  excerpt: string | null
  content: unknown
  seoTitle: string | null
  seoDescription: string | null
  coverImageUrl: string | null
  rejectionReason: string | null
  createdAt: string
  approvedAt: string | null
  publishedAt: string | null
  rejectedAt: string | null
  categories: string[]
  tags: string[]
}

const API_BASE = "/admin/api"

type EditState = {
  versionId: string
  title: string
  excerpt: string
  seoTitle: string
  seoDescription: string
  coverImageUrl: string
  categoriesText: string
  tagsText: string
  contentJson: string
}

type DeleteState = {
  articleId: string
  title: string
  slug: string
  status: BlogListItem["status"]
  confirmSlug: string
}

type PreviewState = {
  articleId: string
  slug: string
  title: string
  excerpt: string | null
  content: unknown
  coverImageUrl: string | null
  categories: string[]
  tags: string[]
  publishedAt: string | null
}

function formatDate(ts: string | null): string {
  if (!ts) return "-"
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

function parseCsv(text: string): string[] {
  return text
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean)
}

function statusColor(status: BlogListItem["status"]): "default" | "warning" | "success" | "error" {
  if (status === "approved") return "warning"
  if (status === "published") return "success"
  if (status === "rejected") return "error"
  return "default"
}

export function BlogPageClient() {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down("md"))

  const [rows, setRows] = useState<BlogListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [editState, setEditState] = useState<EditState | null>(null)
  const [saving, setSaving] = useState(false)
  const [deleteState, setDeleteState] = useState<DeleteState | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [previewState, setPreviewState] = useState<PreviewState | null>(null)
  const [actionMenuAnchorEl, setActionMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [actionMenuRow, setActionMenuRow] = useState<BlogListItem | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams()
      if (query.trim()) params.set("q", query.trim())
      if (statusFilter !== "all") params.set("status", statusFilter)

      const response = await fetch(`${API_BASE}/blog/articles?${params.toString()}`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      })

      const payload = (await response.json().catch(() => ({}))) as {
        items?: BlogListItem[]
        error?: string
      }

      if (!response.ok) {
        throw new Error(payload.error ?? "Failed to load blog articles.")
      }

      setRows(payload.items ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load blog articles.")
      setRows([])
    } finally {
      setLoading(false)
    }
  }, [query, statusFilter])

  useEffect(() => {
    void load()
  }, [load])

  const openEdit = useCallback(async (row: BlogListItem) => {
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/blog/versions/${row.versionId}`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      })
      const payload = (await res.json().catch(() => ({}))) as {
        error?: string
        title?: string
        excerpt?: string | null
        seoTitle?: string | null
        seoDescription?: string | null
        coverImageUrl?: string | null
        categories?: string[]
        tags?: string[]
        content?: unknown
      }
      if (!res.ok) throw new Error(payload.error ?? "Failed to load version details.")

      setEditState({
        versionId: row.versionId,
        title: payload.title ?? row.title,
        excerpt: payload.excerpt ?? row.excerpt ?? "",
        seoTitle: payload.seoTitle ?? row.seoTitle ?? "",
        seoDescription: payload.seoDescription ?? row.seoDescription ?? "",
        coverImageUrl: payload.coverImageUrl ?? row.coverImageUrl ?? "",
        categoriesText: (payload.categories ?? row.categories ?? []).join(", "),
        tagsText: (payload.tags ?? row.tags ?? []).join(", "),
        contentJson: JSON.stringify(payload.content ?? row.content ?? { blocks: [] }, null, 2),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to open editor.")
    }
  }, [])

  const action = useCallback(async (versionId: string, kind: "approve" | "publish" | "reject") => {
    setError(null)
    try {
      let body: Record<string, unknown> | undefined
      if (kind === "reject") {
        const reason = window.prompt("Rejection reason (required):", "")?.trim() ?? ""
        if (!reason) return
        body = { reason }
      }

      const res = await fetch(`${API_BASE}/blog/versions/${versionId}/${kind}`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: body ? JSON.stringify(body) : undefined,
      })

      const payload = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(payload.error ?? `Failed to ${kind} version.`)

      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : `Failed to ${kind} version.`)
    }
  }, [load])

  const onSave = useCallback(async () => {
    if (!editState) return
    setSaving(true)
    setError(null)
    try {
      let parsedContent: unknown
      try {
        parsedContent = JSON.parse(editState.contentJson)
      } catch {
        throw new Error("Content JSON is invalid.")
      }

      const res = await fetch(`${API_BASE}/blog/versions/${editState.versionId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title: editState.title,
          excerpt: editState.excerpt,
          seoTitle: editState.seoTitle,
          seoDescription: editState.seoDescription,
          coverImageUrl: editState.coverImageUrl,
          categories: parseCsv(editState.categoriesText),
          tags: parseCsv(editState.tagsText),
          content: parsedContent,
        }),
      })

      const payload = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) throw new Error(payload.error ?? "Failed to save version.")

      setEditState(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save version.")
    } finally {
      setSaving(false)
    }
  }, [editState, load])

  const openDelete = useCallback((row: BlogListItem) => {
    setDeleteState({
      articleId: row.articleId,
      title: row.title,
      slug: row.slug,
      status: row.status,
      confirmSlug: "",
    })
  }, [])

  const openPreview = useCallback(async (row: BlogListItem) => {
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/blog/versions/${row.versionId}`, {
        method: "GET",
        headers: { "content-type": "application/json" },
      })

      const payload = (await res.json().catch(() => ({}))) as {
        error?: string
        title?: string
        excerpt?: string | null
        content?: unknown
        coverImageUrl?: string | null
        categories?: string[]
        tags?: string[]
        publishedAt?: string | null
      }

      if (!res.ok) {
        throw new Error(payload.error ?? "Failed to load preview.")
      }

      setPreviewState({
        articleId: row.articleId,
        slug: row.slug,
        title: payload.title ?? row.title,
        excerpt: payload.excerpt ?? row.excerpt,
        content: payload.content ?? row.content,
        coverImageUrl: payload.coverImageUrl ?? row.coverImageUrl,
        categories: payload.categories ?? row.categories ?? [],
        tags: payload.tags ?? row.tags ?? [],
        publishedAt: payload.publishedAt ?? row.publishedAt,
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load preview.")
    }
  }, [])

  const onDeleteArticle = useCallback(async () => {
    if (!deleteState) return

    const typedSlug = deleteState.confirmSlug.trim()
    if (!typedSlug) {
      setError("Enter the slug to confirm deletion.")
      return
    }

    if (typedSlug !== deleteState.slug) {
      setError("Confirmation slug does not match.")
      return
    }

    setDeleting(true)
    setError(null)
    try {
      const res = await fetch(`${API_BASE}/blog/articles/${deleteState.articleId}`, {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ confirmSlug: typedSlug }),
      })

      const payload = (await res.json().catch(() => ({}))) as { error?: string }
      if (!res.ok) {
        throw new Error(payload.error ?? "Failed to delete article.")
      }

      setDeleteState(null)
      await load()
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to delete article.")
    } finally {
      setDeleting(false)
    }
  }, [deleteState, load])

  const empty = useMemo(() => !loading && rows.length === 0, [loading, rows.length])

  const closeActionMenu = useCallback(() => {
    setActionMenuAnchorEl(null)
    setActionMenuRow(null)
  }, [])

  const openActionMenu = useCallback((event: MouseEvent<HTMLElement>, row: BlogListItem) => {
    setActionMenuAnchorEl(event.currentTarget)
    setActionMenuRow(row)
  }, [])

  function renderActionMenuButton(row: BlogListItem) {
    return (
      <IconButton
        size="small"
        aria-label={`Open actions for ${row.title}`}
        onClick={(event) => openActionMenu(event, row)}
      >
        <MoreVertIcon fontSize="small" />
      </IconButton>
    )
  }

  return (
    <Stack spacing={2}>
      <AdminPageHeader
        title="Blog"
        description="Review drafts, approve, publish, and reject with reason."
      />

      {error ? <Alert severity="error" variant="outlined">{error}</Alert> : null}

      <AdminPanel>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5} alignItems={{ sm: "center" }}>
          <TextField
            size="small"
            label="Search"
            value={query}
            onChange={(e) => setQuery(e.currentTarget.value)}
            fullWidth
          />
          <TextField
            size="small"
            select
            label="Status"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            sx={{ minWidth: { sm: 180 }, width: { xs: "100%", sm: "auto" } }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="draft">Draft</MenuItem>
            <MenuItem value="approved">Approved</MenuItem>
            <MenuItem value="published">Published</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </TextField>
          <Button variant="outlined" onClick={() => void load()} disabled={loading}>
            Refresh
          </Button>
        </Stack>
      </AdminPanel>

      <AdminPanel sx={{ p: 0 }}>
        {isMobile ? (
          <Stack spacing={1.25} sx={{ p: 1.25 }}>
            {rows.map((row) => (
              <Paper key={row.versionId} variant="outlined" sx={{ p: 1.25 }}>
                <Stack spacing={1}>
                  <Typography variant="body2" fontWeight={700} sx={{ overflowWrap: "anywhere" }}>
                    {row.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                    /blog/{row.slug}
                  </Typography>
                  <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                    <Chip size="small" label={row.status} color={statusColor(row.status)} variant="outlined" />
                    <Typography variant="caption" color="text.secondary">v{row.version}</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Published: {formatDate(row.publishedAt)}
                    </Typography>
                  </Stack>
                  <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                    Categories: {(row.categories ?? []).join(", ") || "-"}
                    <br />
                    Tags: {(row.tags ?? []).join(", ") || "-"}
                  </Typography>
                  <Stack direction="row" justifyContent="flex-end">
                    {renderActionMenuButton(row)}
                  </Stack>
                </Stack>
              </Paper>
            ))}
            {empty ? (
              <Typography variant="body2" color="text.secondary">
                No blog articles found.
              </Typography>
            ) : null}
          </Stack>
        ) : (
          <TableContainer sx={{ overflowX: "auto" }}>
            <Table size="small" sx={{ minWidth: 880 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Title</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Categories / Tags</TableCell>
                  <TableCell>Published</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.map((row) => (
                  <TableRow key={row.versionId} hover>
                    <TableCell sx={{ maxWidth: 360 }}>
                      <Stack spacing={0.5}>
                        <Typography variant="body2" fontWeight={700} sx={{ overflowWrap: "anywhere" }}>
                          {row.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                          {row.externalId} · /blog/{row.slug}
                        </Typography>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={row.status} color={statusColor(row.status)} variant="outlined" />
                    </TableCell>
                    <TableCell>v{row.version}</TableCell>
                    <TableCell sx={{ maxWidth: 260 }}>
                      <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                        {(row.categories ?? []).join(", ") || "-"}
                        {"\n"}
                        {(row.tags ?? []).join(", ") || "-"}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">
                        {formatDate(row.publishedAt)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">{renderActionMenuButton(row)}</TableCell>
                  </TableRow>
                ))}
                {empty ? (
                  <TableRow>
                    <TableCell colSpan={6}>
                      <Typography variant="body2" color="text.secondary">
                        No blog articles found.
                      </Typography>
                    </TableCell>
                  </TableRow>
                ) : null}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </AdminPanel>

      <Menu
        anchorEl={actionMenuAnchorEl}
        open={Boolean(actionMenuAnchorEl && actionMenuRow)}
        onClose={closeActionMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            if (!actionMenuRow) return
            const row = actionMenuRow
            closeActionMenu()
            void openEdit(row)
          }}
        >
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            if (!actionMenuRow) return
            const row = actionMenuRow
            closeActionMenu()
            void openPreview(row)
          }}
        >
          Preview
        </MenuItem>
        <MenuItem
          disabled={!actionMenuRow || actionMenuRow.status === "published"}
          onClick={() => {
            if (!actionMenuRow) return
            const row = actionMenuRow
            closeActionMenu()
            void action(row.versionId, "approve")
          }}
        >
          Approve
        </MenuItem>
        <MenuItem
          disabled={!actionMenuRow || actionMenuRow.status !== "approved"}
          onClick={() => {
            if (!actionMenuRow) return
            const row = actionMenuRow
            closeActionMenu()
            void action(row.versionId, "publish")
          }}
        >
          Publish
        </MenuItem>
        <MenuItem
          disabled={!actionMenuRow || actionMenuRow.status === "published"}
          onClick={() => {
            if (!actionMenuRow) return
            const row = actionMenuRow
            closeActionMenu()
            void action(row.versionId, "reject")
          }}
        >
          Reject
        </MenuItem>
        <MenuItem
          sx={{ color: "error.main" }}
          onClick={() => {
            if (!actionMenuRow) return
            const row = actionMenuRow
            closeActionMenu()
            openDelete(row)
          }}
        >
          Delete
        </MenuItem>
      </Menu>

      <Dialog
        open={Boolean(previewState)}
        onClose={() => setPreviewState(null)}
        maxWidth="md"
        fullWidth
        fullScreen={isMobile}
      >
        <DialogTitle>Preview (frontend rendering)</DialogTitle>
        <DialogContent dividers sx={{ px: 0, py: 0 }}>
          {previewState ? (
            <main className="mx-auto w-full max-w-3xl px-4 py-10 sm:px-6">
              <header className="mb-8 space-y-3">
                <div className="space-y-2">
                  <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{previewState.title}</h1>
                  {previewState.excerpt ? <p className="text-base text-foreground/75">{previewState.excerpt}</p> : null}
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-foreground/65">
                  <span>{previewState.publishedAt ? new Date(previewState.publishedAt).toLocaleDateString() : "Draft preview"}</span>
                  {previewState.categories.map((name) => (
                    <span key={`cat-${name}`} className="rounded border border-border px-2 py-0.5">{name}</span>
                  ))}
                  {previewState.tags.map((name) => (
                    <span key={`tag-${name}`} className="rounded border border-border px-2 py-0.5">#{name}</span>
                  ))}
                </div>
              </header>

              {previewState.coverImageUrl ? (
                <figure className="mb-8 overflow-hidden rounded-xl border border-border">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={previewState.coverImageUrl}
                    alt={previewState.title}
                    className="h-auto w-full object-cover"
                  />
                </figure>
              ) : null}

              <article className="space-y-5">
                <BlogContentPreview content={previewState.content} />
              </article>
            </main>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPreviewState(null)}>Close</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(editState)} onClose={() => (saving ? null : setEditState(null))} maxWidth="md" fullWidth>
        <DialogTitle>Edit blog version</DialogTitle>
        <DialogContent>
          {editState ? (
            <Stack spacing={1.5} sx={{ mt: 0.5 }}>
              <TextField
                label="Title"
                value={editState.title}
                onChange={(e) => setEditState((prev) => (prev ? { ...prev, title: e.target.value } : prev))}
                fullWidth
              />
              <TextField
                label="Excerpt"
                value={editState.excerpt}
                onChange={(e) => setEditState((prev) => (prev ? { ...prev, excerpt: e.target.value } : prev))}
                fullWidth
                multiline
                minRows={2}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  label="SEO title"
                  value={editState.seoTitle}
                  onChange={(e) => setEditState((prev) => (prev ? { ...prev, seoTitle: e.target.value } : prev))}
                  fullWidth
                />
                <TextField
                  label="Cover image URL"
                  value={editState.coverImageUrl}
                  onChange={(e) =>
                    setEditState((prev) => (prev ? { ...prev, coverImageUrl: e.target.value } : prev))
                  }
                  fullWidth
                />
              </Stack>
              <TextField
                label="SEO description"
                value={editState.seoDescription}
                onChange={(e) =>
                  setEditState((prev) => (prev ? { ...prev, seoDescription: e.target.value } : prev))
                }
                fullWidth
                multiline
                minRows={2}
              />
              <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                <TextField
                  label="Categories (comma separated)"
                  value={editState.categoriesText}
                  onChange={(e) =>
                    setEditState((prev) => (prev ? { ...prev, categoriesText: e.target.value } : prev))
                  }
                  fullWidth
                />
                <TextField
                  label="Tags (comma separated)"
                  value={editState.tagsText}
                  onChange={(e) => setEditState((prev) => (prev ? { ...prev, tagsText: e.target.value } : prev))}
                  fullWidth
                />
              </Stack>
              <TextField
                label="Content JSON"
                value={editState.contentJson}
                onChange={(e) => setEditState((prev) => (prev ? { ...prev, contentJson: e.target.value } : prev))}
                fullWidth
                multiline
                minRows={14}
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditState(null)} disabled={saving}>
            Cancel
          </Button>
          <Button variant="contained" onClick={() => void onSave()} disabled={saving}>
            {saving ? "Saving…" : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={Boolean(deleteState)} onClose={() => (deleting ? null : setDeleteState(null))} maxWidth="sm" fullWidth>
        <DialogTitle>Delete article?</DialogTitle>
        <DialogContent>
          {deleteState ? (
            <Stack spacing={1.5} sx={{ mt: 0.5 }}>
              <Typography variant="body2" color="text.secondary">
                This will permanently delete the article and all versions from the database.
              </Typography>
              {deleteState.status === "published" ? (
                <Alert severity="warning">
                  This article is currently published and will disappear from the public blog immediately.
                </Alert>
              ) : null}
              <Paper variant="outlined" sx={{ p: 1.25 }}>
                <Typography variant="body2" fontWeight={700} sx={{ overflowWrap: "anywhere" }}>
                  {deleteState.title}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
                  /blog/{deleteState.slug}
                </Typography>
              </Paper>
              <Typography variant="body2">
                Type the slug <strong>{deleteState.slug}</strong> to confirm.
              </Typography>
              <TextField
                label="Confirm slug"
                value={deleteState.confirmSlug}
                onChange={(e) =>
                  setDeleteState((prev) => (prev ? { ...prev, confirmSlug: e.currentTarget.value } : prev))
                }
                fullWidth
              />
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteState(null)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="contained" color="error" onClick={() => void onDeleteArticle()} disabled={deleting}>
            {deleting ? "Deleting…" : "Delete article"}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  )
}
