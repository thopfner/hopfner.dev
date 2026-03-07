# Hopfner Enhancements V2

Start with `urgent-editor-drawer-fix.md`.

This package is a focused handoff for one urgent regression:

- newly created section types and newly added composed/custom block types are not fully editable in the page-level section editor drawer

Scope:

- no redesign brief
- no copywriting work
- no broad refactor unless required to restore editor parity

Primary objective:

- make every newly supported section structure editable through the admin/page editor drawer in a way that matches what the frontend can render

Primary files to inspect first:

- `/var/www/html/hopfner.dev-main/components/section-editor-drawer.tsx`
- `/var/www/html/hopfner.dev-main/components/landing/composed-section.tsx`
- `/var/www/html/hopfner.dev-main/app/admin/(protected)/section-library/page-client.tsx`
- `/var/www/html/hopfner.dev-main/lib/cms/get-published-page.ts`
- `/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts`

Definition of done:

- all new composed block types are editable in the page drawer
- stored content shape matches renderer expectations
- page overview publish state is correct for composed sections
- page-level editors can safely create, edit, save, restore, and publish these sections without hidden unsupported fields
