import crypto from "node:crypto"

import {
  getGeminiImageModel,
  isGeminiImageGenerationConfigured,
} from "@/lib/agent/media/providers/gemini"

export type GeneratedCoverImage = {
  url: string | null
  path: string | null
  prompt: string
}

export async function generateBlogCoverImage(params: {
  title: string
  excerpt?: string | null
  versionId: string
}): Promise<GeneratedCoverImage | null> {
  if (!isGeminiImageGenerationConfigured()) return null

  // Blog cover generation remains a non-blocking placeholder in Phase 5.
  // The worker-facing generated image path now lives under lib/agent/media/*
  // and owns the storage + media-library registration flow.
  const prompt = `Editorial blog cover illustration for: ${params.title}. Context: ${params.excerpt ?? ""}`.trim()
  const model = getGeminiImageModel()

  const hash = crypto
    .createHash("sha1")
    .update(`${params.versionId}:${model}:${prompt}`)
    .digest("hex")
    .slice(0, 12)
  return {
    url: null,
    path: `blog/covers/${hash}.png`,
    prompt,
  }
}
