# Admin And Editor Surfaces

## Admin Backend

The protected admin lives under:

- [/var/www/html/hopfner.dev-main/app/admin/(protected)](/var/www/html/hopfner.dev-main/app/admin/(protected))

The admin shell and shared admin UI are in:

- [/var/www/html/hopfner.dev-main/components/admin-shell.tsx](/var/www/html/hopfner.dev-main/components/admin-shell.tsx)
- [/var/www/html/hopfner.dev-main/components/admin/ui.tsx](/var/www/html/hopfner.dev-main/components/admin/ui.tsx)

The backend has already gone through a major unification pass and now has:

- collection pages
- workspace pages
- shared shell/navigation
- stronger testing and build discipline

## Main Admin Feature Areas

Main route families include:

- pages list / publishing
- page form editor
- page visual editor
- blog management
- media library
- bookings
- section library
- global sections
- email templates
- admin auth/setup

## Form Editor

The classic form editor remains important.

Entry area:

- [/var/www/html/hopfner.dev-main/components/admin/section-editor](/var/www/html/hopfner.dev-main/components/admin/section-editor)

It still contains a lot of the most complete content-control logic, and many later visual-editor enhancements have reused contracts or logic from here rather than replacing it.

## Visual Editor

The visual editor is a major product surface:

- [/var/www/html/hopfner.dev-main/components/admin/visual-editor](/var/www/html/hopfner.dev-main/components/admin/visual-editor)

It now supports:

- section selection
- structure rail
- in-canvas editing
- page settings
- media integration
- history/state handling
- composed/custom section support to a meaningful degree

For future work, assume the visual editor is a first-class workspace, not an experiment.

## Admin APIs

Current admin API files include:

- [/var/www/html/hopfner.dev-main/app/admin/api/blog/articles/route.ts](/var/www/html/hopfner.dev-main/app/admin/api/blog/articles/route.ts)
- [/var/www/html/hopfner.dev-main/app/admin/api/bookings/route.ts](/var/www/html/hopfner.dev-main/app/admin/api/bookings/route.ts)
- [/var/www/html/hopfner.dev-main/app/admin/api/bootstrap/route.ts](/var/www/html/hopfner.dev-main/app/admin/api/bootstrap/route.ts)
- [/var/www/html/hopfner.dev-main/app/admin/api/content/blueprint/route.ts](/var/www/html/hopfner.dev-main/app/admin/api/content/blueprint/route.ts)
- [/var/www/html/hopfner.dev-main/app/admin/api/email-templates/route.ts](/var/www/html/hopfner.dev-main/app/admin/api/email-templates/route.ts)
- [/var/www/html/hopfner.dev-main/app/admin/api/email-templates/[id]/route.ts](/var/www/html/hopfner.dev-main/app/admin/api/email-templates/[id]/route.ts)
- [/var/www/html/hopfner.dev-main/app/admin/api/email-templates/theme/route.ts](/var/www/html/hopfner.dev-main/app/admin/api/email-templates/theme/route.ts)
- [/var/www/html/hopfner.dev-main/app/admin/api/global-sections/attach/route.ts](/var/www/html/hopfner.dev-main/app/admin/api/global-sections/attach/route.ts)
- [/var/www/html/hopfner.dev-main/app/admin/api/media/route.ts](/var/www/html/hopfner.dev-main/app/admin/api/media/route.ts)
- [/var/www/html/hopfner.dev-main/app/admin/api/media/upload/route.ts](/var/www/html/hopfner.dev-main/app/admin/api/media/upload/route.ts)
- [/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts](/var/www/html/hopfner.dev-main/app/admin/api/pages/overview/route.ts)
- [/var/www/html/hopfner.dev-main/app/admin/api/pages/publish-all/route.ts](/var/www/html/hopfner.dev-main/app/admin/api/pages/publish-all/route.ts)

These APIs matter because they show the app already has server-side mutation/read surfaces beyond raw DB access.

## Media

Media support lives in:

- [/var/www/html/hopfner.dev-main/lib/media](/var/www/html/hopfner.dev-main/lib/media)
- [/var/www/html/hopfner.dev-main/app/admin/api/media](/var/www/html/hopfner.dev-main/app/admin/api/media)
- [/var/www/html/hopfner.dev-main/app/admin/api/media/upload](/var/www/html/hopfner.dev-main/app/admin/api/media/upload)

This is one of the important future AI-enablement points because generated assets need a supported path into the existing media library, not direct DB hacks.

