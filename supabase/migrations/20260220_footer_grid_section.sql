begin;

-- Allow new footer section type on page sections
do $$
begin
  alter table public.sections
    drop constraint if exists sections_section_type_check;
exception when others then
end $$;

alter table public.sections
  add constraint sections_section_type_check check (
    section_type in (
      'nav_links',
      'hero_cta',
      'card_grid',
      'steps_list',
      'title_body_list',
      'rich_text_block',
      'label_value_list',
      'faq_list',
      'cta_block',
      'footer_grid'
    )
  );

-- Allow new footer section type on global sections
do $$
begin
  alter table public.global_sections
    drop constraint if exists global_sections_section_type_check;
exception when others then
end $$;

alter table public.global_sections
  add constraint global_sections_section_type_check check (
    section_type in (
      'nav_links',
      'hero_cta',
      'card_grid',
      'steps_list',
      'title_body_list',
      'rich_text_block',
      'label_value_list',
      'faq_list',
      'cta_block',
      'footer_grid'
    )
  );

-- Seed defaults/capabilities for footer_grid (idempotent)
insert into public.section_type_defaults (
  section_type,
  label,
  description,
  default_title,
  default_subtitle,
  default_cta_primary_label,
  default_cta_primary_href,
  default_cta_secondary_label,
  default_cta_secondary_href,
  default_background_media_url,
  default_formatting,
  default_content,
  capabilities
)
values (
  'footer_grid',
  'Footer grid',
  'Professional footer with 1-2 cards, links, optional subscribe UI, and legal row.',
  null,
  null,
  null,
  null,
  null,
  null,
  null,
  jsonb_build_object(
    'widthMode', 'full',
    'maxWidth', 'max-w-6xl',
    'paddingY', 'py-8',
    'textAlign', 'left',
    'shadowMode', 'off',
    'innerShadowMode', 'off',
    'innerShadowStrength', 0
  ),
  jsonb_build_object(
    'brandText', 'The Resonance',
    'cards', jsonb_build_array(
      jsonb_build_object(
        'title', 'Studio',
        'body', '',
        'linksMode', 'grouped',
        'groups', jsonb_build_array(
          jsonb_build_object('title', 'Studio', 'links', jsonb_build_array(
            jsonb_build_object('label', 'Brand Sprint', 'href', '#'),
            jsonb_build_object('label', 'Product Sprint', 'href', '#')
          )),
          jsonb_build_object('title', 'AI', 'links', jsonb_build_array(
            jsonb_build_object('label', 'AI Upskill', 'href', '#'),
            jsonb_build_object('label', 'Vibegen', 'href', '#')
          )),
          jsonb_build_object('title', 'Connect', 'links', jsonb_build_array(
            jsonb_build_object('label', 'Thoughts', 'href', '#'),
            jsonb_build_object('label', 'Contact Us', 'href', '#')
          ))
        ),
        'links', jsonb_build_array(),
        'subscribe', jsonb_build_object('enabled', false, 'placeholder', 'Email Address', 'buttonLabel', 'Subscribe'),
        'ctaPrimary', jsonb_build_object('label', '', 'href', ''),
        'ctaSecondary', jsonb_build_object('label', '', 'href', '')
      ),
      jsonb_build_object(
        'title', 'Subscribe',
        'body', '',
        'linksMode', 'flat',
        'links', jsonb_build_array(
          jsonb_build_object('label', 'Privacy Policy', 'href', '#'),
          jsonb_build_object('label', 'Sitemap', 'href', '#')
        ),
        'groups', jsonb_build_array(),
        'subscribe', jsonb_build_object('enabled', true, 'placeholder', 'Email Address', 'buttonLabel', 'Subscribe'),
        'ctaPrimary', jsonb_build_object('label', '', 'href', ''),
        'ctaSecondary', jsonb_build_object('label', '', 'href', '')
      )
    ),
    'legal', jsonb_build_object(
      'copyright', '© 2026 Your Company',
      'links', jsonb_build_array(
        jsonb_build_object('label', 'Privacy Policy', 'href', '#'),
        jsonb_build_object('label', 'Terms', 'href', '#'),
        jsonb_build_object('label', 'Sitemap', 'href', '#')
      )
    )
  ),
  jsonb_build_object(
    'fields', jsonb_build_object(
      'title', true,
      'subtitle', false,
      'cta_primary', false,
      'cta_secondary', false,
      'background_media', false
    ),
    'content', jsonb_build_object(
      'cards', 'cards[] (1..2)',
      'cards.linksMode', '"flat"|"grouped"',
      'cards.links', 'links[]',
      'cards.groups', 'groups[]',
      'cards.subscribe', 'object(enabled,placeholder,buttonLabel)',
      'cards.ctaPrimary', 'object(label,href)',
      'cards.ctaSecondary', 'object(label,href)',
      'brandText', 'string',
      'legal', 'object(copyright,links[])'
    )
  )
)
on conflict (section_type) do update
set
  label = excluded.label,
  description = excluded.description,
  default_title = excluded.default_title,
  default_subtitle = excluded.default_subtitle,
  default_cta_primary_label = excluded.default_cta_primary_label,
  default_cta_primary_href = excluded.default_cta_primary_href,
  default_cta_secondary_label = excluded.default_cta_secondary_label,
  default_cta_secondary_href = excluded.default_cta_secondary_href,
  default_background_media_url = excluded.default_background_media_url,
  default_formatting = excluded.default_formatting,
  default_content = excluded.default_content,
  capabilities = excluded.capabilities,
  updated_at = now();

-- Optional schema registry seed for required content key
insert into public.cms_schema_registry (scope, section_type, version, schema, is_active)
values
  ('section_content', 'footer_grid', 1, jsonb_build_object('required', jsonb_build_array('cards', 'legal')), true),
  ('section_formatting', 'footer_grid', 1, jsonb_build_object('allowedBackgroundTypes', jsonb_build_array('none','color','gradient','image')), true)
on conflict do nothing;

commit;
