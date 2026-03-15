-- Migration: Create booking_intakes table for intake form submissions
-- Apply via Supabase dashboard SQL editor

CREATE TABLE IF NOT EXISTS public.booking_intakes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  work_email text NOT NULL,
  company text,
  job_title text,
  team_size text,
  function_area text,
  current_tools text,
  main_bottleneck text,
  desired_outcome_90d text,
  intake_data jsonb,
  utm_source text,
  utm_medium text,
  utm_campaign text,
  referrer text,
  user_agent text,
  ip_address text,
  cal_booking_uid text,
  status text NOT NULL DEFAULT 'submitted',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Index for lookup by email and status
CREATE INDEX IF NOT EXISTS booking_intakes_email_idx ON public.booking_intakes (work_email);
CREATE INDEX IF NOT EXISTS booking_intakes_status_idx ON public.booking_intakes (status);
CREATE INDEX IF NOT EXISTS booking_intakes_cal_uid_idx ON public.booking_intakes (cal_booking_uid) WHERE cal_booking_uid IS NOT NULL;

-- RLS: admin-only access
ALTER TABLE public.booking_intakes ENABLE ROW LEVEL SECURITY;

-- Allow service role (used by API routes) full access
CREATE POLICY booking_intakes_service_role ON public.booking_intakes
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Allow admin users read access
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE tablename = 'booking_intakes' AND policyname = 'booking_intakes_admin_read'
  ) THEN
    CREATE POLICY booking_intakes_admin_read ON public.booking_intakes
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.id = auth.uid()
          AND profiles.is_admin = true
        )
      );
  END IF;
END $$;
