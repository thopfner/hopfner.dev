export {
  DEFAULT_FORMATTING,
  asArray,
  asRecord,
  asString,
  asStringArray,
  buildHref,
  deepMerge,
  defaultsToPayload,
  draftToPayload,
  emptyRichTextDoc,
  flattenComposerSchemaBlocks,
  formatDateTime,
  formatType,
  formattingToJsonb,
  inputValueFromEvent,
  isBuiltinSectionType,
  normalizeComposerSchema,
  normalizeFormatting,
  normalizeSectionType,
  parseHref,
  payloadToDraft,
  plainTextToRichTextDoc,
  richTextDocToPlainText,
  richTextWithFallback,
  stableStringify,
  textOrNull,
  toCardDisplay,
  validateClassTokens,
  versionRowToPayload,
} from "@/lib/cms/payload"

export async function getImageSize(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/")) return {}
  const url = URL.createObjectURL(file)
  try {
    const img = document.createElement("img")
    img.src = url
    await img.decode()
    return { width: img.naturalWidth, height: img.naturalHeight }
  } catch {
    return {}
  } finally {
    URL.revokeObjectURL(url)
  }
}
