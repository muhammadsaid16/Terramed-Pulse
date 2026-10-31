-- =============================================================================
-- TerraPulse — 0002: Enhanced Physician Observatory & Anonymized Cross-Device Access
-- =============================================================================
-- Target: Neon Postgres (PostgreSQL 18)
--
-- Extends the physician_reports table to support:
--   1. Structured clinical challenges (e.g. overcrowding, medication stockouts)
--   2. Missing medical resources (e.g. ICU beds, dialysis filters, ventilators)
--   3. Working conditions (e.g. shift duration >24h, lack of rest facilities)
--   4. Retention priorities (e.g. financial bonus, security protection)
--
-- Solves the Cross-Device Synchronization Problem:
--   Creates a secure, read-only aggregated/anonymized function `public.get_community_reports()`
--   and view `public.v_anonymized_physician_reports` that:
--     - Excludes doctor personal names and raw IP hashes to protect privacy.
--     - Allows cross-device feed retrieval without exposing sensitive PII.
--     - Grants EXECUTE to web_reader on `public.get_community_reports()`.
-- =============================================================================

DO $$
BEGIN
  -- 1. Add structured observatory columns if they don't already exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'physician_reports' AND column_name = 'clinical_challenges') THEN
    ALTER TABLE public.physician_reports ADD COLUMN clinical_challenges text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'physician_reports' AND column_name = 'missing_resources') THEN
    ALTER TABLE public.physician_reports ADD COLUMN missing_resources text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'physician_reports' AND column_name = 'working_conditions') THEN
    ALTER TABLE public.physician_reports ADD COLUMN working_conditions text;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'physician_reports' AND column_name = 'retention_priorities') THEN
    ALTER TABLE public.physician_reports ADD COLUMN retention_priorities text;
  END IF;
END $$;

-- 2. Anonymized Public View: Statically strips doctor personal name and ip_hash
CREATE OR REPLACE VIEW public.v_anonymized_physician_reports AS
SELECT
  id,
  specialty,
  gov,
  hospital,
  considering_migration,
  primary_reason,
  needed_support,
  severity,
  clinical_challenges,
  missing_resources,
  working_conditions,
  retention_priorities,
  comment,
  "date",
  submitted_at
FROM public.physician_reports
ORDER BY submitted_at DESC;

-- 3. Security Definer Community Getter Function
-- Enables web_reader to fetch anonymized cross-device records safely
CREATE OR REPLACE FUNCTION public.get_community_reports(limit_count integer DEFAULT 50)
RETURNS TABLE (
  id uuid,
  specialty text,
  gov text,
  hospital text,
  considering_migration text,
  primary_reason text,
  needed_support text,
  severity smallint,
  clinical_challenges text,
  missing_resources text,
  working_conditions text,
  retention_priorities text,
  comment text,
  "date" date,
  submitted_at timestamptz
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, pg_temp
STABLE
AS $$
  SELECT
    id, specialty, gov, hospital, considering_migration, primary_reason,
    needed_support, severity, clinical_challenges, missing_resources,
    working_conditions, retention_priorities, comment, "date", submitted_at
  FROM public.v_anonymized_physician_reports
  LIMIT LEAST(limit_count, 100);
$$;

-- Grant EXECUTE to web_writer so the serverless API can serve cross-device records
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'web_writer') THEN
    GRANT EXECUTE ON FUNCTION public.get_community_reports(integer) TO web_writer;
  END IF;
END $$;
