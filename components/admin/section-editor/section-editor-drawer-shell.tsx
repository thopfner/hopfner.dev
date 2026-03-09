"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  Badge,
  Button,
  Drawer,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  Title,
} from "@/components/mui-compat"
import { IconRestore } from "@tabler/icons-react"
import { FormattingControls } from "@/components/admin/formatting-controls"
import { MediaLibraryModal } from "@/components/media-library-modal"
import type {
  SectionRow,
  SectionScope,
  SectionTypeDefaultsMap,
  SectionVersionRow,
  EditorDraft,
  EditorDraftMeta,
  LinkMenuResourceProps,
} from "./types"
import {
  formatType,
  formatDateTime,
  flattenComposerSchemaBlocks,
  asRecord,
  payloadToDraft,
  defaultsToPayload,
} from "./payload"
import { useSectionEditorResources } from "./use-section-editor-resources"
import { useSectionEditorSession } from "./use-section-editor-session"
import { VersionStatusCard } from "./version-status-card"
import { CommonFieldsPanel } from "./common-fields-panel"
import { PreviewPane } from "./preview-pane"
import { ContentEditorRouter } from "./content-editor-router"

// ---------------------------------------------------------------------------
// Drawer chrome constants — stable references
// ---------------------------------------------------------------------------

const ADMIN_SHELL_HEADER_HEIGHT_PX = 52

const DRAWER_STYLES = {
  content: {
    top: `${ADMIN_SHELL_HEADER_HEIGHT_PX}px`,
    height: `calc(100dvh - ${ADMIN_SHELL_HEADER_HEIGHT_PX}px)`,
  },
  header: {
    position: "sticky" as const,
    top: 0,
    zIndex: 2,
    backgroundColor: "var(--mantine-color-body)",
  },
  body: {
    height: "100%",
    padding: 0,
    overflow: "hidden" as const,
  },
}
const DRAWER_CLASS_NAMES = {
  content: "editor-drawer-content",
  body: "editor-drawer-body",
}

function StatusBadge({ status }: { status: SectionVersionRow["status"] }) {
  const color = status === "published" ? "teal" : status === "draft" ? "yellow" : "gray"
  return (
    <Badge size="xs" color={color} variant="light">
      {status}
    </Badge>
  )
}

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

