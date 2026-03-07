import { IconButton, type BoxProps, type IconButtonProps, type SxProps, type Theme } from "@mui/material"

export type AdminUiSpace = "xs" | "sm" | "md" | "lg" | "xl" | number
export type AdminUiRadius = "xs" | "sm" | "md" | "lg" | "xl"
export type AdminUiAlign = "start" | "center" | "end" | "stretch"
export type AdminUiJustify = "start" | "center" | "end" | "space-between" | "space-around" | "space-evenly"

export type AdminSelectDataItem = { value: string; label: string }
export type AdminSelectData = string[] | AdminSelectDataItem[]

export const ADMIN_UI_SPACE_MAP: Record<Exclude<AdminUiSpace, number>, string> = {
  xs: "8px",
  sm: "12px",
  md: "16px",
  lg: "24px",
  xl: "32px",
}

export const ADMIN_UI_RADIUS_MAP: Record<AdminUiRadius, string> = {
  xs: "4px",
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "999px",
}

export function toCssSpace(value?: AdminUiSpace): string | undefined {
  if (value === undefined) return undefined
  return typeof value === "number" ? `${value}px` : ADMIN_UI_SPACE_MAP[value]
}

export function toCssRadius(value?: AdminUiRadius): string | undefined {
  if (!value) return undefined
  return ADMIN_UI_RADIUS_MAP[value]
}

export function toFlexAlign(value?: AdminUiAlign): BoxProps["alignItems"] {
  if (value === "start") return "flex-start"
  if (value === "end") return "flex-end"
  if (value === "stretch") return "stretch"
  return value ?? "center"
}

export function toFlexJustify(value?: AdminUiJustify): BoxProps["justifyContent"] {
  if (value === "start") return "flex-start"
  if (value === "end") return "flex-end"
  return value ?? "flex-start"
}

export function normalizeSelectData(data: AdminSelectData): AdminSelectDataItem[] {
  if (!data.length) return []
  if (typeof data[0] === "string") {
    return (data as string[]).map((item) => ({ value: item, label: item }))
  }
  return data as AdminSelectDataItem[]
}

export function toMuiButtonVariant(variant?: "filled" | "light" | "default" | "subtle") {
  return variant === "light" || variant === "default" ? "outlined" : variant === "subtle" ? "text" : "contained"
}

export function toMuiControlSize(size?: "xs" | "sm" | "md") {
  return size === "xs" || size === "sm" ? "small" : "medium"
}

type AdminActionIconProps = Omit<IconButtonProps, "color" | "size"> & {
  color?: "red" | "gray" | "dark"
  size?: "xs" | "sm" | "md"
  variant?: "subtle" | "default"
}

export function AdminActionIcon({ color, size, variant, sx, ...props }: AdminActionIconProps) {
  const muiSize: IconButtonProps["size"] = toMuiControlSize(size)
  const muiColor: IconButtonProps["color"] = color === "red" ? "error" : "default"

  return (
    <IconButton
      size={muiSize}
      color={muiColor}
      sx={{
        ...(variant === "default"
          ? {
              border: "1px solid",
              borderColor: "divider",
              borderRadius: "8px",
            }
          : null),
        ...(sx as SxProps<Theme>),
      }}
      {...props}
    />
  )
}
