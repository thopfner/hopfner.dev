"use client"

import { createContext, forwardRef, useContext, useEffect, useId, useMemo, useState } from "react"
import { useSearchParams } from "next/navigation"
import {
  Alert,
  Box,
  Button as MuiButton,
  Card as MuiCard,
  Chip as MuiChip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper as MuiPaper,
  Select as MuiSelect,
  Stack as MuiStack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Switch as MuiSwitch,
  Tab as MuiTab,
  Tabs as MuiTabs,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  type BoxProps,
  type ButtonProps as MuiButtonProps,
  type CardProps as MuiCardProps,
  type ChipProps as MuiChipProps,
  type PaperProps as MuiPaperProps,
  type SelectChangeEvent,
  type StackProps as MuiStackProps,
  type TextFieldProps,
  type TypographyProps,
} from "@mui/material"
import { DndContext, PointerSensor, closestCenter, useDraggable, useDroppable, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { IconArrowsMaximize, IconTrash } from "@tabler/icons-react"

import { MediaLibraryModal } from "@/components/media-library-modal"
import { AdminPageHeader, AdminPanel } from "@/components/admin/ui"
import {
  AdminActionIcon as ActionIcon,
  normalizeSelectData,
  toCssRadius,
  toCssSpace,
  toFlexAlign,
  toFlexJustify,
  toMuiButtonVariant,
  toMuiControlSize,
  type AdminUiAlign as MantineAlign,
  type AdminUiJustify as MantineJustify,
  type AdminUiRadius as MantineRadius,
  type AdminUiSpace as MantineSpace,
  type AdminSelectData as SelectData,
} from "@/lib/admin/ui-primitives"
import type { MediaItem } from "@/lib/media/types"
import { createClient } from "@/lib/supabase/browser"
import { applyEditorError } from "@/lib/cms/editor-error-message"

type BlockType = "heading" | "subtitle" | "rich_text" | "cards" | "faq" | "image" | "list" | "cta"

type ComposerBlock = {
  id: string
  type: BlockType
  title?: string
  body?: string
  imageUrl?: string
  listStyle?: "basic" | "steps"
  items?: string[]
  cards?: Array<{ title: string; body: string }>
  faqs?: Array<{ q: string; a: string }>
  ctaPrimaryLabel?: string
  ctaPrimaryHref?: string
  ctaSecondaryLabel?: string
  ctaSecondaryHref?: string
}

type ComposerColumn = { id: string; blocks: ComposerBlock[] }
type ComposerRow = { id: string; columns: ComposerColumn[] }
type ComposerSchema = {
  tokens: {
    widthMode: "content" | "full"
    textAlign: "left" | "center"
    spacingY: "py-4" | "py-6" | "py-8" | "py-10"
  }
  rows: ComposerRow[]
}

type RegistryRow = {
  key: string
  label: string
  source: "builtin" | "custom"
  renderer: "legacy" | "composed"
  composer_schema: ComposerSchema | Record<string, unknown>
  is_active: boolean
}

const BUILTIN_PREVIEWS = [
  { key: "nav_links", label: "Navigation Links", desc: "Header nav + CTA" },
  { key: "hero_cta", label: "Hero + CTA", desc: "Headline, subheadline, trust line, CTAs" },
  { key: "card_grid", label: "Card Grid", desc: "Service cards with optional media/details" },
  { key: "steps_list", label: "Steps List", desc: "Sequential process blocks" },
  { key: "title_body_list", label: "Title + Body List", desc: "Workflow/features list" },
  { key: "rich_text_block", label: "Rich Text", desc: "Narrative text panel" },
  { key: "label_value_list", label: "Label / Value", desc: "Metric/value grid" },
  { key: "faq_list", label: "FAQ", desc: "Accordion question/answer" },
  { key: "cta_block", label: "CTA Block", desc: "Closing CTA with actions" },
  { key: "footer_grid", label: "Footer Grid", desc: "Footer links/cards/legal" },
]

type SegmentedItem = { label: string; value: string }

function gridTemplate(count: number): string {
  return `repeat(${Math.max(1, count)}, minmax(0, 1fr))`
}

type ButtonProps = Omit<MuiButtonProps, "variant" | "size" | "mt"> & {
  variant?: "filled" | "light" | "default" | "subtle"
  size?: "xs" | "sm" | "md"
  mt?: MantineSpace
  loading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, mt, loading, disabled, startIcon, sx, ...props },
  ref
) {
  const muiVariant: MuiButtonProps["variant"] = toMuiButtonVariant(variant)
  const muiSize: MuiButtonProps["size"] = toMuiControlSize(size)
  return (
    <MuiButton
      ref={ref}
      variant={muiVariant}
      size={muiSize}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress color="inherit" size={14} /> : startIcon}
      sx={{
        mt: toCssSpace(mt),
        textTransform: "none",
        ...sx,
      }}
      {...props}
    />
  )
})



type BadgeProps = Omit<MuiChipProps, "label" | "variant" | "color" | "size" | "children"> & {
  size?: "sm" | "md"
  variant?: "filled" | "light" | "dot"
  color?: "dark" | "violet"
  radius?: MantineRadius
  children: React.ReactNode
}

function Badge({ size, variant, color, radius, children, sx, ...props }: BadgeProps) {
  const muiVariant: MuiChipProps["variant"] = variant === "filled" ? "filled" : "outlined"
  const muiColor: MuiChipProps["color"] = color === "violet" ? "secondary" : "default"
  return (
    <MuiChip
      size={size === "sm" ? "small" : "medium"}
      variant={muiVariant}
      color={muiColor}
      label={children}
      sx={{
        borderRadius: toCssRadius(radius),
        ...(variant === "filled" && color === "dark"
          ? {
              bgcolor: "text.primary",
              color: "background.paper",
            }
          : null),
        ...(variant === "dot"
          ? {
              "& .MuiChip-label": {
                textTransform: "capitalize",
              },
            }
          : null),
        ...sx,
      }}
      {...props}
    />
  )
}

type CardProps = Omit<MuiCardProps, "variant"> & {
  withBorder?: boolean
  radius?: MantineRadius
  shadow?: "xs" | "sm" | "md"
}

function Card({ withBorder, radius, shadow, sx, ...props }: CardProps) {
  return (
    <MuiCard
      variant={withBorder ? "outlined" : undefined}
      sx={{
        borderRadius: toCssRadius(radius),
        boxShadow: shadow === "xs" ? 1 : undefined,
        ...sx,
      }}
      {...props}
    />
  )
}

type PaperProps = Omit<MuiPaperProps, "variant"> & {
  withBorder?: boolean
  p?: MantineSpace
  radius?: MantineRadius
}

const Paper = forwardRef<HTMLDivElement, PaperProps>(function Paper(
  { withBorder, p, radius, sx, ...props },
  ref
) {
  return (
    <MuiPaper
      ref={ref}
      variant={withBorder ? "outlined" : undefined}
      sx={{
        p: toCssSpace(p),
        borderRadius: toCssRadius(radius),
        ...sx,
      }}
      {...props}
    />
  )
})

type StackProps = Omit<MuiStackProps, "gap" | "mt" | "mb" | "alignItems"> & {
  gap?: MantineSpace
  align?: MantineAlign
  mt?: MantineSpace
  mb?: MantineSpace
}

