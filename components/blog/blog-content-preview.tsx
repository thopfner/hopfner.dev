import sanitizeHtml from "sanitize-html"

import { tiptapJsonToSanitizedHtml } from "@/lib/blog/tiptap-preview"

type BlogContentPreviewProps = {
  content: unknown
}

function asRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : ""
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : []
}

function renderHtml(html: string) {
  const safe = sanitizeHtml(html, {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "s",
      "a",
      "ul",
      "ol",
      "li",
      "blockquote",
      "code",
      "pre",
      "h2",
      "h3",
      "h4",
      "hr",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
      code: ["class"],
    },
    allowedSchemes: ["http", "https"],
    allowProtocolRelative: false,
  })

  if (!safe.trim()) return null

  return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: safe }} />
}

function renderBlocks(content: Record<string, unknown>) {
  const blocks = Array.isArray(content.blocks)
    ? content.blocks.filter((item): item is Record<string, unknown> => Boolean(item) && typeof item === "object" && !Array.isArray(item))
    : []

  if (!blocks.length) return null

  return (
    <div className="space-y-5">
      {blocks.map((block, index) => {
        const type = asString(block.type).toLowerCase()

        if (type === "heading") {
          const level = Number(block.level)
          const text = asString(block.text)
          if (!text) return null
          if (level <= 2) return <h2 key={index} className="text-2xl font-semibold tracking-tight">{text}</h2>
          if (level === 3) return <h3 key={index} className="text-xl font-semibold tracking-tight">{text}</h3>
          return <h4 key={index} className="text-lg font-semibold tracking-tight">{text}</h4>
        }

        if (type === "paragraph") {
          const text = asString(block.text)
          if (!text) return null
          return <p key={index} className="text-base leading-7 text-foreground/90">{text}</p>
        }

        if (type === "list") {
          const style = asString(block.style).toLowerCase()
          const items = asStringArray(block.items)
          if (!items.length) return null
          if (style === "ordered") {
            return (
              <ol key={index} className="list-decimal space-y-1 pl-6 text-foreground/90">
                {items.map((item, itemIndex) => (
                  <li key={`${index}-${itemIndex}`}>{item}</li>
                ))}
              </ol>
            )
          }
          return (
            <ul key={index} className="list-disc space-y-1 pl-6 text-foreground/90">
              {items.map((item, itemIndex) => (
                <li key={`${index}-${itemIndex}`}>{item}</li>
              ))}
            </ul>
          )
        }

        if (type === "quote") {
          const text = asString(block.text)
          if (!text) return null
          return (
            <blockquote key={index} className="border-l-2 border-border pl-4 italic text-foreground/80">
              {text}
            </blockquote>
          )
        }

        if (type === "code") {
          const text = asString(block.text)
          if (!text) return null
          return (
            <pre key={index} className="overflow-x-auto rounded-md border border-border bg-card p-3 text-xs">
              <code>{text}</code>
            </pre>
          )
        }

        if (type === "image") {
          const url = asString(block.url)
          if (!url) return null
          const alt = asString(block.alt) || "Blog image"
          return (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={index} src={url} alt={alt} className="w-full rounded-xl border border-border object-cover" />
          )
        }

        const text = asString(block.text)
        if (!text) return null
        return <p key={index} className="text-base leading-7 text-foreground/90">{text}</p>
      })}
    </div>
  )
}

export function BlogContentPreview({ content }: BlogContentPreviewProps) {
  if (typeof content === "string") {
    const trimmed = content.trim()
    if (!trimmed) return null

    return (
      <div className="space-y-4">
        {trimmed.split(/\n\n+/).map((part, index) => (
          <p key={index} className="text-base leading-7 text-foreground/90">
            {part.trim()}
          </p>
        ))}
      </div>
    )
  }

  const record = asRecord(content)

  const htmlCandidate = asString(record.html)
  if (htmlCandidate) {
    const htmlNode = renderHtml(htmlCandidate)
    if (htmlNode) return htmlNode
  }

  const markdownCandidate = asString(record.markdown)
  if (markdownCandidate) {
    return (
      <pre className="overflow-x-auto rounded-md border border-border bg-card p-4 text-sm whitespace-pre-wrap">
        {markdownCandidate}
      </pre>
    )
  }

  const tiptapDoc = record.doc ?? record.tiptap
  if (tiptapDoc && typeof tiptapDoc === "object") {
    const html = tiptapJsonToSanitizedHtml(tiptapDoc)
    if (html) {
      return <div className="prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: html }} />
    }
  }

  const blocksNode = renderBlocks(record)
  if (blocksNode) return blocksNode

  return (
    <pre className="overflow-x-auto rounded-md border border-border bg-card p-4 text-xs">
      {JSON.stringify(content ?? {}, null, 2)}
    </pre>
  )
}
