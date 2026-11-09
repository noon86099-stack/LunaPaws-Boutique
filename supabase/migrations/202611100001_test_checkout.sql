-- Test checkout only. No changes to products, accounts or favourites.
create table public.orders (
  id uuid primary key default gen_random_uuid(),
  order_number text not null unique default ('LP-' || upper(replace(gen_random_uuid()::text, '-', ''))),
  user_id uuid not null references auth.users(id),
  email text not null,
  checkout_key uuid not null,
  cart_request jsonb not null,
  contact jsonb not null,
  items jsonb not null,
  currency text not null default 'kwd' check (currency = 'kwd'),
  subtotal_minor integer not null check (subtotal_minor > 0),
  delivery_minor integer not null check (delivery_minor in (0, 1500)),
  total_minor integer not null check (total_minor = subtotal_minor + delivery_minor),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid')),
  stripe_session_id text unique,
  stripe_payment_intent_id text unique,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '1 hour'),
  paid_at timestamptz,
  unique (user_id, checkout_key),
  check ((payment_status = 'pending' and paid_at is null) or
    (payment_status = 'paid' and paid_at is not null and stripe_session_id is not null and stripe_payment_intent_id is not null))
);
create index orders_user_created_idx on public.orders (user_id, created_at desc);

create table public.stripe_webhook_events (
  event_id text primary key,
  order_id uuid not null references public.orders(id),
  session_id text not null,
  received_at timestamptz not null default now()
);
create index stripe_webhook_events_order_idx on public.stripe_webhook_events (order_id);

alter table public.orders enable row level security;
alter table public.stripe_webhook_events enable row level security;
revoke all on public.orders, public.stripe_webhook_events from public, anon, authenticated;
grant select on public.orders to authenticated;
grant all on public.orders, public.stripe_webhook_events to service_role;
create policy "Owners can read their orders" on public.orders
  for select to authenticated using ((select auth.uid()) = user_id);

-- Service-only: take a consistent DB-priced snapshot and serialize retries.
create function public.prepare_test_order(
  p_user_id uuid, p_email text, p_key uuid, p_cart jsonb, p_contact jsonb
) returns public.orders
language plpgsql security definer set search_path = '' as $$
declare
  existing public.orders;
  entry jsonb;
  product public.products;
  snapshots jsonb := '[]'::jsonb;
  subtotal integer := 0;
  quantity integer;
  unit_amount integer;
  delivery integer;
  seen uuid[] := '{}';
begin
  perform pg_advisory_xact_lock(hashtextextended(p_user_id::text || p_key::text, 0));
  select * into existing from public.orders where user_id = p_user_id and checkout_key = p_key;
  if found then
    if existing.cart_request <> p_cart or existing.contact <> p_contact or existing.email <> p_email then
      raise exception 'request_conflict';
    end if;
    if existing.payment_status <> 'pending' then raise exception 'already_paid'; end if;
    if existing.expires_at <= now() + interval '2 minutes' then raise exception 'order_expired'; end if;
    return existing;
  end if;
  if jsonb_typeof(p_cart) <> 'array' or jsonb_array_length(p_cart) not between 1 and 30 then
    raise exception 'invalid_cart';
  end if;
  for entry in select value from jsonb_array_elements(p_cart) loop
    if jsonb_typeof(entry->'quantity') <> 'number' or (entry->>'quantity') !~ '^[0-9]+$'
      or jsonb_typeof(entry->'expectedUnitAmount') <> 'number' then raise exception 'invalid_cart'; end if;
    quantity := (entry->>'quantity')::integer;
    if quantity not between 1 and 20 then raise exception 'invalid_quantity'; end if;
    if (entry->>'productId')::uuid = any(seen) then raise exception 'invalid_cart'; end if;
    seen := array_append(seen, (entry->>'productId')::uuid);
    select * into product from public.products where id = (entry->>'productId')::uuid for share;
    if not found then raise exception 'product_unavailable'; end if;
    unit_amount := (product.price * 1000)::integer;
    if unit_amount <= 0 or unit_amount <> (entry->>'expectedUnitAmount')::integer then
      raise exception 'price_changed';
    end if;
    subtotal := subtotal + unit_amount * quantity;
    snapshots := snapshots || jsonb_build_array(jsonb_build_object(
      'productId', product.id, 'name', product.name, 'image', product.image_url,
      'quantity', quantity, 'unitAmount', unit_amount
    ));
  end loop;
  -- Existing checkout charges KWD 1.500 below KWD 25.000, free at/above 25.
  if subtotal > 99999999 then raise exception 'invalid_total'; end if;
  delivery := case when subtotal >= 25000 then 0 else 1500 end;
  insert into public.orders(user_id, email, checkout_key, cart_request, contact, items,
    subtotal_minor, delivery_minor, total_minor)
  values (p_user_id, p_email, p_key, p_cart, p_contact, snapshots, subtotal, delivery, subtotal + delivery)
  returning * into existing;
  return existing;
end;
$$;

create function public.bind_test_checkout(p_order_id uuid, p_session_id text)
returns void language plpgsql security definer set search_path = '' as $$
begin
  update public.orders set stripe_session_id = p_session_id, updated_at = now()
    where id = p_order_id and payment_status = 'pending'
      and (stripe_session_id is null or stripe_session_id = p_session_id);
  if not found then raise exception 'session_conflict'; end if;
end;
$$;

-- Only the signature-verifying Edge Function can call this transaction.
-- Locking the order and inserting the event in the same transaction makes both
-- replayed events and two different paid events for one session harmless.
create function public.record_test_payment(
  p_event_id text, p_order_id uuid, p_user_id uuid, p_session_id text,
  p_payment_intent_id text, p_currency text, p_subtotal integer, p_delivery integer, p_total integer
) returns boolean language plpgsql security definer set search_path = '' as $$
declare
  target public.orders;
begin
  select * into target from public.orders where id = p_order_id for update;
  if not found or target.user_id <> p_user_id or target.stripe_session_id is distinct from p_session_id
    or p_currency is distinct from 'kwd' or target.subtotal_minor is distinct from p_subtotal
    or target.delivery_minor is distinct from p_delivery or target.total_minor is distinct from p_total
    or p_event_id !~ '^evt_' or p_payment_intent_id !~ '^pi_' then
    raise exception 'payment_binding_mismatch';
  end if;
  if target.payment_status = 'paid' and target.stripe_payment_intent_id is distinct from p_payment_intent_id then
    raise exception 'payment_binding_mismatch';
  end if;
  if exists (select 1 from public.stripe_webhook_events
    where event_id = p_event_id and (order_id <> p_order_id or session_id <> p_session_id)) then
    raise exception 'event_binding_mismatch';
  end if;
  insert into public.stripe_webhook_events(event_id, order_id, session_id)
    values(p_event_id, p_order_id, p_session_id) on conflict (event_id) do nothing;
  if target.payment_status = 'paid' then return false; end if;
  update public.orders set payment_status = 'paid', stripe_payment_intent_id = p_payment_intent_id,
    paid_at = now(), updated_at = now() where id = p_order_id and payment_status = 'pending';
  return true;
end;
$$;

revoke all on function public.prepare_test_order(uuid,text,uuid,jsonb,jsonb),
  public.bind_test_checkout(uuid,text),
  public.record_test_payment(text,uuid,uuid,text,text,text,integer,integer,integer)
  from public, anon, authenticated;
grant execute on function public.prepare_test_order(uuid,text,uuid,jsonb,jsonb),
  public.bind_test_checkout(uuid,text),
  public.record_test_payment(text,uuid,uuid,text,text,text,integer,integer,integer)
  to service_role;
