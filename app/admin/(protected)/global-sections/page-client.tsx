"use client"

import { useEffect, useMemo, useState, type ReactNode } from "react"
import { useSearchParams } from "next/navigation"
import {
  Alert,
  Autocomplete,
  Box,
  Button as MuiButton,
  Chip as MuiChip,
  CircularProgress,
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
  Table as MuiTable,
  TableBody as MuiTableBody,
  TableCell as MuiTableCell,
  TableContainer,
  TableHead as MuiTableHead,
  TableRow as MuiTableRow,
  TextField,
  Typography,
  type BoxProps,
  type ButtonProps as MuiButtonProps,
  type ChipProps as MuiChipProps,
  type PaperProps as MuiPaperProps,
  type SliderProps as MuiSliderProps,
  type StackProps as MuiStackProps,
  type TextFieldProps,
  type TypographyProps,
} from "@mui/material"
import { IconDotsVertical, IconEdit, IconTrash } from "@tabler/icons-react"

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
import {
  applyDesignThemePreset,
  createDesignThemePreset,
  updateDesignThemePreset,
} from "@/lib/cms/commands/themes"
import { createClient } from "@/lib/supabase/browser"
import { applyEditorError, toEditorErrorMessage } from "@/lib/cms/editor-error-message"
import { WorkspaceHeader, WorkspacePanel, AdminLoadingState, AdminSubgroupHeader } from "@/components/admin/ui"

type ButtonProps = Omit<MuiButtonProps, "variant" | "size" | "color"> & {
  variant?: "filled" | "light" | "default" | "subtle"
  size?: "xs" | "sm" | "md"
  loading?: boolean
  color?: "red"
}

function Button({ variant, size, loading, color, disabled, startIcon, sx, ...props }: ButtonProps) {
  const muiVariant: MuiButtonProps["variant"] = toMuiButtonVariant(variant)
  const muiSize: MuiButtonProps["size"] = toMuiControlSize(size)
  const muiColor: MuiButtonProps["color"] = color === "red" ? "error" : "primary"

  return (
    <MuiButton
      variant={muiVariant}
      size={muiSize}
      color={muiColor}
      disabled={disabled || loading}
      startIcon={loading ? <CircularProgress color="inherit" size={14} /> : startIcon}
      sx={{ textTransform: "none", ...sx }}
      {...props}
    />
  )
}



type BadgeTone = "dark" | "violet" | "teal" | "gray" | "yellow" | "red"
type BadgeProps = Omit<MuiChipProps, "label" | "variant" | "color" | "size" | "children"> & {
  size?: "xs" | "sm" | "md"
  variant?: "filled" | "light" | "default"
  color?: BadgeTone
  radius?: MantineRadius
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
    case "violet":
      return { bgcolor: "rgba(124, 58, 237, 0.14)", color: "#6d28d9", borderColor: "rgba(124, 58, 237, 0.38)" }
    case "gray":
      return { bgcolor: "rgba(100, 116, 139, 0.14)", color: "#475569", borderColor: "rgba(100, 116, 139, 0.35)" }
    case "dark":
      return { bgcolor: "rgba(15, 23, 42, 0.15)", color: "#0f172a", borderColor: "rgba(15, 23, 42, 0.4)" }
    default:
      return { bgcolor: "transparent", color: "inherit", borderColor: "divider" }
  }
}

