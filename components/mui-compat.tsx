"use client"

import React, { createContext, useContext, useMemo, useState, type PropsWithChildren } from "react"
import {
  Box,
  Badge as MuiBadge,
  Button as MuiButton,
  Checkbox as MuiCheckbox,
  Divider,
  Drawer as MuiDrawer,
  CircularProgress,
  Paper as MuiPaper,
  Popover as MuiPopover,
  Slider as MuiSlider,
  Table as MuiTable,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TextField,
  Typography,
  Grid,
  Stack as MuiStack,
  IconButton,
  Menu as MuiMenu,
  MenuItem,
  ListSubheader,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Select as MuiSelect,
  FormControl,
  InputLabel,
  FormControlLabel,
} from "@mui/material"

export { Box, Divider }

function TableRoot({ children, withTableBorder, style, ...props }: any) {
  return (
    <MuiTable
      size="small"
      sx={{ border: withTableBorder ? "1px solid" : undefined, borderColor: "divider" }}
      style={style}
      {...props}
    >
      {children}
    </MuiTable>
  )
}

export const Table = Object.assign(TableRoot, {
  Thead: TableHead,
  Tbody: TableBody,
  Tr: TableRow,
  Th: (props: any) => <TableCell {...props} />, 
  Td: (props: any) => <TableCell {...props} />, 
})

export function Checkbox({
  label,
  checked,
  onChange,
  ...props
}: {
  label?: React.ReactNode
  checked?: boolean
  onChange?: React.ChangeEventHandler<HTMLInputElement>
  [key: string]: any
}) {
  const control = <MuiCheckbox checked={checked} onChange={onChange} {...props} />
  return label ? <FormControlLabel control={control} label={label} /> : control
}

export function Slider({
  label,
  value,
  onChange,
  ...props
}: {
  label?: (value: number) => string
  value?: number
  onChange?: (value: number) => void
  [key: string]: any
}) {
  return (
    <MuiSlider
      value={value ?? 0}
      onChange={(_, v) => onChange?.(Array.isArray(v) ? v[0] : v)}
      valueLabelDisplay={label ? "auto" : props.valueLabelDisplay}
      valueLabelFormat={label ? (v) => label(v as number) : props.valueLabelFormat}
      {...props}
    />
  )
}

export function Paper({ children, withBorder, p, radius, ...props }: any) {
  const padding = p === "xs" ? 1 : p === "sm" ? 1.5 : p === "md" ? 2 : p
  const borderRadius = radius === "sm" ? 1 : radius === "md" ? 2 : radius === "lg" ? 3 : undefined
  return (
    <MuiPaper
      variant={withBorder ? "outlined" : "elevation"}
      sx={{ p: padding, borderRadius }}
      {...props}
    >
      {children}
    </MuiPaper>
  )
}

export function Badge({ children, color, variant, size, ...props }: any) {
  const colorMap: Record<string, any> = {
    gray: "default",
    teal: "success",
    yellow: "warning",
  }
  const mappedColor = colorMap[color] ?? color
  const mappedVariant = variant === "light" ? "standard" : variant
  return (
    <MuiBadge
      color={mappedColor}
      variant={mappedVariant}
      {...props}
    >
      <Typography variant={size === "xs" ? "caption" : "body2"}>{children}</Typography>
    </MuiBadge>
  )
}

export function Button({
  children,
  variant,
  size,
  leftSection,
  rightSection,
  ...props
}: any) {
  const mappedVariant = variant === "subtle" ? "text" : variant === "default" ? "outlined" : variant
  const mappedSize = size === "xs" ? "small" : size
  return (
    <MuiButton
      variant={mappedVariant}
      size={mappedSize}
      startIcon={leftSection}
      endIcon={rightSection}
      {...props}
    >
      {children}
    </MuiButton>
  )
}

export function Loader(props: any) {
  const size = props?.size === "xs" ? 14 : props?.size === "sm" ? 18 : 22
  return <CircularProgress size={size} />
}

export function ActionIcon({ children, ...props }: any) {
  return <IconButton size="small" {...props}>{children}</IconButton>
}

export function Group({ children, gap = "sm", justify, align, wrap, ...props }: any) {
  const spacing = gap === "xs" ? 0.5 : gap === "sm" ? 1 : gap === "md" ? 1.5 : 2
  const flexWrap = wrap === "nowrap" ? "nowrap" : wrap === "wrap" ? "wrap" : "wrap"
  return (
    <MuiStack
      direction="row"
      spacing={spacing}
      alignItems={align}
      justifyContent={justify}
      useFlexGap
      flexWrap={flexWrap}
      {...props}
    >
      {children}
    </MuiStack>
  )
}

