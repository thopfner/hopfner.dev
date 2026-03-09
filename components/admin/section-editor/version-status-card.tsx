"use client"

import { memo } from "react"
import {
  Badge,
  Button,
  Group,
  Menu,
  Paper,
  Stack,
  Text,
} from "@/components/mui-compat"
import { IconChevronDown, IconTrash } from "@tabler/icons-react"
import type { SectionVersionRow } from "./types"

type VersionStatusCardProps = {
  published: SectionVersionRow | null
  activeDraft: SectionVersionRow | null
  editorBaseVersion: SectionVersionRow | null
  isDirty: boolean
  loading: boolean
  onSaveDraft: () => void
  onPublishDraft: () => void
  onDeleteDraft: () => void
}

export const VersionStatusCard = memo(function VersionStatusCard({
  published,
  activeDraft,
  editorBaseVersion,
  isDirty,
  loading,
  onSaveDraft,
  onPublishDraft,
  onDeleteDraft,
}: VersionStatusCardProps) {
  return (
    <Paper withBorder p="md" radius="md">
      <Stack gap={6}>
        <Group justify="space-between" align="center" gap="sm">
          <Group gap="xs" wrap="wrap">
            <Text fw={600} size="sm">
              Current
            </Text>
            {published ? (
              <Badge size="xs" color="teal" variant="light">
                published v{published.version}
              </Badge>
            ) : (
              <Badge size="xs" color="gray" variant="light">
                no published
              </Badge>
            )}
            {activeDraft ? (
              <Badge size="xs" color="yellow" variant="light">
                draft v{activeDraft.version}
              </Badge>
            ) : (
              <Badge size="xs" color="gray" variant="light">
                no draft
              </Badge>
            )}
            {editorBaseVersion ? (
              <Badge size="xs" variant="default">
                editing v{editorBaseVersion.version} ({editorBaseVersion.status})
              </Badge>
            ) : null}
          </Group>

          <Menu withinPortal={false} position="bottom-end" shadow="md">
            <Menu.Target>
              <Button
                size="xs"
                variant="default"
                rightSection={<IconChevronDown size={14} />}
                disabled={loading}
              >
                Actions
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Label>Actions</Menu.Label>
              <Menu.Item
                closeMenuOnClick
                onClick={onSaveDraft}
                disabled={!isDirty || loading}
              >
                Save draft
              </Menu.Item>
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={14} />}
                closeMenuOnClick
                onClick={onDeleteDraft}
                disabled={!activeDraft || loading}
              >
                Delete draft
              </Menu.Item>
              <Menu.Item
                closeMenuOnClick
                onClick={onPublishDraft}
                disabled={(!activeDraft && !isDirty) || loading}
              >
                {isDirty ? "Save & Publish" : "Publish"}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Group>

        {isDirty ? (
          <Group justify="space-between" gap="xs">
            <Text size="xs" c="yellow.6">
              Unsaved changes. Save draft, or publish directly to save &amp; go live.
            </Text>
          </Group>
        ) : activeDraft ? (
          <Text size="xs" c="dimmed">
            Draft saved. Live site unchanged until you publish.
          </Text>
        ) : (
          <Text size="xs" c="dimmed">
            Changes here are draft-only until you publish.
          </Text>
        )}
      </Stack>
    </Paper>
  )
})
