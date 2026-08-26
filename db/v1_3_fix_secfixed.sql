-- Hotfix: privileged guards must be SECURITY DEFINER to read ops.maintenance_flag
create or replace function public.guard_privileged_write() returns trigger
language plpgsql security definer set search_path = public, ops as $$
declare v_role text;
begin
  if exists (select 1 from ops.maintenance_flag where "on") then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  if auth.uid() is null then
    raise exception 'Write blocked: a signed-in user session is required';
  end if;
  select role into v_role from public.profiles where id = auth.uid();
  if v_role = 'admin' then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  if v_role = 'staff' and tg_table_name in ('products','product_images','frame_options','categories') then
    if tg_op = 'DELETE' then return old; end if;
    return new;
  end if;
  raise exception 'This account is not allowed to change %', tg_table_name;
end $$;

create or replace function public.guard_profile_role_change() returns trigger
language plpgsql security definer set search_path = public, ops as $$
declare v_me text;
begin
  if exists (select 1 from ops.maintenance_flag where "on") then return new; end if;
  if auth.uid() is null then return new; end if;
  if old.role is distinct from new.role then
    if auth.uid() = old.id then
      raise exception 'You cannot change your own role';
    end if;
    select role into v_me from public.profiles where id = auth.uid();
    if v_me is distinct from 'admin' then
      raise exception 'Only the owner can assign roles';
    end if;
  end if;
  return new;
end $$;