export function Stack({ children, gap = "sm", ...props }: any) {
  const spacing = gap === "xs" ? 0.5 : gap === "sm" ? 1 : gap === "md" ? 1.5 : 2
  return <MuiStack spacing={spacing} {...props}>{children}</MuiStack>
}

export function Text({ children, size = "sm", fw, c, ...props }: any) {
  const variant = size === "xs" ? "caption" : size === "sm" ? "body2" : "body1"
  return (
    <Typography
      variant={variant}
      fontWeight={fw}
      color={c === "dimmed" ? "text.secondary" : c}
      {...props}
    >
      {children}
    </Typography>
  )
}

export function Title({ children, order = 4, ...props }: any) {
  const variant = order <= 3 ? "h6" : "subtitle1"
  return <Typography variant={variant} {...props}>{children}</Typography>
}

export function TextInput({
  label,
  value,
  onChange,
  placeholder,
  rightSection,
  mb,
  ...props
}: {
  label?: React.ReactNode
  value?: any
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  placeholder?: string
  rightSection?: React.ReactNode
  mb?: any
  [key: string]: any
}) {
  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      margin={mb ? "dense" : undefined}
      InputProps={rightSection ? { endAdornment: rightSection } : undefined}
      {...props}
    />
  )
}

export function Textarea({
  label,
  value,
  onChange,
  minRows = 3,
  ...props
}: {
  label?: React.ReactNode
  value?: any
  onChange?: React.ChangeEventHandler<HTMLInputElement | HTMLTextAreaElement>
  minRows?: number
  [key: string]: any
}) {
  return (
    <TextField
      fullWidth
      size="small"
      multiline
      minRows={minRows}
      label={label}
      value={value}
      onChange={onChange}
      {...props}
    />
  )
}

export function SimpleGrid({ cols = 2, spacing = "sm", children, ...props }: any) {
  const gap = spacing === "xs" ? 1 : spacing === "sm" ? 1.5 : 2
  const colsBase = typeof cols === "object" ? Number(cols.base ?? 1) : Number(cols)
  const colsSm = typeof cols === "object" ? Number(cols.sm ?? colsBase) : Number(cols)
  const safeBase = Number.isFinite(colsBase) && colsBase > 0 ? colsBase : 1
  const safeSm = Number.isFinite(colsSm) && colsSm > 0 ? colsSm : safeBase

  return (
    <Grid container spacing={gap} {...props}>
      {React.Children.map(children, (child) => (
        <Grid
          size={{
            xs: Math.max(1, Math.floor(12 / safeBase)),
            sm: Math.max(1, Math.floor(12 / safeSm)),
          }}
        >
          {child}
        </Grid>
      ))}
    </Grid>
  )
}

export function ScrollArea({ children, style, ...props }: any) {
  return <Box style={{ overflow: "auto", ...style }} {...props}>{children}</Box>
}

export function Select({ label, data = [], value, onChange, ...props }: any) {
  return (
    <FormControl fullWidth size="small">
      {label ? <InputLabel>{label}</InputLabel> : null}
      <MuiSelect
        label={label}
        value={value ?? ""}
        onChange={(e) => onChange?.(e.target.value)}
        {...props}
      >
        {data.map((item: any) => {
          const option = typeof item === "string" ? { value: item, label: item } : item
          return (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          )
        })}
      </MuiSelect>
    </FormControl>
  )
}

export function SegmentedControl({
  data = [],
  value,
  onChange,
  ...props
}: {
  data?: Array<string | { value: string; label: string }>
  value?: string
  onChange?: (value: string) => void
  [key: string]: any
}) {
  return (
    <Group gap="xs" {...props}>
      {data.map((item: any) => {
        const option = typeof item === "string" ? { value: item, label: item } : item
        const selected = option.value === value
        return (
          <Button
            key={option.value}
            size="small"
            variant={selected ? "contained" : "outlined"}
            onClick={() => onChange?.(option.value)}
          >
            {option.label}
          </Button>
        )
      })}
    </Group>
  )
}

export function Drawer({ opened, onClose, title, position = "right", size = "xl", children, styles: _styles, classNames: _classNames, ...props }: any) {
  const isFullScreen = size === "100%"
  const width = isFullScreen ? "100vw" : size === "xl" ? 920 : size === "lg" ? 760 : size === "md" ? 620 : 480
  return (
    <MuiDrawer
      open={!!opened}
      onClose={onClose}
      anchor={position === "left" ? "left" : "right"}
      PaperProps={{ sx: { width: isFullScreen ? "100vw" : { xs: "100vw", sm: width } } }}
      {...props}
    >
      {title ? <Box p={2} borderBottom="1px solid" borderColor="divider">{title}</Box> : null}
      {isFullScreen ? (
        <Box sx={{ flex: 1, overflow: "hidden", height: "100%" }}>{children}</Box>
      ) : (
        <Box p={2} sx={{ overflow: "auto", height: "100%" }}>{children}</Box>
      )}
    </MuiDrawer>
  )
}

