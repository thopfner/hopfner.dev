"use client"

import React from "react"
import { ActionIcon, Group, TextInput } from "@/components/mui-compat"
import { IconX } from "@tabler/icons-react"
import { useBufferedField } from "../hooks/use-buffered-field"

type Props = {
  index: number
  value: string
  label: string
  onChangeValue: (index: number, value: string) => void
  onChangeLabel: (index: number, value: string) => void
  onRemove: (index: number) => void
}

export const HeroProofPanelRow = React.memo(function HeroProofPanelRow({
  index,
  value,
  label,
  onChangeValue,
  onChangeLabel,
  onRemove,
}: Props) {
  const valueField = useBufferedField(
    value,
    (v) => onChangeValue(index, v),
    300
  )
  const labelField = useBufferedField(
    label,
    (v) => onChangeLabel(index, v),
    300
  )

  return (
    <Group gap="xs">
      <TextInput
        style={{ flex: 1 }}
        placeholder="Value"
        value={valueField.value}
        onChange={(e) => valueField.onChange(e.currentTarget.value)}
        onBlur={valueField.onBlur}
      />
      <TextInput
        style={{ flex: 1 }}
        placeholder="Label"
        value={labelField.value}
        onChange={(e) => labelField.onChange(e.currentTarget.value)}
        onBlur={labelField.onBlur}
      />
      <ActionIcon
        variant="default"
        aria-label="Remove proof stat"
        onClick={() => onRemove(index)}
      >
        <IconX size={16} />
      </ActionIcon>
    </Group>
  )
})
