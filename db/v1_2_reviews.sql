-- v1.2 photo reviews: photo + order linkage columns
alter table public.reviews add column if not exists photo_url text;
alter table public.reviews add column if not exists photo_key text;
alter table public.reviews add column if not exists order_no text;
create index if not exists idx_reviews_order_no on public.reviews (order_no);
