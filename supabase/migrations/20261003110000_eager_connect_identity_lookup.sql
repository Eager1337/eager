-- Eager Connect: secure lookup by Eager username, account email, or phone number.
-- Email/phone are read from auth.users and are never exposed as public profile columns.

create or replace function public.find_eager_call_target(identifier text)
returns table (
  id uuid,
  username text,
  display_name text,
  avatar_url text,
  bio text,
  is_verified boolean,
  last_seen_at timestamptz
)
language plpgsql
security definer
set search_path = public, auth
as $$
declare
  raw text := trim(identifier);
  normalized_phone text := regexp_replace(raw, '[^0-9]', '', 'g');
begin
  if auth.uid() is null or raw = '' then
    return;
  end if;

  return query
  select p.id, p.username, p.display_name, p.avatar_url, p.bio, p.is_verified, p.last_seen_at
  from auth.users u
  join public.profiles p on p.id = u.id
  where u.id <> auth.uid()
    and (
      lower(p.username) = lower(raw)
      or lower(u.email) = lower(raw)
      or (
        normalized_phone <> ''
        and u.phone is not null
        and regexp_replace(u.phone, '[^0-9]', '', 'g') = normalized_phone
      )
    )
  limit 1;
end;
$$;

revoke all on function public.find_eager_call_target(text) from public;
revoke all on function public.find_eager_call_target(text) from anon;
grant execute on function public.find_eager_call_target(text) to authenticated;
