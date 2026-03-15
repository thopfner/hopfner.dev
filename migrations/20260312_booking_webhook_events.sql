-- Migration: Create booking_webhook_events table for Cal.com webhook events
-- Apply via Supabase dashboard SQL editor

CREATE TABLE IF NOT EXISTS public.booking_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cal_booking_uid text NOT NULL,
  event_type text NOT NULL,
  dedupe_key text NOT NULL UNIQUE,
  payload jsonb,
  signature_valid boolean DEFAULT false,
  resend_status text DEFAULT 'skipped',
  n8n_status text DEFAULT 'skipped',
  intake_id uuid REFERENCES public.booking_intakes (id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS booking_webhook_events_uid_idx ON public.booking_webhook_events (cal_booking_uid);
CREATE INDEX IF NOT EXISTS booking_webhook_events_intake_idx ON public.booking_webhook_events (intake_id) WHERE intake_id IS NOT NULL;

ALTER TABLE public.booking_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY booking_webhook_events_service_role ON public.booking_webhook_events
  FOR ALL
  USING (true)
  WITH CHECK (true);
