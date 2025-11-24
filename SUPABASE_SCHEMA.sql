-- Users table (customers)
create table users (
  id uuid references auth.users primary key,
  email text unique not null,
  name text,
  phone text,
  address text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table users enable row level security;

-- Users can read their own data
create policy "Users can read own data" on users
  for select using (auth.uid() = id);

-- Users can update their own data
create policy "Users can update own data" on users
  for update using (auth.uid() = id);

-- Users can insert their own data
create policy "Users can insert own data" on users
  for insert with check (auth.uid() = id);

------------------------------------------------------------

-- Merchants table (restaurant owners)
create table merchants (
  id uuid references auth.users primary key,
  email text unique not null,
  name text not null,
  business_name text not null,
  phone text,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table merchants enable row level security;

-- Merchants can read their own data
create policy "Merchants can read own data" on merchants
  for select using (auth.uid() = id);

-- Merchants can update their own data
create policy "Merchants can update own data" on merchants
  for update using (auth.uid() = id);

-- Merchants can insert their own data
create policy "Merchants can insert own data" on merchants
  for insert with check (auth.uid() = id);

------------------------------------------------------------

-- Restaurants table
create table restaurants (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid references merchants not null,
  name text not null,
  category text not null,
  description text,
  image_url text,
  rating numeric(2,1) default 0,
  delivery_time text,
  delivery_fee numeric(10,2) not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS  
alter table restaurants enable row level security;

-- Anyone can read restaurants
create policy "Anyone can read restaurants" on restaurants
  for select using (true);

-- Only merchants can insert their own restaurants
create policy "Merchants can insert own restaurants" on restaurants
  for insert with check (auth.uid() = merchant_id);

-- Only merchants can update their own restaurants
create policy "Merchants can update own restaurants" on restaurants
  for update using (auth.uid() = merchant_id);

-- Only merchants can delete their own restaurants
create policy "Merchants can delete own restaurants" on restaurants
  for delete using (auth.uid() = merchant_id);

------------------------------------------------------------

-- Menu items table
create table menu_items (
  id uuid primary key default gen_random_uuid(),
  restaurant_id uuid references restaurants on delete cascade not null,
  name text not null,
  description text,
  price numeric(10,2) not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table menu_items enable row level security;

-- Anyone can read menu items
create policy "Anyone can read menu items" on menu_items
  for select using (true);

-- Only restaurant owners can manage their menu items
create policy "Restaurant owners can manage menu items" on menu_items
  for all using (
    exists (
      select 1 from restaurants
      where restaurants.id = menu_items.restaurant_id
      and restaurants.merchant_id = auth.uid()
    )
  );

------------------------------------------------------------

-- Orders table
create table orders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users not null,
  restaurant_id uuid references restaurants not null,
  status text not null default 'pending',
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null,
  total numeric(10,2) not null,
  created_at timestamp with time zone default now()
);

-- Enable RLS
alter table orders enable row level security;

-- Users can read their own orders
create policy "Users can read own orders" on orders
  for select using (auth.uid() = user_id);

-- Restaurant owners can read orders for their restaurants
create policy "Merchants can read restaurant orders" on orders
  for select using (
    exists (
      select 1 from restaurants
      where restaurants.id = orders.restaurant_id
      and restaurants.merchant_id = auth.uid()
    )
  );

-- Users can create orders
create policy "Users can create orders" on orders
  for insert with check (auth.uid() = user_id);

------------------------------------------------------------

-- Order items table
create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid references orders on delete cascade not null,
  menu_item_id uuid references menu_items not null,
  quantity integer not null,
  price numeric(10,2) not null
);

-- Enable RLS
alter table order_items enable row level security;

-- Order items inherit permissions from orders
create policy "Order items readable if order is" on order_items
  for select using (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and (
        orders.user_id = auth.uid()
        or exists (
          select 1 from restaurants
          where restaurants.id = orders.restaurant_id
          and restaurants.merchant_id = auth.uid()
        )
      )
    )
  );

-- Users can insert order items for their orders
create policy "Users can insert order items" on order_items
  for insert with check (
    exists (
      select 1 from orders
      where orders.id = order_items.order_id
      and orders.user_id = auth.uid()
    )
  );
