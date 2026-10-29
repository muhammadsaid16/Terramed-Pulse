-- =============================================================================
-- TerraPulse — 0001: physician_reports on Neon (PostgreSQL 18)
-- =============================================================================
-- Target: Neon Postgres, reached ONLY through the Cloudflare Pages Function in
--         functions/api/reports.js. Supabase/PostgREST is no longer part of this
--         project; the browser holds no database credential of any kind.
--
-- Probed against the live branch before writing this file:
--   server    PostgreSQL 18.6, default database, on a Neon branch of your own project
--   login     neondb_owner — NOT superuser, but rolcreaterole = true
--   objects   zero tables in neondb, so there is no pre-existing schema to merge
--   roles     anon / authenticated / service_role do NOT exist here
--
-- -----------------------------------------------------------------------------
-- WHY THE DESIGN CHANGED FROM THE SUPABASE VERSION
-- -----------------------------------------------------------------------------
-- A browser cannot speak Postgres. A connection string is owner-level access to
-- every row in the database, so it can never be inlined into a Vite bundle the way
-- an anon key was. The write path therefore moves server-side, and that changes two
-- things that were load-bearing before:
--
--   1. There is no `anon` role. RLS policies attached to a Supabase invention do
--      nothing here, so a dedicated LOGIN role `web_writer` is created and granted
--      INSERT on this one table. It is deliberately NOT the table owner: the owner
--      bypasses RLS entirely, so a policy on the owner's role is decoration.
--   2. RLS cannot answer "how often". Cloudflare Pages Functions are stateless V8
--      isolates that share no memory, so a per-IP counter cannot live in the
--      function either. It lives here, in admit_submission(), where every isolate
--      sees the same number.
--
-- -----------------------------------------------------------------------------
-- SECURITY POSTURE — WHAT THIS FILE ESTABLISHES
-- -----------------------------------------------------------------------------
--   web_writer INSERT  -> allowed, re-validated by table CHECKs AND the policy
--   web_writer SELECT  -> denied (42501). It has no read of physician_reports.
--   web_writer UPDATE/DELETE/TRUNCATE -> denied
--   web_writer EXECUTE -> admit_submission(text) only
--   neondb_owner       -> full access, for moderation from the SQL Editor. RLS does
--                        not bind the owner, which is why every predicate that must
--                        hold for ANYONE is a table CHECK, not only a policy clause.
--                        CHECKs bind the owner too; policies do not.
--
-- No read endpoint exists anywhere in the deployed system. Anonymous callers can
-- append a validated row and cannot enumerate, retrieve or alter a single report,
-- because the rows name physicians and record intent to leave the country.
--
-- Free-text columns are stored verbatim. `comment` and `hospital` can identify an
-- individual clinic or doctor: treat this table as personal data, keep it out of
-- public exports, and set retention deliberately (see the pg_cron block in PART 2c).
--
-- ip_hash holds sha-256(client IP + server-side salt), never the IP itself, and a
-- CHECK enforces the 64-hex shape so that a raw address cannot be stored in that
-- column even by the owner. It exists to make the quota work and nothing else.
--
-- Vocabulary warning, carried over because it caused a wrong policy once: this app
-- holds TWO specialty registers. The form and the matcher use the eight ids in
-- src/lib/specialties.js — the only values admitted below. The 45 `survey_seed`
-- rows in src/data/terrapulseData.js use different keys (`governorate`,
-- `note_en`/`note_ar`, no date) and three specialties the form cannot produce. They
-- are display fixtures. Do not widen the lists below to "load the demo data".
-- =============================================================================

