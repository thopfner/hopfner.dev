"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { forwardRef, isValidElement, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react"
import {
  Autocomplete,
  Box as MuiBox,
  Button as MuiButton,
  Chip as MuiChip,
  CircularProgress,
  Collapse as MuiCollapse,
  Dialog,
  DialogContent,
  DialogTitle,
  Divider,
  InputAdornment,
  ListItemIcon,
  Menu as MuiMenu,
  MenuItem,
  Paper as MuiPaper,
  Slider as MuiSlider,
  Stack as MuiStack,
  Switch as MuiSwitch,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip as MuiTooltip,
  Typography,
  type BoxProps,
  type ButtonProps as MuiButtonProps,
  type ChipProps as MuiChipProps,
  type PaperProps as MuiPaperProps,
  type SliderProps as MuiSliderProps,
  type StackProps as MuiStackProps,
  type SwitchProps as MuiSwitchProps,
  type TextFieldProps,
  type TypographyProps,
} from "@mui/material"
import {
  DndContext,
  type DragEndEvent,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core"
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import {
  IconAlertTriangle,
  IconArrowDown,
  IconArrowUp,
  IconChevronLeft,
  IconChevronDown,
  IconChevronUp,
  IconCopy,
  IconDotsVertical,
  IconInfoCircle,
  IconLock,
  IconSearch,
  IconTrash,
  IconWorld,
} from "@tabler/icons-react"

import { ImageFieldPicker } from "@/components/image-field-picker"
import { MediaLibraryModal } from "@/components/media-library-modal"
import { SectionEditorDrawer } from "@/components/section-editor-drawer"
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
import { uploadMedia } from "@/lib/media/upload"
import type { MediaItem } from "@/lib/media/types"
import { createClient } from "@/lib/supabase/browser"
import { applyEditorError } from "@/lib/cms/editor-error-message"

async function getImageSize(file: File): Promise<{ width?: number; height?: number }> {
  if (!file.type.startsWith("image/")) return {}
  const url = URL.createObjectURL(file)
  try {
    const img = document.createElement("img")
    img.src = url
    await img.decode()
    return { width: img.naturalWidth, height: img.naturalHeight }
  } catch {
    return {}
  } finally {
    URL.revokeObjectURL(url)
  }
}

async function uploadToCmsMedia(file: File, supabase: ReturnType<typeof createClient>) {
  const { bucket, path, url } = await uploadMedia(file)
  const publicUrl = url ?? ""
  if (!publicUrl) {
    throw new Error("Upload succeeded but no public URL was returned.")
  }

  const { width, height } = await getImageSize(file)

  const { error: mediaError } = await supabase.from("media").insert({
    bucket,
    path,
    mime_type: file.type,
    size_bytes: file.size,
    width: width ?? null,
    height: height ?? null,
    alt: null,
  })

  if (mediaError) {
    console.warn("Failed to insert media metadata:", mediaError.message)
  }

  return { publicUrl }
}

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v)
    ? (v as Record<string, unknown>)
    : {}
}

type ButtonColor = "red" | "yellow" | "blue" | "teal" | "gray" | string

function toMuiButtonColor(color?: ButtonColor): MuiButtonProps["color"] {
  if (color === "red") return "error"
  if (color === "yellow") return "warning"
  if (color === "teal") return "success"
  return "primary"
}

const Box = MuiBox

type ButtonProps = Omit<MuiButtonProps, "variant" | "size" | "color"> & {
  variant?: "filled" | "light" | "default" | "subtle"
  size?: "xs" | "sm" | "md"
  loading?: boolean
  color?: ButtonColor
  leftSection?: ReactNode
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant, size, loading, color, leftSection, startIcon, disabled, sx, ...props },
  ref
) {
  const muiVariant: MuiButtonProps["variant"] = toMuiButtonVariant(variant)
  const muiSize: MuiButtonProps["size"] = toMuiControlSize(size)

  return (
    <MuiButton
      ref={ref}
      variant={muiVariant}
      size={muiSize}
      color={toMuiButtonColor(color)}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress color="inherit" size={14} /> : leftSection ?? startIcon}
      sx={{ textTransform: "none", ...sx }}
      {...props}
    />
  )
})



type BadgeTone = "blue" | "teal" | "gray" | "yellow" | "red" | "dark"

type BadgeProps = Omit<MuiChipProps, "label" | "variant" | "color" | "size" | "children" | "icon"> & {
  size?: "xs" | "sm" | "md"
  variant?: "filled" | "light" | "default"
  color?: BadgeTone
  radius?: MantineRadius
  leftSection?: ReactNode
  children: ReactNode
}

function badgeLightStyles(color?: BadgeTone) {
  switch (color) {
    case "teal":
      return { bgcolor: "rgba(2, 132, 199, 0.14)", color: "#0f766e", borderColor: "rgba(2, 132, 199, 0.35)" }
    case "yellow":
      return { bgcolor: "rgba(245, 158, 11, 0.18)", color: "#92400e", borderColor: "rgba(245, 158, 11, 0.4)" }
    case "red":
      return { bgcolor: "rgba(239, 68, 68, 0.16)", color: "#b91c1c", borderColor: "rgba(239, 68, 68, 0.38)" }
    case "gray":
      return { bgcolor: "rgba(100, 116, 139, 0.14)", color: "#475569", borderColor: "rgba(100, 116, 139, 0.35)" }
    case "blue":
      return { bgcolor: "rgba(59, 130, 246, 0.16)", color: "#1d4ed8", borderColor: "rgba(59, 130, 246, 0.38)" }
    case "dark":
      return { bgcolor: "rgba(15, 23, 42, 0.15)", color: "#0f172a", borderColor: "rgba(15, 23, 42, 0.4)" }
    default:
      return { bgcolor: "transparent", color: "inherit", borderColor: "divider" }
  }
}

function Badge({ size, variant, color, radius, leftSection, children, sx, ...props }: BadgeProps) {
  const muiVariant: MuiChipProps["variant"] = variant === "filled" ? "filled" : "outlined"
  const muiColor: MuiChipProps["color"] =
    color === "teal" ? "success" : color === "yellow" ? "warning" : color === "red" ? "error" : color === "blue" ? "primary" : "default"
  const lightStyles = badgeLightStyles(color)
  const icon = leftSection && isValidElement(leftSection) ? leftSection : undefined

  return (
    <MuiChip
      size={size === "xs" || size === "sm" ? "small" : "medium"}
      variant={muiVariant}
      color={muiColor}
      label={children}
      icon={icon}
      sx={{
        borderRadius: toCssRadius(radius),
        ...(variant === "light" ? lightStyles : null),
        ...(variant === "filled" && color === "dark"
          ? {
              bgcolor: "text.primary",
              color: "background.paper",
            }
          : null),
        ...(size === "xs"
          ? {
              height: "20px",
              "& .MuiChip-label": { px: 1, fontSize: "0.68rem" },
            }
          : null),
        ...sx,
      }}
      {...props}
    />
  )
}

type PaperShadow = "xs" | "sm" | "md" | "lg" | "xl"

const SHADOW_MAP: Record<PaperShadow, number> = {
  xs: 1,
  sm: 2,
  md: 4,
  lg: 8,
  xl: 12,
}

type PaperProps = Omit<MuiPaperProps, "variant" | "elevation"> & {
  withBorder?: boolean
  p?: MantineSpace
  radius?: MantineRadius
  shadow?: PaperShadow
}

const Paper = forwardRef<HTMLDivElement, PaperProps>(function Paper(
  { withBorder, p, radius, shadow, sx, ...props },
  ref
) {
  return (
    <MuiPaper
      ref={ref}
      variant={withBorder ? "outlined" : undefined}
      elevation={shadow ? SHADOW_MAP[shadow] : 0}
      sx={{
        p: toCssSpace(p),
        borderRadius: toCssRadius(radius),
        ...sx,
      }}
      {...props}
    />
  )
})

type StackProps = Omit<MuiStackProps, "gap" | "alignItems" | "mt" | "mb"> & {
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
  wrap?: "wrap" | "nowrap"
  mt?: MantineSpace
  mb?: MantineSpace
}

function Group({ gap, align, justify, grow, wrap, mt, mb, sx, children, ...props }: GroupProps) {
  return (
    <MuiBox
      sx={{
        display: "flex",
        flexWrap: wrap ?? "wrap",
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
    </MuiBox>
  )
}

type TextProps = Omit<TypographyProps, "variant" | "color" | "mt" | "mb"> & {
  size?: "xs" | "sm" | "md"
  c?: "dimmed" | "red" | "yellow" | "teal"
  fw?: number
  lineClamp?: number
  mt?: MantineSpace
  mb?: MantineSpace
}

function Text({ size, c, fw, lineClamp, mt, mb, sx, ...props }: TextProps) {
  const variant: TypographyProps["variant"] = size === "xs" ? "caption" : size === "sm" ? "body2" : "body1"
  const color =
    c === "dimmed" ? "text.secondary" : c === "red" ? "error.main" : c === "yellow" ? "warning.main" : c === "teal" ? "success.main" : undefined

  return (
    <Typography
      variant={variant}
      sx={{
        color,
        fontWeight: fw,
        mt: toCssSpace(mt),
        mb: toCssSpace(mb),
        ...(lineClamp
          ? {
              display: "-webkit-box",
              WebkitLineClamp: lineClamp,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }
          : null),
        ...sx,
      }}
      {...props}
    />
  )
}

type TitleProps = Omit<TypographyProps, "variant" | "component" | "order"> & {
  order?: 1 | 2 | 3 | 4 | 5 | 6
  size?: TypographyProps["variant"]
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

  return <Typography variant={size ?? byOrder[order]} sx={{ fontWeight: 700, ...sx }} {...props} />
}

type TextInputProps = Omit<TextFieldProps, "size"> & {
  size?: "xs" | "sm" | "md"
  leftSection?: ReactNode
  w?: number | string
}

function TextInput({ size, leftSection, w, InputProps, fullWidth, sx, InputLabelProps, ...props }: TextInputProps) {
  const fullWidthValue = fullWidth ?? w === undefined
  return (
    <TextField
      size={size === "xs" || size === "sm" ? "small" : "medium"}
      fullWidth={fullWidthValue}
      InputLabelProps={{ shrink: true, ...InputLabelProps }}
      InputProps={{
        ...InputProps,
        startAdornment: leftSection ? <InputAdornment position="start">{leftSection}</InputAdornment> : InputProps?.startAdornment,
      }}
      sx={{ width: w, ...sx }}
      {...props}
    />
  )
}

type NumberInputProps = Omit<TextFieldProps, "size" | "type" | "value" | "onChange"> & {
  size?: "xs" | "sm" | "md"
  value: number
  onChange?: (value: number | string) => void
  min?: number
  max?: number
  step?: number
  suffix?: string
  w?: number | string
}

function NumberInput({ size, value, onChange, suffix, w, InputProps, fullWidth, sx, ...props }: NumberInputProps) {
  const fullWidthValue = fullWidth ?? w === undefined

  return (
    <TextField
      type="number"
      size={size === "xs" || size === "sm" ? "small" : "medium"}
      value={value}
      fullWidth={fullWidthValue}
      onChange={(event) => {
        const raw = event.currentTarget.value
        if (!raw.length) {
          onChange?.("")
          return
        }
        const parsed = Number(raw)
        onChange?.(Number.isFinite(parsed) ? parsed : raw)
      }}
      InputProps={{
        ...InputProps,
        endAdornment: suffix ? <InputAdornment position="end">{suffix}</InputAdornment> : InputProps?.endAdornment,
      }}
      sx={{ width: w, ...sx }}
      {...props}
    />
  )
}

type SelectProps = {
  label?: string
  placeholder?: string
  clearable?: boolean
  value?: string | null
  onChange?: (value: string | null) => void
  data: SelectData
  disabled?: boolean
  w?: number | string
  "aria-label"?: string
}

function Select({ label, placeholder, clearable, value, onChange, data, disabled, w, "aria-label": ariaLabel }: SelectProps) {
  const options = normalizeSelectData(data)
  const selected = options.find((option) => option.value === (value ?? "")) ?? null

  return (
    <Autocomplete
      fullWidth
      options={options}
      value={selected}
      disabled={disabled}
      onChange={(_event, option) => onChange?.(option?.value ?? null)}
      isOptionEqualToValue={(option, nextValue) => option.value === nextValue.value}
      getOptionLabel={(option) => option.label}
      disableClearable={!clearable}
      sx={w !== undefined ? { width: w } : { width: "100%" }}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          label={label}
          placeholder={placeholder}
          inputProps={{
            ...params.inputProps,
            "aria-label": ariaLabel,
          }}
        />
      )}
    />
  )
}

