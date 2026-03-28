export type GeneratedImageProviderRequest = {
  prompt: string
  alt?: string | null
}

export type GeneratedImageProviderResult = {
  bytes: Uint8Array
  mimeType: string
  filename: string
  width?: number | null
  height?: number | null
  alt?: string | null
  provider: string
  model?: string | null
}

export interface GeneratedImageProvider {
  name: string
  model?: string | null
  generateImage(input: GeneratedImageProviderRequest): Promise<GeneratedImageProviderResult>
}

export type RegisterGeneratedImageInput = {
  prompt: string
  alt?: string | null
  provider: GeneratedImageProvider
  bucket?: string
}

export type RegisterGeneratedImageResult = {
  id: string
  bucket: string
  path: string
  url: string
  mimeType: string
  sizeBytes: number
  width: number | null
  height: number | null
  alt: string | null
  provider: string
  model: string | null
}