-- -----------------------------------------------------------------------------
-- PART 1: PREFLIGHT — read-only. Run first, in its own tab, and read the answers.
--
--   select to_regclass('public.physician_reports') is not null as table_exists;
--
--   select column_name, data_type, is_nullable
--     from information_schema.columns
--    where table_schema = 'public' and table_name = 'physician_reports'
--    order by ordinal_position;                     -- empty = absent
--
--   select conname, pg_get_constraintdef(oid)
--     from pg_constraint
--    where conrelid = to_regclass('public.physician_reports');
--   -- to_regclass, NOT ::regclass: the cast raises when the table is absent, which
--   -- aborts every statement pasted after it in the same editor run.
--
--   select rolname, rolcanlogin, rolsuper, rolcreaterole, rolcreatedb
--     from pg_roles where rolname = 'web_writer';
--
--   select grantee, privilege_type, is_grantable
--     from information_schema.role_table_grants
--    where table_name = 'physician_reports' order by 1, 2;
--
--   select policyname, cmd, permissive, roles from pg_policies
--    where tablename = 'physician_reports';
--
-- Stop here and reconcile by hand if: the table exists with columns, types or
-- constraints this file does not name; web_writer exists with rolsuper,
-- rolcreaterole or rolcreatedb; any policy covers web_writer beyond the one below;
-- or web_writer already holds SELECT, UPDATE or DELETE.
-- PART 2a encodes the same checks and aborts, so a skipped preflight cannot become a
-- silent accept — but reading these five result sets first is still faster.
-- -----------------------------------------------------------------------------

-- -----------------------------------------------------------------------------
-- PART 2a: APPLY GUARD — runs before anything is created and aborts the whole
-- script rather than adapting to an object it does not recognise. CREATE TABLE IF
-- NOT EXISTS is not safe on its own: if the name is already taken by a view or by a
-- table with different columns it silently keeps that object, and the rest of this
-- file would attach a policy to something nobody audited.
-- -----------------------------------------------------------------------------
DO $guard$
DECLARE
  -- The exact shape functions/api/reports.js writes. Anything else is a different table.
  expected_columns text[] := ARRAY['id', 'doctor', 'specialty', 'gov', 'hospital',
    'considering_migration', 'primary_reason', 'needed_support', 'severity',
    'comment', 'date', 'submitted_at', 'ip_hash'];
  expected_types   text[] := ARRAY['uuid', 'text', 'text', 'text', 'text', 'text',
    'text', 'text', 'smallint', 'text', 'date', 'timestamp with time zone', 'text'];
  present    regclass := to_regclass('public.physician_reports');
  kind       char;
  owner      text;
  found      text[];
  missing    text[];
  surplus    text[];
  mismatch   text;
  writer     text;
  writer_bad text;
  foreign_p  text;
  foreign_g  text;
