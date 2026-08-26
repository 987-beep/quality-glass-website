-- ═══════════════════════════════════════════════════════════════════════════
-- v1.4 — Offer codes (listing feature #3)
--
-- coupons: festival-sale codes like DIWALI10 (percent off, optional min order).
-- Active codes are publicly readable BY DESIGN — they are marketing codes you
-- share in WhatsApp status / shop posters. Inactive + future codes stay hidden.
-- Only admins can write (RLS + privileged guard trigger, same model as promos).
-- orders gains coupon_code + discount_amount so the bookkeeping stays exact;
-- order_items keep REAL prices (price-integrity trigger untouched) — the
-- discount lives at order level only.
-- ═══════════════════════════════════════════════════════════════════════════

create table if not exists public.coupons (
  id          uuid primary key default gen_random_uuid(),
  code        text not null unique,
  percent_off int  not null check (percent_off between 1 and 90),
  min_order   numeric(10, 2) not null default 0,
  is_active   boolean not null default true,
  starts_at   timestamptz,
  ends_at     timestamptz,
  note        text,
  created_at  timestamptz not null default now()
);

alter table public.orders add column if not exists coupon_code text;
alter table public.orders add column if not exists discount_amount numeric(10, 2) not null default 0;

alter table public.coupons enable row level security;

-- active, in-window codes are visible to everyone (marketing codes);
-- anything inactive / not-yet-started / expired is invisible without admin
drop policy if exists coupons_read on public.coupons;
create policy coupons_read on public.coupons for select
  using (
    (is_active and (starts_at is null or starts_at <= now()) and (ends_at is null or ends_at >= now()))
    or is_admin()
  );

drop policy if exists coupons_admin_write on public.coupons;
create policy coupons_admin_write on public.coupons for all
  using (is_admin()) with check (is_admin());

-- same defense-in-depth guards as every other app table
drop trigger if exists trg_auth_guard on public.coupons;
create trigger trg_auth_guard before insert or update or delete on public.coupons
  for each row execute function public.guard_authenticated_write();
drop trigger if exists trg_coupons_privileged on public.coupons;
create trigger trg_coupons_privileged before insert or update or delete on public.coupons
  for each row execute function public.guard_privileged_write();

-- audit trail for coupon edits
drop trigger if exists trg_audit_coupons on public.coupons;
create trigger trg_audit_coupons after insert or update or delete on public.coupons
  for each row execute function public.write_audit_log();
