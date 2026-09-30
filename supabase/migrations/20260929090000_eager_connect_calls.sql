-- Eager Connect: authenticated profiles plus WebRTC call signaling/state.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text not null,
  display_name text not null default 'Eager user',
  avatar_url text,
  bio text not null default '',
  is_verified boolean not null default false,
  last_seen_at timestamptz not null default now(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_username_length check (char_length(username) between 3 and 32),
  constraint profiles_username_format check (username ~ '^[A-Za-z0-9_.-]+$')
);
create unique index if not exists profiles_username_lower_idx on public.profiles (lower(username));
create index if not exists profiles_last_seen_idx on public.profiles (last_seen_at desc);

create or replace function public.handle_new_user_profile()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, display_name, avatar_url)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data->>'username', ''), 'user-' || left(replace(new.id::text, '-', ''), 10)),
    coalesce(nullif(new.raw_user_meta_data->>'display_name', ''), 'Eager user'),
    nullif(new.raw_user_meta_data->>'avatar_url', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;
drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile after insert on auth.users
for each row execute function public.handle_new_user_profile();

create table if not exists public.call_sessions (
  id uuid primary key default gen_random_uuid(),
  caller_id uuid not null references auth.users(id) on delete cascade,
  callee_id uuid not null references auth.users(id) on delete cascade,
  mode text not null default 'video',
  status text not null default 'ringing',
  started_at timestamptz,
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint call_sessions_no_self_call check (caller_id <> callee_id),
  constraint call_sessions_mode_check check (mode in ('voice','video')),
  constraint call_sessions_status_check check (status in ('ringing','active','declined','missed','ended'))
);
create index if not exists call_sessions_caller_idx on public.call_sessions (caller_id, created_at desc);
create index if not exists call_sessions_callee_idx on public.call_sessions (callee_id, created_at desc);
create unique index if not exists call_sessions_one_active_pair_idx
on public.call_sessions (least(caller_id, callee_id), greatest(caller_id, callee_id))
where status in ('ringing','active');

create or replace function public.protect_call_participants()
returns trigger language plpgsql as $
begin
  if old.caller_id <> new.caller_id or old.callee_id <> new.callee_id then
    raise exception 'Call participants cannot be changed';
  end if;
  return new;
end;
$;
drop trigger if exists protect_call_participants_trigger on public.call_sessions;
create trigger protect_call_participants_trigger
before update on public.call_sessions
for each row execute function public.protect_call_participants();


create table if not exists public.call_signals (
  id uuid primary key default gen_random_uuid(),
  call_id uuid not null references public.call_sessions(id) on delete cascade,
  sender_id uuid not null references auth.users(id) on delete cascade,
  kind text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  constraint call_signals_kind_check check (
    kind in ('offer','answer','ice','renegotiate-offer','renegotiate-answer','screen-start','screen-stop','chat','reaction')
  )
);
create index if not exists call_signals_call_idx on public.call_signals (call_id, created_at asc);

alter table public.profiles enable row level security;
alter table public.call_sessions enable row level security;
alter table public.call_signals enable row level security;

revoke all on public.profiles from anon;
revoke all on public.call_sessions from anon;
revoke all on public.call_signals from anon;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, update, delete on public.call_sessions to authenticated;
grant select, insert, delete on public.call_signals to authenticated;

drop policy if exists profiles_read_authenticated on public.profiles;
drop policy if exists profiles_insert_self on public.profiles;
drop policy if exists profiles_update_self on public.profiles;
create policy profiles_read_authenticated on public.profiles for select to authenticated using (true);
create policy profiles_insert_self on public.profiles for insert to authenticated with check (id = auth.uid());
create policy profiles_update_self on public.profiles for update to authenticated using (id = auth.uid()) with check (id = auth.uid());

drop policy if exists call_sessions_read_participant on public.call_sessions;
drop policy if exists call_sessions_insert_caller on public.call_sessions;
drop policy if exists call_sessions_update_participant on public.call_sessions;
drop policy if exists call_sessions_delete_participant on public.call_sessions;
create policy call_sessions_read_participant on public.call_sessions for select to authenticated using (caller_id = auth.uid() or callee_id = auth.uid());
create policy call_sessions_insert_caller on public.call_sessions for insert to authenticated with check (caller_id = auth.uid());
create policy call_sessions_update_participant on public.call_sessions for update to authenticated using (caller_id = auth.uid() or callee_id = auth.uid()) with check (caller_id = auth.uid() or callee_id = auth.uid());
create policy call_sessions_delete_participant on public.call_sessions for delete to authenticated using (caller_id = auth.uid() or callee_id = auth.uid());

drop policy if exists call_signals_read_participant on public.call_signals;
drop policy if exists call_signals_insert_participant on public.call_signals;
drop policy if exists call_signals_delete_participant on public.call_signals;
create policy call_signals_read_participant on public.call_signals for select to authenticated using (
  exists (select 1 from public.call_sessions c where c.id = call_id and (c.caller_id = auth.uid() or c.callee_id = auth.uid()))
);
create policy call_signals_insert_participant on public.call_signals for insert to authenticated with check (
  sender_id = auth.uid() and exists (
    select 1 from public.call_sessions c where c.id = call_id and (c.caller_id = auth.uid() or c.callee_id = auth.uid())
  )
);
create policy call_signals_delete_participant on public.call_signals for delete to authenticated using (
  exists (select 1 from public.call_sessions c where c.id = call_id and (c.caller_id = auth.uid() or c.callee_id = auth.uid()))
);

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'call_sessions') then
      execute 'alter publication supabase_realtime add table public.call_sessions';
    end if;
    if not exists (select 1 from pg_publication_tables where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = 'call_signals') then
      execute 'alter publication supabase_realtime add table public.call_signals';
    end if;
  end if;
end $$;