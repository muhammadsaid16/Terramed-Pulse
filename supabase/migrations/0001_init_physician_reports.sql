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
-- SECURITY POSTURE — READ THIS BEFORE APPLYING
-- -----------------------------------------------------------------------------
-- Row Level Security is ENABLED. `anon` gets exactly one right: submit a report.
--
-- The application has no authentication, so the only credential the browser holds
-- is a publishable/anon key — a *public, browser-readable* string, not a user
-- identity. Everything below is written so that this key can add a row but can
-- never see rows, because the rows name physicians and record migration intent.
--
-- Effect of this migration once applied:
--   * anon INSERT  -> accepted, and every field is re-validated by the policy
--   * anon SELECT  -> denied (no table privilege and no policy): an anonymous
--                     caller cannot enumerate other people's submissions
--   * anon UPDATE / DELETE -> denied
-- The app therefore shows submissions it made on-device plus the 45-record seed,
-- and reports the cloud read as forbidden rather than pretending it succeeded.
--
-- Prerequisite for a shared cross-device feed: enable Supabase Auth, then add a
-- read policy scoped to whatever moderation/consent model you choose. That is a
-- product decision about exposing physicians' migration intent, not a config flag,
-- so it is deliberately not done here. Template below.
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

-- -----------------------------------------------------------------------------
-- PRIVILEGES — set explicitly, never inherited
-- -----------------------------------------------------------------------------
-- Without this block the migration is incomplete: PostgREST builds its schema
-- cache from the relations the request role actually has privileges on, so a table
-- that exists but was never granted to `anon` returns the SAME 404 / PGRST205 as a
-- table that does not exist. Supabase projects differ on whether default privileges
-- cover `anon`, so the posture below is asserted rather than assumed. REVOKE first
-- so the result does not depend on whatever the project defaulted to.
REVOKE ALL ON public.physician_reports FROM anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT INSERT ON public.physician_reports TO anon;

-- Public submission, and nothing else.
--
-- The physician form is open to anyone, so INSERT has to be reachable by `anon` or
-- the feature does not work at all. That makes this policy the entire blast radius,
-- so it is narrow in three ways:
--   * INSERT only — no SELECT, UPDATE or DELETE, so an anonymous caller can never
--     read another physician's submission, which is the part that must stay private;
--   * every value is validated, so the feed cannot be poisoned with nonsense rows;
--   * WITH CHECK only, which PostgREST applies to the incoming row.
-- DROP POLICY IF EXISTS is scoped to the policy this migration owns by name. It does
-- not touch policies created elsewhere — see the pre-flight block below for what to
-- check first if the table already exists.
DROP POLICY IF EXISTS "anon may submit a physician report" ON public.physician_reports;
CREATE POLICY "anon may submit a physician report"
  ON public.physician_reports FOR INSERT TO anon
  WITH CHECK (
    gov IN ('cairo', 'giza', 'alexandria', 'assiut', 'aswan')
    -- Exactly the ids in src/lib/specialties.js SPECIALTY_SHORT_LABELS, which is the
    -- only list the form offers. A value outside it would 400 a legitimate report.
    AND specialty IN ('nephrology', 'pulmonology', 'cardiology', 'emergency',
                      'pediatrics', 'geriatrics', 'dermatology_ophthalmology',
                      'occupational_preventive')
    AND (severity IS NULL OR severity BETWEEN 0 AND 5)
    AND (considering_migration IS NULL
         OR considering_migration IN ('yes', 'no', 'hesitant', 'undecided',
                                     'نعم', 'لا', 'متردد'))
    AND id IS NOT NULL AND char_length(id) BETWEEN 1 AND 80
    AND (doctor   IS NULL OR char_length(doctor)   <= 120)
    AND (hospital IS NULL OR char_length(hospital) <= 160)
    AND (primary_reason  IS NULL OR char_length(primary_reason)  <= 120)
    AND (needed_support  IS NULL OR char_length(needed_support)  <= 120)
    AND (comment IS NULL OR char_length(comment) <= 1000)
    -- A client-supplied date must look like a real reporting date, not an arbitrary
    -- timestamp used to rewrite the feed's ordering.
    AND "date" BETWEEN DATE '2020-01-01' AND CURRENT_DATE + 1
  );

