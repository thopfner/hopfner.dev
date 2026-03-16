/**
 * Shared composed-section support classification.
 * Used by both canvas (node.tsx) and inspector (composed-section-panel.tsx)
 * to ensure a single, consistent support decision.
 */

import {
  normalizeComposerSchema,
  flattenComposerSchemaBlocks,
} from "@/components/admin/section-editor/payload"

/**
 * Returns true only when the section has a valid composer schema with
 * at least one usable flattened block.  Raw schema presence alone is
 * NOT enough — the schema must normalise to a real editing surface.
 */
export function isComposedSectionSupported(
  rawSchema: unknown | undefined | null,
): boolean {
  if (!rawSchema) return false
  const schema = normalizeComposerSchema(rawSchema)
  const blocks = flattenComposerSchemaBlocks(schema)
  return blocks.length > 0
}
