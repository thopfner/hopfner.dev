"use client"

import React from "react"
import { ActionIcon, Group, TextInput } from "@/components/mui-compat"
import { IconX } from "@tabler/icons-react"
import { useBufferedField } from "../hooks/use-buffered-field"

type Props = {
  index: number
  text: string
  onChangeText: (index: number, value: string) => void
  onRemove: (index: number) => void
}

export const HeroTrustItemRow = React.memo(function HeroTrustItemRow({
  index,
  text,
  onChangeText,
  onRemove,
}: Props) {
  const field = useBufferedField(
    text,
    (v) => onChangeText(index, v),
    300
  )

  return (
    <Group gap="xs">
      <TextInput
        style={{ flex: 1 }}
        placeholder="Trust badge text"
        value={field.value}
        onChange={(e) => field.onChange(e.currentTarget.value)}
        onBlur={field.onBlur}
      />
      <ActionIcon
        variant="default"
        aria-label="Remove trust item"
        onClick={() => onRemove(index)}
      >
        <IconX size={16} />
      </ActionIcon>
    </Group>
  )
})
