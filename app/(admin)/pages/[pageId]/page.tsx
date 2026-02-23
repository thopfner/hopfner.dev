import { PageEditor } from "./page-editor"

export default async function PageEditorPage({
  params,
}: {
  params: Promise<{ pageId: string }>
}) {
  const { pageId } = await params
  return <PageEditor pageId={pageId} />
}
