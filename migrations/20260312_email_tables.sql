-- Migration: Create email template tables
-- Apply via Supabase dashboard SQL editor

-- Email templates (one per template key)
CREATE TABLE IF NOT EXISTS public.email_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  key text NOT NULL UNIQUE,
  name text NOT NULL,
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Email template versions (immutable drafts/published)
CREATE TABLE IF NOT EXISTS public.email_template_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id uuid NOT NULL REFERENCES public.email_templates (id) ON DELETE CASCADE,
  version integer NOT NULL DEFAULT 1,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
  subject text,
  preview_text text,
  body_json jsonb,
  cta_label text,
  cta_href text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS email_template_versions_tpl_idx ON public.email_template_versions (template_id, status);

-- Email theme settings (singleton row)
CREATE TABLE IF NOT EXISTS public.email_theme_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  primary_color text DEFAULT '#6366f1',
  background_color text DEFAULT '#0a0a0a',
  card_background_color text DEFAULT '#141414',
  text_color text DEFAULT '#e0e0e0',
  muted_text_color text DEFAULT '#888888',
  logo_url text,
  footer_text text DEFAULT 'hopfner.dev',
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_template_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_theme_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_templates_service_role ON public.email_templates FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY email_template_versions_service_role ON public.email_template_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY email_theme_settings_service_role ON public.email_theme_settings FOR ALL USING (true) WITH CHECK (true);

-- Seed email theme singleton
INSERT INTO public.email_theme_settings (primary_color, background_color, card_background_color, text_color, muted_text_color, footer_text)
SELECT '#6366f1', '#0a0a0a', '#141414', '#e0e0e0', '#888888', 'hopfner.dev'
WHERE NOT EXISTS (SELECT 1 FROM public.email_theme_settings);

-- Seed 6 booking email templates
INSERT INTO public.email_templates (key, name) VALUES
  ('booking_confirmed_client', 'Booking Confirmed (Client)'),
  ('booking_confirmed_internal', 'Booking Confirmed (Internal)'),
  ('booking_rescheduled_client', 'Booking Rescheduled (Client)'),
  ('booking_rescheduled_internal', 'Booking Rescheduled (Internal)'),
  ('booking_cancelled_client', 'Booking Cancelled (Client)'),
  ('booking_cancelled_internal', 'Booking Cancelled (Internal)')
ON CONFLICT (key) DO NOTHING;

-- Seed published versions for each template
DO $$
DECLARE
  tpl RECORD;
