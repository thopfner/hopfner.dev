"use client"

import { Paper, Stack, ToggleButtonGroup } from "@mui/material"
import {
  MenuButton,
  MenuButtonBold,
  MenuButtonBulletedList,
  MenuButtonEditLink,
  MenuButtonItalic,
  MenuButtonOrderedList,
  MenuButtonStrikethrough,
  RichTextContent,
  RichTextEditorProvider,
  useRichTextEditorContext,
} from "mui-tiptap"
import { type PropsWithChildren } from "react"
import type { Editor } from "@tiptap/react"

type RichTextEditorProps = PropsWithChildren<{
  editor: Editor | null
}>

type ToolbarProps = PropsWithChildren<{
  sticky?: boolean
  stickyOffset?: number
}>

function Root({ editor, children }: RichTextEditorProps) {
  return (
    <RichTextEditorProvider editor={editor}>
      <Paper variant="outlined" sx={{ p: 1.5 }}>
        {children}
      </Paper>
    </RichTextEditorProvider>
  )
}

function Toolbar({ sticky, stickyOffset = 0, children }: ToolbarProps) {
  return (
    <Stack
      direction="row"
      spacing={1}
      flexWrap="wrap"
      useFlexGap
      sx={{
        overflowX: "auto",
        pb: 0.75,
        mb: 0.75,
        borderBottom: "1px solid",
        borderColor: "divider",
        "&::-webkit-scrollbar": { height: 6 },
        "&::-webkit-scrollbar-thumb": {
          backgroundColor: "rgba(148, 163, 184, 0.35)",
          borderRadius: 999,
        },
        ...(sticky
          ? {
              position: "sticky",
              top: stickyOffset,
              zIndex: 1,
              py: 0.5,
              backgroundColor: "background.paper",
            }
          : null),
      }}
    >
      {children}
    </Stack>
  )
}

function ControlsGroup({ children }: PropsWithChildren) {
  return (
    <ToggleButtonGroup size="small" exclusive={false}>
      {children}
    </ToggleButtonGroup>
  )
}

function H2() {
  const editor = useRichTextEditorContext()
  const active = !!editor?.isActive("heading", { level: 2 })

  return (
    <MenuButton
      tooltipLabel="Heading level 2"
      selected={active}
      onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
      disabled={!editor?.can().chain().focus().toggleHeading({ level: 2 }).run()}
    >
      H2
    </MenuButton>
  )
}

function H3() {
  const editor = useRichTextEditorContext()
  const active = !!editor?.isActive("heading", { level: 3 })

  return (
    <MenuButton
      tooltipLabel="Heading level 3"
      selected={active}
      onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
      disabled={!editor?.can().chain().focus().toggleHeading({ level: 3 }).run()}
    >
      H3
    </MenuButton>
  )
}

function Unlink() {
  const editor = useRichTextEditorContext()

  return (
    <MenuButton
      tooltipLabel="Remove link"
      onClick={() => editor?.chain().focus().unsetLink().run()}
      disabled={!editor?.isActive("link")}
    >
      Unlink
    </MenuButton>
  )
}

function Content() {
  return (
    <RichTextContent
      className="rte-content"
      sx={{
        minHeight: 140,
        px: 1,
        py: 0.5,
        "& .ProseMirror": {
          minHeight: 120,
          outline: "none",
        },
      }}
    />
  )
}

export const RichTextEditor = Object.assign(Root, {
  Toolbar,
  ControlsGroup,
  Bold: MenuButtonBold,
  Italic: MenuButtonItalic,
  Strikethrough: MenuButtonStrikethrough,
  H2,
  H3,
  BulletList: MenuButtonBulletedList,
  OrderedList: MenuButtonOrderedList,
  Link: MenuButtonEditLink,
  Unlink,
  Content,
})
