-- ═══════════════════════════════════════════════════════════════════════════
-- 004 — Write guards (defense in depth) · applied live 2026-08-23
--
-- WHY: InsForge's /api/database/records endpoint evaluates RLS ONLY for
-- requests carrying a real user session JWT (request.jwt.claims is set).
-- A request authenticated with the project key alone runs as a superuser
-- connection with NO claims → RLS is bypassed. Triggers still fire for
-- superusers, so every table gets a BEFORE write trigger requiring
-- auth.uid() (exceptions only via the hidden ops.maintenance_flag).
-- ═══════════════════════════════════════════════════════════════════════════

create schema if not exists ops;
create table if not exists ops.maintenance_flag ("on" boolean not null default false);
-- the ops schema is NOT exposed by /api/database/records (public schema only) —
-- verified: /api/database/records/maintenance_flag → 404

create or replace function public.guard_authenticated_write()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  -- allow only real signed-in user sessions (RLS then scopes what they can do)
  if auth.uid() is null and not exists (select 1 from ops.maintenance_flag where "on") then
    raise exception 'Write blocked: a signed-in user session is required';
  end if;
  if tg_op = 'DELETE' then return old; end if;
  return new;
end;
$$;

-- attach to every app table (INSERT/UPDATE/DELETE)
create trigger trg_auth_guard before insert or update or delete on public.products
  for each row execute function public.guard_authenticated_write();
create trigger trg_auth_guard before insert or update or delete on public.categories
  for each row execute function public.guard_authenticated_write();
create trigger trg_auth_guard before insert or update or delete on public.product_images
  for each row execute function public.guard_authenticated_write();
create trigger trg_auth_guard before insert or update or delete on public.frame_options
  for each row execute function public.guard_authenticated_write();
create trigger trg_auth_guard before insert or update or delete on public.orders
  for each row execute function public.guard_authenticated_write();
create trigger trg_auth_guard before insert or update or delete on public.order_items
  for each row execute function public.guard_authenticated_write();
create trigger trg_auth_guard before insert or update or delete on public.payment_proofs
  for each row execute function public.guard_authenticated_write();
create trigger trg_auth_guard before insert or update or delete on public.promos
  for each row execute function public.guard_authenticated_write();
create trigger trg_auth_guard before insert or update or delete on public.reviews
  for each row execute function public.guard_authenticated_write();
create trigger trg_auth_guard before insert or update or delete on public.audit_logs
  for each row execute function public.guard_authenticated_write();
create trigger trg_auth_guard before insert or update or delete on public.site_settings
  for each row execute function public.guard_authenticated_write();
create trigger trg_auth_guard before insert or update or delete on public.content_blocks
  for each row execute function public.guard_authenticated_write();
-- profiles: UPDATE/DELETE only — INSERT must stay open (signup hook inserts
-- the row with no claims; the FK to auth.users blocks junk inserts)
create trigger trg_auth_guard before update or delete on public.profiles
  for each row execute function public.guard_authenticated_write();

-- owners can remove spam users' profiles through the API with their admin JWT
create policy profiles_delete_admin on public.profiles
  for delete using (public.is_admin());

-- ── OPERATOR MAINTENANCE (e.g. deleting a user from auth.users) ─────────────
--  insert into ops.maintenance_flag("on") values (true);   -- hatch open
--  ... do service-side SQL work ...
--  delete from ops.maintenance_flag;                        -- hatch closed
-- Keep the flag table EMPTY at all other times (verified: count = 0).
