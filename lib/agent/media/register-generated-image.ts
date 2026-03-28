import type { SupabaseClient } from "@supabase/supabase-js"

import {
  buildCmsMediaStoragePath,
  finalizeCmsMediaMetadata,
  resolveCmsMediaBucket,
} from "@/lib/cms/commands/media"

import type { RegisterGeneratedImageInput, RegisterGeneratedImageResult } from "./types"

export async function registerGeneratedImage(
  supabase: SupabaseClient,
  input: RegisterGeneratedImageInput
): Promise<RegisterGeneratedImageResult> {
  const generated = await input.provider.generateImage({
    prompt: input.prompt,
    alt: input.alt,
  })

  const bucket = input.bucket ?? resolveCmsMediaBucket()
  const path = buildCmsMediaStoragePath(generated.filename)
  const bytes = Buffer.from(generated.bytes)

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, bytes, {
      contentType: generated.mimeType,
      upsert: false,
    })

  if (uploadError) {
    throw new Error(uploadError.message)
  }

  try {
    const media = await finalizeCmsMediaMetadata(supabase, {
      bucket,
      path,
      mimeType: generated.mimeType,
      sizeBytes: bytes.byteLength,
      width: generated.width ?? null,
      height: generated.height ?? null,
      alt: generated.alt ?? null,
    })
    const { data } = supabase.storage.from(bucket).getPublicUrl(path)

    return {
      id: media.id,
      bucket,
      path,
      url: data.publicUrl,
      mimeType: media.mime_type,
      sizeBytes: media.size_bytes,
      width: media.width,
      height: media.height,
      alt: media.alt,
      provider: generated.provider,
      model: generated.model ?? null,
    }
  } catch (error) {
    const cleanup = await supabase.storage.from(bucket).remove([path])
    if (cleanup.error && !/not\s+found/i.test(cleanup.error.message)) {
      const message = error instanceof Error ? error.message : "Failed to register generated media."
      throw new Error(`${message} Cleanup also failed: ${cleanup.error.message}`)
    }
    throw error
  }
}