BEGIN
  -- The restricted role is the whole point. If it already exists with elevated
  -- attributes, or owns the table, every check below it can be walked past.
  SELECT rolname || ' login=' || rolcanlogin || ' super=' || rolsuper ||
         ' createrole=' || rolcreaterole || ' createdb=' || rolcreatedb
    INTO writer_bad
    FROM pg_roles
   WHERE rolname = 'web_writer'
     AND (rolsuper OR rolcreaterole OR rolcreatedb OR NOT rolcanlogin);
  IF writer_bad IS NOT NULL THEN
    RAISE EXCEPTION 'guard: web_writer exists but is not a plain login role (%). A superuser writer role bypasses every CHECK this file is about to make depend on. Fix the role first.', writer_bad;
  END IF;

  IF present IS NULL THEN
    RAISE NOTICE 'guard: public.physician_reports does not exist yet; it will be created.';
    RETURN;
  END IF;

  SELECT relkind, pg_get_userbyid(relowner) INTO kind, owner
    FROM pg_class WHERE oid = present;

  IF kind <> 'r' THEN
    RAISE EXCEPTION 'guard: public.physician_reports exists but is not a plain table (relkind %). Refusing to attach a policy to it.', kind;
  END IF;

  -- RLS is only enforced against roles that are not the owner. If web_writer owns
  -- the table it reads and writes it freely, and the INSERT-only grant means nothing.
  IF owner = 'web_writer' THEN
    RAISE EXCEPTION 'guard: web_writer owns public.physician_reports, so RLS cannot bind it and the INSERT-only posture is unenforceable. Re-owner the table to neondb_owner first.';
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

  -- A second permissive policy for the same role+command is OR-ed by PostgreSQL, so
  -- it would silently undo every WITH CHECK clause below.
  SELECT string_agg(policyname || ' [' || cmd || ']', ', ' ORDER BY policyname)
    INTO foreign_p
    FROM pg_policies
   WHERE schemaname = 'public' AND tablename = 'physician_reports'
     AND 'web_writer' = ANY(roles)
     AND policyname <> 'web_writer may submit a physician report';
  IF foreign_p IS NOT NULL THEN
    RAISE EXCEPTION 'guard: web_writer is covered by policies this file did not write: %. One may grant a read, or OR away the checks below. Reconcile first.', foreign_p;
  END IF;

  SELECT string_agg(privilege_type, ' ' ORDER BY privilege_type)
    INTO foreign_g
    FROM information_schema.role_table_grants
   WHERE table_schema = 'public' AND table_name = 'physician_reports' AND grantee = 'web_writer';

  IF foreign_g IS NULL OR foreign_g = '' THEN
    RAISE NOTICE 'guard: web_writer holds no privileges on the table yet; this file will grant INSERT.';
  ELSIF foreign_g <> 'INSERT' THEN
    RAISE NOTICE 'guard: web_writer holds % today. This file revokes everything and grants INSERT only. If that included a read, rows may already have been enumerable - treat it as a disclosure to investigate, not a setting to change.', foreign_g;
  ELSE
    RAISE NOTICE 'guard: web_writer holds exactly INSERT; this file re-asserts the same posture.';
  END IF;
  -- The quota lives in one row that a SECURITY DEFINER function reads. If that name is
  -- already taken by something else, the function would read someone's unrelated table
  -- and call it the limit — so the same "recognise it or refuse" rule applies here.
  IF to_regclass('public.submission_quota') IS NOT NULL THEN
    IF (SELECT relkind FROM pg_class WHERE oid = to_regclass('public.submission_quota')) <> 'r' THEN
      RAISE EXCEPTION 'guard: public.submission_quota exists but is not a plain table. Refusing to read it as the quota.';
    END IF;
    IF (SELECT count(*) FROM information_schema.columns
         WHERE table_schema = 'public' AND table_name = 'submission_quota') <> 2
       OR EXISTS (SELECT 1 FROM information_schema.columns
           WHERE table_schema = 'public' AND table_name = 'submission_quota'
             AND ((column_name = 'key' AND data_type <> 'text')
                  OR (column_name = 'value' AND data_type <> 'integer'))) THEN
      RAISE EXCEPTION 'guard: public.submission_quota exists with columns this file does not recognise; it would be read as the submission limit. Reconcile first.';
    END IF;
  END IF;
END
$guard$;

