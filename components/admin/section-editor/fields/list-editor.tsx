"use client"

import {
  ActionIcon,
  Button,
  Group,
  Stack,
  Text,
  TextInput,
} from "@/components/mui-compat"
import { IconPlus, IconX } from "@tabler/icons-react"
import { inputValueFromEvent } from "../payload"

export function ListEditor({
  label,
  items,
  onChange,
  placeholder,
}: {
  label: string
  items: string[]
  onChange: (next: string[]) => void
  placeholder?: string
}) {
  return (
    <Stack gap={6}>
      <Group justify="space-between">
        <Text size="sm" fw={600}>
          {label}
        </Text>
        <Button
          size="xs"
          variant="default"
          leftSection={<IconPlus size={14} />}
          onClick={() => onChange([...items, ""])}
        >
          Add
        </Button>
      </Group>
      <Stack gap="xs">
        {items.map((val, idx) => (
          <Group key={idx} gap="xs" align="start">
            <TextInput
              value={val}
              placeholder={placeholder}
              onChange={(e) => {
                const next = items.slice()
                next[idx] = inputValueFromEvent(e)
                onChange(next)
              }}
              style={{ flex: 1 }}
            />
            <ActionIcon
              variant="default"
              aria-label="Remove"
              onClick={() => onChange(items.filter((_, i) => i !== idx))}
            >
              <IconX size={16} />
            </ActionIcon>
          </Group>
        ))}
        {!items.length ? (
          <Text c="dimmed" size="sm">
            No items.
          </Text>
        ) : null}
      </Stack>
    </Stack>
  )
}
