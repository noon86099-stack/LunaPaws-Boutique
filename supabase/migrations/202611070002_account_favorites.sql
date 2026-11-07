create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint favorites_user_product_unique unique (user_id, product_id)
);

create index favorites_product_id_idx on public.favorites (product_id);
alter table public.favorites enable row level security;
revoke all on table public.favorites from public, anon, authenticated;
grant select, insert, delete on table public.favorites to authenticated;

create policy "Users can read only their favorites"
  on public.favorites for select to authenticated
  using ((select auth.uid()) = user_id);

create policy "Users can add only their favorites"
  on public.favorites for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy "Users can remove only their favorites"
  on public.favorites for delete to authenticated
  using ((select auth.uid()) = user_id);
