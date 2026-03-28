# Route-By-Route Recommendations

## Pages (`/admin`)

Current strength:

- strongest current list-page pattern
- good use of header, summary chips, filters, dialogs

See [pages-list.tsx](/var/www/html/hopfner.dev-main/app/admin/(protected)/pages-list.tsx#L334).

Recommendations:

1. Merge `Create page` and `Publish All` into one clearer primary action zone instead of splitting them across separate panels.
2. Promote search, sort, and status into a more persistent filter bar rather than a search field plus secondary filter dialog.
3. Add stronger row hierarchy so status and update recency scan faster than slug/title.
4. Keep this route as the baseline scaffold for all other collection pages.

## Page Editor (`/admin/pages/[pageId]`)

Current strength:

- deep functionality
- section management is already powerful

See [page-editor.tsx](/var/www/html/hopfner.dev-main/app/admin/(protected)/pages/[pageId]/page-editor.tsx#L2624).

Recommendations:

1. Make the page header more productized and persistent; it should function as a true document toolbar, not just a top block.
2. Demote backdrop controls visually so they read as page settings, not the main event.
3. Give the sections workspace a stronger “primary canvas/list” treatment with a clearer sticky action area.
4. Reduce repeated bordered panels and modal fragmentation.
5. Align the route visually with the visual editor so both feel like two modes of the same page workspace.

## Visual Editor (`/admin/pages/[pageId]/visual`)

Current strength:

- most productized workspace in the admin
- strongest sense of professional tooling

See [page-visual-editor.tsx](/var/www/html/hopfner.dev-main/components/admin/visual-editor/page-visual-editor.tsx#L327).

Recommendations:

1. Treat this as the benchmark for immersive workspace layout.
2. Extract its best shell decisions into reusable admin workspace patterns.
3. Avoid special-case shell hacks long term; formalize the full-bleed workspace mode at the shell level.

## Section Library

Current strength:

- broad capability surface
- header and filters are present

See [section-library/page-client.tsx](/var/www/html/hopfner.dev-main/app/admin/(protected)/section-library/page-client.tsx#L1398).

Recommendations:

1. Split catalog and composer modes more decisively; they currently share too much visual weight.
2. Use a stronger two-pane or mode-based layout so the page stops feeling like a long control stack.
3. Simplify control density and group actions more intentionally.
4. Reduce the internal-tool feel of tabs + chips + custom wrappers all competing for attention.

## Global Sections

Current strength:

- very capable surface
- site-wide formatting/theming control is powerful

See [global-sections/page-client.tsx](/var/www/html/hopfner.dev-main/app/admin/(protected)/global-sections/page-client.tsx#L675).

Recommendations:

1. Break the page into clearer sub-workspaces: globals list, usage/impact, site formatting, templates.
2. Reduce the “everything on one page” feel.
3. Promote high-signal summary surfaces and hide lower-frequency controls behind clearer sections.
4. Standardize the page on the same admin surface system as pages/blog/media instead of keeping it in a parallel UI dialect.

## Blog

Current strength:

- closest to a clean collection-management screen

See [blog/page-client.tsx](/var/www/html/hopfner.dev-main/app/admin/(protected)/blog/page-client.tsx#L379).

Recommendations:

1. Keep this route as a reference for how review queues should feel.
2. Increase hierarchy between the filter bar and the content table.
3. Refine action-menu discoverability and status visibility.
4. Improve mobile card compaction so the route feels more premium on narrow screens.

## Media

Current strength:

- solid header and filter/upload strip
- the grid reads well

See [media-page-client.tsx](/var/www/html/hopfner.dev-main/app/admin/(protected)/media/media-page-client.tsx#L160).

Recommendations:

1. Promote media metadata and actions into a slightly more editorial, less utility-grid presentation.
2. Improve file-card hierarchy so filename, path, date, and actions scan faster.
3. Keep this route within the standard collection-page scaffold.

## Bookings

Current weakness:

- significantly less productized than other routes

See [bookings/page-client.tsx](/var/www/html/hopfner.dev-main/app/admin/(protected)/bookings/page-client.tsx#L86).

Recommendations:

1. Move it onto the same `AdminPageHeader + AdminPanel` scaffold as pages/blog/media.
2. Turn the current utilitarian table into a deliberate review queue.
3. Make summary and filtering first-class; right now the route begins too abruptly.
4. Improve the expanded detail presentation so it feels like a reviewed record, not a hidden table appendix.

## Email Templates

Current weakness:

- one of the least premium surfaces in the admin

See [email-templates/page-client.tsx](/var/www/html/hopfner.dev-main/app/admin/(protected)/email-templates/page-client.tsx#L255).

Recommendations:

1. Move it onto the standard admin scaffold immediately.
2. Convert the route from “plain split pane” into a true editor workspace:
   - sticky header
   - clear save/publish zone
   - stable left rail
   - main editor + preview hierarchy
3. Make branding mode feel like part of the same product, not a second mini-screen.
4. Reduce raw-form feel and increase editorial confidence.

## Login / Setup

Current state:

- adequate, minimal, visually coherent

See [login-form.tsx](/var/www/html/hopfner.dev-main/app/admin/login/login-form.tsx#L72) and [setup-client.tsx](/var/www/html/hopfner.dev-main/app/admin/setup/setup-client.tsx#L42).

Recommendations:

1. Keep these simple.
2. Align them to the same visual language as the core admin shell so authentication feels like the front door to the same product.
3. No major investment needed here compared with the protected routes.

## Top 5 Recommended Improvement Themes

1. Standardize every route onto either a collection scaffold or a workspace scaffold.
2. Unify the admin UI language instead of mixing raw MUI, compatibility wrappers, and one-off route layouts.
3. Rework heavy editor pages around clearer primary vs secondary surfaces.
4. Bring Bookings and Email Templates up to the quality level of Pages, Blog, Media, and Visual Editor.
5. Make action placement, save/publish placement, and state feedback consistent across the backend.
