-- Guest checkout: orders may be owned by a secret token (hash stored) instead of an account.
alter table public.orders
  alter column user_id drop not null,
  add column guest_token_hash text check (guest_token_hash ~ '^[0-9a-f]{64}$'),
  add column guest_ip_hash text,
  add constraint orders_owner_check check ((user_id is not null) <> (guest_token_hash is not null));
create unique index orders_guest_key_idx on public.orders (guest_token_hash, checkout_key) where guest_token_hash is not null;
create index orders_guest_rate_idx on public.orders (created_at) where guest_token_hash is not null;

drop function public.prepare_test_order(uuid,text,uuid,jsonb,jsonb);
create function public.prepare_test_order(
  p_user_id uuid, p_email text, p_key uuid, p_cart jsonb, p_contact jsonb,
  p_guest_hash text default null, p_ip_hash text default null
) returns public.orders
language plpgsql security definer set search_path = '' as $$
declare
  existing public.orders;
  entry jsonb;
  product public.products;
  snapshots jsonb := '[]'::jsonb;
  subtotal integer := 0;
  charge_subtotal integer := 0;
  quantity integer;
  unit_amount integer;
  unit_cents integer;
  delivery integer;
  seen uuid[] := '{}';
begin
  if (p_user_id is null) = (p_guest_hash is null) then raise exception 'invalid_request'; end if;
  perform pg_advisory_xact_lock(hashtextextended(coalesce(p_user_id::text, p_guest_hash) || p_key::text, 0));
  select * into existing from public.orders
    where checkout_key = p_key and ((p_user_id is not null and user_id = p_user_id)
      or (p_guest_hash is not null and guest_token_hash = p_guest_hash));
  if found then
    if existing.cart_request <> p_cart or existing.contact <> p_contact or existing.email <> p_email then
      raise exception 'request_conflict';
    end if;
    if existing.payment_status <> 'pending' then raise exception 'already_paid'; end if;
    if existing.expires_at <= now() + interval '2 minutes' then raise exception 'order_expired'; end if;
    return existing;
  end if;
  if p_guest_hash is not null then
    -- Abuse limits for unauthenticated order creation.
    if (select count(*) from public.orders where guest_token_hash is not null
          and created_at > now() - interval '1 hour') >= 300
      or (select count(*) from public.orders where guest_token_hash is not null and lower(email) = lower(p_email)
          and created_at > now() - interval '1 hour') >= 5
      or (p_ip_hash is not null and (select count(*) from public.orders where guest_ip_hash = p_ip_hash
          and created_at > now() - interval '1 hour') >= 10)
    then raise exception 'rate_limited'; end if;
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
    unit_cents := round(unit_amount::numeric * 3250 / 10000)::integer;
    subtotal := subtotal + unit_amount * quantity;
    charge_subtotal := charge_subtotal + unit_cents * quantity;
    snapshots := snapshots || jsonb_build_array(jsonb_build_object(
      'productId', product.id, 'name', product.name, 'image', product.image_url,
      'quantity', quantity, 'unitAmount', unit_amount, 'chargeUnitCents', unit_cents
    ));
  end loop;
  if subtotal > 99999999 then raise exception 'invalid_total'; end if;
  delivery := case when subtotal >= 25000 then 0 else 1500 end;
  insert into public.orders(user_id, guest_token_hash, guest_ip_hash, email, checkout_key, cart_request, contact, items,
    subtotal_minor, delivery_minor, total_minor,
    charge_subtotal_cents, charge_delivery_cents, charge_total_cents)
  values (p_user_id, p_guest_hash, p_ip_hash, p_email, p_key, p_cart, p_contact, snapshots, subtotal, delivery, subtotal + delivery,
    charge_subtotal, round(delivery::numeric * 3250 / 10000)::integer,
    charge_subtotal + round(delivery::numeric * 3250 / 10000)::integer)
  returning * into existing;
  return existing;
end;
$$;

-- Webhook binding: owner may be a guest (null user).
create or replace function public.record_test_payment(
  p_event_id text, p_order_id uuid, p_user_id uuid, p_session_id text,
  p_payment_intent_id text, p_currency text, p_subtotal integer, p_delivery integer, p_total integer
) returns boolean language plpgsql security definer set search_path = '' as $$
declare
  target public.orders;
begin
  select * into target from public.orders where id = p_order_id for update;
  if not found or target.user_id is distinct from p_user_id or target.stripe_session_id is distinct from p_session_id
    or p_currency is distinct from target.charge_currency
    or target.charge_subtotal_cents is distinct from p_subtotal
    or target.charge_delivery_cents is distinct from p_delivery
    or target.charge_total_cents is distinct from p_total
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

-- Guests prove ownership with the secret token; only minimal status is returned.
create function public.get_guest_order(p_order_id uuid, p_token text)
returns jsonb language sql stable security definer set search_path = '' as $$
  select jsonb_build_object('id', o.id, 'order_number', o.order_number, 'user_id', null,
    'checkout_key', o.checkout_key, 'payment_status', o.payment_status,
    'stripe_session_id', o.stripe_session_id, 'total_minor', o.total_minor,
    'currency', o.currency, 'items', (select coalesce(jsonb_agg(jsonb_build_object(
      'productId', i->'productId', 'quantity', i->'quantity')), '[]'::jsonb) from jsonb_array_elements(o.items) i))
  from public.orders o
  where p_token ~ '^[0-9a-f]{64}$' and o.id = p_order_id
    and o.guest_token_hash = encode(sha256(convert_to(p_token, 'utf8')), 'hex');
$$;

revoke all on function public.prepare_test_order(uuid,text,uuid,jsonb,jsonb,text,text),
  public.record_test_payment(text,uuid,uuid,text,text,text,integer,integer,integer),
  public.get_guest_order(uuid,text) from public, anon, authenticated;
grant execute on function public.prepare_test_order(uuid,text,uuid,jsonb,jsonb,text,text),
  public.record_test_payment(text,uuid,uuid,text,text,text,integer,integer,integer) to service_role;
grant execute on function public.get_guest_order(uuid,text) to anon, authenticated, service_role;