type SegmentedControlProps = {
  value: string
  onChange: (value: string) => void
  data: Array<{ label: string; value: string }>
  "aria-label"?: string
}

function SegmentedControl({ value, onChange, data, "aria-label": ariaLabel }: SegmentedControlProps) {
  return (
    <ToggleButtonGroup
      exclusive
      fullWidth
      value={value}
      onChange={(_event, nextValue: string | null) => {
        if (typeof nextValue === "string") onChange(nextValue)
      }}
      aria-label={ariaLabel}
    >
      {data.map((item) => (
        <ToggleButton key={item.value} value={item.value}>
          {item.label}
        </ToggleButton>
      ))}
    </ToggleButtonGroup>
  )
}

type SwitchProps = Omit<MuiSwitchProps, "size"> & {
  size?: "xs" | "sm" | "md"
}

function Switch({ size, ...props }: SwitchProps) {
  return <MuiSwitch size={size === "md" ? "medium" : "small"} {...props} />
}

type SliderLabel = "always" | "hover" | "never" | ((value: number) => string)
type SliderProps = Omit<MuiSliderProps, "value" | "defaultValue" | "onChange" | "valueLabelDisplay" | "valueLabelFormat"> & {
  value: number
  onChange: (value: number) => void
  label?: SliderLabel
}

function Slider({ label, value, onChange, ...props }: SliderProps) {
  const valueLabelDisplay: MuiSliderProps["valueLabelDisplay"] =
    label === "always" ? "on" : label === "never" ? "off" : label === "hover" || typeof label === "function" ? "auto" : "off"

  return (
    <MuiSlider
      value={value}
      onChange={(_event, nextValue) => {
        if (typeof nextValue === "number") onChange(nextValue)
      }}
      valueLabelDisplay={valueLabelDisplay}
      valueLabelFormat={typeof label === "function" ? (nextValue) => label(Number(nextValue)) : undefined}
      {...props}
    />
  )
}

type CollapseProps = {
  in: boolean
  children: ReactNode
}

function Collapse({ in: inValue, children }: CollapseProps) {
  return <MuiCollapse in={inValue}>{children}</MuiCollapse>
}

type ModalSize = "xs" | "sm" | "md" | "lg" | "xl"

type ModalProps = {
  opened: boolean
  onClose: () => void
  title?: ReactNode
  size?: ModalSize
  centered?: boolean
  children: ReactNode
}

function Modal({ opened, onClose, title, size = "sm", children }: ModalProps) {
  return (
    <Dialog open={opened} onClose={() => onClose()} maxWidth={size} fullWidth>
      {title ? <DialogTitle>{title}</DialogTitle> : null}
      <DialogContent>{children}</DialogContent>
    </Dialog>
  )
}

type TooltipProps = {
  label: ReactNode
  multiline?: boolean
  maw?: number
  children: ReactNode
}

function Tooltip({ label, multiline, maw, children }: TooltipProps) {
  return (
    <MuiTooltip
      title={label}
      arrow
      slotProps={{
        tooltip: {
          sx: {
            maxWidth: maw,
            whiteSpace: multiline ? "normal" : "nowrap",
          },
        },
      }}
    >
      <span style={{ display: "inline-flex", maxWidth: "100%" }}>{children}</span>
    </MuiTooltip>
  )
}

type BuiltinCmsSectionType =
  | "nav_links"
  | "hero_cta"
  | "card_grid"
  | "steps_list"
  | "title_body_list"
  | "rich_text_block"
  | "label_value_list"
  | "faq_list"
  | "cta_block"
  | "footer_grid"

type CmsSectionType = BuiltinCmsSectionType | string

type SectionTypeDefault = {
  section_type: CmsSectionType
  label: string
  description: string | null
  default_title: string | null
  default_subtitle: string | null
  default_cta_primary_label: string | null
  default_cta_primary_href: string | null
  default_cta_secondary_label: string | null
  default_cta_secondary_href: string | null
  default_background_media_url: string | null
  default_formatting: Record<string, unknown>
  default_content: Record<string, unknown>
  capabilities: Record<string, unknown>
}

type SectionTypeDefaultsMap = Record<string, SectionTypeDefault>

const SECTION_TYPES: BuiltinCmsSectionType[] = [
  "nav_links",
  "hero_cta",
  "card_grid",
  "steps_list",
  "title_body_list",
  "rich_text_block",
  "label_value_list",
  "faq_list",
  "cta_block",
  "footer_grid",
]

const BUILTIN_SECTION_TYPE_SET = new Set<string>(SECTION_TYPES)

function normalizeSectionType(raw: string): CmsSectionType | null {
  switch (raw) {
    case "nav_links":
    case "hero_cta":
    case "card_grid":
    case "steps_list":
    case "title_body_list":
    case "rich_text_block":
    case "label_value_list":
    case "faq_list":
    case "cta_block":
    case "footer_grid":
      return raw
    case "header_nav":
      return "nav_links"
    case "hero":
      return "hero_cta"
    case "what_i_deliver":
      return "card_grid"
    case "how_it_works":
      return "steps_list"
    case "workflows":
      return "title_body_list"
    case "why_this_approach":
      return "rich_text_block"
    case "tech_stack":
      return "label_value_list"
    case "faq":
      return "faq_list"
    case "final_cta":
      return "cta_block"
    default:
      return raw?.trim() ? raw.trim() : null
  }
}

type SectionRow = {
  id: string
  page_id: string
  section_type: CmsSectionType
  key: string | null
  enabled: boolean
  position: number
  updated_at: string
  global_section_id?: string | null
}

type SectionVersionRow = {
  id: string
  section_id: string
  version: number
  status: "draft" | "published" | "archived"
  title: string | null
  created_at: string
  published_at: string | null
}

type GlobalSectionVersionRow = {
  id: string
  global_section_id: string
  version: number
  status: "draft" | "published" | "archived"
  title: string | null
  created_at: string
  published_at: string | null
}

type VersionSummary = {
  id: string
  version: number
  status: "draft" | "published" | "archived"
  title: string | null
}

type CmsPageRow = { id: string; slug: string; title: string; bg_image_url?: string | null; formatting_override?: Record<string, unknown> }

type BackdropApplyRow = {
  pageId: string
  pageSlug: string
  pageTitle: string
  outcome: "updated" | "failed"
  message: string
}

type BackdropApplyAudit = {
  updatedCount: number
  failedCount: number
  results: BackdropApplyRow[]
}

type DuplicateOutcome = "duplicated" | "skipped" | "failed"

type DuplicateBulkPageResult = {
  pageId: string
  pageSlug: string
  pageTitle: string
  outcome: DuplicateOutcome
  message: string
  insertedSectionId?: string
}

type DuplicateBulkAudit = {
  sourceSectionId: string
  sourcePageId: string
  sourceFingerprint: string
  attemptedAt: string
  placementMode: "same_relative_index"
  duplicateRule: string
  insertedCount: number
  skippedCount: number
  failedCount: number
  noOpMessage?: string
  results: DuplicateBulkPageResult[]
}

function TypeBadge({
  type,
  defaults,
}: {
  type: CmsSectionType
  defaults?: SectionTypeDefaultsMap
}) {
  return (
    <Badge size="sm" variant="default">
      {defaults?.[type]?.label ?? type}
    </Badge>
  )
}

type ToastItem = {
  id: string
  tone: "success" | "error" | "info"
  message: string
}

function Toast({ items, onDismiss }: { items: ToastItem[]; onDismiss: (id: string) => void }) {
  if (!items.length) return null
  return (
    <Box
      style={{
        position: "fixed",
        right: 16,
        bottom: 16,
        zIndex: 1000,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 360,
      }}
    >
      {items.map((item) => (
        <Paper key={item.id} withBorder radius="md" p="sm" shadow="md">
          <Group justify="space-between" align="start" wrap="nowrap" gap="xs">
            <Text size="sm" c={item.tone === "error" ? "red" : item.tone === "success" ? "teal" : "dimmed"}>
              {item.message}
            </Text>
            <ActionIcon variant="subtle" size="sm" aria-label="Dismiss notification" onClick={() => onDismiss(item.id)}>
              ×
            </ActionIcon>
          </Group>
        </Paper>
      ))}
    </Box>
  )
}

function ConfirmModal({
  opened,
  onClose,
  title,
  description,
  confirmLabel,
  cancelLabel = "Cancel",
  confirmColor = "blue",
  loading,
  onConfirm,
}: {
  opened: boolean
  onClose: () => void
  title: string
  description: string
  confirmLabel: string
  cancelLabel?: string
  confirmColor?: string
  loading?: boolean
  onConfirm: () => void
}) {
  return (
    <Modal opened={opened} onClose={() => (loading ? null : onClose())} title={title} centered>
      <Stack gap="sm">
        <Text size="sm">{description}</Text>
        <Group justify="end">
          <Button variant="default" onClick={onClose} disabled={loading}>
            {cancelLabel}
          </Button>
          <Button color={confirmColor} loading={loading} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </Group>
      </Stack>
    </Modal>
  )
}

function PageEditorHeader({ page }: { page: CmsPageRow | null }) {
  return (
    <Group justify="space-between" align="start" wrap="wrap" gap="xs">
      <div>
        <Title order={2} size="h3">
          Page Editor
        </Title>
        <Text c="dimmed" size="sm" style={{ lineHeight: 1.6 }}>
          {page ? (
            <>
              Editing <b>{page.title}</b> (<code>{page.slug}</code>)
            </>
          ) : (
            "Loading…"
          )}
        </Text>
      </div>
      <Button size="sm" variant="default" component={Link} href="/admin">
        Back
      </Button>
    </Group>
  )
}

