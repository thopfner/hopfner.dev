"use client"

import { Button, ButtonGroup, Paper, Stack } from "@mui/material"
import { createContext, useContext, type PropsWithChildren } from "react"
import { EditorContent, type Editor } from "@tiptap/react"

type RichTextEditorProps = PropsWithChildren<{
  editor: Editor | null
}>

type ToolbarProps = PropsWithChildren<{
  sticky?: boolean
  stickyOffset?: number
}>

type EditorCtxValue = {
  editor: Editor | null
}

const EditorCtx = createContext<EditorCtxValue>({ editor: null })

function useEditorCtx() {
  return useContext(EditorCtx)
}

function Root({ editor, children }: RichTextEditorProps) {
  return (
    <EditorCtx.Provider value={{ editor }}>
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        {children}
      </Paper>
    </EditorCtx.Provider>
  )
}

function Toolbar({ sticky, stickyOffset = 0, children }: ToolbarProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
      sx={
        sticky
          ? {
              position: "sticky",
              top: stickyOffset,
              zIndex: 1,
              py: 0.5,
              backgroundColor: "background.paper",
            }
          : undefined
      }
    >
      {children}
    </Stack>
  )
}

function ControlsGroup({ children }: PropsWithChildren) {
  return <ButtonGroup size="small">{children}</ButtonGroup>
}

function ControlButton({
  label,
  onClick,
  disabled,
}: {
  label: string
  onClick: (editor: Editor) => void
  disabled?: (editor: Editor) => boolean
}) {
  const { editor } = useEditorCtx()
  const isDisabled = !editor || (disabled ? disabled(editor) : false)
  return (
    <Button
      variant="outlined"
      disabled={isDisabled}
      onClick={() => {
        if (!editor) return
        onClick(editor)
      }}
    >
      {label}
    </Button>
  )
}

function Bold() {
  return <ControlButton label="B" onClick={(e) => e.chain().focus().toggleBold().run()} />
}

function Italic() {
  return <ControlButton label="I" onClick={(e) => e.chain().focus().toggleItalic().run()} />
}

function Strikethrough() {
  return <ControlButton label="S" onClick={(e) => e.chain().focus().toggleStrike().run()} />
}

function H2() {
  return (
    <ControlButton
      label="H2"
      onClick={(e) => e.chain().focus().toggleHeading({ level: 2 }).run()}
    />
  )
}

function H3() {
  return (
    <ControlButton
      label="H3"
      onClick={(e) => e.chain().focus().toggleHeading({ level: 3 }).run()}
    />
  )
}

function BulletList() {
  return (
    <ControlButton
      label="• List"
      onClick={(e) => e.chain().focus().toggleBulletList().run()}
    />
  )
}

function OrderedList() {
  return (
    <ControlButton
      label="1. List"
      onClick={(e) => e.chain().focus().toggleOrderedList().run()}
    />
  )
}

function Link() {
  return (
    <ControlButton
      label="Link"
      onClick={(e) => {
        const previousUrl = e.getAttributes("link").href as string | undefined
        const url = window.prompt("URL", previousUrl ?? "https://")
        if (!url) return
        e.chain().focus().extendMarkRange("link").setLink({ href: url }).run()
      }}
    />
  )
}

function Unlink() {
  return (
    <ControlButton
      label="Unlink"
      onClick={(e) => e.chain().focus().unsetLink().run()}
    />
  )
}

function Content() {
  const { editor } = useEditorCtx()
  return <EditorContent editor={editor} />
}

export const RichTextEditor = Object.assign(Root, {
  Toolbar,
  ControlsGroup,
  Bold,
  Italic,
  Strikethrough,
  H2,
  H3,
  BulletList,
  OrderedList,
  Link,
  Unlink,
  Content,
})
