-- ═══════════════════════════════════════════════════════════════════════════
--  Quality Glass Emporium — Promote a user to ADMIN
--  Run in: InsForge dashboard → SQL editor (or psql with the connection string)
-- ═══════════════════════════════════════════════════════════════════════════

-- OPTION A (normal case — an admin already exists, e.g. the owner):
-- The trg_role_guard trigger allows role changes BY an admin, so this works
-- when run from the owner's session, or from the dashboard SQL editor
-- if any admin already exists. Match by @username (preferred) or email:

update public.profiles
set role = 'admin'
where username = 'their_username';        -- ← change me (no @, lowercase)
-- or:  where id = (select id from auth.users where email = 'their@email.com');

-- OPTION B (bootstrap — NO admin exists yet; the trigger blocks role changes
-- because is_admin() is false for everyone).
-- Send ALL THREE statements together in one call:

-- alter table public.profiles disable trigger trg_role_guard;
-- update public.profiles set role='admin' where username = 'their_username';
-- alter table public.profiles enable trigger trg_role_guard;

-- Verify afterwards (must show tgenabled = 'O'):
-- select tgname, tgenabled from pg_trigger where tgname = 'trg_role_guard';

-- ─────────────────────────────────────────────────────────────────────────────
--  OWNER ACCOUNT (created 2026-08-23):
--    username : owneajmal69        → login as @OWNEAJMAL69
--    password : [INSERT YOUR OWNER PASSWORD]
--    name     : Ajmal              role: admin ✅ verified
-- ─────────────────────────────────────────────────────────────────────────────