export function Modal({ opened, onClose, title, children, ...props }: any) {
  return (
    <Dialog open={!!opened} onClose={onClose} fullWidth maxWidth="md" {...props}>
      {title ? <DialogTitle>{title}</DialogTitle> : null}
      <DialogContent>{children}</DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  )
}

type PopoverCtxType = {
  opened: boolean
  setOpened: (v: boolean) => void
  anchorEl: HTMLElement | null
  setAnchorEl: (el: HTMLElement | null) => void
}

const PopoverCtx = createContext<PopoverCtxType | null>(null)

function PopoverRoot({ children }: PropsWithChildren<any>) {
  const [opened, setOpened] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const value = useMemo(() => ({ opened, setOpened, anchorEl, setAnchorEl }), [opened, anchorEl])
  return <PopoverCtx.Provider value={value}>{children}</PopoverCtx.Provider>
}

function PopoverTarget({ children }: PropsWithChildren) {
  const ctx = useContext(PopoverCtx)
  if (!ctx) throw new Error("Popover.Target must be inside Popover")
  const child = React.Children.only(children) as React.ReactElement<any>
  return React.cloneElement(child, {
    onClick: (e: any) => {
      ctx.setAnchorEl(e.currentTarget)
      ctx.setOpened(!ctx.opened)
      child.props?.onClick?.(e)
    },
  })
}

function PopoverDropdown({ children }: PropsWithChildren<any>) {
  const ctx = useContext(PopoverCtx)
  if (!ctx) throw new Error("Popover.Dropdown must be inside Popover")
  return (
    <MuiPopover
      open={ctx.opened}
      anchorEl={ctx.anchorEl}
      onClose={() => ctx.setOpened(false)}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      transformOrigin={{ vertical: "top", horizontal: "right" }}
    >
      <Box p={1.5}>{children}</Box>
    </MuiPopover>
  )
}

export const Popover = Object.assign(PopoverRoot, {
  Target: PopoverTarget,
  Dropdown: PopoverDropdown,
})

type MenuCtxType = {
  opened: boolean
  setOpened: (v: boolean) => void
  anchorEl: HTMLElement | null
  setAnchorEl: (el: HTMLElement | null) => void
  onChange?: (v: boolean) => void
}

const MenuCtx = createContext<MenuCtxType | null>(null)

function useMenuCtx() {
  const ctx = useContext(MenuCtx)
  if (!ctx) throw new Error("Menu components must be used inside Menu")
  return ctx
}

function MenuRoot({ children, opened, onChange }: any) {
  const [internalOpened, setInternalOpened] = useState(false)
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null)
  const isControlled = typeof opened === "boolean"
  const actualOpened = isControlled ? opened : internalOpened

  const setOpened = (v: boolean) => {
    if (!isControlled) setInternalOpened(v)
    onChange?.(v)
  }

  const value = useMemo(
    () => ({ opened: actualOpened, setOpened, anchorEl, setAnchorEl, onChange }),
    [actualOpened, anchorEl, onChange]
  )

  return <MenuCtx.Provider value={value}>{children}</MenuCtx.Provider>
}

function MenuTarget({ children }: PropsWithChildren) {
  const ctx = useMenuCtx()
  const child = React.Children.only(children) as React.ReactElement<any>
  return React.cloneElement(child, {
    onClick: (e: any) => {
      ctx.setAnchorEl(e.currentTarget)
      ctx.setOpened(!ctx.opened)
      child.props?.onClick?.(e)
    },
  })
}

function MenuDropdown({ children }: PropsWithChildren) {
  const ctx = useMenuCtx()
  return (
    <MuiMenu
      open={ctx.opened}
      anchorEl={ctx.anchorEl}
      onClose={() => ctx.setOpened(false)}
    >
      {children}
    </MuiMenu>
  )
}

function MenuItemCompat({ closeMenuOnClick = true, onClick, children, leftSection, disabled, ...props }: any) {
  const ctx = useMenuCtx()
  return (
    <MenuItem
      disabled={disabled}
      onClick={(e) => {
        onClick?.(e)
        if (closeMenuOnClick) ctx.setOpened(false)
      }}
      {...props}
    >
      {leftSection ? <Box mr={1} display="inline-flex">{leftSection}</Box> : null}
      {children}
    </MenuItem>
  )
}

function MenuLabel({ children }: PropsWithChildren) {
  return <ListSubheader disableSticky>{children}</ListSubheader>
}

export const Menu = Object.assign(MenuRoot, {
  Target: MenuTarget,
  Dropdown: MenuDropdown,
  Item: MenuItemCompat,
  Label: MenuLabel,
  Divider,
})
