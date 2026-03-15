"use client"

/**
 * Anchored TipTap editor for visual editing rich-text slots.
 * Polished panel with toolbar, spacious editing region, and clear actions.
 */

import { useCallback } from "react"
import { useEditor, EditorContent } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import LinkExtension from "@tiptap/extension-link"
import { generateHTML } from "@tiptap/html"

type Props = {
  initialHtml: string
  onSave: (html: string, json: unknown, plainText: string) => void
  onCancel: () => void
}

const extensions = [
  StarterKit,
  LinkExtension.configure({ openOnClick: false }),
]

function extractPlainText(json: Record<string, unknown>): string {
  function walk(node: unknown): string[] {
    if (!node || typeof node !== "object") return []
    const n = node as Record<string, unknown>
    if (n.type === "text" && typeof n.text === "string") return [n.text]
    const children = Array.isArray(n.content) ? n.content : []
    const parts = children.flatMap((c: unknown) => walk(c))
    if (["paragraph", "heading", "blockquote", "listItem"].includes(String(n.type))) {
      return parts.length ? [parts.join(" ")] : []
    }
    return parts
  }
  return walk(json).map((s) => (s as string).trim()).filter(Boolean).join("\n")
}

export function EditableRichTextEditor({ initialHtml, onSave, onCancel }: Props) {
  const editor = useEditor({
    extensions,
    content: initialHtml,
    editorProps: {
      attributes: {
        class: "prose prose-sm prose-invert max-w-none min-h-[120px] max-h-[400px] overflow-y-auto px-4 py-3 outline-none text-[var(--mantine-color-text,#c1c2c5)] text-sm leading-relaxed",
      },
      handleKeyDown: (_view, event) => {
        event.stopPropagation()
        return false
      },
    },
  })

  const handleSave = useCallback(() => {
    if (!editor) return
    const json = editor.getJSON()
    const html = generateHTML(json, extensions)
    const plainText = extractPlainText(json as Record<string, unknown>)
    onSave(html, json, plainText)
  }, [editor, onSave])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape") { e.preventDefault(); onCancel(); return }
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); handleSave(); return }
  }, [handleSave, onCancel])

  return (
    <div onKeyDown={handleKeyDown}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 px-2 py-1.5 border-b border-[var(--mantine-color-dark-5,#2c2e33)] mb-2">
        <ToolbarBtn active={editor?.isActive("bold")} onClick={() => editor?.chain().focus().toggleBold().run()} title="Bold">B</ToolbarBtn>
        <ToolbarBtn active={editor?.isActive("italic")} onClick={() => editor?.chain().focus().toggleItalic().run()} title="Italic"><em>I</em></ToolbarBtn>
        <div className="w-px h-4 bg-[var(--mantine-color-dark-4,#373a40)] mx-0.5" />
        <ToolbarBtn active={editor?.isActive("bulletList")} onClick={() => editor?.chain().focus().toggleBulletList().run()} title="Bullet list">•</ToolbarBtn>
        <ToolbarBtn active={editor?.isActive("orderedList")} onClick={() => editor?.chain().focus().toggleOrderedList().run()} title="Numbered list">1.</ToolbarBtn>
        <div className="w-px h-4 bg-[var(--mantine-color-dark-4,#373a40)] mx-0.5" />
        <ToolbarBtn active={editor?.isActive("blockquote")} onClick={() => editor?.chain().focus().toggleBlockquote().run()} title="Quote">&ldquo;</ToolbarBtn>
        <ToolbarBtn active={editor?.isActive("heading", { level: 3 })} onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()} title="Heading">H</ToolbarBtn>
      </div>

      {/* Editor content */}
      <div className="bg-[var(--mantine-color-dark-6,#25262b)] rounded-md border border-[var(--mantine-color-dark-4,#373a40)]">
        <EditorContent editor={editor} />
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between mt-3 px-1">
        <span className="text-[10px] text-[var(--mantine-color-dimmed,#909296)]">⌘+Enter to save · Esc to cancel</span>
        <div className="flex gap-2">
          <button type="button" onClick={onCancel}
            className="px-3 py-1.5 text-[11px] font-medium rounded bg-[var(--mantine-color-dark-5,#2c2e33)] text-[var(--mantine-color-text,#c1c2c5)] hover:bg-[var(--mantine-color-dark-4,#373a40)] transition-colors">
            Cancel
          </button>
          <button type="button" onClick={handleSave}
            className="px-4 py-1.5 text-[11px] font-medium rounded bg-blue-600 text-white hover:bg-blue-500 transition-colors">
            Save
          </button>
        </div>
      </div>
    </div>
  )
}

function ToolbarBtn({ active, onClick, title, children }: {
  active?: boolean; onClick?: () => void; title: string; children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      className={`w-7 h-7 flex items-center justify-center rounded text-[12px] font-semibold transition-colors ${
        active
          ? "bg-blue-600/30 text-blue-300"
          : "text-[var(--mantine-color-dimmed,#909296)] hover:text-[var(--mantine-color-text,#c1c2c5)] hover:bg-[var(--mantine-color-dark-5,#2c2e33)]"
      }`}
    >
      {children}
    </button>
  )
}
