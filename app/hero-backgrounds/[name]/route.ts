import { promises as fs } from "node:fs"
import path from "node:path"

const IMAGE_DIR = "/var/www/html/hopfner.dev/public/hero-backgrounds"

function contentTypeFor(fileName: string) {
  const lower = fileName.toLowerCase()
  if (lower.endsWith(".png")) return "image/png"
  if (lower.endsWith(".webp")) return "image/webp"
  if (lower.endsWith(".jpeg") || lower.endsWith(".jpg")) return "image/jpeg"
  return "application/octet-stream"
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  const { name } = await params
  const safeName = path.basename(name)
  if (safeName !== name) {
    return new Response("Not found", { status: 404 })
  }

  const filePath = path.join(IMAGE_DIR, safeName)

  try {
    const data = await fs.readFile(filePath)
    return new Response(data, {
      status: 200,
      headers: {
        "Content-Type": contentTypeFor(safeName),
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch {
    return new Response("Not found", { status: 404 })
  }
}
