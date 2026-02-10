import sanitizeHtml from "sanitize-html"
import { generateHTML } from "@tiptap/html"
import type { JSONContent } from "@tiptap/core"
import StarterKit from "@tiptap/starter-kit"
import Link from "@tiptap/extension-link"
import Image from "@tiptap/extension-image"

export function tiptapJsonToSanitizedHtml(doc: unknown): string {
  if (!doc || typeof doc !== "object") return ""

  let html = ""
  try {
    html = generateHTML(doc as JSONContent, [
      StarterKit,
      Link.configure({ openOnClick: false }),
      Image.configure({ allowBase64: false }),
    ])
  } catch {
    return ""
  }

  return sanitizeHtml(html, {
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
      "hr",
      "img",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
      img: ["src", "alt", "title"],
    },
    allowedSchemes: ["http", "https"],
    allowProtocolRelative: false,
    transformTags: {
      a: (tagName, attribs) => {
        const href = attribs.href || ""
        const isExternal = href.startsWith("http://") || href.startsWith("https://")
        return {
          tagName,
          attribs: {
            ...attribs,
            target: isExternal ? "_blank" : attribs.target,
            rel: "noopener noreferrer",
          },
        }
      },
    },
  })
}
