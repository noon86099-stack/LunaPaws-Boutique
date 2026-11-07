-- Run through the connected Supabase integration. No privileged key is needed
-- in the storefront: the public catalog is SELECT-only under RLS.
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null check (length(btrim(name)) > 0),
  description text,
  price numeric(10, 3) not null check (price >= 0),
  image_url text,
  category text,
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
revoke all on table public.products from public, anon, authenticated;
grant select on table public.products to anon, authenticated;
create policy "Public catalog is readable"
  on public.products for select
  to anon, authenticated
  using (true);

comment on column public.products.price is 'Unit price in Kuwaiti dinars (KWD), with three decimal places.';

insert into public.products (name, description, price, image_url, category, created_at)
select seed.name, seed.description, seed.price, seed.image_url, seed.category, clock_timestamp()
from (values
  ('The Sunday Cloud Bed', 'A sink-in-soft bouclé nest with a supportive recycled-fibre cushion. Removable cover, made for long afternoon naps.', 28.500, 'https://luna-paws-boutique.replit.app/images/lunapaws-product-sunday-cloud-bed.jpg', 'Cozy Beds'),
  ('Moss & Mellow Cushion', 'A deep, grounded green cushion with a quilted cotton shell and a plush, washable inner pad.', 22.750, 'https://luna-paws-boutique.replit.app/images/lunapaws-product-moss-cushion.jpg', 'Cozy Beds'),
  ('Little Orbit Play Set', 'A three-piece play set with a felted wool ball, feather wand and a little crinkle moon for curious paws.', 8.900, 'https://luna-paws-boutique.replit.app/images/lunapaws-product-orbit-play-set.jpg', 'Toys & Play'),
  ('Tumbleweed Sisal Scratcher', 'A sculptural, sturdy scratcher wrapped in natural sisal, designed to look lovely in your living room.', 16.250, 'https://luna-paws-boutique.replit.app/images/lunapaws-product-tumbleweed-scratcher.jpg', 'Toys & Play'),
  ('The Dune Everyday Collar', 'Soft cotton webbing, a quick-release safety buckle and a tiny brass-tone bell. Easy, everyday comfort.', 6.750, 'https://luna-paws-boutique.replit.app/images/lunapaws-product-dune-collar.jpg', 'Collars & Accessories'),
  ('Poppy Bow Collar', 'A cheerful terracotta bow on an adjustable cotton collar, finished with a breakaway clasp.', 7.500, 'https://luna-paws-boutique.replit.app/images/lunapaws-product-poppy-bow-collar.jpg', 'Collars & Accessories'),
  ('Pebble Ceramic Bowl', 'A gently raised stoneware bowl with a smooth, glazed inside and a weighted base that stays put.', 11.250, 'https://luna-paws-boutique.replit.app/images/lunapaws-product-pebble-ceramic-bowl.jpg', 'Feeding Essentials'),
  ('Sage Slow-Supper Bowl', 'A calming sage-green feeder with a shallow maze to make mealtimes a little slower and gentler.', 13.400, 'https://luna-paws-boutique.replit.app/images/lunapaws-product-sage-slow-bowl.jpg', 'Feeding Essentials')
) as seed(name, description, price, image_url, category)
where not exists (select 1 from public.products p where p.name = seed.name);
