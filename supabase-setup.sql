-- =====================================================
-- AmazCart — Supabase Database Setup
-- Paste and run this in: Supabase → SQL Editor → New query
-- =====================================================

-- 1. Products table
create table if not exists products (
  id          uuid default gen_random_uuid() primary key,
  name        text not null,
  description text not null,
  affiliate_link text not null,
  category    text not null default 'General',
  image_url   text,
  featured    boolean default false,
  created_at  timestamptz default now()
);

-- 2. Comments table
create table if not exists comments (
  id          uuid default gen_random_uuid() primary key,
  product_id  uuid references products(id) on delete cascade not null,
  author      text not null,
  content     text not null,
  rating      int default 5 check (rating >= 1 and rating <= 5),
  created_at  timestamptz default now()
);

-- 3. Indexes for performance
create index if not exists idx_products_category   on products(category);
create index if not exists idx_products_featured   on products(featured);
create index if not exists idx_products_created    on products(created_at desc);
create index if not exists idx_comments_product_id on comments(product_id);
create index if not exists idx_comments_created    on comments(created_at desc);

-- 4. Row Level Security
alter table products enable row level security;
alter table comments  enable row level security;

-- Drop existing policies if re-running
drop policy if exists "Public can read products"  on products;
drop policy if exists "Public can read comments"  on comments;
drop policy if exists "Public can post comments"  on comments;
drop policy if exists "Service role manages all products" on products;
drop policy if exists "Service role manages all comments" on comments;

-- Public read access
create policy "Public can read products"
  on products for select using (true);

create policy "Public can read comments"
  on comments for select using (true);

-- Public can post comments (no auth needed for visitors)
create policy "Public can post comments"
  on comments for insert with check (true);

-- Service role (server-side API) can do everything
create policy "Service role manages all products"
  on products for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Service role manages all comments"
  on comments for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- =====================================================
-- 5. Storage bucket setup (do this in the Supabase UI)
-- =====================================================
-- Go to: Storage → New bucket
-- Name:  product-images
-- Public: YES (toggle on)
-- Then go to Storage → product-images → Policies
-- Add policy: Allow public reads (SELECT)
-- Add policy: Allow service role writes (INSERT, UPDATE, DELETE)

-- =====================================================
-- 6. Seed data (optional — remove if not needed)
-- =====================================================
insert into products (name, description, affiliate_link, category, featured) values
  ('Sony WH-1000XM5 Headphones', 'Industry-leading noise cancellation with 30-hour battery. The best wireless headphones on Amazon right now.', 'https://amzn.to/example1', 'Tech', true),
  ('Kindle Paperwhite (16GB)', 'Waterproof e-reader with a glare-free display. Perfect for reading anywhere.', 'https://amzn.to/example2', 'Books', true),
  ('Anker PowerCore 26800 Portable Charger', 'Massive 26800mAh capacity to charge your phone multiple times. Dual USB-A ports.', 'https://amzn.to/example3', 'Tech', false),
  ('Philips Hue White & Color Ambiance Starter Kit', 'Smart lighting that works with Alexa, Google, and Apple HomeKit.', 'https://amzn.to/example4', 'Home', false),
  ('Logitech MX Master 3S Wireless Mouse', 'Ultra-fast MagSpeed scrolling, ergonomic design, works on any surface including glass.', 'https://amzn.to/example5', 'Tech', false)
on conflict do nothing;
