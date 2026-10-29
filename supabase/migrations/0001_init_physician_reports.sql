-- =============================================================================
-- TerraPulse — 0001: physician_reports
-- =============================================================================
-- Target: Supabase (PostgreSQL 15+) with the PostgREST "rest/v1" interface.
--
-- Apply with the Supabase SQL Editor, or:
--   supabase db push            (if you manage the project with the CLI)
--
-- Column list is derived from the only two places the application touches this
-- table:
--   * INSERT payload in src/lib/dbService.js  -> submitRemoteReport()
--   * SELECT in the same file                 -> select=*, order=created_at.desc
--   * row consumption in src/App.jsx          -> merged by `id`, filtered by
--                                                `gov`/`governorate` and scored by
--                                                `considering_migration`/`severity`
-- Nothing else is stored, so nothing else is declared here.
--
-- -----------------------------------------------------------------------------
-- SECURITY POSTURE — READ THIS BEFORE ENABLING WRITES
-- -----------------------------------------------------------------------------
-- Row Level Security is ENABLED with NO policies, on purpose.
--
-- The application has no authentication: it ships an anon/public API key only,
-- which is a *browser-readable* credential, not a user identity. Anonymous INSERT
-- on a table of named physicians' migration intent would expose that data and let
-- anyone forge rows, so the policies that would make cloud sync "work" are not
-- provided here as if they were safe.
--
-- Effect of this migration as written:
--   * anon SELECT  -> HTTP 200 with 0 rows (RLS filters everything out)
--   * anon INSERT  -> rejected by RLS; the client reports the failure honestly and
--                     keeps the report in localStorage
-- TerraPulse therefore stays in local mode until an authenticated policy exists.
--
-- Prerequisite for multi-device sync: enable Supabase Auth (email/OTP or magic
-- link is enough for this app), then adopt the policy template below, which scopes
-- writes to an authenticated author and keeps the aggregate feed readable.
-- Adjust `author_id` trust rules to match your own moderation model before use.
--
-- -- BEGIN AUTHENTICATED POLICY TEMPLATE (copy into a later migration)
-- -- ALTER TABLE public.physician_reports ADD COLUMN author_id uuid;
-- -- CREATE POLICY "authenticated can read the feed"
-- --   ON public.physician_reports FOR SELECT TO authenticated USING (true);
-- -- CREATE POLICY "authenticated authors write their own reports"
-- --   ON public.physician_reports FOR INSERT TO authenticated
-- --   WITH CHECK (author_id = auth.uid());
-- -- CREATE POLICY "authors edit their own reports"
-- --   ON public.physician_reports FOR UPDATE TO authenticated
-- --   USING (author_id = auth.uid()) WITH CHECK (author_id = auth.uid());
-- -- GRANT SELECT, INSERT, UPDATE ON public.physician_reports TO authenticated;
-- -- END TEMPLATE
--
-- Free-text columns are stored verbatim. `comment` and `hospital` in particular
-- can identify an individual clinic or doctor, so treat this table as personal
-- data: keep it out of public exports and set a retention policy deliberately.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.physician_reports (
  -- client-generated as `report-${Date.now()}`; TEXT because the app owns the id
  id                     text        NOT NULL,
  doctor                 text,
  specialty              text        NOT NULL,
  -- governorate key: cairo | giza | alexandria | assiut | aswan
  gov                    text        NOT NULL,
  hospital               text,
  -- yes | hesitant | no (Arabic equivalents are normalised client-side)
  considering_migration  text,
  primary_reason         text,
  needed_support         text,
  -- 1-5 in the UI; 0 is tolerated because the scoring engine treats an explicit
  -- zero ("asymptomatic") as a real answer rather than a missing one
  severity               smallint,
  comment                text,
  -- ISO calendar date supplied by the client; the app reads and writes the key
  -- `date`, so the column keeps that exact name (quoted, since it is also a type
  -- keyword) rather than forcing a rename in both request and response paths
  "date"                 date,
  created_at             timestamptz NOT NULL DEFAULT now(),

  CONSTRAINT physician_reports_pkey PRIMARY KEY (id),
  CONSTRAINT physician_reports_severity_range
    CHECK (severity IS NULL OR (severity BETWEEN 0 AND 5)),
  CONSTRAINT physician_reports_migration_values
    CHECK (considering_migration IS NULL
           OR considering_migration IN ('yes', 'no', 'hesitant', 'undecided',
                                       'نعم', 'لا', 'متردد'))
);

-- The client reads `select=*` ordered by created_at desc, and the scoring engine
-- filters by governorate; both of these exist for that reason only.
CREATE INDEX IF NOT EXISTS physician_reports_created_at_desc
  ON public.physician_reports (created_at DESC);

CREATE INDEX IF NOT EXISTS physician_reports_gov_idx
  ON public.physician_reports (gov);

ALTER TABLE public.physician_reports ENABLE ROW LEVEL SECURITY;

-- The PostgREST schema cache must be told a new table exists, otherwise requests from
-- the client keep returning HTTP 404 with code PGRST205, "Could not find the table
-- 'public.physician_reports' in the schema cache", even though the table is present.
NOTIFY pgrst, 'reload schema';

-- -----------------------------------------------------------------------------
-- Read-only verification, run this AFTER the migration to confirm the posture.
-- It changes nothing; it is here so "secure by default" is a checked fact rather
-- than an assumption. Expect: relrowsecurity = true, zero policy rows, and no
-- grant row for role `anon` on this table.
--
--   select c.relname, c.relrowsecurity, c.relforcerowsecurity
--     from pg_class c join pg_namespace n on n.oid = c.relnamespace
--    where n.nspname = 'public' and c.relname = 'physician_reports';
--
--   select policyname, cmd, roles, permissive
--     from pg_policies where tablename = 'physician_reports';
--   -- (pg_policies is the view: policyname/cmd/qual. polname/polcmd/polqual belong to
--   --  the raw pg_policy catalog and are not valid here.)
--
--   select grantee, privilege_type
--     from information_schema.role_table_grants
--    where table_name = 'physician_reports';
--
-- Then confirm from outside the database, with the anon key the browser holds:
--   curl -s -w '\n%{http_code}\n' \
--     -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
--     "$URL/rest/v1/physician_reports?select=id&limit=1"     -> 200 and body []
--   curl -s -w '\n%{http_code}\n' -X POST \
--     -H "apikey: $ANON" -H "Authorization: Bearer $ANON" -H 'Content-Type: application/json' \
--     -d '{"id":"rls-probe-delete-me","specialty":"probe","gov":"cairo"}' \
--     "$URL/rest/v1/physician_reports"                           -> 401/403
-- A 2xx on the POST means an over-permissive policy is live. It has also written a
-- row, so delete it before anything else, then drop the policy:
--   curl -s -w '\n%{http_code}\n' -X DELETE \
--     -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
--     "$URL/rest/v1/physician_reports?id=eq.rls-probe-delete-me"
-- The rows name physicians and record migration intent; treat a permissive policy on
-- this table as a disclosure, not a configuration detail.
-- -----------------------------------------------------------------------------
