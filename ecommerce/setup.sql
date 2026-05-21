-- Supabase Ecommerce schema
-- Run these statements in your Supabase SQL editor.

-- Products table: stores items available for sale.
create table if not exists products (
  id bigint generated always as identity primary key,
  merchant_id uuid references auth.users(id),
  name text not null,
  description text,
  category text,
  image_url text,
  price numeric(10,2) not null default 0,
  stock int not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists profiles (
  id uuid primary key references auth.users(id),
  full_name text,
  role text not null default 'customer',
  shop_name text,
  balance numeric(12,2) not null default 10000,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cart_items (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id),
  product_id bigint references products(id),
  quantity int not null default 1,
  created_at timestamptz not null default now(),
  constraint cart_unique_user_product unique (user_id, product_id)
);

create table if not exists orders (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id),
  status text not null default 'placed',
  total numeric(12,2) not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id bigint references orders(id) on delete cascade,
  product_id bigint references products(id),
  merchant_id uuid references auth.users(id),
  quantity int not null default 1,
  unit_price numeric(10,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists reviews (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id),
  product_id bigint references products(id),
  rating int not null check (rating between 1 and 5),
  comment text,
  created_at timestamptz not null default now(),
  unique(user_id, product_id)
);

-- Sample data
insert into products (name, description, category, image_url, price, stock, merchant_id)
values
  ('Classic Hoodie', 'Soft hoodie with a subtle logo.', 'Apparel', '', 39.99, 12, null),
  ('Performance T-Shirt', 'Lightweight performance tee.', 'Apparel', '', 24.99, 27, null),
  ('Sneaker Socks', 'Breathable crew socks.', 'Accessories', '', 9.99, 50, null)
on conflict do nothing;

-- Ensure each new auth user has a profile row
create or replace function public.handle_new_user() returns trigger as $$
begin
  insert into public.profiles (id, full_name, role, balance, created_at, updated_at)
  values (new.id, '', 'customer', 10000, now(), now())
  on conflict (id) do update set updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Checkout transaction function
create or replace function public.checkout_cart() returns bigint as $$
declare
  v_user uuid := auth.uid();
  v_total numeric(12,2) := 0;
  v_order_id bigint;
  cart_row record;
begin
  if v_user is null then
    raise exception 'Authentication required';
  end if;

  for cart_row in
    select ci.product_id, ci.quantity, p.price, p.stock, p.merchant_id
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    where ci.user_id = v_user
  loop
    if cart_row.stock < cart_row.quantity then
      raise exception 'Product % is out of stock', cart_row.product_id;
    end if;
    v_total := v_total + cart_row.price * cart_row.quantity;
  end loop;

  if v_total = 0 then
    raise exception 'Cart is empty';
  end if;

  if (select balance from public.profiles where id = v_user) < v_total then
    raise exception 'Insufficient balance';
  end if;

  insert into public.orders (user_id, status, total, created_at, updated_at)
  values (v_user, 'placed', v_total, now(), now())
  returning id into v_order_id;

  for cart_row in
    select ci.product_id, ci.quantity, p.price, p.stock, p.merchant_id
    from public.cart_items ci
    join public.products p on p.id = ci.product_id
    where ci.user_id = v_user
  loop
    insert into public.order_items(order_id, product_id, merchant_id, quantity, unit_price, created_at)
    values (v_order_id, cart_row.product_id, cart_row.merchant_id, cart_row.quantity, cart_row.price, now());

    update public.products
    set stock = stock - cart_row.quantity,
        updated_at = now()
    where id = cart_row.product_id;

    update public.profiles
    set balance = balance - cart_row.price * cart_row.quantity,
        updated_at = now()
    where id = v_user;

    if cart_row.merchant_id is not null then
      update public.profiles
      set balance = balance + cart_row.price * cart_row.quantity,
          updated_at = now()
      where id = cart_row.merchant_id;
    end if;
  end loop;

  delete from public.cart_items where user_id = v_user;

  return v_order_id;
end;
$$ language plpgsql security definer;

-- Enable row level security and policies
alter table public.products enable row level security;
create policy "products_select_public" on public.products
  for select
  using (true);
create policy "products_insert_merchant_or_admin" on public.products
  for insert
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role in ('merchant','admin'))
  );
create policy "products_update_own_or_admin" on public.products
  for update
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or merchant_id = auth.uid()
  )
  with check (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or merchant_id = auth.uid()
  );
create policy "products_delete_own_or_admin" on public.products
  for delete
  using (
    exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or merchant_id = auth.uid()
  );

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
create policy "profiles_select_admin" on public.profiles
  for select
  using (id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "profiles_update_admin" on public.profiles
  for update
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

alter table public.cart_items enable row level security;
create policy "cart_items_own_select" on public.cart_items
  for select
  using (user_id = auth.uid());
create policy "cart_items_own_modify" on public.cart_items
  for insert, update, delete
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

alter table public.orders enable row level security;
create policy "orders_insert_owner" on public.orders
  for insert
  with check (user_id = auth.uid());
create policy "orders_select_owner_or_admin_or_merchant" on public.orders
  for select
  using (
    user_id = auth.uid()
    or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin')
    or exists (
      select 1 from public.order_items oi
      where oi.order_id = public.orders.id
        and oi.merchant_id = auth.uid()
    )
  );
create policy "orders_update_owner_or_admin" on public.orders
  for update
  using (user_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (user_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));
create policy "orders_update_merchant" on public.orders
  for update
  using (
    exists (
      select 1 from public.order_items oi
      where oi.order_id = public.orders.id
        and oi.merchant_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from public.order_items oi
      where oi.order_id = public.orders.id
        and oi.merchant_id = auth.uid()
    )
  );
create policy "orders_delete_admin" on public.orders
  for delete
  using (exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

alter table public.order_items enable row level security;
create policy "order_items_select_owner_admin_or_merchant" on public.order_items
  for select
  using (
    exists (
      select 1 from public.orders o
      where o.id = public.order_items.order_id
        and (o.user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    )
    or merchant_id = auth.uid()
  );
create policy "order_items_insert_owner" on public.order_items
  for insert
  with check (
    exists (
      select 1 from public.orders o
      where o.id = public.order_items.order_id
        and (o.user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    )
  );
create policy "order_items_update_owner_or_admin" on public.order_items
  for update
  using (
    exists (
      select 1 from public.orders o
      where o.id = public.order_items.order_id
        and (o.user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    )
  )
  with check (
    exists (
      select 1 from public.orders o
      where o.id = public.order_items.order_id
        and (o.user_id = auth.uid() or exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
    )
  );

alter table public.reviews enable row level security;
create policy "reviews_select_public" on public.reviews
  for select
  using (true);
create policy "reviews_insert_auth" on public.reviews
  for insert
  with check (user_id = auth.uid());
create policy "reviews_update_self" on public.reviews
  for update
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
create policy "reviews_delete_admin_or_self" on public.reviews
  for delete
  using (user_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