BEGIN
  -- booking_confirmed_client
  SELECT id INTO tpl FROM public.email_templates WHERE key = 'booking_confirmed_client';
  IF tpl.id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.email_template_versions WHERE template_id = tpl.id) THEN
    INSERT INTO public.email_template_versions (template_id, version, status, subject, preview_text, body_json, cta_label, cta_href)
    VALUES (tpl.id, 1, 'published',
      'Your call is confirmed, {{first_name}}',
      'Your workflow review call is booked',
      '[{"type":"heading","content":"Your call is confirmed"},{"type":"paragraph","content":"Hi {{first_name}}, your Workflow Mapping & Optimization Review is scheduled for:"},{"type":"paragraph","content":"<strong>{{booking_start_local}}</strong> ({{booking_timezone}})"},{"type":"paragraph","content":"Need to make changes? You can reschedule or cancel using the links below."},{"type":"divider"},{"type":"paragraph","content":"<a href=\"{{reschedule_url}}\">Reschedule</a> · <a href=\"{{cancel_url}}\">Cancel</a>"}]'::jsonb,
      'Add to calendar', '{{reschedule_url}}');
  END IF;

  -- booking_confirmed_internal
  SELECT id INTO tpl FROM public.email_templates WHERE key = 'booking_confirmed_internal';
  IF tpl.id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.email_template_versions WHERE template_id = tpl.id) THEN
    INSERT INTO public.email_template_versions (template_id, version, status, subject, preview_text, body_json, cta_label, cta_href)
    VALUES (tpl.id, 1, 'published',
      'New booking: {{full_name}} ({{company}})',
      'New workflow review booking',
      '[{"type":"heading","content":"New booking received"},{"type":"paragraph","content":"<strong>{{full_name}}</strong> from {{company}} ({{job_title}})"},{"type":"paragraph","content":"<strong>When:</strong> {{booking_start_local}} ({{booking_timezone}})"},{"type":"paragraph","content":"<strong>Function:</strong> {{function_area}}"},{"type":"divider"},{"type":"paragraph","content":"Check the admin dashboard for full intake details."}]'::jsonb,
      'View in admin', '{{book_a_call_url}}');
  END IF;

  -- booking_rescheduled_client
  SELECT id INTO tpl FROM public.email_templates WHERE key = 'booking_rescheduled_client';
  IF tpl.id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.email_template_versions WHERE template_id = tpl.id) THEN
    INSERT INTO public.email_template_versions (template_id, version, status, subject, preview_text, body_json, cta_label, cta_href)
    VALUES (tpl.id, 1, 'published',
      'Your call has been rescheduled, {{first_name}}',
      'Your booking time has changed',
      '[{"type":"heading","content":"Your call has been rescheduled"},{"type":"paragraph","content":"Hi {{first_name}}, your Workflow Review has been moved to:"},{"type":"paragraph","content":"<strong>{{booking_start_local}}</strong> ({{booking_timezone}})"},{"type":"paragraph","content":"Need to change again? <a href=\"{{reschedule_url}}\">Reschedule</a> · <a href=\"{{cancel_url}}\">Cancel</a>"}]'::jsonb,
      NULL, NULL);
  END IF;

  -- booking_rescheduled_internal
  SELECT id INTO tpl FROM public.email_templates WHERE key = 'booking_rescheduled_internal';
  IF tpl.id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.email_template_versions WHERE template_id = tpl.id) THEN
    INSERT INTO public.email_template_versions (template_id, version, status, subject, preview_text, body_json, cta_label, cta_href)
    VALUES (tpl.id, 1, 'published',
      'Rescheduled: {{full_name}} ({{company}})',
      'Booking rescheduled',
      '[{"type":"heading","content":"Booking rescheduled"},{"type":"paragraph","content":"{{full_name}} ({{company}}) rescheduled to:"},{"type":"paragraph","content":"<strong>{{booking_start_local}}</strong> ({{booking_timezone}})"}]'::jsonb,
      NULL, NULL);
  END IF;

  -- booking_cancelled_client
  SELECT id INTO tpl FROM public.email_templates WHERE key = 'booking_cancelled_client';
  IF tpl.id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.email_template_versions WHERE template_id = tpl.id) THEN
    INSERT INTO public.email_template_versions (template_id, version, status, subject, preview_text, body_json, cta_label, cta_href)
    VALUES (tpl.id, 1, 'published',
      'Your booking was cancelled',
      'Your workflow review booking has been cancelled',
      '[{"type":"heading","content":"Your booking was cancelled"},{"type":"paragraph","content":"Hi {{first_name}}, your Workflow Review booking has been cancelled."},{"type":"paragraph","content":"If this was a mistake, you can book a new time:"}]'::jsonb,
      'Book a new time', '{{book_a_call_url}}');
  END IF;

  -- booking_cancelled_internal
  SELECT id INTO tpl FROM public.email_templates WHERE key = 'booking_cancelled_internal';
  IF tpl.id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM public.email_template_versions WHERE template_id = tpl.id) THEN
    INSERT INTO public.email_template_versions (template_id, version, status, subject, preview_text, body_json, cta_label, cta_href)
    VALUES (tpl.id, 1, 'published',
      'Cancelled: {{full_name}} ({{company}})',
      'Booking cancelled',
      '[{"type":"heading","content":"Booking cancelled"},{"type":"paragraph","content":"{{full_name}} ({{company}}) cancelled their booking."},{"type":"paragraph","content":"Previously scheduled: {{booking_start_local}} ({{booking_timezone}})"}]'::jsonb,
      NULL, NULL);
  END IF;
END $$;
