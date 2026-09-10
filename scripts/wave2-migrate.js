/* Wave-2 schema migration: bookings, stock ledger, wholesale bulk rates, loyalty points.
   Uses the maintenance-flag pattern for direct writes. Idempotent-safe. */
require('dotenv').config({ path: '.env.local' });
const { Client } = require('pg');

const SQL = `
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text,
  item text not null,
  notes text,
  scheduled_at timestamptz not null,
  status text not null default 'scheduled'
    check (status in ('scheduled','ready','collected','cancelled')),
  order_no text,
  created_at timestamptz not null default now()
);

create table if not exists public.stock_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null default 'pcs',
  qty numeric not null default 0,
  low_threshold numeric not null default 5,
  updated_at timestamptz not null default now()
);

create table if not exists public.stock_log (
  id bigint generated always as identity primary key,
  item_id uuid not null references public.stock_items(id) on delete cascade,
  delta numeric not null,
  reason text,
  created_at timestamptz not null default now()
);

create table if not exists public.bulk_rates (
  id uuid primary key default gen_random_uuid(),
  label text not null,                       -- e.g. "12x16 Wood Frame"
  min_qty int not null default 10,
  unit_price numeric not null,
  sort int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.profiles add column if not exists loyalty_points int not null default 0;
alter table public.coupons  add column if not exists amount_off numeric;
alter table public.coupons  add column if not exists single_use boolean not null default false;
alter table public.coupons  add column if not exists used_order_no text;

-- RLS: bookings / stock / stock_log / bulk_rates are admin-write, bulk_rates public-read
alter table public.bookings enable row level security;
alter table public.stock_items enable row level security;
alter table public.stock_log enable row level security;
alter table public.bulk_rates enable row level security;

drop policy if exists bookings_all_admin on public.bookings;
create policy bookings_all_admin on public.bookings for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists stock_items_admin on public.stock_items;
create policy stock_items_admin on public.stock_items for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists stock_log_admin on public.stock_log;
create policy stock_log_admin on public.stock_log for all using (public.is_admin()) with check (public.is_admin());

drop policy if exists bulk_rates_admin on public.bulk_rates;
create policy bulk_rates_admin on public.bulk_rates for all using (public.is_admin()) with check (public.is_admin());
drop policy if exists bulk_rates_read on public.bulk_rates;
create policy bulk_rates_read on public.bulk_rates for select using (is_active);

-- register the write guards (JWT-or-maintenance + privileged) so the same protections apply
drop trigger if exists trg_auth_guard on public.bookings;
create trigger trg_auth_guard before insert or update or delete on public.bookings
  for each row execute function guard_authenticated_write();
drop trigger if exists trg_auth_guard on public.stock_items;
create trigger trg_auth_guard before insert or update or delete on public.stock_items
  for each row execute function guard_authenticated_write();
drop trigger if exists trg_auth_guard on public.stock_log;
create trigger trg_auth_guard before insert or update or delete on public.stock_log
  for each row execute function guard_authenticated_write();
drop trigger if exists trg_auth_guard on public.bulk_rates;
create trigger trg_auth_guard before insert or update or delete on public.bulk_rates
  for each row execute function guard_authenticated_write();

drop trigger if exists trg_bookings_privileged on public.bookings;
create trigger trg_bookings_privileged before insert or update or delete on public.bookings
  for each row execute function guard_privileged_write();
drop trigger if exists trg_stock_items_privileged on public.stock_items;
create trigger trg_stock_items_privileged before insert or update or delete on public.stock_items
  for each row execute function guard_privileged_write();
drop trigger if exists trg_stock_log_privileged on public.stock_log;
create trigger trg_stock_log_privileged before insert or update or delete on public.stock_log
  for each row execute function guard_privileged_write();
drop trigger if exists trg_bulk_rates_privileged on public.bulk_rates;
create trigger trg_bulk_rates_privileged before insert or update or delete on public.bulk_rates
  for each row execute function guard_privileged_write();

-- audit for the new admin tables
drop trigger if exists trg_audit_bookings on public.bookings;
create trigger trg_audit_bookings after insert or update or delete on public.bookings
  for each row execute function write_audit_log();
drop trigger if exists trg_audit_stock_items on public.stock_items;
create trigger trg_audit_stock_items after insert or update or delete on public.stock_items
  for each row execute function write_audit_log();
`;

(async () => {
  const c = new Client({ connectionString: process.env.INSFORGE_DATABASE_URL });
  await c.connect();
  await c.query('INSERT INTO ops.maintenance_flag ("on") VALUES (true)');
  try {
    await c.query(SQL);
    console.log('migration applied OK');
  } finally {
    await c.query('DELETE FROM ops.maintenance_flag');
  }
  // seed stock items + bulk rates if empty
  const n = await c.query('SELECT COUNT(*) c FROM public.stock_items');
  if (Number(n.rows[0].c) === 0) {
    await c.query(`INSERT INTO public.stock_items (name, unit, qty, low_threshold) VALUES
      ('Glass sheet 12x16in','pcs',20,5),('Glass sheet 16x20in','pcs',15,5),
      ('Teak wood frame blank 12x16','pcs',10,3),('Teak wood frame blank 16x20','pcs',10,3),
      ('Gold finish frame blank A4','pcs',12,4),('Mount board roll','ft',50,10),
      ('Backing board 12x16','pcs',40,10),('Corner clips','pcs',200,50),
      ('Photo paper glossy A4','pcs',100,25),('Hanging hooks','pcs',80,20)`);
    console.log('stock items seeded');
  }
  const b = await c.query('SELECT COUNT(*) c FROM public.bulk_rates');
  if (Number(b.rows[0].c) === 0) {
    await c.query(`INSERT INTO public.bulk_rates (label, min_qty, unit_price, sort) VALUES
      ('Standard 12x16 wood frame',10,650,1),('Standard 12x16 wood frame',25,600,2),
      ('Gold finish 12x16 frame',10,1100,3),('Gold finish 12x16 frame',25,990,4),
      ('Photo print A4 (glossy)',50,40,5),('Certificate frame A4',20,450,6)`);
    console.log('bulk rates seeded');
  }
  await c.end();
  console.log('DONE');
})().catch(e => { console.error('ERR', e.message); process.exit(1); });
