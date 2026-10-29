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
--   * anon SELECT  -> denied at the PRIVILEGE layer, because the REVOKE below leaves
--                     anon holding nothing but INSERT. PostgREST therefore answers
--                     42501, and src/lib/dbService.js shows "Cloud submits allowed,
--                     reads blocked". Note the distinction: if anon were granted
--                     SELECT and merely lacked a SELECT policy, the same question
--                     would return 200 with [] instead — an empty result that the app
--                     would read as a working sync. The grant list in PART 3a is what
--                     proves which of the two you are in.
--   * anon UPDATE / DELETE -> denied
-- The app therefore shows submissions it made on-device plus the 45-record seed, and
-- reports the cloud read as denied rather than pretending it succeeded.
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
--
-- One vocabulary warning, because it has already caused a wrong policy once: this
-- app contains TWO specialty lists. The submission form and the impact matcher use
-- the eight ids in src/lib/specialties.js, and those are the only values this
-- migration admits. The 45 embedded `survey_seed` records in
-- src/data/terrapulseData.js use a different register - they carry `governorate`
-- rather than `gov`, `note_en`/`note_ar` rather than `comment`, no `date` at all,
-- and three specialties (obgyn, family_medicine, general_surgery) that the form
-- cannot produce. Seed rows are display fixtures; they are not this table's shape.
-- Do not widen the lists below to "load the demo data" - reconcile the data first.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PART 1: PREFLIGHT — read-only, run this FIRST, in its own editor tab, and read
-- what comes back before touching PART 2. A publishable key cannot answer any of
-- it, which is exactly why the outside view was ambiguous: an absent table, a
-- stale schema cache and a present-but-ungranted table all look like
-- "404 PGRST205" from the browser.
--
--   select to_regclass('public.physician_reports') is not null as table_exists;
--
--   select column_name, data_type, is_nullable
--     from information_schema.columns
--    where table_name = 'physician_reports' order by ordinal_position;   -- empty = absent
--
--   select conname, pg_get_constraintdef(oid) from pg_constraint
--    where conrelid = 'public.physician_reports'::regclass;
--
--   select grantee, privilege_type, is_grantable
--     from information_schema.role_table_grants
--    where table_name = 'physician_reports' order by 1, 2;
--
--   select policyname, cmd, permissive, roles from pg_policies
--    where tablename = 'physician_reports';
--
-- Stop here, and reconcile by hand, if:
--   * the table exists with columns, types or constraints this file does not name;
--   * any policy covers `anon` beyond the one this file owns;
--   * `anon` or `authenticated` already holds SELECT, UPDATE or DELETE.
-- PART 2a encodes the same checks and aborts, so a skipped preflight cannot turn
-- into a silent accept — but a human reading these five result sets first is still
-- the faster way to find out what is already in there.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- PART 2a: APPLY GUARD — this block runs before anything is created, and aborts
-- the whole script (RAISE EXCEPTION) rather than adapting to a table it does not
-- recognise. CREATE TABLE IF NOT EXISTS is NOT safe on its own: if the name is
-- already taken by a view, or by a table with different columns, it silently keeps
-- the existing object and the rest of this file then attaches an INSERT policy to
-- something nobody audited. Re-run this file only after reading the failure.
-- -----------------------------------------------------------------------------
DO $guard$
DECLARE
  -- The exact shape submitRemoteReport() writes. Anything else is a different table.
  expected_columns text[] := ARRAY['id', 'doctor', 'specialty', 'gov', 'hospital',
    'considering_migration', 'primary_reason', 'needed_support', 'severity',
    'comment', 'date', 'created_at'];
  expected_types   text[] := ARRAY['text', 'text', 'text', 'text', 'text', 'text',
    'text', 'text', 'smallint', 'text', 'date', 'timestamp with time zone'];
  present   regclass := to_regclass('public.physician_reports');
  kind      char;
  found     text[];
  missing   text[];
  surplus   text[];
  mismatch  text;
  anon_kind text;
  foreign_p text;
