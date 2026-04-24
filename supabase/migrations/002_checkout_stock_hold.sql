-- Atomic stock hold for Stripe Checkout + release on abandon (see webhook).
-- Run after 001_store.sql. Requires service_role to call RPCs (checkout + webhook).

create table if not exists public.stock_reservations (
  id uuid primary key default gen_random_uuid(),
  pending_checkout_id uuid not null references public.pending_checkouts (id) on delete cascade,
  product_id uuid not null references public.products (id) on delete cascade,
  quantity integer not null check (quantity > 0)
);

create index if not exists stock_reservations_pending_idx
  on public.stock_reservations (pending_checkout_id);

alter table public.stock_reservations enable row level security;

-- ---------------------------------------------------------------------------
-- Atomically create pending checkout, decrement stock, record reservations
-- ---------------------------------------------------------------------------
create or replace function public.create_checkout_with_stock_hold(
  p_user_id uuid,
  p_items jsonb
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_pending uuid;
  rec record;
begin
  if p_items is null or jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    raise exception 'invalid_items';
  end if;

  insert into public.pending_checkouts (user_id, items)
  values (p_user_id, p_items)
  returning id into v_pending;

  for rec in
    select *
    from jsonb_to_recordset(p_items) as x(
      product_id uuid,
      quantity int,
      unit_price_cents int
    )
  loop
    if rec.quantity is null or rec.quantity < 1 then
      raise exception 'invalid_quantity';
    end if;

    update public.products
      set stock = stock - rec.quantity
      where id = rec.product_id
        and active = true
        and stock >= rec.quantity;

    if not found then
      raise exception 'insufficient_stock';
    end if;

    insert into public.stock_reservations (pending_checkout_id, product_id, quantity)
    values (v_pending, rec.product_id, rec.quantity);
  end loop;

  return v_pending;
end;
$$;

-- ---------------------------------------------------------------------------
-- Restore stock and remove pending checkout (abandoned / failed sessions)
-- ---------------------------------------------------------------------------
create or replace function public.release_checkout_hold(p_pending_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  rec record;
begin
  if not exists (select 1 from public.pending_checkouts where id = p_pending_id) then
    return;
  end if;

  for rec in
    select product_id, quantity
    from public.stock_reservations
    where pending_checkout_id = p_pending_id
  loop
    update public.products
      set stock = stock + rec.quantity
      where id = rec.product_id;
  end loop;

  delete from public.stock_reservations where pending_checkout_id = p_pending_id;
  delete from public.pending_checkouts where id = p_pending_id;
end;
$$;

revoke all on function public.create_checkout_with_stock_hold(uuid, jsonb) from public;
revoke all on function public.release_checkout_hold(uuid) from public;

grant execute on function public.create_checkout_with_stock_hold(uuid, jsonb) to service_role;
grant execute on function public.release_checkout_hold(uuid) to service_role;