function Badge({ size, variant, color, radius, children, sx, ...props }: BadgeProps) {
  const muiVariant: MuiChipProps["variant"] = variant === "filled" ? "filled" : "outlined"
  const muiColor: MuiChipProps["color"] =
    color === "teal" ? "success" : color === "yellow" ? "warning" : color === "red" ? "error" : color === "violet" ? "secondary" : "default"
  const lightStyles = badgeLightStyles(color)

  return (
    <MuiChip
      size={size === "xs" || size === "sm" ? "small" : "medium"}
      variant={muiVariant}
      color={muiColor}
      label={children}
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

type PaperProps = Omit<MuiPaperProps, "variant"> & {
  withBorder?: boolean
  p?: MantineSpace
  radius?: MantineRadius
}

function Paper({ withBorder, p, radius, sx, ...props }: PaperProps) {
  return (
    <MuiPaper
      variant={withBorder ? "outlined" : undefined}
      sx={{
        p: toCssSpace(p),
        borderRadius: toCssRadius(radius),
        ...sx,
      }}
      {...props}
    />
  )
}

type StackProps = Omit<MuiStackProps, "gap" | "alignItems" | "mt"> & {
  gap?: MantineSpace
  align?: MantineAlign
  mt?: MantineSpace
}

function Stack({ gap, align, mt, sx, ...props }: StackProps) {
  return (
    <MuiStack
      sx={{
        gap: toCssSpace(gap),
        alignItems: align ? toFlexAlign(align) : undefined,
        mt: toCssSpace(mt),
        ...sx,
      }}
      {...props}
    />
  )
}

type GroupProps = Omit<BoxProps, "display" | "alignItems" | "justifyContent" | "gap" | "mt"> & {
  gap?: MantineSpace
  align?: MantineAlign
  justify?: MantineJustify
  grow?: boolean
  wrap?: "wrap" | "nowrap"
  mt?: MantineSpace
}

function Group({ gap, align, justify, grow, wrap, mt, sx, children, ...props }: GroupProps) {
  return (
    <Box
      sx={{
        display: "flex",
        flexWrap: wrap ?? "wrap",
        alignItems: toFlexAlign(align),
        justifyContent: toFlexJustify(justify),
        gap: toCssSpace(gap ?? "sm"),
        mt: toCssSpace(mt),
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

type TextProps = Omit<TypographyProps, "variant" | "color" | "mt"> & {
  size?: "xs" | "sm" | "md"
  c?: "dimmed" | "red" | "yellow"
  fw?: number
  lineClamp?: number
  mt?: MantineSpace
}

function Text({ size, c, fw, lineClamp, mt, sx, ...props }: TextProps) {
  const variant: TypographyProps["variant"] = size === "xs" ? "caption" : size === "sm" ? "body2" : "body1"
  const color = c === "dimmed" ? "text.secondary" : c === "red" ? "error.main" : c === "yellow" ? "warning.main" : undefined

  return (
    <Typography
      variant={variant}
      sx={{
        color,
        fontWeight: fw,
        mt: toCssSpace(mt),
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

type SelectProps = {
  label?: string
  placeholder?: string
  value?: string | null
  onChange?: (value: string | null) => void
  data: SelectData
  searchable?: boolean
  disabled?: boolean
}

function Select({ label, placeholder, value, onChange, data, disabled }: SelectProps) {
  const options = normalizeSelectData(data)

  return (
    <TextField
      select
      fullWidth
      label={label}
      value={value ?? ""}
      disabled={disabled}
      InputLabelProps={{ shrink: true }}
      onChange={(event) => onChange?.(event.target.value || null)}
      SelectProps={{ displayEmpty: Boolean(placeholder) }}
    >
      {placeholder ? (
        <MenuItem value="" disabled>
          {placeholder}
        </MenuItem>
      ) : null}
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  )
}

type MultiSelectProps = {
  label?: string
  placeholder?: string
  value: string[]
  onChange?: (value: string[]) => void
  data: SelectData
  searchable?: boolean
}

function MultiSelect({ label, placeholder, value, onChange, data, searchable }: MultiSelectProps) {
  const options = normalizeSelectData(data)
  const selected = options.filter((option) => value.includes(option.value))

  return (
    <Autocomplete
      fullWidth
      multiple
      options={options}
      value={selected}
      readOnly={!searchable}
      filterSelectedOptions
      disableCloseOnSelect
      onChange={(_event, nextValues) => onChange?.(nextValues.map((nextValue) => nextValue.value))}
      isOptionEqualToValue={(option, nextValue) => option.value === nextValue.value}
      getOptionLabel={(option) => option.label}
      sx={{ width: "100%" }}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          label={label}
          placeholder={placeholder}
        />
      )}
    />
  )
}

type ColorInputProps = {
  label?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

function ColorInput({ label, value, onChange, placeholder }: ColorInputProps) {
  const trimmed = value.trim()
  const pickerValue = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(trimmed) ? trimmed : "#000000"

  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      onChange={(event) => onChange(event.currentTarget.value)}
      placeholder={placeholder}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <input
              aria-label={`${label ?? "color"} picker`}
              type="color"
              value={pickerValue}
              onChange={(event) => onChange(event.currentTarget.value)}
              style={{ width: 24, height: 24, border: "none", background: "transparent", cursor: "pointer", padding: 0 }}
            />
          </InputAdornment>
        ),
      }}
    />
  )
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

const SECTION_TYPES: BuiltinCmsSectionType[] = ["nav_links", "hero_cta", "card_grid", "steps_list", "title_body_list", "rich_text_block", "label_value_list", "faq_list", "cta_block", "footer_grid", "social_proof_strip", "proof_cluster", "case_study_split"]

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
    default:
      return raw?.trim() ? raw.trim() : null
  }
}
const FONT_STACKS = [
  { value: "Inter, system-ui, sans-serif", label: "Inter (Sans)" },
  { value: "'Geist', Inter, system-ui, sans-serif", label: "Geist + Inter (Sans)" },
  { value: "'IBM Plex Sans', Inter, system-ui, sans-serif", label: "IBM Plex Sans (Sans)" },
  { value: "'Merriweather', Georgia, serif", label: "Merriweather (Serif)" },
  { value: "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace", label: "JetBrains Mono (Mono)" },
  { value: "'Poppins', Inter, system-ui, sans-serif", label: "Poppins (Sans)" },
  { value: "'Manrope', Inter, system-ui, sans-serif", label: "Manrope (Sans)" },
  { value: "'DM Sans', Inter, system-ui, sans-serif", label: "DM Sans (Sans)" },
  { value: "'Nunito Sans', Inter, system-ui, sans-serif", label: "Nunito Sans (Sans)" },
  { value: "'Work Sans', Inter, system-ui, sans-serif", label: "Work Sans (Sans)" },
  { value: "'Source Sans 3', Inter, system-ui, sans-serif", label: "Source Sans 3 (Sans)" },
  { value: "'Roboto', Inter, system-ui, sans-serif", label: "Roboto (Sans)" },
  { value: "'Open Sans', Inter, system-ui, sans-serif", label: "Open Sans (Sans)" },
  { value: "'Lato', Inter, system-ui, sans-serif", label: "Lato (Sans)" },
  { value: "'Montserrat', Inter, system-ui, sans-serif", label: "Montserrat (Sans)" },
]

type Row = {
  id: string
  key: string
  label: string | null
  section_type: string
  enabled: boolean
  lifecycle_state?: "draft" | "published" | "archived"
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
  | "social_proof_strip"
  | "proof_cluster"
  | "case_study_split"

type CmsSectionType = BuiltinCmsSectionType | string

type ImpactRow = { total_references: number; enabled_references: number; distinct_pages: number }
type UsageRow = { global_section_id: string; page_slug: string; page_title: string; section_key: string | null }
type PageOption = { id: string; slug: string; title: string }
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

type FormattingTemplateRow = {
  id: string
  key: string
  name: string
  description: string | null
  settings: Record<string, unknown>
  is_system: boolean
  created_at: string
  updated_at: string
}

type SectionActionsMenuProps = {
  row: Row
  onEdit: (row: Row) => void
  onAttach: (row: Row) => void
  onToggle: (row: Row) => void
  onDelete: (row: Row) => void
}

function SectionActionsMenu({ row, onEdit, onAttach, onToggle, onDelete }: SectionActionsMenuProps) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const open = Boolean(anchorEl)

  function closeMenu() {
    setAnchorEl(null)
  }

  return (
    <>
      <ActionIcon
        variant="default"
        aria-label={`Actions for ${row.key}`}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        <IconDotsVertical size={16} />
      </ActionIcon>
      <MuiMenu
        anchorEl={anchorEl}
        open={open}
        onClose={closeMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Typography
          variant="caption"
          sx={{ px: 2, py: 1, color: "text.secondary", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 700 }}
        >
          Actions
        </Typography>
        <MenuItem
          onClick={() => {
            closeMenu()
            onEdit(row)
          }}
        >
          <ListItemIcon>
            <IconEdit size={14} />
          </ListItemIcon>
          Edit
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu()
            onAttach(row)
          }}
        >
          Attach to page(s)…
        </MenuItem>
        <MenuItem
          onClick={() => {
            closeMenu()
            onToggle(row)
          }}
        >
          {row.enabled ? "Disable" : "Enable"}
        </MenuItem>
        <Divider />
        <MenuItem
          onClick={() => {
            closeMenu()
            onDelete(row)
          }}
          sx={{ color: "error.main" }}
        >
          <ListItemIcon sx={{ color: "error.main" }}>
            <IconTrash size={14} />
          </ListItemIcon>
          Delete…
        </MenuItem>
      </MuiMenu>
    </>
  )
}

function parseNum(v: string, fallback: number) {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

function asRecord(v: unknown): Record<string, unknown> {
  return v && typeof v === "object" && !Array.isArray(v) ? (v as Record<string, unknown>) : {}
}

function deepMerge(base: Record<string, unknown>, override: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...base }
  Object.entries(override).forEach(([key, value]) => {
    if (value === undefined) return
    if (
      value &&
      typeof value === "object" &&
      !Array.isArray(value) &&
      out[key] &&
      typeof out[key] === "object" &&
      !Array.isArray(out[key])
    ) {
      out[key] = deepMerge(out[key] as Record<string, unknown>, value as Record<string, unknown>)
      return
    }
    out[key] = value
  })
  return out
}

function settingsFingerprint(input: Record<string, unknown>) {
  const s = asRecord(input)
  const t = asRecord(s.tokens)
  const picked = {
    colorMode: String(t.colorMode ?? "dark"),
    fontFamily: String(t.fontFamily ?? s.fontFamily ?? ""),
    fontScale: Number(t.fontScale ?? s.fontScale ?? 1),
    spaceScale: Number(t.spaceScale ?? t.spacingScale ?? 1),
    radiusScale: Number(t.radiusScale ?? 1),
    shadowScale: Number(t.shadowScale ?? 1),
    innerShadowScale: Number(t.innerShadowScale ?? 0),
    textColor: String(t.textColor ?? ""),
    mutedTextColor: String(t.mutedTextColor ?? ""),
    accentColor: String(t.accentColor ?? ""),
    shadowColor: String(t.shadowColor ?? ""),
    backgroundColor: String(t.backgroundColor ?? ""),
    cardBackgroundColor: String(t.cardBackgroundColor ?? ""),
  }
  return JSON.stringify(picked)
}

export function GlobalSectionsPage() {
  const supabase = useMemo(() => createClient(), [])
  const searchParams = useSearchParams()
  const editGlobalId = (searchParams.get("edit") ?? "").trim()
  const [autoOpenedEditId, setAutoOpenedEditId] = useState<string | null>(null)
  const [rows, setRows] = useState<Row[]>([])
  const [loading, setLoading] = useState(false)
  const [key, setKey] = useState("")
  const [label, setLabel] = useState("")
  const [type, setType] = useState<CmsSectionType>("hero_cta")
  const [customTypes, setCustomTypes] = useState<Array<{ value: string; label: string }>>([])
  const [error, setError] = useState<string | null>(null)

  const [fontFamily, setFontFamily] = useState("Inter, system-ui, sans-serif")
  const [customFontFamily, setCustomFontFamily] = useState("")
  const [fontScale, setFontScale] = useState(1)
  const [spaceScale, setSpaceScale] = useState(1)
  const [radiusScale, setRadiusScale] = useState(1)
  const [shadowScale, setShadowScale] = useState(1)
  const [innerShadowScale, setInnerShadowScale] = useState(0)
  const [shadowColor, setShadowColor] = useState("")
  const [colorMode, setColorMode] = useState("dark")
  const [textColor, setTextColor] = useState("")
  const [mutedTextColor, setMutedTextColor] = useState("")
  const [accentColor, setAccentColor] = useState("")
  const [backgroundColor, setBackgroundColor] = useState("")
  const [cardBackgroundColor, setCardBackgroundColor] = useState("")

  const [displayFontFamily, setDisplayFontFamily] = useState("var(--font-space-grotesk)")
  const [bodyFontFamily, setBodyFontFamily] = useState("var(--font-ibm-plex-sans)")
  const [monoFontFamily, setMonoFontFamily] = useState("var(--font-ibm-plex-mono)")
  const [displayScale, setDisplayScale] = useState(1)
  const [headingScale, setHeadingScale] = useState(1)
  const [eyebrowScale, setEyebrowScale] = useState(0.8)
  const [metricScale, setMetricScale] = useState(1)
  const [displayTracking, setDisplayTracking] = useState("")
  const [eyebrowTracking, setEyebrowTracking] = useState("")
  const [signatureStyle, setSignatureStyle] = useState("off")
  const [signatureIntensity, setSignatureIntensity] = useState(0.5)
  const [signatureColor, setSignatureColor] = useState("rgba(120,140,255,0.08)")
  const [signatureGridOpacity, setSignatureGridOpacity] = useState(0.06)
  const [signatureGlowOpacity, setSignatureGlowOpacity] = useState(0.08)
  const [displayWeight, setDisplayWeight] = useState(700)
  const [headingWeight, setHeadingWeight] = useState(600)
  const [bodyWeight, setBodyWeight] = useState(400)
  const [metricTracking, setMetricTracking] = useState("-0.02em")
  const [bodyScale, setBodyScale] = useState(1)
  const [signatureNoiseOpacity, setSignatureNoiseOpacity] = useState(0)

  const [templates, setTemplates] = useState<FormattingTemplateRow[]>([])
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null)
  const [templateName, setTemplateName] = useState("")
  const [templateDescription, setTemplateDescription] = useState("")
  const [newTemplateName, setNewTemplateName] = useState("")
  const [newTemplateDescription, setNewTemplateDescription] = useState("")
  const [templateBusy, setTemplateBusy] = useState(false)
  const [applyTemplateConfirmOpen, setApplyTemplateConfirmOpen] = useState(false)
  const [customizeOpen, setCustomizeOpen] = useState(false)
  const [customizeBaselineFingerprint, setCustomizeBaselineFingerprint] = useState("")

  const [impactByGlobalId, setImpactByGlobalId] = useState<Record<string, ImpactRow>>({})
  const [usageByGlobalId, setUsageByGlobalId] = useState<Record<string, UsageRow[]>>({})

  const [editorOpen, setEditorOpen] = useState(false)
  const [editing, setEditing] = useState<Row | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<Row | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [pages, setPages] = useState<PageOption[]>([])
  const [attachTarget, setAttachTarget] = useState<Row | null>(null)
  const [attachPageIds, setAttachPageIds] = useState<string[]>([])
  const [attachLoading, setAttachLoading] = useState(false)
  const [sectionTypeDefaults, setSectionTypeDefaults] = useState<SectionTypeDefaultsMap>({})

  async function load() {
    setLoading(true)
    setError(null)

    const { data, error } = await supabase
      .from("global_sections")
      .select("id,key,label,section_type,enabled,lifecycle_state")
      .order("key", { ascending: true })

    if (error) {
      applyEditorError({
        error,
        fallback: "Failed to load global sections.",
        setError,
      })
      setLoading(false)
      return
    }

    const nextRows = (data ?? []) as Row[]
    setRows(nextRows)

    const { data: defaultsRows } = await supabase
      .from("section_type_defaults")
      .select(
        "section_type, label, description, default_title, default_subtitle, default_cta_primary_label, default_cta_primary_href, default_cta_secondary_label, default_cta_secondary_href, default_background_media_url, default_formatting, default_content, capabilities"
      )

    const defaultsMap = ((defaultsRows ?? []) as Array<SectionTypeDefault | { section_type: string }>).reduce(
      (acc, row) => {
        const normalized = normalizeSectionType(String(row.section_type))
        if (!normalized) return acc
        acc[normalized] = { ...(row as SectionTypeDefault), section_type: normalized }
        return acc
      },
      {} as SectionTypeDefaultsMap
    )
    setSectionTypeDefaults(defaultsMap)

    const { data: customTypeRows } = await supabase
      .from("section_type_registry")
      .select("key,label,source,renderer,is_active")
      .eq("source", "custom")
      .eq("renderer", "composed")
      .eq("is_active", true)
      .order("label", { ascending: true })

    setCustomTypes(
      ((customTypeRows ?? []) as Array<{ key: string; label: string }>).map((row) => ({
        value: row.key,
        label: `${row.label} (${row.key})`,
      }))
    )

    const { data: pagesData, error: pagesErr } = await supabase
      .from("pages")
      .select("id, slug, title")
      .order("slug", { ascending: true })

    if (pagesErr) {
      applyEditorError({
        error: pagesErr,
        fallback: "Failed to load pages.",
        setError,
      })
    } else {
      setPages(((pagesData ?? []) as PageOption[]))
    }

    const { data: whereUsedRows } = await supabase
      .from("global_section_where_used")
      .select("global_section_id,page_slug,page_title,section_key")
      .order("page_slug", { ascending: true })

    const usageMap: Record<string, UsageRow[]> = {}
    ;((whereUsedRows ?? []) as UsageRow[]).forEach((u) => {
      usageMap[u.global_section_id] = usageMap[u.global_section_id] ?? []
      usageMap[u.global_section_id].push(u)
    })
    setUsageByGlobalId(usageMap)

    const impacts = await Promise.all(
      nextRows.map(async (row) => {
        const { data: impact } = await supabase.rpc("global_section_impact_preview", { p_global_section_id: row.id })
        return [row.id, ((impact ?? [])[0] ?? { total_references: 0, enabled_references: 0, distinct_pages: 0 }) as ImpactRow] as const
      })
    )
    setImpactByGlobalId(Object.fromEntries(impacts))

    const { data: fmt } = await supabase.from("site_formatting_settings").select("settings").eq("id", "default").maybeSingle()
    const settings = (fmt?.settings ?? {}) as Record<string, unknown>
    applySettingsToForm(settings)

    const { data: templateRows, error: templatesError } = await supabase
      .from("design_theme_presets")
      .select("id, key, name, description, is_system, tokens, created_at, updated_at")
      .order("is_system", { ascending: false })
      .order("name", { ascending: true })

    if (templatesError) {
      applyEditorError({
        error: templatesError,
        fallback: "Failed to load design theme presets.",
        setError,
      })
    } else {
      // Normalize design_theme_presets rows to FormattingTemplateRow shape
      const rows = ((templateRows ?? []) as Array<{
        id: string; key: string; name: string; description: string | null;
        is_system: boolean; tokens: Record<string, unknown>; created_at: string; updated_at: string
      }>).map((row): FormattingTemplateRow => ({
        id: row.id,
        key: row.key,
        name: row.name,
        description: row.description,
        is_system: row.is_system,
        settings: { tokens: row.tokens },
        created_at: row.created_at,
        updated_at: row.updated_at,
      }))
      setTemplates(rows)

      // Prefer the stored template ID from settings, then fingerprint match, then current selection
      const storedTemplateId = String(settings._appliedTemplateId ?? "")
      const storedMatch = storedTemplateId ? rows.find((t) => t.id === storedTemplateId) : null
      const activeFp = settingsFingerprint(settings)
      const fpMatch = rows.find((t) => settingsFingerprint(asRecord(t.settings)) === activeFp)
      const matched = storedMatch ?? fpMatch
      if (matched) {
        setSelectedTemplateId(matched.id)
        setCustomizeBaselineFingerprint(settingsFingerprint(asRecord(matched.settings)))
      } else if (selectedTemplateId && rows.some((t) => t.id === selectedTemplateId)) {
        setSelectedTemplateId(selectedTemplateId)
        const existingSelected = rows.find((t) => t.id === selectedTemplateId)
        setCustomizeBaselineFingerprint(settingsFingerprint(asRecord(existingSelected?.settings)))
      } else {
        setSelectedTemplateId(null)
        setCustomizeBaselineFingerprint(activeFp)
      }
    }

    setLoading(false)
  }

  function openEditor(row: Row) {
    setEditing(row)
    setEditorOpen(true)
  }
  async function saveTemplateAsNew() {
    if (!newTemplateName.trim()) {
      setError("New template name is required.")
      return
    }
    setTemplateBusy(true)
    setError(null)
    try {
      const payload = buildCurrentSettingsPayload()
      const saved = await createDesignThemePreset(supabase, {
        key: newTemplateName,
        name: newTemplateName,
        description: newTemplateDescription,
        settings: payload,
      })
      await load()
      setSelectedTemplateId(saved.id)
      setCustomizeBaselineFingerprint(settingsFingerprint(payload))
      setNewTemplateName("")
      setNewTemplateDescription("")
    } catch (e) {
      const msg = toEditorErrorMessage(e, "Failed to save theme preset.")
      if (msg.includes("design_theme_presets_key_key") || msg.includes("unique")) {
        setError("Theme preset name already exists. Choose a different name.")
      } else {
        setError(msg)
      }
    } finally {
      setTemplateBusy(false)
    }
  }

  async function updateSelectedTemplate() {
    if (!selectedTemplate || selectedTemplate.is_system) return
    setTemplateBusy(true)
    setError(null)
    try {
      const payload = buildCurrentSettingsPayload()
      await updateDesignThemePreset(supabase, {
        id: selectedTemplate.id,
        name: templateName.trim() || selectedTemplate.name,
        description: templateDescription,
        settings: payload,
      })
      setCustomizeBaselineFingerprint(settingsFingerprint(payload))
      await load()
    } catch (e) {
      setError(toEditorErrorMessage(e, "Failed to update theme preset."))
    } finally {
      setTemplateBusy(false)
    }
  }

  async function deleteSelectedTemplate() {
    if (!selectedTemplate || selectedTemplate.is_system) return
    const ok = window.confirm(`Delete theme preset "${selectedTemplate.name}"?`)
    if (!ok) return
    setTemplateBusy(true)
    setError(null)
    try {
      const { error } = await supabase.from("design_theme_presets").delete().eq("id", selectedTemplate.id)
      if (error) throw new Error(error.message)
      setSelectedTemplateId(null)
      await load()
    } catch (e) {
      setError(toEditorErrorMessage(e, "Failed to delete theme preset."))
    } finally {
      setTemplateBusy(false)
    }
  }

  async function applySelectedTemplate() {
    if (!selectedTemplate) return
    setApplyTemplateConfirmOpen(false)
    setTemplateBusy(true)
    setError(null)
    try {
      await applyDesignThemePreset(supabase, selectedTemplate.id)
      setCustomizeBaselineFingerprint(settingsFingerprint(asRecord(selectedTemplate.settings)))
      await load()
    } catch (e) {
      setError(toEditorErrorMessage(e, "Failed to apply template."))
    } finally {
      setTemplateBusy(false)
    }
  }

  async function createGlobal() {
    setError(null)
    const cleanKey = key.trim().toLowerCase()
    if (!cleanKey) return setError("Key required")

    const { data, error } = await supabase
      .from("global_sections")
      .insert({ key: cleanKey, label: label.trim() || null, section_type: type, enabled: true, lifecycle_state: "draft" })
      .select("id")
      .single()

    if (error || !data) return setError(toEditorErrorMessage(error, "Create failed"))

    const defaults = sectionTypeDefaults[type]
    await supabase.from("global_section_versions").insert({
      global_section_id: data.id,
      version: 1,
      status: "draft",
      formatting: asRecord(defaults?.default_formatting),
      content: asRecord(defaults?.default_content),
    })

    setKey("")
    setLabel("")
    await load()
  }

  async function toggle(row: Row) {
    setError(null)
    const { error } = await supabase.from("global_sections").update({ enabled: !row.enabled }).eq("id", row.id)
    if (error) {
      setError(toEditorErrorMessage(error, "Failed to update global section."))
      return
    }
    await load()
  }

  async function attachGlobalToPages() {
    if (!attachTarget || !attachPageIds.length) return
    setAttachLoading(true)
    setError(null)
    try {
      const endpoints = ["/api/global-sections/attach", "/admin/api/global-sections/attach"]
      let lastError = "Failed to attach global section to pages."
      let ok = false

      for (const endpoint of endpoints) {
        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ globalSectionId: attachTarget.id, pageIds: attachPageIds }),
        })

        const payload = (await res.json().catch(() => ({}))) as {
          ok?: boolean
          error?: string
          inserted?: number
          skipped?: number
          failed?: number
        }

        if (res.ok && payload.ok !== undefined) {
          ok = true
          setError(
            `Attach complete: inserted ${payload.inserted ?? 0}, skipped ${payload.skipped ?? 0}, failed ${payload.failed ?? 0}.`
          )
          break
        }

        if (payload.error) lastError = payload.error
      }

      if (!ok) {
        setError(lastError)
      }

      setAttachTarget(null)
      setAttachPageIds([])
      await load()
    } finally {
      setAttachLoading(false)
    }
  }

  async function removeGlobal() {
    if (!deleteTarget) return
    setDeleteLoading(true)
    setError(null)
    const { error } = await supabase.from("global_sections").delete().eq("id", deleteTarget.id)
    if (error) {
      setError(toEditorErrorMessage(error, "Failed to delete global section."))
      setDeleteLoading(false)
      return
    }
    setDeleteTarget(null)
    setDeleteLoading(false)
    await load()
  }

  const selectedTemplate = templates.find((t) => t.id === selectedTemplateId) ?? null

  useEffect(() => {
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!selectedTemplate) {
      setTemplateName("")
      setTemplateDescription("")
      return
    }
    setTemplateName(selectedTemplate.name)
    setTemplateDescription(selectedTemplate.description ?? "")
  }, [selectedTemplate])

  useEffect(() => {
    if (!selectedTemplate) return
    applySettingsToForm(asRecord(selectedTemplate.settings))
    setCustomizeBaselineFingerprint(settingsFingerprint(asRecord(selectedTemplate.settings)))
  }, [selectedTemplate])

  useEffect(() => {
    if (!editGlobalId || autoOpenedEditId === editGlobalId) return
    const match = rows.find((row) => row.id === editGlobalId)
    if (!match) return
    setEditing(match)
    setEditorOpen(true)
    setAutoOpenedEditId(editGlobalId)
  }, [rows, editGlobalId, autoOpenedEditId])

  const effectiveFontFamily = fontFamily === "__custom" ? customFontFamily : fontFamily

  function buildCurrentSettingsPayload() {
    return {
      fontFamily: effectiveFontFamily.trim() || "Inter, system-ui, sans-serif",
      fontScale,
      tokens: {
        colorMode,
        fontFamily: effectiveFontFamily.trim() || "Inter, system-ui, sans-serif",
        fontScale,
        spaceScale,
        spacingScale: spaceScale,
        radiusScale,
        shadowScale,
        innerShadowScale,
        shadowColor: shadowColor.trim() || null,
        textColor: textColor.trim() || null,
        mutedTextColor: mutedTextColor.trim() || null,
        accentColor: accentColor.trim() || null,
        backgroundColor: backgroundColor.trim() || null,
        cardBackgroundColor: cardBackgroundColor.trim() || null,
        displayFontFamily: displayFontFamily.trim() || null,
        bodyFontFamily: bodyFontFamily.trim() || null,
        monoFontFamily: monoFontFamily.trim() || null,
        displayScale,
        headingScale,
        eyebrowScale,
        metricScale,
        displayTracking: displayTracking.trim() || null,
        eyebrowTracking: eyebrowTracking.trim() || null,
        signatureStyle: signatureStyle || "off",
        signatureIntensity,
        signatureColor: signatureColor.trim() || null,
        signatureGridOpacity,
        signatureGlowOpacity,
        displayWeight,
        headingWeight,
        bodyWeight,
        metricTracking: metricTracking.trim() || null,
        bodyScale,
        signatureNoiseOpacity,
      },
    } satisfies Record<string, unknown>
  }

  const currentSettingsFingerprint = settingsFingerprint(buildCurrentSettingsPayload())
  const hasUnsavedCustomizeChanges = Boolean(customizeBaselineFingerprint && currentSettingsFingerprint !== customizeBaselineFingerprint)

  useEffect(() => {
    if (!hasUnsavedCustomizeChanges) return
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault()
      event.returnValue = ""
    }
    window.addEventListener("beforeunload", onBeforeUnload)
    return () => window.removeEventListener("beforeunload", onBeforeUnload)
  }, [hasUnsavedCustomizeChanges])

  function applySettingsToForm(settings: Record<string, unknown>) {
    const next = asRecord(settings)
    const tokens = asRecord(next.tokens)
    const tokenFont = String(tokens.fontFamily ?? next.fontFamily ?? "Inter, system-ui, sans-serif")
    const matchPreset = FONT_STACKS.find((f) => f.value === tokenFont)
    setFontFamily(matchPreset?.value ?? "__custom")
    setCustomFontFamily(matchPreset ? "" : tokenFont)
    setFontScale(parseNum(String(tokens.fontScale ?? next.fontScale ?? 1), 1))
    setSpaceScale(parseNum(String(tokens.spaceScale ?? tokens.spacingScale ?? 1), 1))
    setRadiusScale(parseNum(String(tokens.radiusScale ?? 1), 1))
    setShadowScale(parseNum(String(tokens.shadowScale ?? 1), 1))
    setInnerShadowScale(parseNum(String(tokens.innerShadowScale ?? 0), 0))
    setShadowColor(String(tokens.shadowColor ?? ""))
    setColorMode(String(tokens.colorMode ?? "dark"))
    setTextColor(String(tokens.textColor ?? ""))
    setMutedTextColor(String(tokens.mutedTextColor ?? ""))
    setAccentColor(String(tokens.accentColor ?? ""))
    setBackgroundColor(String(tokens.backgroundColor ?? ""))
    setCardBackgroundColor(String(tokens.cardBackgroundColor ?? ""))
    setDisplayFontFamily(String(tokens.displayFontFamily ?? "var(--font-space-grotesk)"))
    setBodyFontFamily(String(tokens.bodyFontFamily ?? "var(--font-ibm-plex-sans)"))
    setMonoFontFamily(String(tokens.monoFontFamily ?? "var(--font-ibm-plex-mono)"))
    setDisplayScale(parseNum(String(tokens.displayScale ?? 1), 1))
    setHeadingScale(parseNum(String(tokens.headingScale ?? 1), 1))
    setEyebrowScale(parseNum(String(tokens.eyebrowScale ?? 0.8), 0.8))
    setMetricScale(parseNum(String(tokens.metricScale ?? 1), 1))
    setDisplayTracking(String(tokens.displayTracking ?? ""))
    setEyebrowTracking(String(tokens.eyebrowTracking ?? ""))
    setSignatureStyle(String(tokens.signatureStyle ?? "off"))
    setSignatureIntensity(parseNum(String(tokens.signatureIntensity ?? 0.5), 0.5))
    setSignatureColor(String(tokens.signatureColor ?? "rgba(120,140,255,0.08)"))
    setSignatureGridOpacity(parseNum(String(tokens.signatureGridOpacity ?? 0.06), 0.06))
    setSignatureGlowOpacity(parseNum(String(tokens.signatureGlowOpacity ?? 0.08), 0.08))
    setDisplayWeight(Number(tokens.displayWeight) || 700)
    setHeadingWeight(Number(tokens.headingWeight) || 600)
    setBodyWeight(Number(tokens.bodyWeight) || 400)
    setMetricTracking(String(tokens.metricTracking ?? "-0.02em"))
    setBodyScale(Number(tokens.bodyScale) || 1)
    setSignatureNoiseOpacity(Number(tokens.signatureNoiseOpacity) || 0)
  }

  function renderSectionActions(row: Row) {
    return (
      <SectionActionsMenu
        row={row}
        onEdit={openEditor}
        onAttach={(target) => {
          setAttachTarget(target)
          setAttachPageIds([])
        }}
        onToggle={(target) => {
          void toggle(target)
        }}
        onDelete={setDeleteTarget}
      />
    )
  }

  return (
    <Stack gap="md">
      <WorkspaceHeader
        title="Global Sections"
        sx={{ mx: -2, mt: -2, mb: 0 }}
      />

      <WorkspacePanel title="Create Global Section" description="Add a new reusable section." compact>
        <Group align="end">
          <TextInput label="Key" placeholder="global-hero" value={key} onChange={(e) => setKey(e.currentTarget.value)} />
          <TextInput label="Label" placeholder="Global Hero" value={label} onChange={(e) => setLabel(e.currentTarget.value)} />
          <Select
            label="Type"
            value={type}
            onChange={(v) => setType((normalizeSectionType(v ?? "") ?? "hero_cta"))}
            data={[
              ...SECTION_TYPES.map((t) => ({ value: t, label: sectionTypeDefaults[t]?.label ?? t })),
              ...customTypes,
            ]}
          />
          <Button onClick={createGlobal}>Create</Button>
        </Group>
        {error ? <Alert severity="error" variant="outlined" sx={{ mt: 1 }}>{error}</Alert> : null}
      </WorkspacePanel>

      <WorkspacePanel title="Site-Wide Formatting" description="These settings apply to the live site immediately when saved. No publish step required.">
        <Stack>

          <Paper withBorder p="sm" radius="md">
            <Stack gap="sm">
              <Text fw={600} size="sm">Templates</Text>
              <Select
                label="Template"
                value={selectedTemplateId}
                onChange={setSelectedTemplateId}
                data={templates.map((t) => ({ value: t.id, label: `${t.name}${t.is_system ? " (System)" : ""}` }))}
                placeholder="Select a template"
                searchable
              />
              <Group justify="space-between" align="center" wrap="wrap" gap="xs">
                <Button variant="default" disabled={!selectedTemplate} loading={templateBusy} onClick={() => setApplyTemplateConfirmOpen(true)}>
                  Apply template
                </Button>
                {!customizeOpen ? (
                  <Button variant="light" onClick={() => setCustomizeOpen(true)}>
                    Customize
                  </Button>
                ) : (
                  <ActionIcon variant="default" aria-label="Close customization" onClick={() => setCustomizeOpen(false)}>
                    ×
                  </ActionIcon>
                )}
              </Group>

              {hasUnsavedCustomizeChanges ? (
                <Text size="xs" c="yellow">Unsaved customization changes</Text>
              ) : null}

              {customizeOpen ? (
                <Stack gap="sm">
                  <TextInput
                    label="Selected template name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.currentTarget.value)}
                    placeholder="Executive Slate"
                    disabled={Boolean(selectedTemplate?.is_system)}
                  />
                  <TextInput
                    label="Selected template description (optional)"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.currentTarget.value)}
                    placeholder="Professional high-contrast dark theme"
                    disabled={Boolean(selectedTemplate?.is_system)}
                  />
                  <TextInput
                    label="New template name"
                    value={newTemplateName}
                    onChange={(e) => setNewTemplateName(e.currentTarget.value)}
                    placeholder="My Professional Theme"
                  />
                  <TextInput
                    label="New template description (optional)"
                    value={newTemplateDescription}
                    onChange={(e) => setNewTemplateDescription(e.currentTarget.value)}
                    placeholder="Saved from current global formatting"
                  />
                  <Group gap="xs" wrap="wrap">
                    <Button variant="light" loading={templateBusy} disabled={!newTemplateName.trim()} onClick={saveTemplateAsNew}>
                      Save current as template
                    </Button>
                    <Button
                      variant="default"
                      disabled={!selectedTemplate || selectedTemplate.is_system}
                      loading={templateBusy}
                      onClick={updateSelectedTemplate}
                    >
                      Update selected template
                    </Button>
                    <Button
                      color="red"
                      variant="light"
                      disabled={!selectedTemplate || selectedTemplate.is_system}
                      loading={templateBusy}
                      onClick={deleteSelectedTemplate}
                    >
                      Delete selected template
                    </Button>
                  </Group>
                  <Text size="xs" c="dimmed">System templates are read-only. User templates are editable.</Text>

                  <Divider />
                  <AdminSubgroupHeader label="Typography" />
                  <Select label="Font family" value={fontFamily} onChange={(v) => setFontFamily(v ?? FONT_STACKS[0].value)} data={[...FONT_STACKS, { value: "__custom", label: "Custom…" }]} />
                  {fontFamily === "__custom" ? <TextInput label="Custom font stack" value={customFontFamily} onChange={(e) => setCustomFontFamily(e.currentTarget.value)} placeholder="'Your Font', Inter, system-ui, sans-serif" /> : null}
                  <Select
                    label="Display font"
                    value={displayFontFamily}
                    onChange={(v) => setDisplayFontFamily(v ?? "var(--font-space-grotesk)")}
                    data={[
                      { value: "var(--font-space-grotesk)", label: "Space Grotesk" },
                      { value: "var(--font-inter)", label: "Inter" },
                      { value: "var(--font-manrope)", label: "Manrope" },
                      { value: "var(--font-dm-sans)", label: "DM Sans" },
                      { value: "var(--font-montserrat)", label: "Montserrat" },
                      { value: "var(--font-poppins)", label: "Poppins" },
                    ]}
                  />
                  <Select
                    label="Body font"
                    value={bodyFontFamily}
                    onChange={(v) => setBodyFontFamily(v ?? "var(--font-ibm-plex-sans)")}
                    data={[
                      { value: "var(--font-ibm-plex-sans)", label: "IBM Plex Sans" },
                      { value: "var(--font-inter)", label: "Inter" },
                      { value: "var(--font-dm-sans)", label: "DM Sans" },
                      { value: "var(--font-work-sans)", label: "Work Sans" },
                      { value: "var(--font-source-sans-3)", label: "Source Sans 3" },
                      { value: "var(--font-open-sans)", label: "Open Sans" },
                    ]}
                  />
                  <Select
                    label="Mono / data font"
                    value={monoFontFamily}
                    onChange={(v) => setMonoFontFamily(v ?? "var(--font-ibm-plex-mono)")}
                    data={[
                      { value: "var(--font-ibm-plex-mono)", label: "IBM Plex Mono" },
                      { value: "var(--font-jetbrains-mono)", label: "JetBrains Mono" },
                      { value: "var(--font-geist-mono)", label: "Geist Mono" },
                    ]}
                  />
                  <Divider />
                  <AdminSubgroupHeader label="Type Scales & Weights" />
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Font scale ({fontScale.toFixed(2)}x)</Text>
                    <Slider label={(v) => `${v.toFixed(2)}x`} min={0.8} max={1.4} step={0.05} value={fontScale} onChange={setFontScale} />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Space scale ({spaceScale.toFixed(2)}x)</Text>
                    <Slider label={(v) => `${v.toFixed(2)}x`} min={0.7} max={1.6} step={0.05} value={spaceScale} onChange={setSpaceScale} />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Radius scale ({radiusScale.toFixed(2)}x)</Text>
                    <Slider label={(v) => `${v.toFixed(2)}x`} min={0} max={1.8} step={0.05} value={radiusScale} onChange={setRadiusScale} />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Shadow scale ({shadowScale.toFixed(2)}x)</Text>
                    <Slider label={(v) => `${v.toFixed(2)}x`} min={0} max={1.8} step={0.05} value={shadowScale} onChange={setShadowScale} />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Inner bevel/glow scale ({innerShadowScale.toFixed(2)}x)</Text>
                    <Slider label={(v) => `${v.toFixed(2)}x`} min={0} max={1.8} step={0.05} value={innerShadowScale} onChange={setInnerShadowScale} />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Display scale ({displayScale.toFixed(2)}x)</Text>
                    <Slider label={(v) => `${v.toFixed(2)}x`} min={0.8} max={1.6} step={0.05} value={displayScale} onChange={setDisplayScale} />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Heading scale ({headingScale.toFixed(2)}x)</Text>
                    <Slider label={(v) => `${v.toFixed(2)}x`} min={0.8} max={1.4} step={0.05} value={headingScale} onChange={setHeadingScale} />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Eyebrow scale ({eyebrowScale.toFixed(2)}x)</Text>
                    <Slider label={(v) => `${v.toFixed(2)}x`} min={0.6} max={1.4} step={0.05} value={eyebrowScale} onChange={setEyebrowScale} />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Metric scale ({metricScale.toFixed(2)}x)</Text>
                    <Slider label={(v) => `${v.toFixed(2)}x`} min={0.8} max={1.6} step={0.05} value={metricScale} onChange={setMetricScale} />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Body scale ({bodyScale.toFixed(2)}x)</Text>
                    <Slider label={(v) => `${v.toFixed(2)}x`} min={0.8} max={1.4} step={0.05} value={bodyScale} onChange={setBodyScale} />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Display weight ({displayWeight})</Text>
                    <Slider label={(v) => String(v)} min={300} max={900} step={100} value={displayWeight} onChange={setDisplayWeight} />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Heading weight ({headingWeight})</Text>
                    <Slider label={(v) => String(v)} min={300} max={900} step={100} value={headingWeight} onChange={setHeadingWeight} />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Body weight ({bodyWeight})</Text>
                    <Slider label={(v) => String(v)} min={300} max={700} step={100} value={bodyWeight} onChange={setBodyWeight} />
                  </Stack>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                    <TextInput label="Display tracking" value={displayTracking} onChange={(e) => setDisplayTracking(e.currentTarget.value)} placeholder="-0.035em" />
                    <TextInput label="Eyebrow tracking" value={eyebrowTracking} onChange={(e) => setEyebrowTracking(e.currentTarget.value)} placeholder="0.12em" />
                    <TextInput label="Metric tracking" value={metricTracking} onChange={(e) => setMetricTracking(e.currentTarget.value)} placeholder="-0.02em" />
                  </div>
                  <Divider />
                  <AdminSubgroupHeader label="Colors" />
                  <Select
                    label="Color mode"
                    value={colorMode}
                    onChange={(v) => setColorMode(v || "dark")}
                    data={[
                      { value: "dark", label: "Dark" },
                      { value: "light", label: "Light" },
                    ]}
                  />
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-6">
                    <ColorInput label="Text color" value={textColor} onChange={setTextColor} placeholder="#111827" />
                    <ColorInput label="Muted text color" value={mutedTextColor} onChange={setMutedTextColor} placeholder="#6b7280" />
                    <ColorInput label="Accent color" value={accentColor} onChange={setAccentColor} placeholder="#4f46e5" />
                    <ColorInput label="Shadow color" value={shadowColor} onChange={setShadowColor} placeholder="#111827" />
                    <ColorInput label="Background color" value={backgroundColor} onChange={setBackgroundColor} placeholder="#ffffff" />
                    <ColorInput label="Card background color" value={cardBackgroundColor} onChange={setCardBackgroundColor} placeholder="#1f2937" />
                  </div>

                  <Divider />
                  <AdminSubgroupHeader label="Brand Signature" />
                  <Select
                    label="Signature style"
                    value={signatureStyle}
                    onChange={(v) => setSignatureStyle(v ?? "off")}
                    data={[
                      { value: "off", label: "Off" },
                      { value: "obsidian_signal", label: "Obsidian Signal" },
                      { value: "grid_rays", label: "Grid Rays" },
                      { value: "topographic_dark", label: "Topographic Dark" },
                    ]}
                  />
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Signature intensity ({signatureIntensity.toFixed(2)})</Text>
                    <Slider label={(v) => v.toFixed(2)} min={0} max={1} step={0.05} value={signatureIntensity} onChange={setSignatureIntensity} />
                  </Stack>
                  <TextInput label="Signature color" value={signatureColor} onChange={(e) => setSignatureColor(e.currentTarget.value)} placeholder="rgba(120,140,255,0.08)" />
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Grid opacity ({signatureGridOpacity.toFixed(2)})</Text>
                    <Slider label={(v) => v.toFixed(2)} min={0} max={0.5} step={0.01} value={signatureGridOpacity} onChange={setSignatureGridOpacity} />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Glow opacity ({signatureGlowOpacity.toFixed(2)})</Text>
                    <Slider label={(v) => v.toFixed(2)} min={0} max={0.5} step={0.01} value={signatureGlowOpacity} onChange={setSignatureGlowOpacity} />
                  </Stack>
                  <Stack gap={4}>
                    <Text size="sm" fw={500}>Noise opacity ({signatureNoiseOpacity.toFixed(2)})</Text>
                    <Slider label={(v) => v.toFixed(2)} min={0} max={0.3} step={0.01} value={signatureNoiseOpacity} onChange={setSignatureNoiseOpacity} />
                  </Stack>
                </Stack>
              ) : null}
            </Stack>
          </Paper>

          <Paper withBorder p="sm" radius="md" style={{ fontFamily: effectiveFontFamily || undefined, fontSize: `${fontScale}rem`, color: textColor || undefined, background: backgroundColor || undefined }}>
            <Text fw={600} size="sm" c="dimmed">Live Preview</Text>
            <Text size="xs" c="dimmed">Shows how current token values render on the frontend</Text>
            <Stack gap={Math.max(6, Math.round(spaceScale * 8))} mt={8}>
              <div style={{ padding: `${Math.round(spaceScale * 12)}px`, borderRadius: `${Math.round(radiusScale * 10)}px`, boxShadow: `${shadowScale <= 0 ? "none" : `0 ${Math.round(10 * shadowScale)}px ${Math.round(28 * shadowScale)}px color-mix(in srgb, ${shadowColor || accentColor || "#000"} 36%, transparent)`}${innerShadowScale > 0 ? `${shadowScale > 0 ? ", " : ""}inset 0 1px ${Math.max(1, Math.round(2 * innerShadowScale))}px color-mix(in srgb, white 26%, transparent), inset 0 ${Math.max(2, Math.round(12 * innerShadowScale))}px ${Math.max(6, Math.round(20 * innerShadowScale))}px -${Math.max(2, Math.round(10 * innerShadowScale))}px color-mix(in srgb, ${shadowColor || accentColor || "#000"} 30%, transparent)` : ""}`,
                border: `1px solid ${accentColor ? `color-mix(in srgb, ${accentColor} 45%, transparent)` : "rgba(127,127,127,.35)"}`, background: cardBackgroundColor || undefined }}>
                Shadow + radius sample card
              </div>
              <div style={{ paddingInline: `${Math.round(spaceScale * 16)}px`, paddingBlock: `${Math.round(spaceScale * 10)}px`, borderRadius: `${Math.round(radiusScale * 8)}px`, border: "1px dashed rgba(127,127,127,.45)", background: cardBackgroundColor || undefined }}>
                Spacing sample block (tracks spaceScale)
              </div>
            </Stack>
          </Paper>

        </Stack>
      </WorkspacePanel>

      <WorkspacePanel title="Sections & Impact" description="Manage global sections, see where they're used, and preview impact.">
        <Stack>
          {loading ? <AdminLoadingState message="Loading global sections…" /> : (
            <>
              <Stack gap="sm" className="sm:hidden">
                {rows.map((row) => {
                  const impact = impactByGlobalId[row.id]
                  const usage = usageByGlobalId[row.id] ?? []
                  return (
                    <Paper key={row.id} withBorder p="sm" radius="md">
                      <Group justify="space-between" align="start" wrap="nowrap" gap="xs">
                        <Stack gap={2} style={{ minWidth: 0, flex: 1 }}>
                          <Group gap="xs" wrap="nowrap">
                            <Badge variant="default">{row.section_type}</Badge>
                            <Text fw={600} lineClamp={1}>{row.key}</Text>
                          </Group>
                          {row.label ? <Text size="xs" c="dimmed" lineClamp={2}>{row.label}</Text> : null}
                        </Stack>
                        {renderSectionActions(row)}
                      </Group>

                      <Stack gap={4} mt="sm">
                        <Text size="xs">
                          State: <Badge size="xs" color={row.lifecycle_state === "published" ? "teal" : row.lifecycle_state === "archived" ? "gray" : "yellow"} variant="light">{row.lifecycle_state ?? "draft"}</Badge>
                        </Text>
                        <Text size="xs">{impact?.enabled_references ?? 0} enabled refs</Text>
                        <Text size="xs" c="dimmed">{impact?.distinct_pages ?? 0} pages • {impact?.total_references ?? 0} total refs</Text>
                        <Stack gap={2}>
                          {usage.slice(0, 2).map((u, idx) => <Text key={`${u.page_slug}-${idx}`} size="xs">/{u.page_slug}{u.section_key ? `#${u.section_key}` : ""}</Text>)}
                          {usage.length > 2 ? <Text size="xs" c="dimmed">+{usage.length - 2} more</Text> : null}
                        </Stack>
                      </Stack>
                    </Paper>
                  )
                })}
              </Stack>

              <div className="hidden sm:block">
                <TableContainer component={Box}>
                  <MuiTable
                    size="small"
                    sx={{
                      "& tbody tr:nth-of-type(odd)": { backgroundColor: "action.hover" },
                      "& tbody tr:hover": { backgroundColor: "action.selected" },
                    }}
                  >
                    <MuiTableHead>
                      <MuiTableRow>
                        <MuiTableCell sx={{ fontWeight: 700 }}>Section</MuiTableCell>
                        <MuiTableCell sx={{ fontWeight: 700 }}>State</MuiTableCell>
                        <MuiTableCell sx={{ fontWeight: 700 }}>Impact</MuiTableCell>
                        <MuiTableCell sx={{ fontWeight: 700 }}>Used on</MuiTableCell>
                        <MuiTableCell sx={{ width: "1%", whiteSpace: "nowrap" }} />
                      </MuiTableRow>
                    </MuiTableHead>
                    <MuiTableBody>
                    {rows.map((row) => {
                      const impact = impactByGlobalId[row.id]
                      const usage = usageByGlobalId[row.id] ?? []
                      return (
                        <MuiTableRow key={row.id}>
                          <MuiTableCell>
                            <Group gap="xs"><Badge variant="default">{row.section_type}</Badge><Text fw={600}>{row.key}</Text></Group>
                            {row.label ? <Text size="xs" c="dimmed">{row.label}</Text> : null}
                          </MuiTableCell>
                          <MuiTableCell><Badge color={row.lifecycle_state === "published" ? "teal" : row.lifecycle_state === "archived" ? "gray" : "yellow"} variant="light">{row.lifecycle_state ?? "draft"}</Badge></MuiTableCell>
                          <MuiTableCell><Text size="sm">{impact?.enabled_references ?? 0} enabled refs</Text><Text size="xs" c="dimmed">{impact?.distinct_pages ?? 0} pages • {impact?.total_references ?? 0} total refs</Text></MuiTableCell>
                          <MuiTableCell>
                            <Stack gap={2}>
                              {usage.slice(0, 3).map((u, idx) => <Text key={`${u.page_slug}-${idx}`} size="xs">/{u.page_slug}{u.section_key ? `#${u.section_key}` : ""}</Text>)}
                              {usage.length > 3 ? <Text size="xs" c="dimmed">+{usage.length - 3} more</Text> : null}
                            </Stack>
                          </MuiTableCell>
                          <MuiTableCell align="right">
                            <Group gap="xs" justify="end">
                              {renderSectionActions(row)}
                            </Group>
                          </MuiTableCell>
                        </MuiTableRow>
                      )
                    })}
                    </MuiTableBody>
                  </MuiTable>
                </TableContainer>
              </div>
            </>
          )}
          <Divider />
          <Text size="xs" c="dimmed">Global editor supports draft → publish flow with version rollback.</Text>
        </Stack>
      </WorkspacePanel>

      <Modal
        opened={applyTemplateConfirmOpen}
        onClose={() => (templateBusy ? null : setApplyTemplateConfirmOpen(false))}
        title="Apply template to global settings?"
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            This will overwrite current site-wide formatting tokens with the selected template.
          </Text>
          {selectedTemplate ? (
            <Paper withBorder p="sm" radius="md">
              <Text fw={600} size="sm">{selectedTemplate.name}</Text>
              {selectedTemplate.description ? <Text size="xs" c="dimmed">{selectedTemplate.description}</Text> : null}
            </Paper>
          ) : null}
          <Group justify="end">
            <Button variant="default" disabled={templateBusy} onClick={() => setApplyTemplateConfirmOpen(false)}>
              Cancel
            </Button>
            <Button loading={templateBusy} disabled={!selectedTemplate} onClick={applySelectedTemplate}>
              Confirm apply
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={Boolean(attachTarget)}
        onClose={() => (attachLoading ? null : setAttachTarget(null))}
        title="Attach global section to page(s)"
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            Attaching creates a page section reference with page-specific ordering and global single-source content.
          </Text>
          {attachTarget ? (
            <Paper withBorder p="sm" radius="md">
              <Group gap="xs" wrap="wrap">
                <Badge variant="default">{attachTarget.section_type}</Badge>
                <Text fw={600} size="sm">{attachTarget.key}</Text>
              </Group>
            </Paper>
          ) : null}
          <MultiSelect
            label="Pages"
            placeholder="Select one or more pages"
            searchable
            value={attachPageIds}
            onChange={setAttachPageIds}
            data={pages.map((p) => ({ value: p.id, label: `${p.title} (${p.slug})` }))}
          />
          <Group justify="end">
            <Button variant="default" disabled={attachLoading} onClick={() => setAttachTarget(null)}>
              Cancel
            </Button>
            <Button loading={attachLoading} disabled={!attachPageIds.length} onClick={() => void attachGlobalToPages()}>
              Attach
            </Button>
          </Group>
        </Stack>
      </Modal>

      <Modal
        opened={Boolean(deleteTarget)}
        onClose={() => (deleteLoading ? null : setDeleteTarget(null))}
        title="Delete global section?"
        centered
      >
        <Stack gap="sm">
          <Text size="sm">
            This deletes the global section and its versions. Linked page sections must be detached first.
          </Text>
          {deleteTarget ? (
            <Paper withBorder p="sm" radius="md">
              <Stack gap={4}>
                <Group gap="xs">
                  <Badge variant="default">{deleteTarget.section_type}</Badge>
                  <Text size="sm" fw={600}>{deleteTarget.key}</Text>
                </Group>
                {deleteTarget.label ? <Text size="xs" c="dimmed">{deleteTarget.label}</Text> : null}
                <Text size="xs" c="dimmed">
                  Impact: {impactByGlobalId[deleteTarget.id]?.enabled_references ?? 0} enabled refs • {impactByGlobalId[deleteTarget.id]?.distinct_pages ?? 0} pages
                </Text>
              </Stack>
            </Paper>
          ) : null}
          <Group justify="end">
            <Button variant="default" onClick={() => setDeleteTarget(null)} disabled={deleteLoading}>
              Cancel
            </Button>
            <Button color="red" onClick={() => void removeGlobal()} loading={deleteLoading}>
              Delete
            </Button>
          </Group>
        </Stack>
      </Modal>

      <SectionEditorDrawer
        opened={editorOpen}
        section={editing}
        onClose={() => setEditorOpen(false)}
        onChanged={load}
        typeDefaults={sectionTypeDefaults}
        scope="global"
      />
    </Stack>
  )
}