BEGIN
  IF present IS NULL THEN
    RAISE NOTICE 'guard: public.physician_reports does not exist yet; it will be created.';
    RETURN;
  END IF;

  SELECT relkind INTO kind FROM pg_class WHERE oid = present;
  IF kind <> 'r' THEN
    RAISE EXCEPTION 'guard: public.physician_reports exists but is not a plain table (relkind %). Refusing to attach a policy to it.', kind;
  END IF;

  SELECT array_agg(attname::text ORDER BY attname::text)
    INTO found
    FROM pg_attribute
   WHERE attrelid = present AND attnum > 0 AND NOT attisdropped;

  missing := ARRAY(SELECT unnest(expected_columns) EXCEPT SELECT unnest(found));
  surplus := ARRAY(SELECT unnest(found) EXCEPT SELECT unnest(expected_columns));

  IF COALESCE(array_length(missing, 1), 0) > 0 THEN
    RAISE EXCEPTION 'guard: the existing table is missing columns the app writes: %',
      array_to_string(missing, ', ');
  END IF;
  IF COALESCE(array_length(surplus, 1), 0) > 0 THEN
    RAISE EXCEPTION 'guard: the existing table has columns this migration does not know: %. Reconcile by hand - an unrecognised column may already be receiving data.',
      array_to_string(surplus, ', ');
  END IF;

  SELECT string_agg(c.column_name || ' is ' || c.data_type, ', ' ORDER BY c.column_name)
    INTO mismatch
    FROM information_schema.columns c
   WHERE c.table_schema = 'public' AND c.table_name = 'physician_reports'
     AND c.data_type <> expected_types[array_position(expected_columns, c.column_name)];
  IF mismatch IS NOT NULL THEN
    RAISE EXCEPTION 'guard: column types differ from what the app writes: %', mismatch;
  END IF;

  -- A second permissive INSERT policy for the same role is OR-ed with ours by
  -- PostgreSQL, so it would silently undo every WITH CHECK value below.
  SELECT string_agg(policyname || ' [' || cmd || ']', ', ' ORDER BY policyname)
    INTO foreign_p
    FROM pg_policies
   WHERE tablename = 'physician_reports'
     AND schemaname = 'public'
     AND 'anon' = ANY(roles)
     AND policyname <> 'anon may submit a physician report';
  IF foreign_p IS NOT NULL THEN
    RAISE EXCEPTION 'guard: anon is covered by policies this file did not write: %. One of them may grant a read, or may OR away the checks below. Reconcile first.',
      foreign_p;
  END IF;

  SELECT string_agg(privilege_type, ' ' ORDER BY privilege_type)
    INTO anon_kind
    FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND table_name = 'physician_reports' AND grantee = 'anon';

  IF anon_kind IS NULL OR anon_kind = '' THEN
    RAISE NOTICE 'guard: anon currently holds no privileges on the table; this file will grant INSERT.';
  ELSIF anon_kind <> 'INSERT' THEN
    RAISE NOTICE 'guard: anon holds % today. This file revokes everything and grants INSERT only. If that included a read, rows may already have been enumerable - treat it as a disclosure to investigate, not just a setting to change.',
      anon_kind;
  ELSE
    RAISE NOTICE 'guard: anon holds exactly INSERT; this file re-asserts the same posture.';
  END IF;
END
$guard$;

-- -----------------------------------------------------------------------------
-- PART 2b: SCHEMA AND POLICY — the shape submitRemoteReport() writes, then the
-- least-privilege grant over it.
-- -----------------------------------------------------------------------------
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
-- not touch policies created elsewhere — PART 1 lists what to check by hand first, and
-- PART 2a aborts the script if any of it is already there.
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
    -- A submission must carry a reporting date, and it must look like one rather
    -- than an arbitrary timestamp chosen to rewrite the feed's ordering. The column
    -- is nullable only so a manually backfilled row can exist; submitRemoteReport()
    -- always sends today's UTC calendar date, so requiring it here costs nothing and
    -- removes the one field the app would otherwise have to invent on screen.
    AND "date" IS NOT NULL
    AND "date" BETWEEN DATE '2020-01-01' AND CURRENT_DATE + 1
  );