export function SectionEditorDrawerShell({
  opened,
  section,
  onClose,
  onChanged,
  typeDefaults,
  scope = "page",
}: {
  opened: boolean
  section: SectionRow | null
  onClose: () => void
  onChanged: () => void | Promise<void>
  typeDefaults?: SectionTypeDefaultsMap | null
  scope?: SectionScope
}) {
  // --- Resources hook ---
  const resources = useSectionEditorResources(section, scope, typeDefaults)

  // --- Session hook ---
  const session = useSectionEditorSession()

  // --- UI-only state ---
  const [deleteDraftOpen, setDeleteDraftOpen] = useState(false)
  const [deleteDraftLoading, setDeleteDraftLoading] = useState(false)
  const [backgroundLibraryOpen, setBackgroundLibraryOpen] = useState(false)
  const [navLogoLibraryOpen, setNavLogoLibraryOpen] = useState(false)
  const [cardImageLibraryTarget, setCardImageLibraryTarget] = useState<number | null>(null)
  const [customImageLibraryTargetId, setCustomImageLibraryTargetId] = useState<string | null>(null)
  const [logoImageLibraryTarget, setLogoImageLibraryTarget] = useState<number | null>(null)

  // --- Derived data ---
  const {
    loading,
    error,
    setError,
    versions,
    normalizedType,
    defaults,
    isCustomComposedType,
    customComposerSchema,
    siteColorMode,
    siteTokens,
    activePresets,
    isControlSupportedActive,
    pages,
    pagesLoading,
    anchorsByPageId,
    anchorsLoadingByPageId,
    ensurePagesLoaded,
    ensureAnchorsLoaded,
    uploadToCmsMedia,
  } = resources

  const { draft, isDirty, actions } = session

  const type = normalizedType
  const capabilities = asRecord(defaults?.capabilities)
  const fieldCaps = asRecord(capabilities.fields)
  const showTitle = fieldCaps.title !== false
  const showSubtitle = fieldCaps.subtitle !== false
  const showCtaPrimary = fieldCaps.cta_primary !== false
  const showCtaSecondary = fieldCaps.cta_secondary !== false
  const showBackgroundMedia = fieldCaps.background_media === true

  const published = useMemo(() => versions.find((v) => v.status === "published") ?? null, [versions])
  const drafts = useMemo(() => versions.filter((v) => v.status === "draft").sort((a, b) => b.version - a.version), [versions])
  const activeDraft = drafts[0] ?? null
  const editorBaseVersion = activeDraft ?? published

  const flattenedCustomBlocks = useMemo(
    () => flattenComposerSchemaBlocks(customComposerSchema),
    [customComposerSchema]
  )

  // --- Link menu resource props ---
  const linkMenuProps: LinkMenuResourceProps = useMemo(() => ({
    currentPageId: section?.page_id ?? "",
    pages,
    pagesLoading,
    anchorsByPageId,
    anchorsLoadingByPageId,
    ensurePagesLoaded,
    ensureAnchorsLoaded,
  }), [section?.page_id, pages, pagesLoading, anchorsByPageId, anchorsLoadingByPageId, ensurePagesLoaded, ensureAnchorsLoaded])

  // --- Load on open ---
  useEffect(() => {
    if (!opened) return
    void resources.load({
      forceHydrate: true,
      onHydrate: (hydratedDraft) => session.hydrate(hydratedDraft),
      isDirty: false,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opened, section?.id])

  // --- Stable action callbacks (Phase 1: no inline lambdas to memoized children) ---
  const onSaveDraft = useCallback(async () => {
    if (!isDirty) return
    await resources.saveDraft(draft, async () => {
      await resources.load({
        forceHydrate: true,
        onHydrate: (d) => session.hydrate(d),
      })
      await onChanged()
    })
  }, [isDirty, draft, resources, session, onChanged])

  const onPublishDraft = useCallback(async () => {
    const reloadAndNotify = async () => {
      await resources.load({
        forceHydrate: true,
        onHydrate: (d) => session.hydrate(d),
      })
      await onChanged()
    }
    if (isDirty) {
      await resources.saveAndPublish(draft, reloadAndNotify)
    } else {
      await resources.publishDraft(false, reloadAndNotify)
    }
  }, [isDirty, draft, resources, session, onChanged])

  const onConfirmDeleteDraft = useCallback(async () => {
    setDeleteDraftLoading(true)
    await resources.deleteDraft(async () => {
      setDeleteDraftOpen(false)
      await resources.load({
        forceHydrate: true,
        onHydrate: (d) => session.hydrate(d),
      })
      await onChanged()
    })
    setDeleteDraftLoading(false)
  }, [resources, session, onChanged])

  const onRestore = useCallback(async (fromVersionId: string) => {
    await resources.restoreVersion(fromVersionId, async () => {
      await resources.load({
        forceHydrate: true,
        onHydrate: (d) => session.hydrate(d),
      })
      await onChanged()
    })
  }, [resources, session, onChanged])

  const onUploadBackground = useCallback(async (file: File) => {
    const { publicUrl } = await uploadToCmsMedia(file)
    actions.setMetaField("backgroundMediaUrl", publicUrl)
  }, [uploadToCmsMedia, actions])

  // --- Stable callbacks for memoized children ---
  const handleSaveDraft = useCallback(() => { void onSaveDraft() }, [onSaveDraft])
  const handlePublishDraft = useCallback(() => { void onPublishDraft() }, [onPublishDraft])
  const handleOpenDeleteModal = useCallback(() => setDeleteDraftOpen(true), [])
  const handleOpenBackgroundLibrary = useCallback(() => setBackgroundLibraryOpen(true), [])
  const handleOpenNavLogoLibrary = useCallback(() => setNavLogoLibraryOpen(true), [])
  const handleError = useCallback((msg: string) => setError(msg), [setError])

  // Media library callbacks
  const applyNavLogoUrl = useCallback((url: string) => {
    actions.setContent((c) => {
      const existing = asRecord(c.logo)
      const existingWidthRaw = Number(existing.widthPx)
      const existingWidth = Number.isFinite(existingWidthRaw)
        ? Math.min(320, Math.max(60, Math.round(existingWidthRaw)))
        : 140
      const existingAlt = (typeof existing.alt === "string" ? existing.alt : "").trim()
      return {
        ...c,
        logo: {
          ...existing,
          url,
          alt: existingAlt || "Site logo",
          widthPx: existingWidth,
        },
      }
    })
  }, [actions])

  const applyCardImageUrl = useCallback((cardIndex: number, url: string) => {
    actions.setContent((c) => {
      const cards = Array.isArray(c.cards) ? (c.cards as Record<string, unknown>[]) : []
      if (cardIndex < 0 || cardIndex >= cards.length) return c
      const nextCards = cards.slice()
      const card = asRecord(nextCards[cardIndex])
      const image = asRecord(card.image)
      const existingWidthRaw = Number(image.widthPx)
      const existingWidth = Number.isFinite(existingWidthRaw)
        ? Math.min(420, Math.max(80, Math.round(existingWidthRaw)))
        : 240
      nextCards[cardIndex] = {
        ...card,
        image: {
          ...image,
          url,
          alt: (typeof image.alt === "string" ? image.alt : "") || (typeof card.title === "string" ? card.title : ""),
          widthPx: existingWidth,
        },
      }
      return { ...c, cards: nextCards }
    })
  }, [actions])

  const applyLogoImageUrl = useCallback((logoIndex: number, url: string) => {
    actions.setContent((c) => {
      const logos = Array.isArray(c.logos) ? (c.logos as Record<string, unknown>[]) : []
      if (logoIndex < 0 || logoIndex >= logos.length) return c
      const nextLogos = logos.slice()
      const logo = asRecord(nextLogos[logoIndex])
      nextLogos[logoIndex] = { ...logo, imageUrl: url }
      return { ...c, logos: nextLogos }
    })
  }, [actions])

  const applyCustomBlockImageUrl = useCallback((blockId: string, url: string) => {
    actions.patchCustomBlock(blockId, { imageUrl: url })
  }, [actions])

  return (
    <>
      <Drawer
        opened={opened}
        onClose={onClose}
        title={
          <Group gap="sm">
            <Title order={3} size="h4">
              Section
            </Title>
            {type ? <Badge variant="default">{formatType(type, typeDefaults ?? undefined)}</Badge> : null}
            {section?.key ? (
              <Text size="sm" c="dimmed">
                #{section.key}
              </Text>
            ) : null}
          </Group>
        }
        position="right"
        size="100%"
        zIndex={1500}
        styles={DRAWER_STYLES}
        classNames={DRAWER_CLASS_NAMES}
      >
        {opened ? (
          <div style={{ display: "flex", height: "100%", overflow: "hidden" }}>
            {/* Left column — settings (scrollable) */}
            <div style={{ flex: "0 0 480px", maxWidth: 540, overflowY: "auto", padding: "var(--mantine-spacing-md)", overscrollBehavior: "contain" }}>
              <Stack gap="md">
                {error ? (
                  <Paper withBorder p="sm" radius="md">
                    <Text c="red" size="sm">
                      {error}
                    </Text>
                  </Paper>
                ) : null}

                <VersionStatusCard
                  published={published}
                  activeDraft={activeDraft}
                  editorBaseVersion={editorBaseVersion}
                  isDirty={isDirty}
                  loading={loading}
                  onSaveDraft={handleSaveDraft}
                  onPublishDraft={handlePublishDraft}
                  onDeleteDraft={handleOpenDeleteModal}
                />

                <CommonFieldsPanel
                  meta={draft.meta}
                  onMetaField={actions.setMetaField}
                  showTitle={showTitle}
                  showSubtitle={showSubtitle}
                  showCtaPrimary={showCtaPrimary}
                  showCtaSecondary={showCtaSecondary}
                  showBackgroundMedia={showBackgroundMedia}
                  loading={loading}
                  onUploadBackground={onUploadBackground}
                  onOpenBackgroundLibrary={handleOpenBackgroundLibrary}
                  onError={handleError}
                  linkMenuProps={linkMenuProps}
                />

                <FormattingControls
                  formatting={draft.formatting}
                  onFormattingChange={actions.setFormatting}
                  isControlSupported={isControlSupportedActive}
                  activePresets={activePresets}
                  sectionType={normalizedType}
                />

                <Paper withBorder p="md" radius="md">
                  <Stack gap="sm">
                    <Text fw={600} size="sm">
                      Content ({type ? formatType(type, typeDefaults ?? undefined) : "—"})
                    </Text>

                    <ContentEditorRouter
                      sectionType={type}
                      isCustomComposedType={isCustomComposedType}
                      content={draft.content}
                      onContentChange={actions.setContent}
                      setContentPath={actions.setContentPath}
                      onError={handleError}
                      loading={loading}
                      linkMenuProps={linkMenuProps}
                      onOpenCardImageLibrary={setCardImageLibraryTarget}
                      onOpenNavLogoLibrary={handleOpenNavLogoLibrary}
                      onOpenLogoImageLibrary={setLogoImageLibraryTarget}
                      flattenedCustomBlocks={flattenedCustomBlocks}
                      setCustomBlockPatch={actions.patchCustomBlock}
                      onOpenCustomImageLibrary={setCustomImageLibraryTargetId}
                      uploadToCmsMedia={uploadToCmsMedia}
                    />
                  </Stack>
                </Paper>

                <Paper withBorder p="md" radius="md">
                  <Stack gap="sm">
                    <Text fw={600} size="sm">
                      Version history
                    </Text>
                    <ScrollArea type="auto" offsetScrollbars="x">
                      <Table withTableBorder withColumnBorders striped style={{ minWidth: 760 }}>
                        <Table.Thead>
                          <Table.Tr>
                            <Table.Th>Version</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Created</Table.Th>
                            <Table.Th>Published</Table.Th>
                            <Table.Th />
                          </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                          {versions.map((v) => (
                            <Table.Tr key={v.id}>
                              <Table.Td>v{v.version}</Table.Td>
                              <Table.Td>
                                <StatusBadge status={v.status} />
                              </Table.Td>
                              <Table.Td>
                                <Text c="dimmed" size="sm">
                                  {formatDateTime(v.created_at)}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Text c="dimmed" size="sm">
                                  {formatDateTime(v.published_at)}
                                </Text>
                              </Table.Td>
                              <Table.Td>
                                <Group justify="end" style={{ whiteSpace: "nowrap" }}>
                                  <Button
                                    size="xs"
                                    variant="default"
                                    leftSection={<IconRestore size={14} />}
                                    onClick={() => onRestore(v.id)}
                                  >
                                    Restore to draft
                                  </Button>
                                </Group>
                              </Table.Td>
                            </Table.Tr>
                          ))}
                          {!versions.length ? (
                            <Table.Tr>
                              <Table.Td colSpan={5}>
                                <Text c="dimmed" size="sm">
                                  No versions.
                                </Text>
                              </Table.Td>
                            </Table.Tr>
                          ) : null}
                        </Table.Tbody>
                      </Table>
                    </ScrollArea>
                  </Stack>
                </Paper>

                <Text c="dimmed" size="xs">
                  Publish and restore are done via secure RPC functions. Only admins can mutate content.
                </Text>
              </Stack>
            </div>

            {/* Right column — live preview */}
            <PreviewPane
              sectionType={normalizedType}
              content={draft.content}
              formatting={draft.formatting}
              title={draft.meta.title}
              subtitle={draft.meta.subtitle}
              ctaPrimaryLabel={draft.meta.ctaPrimaryLabel}
              ctaPrimaryHref={draft.meta.ctaPrimaryHref}
              ctaSecondaryLabel={draft.meta.ctaSecondaryLabel}
              ctaSecondaryHref={draft.meta.ctaSecondaryHref}
              backgroundMediaUrl={draft.meta.backgroundMediaUrl}
              colorMode={siteColorMode}
              siteTokens={siteTokens}
            />
          </div>
        ) : null}
      </Drawer>

      {/* Delete draft modal */}
      <Modal
        opened={deleteDraftOpen}
        onClose={() => (deleteDraftLoading ? null : setDeleteDraftOpen(false))}
        title="Delete draft?"
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            This permanently deletes the current draft version(s) for this section. Published content is unchanged.
          </Text>
          {isDirty ? (
            <Text size="sm" c="dimmed">
              Your unsaved changes in this editor will be discarded.
            </Text>
          ) : null}

          {section && activeDraft ? (
            <Paper withBorder p="sm" radius="md">
              <Stack gap={4}>
                <Group gap="xs">
                  <Badge variant="default">
                    {type ? formatType(type, typeDefaults ?? undefined) : "Section"}
                  </Badge>
                  {section.key ? (
                    <Text c="dimmed" size="xs">
                      #{section.key}
                    </Text>
                  ) : null}
                  <Badge size="xs" color="yellow" variant="light">
                    draft v{activeDraft.version}
                  </Badge>
                </Group>
              </Stack>
            </Paper>
          ) : null}

          <Group justify="end">
            <Button
              variant="default"
              onClick={() => setDeleteDraftOpen(false)}
              disabled={deleteDraftLoading}
            >
              Cancel
            </Button>
            <Button color="red" onClick={() => void onConfirmDeleteDraft()} loading={deleteDraftLoading}>
              Delete draft
            </Button>
          </Group>
        </Stack>
      </Modal>

      {/* Media library modals */}
      <MediaLibraryModal
        opened={backgroundLibraryOpen}
        onClose={() => setBackgroundLibraryOpen(false)}
        onSelect={(item) => {
          actions.setMetaField("backgroundMediaUrl", item.url)
          setBackgroundLibraryOpen(false)
        }}
      />

      <MediaLibraryModal
        opened={navLogoLibraryOpen}
        onClose={() => setNavLogoLibraryOpen(false)}
        onSelect={(item) => {
          applyNavLogoUrl(item.url)
          setNavLogoLibraryOpen(false)
        }}
      />

      <MediaLibraryModal
        opened={cardImageLibraryTarget !== null}
        onClose={() => setCardImageLibraryTarget(null)}
        onSelect={(item) => {
          if (cardImageLibraryTarget !== null) {
            applyCardImageUrl(cardImageLibraryTarget, item.url)
          }
          setCardImageLibraryTarget(null)
        }}
      />

      <MediaLibraryModal
        opened={customImageLibraryTargetId !== null}
        onClose={() => setCustomImageLibraryTargetId(null)}
        onSelect={(item) => {
          if (customImageLibraryTargetId) {
            applyCustomBlockImageUrl(customImageLibraryTargetId, item.url)
          }
          setCustomImageLibraryTargetId(null)
        }}
      />

      <MediaLibraryModal
        opened={logoImageLibraryTarget !== null}
        onClose={() => setLogoImageLibraryTarget(null)}
        onSelect={(item) => {
          if (logoImageLibraryTarget !== null) {
            applyLogoImageUrl(logoImageLibraryTarget, item.url)
          }
          setLogoImageLibraryTarget(null)
        }}
      />
    </>
  )
}
