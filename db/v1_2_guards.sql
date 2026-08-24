-- v1.2 #3 + #4: price integrity + audit trail

-- #3: price integrity on order items
create or replace function public.check_order_item_price() returns trigger language plpgsql as $$
declare v_base numeric; v_max_extra numeric; v_floor numeric;
begin
  if new.product_id is null then return new; end if;
  select base_price::numeric into v_base from public.products where id = new.product_id;
  if not found then return new; end if;
  select coalesce(sum(case when md > 0 then md else 0 end), 0) into v_max_extra
    from (select kind, max(price_delta::numeric) md from public.frame_options where is_active group by kind) t;
  select coalesce(sum(case when mn < 0 then mn else 0 end), 0) into v_floor
    from (select kind, min(price_delta::numeric) mn from public.frame_options where is_active group by kind) t;
  if new.unit_price::numeric < v_base + v_floor - 0.01
     or new.unit_price::numeric > v_base + v_max_extra + 0.01 then
    raise exception 'PRICE_GUARD: unit_price % outside allowed range for product %', new.unit_price, new.product_id;
  end if;
  if new.line_total is not null
     and abs(new.line_total::numeric - new.unit_price::numeric * coalesce(new.qty,1)) > 0.51 then
    raise exception 'PRICE_GUARD: line_total % does not match unit_price x qty', new.line_total;
  end if;
  return new;
end $$;

drop trigger if exists trg_price_check on public.order_items;
create trigger trg_price_check before insert or update on public.order_items
  for each row execute function public.check_order_item_price();

-- #4: audit trail (observability only — never breaks the main action)
create or replace function public.write_audit_log() returns trigger
language plpgsql security definer set search_path = public as $$
declare v_actor uuid; v_eid text; v_meta jsonb;
begin
  begin v_actor := auth.uid(); exception when others then v_actor := null; end;
  v_eid := coalesce(case when tg_op <> 'DELETE' then new.id::text end, old.id::text);
  if tg_op = 'INSERT' then v_meta := jsonb_build_object('op','INSERT','new',to_jsonb(new));
  elsif tg_op = 'DELETE' then v_meta := jsonb_build_object('op','DELETE','old',to_jsonb(old));
  else v_meta := jsonb_build_object('op','UPDATE','old',to_jsonb(old),'new',to_jsonb(new)); end if;
  begin
    insert into public.audit_logs (actor_id, action, entity, entity_id, meta)
    values (v_actor, lower(tg_op), tg_table_name, v_eid, v_meta);
  exception when others then null;
  end;
  if tg_op = 'DELETE' then return old; else return new; end if;
end $$;

drop trigger if exists trg_audit_orders on public.orders;
create trigger trg_audit_orders after insert or update or delete on public.orders
  for each row execute function public.write_audit_log();

drop trigger if exists trg_audit_products on public.products;
create trigger trg_audit_products after insert or update or delete on public.products
  for each row execute function public.write_audit_log();

drop trigger if exists trg_audit_auth_users on auth.users;
create trigger trg_audit_auth_users after delete on auth.users
  for each row execute function public.write_audit_log();