function LabeledSlider({
  label,
  description,
  value,
  min,
  max,
  step,
  defaultValue,
  disabled,
  onChange,
}: {
  label: string
  description: string
  value: number
  min: number
  max: number
  step: number
  defaultValue: number
  disabled?: boolean
  onChange: (value: number) => void
}) {
  const percent = Math.round(value * 100)

  function clampPercent(next: number) {
    const scaled = Math.min(max, Math.max(min, next / 100))
    onChange(scaled)
  }

  return (
    <Stack gap={6}>
      <Group justify="space-between" align="center" wrap="nowrap">
        <Group gap={6} align="center">
          <Text size="sm" fw={600}>{label}</Text>
          <Tooltip label={description} multiline maw={280}>
            <ActionIcon variant="subtle" size="sm" aria-label={`${label} help`}>
              <IconInfoCircle size={14} />
            </ActionIcon>
          </Tooltip>
        </Group>
        <Group gap="xs" wrap="nowrap">
          <NumberInput
            aria-label={`${label} percentage`}
            min={Math.round(min * 100)}
            max={Math.round(max * 100)}
            step={1}
            value={percent}
            onChange={(v) => {
              if (typeof v === "number" && Number.isFinite(v)) clampPercent(v)
            }}
            suffix="%"
            w={84}
            size="xs"
            disabled={disabled}
          />
          <Tooltip label="Reset to default">
            <ActionIcon
              variant="default"
              aria-label={`Reset ${label}`}
              disabled={disabled}
              onClick={() => onChange(defaultValue)}
            >
              <IconArrowUp size={14} style={{ transform: "rotate(180deg)" }} />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Slider
        label={(v) => `${Math.round(v * 100)}%`}
        min={min}
        max={max}
        step={step}
        value={value}
        disabled={disabled}
        onChange={onChange}
        aria-label={label}
      />
    </Stack>
  )
}

type SectionFilterStatus = "published" | "draft" | "hidden"

type SectionFilterSource = "local" | "global"

function SectionsToolbar({
  search,
  onSearch,
  statusFilters,
  onStatusFilters,
  sourceFilters,
  onSourceFilters,
  typeFilter,
  onTypeFilter,
  sortMode,
  onSortMode,
  types,
  onAddSection,
}: {
  search: string
  onSearch: (value: string) => void
  statusFilters: SectionFilterStatus[]
  onStatusFilters: (value: SectionFilterStatus[]) => void
  sourceFilters: SectionFilterSource[]
  onSourceFilters: (value: SectionFilterSource[]) => void
  typeFilter: string | null
  onTypeFilter: (value: string | null) => void
  sortMode: "manual" | "updated"
  onSortMode: (value: "manual" | "updated") => void
  types: Array<{ value: string; label: string }>
  onAddSection: () => void
}) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [controlsAnchorEl, setControlsAnchorEl] = useState<HTMLElement | null>(null)
  const controlsOpen = Boolean(controlsAnchorEl)
  const controlsButtonRef = useRef<HTMLButtonElement | null>(null)
  const controlsMenuId = "sections-controls-menu"
  const filtersDialogTitleId = "sections-filters-dialog-title"

  function toggleStatusFilter(value: SectionFilterStatus) {
    onStatusFilters(
      statusFilters.includes(value)
        ? statusFilters.filter((item) => item !== value)
        : [...statusFilters, value]
    )
  }

  function toggleSourceFilter(value: SectionFilterSource) {
    onSourceFilters(
      sourceFilters.includes(value)
        ? sourceFilters.filter((item) => item !== value)
        : [...sourceFilters, value]
    )
  }

  const activeFilterCount =
    statusFilters.length + sourceFilters.length + (typeFilter ? 1 : 0) + (search.trim() ? 1 : 0)

  return (
    <Stack gap="xs" mb="sm">
      <Box
        sx={{
          display: "grid",
          gap: 1,
          gridTemplateColumns: { xs: "1fr", sm: "1fr auto auto" },
          alignItems: "center",
        }}
      >
        <TextInput
          leftSection={<IconSearch size={14} />}
          placeholder="Search sections…"
          value={search}
          onChange={(e) => onSearch(e.currentTarget.value)}
          aria-label="Search sections"
        />

        <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
          <Button
            ref={controlsButtonRef}
            variant="default"
            leftSection={<IconDotsVertical size={14} />}
            onClick={(event) => setControlsAnchorEl(event.currentTarget)}
            aria-label="Open section controls"
            aria-haspopup="menu"
            aria-expanded={controlsOpen}
            aria-controls={controlsOpen ? controlsMenuId : undefined}
          >
            Controls{activeFilterCount ? ` (${activeFilterCount})` : ""}
          </Button>

          <MuiMenu
            id={controlsMenuId}
            anchorEl={controlsAnchorEl}
            open={controlsOpen}
            onClose={() => {
              setControlsAnchorEl(null)
              controlsButtonRef.current?.focus()
            }}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
            slotProps={{
              paper: {
                sx: {
                  width: { xs: "min(92vw, 280px)", sm: 260 },
                  maxWidth: "92vw",
                  maxHeight: "70vh",
                  overflowY: "auto",
                  zIndex: (theme) => theme.zIndex.modal + 1,
                },
              },
            }}
          >
            <MenuItem
              selected={sortMode === "manual"}
              onClick={() => {
                onSortMode("manual")
                setControlsAnchorEl(null)
              }}
            >
              Sort: Manual order
            </MenuItem>
            <MenuItem
              selected={sortMode === "updated"}
              onClick={() => {
                onSortMode("updated")
                setControlsAnchorEl(null)
              }}
            >
              Sort: Last updated
            </MenuItem>
            <Divider />
            <MenuItem
              onClick={() => {
                setControlsAnchorEl(null)
                setFiltersOpen(true)
              }}
            >
              Filters{activeFilterCount ? ` (${activeFilterCount})` : ""}
            </MenuItem>
            <MenuItem
              onClick={() => {
                onStatusFilters([])
                onSourceFilters([])
                onTypeFilter(null)
                onSearch("")
                setControlsAnchorEl(null)
              }}
            >
              Reset controls
            </MenuItem>
          </MuiMenu>
        </Group>

        <Box sx={{ display: "flex", justifyContent: { xs: "flex-end", sm: "flex-start" } }}>
          <Button size="sm" onClick={onAddSection}>
            Add section
          </Button>
        </Box>
      </Box>

      <Dialog
        open={filtersOpen}
        onClose={() => {
          setFiltersOpen(false)
          controlsButtonRef.current?.focus()
        }}
        aria-labelledby={filtersDialogTitleId}
        fullWidth
        maxWidth="sm"
        slotProps={{
          paper: {
            sx: {
              width: { xs: "92vw", sm: "100%" },
              maxWidth: { xs: "92vw", sm: 560 },
              maxHeight: { xs: "78vh", sm: "70vh" },
              display: "flex",
            },
          },
        }}
      >
        <DialogTitle id={filtersDialogTitleId}>Section filters</DialogTitle>
        <DialogContent sx={{ overflowY: "auto" }}>
          <Stack gap="sm" mt="xs">
            <Text size="xs" c="dimmed">Status</Text>
            <Group gap="xs">
              <MuiChip
                clickable
                label="Published"
                color={statusFilters.includes("published") ? "primary" : "default"}
                variant={statusFilters.includes("published") ? "filled" : "outlined"}
                onClick={() => toggleStatusFilter("published")}
              />
              <MuiChip
                clickable
                label="Draft"
                color={statusFilters.includes("draft") ? "primary" : "default"}
                variant={statusFilters.includes("draft") ? "filled" : "outlined"}
                onClick={() => toggleStatusFilter("draft")}
              />
              <MuiChip
                clickable
                label="Hidden"
                color={statusFilters.includes("hidden") ? "primary" : "default"}
                variant={statusFilters.includes("hidden") ? "filled" : "outlined"}
                onClick={() => toggleStatusFilter("hidden")}
              />
            </Group>

            <Text size="xs" c="dimmed">Source</Text>
            <Group gap="xs">
              <MuiChip
                clickable
                label="Local"
                color={sourceFilters.includes("local") ? "primary" : "default"}
                variant={sourceFilters.includes("local") ? "filled" : "outlined"}
                onClick={() => toggleSourceFilter("local")}
              />
              <MuiChip
                clickable
                label="Global"
                color={sourceFilters.includes("global") ? "primary" : "default"}
                variant={sourceFilters.includes("global") ? "filled" : "outlined"}
                onClick={() => toggleSourceFilter("global")}
              />
            </Group>

            <Text size="xs" c="dimmed">Type</Text>
            <Select
              placeholder="Type"
              clearable
              value={typeFilter}
              onChange={onTypeFilter}
              data={types}
              aria-label="Filter by section type"
            />

            <Group
              justify="space-between"
              mt="xs"
              sx={{
                position: "sticky",
                bottom: -1,
                backgroundColor: "background.paper",
                py: 1,
                borderTop: "1px solid",
                borderColor: "divider",
              }}
            >
              <Button
                variant="subtle"
                onClick={() => {
                  onStatusFilters([])
                  onSourceFilters([])
                  onTypeFilter(null)
                  onSearch("")
                }}
              >
                Clear all
              </Button>
              <Button
                onClick={() => {
                  setFiltersOpen(false)
                  controlsButtonRef.current?.focus()
                }}
              >
                Done
              </Button>
            </Group>
          </Stack>
        </DialogContent>
      </Dialog>
    </Stack>
  )
}

function formatRelativeUpdated(ts: string) {
  const d = new Date(ts)
  if (Number.isNaN(d.getTime())) return "Updated recently"
  const diffMs = Date.now() - d.getTime()
  const days = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)))
  if (days === 0) return "Updated today"
  if (days === 1) return "Updated 1 day ago"
  return `Updated ${days} days ago`
}