function Stack({ gap, align, mt, mb, sx, ...props }: StackProps) {
  return (
    <MuiStack
      sx={{
        gap: toCssSpace(gap),
        alignItems: align ? toFlexAlign(align) : undefined,
        mt: toCssSpace(mt),
        mb: toCssSpace(mb),
        ...sx,
      }}
      {...props}
    />
  )
}

type GroupProps = Omit<BoxProps, "display" | "alignItems" | "justifyContent" | "gap" | "mt" | "mb"> & {
  gap?: MantineSpace
  align?: MantineAlign
  justify?: MantineJustify
  grow?: boolean
  mt?: MantineSpace
  mb?: MantineSpace
}

function Group({ gap, align, justify, grow, mt, mb, sx, children, ...props }: GroupProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: "wrap",
        alignItems: toFlexAlign(align),
        justifyContent: toFlexJustify(justify),
        gap: toCssSpace(gap ?? "sm"),
        mt: toCssSpace(mt),
        mb: toCssSpace(mb),
        ...(grow
          ? {
              "& > *": {
                flex: 1,
                minWidth: 0,
              },
            }
          : null),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  )
}

type SimpleGridCols = number | { base?: number; md?: number; lg?: number }
type SimpleGridProps = Omit<BoxProps, "display" | "gap"> & {
  cols: SimpleGridCols
  spacing?: MantineSpace
}

function SimpleGrid({ cols, spacing, sx, children, ...props }: SimpleGridProps) {
  const gridColumns =
    typeof cols === "number"
      ? { xs: gridTemplate(cols) }
      : {
          xs: gridTemplate(cols.base ?? 1),
          md: cols.md ? gridTemplate(cols.md) : undefined,
          lg: cols.lg ? gridTemplate(cols.lg) : undefined,
        }

  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: gridColumns,
        gap: toCssSpace(spacing ?? "md"),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Box>
  )
}

type GridSpan = number | { base?: number; md?: number; lg?: number }

type GridProps = {
  children: React.ReactNode
}

type GridColProps = {
  span: GridSpan
  children: React.ReactNode
}

function GridRoot({ children }: GridProps) {
  return (
    <Box
      sx={{
        display: "grid",
        gridTemplateColumns: "repeat(12, minmax(0, 1fr))",
        gap: toCssSpace("md"),
      }}
    >
      {children}
    </Box>
  )
}

function GridCol({ span, children }: GridColProps) {
  const toSpan = (value: number) => `span ${Math.max(1, Math.min(12, value))} / span ${Math.max(1, Math.min(12, value))}`
  const gridColumn =
    typeof span === "number"
      ? { xs: toSpan(span) }
      : {
          xs: toSpan(span.base ?? 12),
          md: span.md ? toSpan(span.md) : undefined,
          lg: span.lg ? toSpan(span.lg) : undefined,
        }

  return <Box sx={{ gridColumn }}>{children}</Box>
}

type GridComponent = ((props: GridProps) => React.ReactElement) & {
  Col: (props: GridColProps) => React.ReactElement
}

const Grid = Object.assign(GridRoot, { Col: GridCol }) as GridComponent

type TextProps = Omit<TypographyProps, "variant" | "color" | "mt"> & {
  size?: "xs" | "sm" | "md"
  c?: "dimmed" | "red" | "yellow"
  fw?: number
  tt?: "uppercase" | "lowercase" | "capitalize"
  mt?: MantineSpace
}

function Text({ size, c, fw, tt, mt, sx, ...props }: TextProps) {
  const variant: TypographyProps["variant"] = size === "xs" ? "caption" : size === "sm" ? "body2" : "body1"
  const color = c === "dimmed" ? "text.secondary" : c === "red" ? "error.main" : c === "yellow" ? "warning.main" : undefined
  return (
    <Typography
      variant={variant}
      sx={{
        color,
        fontWeight: fw,
        textTransform: tt,
        mt: toCssSpace(mt),
        ...sx,
      }}
      {...props}
    />
  )
}

type TitleProps = Omit<TypographyProps, "variant" | "component" | "order"> & {
  order?: 1 | 2 | 3 | 4 | 5 | 6
  size?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6"
}

function Title({ order = 2, size, sx, ...props }: TitleProps) {
  const byOrder: Record<1 | 2 | 3 | 4 | 5 | 6, TypographyProps["variant"]> = {
    1: "h4",
    2: "h5",
    3: "h6",
    4: "subtitle1",
    5: "subtitle2",
    6: "body1",
  }

  return (
    <Typography
      variant={size ?? byOrder[order]}
      sx={{ fontWeight: 700, ...sx }}
      {...props}
    />
  )
}

type TextInputProps = Omit<TextFieldProps, "size"> & {
  size?: "xs" | "sm" | "md"
}

function TextInput({ size, fullWidth = true, InputLabelProps, ...props }: TextInputProps) {
  return (
    <TextField
      size={size === "xs" || size === "sm" ? "small" : "medium"}
      fullWidth={fullWidth}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      {...props}
    />
  )
}

type TextareaProps = Omit<TextFieldProps, "size" | "multiline"> & {
  size?: "xs" | "sm" | "md"
  minRows?: number
}

function Textarea({ size, minRows, fullWidth = true, ...props }: TextareaProps) {
  return (
    <TextField
      size={size === "xs" || size === "sm" ? "small" : "medium"}
      multiline
      minRows={minRows}
      fullWidth={fullWidth}
      {...props}
    />
  )
}

type SelectProps = {
  label?: string
  placeholder?: string
  value?: string | null
  onChange?: (value: string | null) => void
  data: SelectData
  size?: "xs" | "sm" | "md"
  style?: React.CSSProperties
}

function Select({ label, placeholder, value, onChange, data, size, style }: SelectProps) {
  const options = normalizeSelectData(data)
  const isControlled = value !== undefined
  const [internalValue, setInternalValue] = useState("")
  const currentValue = isControlled ? (value ?? "") : internalValue
  const showPlaceholder = Boolean(placeholder)
  const labelId = useId()

  function handleChange(event: SelectChangeEvent<string>) {
    const next = event.target.value
    if (!isControlled) setInternalValue(next)
    onChange?.(next || null)
  }

  return (
    <FormControl fullWidth size={size === "xs" || size === "sm" ? "small" : "medium"} style={style}>
      {label ? <InputLabel id={labelId} shrink={showPlaceholder || Boolean(currentValue)}>{label}</InputLabel> : null}
      <MuiSelect
        labelId={label ? labelId : undefined}
        label={label}
        value={currentValue}
        onChange={handleChange}
        displayEmpty={showPlaceholder}
        renderValue={(selected) => {
          const selectedValue = String(selected ?? "")
          if (!selectedValue) {
            return (
              <Typography variant="body2" color="text.secondary">
                {placeholder ?? ""}
              </Typography>
            )
          }
          const match = options.find((option) => option.value === selectedValue)
          return match?.label ?? selectedValue
        }}
      >
        {placeholder ? <MenuItem value="">{placeholder}</MenuItem> : null}
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </MuiSelect>
    </FormControl>
  )
}

type SegmentedControlProps = {
  value: string
  onChange: (value: string) => void
  data: SegmentedItem[]
  size?: "xs" | "sm" | "md"
}

