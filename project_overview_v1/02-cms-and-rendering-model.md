# CMS And Rendering Model

## Core CMS Types

The main CMS types live in:

- [/var/www/html/hopfner.dev-main/lib/cms/types.ts](/var/www/html/hopfner.dev-main/lib/cms/types.ts)

Important concepts:

- `CmsPage`
- `CmsSectionRow`
- `CmsSectionVersionRow`
- `CmsPublishedSection`
- `CmsSectionTypeDefault`
- `SiteFormattingSettings`

## Built-In Section Types

Current built-in section types:

- `nav_links`
- `hero_cta`
- `card_grid`
- `steps_list`
- `title_body_list`
- `rich_text_block`
- `label_value_list`
- `faq_list`
- `cta_block`
- `footer_grid`
- `social_proof_strip`
- `proof_cluster`
- `case_study_split`
- `booking_scheduler`

The system also supports custom/composed section types via registry data.

## Data Model

The effective website is assembled from several database-backed tables and registries:

- `pages`
- `sections`
- `section_versions`
- `global_section_versions`
- `section_type_defaults`
- `section_type_registry`
- `tailwind_class_whitelist`
- `site_formatting_settings`

The important design choice is that a section is not just a blob of HTML.

It has:

- a type
- versioned content
- versioned formatting
- optional page-level overrides
- optional global-section linkage

## Published Render Path

The key published-page loader is:

- [/var/www/html/hopfner.dev-main/lib/cms/get-published-page.ts](/var/www/html/hopfner.dev-main/lib/cms/get-published-page.ts)

That loader is responsible for:

- loading the page row
- loading enabled sections in order
- resolving published local or global section versions
- loading registry-backed composed schemas
- loading section defaults
- loading theme / site-formatting settings
- loading the Tailwind whitelist

The main point for a new session:

The frontend renderer is already CMS-native. It does not need code injection to build a page. The CMS data model is the source of truth.

## Theme And Formatting Model

Theme/style is layered through:

- site-wide formatting settings
- page formatting overrides
- section formatting overrides
- section type defaults
- safe formatting resolution / Tailwind allowlisting

Important consequence:

Design changes are not one-off CSS patches. The app already has a real theme/token/formatting system, although some controls are richer than others.

## Why This Matters For Future AI-Native CMS Work

This architecture is already close to what an agent-native CMS needs.

The main enabling pieces already exist:

- database-backed page/section model
- explicit section types
- defaults and registries
- visual and form editing surfaces
- admin APIs for related content/media tasks

What is still needed for true agent-native creation is not a new renderer. It is a clean, supported mutation surface over this model.