-- Note on `id`: the client generates `report-${Date.now()}`, so two devices
-- submitting in the same millisecond collide on the primary key and one gets a
-- 409. Harmless today (local mode), but worth knowing before this goes multi-site.

-- The PostgREST schema cache must be told a new table exists, otherwise requests from
-- the client keep returning HTTP 404 with code PGRST205, "Could not find the table
-- 'public.physician_reports' in the schema cache", even though the table is present.
NOTIFY pgrst, 'reload schema';

-- -----------------------------------------------------------------------------
-- PRE-FLIGHT — run this BEFORE applying, if the table might already exist.
-- A publishable key cannot answer these, which is exactly why "404 PGRST205" was
-- ambiguous: absent table, stale schema cache and present-but-not-granted all look
-- identical from outside. This distinguishes them in one query.
--
--   select to_regclass('public.physician_reports') is not null as table_exists;
--
--   select policyname, cmd, roles, permissive
--     from pg_policies where tablename = 'physician_reports';
--
--   select grantee, privilege_type
--     from information_schema.role_table_grants
--    where table_name = 'physician_reports' order by grantee, privilege_type;
--
-- If any policy or grant already exists that this file did not create, STOP and
-- reconcile by hand. This migration asserts privileges and replaces only its own
-- named policy; it will not remove anything else.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- POST-APPLY VERIFICATION — read-only, changes nothing.
-- Expect: table_exists = true, relrowsecurity = true, exactly one policy
-- ("anon may submit a physician report", cmd INSERT, roles {anon}), and the only
-- anon privilege row is INSERT.
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
--    where table_name = 'physician_reports' order by grantee, privilege_type;
--
-- Then confirm from outside the database, with the anon key the browser holds:
--
--   1. Anonymous read must be DENIED:
--      curl -s -w '\nHTTP %{http_code}\n' \
--        -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
--        "$URL/rest/v1/physician_reports?select=id&limit=1"     -> 401/403
--
--   2. A valid submission must be ACCEPTED:
--      curl -s -w '\nHTTP %{http_code}\n' -X POST \
--        -H "apikey: $ANON" -H "Authorization: Bearer $ANON" -H 'Content-Type: application/json' \
--        -d '{"id":"rls-probe-0001","doctor":"Probe","specialty":"cardiology","gov":"cairo","severity":3,"considering_migration":"no","date":"2026-01-01"}' \
--        "$URL/rest/v1/physician_reports"                        -> 201
--
--   3. A poisoned submission must be REJECTED by the policy, not stored:
--      curl -s -w '\nHTTP %{http_code}\n' -X POST \
--        -H "apikey: $ANON" -H "Authorization: Bearer $ANON" -H 'Content-Type: application/json' \
--        -d '{"id":"rls-probe-0002","specialty":"not-a-specialty","gov":"atlantis"}' \
--        "$URL/rest/v1/physician_reports"                        -> 400/403
--
--   4. Anonymous delete must be DENIED:
--      curl -s -w '\nHTTP %{http_code}\n' -X DELETE \
--        -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
--        "$URL/rest/v1/physician_reports?id=eq.rls-probe-0001"   -> 401/403
--
-- Step 2 writes a real row and step 4 proves you cannot remove it with the anon key
-- — that asymmetry is the point. Clean up in the SQL Editor and confirm it is gone:
--   delete from public.physician_reports where id like 'rls-probe-%';
--   select count(*) as remaining_probes from public.physician_reports
--     where id like 'rls-probe-%';                              -- expect 0
--
-- A 200 on step 1 or a 2xx on step 4 means the posture is wider than this file
-- claims; treat that as a disclosure incident, since the rows name physicians and
-- record migration intent.
-- -----------------------------------------------------------------------------
