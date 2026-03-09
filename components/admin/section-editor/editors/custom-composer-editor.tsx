"use client"

import { Stack, Text } from "@/components/mui-compat"
import { CustomBlockEditor } from "./custom-block-editor"
import type { ContentEditorProps, ComposerBlock, FlattenedComposerBlock } from "../types"

type CustomComposerEditorProps = ContentEditorProps & {
  flattenedCustomBlocks: FlattenedComposerBlock[]
  getMergedCustomBlock: (block: ComposerBlock) => Record<string, unknown>
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
  getMergedCustomBlock,
  setCustomBlockPatch,
  applyCustomBlockImageUrl,
  onOpenCustomImageLibrary,
  uploadToCmsMedia,
}: CustomComposerEditorProps) {
  return (
    <Stack gap="sm">
      {flattenedCustomBlocks.length ? (
        flattenedCustomBlocks.map(({ rowIndex, columnIndex, block }) => {
          const merged = getMergedCustomBlock(block)
          return (
            <CustomBlockEditor
              key={`custom-${block.id}`}
              block={block}
              merged={merged}
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