function SegmentedControl({ value, onChange, data, size }: SegmentedControlProps) {
  return (
    <ToggleButtonGroup
      exclusive
      fullWidth
      value={value}
      size={size === "xs" || size === "sm" ? "small" : "medium"}
      onChange={(_, nextValue: string | null) => {
        if (typeof nextValue === "string") onChange(nextValue)
      }}
    >
      {data.map((item) => (
        <ToggleButton key={item.value} value={item.value}>
          {item.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

type SwitchProps = {
  checked: boolean
  onChange: (event: React.ChangeEvent<HTMLInputElement>, checked: boolean) => void
  label?: React.ReactNode
  disabled?: boolean
}

function Switch({ checked, onChange, label, disabled }: SwitchProps) {
  return <FormControlLabel control={<MuiSwitch checked={checked} onChange={onChange} disabled={disabled} />} label={label} />
}

type ModalSize = "xs" | "sm" | "md" | "lg" | "xl"

type ModalProps = {
  opened: boolean
  onClose: () => void
  title?: React.ReactNode
  size?: ModalSize
  centered?: boolean
  children: React.ReactNode
}

function Modal({ opened, onClose, title, size = "sm", children }: ModalProps) {
  return (
    <Dialog
      open={opened}
      onClose={() => onClose()}
      maxWidth={size}
      fullWidth
    >
      {title ? <DialogTitle>{title}</DialogTitle> : null}
      <DialogContent>{children}</DialogContent>
    </Dialog>
  )
}

type TabsRootProps = {
  value: string
  onChange: (value: string | null) => void
  children: React.ReactNode
}

type TabsContextValue = {
  value: string
  onChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function TabsRoot({ value, onChange, children }: TabsRootProps) {
  return (
    <TabsContext.Provider
      value={{
        value,
        onChange: (next) => onChange(next),
      }}
    >
      {children}
    </TabsContext.Provider>
  )
}

function TabsList({ children }: { children: React.ReactNode }) {
  const context = useContext(TabsContext)
  if (!context) return null
  return (
    <MuiTabs
      value={context.value}
      onChange={(_, nextValue: string) => context.onChange(nextValue)}
      sx={{
        borderBottom: "1px solid",
        borderColor: "divider",
      }}
    >
      {children}
    </MuiTabs>
  )
}

function TabsTab({ value, children }: { value: string; children: React.ReactNode }) {
  return <MuiTab value={value} label={children} sx={{ textTransform: "none" }} />
}

type TabsPanelProps = {
  value: string
  pt?: MantineSpace
  children: React.ReactNode
}

function TabsPanel({ value, pt, children }: TabsPanelProps) {
  const context = useContext(TabsContext)
  if (!context || context.value !== value) return null
  return <Box sx={{ pt: toCssSpace(pt) }}>{children}</Box>
}

type TabsComponent = ((props: TabsRootProps) => React.ReactElement) & {
  List: (props: { children: React.ReactNode }) => React.ReactElement | null
  Tab: (props: { value: string; children: React.ReactNode }) => React.ReactElement
  Panel: (props: TabsPanelProps) => React.ReactElement | null
}

const Tabs = Object.assign(TabsRoot, {
  List: TabsList,
  Tab: TabsTab,
  Panel: TabsPanel,
}) as TabsComponent

function uid(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}

function defaultSchema(): ComposerSchema {
  return {
    tokens: {
      widthMode: "content",
      textAlign: "left",
      spacingY: "py-6",
    },
    rows: [
      {
        id: uid("row"),
        columns: [{ id: uid("col"), blocks: [{ id: uid("blk"), type: "heading", title: "New custom section" }] }],
      },
    ],
  }
}

function stableStringify(value: unknown): string {
  if (value === null || value === undefined) return "null"
  if (Array.isArray(value)) return `[${value.map((x) => stableStringify(x)).join(",")}]`
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).sort(([a], [b]) => a.localeCompare(b))
    return `{${entries.map(([k, v]) => `${JSON.stringify(k)}:${stableStringify(v)}`).join(",")}}`
  }
  return JSON.stringify(value)
}

function normalizeSchema(input: unknown): ComposerSchema {
  if (!input || typeof input !== "object") return defaultSchema()
  const raw = input as Partial<ComposerSchema>
  const rows = Array.isArray(raw.rows) ? raw.rows : []
  if (!rows.length) return defaultSchema()
  return {
    tokens: {
      widthMode: raw.tokens?.widthMode === "full" ? "full" : "content",
      textAlign: raw.tokens?.textAlign === "center" ? "center" : "left",
      spacingY:
        raw.tokens?.spacingY === "py-4" || raw.tokens?.spacingY === "py-8" || raw.tokens?.spacingY === "py-10"
          ? raw.tokens.spacingY
          : "py-6",
    },
    rows: rows.map((r) => ({
      id: r.id || uid("row"),
      columns: (Array.isArray(r.columns) ? r.columns : []).slice(0, 3).map((c) => ({
        id: c.id || uid("col"),
        blocks: (Array.isArray(c.blocks) ? c.blocks : []).map((b) => ({
          ...b,
          id: b.id || uid("blk"),
          type: b.type || "rich_text",
          listStyle: b.type === "list" ? (b.listStyle === "basic" ? "basic" : "steps") : b.listStyle,
        })),
      })),
    })),
  }
}

function SortableRow({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef: setSortableRef, transform, transition } = useSortable({ id })
  const { setNodeRef: setDropRef, isOver } = useDroppable({ id: `rowdrop:${id}` })

  const setRefs = (el: HTMLDivElement | null) => {
    setSortableRef(el)
    setDropRef(el)
  }

  return (
    <Paper
      ref={setRefs}
      withBorder
      p="sm"
      radius="md"
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
        borderColor: isOver ? "#1976d2" : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </Paper>
  )
}

function SortableBlock({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id })
  return (
    <Paper
      ref={setNodeRef}
      withBorder
      p="xs"
      radius="sm"
      style={{ transform: CSS.Transform.toString(transform), transition }}
      {...attributes}
      {...listeners}
    >
      {children}
    </Paper>
  )
}

function ColumnDropZone({ id, children }: { id: string; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: `coldrop:${id}` })
  return (
    <Paper
      ref={setNodeRef}
      withBorder
      p="xs"
      style={{
        borderColor: isOver ? "#1976d2" : undefined,
        boxShadow: isOver ? "0 0 0 1px #1976d2 inset" : undefined,
      }}
    >
      {children}
    </Paper>
  )
}

function DraggableColumn({ id, children }: { id: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: `column:${id}` })

  return (
    <div
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.8 : 1,
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </div>
  )
}

function SchemaPreview({ schema, mobile }: { schema: ComposerSchema; mobile: boolean }) {
  return (
    <Paper withBorder radius="md" p="md" style={{ maxWidth: mobile ? 420 : "100%", margin: mobile ? "0 auto" : undefined }}>
      <Stack gap="md">
        {schema.rows.map((row) => (
          <SimpleGrid key={row.id} cols={Math.max(1, Math.min(3, row.columns.length || 1))}>
            {row.columns.map((col) => (
              <Stack key={col.id} gap="xs">
                {col.blocks.map((b) => {
                  if (b.type === "heading") return <Title key={b.id} order={3}>{b.title || "Heading"}</Title>
                  if (b.type === "subtitle") return <Text key={b.id} c="dimmed">{b.body || "Subtitle"}</Text>
                  if (b.type === "rich_text") return <Text key={b.id}>{b.body || "Rich text body"}</Text>
                  if (b.type === "image") return <Paper key={b.id} withBorder p="md"><Text size="sm">Image: {b.imageUrl || "(not set)"}</Text></Paper>
                  if (b.type === "list") {
                    const items = (b.items || ["Step 1 | Describe step"]).map((line) => {
                      const [title, ...rest] = line.split("|")
                      return { title: title.trim(), body: rest.join("|").trim() }
                    })
                    if (b.listStyle === "basic") {
                      return <Stack key={b.id} gap={2}>{items.map((x, i) => <Text key={`${b.id}-${i}`} size="sm">• {x.title || "List item"}</Text>)}</Stack>
                    }
                    return (
                      <Stack key={b.id} gap="xs">
                        {items.map((x, i) => (
                          <Paper key={`${b.id}-${i}`} withBorder p="sm" radius="md">
                            <Group gap="xs" align="center">
                              <Badge variant="filled" color="dark" radius="xl">{i + 1}</Badge>
                              <Text size="xs" c="dimmed" tt="uppercase">Step {i + 1}</Text>
                            </Group>
                            <Text mt={6} fw={600} size="sm">{x.title || `Step ${i + 1}`}</Text>
                            {x.body ? <Text size="xs" c="dimmed">{x.body}</Text> : null}
                          </Paper>
                        ))}
                      </Stack>
                    )
                  }
                  if (b.type === "cards") return (
                    <SimpleGrid key={b.id} cols={1}>
                      {(b.cards || [{ title: "Card", body: "Card body" }]).map((card, i) => (
                        <Card key={`${b.id}-${i}`} withBorder>
                          <Text fw={600}>{card.title}</Text>
                          <Text size="sm" c="dimmed">{card.body}</Text>
                        </Card>
                      ))}
                    </SimpleGrid>
                  )
                  if (b.type === "faq") return (
                    <Stack key={b.id} gap={6}>
                      {(b.faqs || [{ q: "Question", a: "Answer" }]).map((faq, i) => (
                        <Paper key={`${b.id}-${i}`} withBorder p="xs">
                          <Text fw={600} size="sm">{faq.q}</Text>
                          <Text size="sm" c="dimmed">{faq.a}</Text>
                        </Paper>
                      ))}
                    </Stack>
                  )
                  return (
                    <Group key={b.id}>
                      <Button size="xs" variant="light">{b.ctaPrimaryLabel || "Primary"}</Button>
                      <Button size="xs" variant="default">{b.ctaSecondaryLabel || "Secondary"}</Button>
                    </Group>
                  )
                })}
              </Stack>
            ))}
          </SimpleGrid>
        ))}
      </Stack>
    </Paper>
  )
}

export function SectionLibraryPage() {
  const supabase = useMemo(() => createClient(), [])
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }))

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [rows, setRows] = useState<RegistryRow[]>([])
  const searchParams = useSearchParams()
  const [catalogQuery, setCatalogQuery] = useState("")
  const [catalogSource, setCatalogSource] = useState<"all" | "builtin" | "custom">("all")
  const [catalogSort, setCatalogSort] = useState<"name_asc" | "source" | "type">("name_asc")
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop")
  const [fullscreenPreviewOpen, setFullscreenPreviewOpen] = useState(false)
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false)
  const [mediaTargetBlockId, setMediaTargetBlockId] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<"catalog" | "composer">("catalog")
  const [createOpen, setCreateOpen] = useState(false)
  const [newKey, setNewKey] = useState("")
  const [newLabel, setNewLabel] = useState("")

  const [activeKey, setActiveKey] = useState<string | null>(null)
  const [schema, setSchema] = useState<ComposerSchema>(defaultSchema())
  const [saving, setSaving] = useState(false)

  const customRows = rows.filter((r) => r.source === "custom")
  const catalogQueryNormalized = catalogQuery.trim().toLowerCase()
  const catalogRows = useMemo(() => {
    const builtins = BUILTIN_PREVIEWS.map((item) => ({
      key: item.key,
      label: item.label,
      description: item.desc,
      source: "builtin" as const,
      renderer: "legacy" as const,
      isActive: true,
    }))
    const customs = customRows.map((item) => ({
      key: item.key,
      label: item.label,
      description: `Custom section type (${item.key})`,
      source: "custom" as const,
      renderer: item.renderer,
      isActive: item.is_active,
    }))

    const merged = [...builtins, ...customs].filter((item) => {
      if (catalogSource !== "all" && item.source !== catalogSource) return false
      if (!catalogQueryNormalized) return true
      return (
        item.label.toLowerCase().includes(catalogQueryNormalized) ||
        item.key.toLowerCase().includes(catalogQueryNormalized) ||
        item.description.toLowerCase().includes(catalogQueryNormalized)
      )
    })

    if (catalogSort === "source") {
      return merged.sort((a, b) => {
        if (a.source === b.source) return a.label.localeCompare(b.label)
        return a.source === "builtin" ? -1 : 1
      })
    }

    if (catalogSort === "type") {
      return merged.sort((a, b) => {
        if (a.renderer === b.renderer) return a.label.localeCompare(b.label)
        return a.renderer.localeCompare(b.renderer)
      })
    }

    return merged.sort((a, b) => a.label.localeCompare(b.label))
  }, [catalogQueryNormalized, catalogSource, catalogSort, customRows])
  const active = customRows.find((r) => r.key === activeKey) || null
  const baselineSchema = useMemo(() => normalizeSchema(active?.composer_schema), [active])
  const isDirty = useMemo(
    () => stableStringify(schema) !== stableStringify(baselineSchema),
    [schema, baselineSchema]
  )
  const totalBlocks = useMemo(
    () => schema.rows.reduce((sum, row) => sum + row.columns.reduce((s, col) => s + col.blocks.length, 0), 0),
    [schema]
  )

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("section_type_registry")
        .select("key,label,source,renderer,composer_schema,is_active")
        .order("source", { ascending: true })
        .order("label", { ascending: true })
      if (error) throw error
      const next = (data ?? []) as RegistryRow[]
      setRows(next)

      const firstCustom = next.find((r) => r.source === "custom")
      if (firstCustom && !activeKey) {
        setActiveKey(firstCustom.key)
        setSchema(normalizeSchema(firstCustom.composer_schema))
      }
    } catch (e) {
      applyEditorError({ error: e, fallback: "Failed to load section library.", setError })
    } finally {
      setLoading(false)
    }
  }

  async function createCustomType() {
    const key = newKey.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "-")
    if (!key || !newLabel.trim()) {
      setError("Key and label are required.")
      return
    }

    setSaving(true)
    setError(null)
    try {
      const payload = {
        key,
        label: newLabel.trim(),
        source: "custom",
        renderer: "composed",
        composer_schema: defaultSchema(),
        is_active: true,
      }

      const { error } = await supabase.from("section_type_registry").insert(payload)
      if (error) throw error

      setCreateOpen(false)
      setNewKey("")
      setNewLabel("")
      await load()
      setActiveKey(key)
      setSchema(defaultSchema())
    } catch (e) {
      applyEditorError({ error: e, fallback: "Failed to create custom section type.", setError })
    } finally {
      setSaving(false)
    }
  }

  async function saveSchema() {
    if (!activeKey) return
    setSaving(true)
    setError(null)
    try {
      const { error } = await supabase
        .from("section_type_registry")
        .update({ composer_schema: schema, renderer: "composed", source: "custom", is_active: true })
        .eq("key", activeKey)
      if (error) throw error
      await load()
    } catch (e) {
      applyEditorError({ error: e, fallback: "Failed to save section schema.", setError })
    } finally {
      setSaving(false)
    }
  }

  function addRow() {
    setSchema((prev) => ({
      ...prev,
      rows: [...prev.rows, { id: uid("row"), columns: [{ id: uid("col"), blocks: [] }] }],
    }))
  }

  function addColumn(rowId: string) {
    setSchema((prev) => ({
      ...prev,
      rows: prev.rows.map((r) =>
        r.id === rowId && r.columns.length < 3
          ? { ...r, columns: [...r.columns, { id: uid("col"), blocks: [] }] }
          : r
      ),
    }))
  }

  function removeRow(rowId: string) {
    setSchema((prev) => {
      if (prev.rows.length <= 1) return prev
      return { ...prev, rows: prev.rows.filter((r) => r.id !== rowId) }
    })
  }

  function removeColumn(rowId: string, colId: string) {
    setSchema((prev) => ({
      ...prev,
      rows: prev.rows.map((r) => {
        if (r.id !== rowId) return r
        if (r.columns.length <= 1) return r
        return { ...r, columns: r.columns.filter((c) => c.id !== colId) }
      }),
    }))
  }

  function addBlock(rowId: string, colId: string, type: BlockType) {
    const block: ComposerBlock =
      type === "heading"
        ? { id: uid("blk"), type, title: "Heading" }
        : type === "subtitle"
          ? { id: uid("blk"), type, body: "Subtitle" }
          : type === "rich_text"
            ? { id: uid("blk"), type, body: "Text" }
            : type === "image"
              ? { id: uid("blk"), type, imageUrl: "" }
              : type === "list"
                ? { id: uid("blk"), type, listStyle: "steps", items: ["Step 1 | Describe step", "Step 2 | Describe step"] }
                : type === "cards"
                  ? { id: uid("blk"), type, cards: [{ title: "Card", body: "Body" }] }
                  : type === "faq"
                    ? { id: uid("blk"), type, faqs: [{ q: "Question", a: "Answer" }] }
                    : {
                        id: uid("blk"),
                        type,
                        ctaPrimaryLabel: "Primary",
                        ctaPrimaryHref: "#",
                        ctaSecondaryLabel: "Secondary",
                        ctaSecondaryHref: "#",
                      }

    setSchema((prev) => ({
      ...prev,
      rows: prev.rows.map((r) =>
        r.id !== rowId
          ? r
          : {
              ...r,
              columns: r.columns.map((c) => (c.id === colId ? { ...c, blocks: [...c.blocks, block] } : c)),
            }
      ),
    }))
  }

  function updateBlock(blockId: string, patch: Partial<ComposerBlock>) {
    setSchema((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => ({
          ...col,
          blocks: col.blocks.map((b) => (b.id === blockId ? { ...b, ...patch } : b)),
        })),
      })),
    }))
  }

  function removeBlock(blockId: string) {
    setSchema((prev) => ({
      ...prev,
      rows: prev.rows.map((row) => ({
        ...row,
        columns: row.columns.map((col) => ({
          ...col,
          blocks: col.blocks.filter((b) => b.id !== blockId),
        })),
      })),
    }))
  }

  function openMediaPicker(blockId: string) {
    setMediaTargetBlockId(blockId)
    setMediaLibraryOpen(true)
  }

  function onSelectMedia(item: MediaItem) {
    if (!mediaTargetBlockId) return
    updateBlock(mediaTargetBlockId, { imageUrl: item.url })
    setMediaTargetBlockId(null)
    setMediaLibraryOpen(false)
  }

  function onComposerDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over) return

    const activeId = String(active.id)
    const overId = String(over.id)
    if (activeId === overId) return

    setSchema((prev) => {
      const rowIds = prev.rows.map((r) => r.id)

      const findColumnLocation = (colId: string) => {
        for (const row of prev.rows) {
          const idx = row.columns.findIndex((c) => c.id === colId)
          if (idx >= 0) return { rowId: row.id, index: idx }
        }
        return null
      }

      const findBlockLocation = (blockId: string) => {
        for (const row of prev.rows) {
          for (const col of row.columns) {
            const idx = col.blocks.findIndex((b) => b.id === blockId)
            if (idx >= 0) {
              return { rowId: row.id, colId: col.id, index: idx }
            }
          }
        }
        return null
      }

      // 1) Row reorder mode
      if (rowIds.includes(activeId) && rowIds.includes(overId)) {
        const from = rowIds.indexOf(activeId)
        const to = rowIds.indexOf(overId)
        if (from < 0 || to < 0) return prev
        return { ...prev, rows: arrayMove(prev.rows, from, to) }
      }

      // 2) Column move mode
      if (activeId.startsWith("column:")) {
        const sourceColId = activeId.replace("column:", "")
        const source = findColumnLocation(sourceColId)
        if (!source) return prev

        let targetRowId: string | null = null
        let targetColIndex: number | null = null

        if (overId.startsWith("rowdrop:")) {
          targetRowId = overId.replace("rowdrop:", "")
        } else if (overId.startsWith("coldrop:")) {
          const targetColId = overId.replace("coldrop:", "")
          const loc = findColumnLocation(targetColId)
          if (loc) {
            targetRowId = loc.rowId
            targetColIndex = loc.index
          }
        } else if (overId.startsWith("column:")) {
          const targetColId = overId.replace("column:", "")
          const loc = findColumnLocation(targetColId)
          if (loc) {
            targetRowId = loc.rowId
            targetColIndex = loc.index
          }
        }

        if (!targetRowId) return prev

        const sourceRow = prev.rows.find((r) => r.id === source.rowId)
        const targetRow = prev.rows.find((r) => r.id === targetRowId)
        if (!sourceRow || !targetRow) return prev

        if (source.rowId !== targetRowId && targetRow.columns.length >= 3) {
          return prev
        }

        let movedColumn: ComposerColumn | null = null

        const removed = prev.rows.map((row) => {
          if (row.id !== source.rowId) return row
          const nextCols = [...row.columns]
          movedColumn = nextCols.splice(source.index, 1)[0] ?? null
          const safeCols = nextCols.length ? nextCols : [{ id: uid("col"), blocks: [] }]
          return { ...row, columns: safeCols }
        })

        if (!movedColumn) return prev

        const inserted = removed.map((row) => {
          if (row.id !== targetRowId) return row
          const nextCols = [...row.columns]
          const insertAt =
            typeof targetColIndex === "number"
              ? Math.max(0, Math.min(targetColIndex, nextCols.length))
              : nextCols.length
          nextCols.splice(insertAt, 0, movedColumn as ComposerColumn)
          return { ...row, columns: nextCols.slice(0, 3) }
        })

        return { ...prev, rows: inserted }
      }

      // 3) Block move mode (within/across columns and rows)
      const source = findBlockLocation(activeId)
      if (!source) return prev

      const targetByBlock = findBlockLocation(overId)
      const targetByColumn = overId.startsWith("coldrop:")
        ? (() => {
            const colId = overId.replace("coldrop:", "")
            const loc = findColumnLocation(colId)
            return loc ? { rowId: loc.rowId, colId } : null
          })()
        : null

      const target = targetByBlock
        ? { rowId: targetByBlock.rowId, colId: targetByBlock.colId, index: targetByBlock.index }
        : targetByColumn
          ? { rowId: targetByColumn.rowId, colId: targetByColumn.colId, index: undefined }
          : null

      if (!target) return prev

      let movedBlock: ComposerBlock | null = null

      const removed = prev.rows.map((row) => {
        if (row.id !== source.rowId) return row
        return {
          ...row,
          columns: row.columns.map((col) => {
            if (col.id !== source.colId) return col
            const nextBlocks = [...col.blocks]
            movedBlock = nextBlocks.splice(source.index, 1)[0] ?? null
            return { ...col, blocks: nextBlocks }
          }),
        }
      })

      if (!movedBlock) return prev

      const insertIndex =
        typeof target.index === "number"
          ? target.index
          : removed
              .find((r) => r.id === target.rowId)
              ?.columns.find((c) => c.id === target.colId)
              ?.blocks.length ?? 0

      const inserted = removed.map((row) => {
        if (row.id !== target.rowId) return row
        return {
          ...row,
          columns: row.columns.map((col) => {
            if (col.id !== target.colId) return col
            const nextBlocks = [...col.blocks]
            nextBlocks.splice(Math.max(0, Math.min(insertIndex, nextBlocks.length)), 0, movedBlock as ComposerBlock)
            return { ...col, blocks: nextBlocks }
          }),
        }
      })

      return { ...prev, rows: inserted }
    })
  }

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const keyFromUrl = searchParams.get("key")?.trim()
    if (keyFromUrl) setActiveKey(keyFromUrl)
  }, [searchParams])

  useEffect(() => {
    if (!active) return
    setSchema(normalizeSchema(active.composer_schema))
  }, [activeKey, active])

  return (
    <Stack gap="md">
      <AdminPageHeader
        title="Section Library"
        description="Preview built-in section types and compose custom reusable sections for pages and globals."
      />

      <AdminPanel compact>
        <Stack gap="sm">
          <Group justify="space-between" align="center">
            <Tabs value={activeTab} onChange={(v) => setActiveTab((v as "catalog" | "composer") ?? "catalog")}>
              <Tabs.List>
                <Tabs.Tab value="catalog">Catalog</Tabs.Tab>
                <Tabs.Tab value="composer">Composer</Tabs.Tab>
              </Tabs.List>
            </Tabs>
            <Button onClick={() => setCreateOpen(true)}>New custom section type</Button>
          </Group>

          {activeTab === "catalog" ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.25 }}>
              <TextField
                label="Search"
                placeholder="Search section types…"
                size="small"
                value={catalogQuery}
                onChange={(e) => setCatalogQuery(e.target.value)}
                sx={{ flex: "1 1 280px", minWidth: 0 }}
              />
              <TextField
                select
                size="small"
                value={catalogSource}
                onChange={(e) => setCatalogSource(e.target.value as typeof catalogSource)}
                sx={{ width: 180 }}
              >
                <MenuItem value="all">Source: All</MenuItem>
                <MenuItem value="builtin">Source: Built-in</MenuItem>
                <MenuItem value="custom">Source: Custom</MenuItem>
              </TextField>
              <TextField
                select
                size="small"
                value={catalogSort}
                onChange={(e) => setCatalogSort(e.target.value as typeof catalogSort)}
                sx={{ width: 200 }}
              >
                <MenuItem value="name_asc">Sort: Name (A-Z)</MenuItem>
                <MenuItem value="source">Sort: Source</MenuItem>
                <MenuItem value="type">Sort: Renderer</MenuItem>
              </TextField>
            </Box>
          ) : null}

          {error ? <Alert severity="error" variant="outlined">{error}</Alert> : null}
        </Stack>
      </AdminPanel>

      <Tabs value={activeTab} onChange={(v) => setActiveTab((v as "catalog" | "composer") ?? "catalog")}>
        <Tabs.Panel value="catalog" pt="sm">
          <AdminPanel>
            <Stack spacing={1.5}>
              <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
                  <Typography fontWeight={700} variant="body2">
                    Section types
                  </Typography>
                  <MuiChip
                    size="small"
                    clickable
                    onClick={() => setCatalogSource("all")}
                    color={catalogSource === "all" ? "primary" : "default"}
                    variant={catalogSource === "all" ? "filled" : "outlined"}
                    label={`Total: ${catalogRows.length}`}
                  />
                  <MuiChip
                    size="small"
                    clickable
                    onClick={() => setCatalogSource("builtin")}
                    color={catalogSource === "builtin" ? "primary" : "default"}
                    variant={catalogSource === "builtin" ? "filled" : "outlined"}
                    label={`Built-in: ${BUILTIN_PREVIEWS.length}`}
                  />
                  <MuiChip
                    size="small"
                    clickable
                    onClick={() => setCatalogSource("custom")}
                    color={catalogSource === "custom" ? "secondary" : "default"}
                    variant={catalogSource === "custom" ? "filled" : "outlined"}
                    label={`Custom: ${customRows.length}`}
                  />
                </Box>
                <Button size="sm" variant="default" onClick={() => setCreateOpen(true)}>
                  New custom section type
                </Button>
              </Box>

              <TableContainer
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 1,
                  display: { xs: "none", md: "block" },
                }}
              >
                <Table size="small" sx={{ tableLayout: "fixed" }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Description / Type</TableCell>
                      <TableCell>Status / Source</TableCell>
                      <TableCell align="right">Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography variant="body2" color="text.secondary">Loading…</Typography>
                        </TableCell>
                      </TableRow>
                    ) : catalogRows.length ? (
                      catalogRows.map((item) => (
                        <TableRow key={item.key} hover>
                          <TableCell>
                            <Typography variant="body2" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                              {item.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                              {item.key}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" sx={{ wordBreak: "break-word" }}>
                              {item.description}
                            </Typography>
                            <MuiChip size="small" sx={{ mt: 0.75 }} variant="outlined" label={item.renderer} />
                          </TableCell>
                          <TableCell>
                            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                              <MuiChip
                                size="small"
                                color={item.isActive ? "success" : "default"}
                                label={item.isActive ? "Active" : "Inactive"}
                              />
                              <MuiChip
                                size="small"
                                color={item.source === "custom" ? "secondary" : "default"}
                                variant="outlined"
                                label={item.source === "custom" ? "Custom" : "Built-in"}
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            {item.source === "custom" ? (
                              <Button
                                size="sm"
                                variant="default"
                                onClick={() => {
                                  setActiveKey(item.key)
                                  setActiveTab("composer")
                                }}
                              >
                                Open
                              </Button>
                            ) : (
                              <Typography variant="caption" color="text.secondary">Read-only</Typography>
                            )}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4}>
                          <Typography variant="body2" color="text.secondary">No section types match current search.</Typography>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>

              <Stack spacing={1} sx={{ display: { xs: "flex", md: "none" } }}>
                {loading ? (
                  <Typography variant="body2" color="text.secondary">Loading…</Typography>
                ) : catalogRows.length ? (
                  catalogRows.map((item) => (
                    <MuiPaper key={item.key} variant="outlined" sx={{ p: 1.25 }}>
                      <Stack spacing={0.75}>
                        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "flex-start" }}>
                          <Box sx={{ minWidth: 0 }}>
                            <Typography variant="body2" fontWeight={700} sx={{ wordBreak: "break-word" }}>
                              {item.label}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" sx={{ wordBreak: "break-word" }}>
                              {item.key}
                            </Typography>
                          </Box>
                          {item.source === "custom" ? (
                            <Button size="xs" variant="default" onClick={() => { setActiveKey(item.key); setActiveTab("composer") }}>
                              Open
                            </Button>
                          ) : null}
                        </Box>
                        <Typography variant="caption" color="text.secondary">{item.description}</Typography>
                        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                          <MuiChip size="small" label={item.renderer} variant="outlined" />
                          <MuiChip size="small" label={item.source === "custom" ? "Custom" : "Built-in"} />
                        </Box>
                      </Stack>
                    </MuiPaper>
                  ))
                ) : (
                  <Typography variant="body2" color="text.secondary">No section types match current search.</Typography>
                )}
              </Stack>
            </Stack>
          </AdminPanel>
        </Tabs.Panel>

        <Tabs.Panel value="composer" pt="sm">
          <AdminPanel>
          <Stack gap="xs" mb="sm">
            <Text size="sm" c="dimmed">Compose sections with rows and up to 3 columns, then reuse across any page.</Text>
          </Stack>
          <Grid>
            <Grid.Col span={{ base: 12, lg: 7 }}>
              <Paper withBorder radius="md" p="sm">
              <Stack gap="sm">
                <Group justify="space-between" align="end">
                  <Select
                    label="Custom section type"
                    placeholder="Select custom type"
                    value={activeKey}
                    onChange={(v) => setActiveKey(v)}
                    data={customRows.map((r) => ({ value: r.key, label: `${r.label} (${r.key})` }))}
                    style={{ flex: 1 }}
                  />
                  <Stack gap={4} align="end">
                    <Group gap="xs">
                      <Button variant="default" onClick={() => setSchema(normalizeSchema(active?.composer_schema))} disabled={!activeKey || !isDirty || saving}>Reset</Button>
                      <Button onClick={saveSchema} loading={saving} disabled={!activeKey || !isDirty}>Save</Button>
                    </Group>
                    <Text size="xs" c={isDirty ? "yellow" : "dimmed"}>{isDirty ? "Unsaved changes" : "All changes saved"}</Text>
                  </Stack>
                </Group>

                <Paper withBorder p="sm">
                  <Group grow>
                    <SegmentedControl
                      value={schema.tokens.widthMode}
                      onChange={(v) => setSchema((p) => ({ ...p, tokens: { ...p.tokens, widthMode: v as "content" | "full" } }))}
                      data={[{ label: "Content width", value: "content" }, { label: "Full width", value: "full" }]}
                    />
                    <SegmentedControl
                      value={schema.tokens.textAlign}
                      onChange={(v) => setSchema((p) => ({ ...p, tokens: { ...p.tokens, textAlign: v as "left" | "center" } }))}
                      data={[{ label: "Left", value: "left" }, { label: "Center", value: "center" }]}
                    />
                    <Select
                      value={schema.tokens.spacingY}
                      onChange={(v) => setSchema((p) => ({ ...p, tokens: { ...p.tokens, spacingY: (v as ComposerSchema["tokens"]["spacingY"]) || "py-6" } }))}
                      data={["py-4", "py-6", "py-8", "py-10"]}
                    />
                  </Group>
                </Paper>

                <Group justify="space-between">
                  <Group gap="xs">
                    <Title order={5}>Rows</Title>
                    <Badge size="sm" variant="light">{schema.rows.length} row{schema.rows.length === 1 ? "" : "s"}</Badge>
                    <Badge size="sm" variant="light">{totalBlocks} block{totalBlocks === 1 ? "" : "s"}</Badge>
                  </Group>
                  <Button size="xs" variant="default" onClick={addRow}>Add row</Button>
                </Group>

                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onComposerDragEnd}>
                  <SortableContext items={schema.rows.map((r) => r.id)} strategy={verticalListSortingStrategy}>
                    <Stack>
                      {schema.rows.map((row, rowIdx) => (
                        <SortableRow key={row.id} id={row.id}>
                          <Stack gap="xs">
                            <Group justify="space-between">
                              <Text fw={600} size="sm">Row {rowIdx + 1}</Text>
                              <Group gap="xs">
                                <Button size="xs" variant="subtle" disabled={row.columns.length >= 3} onClick={() => addColumn(row.id)}>
                                  Add column
                                </Button>
                                <ActionIcon
                                  size="sm"
                                  color="red"
                                  variant="subtle"
                                  aria-label="Delete row"
                                  onClick={() => removeRow(row.id)}
                                  disabled={schema.rows.length <= 1}
                                >
                                  <IconTrash size={14} />
                                </ActionIcon>
                              </Group>
                            </Group>

                            <SimpleGrid cols={Math.max(1, Math.min(3, row.columns.length || 1))}>
                                {row.columns.map((col, colIdx) => (
                                  <DraggableColumn key={col.id} id={col.id}>
                                  <ColumnDropZone id={col.id}>
                                    <Stack gap="xs">
                                      <Group justify="space-between" align="center">
                                        <Text size="xs" c="dimmed">Column {colIdx + 1}</Text>
                                        <Group gap="xs">
                                          <Select
                                            size="xs"
                                            placeholder="Add block"
                                            data={[
                                              { value: "heading", label: "Heading" },
                                              { value: "subtitle", label: "Subtitle" },
                                              { value: "rich_text", label: "Rich text" },
                                              { value: "cards", label: "Cards" },
                                              { value: "faq", label: "FAQ" },
                                              { value: "image", label: "Image" },
                                              { value: "list", label: "Steps list" },
                                              { value: "cta", label: "CTA" },
                                            ]}
                                            onChange={(v) => v && addBlock(row.id, col.id, v as BlockType)}
                                          />
                                          <ActionIcon
                                            size="sm"
                                            color="red"
                                            variant="subtle"
                                            aria-label="Delete column"
                                            onClick={() => removeColumn(row.id, col.id)}
                                            disabled={row.columns.length <= 1}
                                          >
                                            <IconTrash size={14} />
                                          </ActionIcon>
                                        </Group>
                                      </Group>

                                      <SortableContext items={col.blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
                                        <Stack gap="xs">
                                          {col.blocks.length === 0 ? (
                                            <Text size="xs" c="dimmed">No blocks yet. Use “Add block”.</Text>
                                          ) : null}
                                          {col.blocks.map((b) => (
                                            <SortableBlock key={b.id} id={b.id}>
                                              <Stack gap={8}>
                                                <Group justify="space-between" align="center">
                                                  <Badge size="sm" variant="dot">{b.type}</Badge>
                                                  <ActionIcon size="sm" color="red" variant="subtle" onClick={() => removeBlock(b.id)} aria-label="Remove block">
                                                    <IconTrash size={14} />
                                                  </ActionIcon>
                                                </Group>

                                                {(b.type === "heading" || b.type === "subtitle") ? (
                                                  <TextInput
                                                    size="xs"
                                                    value={b.title ?? b.body ?? ""}
                                                    onChange={(e) => updateBlock(b.id, b.type === "heading" ? { title: e.currentTarget.value } : { body: e.currentTarget.value })}
                                                  />
                                                ) : null}

                                                {b.type === "rich_text" ? (
                                                  <Textarea
                                                    size="xs"
                                                    minRows={3}
                                                    value={b.body ?? ""}
                                                    onChange={(e) => updateBlock(b.id, { body: e.currentTarget.value })}
                                                  />
                                                ) : null}

                                                {b.type === "image" ? (
                                                  <Stack gap={6}>
                                                    <TextInput
                                                      size="xs"
                                                      label="Image URL"
                                                      value={b.imageUrl ?? ""}
                                                      onChange={(e) => updateBlock(b.id, { imageUrl: e.currentTarget.value })}
                                                    />
                                                    <Button size="xs" variant="default" onClick={() => openMediaPicker(b.id)}>
                                                      Choose from media library
                                                    </Button>
                                                  </Stack>
                                                ) : null}

                                                {b.type === "list" ? (
                                                  <Stack gap={6}>
                                                    <SegmentedControl
                                                      size="xs"
                                                      value={b.listStyle === "basic" ? "basic" : "steps"}
                                                      onChange={(v) => updateBlock(b.id, { listStyle: v === "basic" ? "basic" : "steps" })}
                                                      data={[
                                                        { label: "Steps list", value: "steps" },
                                                        { label: "Basic bullets", value: "basic" },
                                                      ]}
                                                    />
                                                    <Textarea
                                                      size="xs"
                                                      label={b.listStyle === "basic" ? "List items (one per line)" : "Steps (title | body per line)"}
                                                      minRows={3}
                                                      value={(b.items ?? []).join("\n")}
                                                      onChange={(e) => updateBlock(b.id, { items: e.currentTarget.value.split("\n").map((x) => x.trim()).filter(Boolean) })}
                                                    />
                                                    <Text size="xs" c="dimmed">
                                                      {b.listStyle === "basic" ? "Tip: one item per line." : "Format: Title | Body"}
                                                    </Text>
                                                  </Stack>
                                                ) : null}

                                                {b.type === "cards" ? (
                                                  <Stack gap={6}>
                                                    <Textarea
                                                      size="xs"
                                                      label="Cards (title | body per line)"
                                                      minRows={3}
                                                      value={(b.cards ?? []).map((card) => `${card.title} | ${card.body}`).join("\n")}
                                                      onChange={(e) => {
                                                        const cards = e.currentTarget.value
                                                          .split("\n")
                                                          .map((line) => line.trim())
                                                          .filter(Boolean)
                                                          .map((line) => {
                                                            const [title, ...rest] = line.split("|")
                                                            return { title: title?.trim() || "Card", body: rest.join("|").trim() || "" }
                                                          })
                                                        updateBlock(b.id, { cards })
                                                      }}
                                                    />
                                                    <Text size="xs" c="dimmed">Format: <code>Title | Body</code></Text>
                                                  </Stack>
                                                ) : null}

                                                {b.type === "faq" ? (
                                                  <Stack gap={6}>
                                                    <Textarea
                                                      size="xs"
                                                      label="FAQs (question | answer per line)"
                                                      minRows={3}
                                                      value={(b.faqs ?? []).map((faq) => `${faq.q} | ${faq.a}`).join("\n")}
                                                      onChange={(e) => {
                                                        const faqs = e.currentTarget.value
                                                          .split("\n")
                                                          .map((line) => line.trim())
                                                          .filter(Boolean)
                                                          .map((line) => {
                                                            const [q, ...rest] = line.split("|")
                                                            return { q: q?.trim() || "Question", a: rest.join("|").trim() || "" }
                                                          })
                                                        updateBlock(b.id, { faqs })
                                                      }}
                                                    />
                                                    <Text size="xs" c="dimmed">Format: <code>Question | Answer</code></Text>
                                                  </Stack>
                                                ) : null}

                                                {b.type === "cta" ? (
                                                  <SimpleGrid cols={2} spacing="xs">
                                                    <TextInput size="xs" label="Primary label" value={b.ctaPrimaryLabel ?? ""} onChange={(e) => updateBlock(b.id, { ctaPrimaryLabel: e.currentTarget.value })} />
                                                    <TextInput size="xs" label="Primary href" value={b.ctaPrimaryHref ?? ""} onChange={(e) => updateBlock(b.id, { ctaPrimaryHref: e.currentTarget.value })} />
                                                    <TextInput size="xs" label="Secondary label" value={b.ctaSecondaryLabel ?? ""} onChange={(e) => updateBlock(b.id, { ctaSecondaryLabel: e.currentTarget.value })} />
                                                    <TextInput size="xs" label="Secondary href" value={b.ctaSecondaryHref ?? ""} onChange={(e) => updateBlock(b.id, { ctaSecondaryHref: e.currentTarget.value })} />
                                                  </SimpleGrid>
                                                ) : null}
                                              </Stack>
                                            </SortableBlock>
                                          ))}
                                        </Stack>
                                      </SortableContext>
                                    </Stack>
                                  </ColumnDropZone>
                                  </DraggableColumn>
                                ))}
                              </SimpleGrid>
                          </Stack>
                        </SortableRow>
                      ))}
                    </Stack>
                  </SortableContext>
                </DndContext>
              </Stack>
              </Paper>
            </Grid.Col>

            <Grid.Col span={{ base: 12, lg: 5 }}>
              <Paper withBorder radius="md" p="sm">
              <Stack>
                <Group justify="space-between">
                  <Title order={5}>Live preview</Title>
                  <Group>
                    <SegmentedControl
                      value={previewMode}
                      onChange={(v) => setPreviewMode(v as "desktop" | "mobile")}
                      data={[{ label: "Desktop", value: "desktop" }, { label: "Mobile", value: "mobile" }]}
                    />
                    <ActionIcon variant="default" aria-label="Open fullscreen preview" onClick={() => setFullscreenPreviewOpen(true)}>
                      <IconArrowsMaximize size={16} />
                    </ActionIcon>
                  </Group>
                </Group>
                <SchemaPreview schema={schema} mobile={previewMode === "mobile"} />
                <Text size="xs" c="dimmed">Preview uses the same composed renderer model as live pages.</Text>
              </Stack>
              </Paper>
            </Grid.Col>
          </Grid>
          </AdminPanel>
        </Tabs.Panel>
      </Tabs>

      <Modal opened={fullscreenPreviewOpen} onClose={() => setFullscreenPreviewOpen(false)} title="Section preview" size="xl" centered>
        <SchemaPreview schema={schema} mobile={previewMode === "mobile"} />
      </Modal>

      <MediaLibraryModal
        opened={mediaLibraryOpen}
        onClose={() => {
          setMediaLibraryOpen(false)
          setMediaTargetBlockId(null)
        }}
        onSelect={onSelectMedia}
        allowDelete={false}
        title="Select image for block"
      />

      <Modal opened={createOpen} onClose={() => setCreateOpen(false)} title="New custom section type" centered>
        <Stack>
          <TextInput label="Unique key" placeholder="e.g. offer_showcase" value={newKey} onChange={(e) => setNewKey(e.currentTarget.value)} />
          <TextInput label="Label" placeholder="Offer Showcase" value={newLabel} onChange={(e) => setNewLabel(e.currentTarget.value)} />
          <Switch
            checked
            onChange={() => null}
            label="Local/global capable (uses existing section/global flows)"
            disabled
          />
          <Group justify="end">
            <Button variant="default" onClick={() => setCreateOpen(false)}>Cancel</Button>
            <Button onClick={createCustomType} loading={saving}>Create</Button>
          </Group>
        </Stack>
      </Modal>
    </Stack>
  )
}
