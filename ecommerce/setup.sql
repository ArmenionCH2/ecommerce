-- Supabase Ecommerce schema
-- Run these statements in your Supabase SQL editor.

-- Products table: stores items available for sale.
create table if not exists products (
  id bigint generated always as identity primary key,
  name text not null,
  description text,
  price numeric(10,2) not null default 0,
  stock int not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Optional profile table for app-level user metadata.
create table if not exists profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  role text not null default 'customer',
  balance numeric(12,2) not null default 10000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Orders table: each customer order.
create table if not exists orders (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id),
  status text not null default 'pending',
  total numeric(10,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Order items table: product quantities in each order.
create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id bigint references orders(id) on delete cascade,
  product_id bigint references products(id),
  quantity int not null default 1,
  unit_price numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

-- Sample products.
insert into products (name, description, price, stock)
values
  ('Classic Hoodie', 'Soft hoodie with logo.', 39.99, 12),
  ('Performance T-Shirt', 'Lightweight performance tee.', 24.99, 27),
  ('Sneaker Socks', 'Breathable crew socks.', 9.99, 50)
on conflict do nothing;

-- Create a trigger to ensure a profile row exists when a new auth user is created
-- This gives every new user a starting balance of 10,000 (dummy money) and role 'customer'
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, balance, created_at, updated_at)
  values (new.id, '', 'customer', 10000, now(), now())
  on conflict (id) do update set updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- Attach trigger to auth.users insert events
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- Enable Row Level Security (RLS) and create policies

-- PRODUCTS: public read, admin write
alter table public.products enable row level security;

create policy "products_select_public" on public.products
  for select
  using (true);

create policy "products_manage_admin" on public.products
  for all
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- PROFILES: users can manage their own profile
alter table public.profiles enable row level security;

create policy "profiles_self_select" on public.profiles
  for select
  using (id = auth.uid());

create policy "profiles_self_insert" on public.profiles
  for insert
  with check (id = auth.uid());

create policy "profiles_self_update" on public.profiles
  for update
  using (id = auth.uid())
  with check (id = auth.uid());

-- ORDERS: users can create/select their own orders; admin can view all
alter table public.orders enable row level security;

create policy "orders_insert_owner" on public.orders
  for insert
  with check (auth.uid() is not null and user_id = auth.uid());

create policy "orders_select_owner_or_admin" on public.orders
  for select
  using (user_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "orders_update_owner_or_admin" on public.orders
  for update
  using (user_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (user_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

create policy "orders_delete_admin" on public.orders
  for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- ORDER_ITEMS: allow access only when the parent order belongs to the user or the user is admin
alter table public.order_items enable row level security;

create policy "order_items_select_owner_or_admin" on public.order_items
  for select
  using (
    exists (
      select 1 from public.orders o where o.id = public.order_items.order_id and (o.user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    )
  );

create policy "order_items_insert_via_order_owner_or_admin" on public.order_items
  for insert
  with check (
    exists (
      select 1 from public.orders o where o.id = public.order_items.order_id and (o.user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    )
  );

create policy "order_items_update_owner_or_admin" on public.order_items
  for update
  using (
    exists (
      select 1 from public.orders o where o.id = public.order_items.order_id and (o.user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    )
  )
  with check (
    exists (
      select 1 from public.orders o where o.id = public.order_items.order_id and (o.user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    )
  );