-- -----------------------------------------------------------------------------
-- PART 2c: WHAT THIS FILE DELIBERATELY DOES NOT DO — abuse is not authorization.
--
-- Everything above decides what the `anon` role MAY do. It cannot decide how
-- OFTEN, and that is not an oversight: `anon` is a single shared principal, so
-- every visitor to the deployed site is the same database user as far as RLS is
-- concerned. There is no per-actor limit to attach, and no IP address reaches SQL.
-- The exposure that remains after this migration is:
--   * volume — anyone can append rows until the project's storage quota is hit;
--   * quality — the policy validates shape, not truth. "cardiology in cairo" is a
--     legal row whether or not such a physician submitted it.
-- Neither is solvable in this file. Reach for, in roughly this order:
--   1. A bot check on the form (Turnstile / reCAPTCHA) whose token the Edge Function
--      verifies before forwarding the insert. Keep the publishable key out of it.
--   2. A Supabase Edge Function or reverse-proxy rule as the only writer, rate
--      limiting per IP, with `anon` revoked entirely so the browser cannot reach the
--      table directly. That is the real fix, and it is a deployment change, not a
--      policy edit.
--   3. A retention job (pg_cron) deleting rows older than the study window, plus a
--      quota alert, so a bad day is bounded rather than permanent.
--   4. A `verified boolean NOT NULL DEFAULT false` column added in a LATER migration,
--      with the authenticated read policy gated on it. Unverified rows must never
--      feed a published number.
-- Point 4 matters the moment a read policy exists: computeWNIFromReports weights the
-- prior by min(1, n/15), so fifteen fabricated rows in one governorate saturate that
-- governorate's WNI, which is 15% of HNI. Today the damage stops at the table, because
-- anon cannot read it back and the app's scores come from the local seed. Keep it that
-- way until there is moderation.
--
-- Also unchanged: the browser must never hold a service-role key. It bypasses RLS for
-- every request that carries it, and Vite inlines any VITE_* value into the public
-- bundle. src/lib/dbService.js refuses to use one; keep it that way.
-- -----------------------------------------------------------------------------

-- Note on `id`: the client generates `report-${Date.now()}`, so two devices
-- submitting in the same millisecond collide on the primary key and one gets a
-- 409. The app reports that honestly and keeps the local copy, but it is a real
-- failure mode once more than one clinic is submitting, and a trivially scripted one.
-- The fix belongs in the client (append entropy to the id), not here: a UUID default
-- would require the app to stop sending `id` at all.

-- The PostgREST schema cache must be told a new table exists, otherwise requests from
-- the client keep returning HTTP 404 with code PGRST205, "Could not find the table
-- 'public.physician_reports' in the schema cache", even though the table is present.
NOTIFY pgrst, 'reload schema';