-- -----------------------------------------------------------------------------
-- PART 2b: SCHEMA, ROLE, PRIVILEGES, POLICY
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.physician_reports (
  -- Generated here, not in the browser: the old client id was `report-${Date.now()}`,
  -- so two devices submitting in the same millisecond collided on the primary key.
  id                     uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  doctor                 text,
  specialty              text        NOT NULL,
  -- governorate key: cairo | giza | alexandria | assiut | aswan
  gov                    text        NOT NULL,
  hospital               text,
  -- yes | hesitant | no. The Arabic equivalents are accepted for a manual or
  -- scripted insert; the form itself only ever sends the three English ids.
  considering_migration  text,
  primary_reason         text,
  needed_support         text,
  -- 1-5 in the UI; 0 is a real answer ("asymptomatic"), not a missing one
  severity               smallint,
  comment                text,
  -- ISO calendar date supplied by the client. Quoted because `date` is also a type
  -- keyword, and the app reads and writes that exact key.
  "date"                 date        NOT NULL,
  submitted_at           timestamptz NOT NULL DEFAULT now(),
  ip_hash                text        NOT NULL,

  -- Every predicate the app depends on lives here rather than only in the policy,
  -- because a CHECK also binds neondb_owner and a policy does not.
  CONSTRAINT physician_reports_severity_range
    CHECK (severity IS NULL OR (severity BETWEEN 0 AND 5)),
  CONSTRAINT physician_reports_migration_values
    CHECK (considering_migration IS NULL
           OR considering_migration IN ('yes', 'no', 'hesitant', 'undecided',
                                       'نعم', 'لا', 'متردد')),
  CONSTRAINT physician_reports_gov_values
    CHECK (gov IN ('cairo', 'giza', 'alexandria', 'assiut', 'aswan')),
  CONSTRAINT physician_reports_specialty_values
    CHECK (specialty IN ('nephrology', 'pulmonology', 'cardiology', 'emergency',
                         'pediatrics', 'geriatrics', 'dermatology_ophthalmology',
                         'occupational_preventive')),
  -- Caps match the input maxLength in the form exactly. char_length counts
  -- characters, so Arabic is measured the way a reader counts it.
  CONSTRAINT physician_reports_doctor_len
    CHECK (doctor IS NULL OR char_length(doctor) <= 120),
  CONSTRAINT physician_reports_hospital_len
    CHECK (hospital IS NULL OR char_length(hospital) <= 160),
  CONSTRAINT physician_reports_reason_len
    CHECK (primary_reason IS NULL OR char_length(primary_reason) <= 120),
  CONSTRAINT physician_reports_support_len
    CHECK (needed_support IS NULL OR char_length(needed_support) <= 120),
  CONSTRAINT physician_reports_comment_len
    CHECK (comment IS NULL OR char_length(comment) <= 1000),
  -- A submission must carry a reporting date, and it must look like one rather than
  -- an arbitrary timestamp chosen to reorder the feed. The +1 day slack is not
  -- sloppiness: `date` is the client's UTC calendar day and submitted_at is
  -- server-local, so a server on a negative UTC offset is one day behind it.
  CONSTRAINT physician_reports_date_range
    CHECK ("date" BETWEEN DATE '2020-01-01' AND CURRENT_DATE + 1),
  -- Enforces that only a hash can be stored, never a raw address.
  CONSTRAINT physician_reports_ip_hash_shape
    CHECK (ip_hash ~ '^[0-9a-f]{64}$')
);

CREATE INDEX IF NOT EXISTS physician_reports_submitted_at_desc
  ON public.physician_reports (submitted_at DESC);

CREATE INDEX IF NOT EXISTS physician_reports_gov_idx
  ON public.physician_reports (gov);

-- The quota lookup filters on (ip_hash, submitted_at) on every single insert, so it
-- needs its own index or it becomes the slowest part of the write path.
CREATE INDEX IF NOT EXISTS physician_reports_ip_hash_recent
  ON public.physician_reports (ip_hash, submitted_at DESC);

ALTER TABLE public.physician_reports ENABLE ROW LEVEL SECURITY;

-- Created without a password on purpose. Nothing in this file, in chat, or in git
-- ever carries a credential. Set one before deploying, and keep it out of the repo:
--   \password web_writer
-- then paste the result into the Cloudflare Pages secret NEON_URL — nowhere else.
DO $role$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'web_writer') THEN
    CREATE ROLE web_writer LOGIN;
    RAISE NOTICE 'role: web_writer created with no password; run \password before deploying.';
  ELSE
    RAISE NOTICE 'role: web_writer already exists; leaving its attributes alone.';
  END IF;
END
$role$;

-- Assert the posture rather than inherit it. REVOKE first so the result does not
-- depend on whatever default privileges this branch happens to have.
REVOKE ALL ON public.physician_reports FROM web_writer;
REVOKE ALL ON SCHEMA public FROM web_writer;
GRANT USAGE ON SCHEMA public TO web_writer;
GRANT INSERT ON public.physician_reports TO web_writer;

-- Opens the door for the writer role; the table CHECKs above are what decide what
-- comes through it. No USING clause: INSERT has no existing row to filter against.
DROP POLICY IF EXISTS "web_writer may submit a physician report" ON public.physician_reports;
CREATE POLICY "web_writer may submit a physician report"
  ON public.physician_reports FOR INSERT TO web_writer
  WITH CHECK (
    gov IN ('cairo', 'giza', 'alexandria', 'assiut', 'aswan')
    AND specialty IN ('nephrology', 'pulmonology', 'cardiology', 'emergency',
                      'pediatrics', 'geriatrics', 'dermatology_ophthalmology',
                      'occupational_preventive')
    AND (severity IS NULL OR severity BETWEEN 0 AND 5)
    AND (considering_migration IS NULL
         OR considering_migration IN ('yes', 'no', 'hesitant', 'undecided',
                                     'نعم', 'لا', 'متردد'))
    AND (doctor   IS NULL OR char_length(doctor)   <= 120)
    AND (hospital IS NULL OR char_length(hospital) <= 160)
    AND (primary_reason  IS NULL OR char_length(primary_reason)  <= 120)
    AND (needed_support  IS NULL OR char_length(needed_support)  <= 120)
    AND (comment IS NULL OR char_length(comment) <= 1000)
    AND "date" BETWEEN DATE '2020-01-01' AND CURRENT_DATE + 1
    AND ip_hash ~ '^[0-9a-f]{64}$'
  );

