-- Stripe sandbox cannot process KWD. Orders stay priced in KWD; the test charge
-- is a fixed-rate USD conversion computed on the server and stored per order.
delete from public.stripe_webhook_events;
delete from public.orders where payment_status = 'pending';
alter table public.orders
  add column charge_currency text not null default 'usd' check (charge_currency = 'usd'),
  add column charge_rate_milli integer not null default 3250 check (charge_rate_milli = 3250),
  add column charge_subtotal_cents integer not null check (charge_subtotal_cents > 0),
  add column charge_delivery_cents integer not null check (charge_delivery_cents >= 0),
  add column charge_total_cents integer not null check (charge_total_cents = charge_subtotal_cents + charge_delivery_cents);

create or replace function public.prepare_test_order(
  p_user_id uuid, p_email text, p_key uuid, p_cart jsonb, p_contact jsonb
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
    -- KWD fils -> USD cents at 1 KWD = 3.25 USD, rounded per unit price.
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
  insert into public.orders(user_id, email, checkout_key, cart_request, contact, items,
    subtotal_minor, delivery_minor, total_minor,
    charge_subtotal_cents, charge_delivery_cents, charge_total_cents)
  values (p_user_id, p_email, p_key, p_cart, p_contact, snapshots, subtotal, delivery, subtotal + delivery,
    charge_subtotal, round(delivery::numeric * 3250 / 10000)::integer,
    charge_subtotal + round(delivery::numeric * 3250 / 10000)::integer)
  returning * into existing;
  return existing;
end;
$$;

drop function public.record_test_payment(text,uuid,uuid,text,text,text,integer,integer,integer);
create function public.record_test_payment(
  p_event_id text, p_order_id uuid, p_user_id uuid, p_session_id text,
  p_payment_intent_id text, p_currency text, p_subtotal integer, p_delivery integer, p_total integer
) returns boolean language plpgsql security definer set search_path = '' as $$
declare
  target public.orders;
begin
  select * into target from public.orders where id = p_order_id for update;
  if not found or target.user_id <> p_user_id or target.stripe_session_id is distinct from p_session_id
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
revoke all on function public.prepare_test_order(uuid,text,uuid,jsonb,jsonb),
  public.record_test_payment(text,uuid,uuid,text,text,text,integer,integer,integer)
  from public, anon, authenticated;
grant execute on function public.prepare_test_order(uuid,text,uuid,jsonb,jsonb),
  public.record_test_payment(text,uuid,uuid,text,text,text,integer,integer,integer)
  to service_role;