function SectionRow({
  section,
  published,
  draft,
  displayTitle,
  onToggleEnabled,
  onOpen,
  onDelete,
  onDuplicate,
  onDuplicateToAllPages,
  onRequestDetach,
  onMove,
  currentPageId,
  pages,
  pagesLoading,
  ensurePagesLoaded,
  duplicateLoading,
  sectionCount,
  defaults,
}: {
  section: SectionRow
  published: VersionSummary | null
  draft: VersionSummary | null
  displayTitle: string | null
  onToggleEnabled: (id: string, enabled: boolean) => void
  onOpen: (section: SectionRow) => void
  onDelete: (section: SectionRow) => void
  onDuplicate: (section: SectionRow, targetPageId: string) => Promise<void>
  onDuplicateToAllPages: (section: SectionRow) => Promise<void>
  onRequestDetach: (section: SectionRow) => void
  onMove: (sectionId: string, direction: "up" | "down") => Promise<void>
  currentPageId: string
  pages: CmsPageRow[]
  pagesLoading: boolean
  ensurePagesLoaded: () => Promise<CmsPageRow[]>
  duplicateLoading: boolean
  sectionCount: number
  defaults?: SectionTypeDefaultsMap
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: section.id })

  const [menuAnchorEl, setMenuAnchorEl] = useState<HTMLElement | null>(null)
  const [menuScreen, setMenuScreen] = useState<"root" | "dup_target" | "dup_pages">("root")
  const menuOpened = Boolean(menuAnchorEl)

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.7 : 1,
  }

  const otherPages = pages.filter((p) => p.id !== currentPageId)

  function closeMenu() {
    setMenuAnchorEl(null)
    setMenuScreen("root")
  }

  async function runDuplicate(targetPageId: string) {
    closeMenu()
    await onDuplicate(section, targetPageId)
  }

  return (
    <Paper
      ref={setNodeRef}
      withBorder
      radius="md"
      p="sm"
      onClick={() => onOpen(section)}
      onKeyDown={(e) => {
        if (!e.altKey) return
        if (e.key === "ArrowUp") {
          e.preventDefault()
          void onMove(section.id, "up")
        }
        if (e.key === "ArrowDown") {
          e.preventDefault()
          void onMove(section.id, "down")
        }
      }}
      tabIndex={0}
      className="cursor-pointer select-none"
      sx={{
        backgroundColor: "background.paper",
        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
      style={{
        ...style,
        minHeight: 92,
      }}
    >
      <Group justify="space-between" align="center" gap="sm" wrap="nowrap" style={{ minWidth: 0 }}>
        <Group align="start" gap="sm" style={{ minWidth: 0, flex: 1 }}>
          <Tooltip label="Drag to reorder">
            <div
              {...attributes}
              {...listeners}
              aria-label="Drag to reorder"
              className="mt-0.5 cursor-grab text-xs text-gray-400"
              onClick={(e) => e.stopPropagation()}
            >
              ⠿
            </div>
          </Tooltip>
          <Stack gap={4} style={{ minWidth: 0 }}>
            {(() => {
              const typeLabel = defaults?.[section.section_type]?.label ?? section.section_type
              const titleLine = displayTitle?.trim() ? displayTitle.trim() : typeLabel
              const showTypeLine = Boolean(displayTitle?.trim())

              return (
                <>
                  <Group gap="xs" wrap="nowrap" style={{ minWidth: 0 }}>
                    <Text size="sm" fw={600} lineClamp={1}>
                      {titleLine}
                    </Text>
                    {section.key ? (
                      <Text c="dimmed" size="xs">
                        #{section.key}
                      </Text>
                    ) : null}
                  </Group>
                  {showTypeLine ? (
                    <Group gap="xs" wrap="wrap">
                      <TypeBadge type={section.section_type} defaults={defaults} />
                      {section.global_section_id ? (
                        <Badge size="xs" variant="light" color="blue" leftSection={<IconLock size={12} />}>
                          Global
                        </Badge>
                      ) : null}
                    </Group>
                  ) : null}
                </>
              )
            })()}
            <Group gap="xs" wrap="wrap">
              <Badge size="xs" color={published ? "teal" : "gray"} variant="light">
                {published ? "Published" : "Unpublished"}
              </Badge>
              {draft ? (
                <Badge size="xs" color="yellow" variant="light">
                  Unpublished changes
                </Badge>
              ) : null}
              {!section.enabled ? (
                <Badge size="xs" color="gray" variant="light">
                  Hidden
                </Badge>
              ) : null}
              <Tooltip label={new Date(section.updated_at).toLocaleString()}>
                <Text c="dimmed" size="xs">{formatRelativeUpdated(section.updated_at)}</Text>
              </Tooltip>
            </Group>
            {section.global_section_id ? (
              <Text c="dimmed" size="xs" style={{ opacity: 0.8 }}>
                Managed globally — edit in Global sections or detach to fork locally.
              </Text>
            ) : null}
          </Stack>
        </Group>

        <Group
          gap="xs"
          wrap="nowrap"
          style={{ flexShrink: 0, alignSelf: "center" }}
          onPointerDown={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Tooltip label={section.enabled ? "Hide section" : "Show section"}>
            <Switch
              size="sm"
              checked={section.enabled}
              onChange={(e) => onToggleEnabled(section.id, e.currentTarget.checked)}
              aria-label={section.enabled ? "Hide section" : "Show section"}
            />
          </Tooltip>

          <Tooltip label="Section actions">
            <ActionIcon
              variant="default"
              aria-label="Section actions"
              onClick={(event) => {
                setMenuAnchorEl((current) => (current ? null : event.currentTarget))
                if (menuOpened) setMenuScreen("root")
              }}
            >
              <IconDotsVertical size={16} />
            </ActionIcon>
          </Tooltip>
          <MuiMenu
            anchorEl={menuAnchorEl}
            open={menuOpened}
            onClose={closeMenu}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={closeMenu}>
              <Text size="xs" fw={600} c="dimmed">
                Actions
              </Text>
            </MenuItem>
            <Divider />
            {menuScreen === "root" ? (
              <>
                {section.global_section_id ? (
                  <MenuItem
                    onClick={() => {
                      closeMenu()
                      onOpen(section)
                    }}
                  >
                    Edit global section
                  </MenuItem>
                ) : null}
                <MenuItem
                  disabled={duplicateLoading || section.position <= 0}
                  onClick={() => {
                    closeMenu()
                    void onMove(section.id, "up")
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <IconArrowUp size={14} />
                  </ListItemIcon>
                  Move up
                </MenuItem>
                <MenuItem
                  disabled={duplicateLoading || section.position >= sectionCount - 1}
                  onClick={() => {
                    closeMenu()
                    void onMove(section.id, "down")
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <IconArrowDown size={14} />
                  </ListItemIcon>
                  Move down
                </MenuItem>
                <MenuItem
                  disabled={duplicateLoading}
                  onClick={() => setMenuScreen("dup_target")}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <IconCopy size={14} />
                  </ListItemIcon>
                  Duplicate…
                </MenuItem>
                {section.global_section_id ? (
                  <MenuItem
                    onClick={() => {
                      closeMenu()
                      onRequestDetach(section)
                    }}
                  >
                    Detach & fork locally…
                  </MenuItem>
                ) : null}
                <MenuItem
                  onClick={() => {
                    closeMenu()
                    onDelete(section)
                  }}
                  sx={{ color: "error.main" }}
                >
                  <ListItemIcon sx={{ minWidth: 28, color: "error.main" }}>
                    <IconTrash size={14} />
                  </ListItemIcon>
                  Delete…
                </MenuItem>
              </>
            ) : null}

            {menuScreen === "dup_target" ? (
              <>
                <MenuItem onClick={() => setMenuScreen("root")}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <IconChevronLeft size={14} />
                  </ListItemIcon>
                  Back
                </MenuItem>
                <Typography
                  variant="caption"
                  sx={{ px: 2, py: 1, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}
                >
                  Duplicate to
                </Typography>
                <MenuItem
                  disabled={duplicateLoading}
                  onClick={() => void runDuplicate(currentPageId)}
                >
                  This page
                </MenuItem>
                <MenuItem
                  disabled={duplicateLoading}
                  onClick={() => {
                    setMenuScreen("dup_pages")
                    void ensurePagesLoaded()
                  }}
                >
                  Another page
                </MenuItem>
                <MenuItem
                  disabled={duplicateLoading}
                  onClick={() => {
                    closeMenu()
                    void onDuplicateToAllPages(section)
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <IconWorld size={14} />
                  </ListItemIcon>
                  Duplicate to all pages
                </MenuItem>
              </>
            ) : null}

            {menuScreen === "dup_pages" ? (
              <>
                <MenuItem onClick={() => setMenuScreen("dup_target")}>
                  <ListItemIcon sx={{ minWidth: 28 }}>
                    <IconChevronLeft size={14} />
                  </ListItemIcon>
                  Back
                </MenuItem>
                <Typography
                  variant="caption"
                  sx={{ px: 2, py: 1, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}
                >
                  Choose page
                </Typography>
                {pagesLoading ? (
                  <MenuItem disabled>
                    Loading…
                  </MenuItem>
                ) : otherPages.length ? (
                  <div style={{ maxHeight: 260, overflowY: "auto" }}>
                    {otherPages.map((p) => (
                      <MenuItem
                        key={p.id}
                        disabled={duplicateLoading}
                        onClick={() => void runDuplicate(p.id)}
                      >
                        {p.title} ({p.slug})
                      </MenuItem>
                    ))}
                  </div>
                ) : (
                  <MenuItem disabled>
                    No other pages
                  </MenuItem>
                )}
              </>
            ) : null}
          </MuiMenu>
        </Group>
      </Group>
    </Paper>
  )
}

export function PageEditor({ pageId }: { pageId: string }) {
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const normalizedPageId = (pageId ?? "").trim()
  const UUID_RE =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  const hasValidPageId = UUID_RE.test(normalizedPageId)

  const [page, setPage] = useState<CmsPageRow | null>(null)
  const [pageBgLibraryOpen, setPageBgLibraryOpen] = useState(false)
  const [pageSaving, setPageSaving] = useState(false)
  const [pageBgDraftUrl, setPageBgDraftUrl] = useState("")
  const [pageBgModeDraft, setPageBgModeDraft] = useState<"upload" | "url">("upload")
  const [backdropPanelOpen, setBackdropPanelOpen] = useState(true)
  const [pageBackdropScopeDraft, setPageBackdropScopeDraft] = useState<"hero-only" | "full-page">("hero-only")
  const [pageNavOpacityDraft, setPageNavOpacityDraft] = useState(0.18)
  const [pageBgImageOpacityDraft, setPageBgImageOpacityDraft] = useState(1)
  const [pagePanelOpacityDraft, setPagePanelOpacityDraft] = useState(1)
  const [sections, setSections] = useState<SectionRow[]>([])
  const [versions, setVersions] = useState<SectionVersionRow[]>([])
  const [globalVersions, setGlobalVersions] = useState<GlobalSectionVersionRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [typeDefaults, setTypeDefaults] = useState<SectionTypeDefaultsMap>({})
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [sectionSearch, setSectionSearch] = useState("")
  const [statusFilters, setStatusFilters] = useState<SectionFilterStatus[]>([])
  const [sourceFilters, setSourceFilters] = useState<SectionFilterSource[]>([])
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [sortMode, setSortMode] = useState<"manual" | "updated">("manual")

  const [addOpen, setAddOpen] = useState(false)
  const [newType, setNewType] = useState<CmsSectionType>("hero_cta")
  const [newKey, setNewKey] = useState("")
  const [addSource, setAddSource] = useState<"local" | "global">("local")
  const [globalSections, setGlobalSections] = useState<Array<{ id: string; key: string; section_type: CmsSectionType }>>([])
  const [customTypes, setCustomTypes] = useState<Array<{ key: string; label: string }>>([])
  const [selectedGlobalId, setSelectedGlobalId] = useState<string | null>(null)

  const [activeSection, setActiveSection] = useState<SectionRow | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<SectionRow | null>(null)
  const [detachTarget, setDetachTarget] = useState<SectionRow | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [duplicateLoadingId, setDuplicateLoadingId] = useState<string | null>(null)
  const [bulkAudit, setBulkAudit] = useState<DuplicateBulkAudit | null>(null)
  const [bulkAuditOpen, setBulkAuditOpen] = useState(false)
  const [applyBackdropConfirmOpen, setApplyBackdropConfirmOpen] = useState(false)
  const [applyBackdropLoading, setApplyBackdropLoading] = useState(false)
  const [backdropApplyAudit, setBackdropApplyAudit] = useState<BackdropApplyAudit | null>(null)
  const [backdropApplyAuditOpen, setBackdropApplyAuditOpen] = useState(false)

  const [allPages, setAllPages] = useState<CmsPageRow[]>([])
  const [allPagesLoading, setAllPagesLoading] = useState(false)
  const allPagesLoadedRef = useRef(false)
  const allPagesRef = useRef<CmsPageRow[]>([])
  const allPagesPromiseRef = useRef<Promise<CmsPageRow[]> | null>(null)

  function pushToast(message: string, tone: ToastItem["tone"] = "info") {
    const id = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    setToasts((prev) => [...prev, { id, message, tone }])
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3200)
  }

  const sectionTypeOptions = useMemo(
    () => [
      ...SECTION_TYPES.map((type) => ({ value: type, label: typeDefaults[type]?.label ?? type })),
      ...customTypes.map((type) => ({ value: type.key, label: `${type.label} (${type.key})` })),
    ],
    [customTypes, typeDefaults]
  )

  const getPublishedFor = useCallback((section: SectionRow): VersionSummary | null => {
    if (section.global_section_id) {
      const row =
        globalVersions.find(
          (v) => v.global_section_id === section.global_section_id && v.status === "published"
        ) ?? null
      return row ? { id: row.id, version: row.version, status: row.status, title: row.title } : null
    }

    const row = versions.find((v) => v.section_id === section.id && v.status === "published") ?? null
    return row ? { id: row.id, version: row.version, status: row.status, title: row.title } : null
  }, [globalVersions, versions])

  const getLatestDraftFor = useCallback((section: SectionRow): VersionSummary | null => {
    if (section.global_section_id) {
      const row =
        globalVersions
          .filter((v) => v.global_section_id === section.global_section_id && v.status === "draft")
          .sort((a, b) => b.version - a.version)[0] ?? null
      return row ? { id: row.id, version: row.version, status: row.status, title: row.title } : null
    }

    const row =
      versions
        .filter((v) => v.section_id === section.id && v.status === "draft")
        .sort((a, b) => b.version - a.version)[0] ?? null
    return row ? { id: row.id, version: row.version, status: row.status, title: row.title } : null
  }, [globalVersions, versions])

  const getDisplayTitle = useCallback((section: SectionRow): string | null => {
    const draftTitle = getLatestDraftFor(section)?.title?.trim() ?? ""
    if (draftTitle) return draftTitle
    const pubTitle = getPublishedFor(section)?.title?.trim() ?? ""
    return pubTitle || null
  }, [getLatestDraftFor, getPublishedFor])

  function openSection(section: SectionRow) {
    if (section.global_section_id) {
      router.push(`/admin/global-sections?edit=${section.global_section_id}`)
      return
    }
    setActiveSection(section)
  }

  const ensurePagesLoaded = useCallback(async (): Promise<CmsPageRow[]> => {
    if (allPagesLoadedRef.current) return allPagesRef.current
    if (allPagesPromiseRef.current) return allPagesPromiseRef.current

    setAllPagesLoading(true)
    const p = (async (): Promise<CmsPageRow[]> => {
      try {
        const { data, error } = await supabase
          .from("pages")
          .select("id, slug, title, formatting_override")
          .order("slug", { ascending: true })
        if (error) throw new Error(error.message)
        const pages = (data ?? []) as CmsPageRow[]
        allPagesRef.current = pages
        setAllPages(pages)
        allPagesLoadedRef.current = true
        return pages
      } finally {
        setAllPagesLoading(false)
        allPagesPromiseRef.current = null
      }
    })()

    allPagesPromiseRef.current = p
    return p
  }, [supabase])

  type BaseRow = {
    version: number
    status: "draft" | "published"
    title: string | null
    subtitle: string | null
    cta_primary_label: string | null
    cta_primary_href: string | null
    cta_secondary_label: string | null
    cta_secondary_href: string | null
    background_media_url: string | null
    formatting: Record<string, unknown>
    content: Record<string, unknown>
  }

  async function fetchSourceBase(sourceSectionId: string) {
    const { data: baseRows, error: baseErr } = await supabase
      .from("section_versions")
      .select(
        "version, status, title, subtitle, cta_primary_label, cta_primary_href, cta_secondary_label, cta_secondary_href, background_media_url, formatting, content"
      )
      .eq("section_id", sourceSectionId)
      .in("status", ["draft", "published"])
      .order("version", { ascending: false })

    if (baseErr) throw new Error(baseErr.message)

    const rows = (baseRows ?? []) as BaseRow[]
    const latestDraft = rows.filter((r) => r.status === "draft").sort((a, b) => b.version - a.version)[0] ?? null
    const publishedRow = rows.find((r) => r.status === "published") ?? null
    return latestDraft ?? publishedRow
  }

  async function duplicateSectionToPage(source: SectionRow, targetPageId: string) {
    const isBuiltin = BUILTIN_SECTION_TYPE_SET.has(source.section_type)
    const base = isBuiltin ? await fetchSourceBase(source.id) : null
    const defaults = typeDefaults[source.section_type]

    const { data: existingSections, error: existingErr } = await supabase
      .from("sections")
      .select("id, key, position")
      .eq("page_id", targetPageId)
      .order("position", { ascending: true })
    if (existingErr) throw new Error(existingErr.message)

    const typedExisting = (existingSections ?? []) as Array<{ id: string; key: string | null; position: number }>
    const insertAt = Math.min(source.position, typedExisting.length)

    if (typedExisting.length) {
      const moveRows = typedExisting.filter((row) => row.position >= insertAt)
      const updates = await Promise.all(
        moveRows.map((row) => supabase.from("sections").update({ position: row.position + 1 }).eq("id", row.id))
      )
      const firstError = updates.find((u) => u.error)?.error
      if (firstError) throw new Error(firstError.message)
    }

    let nextKey: string | null = source.key
    if (source.key) {
      const existing = new Set(typedExisting.map((r) => (r.key ?? "").trim()).filter(Boolean))
      const baseKey = source.key.trim()
      if (!existing.has(baseKey)) {
        nextKey = baseKey
      } else {
        let i = 1
        while (true) {
          const suffix = i === 1 ? "-copy" : `-copy-${i}`
          const candidate = `${baseKey}${suffix}`
          if (!existing.has(candidate)) {
            nextKey = candidate
            break
          }
          i += 1
        }
      }
    }

    const { data: newSectionData, error: insertSectionError } = await supabase
      .from("sections")
      .insert({
        page_id: targetPageId,
        section_type: source.section_type,
        key: nextKey,
        enabled: source.enabled,
        position: insertAt,
        global_section_id: source.global_section_id ?? null,
      })
      .select("id, page_id, section_type, key, enabled, position, updated_at, global_section_id")
      .single()

    if (insertSectionError) throw new Error(insertSectionError.message)

    const newSection = newSectionData as SectionRow

    // Global-linked sections must stay single-source-of-truth and should not create local version rows.
    if (source.global_section_id || !isBuiltin) {
      return { newSection, base: null }
    }

    const versionInsert = base
      ? {
          section_id: newSection.id,
          version: 1,
          status: "draft" as const,
          title: base.title,
          subtitle: base.subtitle,
          cta_primary_label: base.cta_primary_label,
          cta_primary_href: base.cta_primary_href,
          cta_secondary_label: base.cta_secondary_label,
          cta_secondary_href: base.cta_secondary_href,
          background_media_url: base.background_media_url,
          formatting: base.formatting ?? { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left" },
          content: base.content ?? {},
        }
      : {
          section_id: newSection.id,
          version: 1,
          status: "draft" as const,
          title: defaults?.default_title ?? null,
          subtitle: defaults?.default_subtitle ?? null,
          cta_primary_label: defaults?.default_cta_primary_label ?? null,
          cta_primary_href: defaults?.default_cta_primary_href ?? null,
          cta_secondary_label: defaults?.default_cta_secondary_label ?? null,
          cta_secondary_href: defaults?.default_cta_secondary_href ?? null,
          background_media_url: defaults?.default_background_media_url ?? null,
          formatting: defaults?.default_formatting ?? { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left" },
          content: defaults?.default_content ?? {},
        }

    const { error: versionErr } = await supabase.from("section_versions").insert(versionInsert)
    if (versionErr) throw new Error(versionErr.message)

    return { newSection, base }
  }

  async function duplicateSection(source: SectionRow, targetPageId: string) {
    if (!hasValidPageId) {
      setError("Missing or invalid page identifier.")
      return
    }

    setError(null)
    setDuplicateLoadingId(source.id)
    try {
      await duplicateSectionToPage(source, targetPageId)
      pushToast("Section duplicated", "success")
      if (targetPageId === normalizedPageId) await load()
    } catch (e) {
      applyEditorError({
        error: e,
        fallback: "Failed to duplicate section.",
        setError,
        pushToast,
      })
    } finally {
      setDuplicateLoadingId(null)
    }
  }

  async function duplicateSectionToAllPages(source: SectionRow) {
    if (!hasValidPageId) {
      setError("Missing or invalid page identifier.")
      return
    }

    setError(null)
    setDuplicateLoadingId(source.id)
    try {
      const endpoints = ["/api/content/sections/duplicate-all", "/admin/api/content/sections/duplicate-all"]
      const requestBody = JSON.stringify({
        sourceSectionId: source.id,
        sourcePageId: normalizedPageId,
        sourcePosition: source.position,
      })

      let payload: { ok?: boolean; error?: string; audit?: DuplicateBulkAudit } | null = null
      let lastError = "Failed to duplicate section to all pages."

      for (const endpoint of endpoints) {
        const response = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: requestBody,
        })

        const parsed = (await response.json().catch(() => ({}))) as {
          ok?: boolean
          error?: string
          audit?: DuplicateBulkAudit
        }

        if (response.ok && parsed?.ok && parsed.audit) {
          payload = parsed
          break
        }

        if (parsed?.error) lastError = parsed.error
      }

      if (!payload?.audit) {
        throw new Error(lastError)
      }

      console.info("[CMS] bulk-section-duplicate-audit", payload.audit)
      setBulkAudit(payload.audit)
      setBulkAuditOpen(true)
      pushToast(`Bulk duplicate complete: ${payload.audit.insertedCount} inserted`, payload.audit.failedCount ? "info" : "success")

      if (payload.audit.insertedCount > 0) {
        await load()
      }
    } catch (e) {
      applyEditorError({
        error: e,
        fallback: "Failed to duplicate section to all pages.",
        setError,
        pushToast,
      })
    } finally {
      setDuplicateLoadingId(null)
    }
  }

  async function load() {
    if (!hasValidPageId) {
      setError("Missing or invalid page identifier.")
      setLoading(false)
      return
    }
    const targetPageId = normalizedPageId

    setLoading(true)
    setError(null)
    try {
      const [
        { data: pageData, error: pageError },
        { data: sectionData, error: sectionError },
        { data: defaultsData, error: defaultsError },
        { data: globalData, error: globalError },
        { data: customTypeData, error: customTypeError },
      ] = await Promise.all([
        supabase.from("pages").select("id, slug, title, bg_image_url, formatting_override").eq("id", targetPageId).single(),
        supabase
          .from("sections")
          .select("id, page_id, section_type, key, enabled, position, updated_at, global_section_id")
          .eq("page_id", targetPageId)
          .order("position", { ascending: true }),
        supabase
          .from("section_type_defaults")
          .select(
            "section_type, label, description, default_title, default_subtitle, default_cta_primary_label, default_cta_primary_href, default_cta_secondary_label, default_cta_secondary_href, default_background_media_url, default_formatting, default_content, capabilities"
          ),
        supabase.from("global_sections").select("id, key, section_type").eq("enabled", true).order("key", { ascending: true }),
        supabase
          .from("section_type_registry")
          .select("key,label,source,renderer,is_active")
          .eq("source", "custom")
          .eq("renderer", "composed")
          .eq("is_active", true)
          .order("label", { ascending: true }),
      ])

      if (pageError) {
        setError(pageError.message)
        return
      }
      if (sectionError) {
        setError(sectionError.message)
        return
      }
      if (defaultsError) {
        setError(defaultsError.message)
        return
      }
      if (globalError) {
        setError(globalError.message)
        return
      }
      if (customTypeError) {
        setError(customTypeError.message)
        return
      }

      setPage(pageData)

      const defaultsRows = (defaultsData ?? []) as SectionTypeDefault[]
      const defaultsMap = defaultsRows.reduce((acc, row) => {
        const normalized = normalizeSectionType(String(row.section_type))
        if (!normalized) return acc
        acc[normalized] = { ...row, section_type: normalized }
        return acc
      }, {} as SectionTypeDefaultsMap)
      setTypeDefaults(defaultsMap)
      setGlobalSections(
        ((globalData ?? []) as Array<{ id: string; key: string; section_type: string }>)
          .map((g) => {
            const normalized = normalizeSectionType(g.section_type)
            return normalized ? { ...g, section_type: normalized } : null
          })
          .filter(Boolean) as Array<{ id: string; key: string; section_type: CmsSectionType }>
      )

      setCustomTypes(
        ((customTypeData ?? []) as Array<{ key: string; label: string }>).map((row) => ({
          key: row.key,
          label: row.label,
        }))
      )

      const typedSections = (sectionData ?? [])
        .map((s) => {
          const normalized = normalizeSectionType(String(s.section_type))
          if (!normalized) return null
          return { ...(s as SectionRow), section_type: normalized }
        })
        .filter(Boolean) as SectionRow[]
      setSections(typedSections)

      const ids = typedSections.map((s) => s.id)
      const globalIds = Array.from(new Set(typedSections.map((s) => s.global_section_id).filter(Boolean) as string[]))

      const [{ data: versionData, error: versionError }, { data: globalVersionData, error: globalVersionError }] =
        await Promise.all([
          ids.length
            ? supabase
                .from("section_versions")
                .select("id, section_id, version, status, title, created_at, published_at")
                .in("section_id", ids)
                .order("version", { ascending: false })
            : Promise.resolve({ data: [], error: null }),
          globalIds.length
            ? supabase
                .from("global_section_versions")
                .select("id, global_section_id, version, status, title, created_at, published_at")
                .in("global_section_id", globalIds)
                .order("version", { ascending: false })
            : Promise.resolve({ data: [], error: null }),
        ])

      if (versionError) {
        setError(versionError.message)
        return
      }

      if (globalVersionError) {
        setError(globalVersionError.message)
        return
      }

      setVersions((versionData ?? []) as SectionVersionRow[])
      setGlobalVersions((globalVersionData ?? []) as GlobalSectionVersionRow[])
    } finally {
      setLoading(false)
    }
  }

  async function updatePageSettings(patch: Partial<Pick<CmsPageRow, "bg_image_url" | "formatting_override">>) {
    if (!page || !hasValidPageId) return
    setPageSaving(true)
    setError(null)
    try {
      const { data, error } = await supabase
        .from("pages")
        .update(patch)
        .eq("id", normalizedPageId)
        .select("id, slug, title, bg_image_url, formatting_override")
        .single()
      if (error) throw new Error(error.message)
      setPage(data as CmsPageRow)
      pushToast("Page settings saved", "success")
    } catch (e) {
      applyEditorError({
        error: e,
        fallback: "Failed to update page settings.",
        setError,
        pushToast,
      })
    } finally {
      setPageSaving(false)
    }
  }

  async function onUploadPageBackground(file: File) {
    const { publicUrl } = await uploadToCmsMedia(file, supabase)
    setPageBgDraftUrl(publicUrl)
  }

  async function onSelectPageBackgroundFromLibrary(item: MediaItem) {
    setPageBgDraftUrl(item.url)
    setPageBgModeDraft("upload")
  }

  function onChangeBackdropImageMode(next: "upload" | "url") {
    setPageBgModeDraft(next)
    setPageBgDraftUrl("")
  }

  async function onSavePageBackdropSettings() {
    const current = asRecord(page?.formatting_override)
    await updatePageSettings({
      bg_image_url: pageBgDraftUrl.trim() || null,
      formatting_override: {
        ...current,
        topBackdropScope: pageBackdropScopeDraft,
        topNavOverlayOpacity: Math.min(0.6, Math.max(0, pageNavOpacityDraft)),
        topBackdropImageOpacity: Math.min(1, Math.max(0, pageBgImageOpacityDraft)),
        pagePanelOpacity: Math.min(1, Math.max(0, pagePanelOpacityDraft)),
      },
    })
  }

  function onDiscardPageBackdropSettings() {
    setPageBgDraftUrl((page?.bg_image_url ?? "").trim())
    setPageBgModeDraft("upload")
    setPageBackdropScopeDraft(pageBackdropScopeSaved)
    setPageNavOpacityDraft(pageNavOpacitySaved)
    setPageBgImageOpacityDraft(pageBgImageOpacitySaved)
    setPagePanelOpacityDraft(pagePanelOpacitySaved)
    pushToast("Backdrop changes discarded", "info")
  }

  async function onApplyBackdropToAllPages() {
    setApplyBackdropConfirmOpen(false)
    setApplyBackdropLoading(true)
    setError(null)

    try {
      const pages = await ensurePagesLoaded()
      const results: BackdropApplyRow[] = []

      for (const p of pages) {
        const currentFmt = asRecord(p.formatting_override)
        const nextFmt = {
          ...currentFmt,
          topBackdropScope: pageBackdropScopeDraft,
          topNavOverlayOpacity: Math.min(0.6, Math.max(0, pageNavOpacityDraft)),
          topBackdropImageOpacity: Math.min(1, Math.max(0, pageBgImageOpacityDraft)),
          pagePanelOpacity: Math.min(1, Math.max(0, pagePanelOpacityDraft)),
        }

        const { error: updateErr } = await supabase
          .from("pages")
          .update({
            bg_image_url: pageBgDraftUrl.trim() || null,
            formatting_override: nextFmt,
          })
          .eq("id", p.id)

        if (updateErr) {
          results.push({
            pageId: p.id,
            pageSlug: p.slug,
            pageTitle: p.title,
            outcome: "failed",
            message: updateErr.message,
          })
        } else {
          results.push({
            pageId: p.id,
            pageSlug: p.slug,
            pageTitle: p.title,
            outcome: "updated",
            message: "Backdrop settings applied",
          })
        }
      }

      const updatedCount = results.filter((r) => r.outcome === "updated").length
      const failedCount = results.filter((r) => r.outcome === "failed").length

      setBackdropApplyAudit({ updatedCount, failedCount, results })
      setBackdropApplyAuditOpen(true)
      pushToast(`Applied to ${updatedCount} page${updatedCount === 1 ? "" : "s"}`, failedCount ? "info" : "success")
      await load()
    } catch (e) {
      applyEditorError({
        error: e,
        fallback: "Failed to apply page backdrop settings to all pages.",
        setError,
        pushToast,
      })
    } finally {
      setApplyBackdropLoading(false)
    }
  }

  async function detachGlobalSection(source: SectionRow) {
    setError(null)
    try {
      const { error } = await supabase.rpc("detach_global_section_to_local", {
        p_section_id: source.id,
      })
      if (error) throw new Error(error.message)
      await load()
      pushToast("Section detached and forked locally", "success")
    } catch (e) {
      applyEditorError({
        error: e,
        fallback: "Failed to detach global section.",
        setError,
        pushToast,
      })
    }
  }

  async function onConfirmDelete() {
    if (!deleteTarget) return
    const id = deleteTarget.id
    setDeleteLoading(true)
    setError(null)
    try {
      const { error: delError } = await supabase.from("sections").delete().eq("id", id)
      if (delError) throw new Error(delError.message)

      // Close drawer if it was open for this section.
      if (activeSection?.id === id) setActiveSection(null)

      // Remove locally first; then renumber positions to keep them contiguous.
      const remaining = sections.filter((s) => s.id !== id)
      const renumbered = remaining.map((s, idx) => ({ ...s, position: idx }))
      setSections(renumbered)
      setVersions((v) => v.filter((row) => row.section_id !== id))

      await persistPositions(renumbered)
      setDeleteTarget(null)
      pushToast("Section deleted", "success")
    } catch (e) {
      applyEditorError({
        error: e,
        fallback: "Failed to delete section.",
        setError,
        pushToast,
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  async function onToggleEnabled(id: string, enabled: boolean) {
    setError(null)
    const prev = sections
    setSections((s) => s.map((row) => (row.id === id ? { ...row, enabled } : row)))
    const { error: updateError } = await supabase
      .from("sections")
      .update({ enabled })
      .eq("id", id)
    if (updateError) {
      applyEditorError({
        error: updateError,
        fallback: "Failed to update section visibility.",
        setError,
        pushToast,
      })
      setSections(prev)
      return
    }
    pushToast(enabled ? "Section shown" : "Section hidden", "success")
  }

  async function persistPositions(next: SectionRow[]) {
    const results = await Promise.all(
      next.map((s, idx) => supabase.from("sections").update({ position: idx }).eq("id", s.id))
    )

    const firstError = results.find((r) => r.error)?.error
    if (firstError) {
      applyEditorError({
        error: firstError,
        fallback: "Failed to save section order.",
        setError,
        pushToast,
      })
      // Re-sync to avoid UI showing an order that didn't persist.
      await load()
      return false
    }

    pushToast("Section order saved", "success")
    return true
  }

  async function moveSectionByButton(sectionId: string, direction: "up" | "down") {
    const fromIndex = sections.findIndex((s) => s.id === sectionId)
    if (fromIndex < 0) return

    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1
    if (toIndex < 0 || toIndex >= sections.length) return

    const next = arrayMove(sections, fromIndex, toIndex).map((s, idx) => ({
      ...s,
      position: idx,
    }))
    setSections(next)
    await persistPositions(next)
  }

  async function onDragEnd(event: DragEndEvent) {
    const { active, over } = event
    const activeId = String(active.id)
    const overId = over ? String(over.id) : null
    if (!overId || activeId === overId) return

    const oldIndex = sections.findIndex((s) => s.id === activeId)
    const newIndex = sections.findIndex((s) => s.id === overId)
    if (oldIndex < 0 || newIndex < 0) return

    const next = arrayMove(sections, oldIndex, newIndex).map((s, idx) => ({
      ...s,
      position: idx,
    }))
    setSections(next)
    await persistPositions(next)
  }

  async function onAddSection() {
    setError(null)
    const key = newKey.trim() || null
    const position = sections.length
    if (!hasValidPageId) {
      setError("Cannot add sections without a valid page.")
      return
    }

    const globalSelected = addSource === "global" ? globalSections.find((g) => g.id === selectedGlobalId) ?? null : null
    const sectionType = globalSelected?.section_type ?? newType

    const { data, error: insertError } = await supabase
      .from("sections")
      .insert({
        page_id: normalizedPageId,
        section_type: sectionType,
        key,
        enabled: true,
        position,
        global_section_id: globalSelected?.id ?? null,
      })
      .select("id, page_id, section_type, key, enabled, position, updated_at, global_section_id")
      .single()

    if (insertError) {
      applyEditorError({
        error: insertError,
        fallback: "Failed to add section.",
        setError,
        pushToast,
      })
      return
    }

    const section = data as SectionRow
    const defaults = typeDefaults[sectionType]

    if (!globalSelected) {
      const { error: versionError } = await supabase.from("section_versions").insert({
        section_id: section.id,
        version: 1,
        status: "draft",
        title: defaults?.default_title ?? null,
        subtitle: defaults?.default_subtitle ?? null,
        cta_primary_label: defaults?.default_cta_primary_label ?? null,
        cta_primary_href: defaults?.default_cta_primary_href ?? null,
        cta_secondary_label: defaults?.default_cta_secondary_label ?? null,
        cta_secondary_href: defaults?.default_cta_secondary_href ?? null,
        background_media_url: defaults?.default_background_media_url ?? null,
        formatting: defaults?.default_formatting ?? { maxWidth: "max-w-5xl", paddingY: "py-6", textAlign: "left" },
        content: defaults?.default_content ?? {},
      })
      if (versionError) {
        applyEditorError({
          error: versionError,
          fallback: "Failed to create initial section draft.",
          setError,
          pushToast,
        })
      }
    }

    setAddOpen(false)
    setNewKey("")
    setSelectedGlobalId(null)
    await load()
  }

  useEffect(() => {
    if (process.env.NODE_ENV === "development") {
      // Helps diagnose bad links like /pages/undefined.
      console.debug("[PageEditor] pageId:", pageId, "normalized:", normalizedPageId)
    }
    try {
      const stored = window.localStorage.getItem("page-editor:backdrop-panel-open")
      if (stored === "0") setBackdropPanelOpen(false)
    } catch {
      // no-op
    }
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [normalizedPageId])

  useEffect(() => {
    try {
      window.localStorage.setItem("page-editor:backdrop-panel-open", backdropPanelOpen ? "1" : "0")
    } catch {
      // no-op
    }
  }, [backdropPanelOpen])

  useEffect(() => {
    if (!page) return
    const fmt = asRecord(page.formatting_override)
    const savedScope = asString(fmt.topBackdropScope) === "full-page" ? "full-page" : "hero-only"
    const savedOpacityRaw = Number(fmt.topNavOverlayOpacity)
    const savedOpacity = Number.isFinite(savedOpacityRaw) ? Math.min(0.6, Math.max(0, savedOpacityRaw)) : 0.18
    const savedBgImageOpacityRaw = Number(fmt.topBackdropImageOpacity)
    const savedBgImageOpacity = Number.isFinite(savedBgImageOpacityRaw) ? Math.min(1, Math.max(0, savedBgImageOpacityRaw)) : 1
    const savedPanelOpacityRaw = Number(fmt.pagePanelOpacity)
    const savedPanelOpacity = Number.isFinite(savedPanelOpacityRaw) ? Math.min(1, Math.max(0, savedPanelOpacityRaw)) : 1
    const nextUrl = (page.bg_image_url ?? "").trim()
    setPageBgDraftUrl(nextUrl)
    setPageBgModeDraft("upload")
    setPageBackdropScopeDraft(savedScope)
    setPageNavOpacityDraft(savedOpacity)
    setPageBgImageOpacityDraft(savedBgImageOpacity)
    setPagePanelOpacityDraft(savedPanelOpacity)
  }, [page])

  const pageFormatting = asRecord(page?.formatting_override)
  const pageBackdropScopeSaved = asString(pageFormatting.topBackdropScope) === "full-page" ? "full-page" : "hero-only"
  const pageNavOpacitySavedRaw = Number(pageFormatting.topNavOverlayOpacity)
  const pageNavOpacitySaved = Number.isFinite(pageNavOpacitySavedRaw)
    ? Math.min(0.6, Math.max(0, pageNavOpacitySavedRaw))
    : 0.18
  const pageBgImageOpacitySavedRaw = Number(pageFormatting.topBackdropImageOpacity)
  const pageBgImageOpacitySaved = Number.isFinite(pageBgImageOpacitySavedRaw)
    ? Math.min(1, Math.max(0, pageBgImageOpacitySavedRaw))
    : 1
  const pagePanelOpacitySavedRaw = Number(pageFormatting.pagePanelOpacity)
  const pagePanelOpacitySaved = Number.isFinite(pagePanelOpacitySavedRaw)
    ? Math.min(1, Math.max(0, pagePanelOpacitySavedRaw))
    : 1

  const pageSettingsDirty = useMemo(() => {
    const savedUrl = (page?.bg_image_url ?? "").trim()
    const draftUrl = pageBgDraftUrl.trim()
    return (
      savedUrl !== draftUrl ||
      pageBackdropScopeSaved !== pageBackdropScopeDraft ||
      Math.abs(pageNavOpacitySaved - pageNavOpacityDraft) > 0.0001 ||
      Math.abs(pageBgImageOpacitySaved - pageBgImageOpacityDraft) > 0.0001 ||
      Math.abs(pagePanelOpacitySaved - pagePanelOpacityDraft) > 0.0001
    )
  }, [
    page?.bg_image_url,
    pageBackdropScopeSaved,
    pageNavOpacitySaved,
    pageBgImageOpacitySaved,
    pagePanelOpacitySaved,
    pageBgDraftUrl,
    pageBackdropScopeDraft,
    pageNavOpacityDraft,
    pageBgImageOpacityDraft,
    pagePanelOpacityDraft,
  ])

  useEffect(() => {
    if (!pageSettingsDirty) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [pageSettingsDirty])

  const filteredSections = useMemo(() => {
    const query = sectionSearch.trim().toLowerCase()
    const sourceFilterSet = new Set(sourceFilters)
    const statusFilterSet = new Set(statusFilters)

    const withSearch = sections.filter((s) => {
      if (typeFilter && s.section_type !== typeFilter) return false

      const title = (getDisplayTitle(s) ?? "").toLowerCase()
      const key = (s.key ?? "").toLowerCase()
      const typeLabel = (typeDefaults[s.section_type]?.label ?? s.section_type).toLowerCase()

      if (query && !title.includes(query) && !key.includes(query) && !typeLabel.includes(query)) {
        return false
      }

      if (sourceFilterSet.size) {
        const source: SectionFilterSource = s.global_section_id ? "global" : "local"
        if (!sourceFilterSet.has(source)) return false
      }

      if (statusFilterSet.size) {
        const published = Boolean(getPublishedFor(s))
        const hasDraft = Boolean(getLatestDraftFor(s))
        const isHidden = !s.enabled
        const matches = [
          published && statusFilterSet.has("published"),
          hasDraft && statusFilterSet.has("draft"),
          isHidden && statusFilterSet.has("hidden"),
        ].some(Boolean)
        if (!matches) return false
      }

      return true
    })

    if (sortMode === "updated") {
      return withSearch.slice().sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
    }

    return withSearch.slice().sort((a, b) => a.position - b.position)
  }, [
    sections,
    sectionSearch,
    sourceFilters,
    statusFilters,
    typeFilter,
    sortMode,
    typeDefaults,
    getDisplayTitle,
    getPublishedFor,
    getLatestDraftFor,
  ])

  const canManualReorder =
    sortMode === "manual" &&
    !sectionSearch.trim() &&
    !statusFilters.length &&
    !sourceFilters.length &&
    !typeFilter

  return (
    <Stack gap="md">
      <PageEditorHeader page={page} />

      {error ? (
        <Paper withBorder p="sm" radius="md">
          <Text c="red" size="sm">
            {error}
          </Text>
        </Paper>
      ) : null}

      <Paper withBorder p="md" radius="md">
        <Stack gap="sm">
          <Group justify="space-between" align="center" wrap="wrap" gap="xs">
            <Group gap="xs">
              <Text fw={600} size="sm">Page backdrop</Text>
              <ActionIcon
                variant="subtle"
                aria-label={backdropPanelOpen ? "Collapse backdrop panel" : "Expand backdrop panel"}
                onClick={() => setBackdropPanelOpen((v) => !v)}
              >
                {backdropPanelOpen ? <IconChevronUp size={16} /> : <IconChevronDown size={16} />}
              </ActionIcon>
            </Group>
            {pageSettingsDirty ? <Badge color="yellow" variant="light">Unsaved changes</Badge> : null}
          </Group>

          {pageSettingsDirty ? (
            <Paper withBorder p="xs" radius="sm" style={{ position: "sticky", top: 0, zIndex: 5 }}>
              <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                <Text size="xs" c="dimmed">You have unsaved backdrop changes</Text>
                <Group gap="xs">
                  <Button
                    variant="default"
                    disabled={pageSaving || applyBackdropLoading || !pageSettingsDirty}
                    onClick={onDiscardPageBackdropSettings}
                  >
                    Discard
                  </Button>
                  <Button
                    loading={pageSaving}
                    disabled={!page || applyBackdropLoading || !pageSettingsDirty}
                    onClick={() => void onSavePageBackdropSettings()}
                  >
                    Save changes
                  </Button>
                  <Button
                    color="yellow"
                    variant="light"
                    leftSection={<IconAlertTriangle size={14} />}
                    loading={applyBackdropLoading}
                    disabled={!page || pageSaving}
                    onClick={() => setApplyBackdropConfirmOpen(true)}
                  >
                    Apply to all pages…
                  </Button>
                </Group>
              </Group>
            </Paper>
          ) : null}

          <Collapse in={backdropPanelOpen}>
            <Stack gap="sm">
              <SegmentedControl
                value={pageBgModeDraft}
                onChange={(v) => onChangeBackdropImageMode(v === "url" ? "url" : "upload")}
                data={[{ label: "Upload", value: "upload" }, { label: "URL", value: "url" }]}
                aria-label="Image input mode"
              />

              {pageBgModeDraft === "upload" ? (
                <ImageFieldPicker
                  title="Page background image (optional)"
                  value={pageBgDraftUrl}
                  urlLabel="Selected URL"
                  withinPortal={false}
                  disabled={pageSaving || !page}
                  onChange={(url) => setPageBgDraftUrl(url)}
                  onRemove={() => setPageBgDraftUrl("")}
                  onUploadFile={onUploadPageBackground}
                  onChooseFromLibrary={() => setPageBgLibraryOpen(true)}
                  onError={setError}
                />
              ) : (
                <TextInput
                  label="Background image URL"
                  value={pageBgDraftUrl}
                  placeholder="https://..."
                  onChange={(e) => setPageBgDraftUrl(e.currentTarget.value)}
                  disabled={pageSaving || !page}
                />
              )}

              <Text size="xs" c="dimmed">
                Active mode controls precedence. Switching mode clears current image value immediately.
              </Text>

              <Select
                label="Backdrop scope"
                value={pageBackdropScopeDraft}
                onChange={(v) => setPageBackdropScopeDraft(v === "full-page" ? "full-page" : "hero-only")}
                data={[
                  { value: "hero-only", label: "Hero + nav only" },
                  { value: "full-page", label: "Full page" },
                ]}
                disabled={pageSaving || !page}
              />

              <LabeledSlider
                label="Nav overlay opacity"
                description="Controls the darkening overlay behind the top navigation over the backdrop image."
                min={0}
                max={0.6}
                step={0.02}
                value={pageNavOpacityDraft}
                defaultValue={0.18}
                disabled={pageSaving || !page}
                onChange={setPageNavOpacityDraft}
              />

              <LabeledSlider
                label="Background image opacity"
                description="Controls visibility strength of the page backdrop image."
                min={0}
                max={1}
                step={0.01}
                value={pageBgImageOpacityDraft}
                defaultValue={1}
                disabled={pageSaving || !page}
                onChange={setPageBgImageOpacityDraft}
              />

              <LabeledSlider
                label="Panel/card surface opacity"
                description="Controls how translucent card surfaces appear on top of the backdrop."
                min={0}
                max={1}
                step={0.01}
                value={pagePanelOpacityDraft}
                defaultValue={1}
                disabled={pageSaving || !page}
                onChange={setPagePanelOpacityDraft}
              />

              <Group justify="end" mt="xs">
                <Button
                  variant="default"
                  disabled={pageSaving || applyBackdropLoading || !pageSettingsDirty}
                  onClick={onDiscardPageBackdropSettings}
                >
                  Discard
                </Button>
                <Button
                  loading={pageSaving}
                  disabled={!page || applyBackdropLoading || !pageSettingsDirty}
                  onClick={() => void onSavePageBackdropSettings()}
                >
                  Save changes
                </Button>
                <Button
                  color="yellow"
                  variant="light"
                  leftSection={<IconAlertTriangle size={14} />}
                  loading={applyBackdropLoading}
                  disabled={!page || pageSaving}
                  onClick={() => setApplyBackdropConfirmOpen(true)}
                >
                  Apply to all pages…
                </Button>
              </Group>
            </Stack>
          </Collapse>
        </Stack>
      </Paper>

      <Paper withBorder p="md" radius="md">
        <Group justify="space-between" mb="sm" wrap="wrap" gap="xs">
          <Group gap="sm">
            <Text fw={600} size="sm">
              Sections
            </Text>
            <Badge variant="default">{sections.length}</Badge>
          </Group>
        </Group>

        <SectionsToolbar
          search={sectionSearch}
          onSearch={setSectionSearch}
          statusFilters={statusFilters}
          onStatusFilters={setStatusFilters}
          sourceFilters={sourceFilters}
          onSourceFilters={setSourceFilters}
          typeFilter={typeFilter}
          onTypeFilter={setTypeFilter}
          sortMode={sortMode}
          onSortMode={setSortMode}
          types={sectionTypeOptions}
          onAddSection={() => setAddOpen(true)}
        />

        {!canManualReorder ? (
          <Text size="xs" c="dimmed" mb="xs">
            Drag reorder is available in Manual order with no active search/filters. Keyboard: Alt+↑ / Alt+↓ on a focused row.
          </Text>
        ) : null}

        {loading ? (
          <Text c="dimmed" size="sm">
            Loading…
          </Text>
        ) : filteredSections.length ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => {
              if (!canManualReorder) return
              void onDragEnd(event)
            }}
          >
            <SortableContext items={filteredSections.map((s) => s.id)} strategy={verticalListSortingStrategy}>
              <Stack gap="xs">
                {filteredSections.map((s) => (
                  <SectionRow
                    key={s.id}
                    section={s}
                    published={getPublishedFor(s)}
                    draft={getLatestDraftFor(s)}
                    displayTitle={getDisplayTitle(s)}
                    onToggleEnabled={onToggleEnabled}
                    onOpen={openSection}
                    onDelete={setDeleteTarget}
                    onDuplicate={duplicateSection}
                    onDuplicateToAllPages={duplicateSectionToAllPages}
                    onRequestDetach={setDetachTarget}
                    onMove={moveSectionByButton}
                    currentPageId={normalizedPageId}
                    pages={allPages}
                    pagesLoading={allPagesLoading}
                    ensurePagesLoaded={ensurePagesLoaded}
                    duplicateLoading={duplicateLoadingId === s.id}
                    sectionCount={sections.length}
                    defaults={typeDefaults}
                  />
                ))}
              </Stack>
            </SortableContext>
          </DndContext>
        ) : (
          <Text c="dimmed" size="sm">
            No sections match current filters.
          </Text>
        )}
      </Paper>

      <Modal opened={addOpen} onClose={() => setAddOpen(false)} title="Add section" centered>
        <Stack gap="sm">
          <Select
            label="Source"
            value={addSource}
            onChange={(v) => setAddSource((v as "local" | "global") ?? "local")}
            data={[{ value: "local", label: "Page-specific section" }, { value: "global", label: "Global reusable section" }]}
          />
          {addSource === "global" ? (
            <Select
              label="Global section"
              value={selectedGlobalId}
              onChange={setSelectedGlobalId}
              data={globalSections.map((g) => ({ value: g.id, label: `${g.key} (${typeDefaults[g.section_type]?.label ?? g.section_type})` }))}
            />
          ) : (
            <Select
              label="Section type"
              value={newType}
              onChange={(v) => setNewType((v as CmsSectionType) ?? "hero_cta")}
              data={sectionTypeOptions}
            />
          )}
          <TextInput
            label="Key (optional, used for anchors like #faq)"
            placeholder="faq"
            value={newKey}
            onChange={(e) => setNewKey(e.currentTarget.value)}
          />
          <Group justify="end">
            <Button variant="default" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={onAddSection}>Create</Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={Boolean(deleteTarget)}
        onClose={() => (deleteLoading ? null : setDeleteTarget(null))}
        title="Delete section?"
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            This permanently deletes the section and all of its versions.
          </Text>
          {deleteTarget ? (
            <Paper withBorder p="sm" radius="md">
              <Stack gap={4}>
                <Group gap="xs">
                  <Badge variant="default">
                    {typeDefaults[deleteTarget.section_type]?.label ?? deleteTarget.section_type}
                  </Badge>
                  {deleteTarget.key ? (
                    <Text c="dimmed" size="xs">
                      #{deleteTarget.key}
                    </Text>
                  ) : null}
                </Group>
                {getDisplayTitle(deleteTarget) ? (
                  <Text size="sm" fw={500} lineClamp={2}>
                    {getDisplayTitle(deleteTarget)}
                  </Text>
                ) : null}
              </Stack>
            </Paper>
          ) : null}
          <Group justify="end">
            <Button
              variant="default"
              onClick={() => setDeleteTarget(null)}
              disabled={deleteLoading}
            >
              Cancel
            </Button>
            <Button color="red" onClick={onConfirmDelete} loading={deleteLoading}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      <ConfirmModal
        opened={Boolean(detachTarget)}
        onClose={() => setDetachTarget(null)}
        title="Detach global section?"
        description="This creates a local fork for this page. Future global edits will no longer sync to this section."
        confirmLabel="Detach & fork locally"
        confirmColor="yellow"
        onConfirm={() => {
          if (!detachTarget) return
          void detachGlobalSection(detachTarget)
          setDetachTarget(null)
        }}
      />

      <Modal
        opened={bulkAuditOpen}
        onClose={() => setBulkAuditOpen(false)}
        title="Duplicate to all pages audit"
        centered
        size="lg"
      >
        {bulkAudit ? (
          <Stack gap="sm">
            <Text size="sm" c="dimmed">
              Rule: {bulkAudit.duplicateRule}
            </Text>
            <Group gap="xs">
              <Badge color="teal" variant="light">Inserted {bulkAudit.insertedCount}</Badge>
              <Badge color="yellow" variant="light">Skipped {bulkAudit.skippedCount}</Badge>
              <Badge color="red" variant="light">Failed {bulkAudit.failedCount}</Badge>
            </Group>
            {bulkAudit.noOpMessage ? (
              <Text size="sm" c="yellow">
                {bulkAudit.noOpMessage}
              </Text>
            ) : null}
            <Paper withBorder radius="md" p="sm">
              <Stack gap={6}>
                {bulkAudit.results.length ? (
                  bulkAudit.results.map((row) => (
                    <Group key={row.pageId} justify="space-between" align="start" gap="sm">
                      <Text size="sm" fw={500}>
                        {row.pageTitle} ({row.pageSlug})
                      </Text>
                      <Text size="xs" c={row.outcome === "failed" ? "red" : row.outcome === "skipped" ? "yellow" : "teal"}>
                        {row.outcome}: {row.message}
                      </Text>
                    </Group>
                  ))
                ) : (
                  <Text size="sm" c="dimmed">
                    No page-level operations were performed.
                  </Text>
                )}
              </Stack>
            </Paper>
          </Stack>
        ) : null}
      </Modal>

      <Modal
        opened={applyBackdropConfirmOpen}
        onClose={() => (applyBackdropLoading ? null : setApplyBackdropConfirmOpen(false))}
        title="Apply page backdrop settings to all pages?"
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            This will save current draft backdrop settings and hard-overwrite all pages (including this one).
          </Text>
          <Paper withBorder p="sm" radius="md">
            <Stack gap={4}>
              <Text size="xs" c="dimmed">Background image URL</Text>
              <Text size="sm" lineClamp={1}>{pageBgDraftUrl.trim() || "(none)"}</Text>
              <Text size="xs" c="dimmed">Scope: {pageBackdropScopeDraft} · Nav overlay: {Math.round(pageNavOpacityDraft * 100)}% · Image opacity: {Math.round(pageBgImageOpacityDraft * 100)}% · Panel opacity: {Math.round(pagePanelOpacityDraft * 100)}%</Text>
            </Stack>
          </Paper>
          <Group justify="end">
            <Button variant="default" disabled={applyBackdropLoading} onClick={() => setApplyBackdropConfirmOpen(false)}>
              Cancel
            </Button>
            <Button
              color="yellow"
              variant="light"
              leftSection={<IconAlertTriangle size={14} />}
              loading={applyBackdropLoading}
              onClick={() => void onApplyBackdropToAllPages()}
            >
              Save & apply to all pages
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={backdropApplyAuditOpen}
        onClose={() => setBackdropApplyAuditOpen(false)}
        title="Apply to all pages audit"
        centered
        size="lg"
      >
        {backdropApplyAudit ? (
          <Stack gap="sm">
            <Group gap="xs">
              <Badge color="teal" variant="light">Updated {backdropApplyAudit.updatedCount}</Badge>
              <Badge color="red" variant="light">Failed {backdropApplyAudit.failedCount}</Badge>
            </Group>
            <Paper withBorder radius="md" p="sm">
              <Stack gap={6}>
                {backdropApplyAudit.results.map((row) => (
                  <Group key={row.pageId} justify="space-between" align="start" gap="sm">
                    <Text size="sm" fw={500}>{row.pageTitle} ({row.pageSlug})</Text>
                    <Text size="xs" c={row.outcome === "failed" ? "red" : "teal"}>
                      {row.outcome}: {row.message}
                    </Text>
                  </Group>
                ))}
              </Stack>
            </Paper>
          </Stack>
        ) : null}
      </Modal>

      <MediaLibraryModal
        opened={pageBgLibraryOpen}
        onClose={() => setPageBgLibraryOpen(false)}
        onSelect={(item) => {
          void onSelectPageBackgroundFromLibrary(item)
          setPageBgLibraryOpen(false)
        }}
      />

      <SectionEditorDrawer
        opened={Boolean(activeSection && !activeSection.global_section_id)}
        section={activeSection}
        onClose={() => setActiveSection(null)}
        onChanged={load}
        typeDefaults={typeDefaults}
      />

      <Toast items={toasts} onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))} />
    </Stack>
  )
}