-- -----------------------------------------------------------------------------
-- PART 2c: THE QUOTA — abuse is not authorization, and this is the part that
-- cannot be solved by a policy.
--
-- web_writer may INSERT, and nothing limits how often. `web_writer` is one shared
-- principal for every visitor to the deployed site, so there is no per-actor key to
-- rate-limit on at the privilege layer, no IP reaches SQL by itself, and Pages
-- isolates cannot count between each other in memory. So the count lives here.
--
-- SECURITY DEFINER is required because counting recent rows needs SELECT, which the
-- writer role deliberately does not have. The function returns a single boolean and
-- exposes no row data, so the elevated read cannot become an information leak. PUBLIC
-- is revoked so only web_writer can call it at all.
-- -----------------------------------------------------------------------------
-- The quota itself lives in one row, not in a custom GUC. That is a measured
-- constraint, not a style choice: `ALTER DATABASE neondb SET
-- terrapulse.max_submissions_per_minute = 4` answers
-- `42501 permission denied to set parameter` on Neon, because only their
-- cloud_admin may introduce an unknown parameter — so a current_setting() lookup would
-- silently return '' for the life of the deployment and the limit would be whatever the
-- file hardcoded. A table the owner can UPDATE is adjustable from the SQL Editor, which
-- is the only console this project has.
CREATE TABLE IF NOT EXISTS public.submission_quota (
  key   text NOT NULL PRIMARY KEY CHECK (key = 'max_submissions_per_minute'),
  value int  NOT NULL CHECK (value BETWEEN 1 AND 1000)
);

-- ON CONFLICT DO NOTHING, not DO UPDATE: re-applying this file must not silently undo a
-- limit someone raised deliberately for the study window.
INSERT INTO public.submission_quota (key, value)
  VALUES ('max_submissions_per_minute', 6)
  ON CONFLICT (key) DO NOTHING;

-- Nobody reads this directly, including web_writer. The definer function below does,
-- which is the only reason it can be locked this tightly.
REVOKE ALL ON public.submission_quota FROM PUBLIC;
REVOKE ALL ON public.submission_quota FROM web_writer;

