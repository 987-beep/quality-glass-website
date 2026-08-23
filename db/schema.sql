-- ============================================================
-- QUALITY GLASS EMPORIUM — InsForge schema v1
-- Idempotent: safe to re-run. All tables protected by RLS.
-- Roles: anonymous visitor (public read), customer (own data), admin (full)
-- ============================================================

create extension if not exists "pgcrypto";

-- ============================================================
-- 1. PROFILES  (linked 1:1 to auth.users)
-- ============================================================
create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  full_name  text not null default '',
  phone      text,
  role       text not null default 'customer' check (role in ('customer', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

-- helper: is the current user an admin? (SECURITY DEFINER avoids RLS recursion)
create or replace function public.is_admin()
returns boolean
language sql stable security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'admin'
  )
$$;

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
exception when others then
  insert into public.profiles (id) values (new.id) on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- prevent customers from flipping their own role
create or replace function public.prevent_role_escalation()
returns trigger
language plpgsql security definer
set search_path = public
as $$
begin
  if new.role <> old.role and not public.is_admin() then
    raise exception 'Role change not permitted';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_role_guard on public.profiles;
create trigger trg_role_guard
  before update on public.profiles
  for each row execute function public.prevent_role_escalation();

alter table public.profiles enable row level security;
drop policy if exists profiles_select on public.profiles;
create policy profiles_select on public.profiles
  for select using (auth.uid() = id or public.is_admin());
drop policy if exists profiles_insert on public.profiles;
create policy profiles_insert on public.profiles
  for insert with check (auth.uid() = id);
drop policy if exists profiles_update on public.profiles;
create policy profiles_update on public.profiles
  for update using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

-- generic updated_at touch
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================
-- 2. CATALOG — categories, products, product_images, frame_options
-- ============================================================
create table if not exists public.categories (
  id         uuid primary key default gen_random_uuid(),
  slug       text not null unique,
  name       jsonb not null,            -- {"en":"..","hi":".."}
  description jsonb,
  image_url  text,
  sort       int not null default 0,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.products (
  id          uuid primary key default gen_random_uuid(),
  category_id uuid references public.categories (id) on delete set null,
  slug        text not null unique,
  name        jsonb not null,
  description jsonb,
  base_price  numeric(10, 2) not null default 0,
  frame_tone  text not null default 'gold',
  is_featured boolean not null default false,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index if not exists products_category_idx on public.products (category_id);

create table if not exists public.product_images (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  url        text not null,
  storage_key text,
  alt        text,
  sort       int not null default 0
);

create index if not exists product_images_product_idx on public.product_images (product_id);

create table if not exists public.frame_options (
  id          uuid primary key default gen_random_uuid(),
  key         text not null unique,
  kind        text not null check (kind in ('size', 'moulding', 'mat', 'glass')),
  name        jsonb not null,
  price_delta numeric(10, 2) not null default 0,
  sort        int not null default 0,
  is_active   boolean not null default true
);

drop trigger if exists trg_products_touch on public.products;
create trigger trg_products_touch before update on public.products
  for each row execute function public.touch_updated_at();

alter table public.categories enable row level security;
drop policy if exists categories_read on public.categories;
create policy categories_read on public.categories
  for select using (is_active or public.is_admin());
drop policy if exists categories_admin_write on public.categories;
create policy categories_admin_write on public.categories
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.products enable row level security;
drop policy if exists products_read on public.products;
create policy products_read on public.products
  for select using (is_active or public.is_admin());
drop policy if exists products_admin_write on public.products;
create policy products_admin_write on public.products
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.product_images enable row level security;
drop policy if exists product_images_read on public.product_images;
create policy product_images_read on public.product_images
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.products pr
      where pr.id = product_id and pr.is_active
    )
  );
drop policy if exists product_images_admin_write on public.product_images;
create policy product_images_admin_write on public.product_images
  for all using (public.is_admin()) with check (public.is_admin());

alter table public.frame_options enable row level security;
drop policy if exists frame_options_read on public.frame_options;
create policy frame_options_read on public.frame_options
  for select using (is_active or public.is_admin());
drop policy if exists frame_options_admin_write on public.frame_options;
create policy frame_options_admin_write on public.frame_options
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 3. COMMERCE — orders, order_items, payment_proofs
-- ============================================================
create table if not exists public.orders (
  id               uuid primary key default gen_random_uuid(),
  order_no         text not null unique,
  user_id          uuid not null references public.profiles (id) on delete cascade,
  status           text not null default 'payment_pending'
    check (status in (
      'payment_pending', 'payment_verifying', 'payment_rejected',
      'paid', 'in_production', 'ready_for_pickup',
      'out_for_delivery', 'completed', 'cancelled'
    )),
  total_amount     numeric(10, 2) not null default 0,
  currency         text not null default 'INR',
  delivery_method  text not null default 'pickup'
    check (delivery_method in ('pickup', 'local_delivery')),
  delivery_address jsonb,
  customer_note    text,
  admin_note       text,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

create index if not exists orders_user_idx on public.orders (user_id);
create index if not exists orders_status_idx on public.orders (status);

drop trigger if exists trg_orders_touch on public.orders;
create trigger trg_orders_touch before update on public.orders
  for each row execute function public.touch_updated_at();

alter table public.orders enable row level security;
drop policy if exists orders_select on public.orders;
create policy orders_select on public.orders
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists orders_insert on public.orders;
create policy orders_insert on public.orders
  for insert with check (
    auth.uid() = user_id and status in ('payment_pending', 'payment_verifying')
  );
drop policy if exists orders_update_admin on public.orders;
create policy orders_update_admin on public.orders
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists orders_delete_admin on public.orders;
create policy orders_delete_admin on public.orders
  for delete using (public.is_admin());

create table if not exists public.order_items (
  id           uuid primary key default gen_random_uuid(),
  order_id     uuid not null references public.orders (id) on delete cascade,
  product_id   uuid references public.products (id) on delete set null,
  name         jsonb not null,
  options      jsonb,
  qty          int not null default 1 check (qty > 0),
  unit_price   numeric(10, 2) not null,
  custom_upload_url text,
  custom_upload_key text,
  line_total   numeric(10, 2) not null
);

create index if not exists order_items_order_idx on public.order_items (order_id);

alter table public.order_items enable row level security;
drop policy if exists order_items_select on public.order_items;
create policy order_items_select on public.order_items
  for select using (
    public.is_admin()
    or exists (
      select 1 from public.orders o
      where o.id = order_id and o.user_id = auth.uid()
    )
  );
drop policy if exists order_items_insert on public.order_items;
create policy order_items_insert on public.order_items
  for insert with check (
    exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
        and o.status in ('payment_pending', 'payment_verifying')
    )
    or public.is_admin()
  );
drop policy if exists order_items_admin_write on public.order_items;
create policy order_items_admin_write on public.order_items
  for update using (public.is_admin()) with check (public.is_admin());

create table if not exists public.payment_proofs (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  storage_key text not null,
  file_url    text,
  utr         text,
  status      text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note  text,
  reviewed_by uuid,
  reviewed_at timestamptz,
  created_at  timestamptz not null default now()
);

create index if not exists payment_proofs_order_idx on public.payment_proofs (order_id);
create index if not exists payment_proofs_status_idx on public.payment_proofs (status);

alter table public.payment_proofs enable row level security;
drop policy if exists proofs_select on public.payment_proofs;
create policy proofs_select on public.payment_proofs
  for select using (auth.uid() = user_id or public.is_admin());
drop policy if exists proofs_insert on public.payment_proofs;
create policy proofs_insert on public.payment_proofs
  for insert with check (
    auth.uid() = user_id
    and exists (
      select 1 from public.orders o
      where o.id = order_id
        and o.user_id = auth.uid()
        and o.status in ('payment_pending', 'payment_verifying', 'payment_rejected')
    )
  );
drop policy if exists proofs_update_admin on public.payment_proofs;
create policy proofs_update_admin on public.payment_proofs
  for update using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 4. CMS — content_blocks (Live Edit), promos (ads), reviews, audit_logs, site_settings
-- ============================================================
create table if not exists public.content_blocks (
  key        text primary key,        -- e.g. "home.hero.headline"
  type       text not null check (type in ('text', 'image', 'richtext')),
  value      jsonb not null default '{}'::jsonb,
  updated_by uuid,
  updated_at timestamptz not null default now()
);

alter table public.content_blocks enable row level security;
drop policy if exists content_read on public.content_blocks;
create policy content_read on public.content_blocks for select using (true);
drop policy if exists content_admin_write on public.content_blocks;
create policy content_admin_write on public.content_blocks
  for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.promos (
  id         uuid primary key default gen_random_uuid(),
  title      jsonb not null,
  image_url  text not null,
  link       text,
  position   text not null default 'home_top',
  sort       int not null default 0,
  is_active  boolean not null default true,
  starts_at  timestamptz,
  ends_at    timestamptz,
  created_at timestamptz not null default now()
);

alter table public.promos enable row level security;
drop policy if exists promos_read on public.promos;
create policy promos_read on public.promos
  for select using (
    public.is_admin()
    or (
      is_active
      and (starts_at is null or starts_at <= now())
      and (ends_at is null or ends_at >= now())
    )
  );
drop policy if exists promos_admin_write on public.promos;
create policy promos_admin_write on public.promos
  for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.reviews (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references public.profiles (id) on delete set null,
  author_name text not null,
  area        text,
  rating      int not null default 5 check (rating between 1 and 5),
  quote       jsonb not null,          -- {"en":"..","hi":".."}
  is_approved boolean not null default false,
  created_at  timestamptz not null default now()
);

alter table public.reviews enable row level security;
drop policy if exists reviews_read on public.reviews;
create policy reviews_read on public.reviews
  for select using (is_approved or auth.uid() = user_id or public.is_admin());
drop policy if exists reviews_insert on public.reviews;
create policy reviews_insert on public.reviews
  for insert with check (auth.uid() = user_id and is_approved = false);
drop policy if exists reviews_admin_write on public.reviews;
create policy reviews_admin_write on public.reviews
  for update using (public.is_admin()) with check (public.is_admin());
drop policy if exists reviews_admin_delete on public.reviews;
create policy reviews_admin_delete on public.reviews
  for delete using (public.is_admin());

create table if not exists public.audit_logs (
  id         bigint generated always as identity primary key,
  actor_id   uuid,
  action     text not null,
  entity     text,
  entity_id  text,
  meta       jsonb,
  created_at timestamptz not null default now()
);

alter table public.audit_logs enable row level security;
drop policy if exists audit_admin_all on public.audit_logs;
create policy audit_admin_all on public.audit_logs
  for all using (public.is_admin()) with check (public.is_admin());

create table if not exists public.site_settings (
  key        text primary key,
  value      jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.site_settings enable row level security;
drop policy if exists settings_read on public.site_settings;
create policy settings_read on public.site_settings for select using (true);
drop policy if exists settings_admin_write on public.site_settings;
create policy settings_admin_write on public.site_settings
  for all using (public.is_admin()) with check (public.is_admin());

-- ============================================================
-- 5. SEEDS (safe to re-run)
-- ============================================================
insert into public.categories (slug, name, description, image_url, sort) values
  ('photo-frames',   '{"en":"Photo Frames","hi":"फोटो फ़्रेम"}',    '{"en":"Wood · Metal · Gold","hi":"लकड़ी · मेटल · गोल्ड"}', '/images/cat-frames.jpg', 1),
  ('custom-framing', '{"en":"Custom Framing","hi":"कस्टम फ़्रेमिंग"}', '{"en":"Upload · Choose · Crafted","hi":"अपलोड · चुनें · तैयार"}', '/images/cat-custom.jpg', 2),
  ('photo-prints',   '{"en":"Photo Prints","hi":"फोटो प्रिंट"}',    '{"en":"Glossy · Matte · Canvas","hi":"ग्लॉसी · मैट · कैनवास"}', '/images/cat-prints.jpg', 3),
  ('glass-mirror',   '{"en":"Glass & Mirror","hi":"काँच व शीशा"}',    '{"en":"Cut to any size","hi":"हर साइज़ में कटिंग"}', '/images/cat-glass.jpg', 4)
on conflict (slug) do nothing;

insert into public.products (slug, name, description, base_price, frame_tone, is_featured, category_id)
select v.slug,
       v.name::jsonb, v.description::jsonb, v.price, v.tone, true, c.id
from (values
  ('royal-gold-frame',   '{"en":"Royal Gold Frame","hi":"रॉयल गोल्ड फ़्रेम"}',   '{"en":"Ornate gilt frame for heirloom photos.","hi":"अनमोल तस्वीरों के लिए शाही गोल्ड फ़्रेम।"}', 1899, 'gold',  'photo-frames'),
  ('classic-teak-frame', '{"en":"Classic Teak Frame","hi":"क्लासिक टीक फ़्रेम"}', '{"en":"Warm teak wood, everyday favourite.","hi":"गर्म टीक लकड़ी — हर दीवार की पसंद।"}',       1299, 'wood',  'photo-frames'),
  ('canvas-photo-wrap',  '{"en":"Canvas Photo Wrap","hi":"कैनवास फोटो रैप"}',    '{"en":"Gallery-wrapped canvas, no glass needed.","hi":"गैलरी-स्टाइल कैनवास, बिना काँच।"}',        999, 'black', 'photo-prints'),
  ('moderna-black-frame','{"en":"Moderna Black Frame","hi":"मॉडर्न ब्लैक फ़्रेम"}','{"en":"Slim black moulding, modern look.","hi":"पतली ब्लैक माउल्डिंग — आधुनिक लुक।"}',       1499, 'black', 'photo-frames')
) as v (slug, name, description, price, tone, cat)
left join public.categories c on c.slug = v.cat
on conflict (slug) do nothing;

insert into public.product_images (product_id, url, alt, sort)
select p.id, v.url, v.alt, 0
from (values
  ('royal-gold-frame',   '/images/prod-gold.jpg',   'Royal Gold Frame'),
  ('classic-teak-frame', '/images/prod-teak.jpg',   'Classic Teak Frame'),
  ('canvas-photo-wrap',  '/images/prod-canvas.jpg', 'Canvas Photo Wrap'),
  ('moderna-black-frame','/images/hero-travel.jpg', 'Moderna Black Frame')
) as v (slug, url, alt)
join public.products p on p.slug = v.slug
where not exists (
  select 1 from public.product_images pi where pi.product_id = p.id and pi.url = v.url
);

insert into public.frame_options (key, kind, name, price_delta, sort) values
  ('size-8x10',   'size', '{"en":"8 × 10 in","hi":"8 × 10 इंच"}',   0,    1),
  ('size-12x18',  'size', '{"en":"12 × 18 in","hi":"12 × 18 इंच"}', 400,  2),
  ('size-16x24',  'size', '{"en":"16 × 24 in","hi":"16 × 24 इंच"}', 800,  3),
  ('size-24x36',  'size', '{"en":"24 × 36 in","hi":"24 × 36 इंच"}', 1600, 4),
  ('mould-gold',  'moulding', '{"en":"Royal Gold","hi":"रॉयल गोल्ड"}', 0,  1),
  ('mould-teak',  'moulding', '{"en":"Teak Wood","hi":"टीक वुड"}',     0,  2),
  ('mould-black', 'moulding', '{"en":"Slim Black","hi":"स्लिम ब्लैक"}', 0, 3),
  ('mat-ivory',   'mat', '{"en":"Ivory Mat","hi":"आइवरी मैट"}', 0, 1),
  ('mat-black',   'mat', '{"en":"Black Mat","hi":"ब्लैक मैट"}',  0, 2),
  ('glass-normal','glass', '{"en":"Regular Glass","hi":"साधारण काँच"}',    0,   1),
  ('glass-anti',  'glass', '{"en":"Anti-Glare Glass","hi":"एंटी-ग्लेयर काँच"}', 300, 2)
on conflict (key) do nothing;

insert into public.site_settings (key, value) values
  ('payments', '{"upi_vpa":"","upi_qr_url":"","payee_name":"Quality Glass Emporium"}'),
  ('shop',     '{"announcement_en":"","announcement_hi":""}')
on conflict (key) do nothing;
