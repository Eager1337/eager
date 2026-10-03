-- Eager Connect contact lookup: resolve an authenticated user's exact email or phone
-- without exposing auth.users or contact details through the public profiles table.

create table if not exists public.profile_contacts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  phone text,
  updated_at timestamptz not null default now()
);

alter table public.profile_contacts enable row level security;
revoke all on public.profile_contacts from anon;
grant select, insert, update on public.profile_contacts to authenticated;

drop policy if exists profile_contacts_self on public.profile_contacts;
create policy profile_contacts_self on public.profile_contacts
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'username', ''), 'user-' || left(replace(new.id::text, '-', ''), 10)),
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), 'Eager user'),
    nullif(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;

  insert into public.profile_contacts (user_id, phone)
  values (new.id, nullif(trim(new.raw_user_meta_data->>'phone'), ''))
  on conflict (user_id) do update
    set phone = excluded.phone, updated_at = now();

  return new;
end;
$$;

drop function if exists public.find_eager_contact(text);
create or replace function public.find_eager_contact(p_contact text)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  is_verified boolean,
  last_seen_at timestamptz
)
language sql
security definer
set search_path = public, auth
as $$
  with input as (
    select
      lower(trim(coalesce(p_contact, ''))) as raw,
      regexp_replace(coalesce(p_contact, ''), '[^0-9+]', '', 'g') as phone
  )
  select p.id, p.username, p.display_name, p.avatar_url, p.bio, p.is_verified, p.last_seen_at
  from public.profiles p
  join auth.users u on u.id = p.id
  left join public.profile_contacts pc on pc.user_id = p.id
  cross join input i
  where p.id <> auth.uid()
    and i.raw <> ''
    and (
      lower(coalesce(u.email, '')) = i.raw
      or regexp_replace(coalesce(pc.phone, ''), '[^0-9+]', '', 'g') = i.phone
      or lower(p.username) = i.raw
    )
  order by p.last_seen_at desc
  limit 1;
$$;

revoke all on function public.find_eager_contact(text) from public;
grant execute on function public.find_eager_contact(text) to authenticated;
