-- Profiles table
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  avatar text not null default '⭐',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Leaderboard scores
create table public.leaderboard_scores (
  user_id uuid primary key references auth.users(id) on delete cascade,
  xp integer not null default 0,
  streak integer not null default 0,
  tasks_completed integer not null default 0,
  updated_at timestamptz not null default now()
);

alter table public.leaderboard_scores enable row level security;

create policy "Scores are viewable by everyone"
  on public.leaderboard_scores for select
  using (true);

create policy "Users can insert own score"
  on public.leaderboard_scores for insert
  with check (auth.uid() = user_id);

create policy "Users can update own score"
  on public.leaderboard_scores for update
  using (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1), 'Player'),
    coalesce(new.raw_user_meta_data->>'avatar', '⭐')
  );
  insert into public.leaderboard_scores (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- updated_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger scores_touch before update on public.leaderboard_scores
  for each row execute function public.touch_updated_at();