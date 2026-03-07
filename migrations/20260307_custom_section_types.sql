-- Add 4 new custom (composed) section types to the registry
-- These use the generic composed renderer with composer_schema

insert into public.section_type_registry (key, label, source, renderer, is_active, composer_schema)
values
  (
    'trust_strip',
    'Trust Strip',
    'custom',
    'composed',
    true,
    '{
      "tokens": { "widthMode": "full", "textAlign": "center", "spacingY": "py-4" },
      "rows": [{
        "id": "r1",
        "columns": [{
          "id": "c1",
          "blocks": [
            { "id": "b1", "type": "heading", "title": "Trusted by industry leaders" },
            { "id": "b2", "type": "logo_strip", "title": "", "logos": [{"label":"Company 1"},{"label":"Company 2"},{"label":"Company 3"}] },
            { "id": "b3", "type": "badge_group", "badges": [{"text":"SOC 2"},{"text":"ISO 27001"},{"text":"GDPR"}] }
          ]
        }]
      }]
    }'::jsonb
  ),
  (
    'workflow_visual',
    'Workflow Visual',
    'custom',
    'composed',
    true,
    '{
      "tokens": { "widthMode": "content", "textAlign": "left", "spacingY": "py-8" },
      "rows": [{
        "id": "r1",
        "columns": [{
          "id": "c1",
          "blocks": [
            { "id": "b1", "type": "heading", "title": "How it works" },
            { "id": "b2", "type": "subtitle", "body": "A streamlined process from discovery to deployment" },
            { "id": "b3", "type": "workflow_diagram", "title": "", "flowSteps": [{"label":"Discovery","description":"Understand your needs"},{"label":"Design","description":"Architecture & planning"},{"label":"Build","description":"Iterative development"},{"label":"Deploy","description":"Launch & monitor"}] }
          ]
        }]
      }]
    }'::jsonb
  ),
  (
    'proof_cluster',
    'Proof Cluster',
    'custom',
    'composed',
    true,
    '{
      "tokens": { "widthMode": "content", "textAlign": "left", "spacingY": "py-8" },
      "rows": [
        {
          "id": "r1",
          "columns": [{
            "id": "c1",
            "blocks": [
              { "id": "b1", "type": "heading", "title": "Results that speak" },
              { "id": "b2", "type": "metrics_row", "metrics": [{"value":"10x","label":"Faster processing"},{"value":"50%","label":"Cost reduction"},{"value":"99.9%","label":"Uptime"}] }
            ]
          }]
        },
        {
          "id": "r2",
          "columns": [
            {
              "id": "c2",
              "blocks": [
                { "id": "b3", "type": "proof_card", "title": "Enterprise automation", "body": "Automated manual workflows for a Fortune 500 client", "stats": [{"value":"3x","label":"throughput"},{"value":"60%","label":"less errors"}] }
              ]
            },
            {
              "id": "c3",
              "blocks": [
                { "id": "b4", "type": "testimonial", "quote": "Transformed our operations completely.", "author": "CTO", "role": "Enterprise Client" }
              ]
            }
          ]
        }
      ]
    }'::jsonb
  ),
  (
    'split_story',
    'Split Story',
    'custom',
    'composed',
    true,
    '{
      "tokens": { "widthMode": "content", "textAlign": "left", "spacingY": "py-8" },
      "rows": [{
        "id": "r1",
        "columns": [
          {
            "id": "c1",
            "blocks": [
              { "id": "b1", "type": "heading", "title": "The challenge" },
              { "id": "b2", "type": "rich_text", "body": "Describe the problem or challenge your client faced." },
              { "id": "b3", "type": "comparison", "beforeLabel": "Before", "afterLabel": "After", "beforeItems": ["Manual data entry","Slow turnaround","Error-prone"], "afterItems": ["Fully automated","Real-time processing","99.9% accuracy"] }
            ]
          },
          {
            "id": "c2",
            "blocks": [
              { "id": "b4", "type": "media_panel", "title": "Solution overview", "imageUrl": "" },
              { "id": "b5", "type": "stat_chip_row", "stats": [{"value":"5x","label":"faster"},{"value":"$2M","label":"saved"}] }
            ]
          }
        ]
      }]
    }'::jsonb
  )
on conflict (key) do nothing;