-- =============================================================================
-- PART 3: POST-APPLY VERIFICATION — nothing below this line changes the database.
-- Run the SQL in the editor, then the probes from a shell, and record the actual
-- answers. Do not mark this done from the migration's own success message.
-- =============================================================================
--
-- 3a. Shape and posture, in four read-only queries:
--
--   select c.relname, c.relkind, c.relrowsecurity
--     from pg_class c join pg_namespace n on n.oid = c.relnamespace
--    where n.nspname = 'public' and c.relname = 'physician_reports';
--   -- expect relkind 'r', relrowsecurity true
--
--   select column_name, data_type, is_nullable
--     from information_schema.columns
--    where table_schema = 'public' and table_name = 'physician_reports'
--    order by ordinal_position;
--   -- expect the twelve columns named in the guard above, with these exact types
--
--   select policyname, cmd, permissive, roles, with_check
--     from pg_policies where tablename = 'physician_reports';
--   -- expect exactly one row: our policy, cmd INSERT, roles {anon}
--   -- (pg_policies is the view: policyname/cmd/with_check. polname/polcmd/polqual
--   --  belong to the raw pg_policy catalog and are not valid here.)
--
--   select grantee, privilege_type
--     from information_schema.role_table_grants
--    where table_name = 'physician_reports' order by 1, 2;
--   -- expect one anon row: INSERT. Anything else is a wider door than this file claims.
--
-- 3b. Then from outside the database, with the same key the browser holds:
--
--   ANON=...  URL=https://<project>.supabase.co
--
--   1. Read must be denied BY PRIVILEGE, not by an empty result:
--      curl -s -D- -o- -w '\nHTTP %{http_code}\n' \
--        -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
--        "$URL/rest/v1/physician_reports?select=id&limit=1"
--      -> expect 403 (401 on some stacks) with "code":"42501".
--      READ THIS ONE CAREFULLY. A 200 with body [] is NOT the same result and is not
--      acceptable: it means anon does hold SELECT and RLS is merely hiding rows, in
--      which case src/lib/dbService.js classifies the connection as `ok` and the badge
--      says "Cloud Synced" over a table nobody can actually read. 3a's grant list is
--      what disambiguates them; if it shows SELECT, the REVOKE did not take.
--
--   2. A well-formed submission must be accepted:
--      curl -s -w '\nHTTP %{http_code}\n' -X POST \
--        -H "apikey: $ANON" -H "Authorization: Bearer $ANON" -H 'Content-Type: application/json' \
--        -d '{"id":"rls-probe-0001","doctor":"Probe","specialty":"cardiology","gov":"cairo","hospital":"Probe Hospital","considering_migration":"no","primary_reason":"salary","needed_support":"incentive","severity":3,"comment":"post-apply probe","date":"2026-01-01"}' \
--        "$URL/rest/v1/physician_reports"                        -> expect 201
--
--   3. Each clause of WITH CHECK, one variable at a time, so a pass cannot be hiding
--    behind an unrelated rejection. Every one of these must be 400 or 403:
--      gov          -d '{"id":"rls-probe-0003","specialty":"cardiology","gov":"atlantis","date":"2026-01-01"}'
--      specialty    -d '{"id":"rls-probe-0004","specialty":"obgyn","gov":"cairo","date":"2026-01-01"}'
--      date absent  -d '{"id":"rls-probe-0005","specialty":"cardiology","gov":"cairo"}'
--      date forged  -d '{"id":"rls-probe-0006","specialty":"cardiology","gov":"cairo","date":"2099-01-01"}'
--      severity     -d '{"id":"rls-probe-0007","specialty":"cardiology","gov":"cairo","date":"2026-01-01","severity":9}'
--      migration    -d '{"id":"rls-probe-0008","specialty":"cardiology","gov":"cairo","date":"2026-01-01","considering_migration":"maybe"}'
--      comment      -d "{\"id\":\"rls-probe-0009\",\"specialty\":\"cardiology\",\"gov\":\"cairo\",\"date\":\"2026-01-01\",\"comment\":\"$(python3 -c 'print("x"*1001)')\"}"
--      (the specialty case is the seed vocabulary from `survey_seed`, which the form
--       cannot produce - it is the value most likely to sneak back in.)
--
--   4. Anonymous delete must be denied:
--      curl -s -w '\nHTTP %{http_code}\n' -X DELETE \
--        -H "apikey: $ANON" -H "Authorization: Bearer $ANON" \
--        "$URL/rest/v1/physician_reports?id=eq.rls-probe-0001"   -> expect 401/403
--
--    Steps 2 and 3 write real rows and step 4 proves you cannot remove them with the
--    anon key — that asymmetry is the point. Clean up in the editor and confirm:
--      delete from public.physician_reports where id like 'rls-probe-%';
--      select count(*) as remaining_probes from public.physician_reports
--        where id like 'rls-probe-%';                              -- expect 0
--
--    A 200 on step 1 or a 2xx on step 4 means the posture is wider than this file
--    claims; treat that as a disclosure incident, since the rows name physicians and
--    record migration intent.
--
-- 3c. Finally, in the running app: the badge must read "Cloud submits allowed, reads
--    blocked", the feed must stay "Local Feed (this device)", and submitting a report
--    must toast "written to the cloud" without the badge upgrading itself.
-- =============================================================================
