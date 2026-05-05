
-- 1) Add username to profiles
alter table public.profiles
  add column if not exists username text;

-- Backfill usernames from display_name (lowercased, alnum + underscore), ensure uniqueness with id suffix
update public.profiles
set username = lower(regexp_replace(coalesce(display_name, 'player'), '[^a-zA-Z0-9_]', '', 'g')) || '_' || substr(id::text, 1, 6)
where username is null;

alter table public.profiles
  alter column username set not null;

create unique index if not exists profiles_username_key on public.profiles (lower(username));

-- Update handle_new_user to also set username
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  base_name text;
  candidate text;
  suffix int := 0;
begin
  base_name := lower(regexp_replace(
    coalesce(new.raw_user_meta_data->>'username',
             new.raw_user_meta_data->>'display_name',
             split_part(new.email, '@', 1),
             'player'),
    '[^a-zA-Z0-9_]', '', 'g'));
  if base_name = '' then base_name := 'player'; end if;
  candidate := base_name;
  while exists (select 1 from public.profiles where lower(username) = candidate) loop
    suffix := suffix + 1;
    candidate := base_name || suffix::text;
  end loop;

  insert into public.profiles (id, display_name, avatar, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Player'),
    coalesce(new.raw_user_meta_data->>'avatar', '⭐'),
    candidate
  );
  insert into public.leaderboard_scores (user_id) values (new.id);
  return new;
end;
$function$;

-- Trigger on auth.users (create only if missing)
do $$ begin
  if not exists (select 1 from pg_trigger where tgname = 'on_auth_user_created') then
    create trigger on_auth_user_created
    after insert on auth.users
    for each row execute function public.handle_new_user();
  end if;
end $$;

-- 2) Friendships table
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  friend_id uuid not null,
  requester_id uuid not null,
  status text not null default 'pending' check (status in ('pending','accepted')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, friend_id),
  check (user_id <> friend_id)
);

create index if not exists friendships_user_idx on public.friendships(user_id);
create index if not exists friendships_friend_idx on public.friendships(friend_id);

alter table public.friendships enable row level security;

drop policy if exists "View own friendships" on public.friendships;
create policy "View own friendships"
on public.friendships for select
using (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "Send friend request" on public.friendships;
create policy "Send friend request"
on public.friendships for insert
with check (auth.uid() = requester_id and (auth.uid() = user_id or auth.uid() = friend_id));

drop policy if exists "Update own friendships" on public.friendships;
create policy "Update own friendships"
on public.friendships for update
using (auth.uid() = user_id or auth.uid() = friend_id);

drop policy if exists "Delete own friendships" on public.friendships;
create policy "Delete own friendships"
on public.friendships for delete
using (auth.uid() = user_id or auth.uid() = friend_id);

create trigger friendships_touch_updated_at
before update on public.friendships
for each row execute function public.touch_updated_at();
