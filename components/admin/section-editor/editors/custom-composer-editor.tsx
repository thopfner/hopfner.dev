"use client"

import { Stack, Text } from "@/components/mui-compat"
import { CustomBlockEditor } from "./custom-block-editor"
import type { ContentEditorProps, FlattenedComposerBlock } from "../types"

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
}

type CustomComposerEditorProps = ContentEditorProps & {
  flattenedCustomBlocks: FlattenedComposerBlock[]
  customBlockOverrides: Record<string, unknown>
  setCustomBlockPatch: (blockId: string, patch: Record<string, unknown>) => void
  applyCustomBlockImageUrl: (blockId: string, url: string) => void
  onOpenCustomImageLibrary: (blockId: string) => void
  uploadToCmsMedia: (file: File) => Promise<{ publicUrl: string }>
}

export function CustomComposerEditor({
  onError,
  loading,
  linkMenuProps,
  flattenedCustomBlocks,
  customBlockOverrides,
  setCustomBlockPatch,
  applyCustomBlockImageUrl,
  onOpenCustomImageLibrary,
  uploadToCmsMedia,
}: CustomComposerEditorProps) {
  return (
    <Stack gap="sm">
      {flattenedCustomBlocks.length ? (
        flattenedCustomBlocks.map(({ rowIndex, columnIndex, block }) => {
          // Pass the per-block override record. CustomBlockEditor is memoized
          // and merges internally, so only blocks whose override changed re-render.
          const blockOverride = asRecord(customBlockOverrides[block.id])
          return (
            <CustomBlockEditor
              key={`custom-${block.id}`}
              block={block}
              blockOverride={blockOverride}
              rowIndex={rowIndex}
              columnIndex={columnIndex}
              setCustomBlockPatch={setCustomBlockPatch}
              applyCustomBlockImageUrl={applyCustomBlockImageUrl}
              onOpenCustomImageLibrary={onOpenCustomImageLibrary}
              uploadToCmsMedia={uploadToCmsMedia}
              onError={onError}
              loading={loading}
              linkMenuProps={linkMenuProps}
            />
          )
        })
      ) : (
        <Text c="dimmed" size="sm">
          No blocks found for this custom section type. Add blocks in Section Library first.
        </Text>
      )}
    </Stack>
  )
}
