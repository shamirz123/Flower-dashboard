-- Flower consumption dashboard: multi-user schema (one row per flower per box, like the Excel sheet).
-- Every row belongs to the user who created it and is only visible to that user.
-- Run once in the Supabase SQL Editor on a fresh project.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

create table if not exists public.usage_entries (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  entry_date date,
  flower text not null,
  box text not null,
  recipe_qty numeric(10,2) not null default 0 check (recipe_qty >= 0),
  actual_qty numeric(10,2) check (actual_qty >= 0),
  -- Actual minus recipe. Null until the actual usage is known.
  variance numeric(10,2) generated always as (actual_qty - recipe_qty) stored,
  reason text,
  action text,
  status text not null default 'pending' check (status in ('pending','complete')),
  comment text,
  created_at timestamptz not null default now()
);

create index if not exists idx_usage_user_date on public.usage_entries(user_id, entry_date desc);
create index if not exists idx_usage_user_flower on public.usage_entries(user_id, flower);

-- Create a profile for every new account (email signup or Google).
create or replace function public.flower_handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  return new;
end $$;

drop trigger if exists flower_on_auth_user_created on auth.users;
create trigger flower_on_auth_user_created after insert on auth.users
  for each row execute function public.flower_handle_new_user();

-- Row level security: users only ever see and change their own rows.
alter table public.profiles enable row level security;
drop policy if exists "own_profile" on public.profiles;
create policy "own_profile" on public.profiles for select to authenticated
  using (id = (select auth.uid()));

alter table public.usage_entries enable row level security;
drop policy if exists "own_rows" on public.usage_entries;
create policy "own_rows" on public.usage_entries for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));