CREATE OR REPLACE FUNCTION public.admit_submission(p_ip_hash text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $fn$
DECLARE
  recent bigint;
  quota  int;
BEGIN
  IF p_ip_hash IS NULL OR p_ip_hash !~ '^[0-9a-f]{64}$' THEN
    -- An unusable key must not become an open gate.
    RETURN false;
  END IF;

  -- Serialise concurrent inserts from one address, so two requests arriving in the
  -- same instant cannot both read "under the limit" and both land.
  PERFORM pg_advisory_xact_lock(hashtext(p_ip_hash));

  SELECT value INTO quota FROM public.submission_quota
    WHERE key = 'max_submissions_per_minute';
  -- A deleted row is not an open gate either.
  quota := coalesce(quota, 6);

  SELECT count(*) INTO recent
    FROM public.physician_reports
   WHERE ip_hash = p_ip_hash
     AND submitted_at > now() - interval '1 minute';

  RETURN recent < quota;
END
$fn$;

REVOKE ALL ON FUNCTION public.admit_submission(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.admit_submission(text) TO web_writer;

-- The writer's door is one function call. It is granted EXECUTE and INSERT and
-- nothing else: no SELECT, no UPDATE, no DELETE, no TRUNCATE, no reference to any
-- other table in this database.
--
-- -----------------------------------------------------------------------------
-- THE ONE STATEMENT THE PROXY MAY ISSUE (measured, not assumed)
-- -----------------------------------------------------------------------------
--   insert into public.physician_reports
--     (doctor, specialty, gov, hospital, considering_migration, primary_reason,
--      needed_support, severity, comment, "date", ip_hash)
--   select $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11
--     where public.admit_submission($11);
--
-- Four properties, each of which broke a first attempt at this design:
--
--   * NO `returning`. `INSERT ... RETURNING` is a read of the new row, so it needs
--     SELECT visibility; an INSERT-only role gets 42501 on an otherwise perfectly
--     legal insert (observed: `RETURNING id` -> 42501, same statement without it ->
--     INSERT rowCount=1). The proxy therefore learns the outcome from rowCount, not
--     from the row: 1 = stored, 0 = refused by the quota. The client never needed the
--     database id, because `id` is now generated by gen_random_uuid() here.
--   * ONE statement. `where admit_submission(...)` makes the check and the write
--     atomic; two round trips would let concurrent isolates both read "under the
--     limit". It also matters mechanically: Neon's HTTP SQL driver runs each query in
--     its own transaction, so a `begin`/`insert`/`commit` sequence through the pooled
--     endpoint is not one transaction at all, and the advisory xact lock would be
--     released between the check and the write.
--   * rowCount 0 is not an error. It is the quota saying no, and it must surface as
--     429 with the same "the row is not in the cloud" honesty as a rejection — never
--     as a 201 the app then describes as synced.
--   * The connection belongs to one request. A client built at module scope and reused
--     by the next invocation answers the first submission and hangs the second:
--     Workers binds every I/O object to the request that created it (observed under
--     `wrangler pages dev`: 201, then "Cannot perform I/O on behalf of a different
--     request"). Reuse happens at Neon's pooler and in the driver's fetch connection
--     cache instead — which is why this quota is a per-address window in the table and
--     not an in-process counter.
-- -----------------------------------------------------------------------------
--
-- Optional retention (pg_cron is available on this branch; enable it deliberately,
-- because deleting research data is not a cleanup detail):
--   CREATE EXTENSION IF NOT EXISTS pg_cron;
--   SELECT cron.schedule('terrapulse-retention', '17 3 * * *',
--     $$DELETE FROM public.physician_reports WHERE submitted_at < now() - interval '18 months'$$);
--
-- Still not solved here, and now the only remaining gap: the quota bounds one
-- address's volume, not its truth. A determined actor with many addresses can still
-- append rows that satisfy every CHECK. The answer is a bot check (Turnstile) whose
-- token the function verifies before it calls admit_submission — a form change plus
-- one verification call, not a schema change. It stays out of this migration because
-- blocking real physicians in Upper Egypt is a product decision, not a config flag.
-- -----------------------------------------------------------------------------

-- =============================================================================
-- PART 3: POST-APPLY VERIFICATION — nothing below this line changes the database.
-- Record the actual answers; do not mark this done from the migration's own
-- success message. Run as neondb_owner in the SQL Editor unless stated otherwise.
-- =============================================================================
--
-- 3a. Shape and posture:
--
--   select c.relname, c.relkind, c.relrowsecurity,
--          pg_get_userbyid(c.relowner) as owner
--     from pg_class c join pg_namespace n on n.oid = c.relnamespace
--    where n.nspname = 'public' and c.relname = 'physician_reports';
--   -- expect relkind r, relrowsecurity true, owner neondb_owner (NOT web_writer)
--
--   select conname, pg_get_constraintdef(oid)
--     from pg_constraint where conrelid = 'public.physician_reports'::regclass
--    order by conname;
--   -- expect the pkey plus all ten CHECKs named in PART 2b
--
--   select policyname, cmd, permissive, roles, with_check
--     from pg_policies where tablename = 'physician_reports';
--   -- expect exactly one row: our policy, cmd INSERT, roles {web_writer}
--   -- (pg_policies is the view: policyname/cmd/with_check. polname/polcmd/polqual
--   --  are raw pg_policy columns and are not valid here.)
--
--   select grantee, privilege_type
--     from information_schema.role_table_grants
--    where table_name = 'physician_reports' order by 1, 2;
--   -- expect one web_writer row: INSERT. Anything else is a wider door than claimed.
--
--   select pr.rolname, pr.rolcanlogin, pr.rolsuper, pr.rolcreaterole, pr.rolcreatedb
--     from pg_roles pr where pr.rolname = 'web_writer';
--   -- expect login true, super false, createrole false, createdb false
--
--   select nspname, dataacl from pg_namespace where nspname = 'public';
--
-- 3b. Prove RLS binds. Do it with a REAL web_writer login, not `set role`.
--
--     `set role web_writer` from an owner session is not the test. Two reasons, both
--     observed here: the same session could then `set role neondb_owner` again and
--     read every row (it did: count = 4), so a denial under SET ROLE does not prove a
--     login cannot escalate; and SET ROLE only works while a membership edge with
--     inherit_option = true exists, which the migration does not create. Authenticate
--     as web_writer with its own credential — the one line that actually tests the
--     role the deployed proxy will hold.
--
--   \setenv ... psql 'postgresql://web_writer:***@<direct-host>/neondb?sslmode=require&channel_binding=require'
--   -- use the DIRECT endpoint (host without "-pooler"): through transaction pooling,
--   -- session state is not guaranteed to land on one backend.
--
--   select current_user, session_user;                -- both web_writer, or you are
--                                                      not testing what you think
--   select count(*) from public.physician_reports;    -- expect 42501
--   set role neondb_owner;                            -- expect 42501 permission denied
--   select public.admit_submission(repeat('a',64));   -- expect true, EXECUTE granted
--   insert into public.physician_reports (doctor, specialty, gov, hospital,
--     considering_migration, primary_reason, needed_support, severity, comment,
--     "date", ip_hash)
--     values ('RLS probe','cardiology','cairo','Probe Hospital','no','salary',
--             'incentive',3,'post-apply probe',current_date,repeat('a',64));
--                                                      -- expect INSERT, 1 row
--   create role esc_test login;                       -- expect 42501
--   alter table public.physician_reports force row level security;  -- expect 42501
--   drop policy "web_writer may submit a physician report" on public.physician_reports;
--                                                      -- expect 42501
--   select * from pg_shadow limit 1;                  -- expect 42501
--
--   Observed 2026-10-29 on this branch: all twelve statements above behaved exactly as
--   predicted from a real web_writer login — the writer could insert and call the
--   quota function and nothing else — and after `alter role web_writer password null`
--   the same credential no longer authenticated (28P01). UPDATE, DELETE and TRUNCATE
--   were proven denied only in the owner-session variant, because the login test needs
--   a credential this file deliberately does not create. Re-run them from the login if
--   you want that covered too.
--
--   Two negative results worth recording because they are counter-intuitive:
--     * `grant select on public.physician_reports to web_writer` issued by web_writer
--       itself is ACCEPTED and does nothing: relacl was unchanged when read back in
--       the same transaction and has_table_privilege(...,'select') stayed false. Do
--       not read a successful GRANT as a privilege change; read relacl.
--     * `select count(*) from pg_roles` SUCCEEDS. System catalogs are PUBLIC-readable
--       by design; role names are not the secret. The catalog that matters is
--       pg_authid / pg_shadow (credential material), and both are denied.
--
--   A successful SELECT means the REVOKE did not take and the public endpoint is a
--   read endpoint. Treat that as a disclosure incident, not a setting to change. The
--   probe row is removed in 3e.
--
--   If you must test from the owner session instead, grant the membership first
--   (`grant web_writer to neondb_owner`) and revoke it in the same sitting — Neon's
--   CREATE ROLE leaves an edge with grantor cloud_admin and admin_option = true, so
--   the revoke is possible and you will not be stuck with it. Run each statement in
--   its own transaction: the first 42501 aborts a transaction, and every statement
--   after it in the same batch reports 25P02 instead of its own verdict, which looks
--   like six denials and proves nothing.
--
-- 3c. Prove the CHECKs bind the OWNER (they are the layer that does not care about
--     roles). Each must raise 23514 check_violation, run as neondb_owner:
--
--   insert into public.physician_reports (specialty, gov, "date", ip_hash)
--     values ('cardiology', 'atlantis', current_date, repeat('b',64));   -- gov
--   insert into public.physician_reports (specialty, gov, "date", ip_hash)
--     values ('obgyn', 'cairo', current_date, repeat('b',64));           -- specialty
--   insert into public.physician_reports (specialty, gov, "date", ip_hash)
--     values ('cardiology', 'cairo', DATE '2099-01-01', repeat('b',64)); -- forged date
--   insert into public.physician_reports (specialty, gov, "date", ip_hash, severity)
--     values ('cardiology', 'cairo', current_date, repeat('b',64), 9);    -- severity
--   insert into public.physician_reports (specialty, gov, "date", ip_hash,
--         considering_migration)
--     values ('cardiology', 'cairo', current_date, repeat('b',64), 'maybe');
--   insert into public.physician_reports (specialty, gov, "date", ip_hash, comment)
--     values ('cardiology', 'cairo', current_date, repeat('b',64),
--             repeat('x', 1001));                                          -- comment
--   insert into public.physician_reports (specialty, gov, "date", ip_hash)
--     values ('cardiology', 'cairo', current_date, 'not-a-hash');          -- raw IP shape
--
-- 3d. Prove the quota. As neondb_owner, with a distinct hash. No `returning` — the
--     same read-of-new-row problem as above, and here it would mask the very rowCount
--     signal the proxy branches on:
--
--   select public.admit_submission(repeat('c',64));                 -- expect true
--   insert into public.physician_reports (specialty, gov, "date", ip_hash)
--     select 'cardiology','cairo',current_date,repeat('c',64)
--       where public.admit_submission(repeat('c',64));              -- expect 1 row
--   -- repeat the insert above; the statement then returns ZERO rows, which is what
--   -- the function turns into 429.
--   select count(*) from public.physician_reports
--     where ip_hash = repeat('c',64);                                -- expect exactly 6
--   -- Rejected attempts must leave nothing behind: the count cannot exceed the quota.
--
--   Observed 2026-10-29, twelve back-to-back statements as web_writer: rowCounts
--   1,1,1,1,1,1,0,0,0,0,0,0 — six stored, six refused, no errors, and the count for
--   that hash stayed at 6. The advisory lock is what makes the sixth the sixth.
--
-- 3e. Clean up every probe row and CONFIRM it, do not assume it:
--
--   delete from public.physician_reports
--     where doctor in ('RLS probe') or ip_hash in (repeat('a',64), repeat('c',64));
--   select count(*) as remaining_probes from public.physician_reports;  -- expect 0
--
--   Also check nothing else was left behind, in the same sitting as the role edges:
--
--   select r.rolname, m.rolname as member, go.rolname as grantor,
--          am.admin_option, am.inherit_option
--     from pg_auth_members am
--     join pg_roles r on r.oid = am.roleid
--     join pg_roles m on m.oid = am.member
--     join pg_roles go on go.oid = am.grantor
--    where r.rolname = 'web_writer';
--   -- expect exactly the one edge Neon created, inherit_option = false. A second row
--   -- with inherit_option = true is a test membership that lets the owner session
--   -- become the writer; revoke it (revoke web_writer from neondb_owner).
--   -- Observed here: the migration left one cloud_admin edge; the test edge that a
--   -- `grant web_writer to neondb_owner` added was revoked and confirmed gone.
--
-- 3f. From outside, through the deployed function (not the database):
--
--   POST https://<site>.pages.dev/api/reports   valid payload  -> 201 {stored:true}
--        — and deliberately not the row id: reading it back would need SELECT, which
--          is the privilege this design withholds. The client keeps its own local key.
--   POST with gov=atlantis / specialty=obgyn / severity=9 / date=2099-01-01
--        / comment of 1001 chars / a key that is not a column  -> 400
--   POST 7× in a minute from one address                        -> 429
--   GET  /api/reports                                           -> 405
--   GET  /api/status                                            -> 200, no row data
--   The app must show "Cloud submits allowed, reads blocked" and the feed must stay
--   "Local Feed (this device)". A 201 must not upgrade the badge.
-- =============================================================================
