import Link from "next/link"
import { PageVisualEditor } from "@/components/admin/visual-editor/page-visual-editor"
import { VISUAL_EDITOR_ENABLED } from "@/components/admin/visual-editor/feature-flag"

type Props = {
  params: Promise<{ pageId: string }>
}

export default async function VisualEditorPage({ params }: Props) {
  const { pageId } = await params

  if (!VISUAL_EDITOR_ENABLED) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100vh", flexDirection: "column", gap: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>Visual Editor</h2>
        <p style={{ fontSize: 14, color: "var(--mantine-color-dimmed)" }}>
          The visual editor is not enabled on this instance.
        </p>
        <Link
          href={`/admin/pages/${pageId}`}
          style={{ fontSize: 13, color: "var(--mantine-color-blue-5)", textDecoration: "underline" }}
        >
          Back to form editor
        </Link>
      </div>
    )
  }

  return <PageVisualEditor pageId={pageId} />
}
