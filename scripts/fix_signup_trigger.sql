-- 1. Ensure public.profiles exists and has ALL required columns
create table if not exists public.profiles (
  id uuid references auth.users not null primary key,
  email text,
  username text,
  full_name text,
  avatar_url text,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Safely add columns if they are missing (in case table already existed)
do $$
begin
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'username') then
    alter table public.profiles add column username text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'full_name') then
    alter table public.profiles add column full_name text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'avatar_url') then
    alter table public.profiles add column avatar_url text;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'email') then
    alter table public.profiles add column email text;
  end if;
end $$;

-- 2. Make sure RLS is enabled but allows the trigger to work
alter table public.profiles enable row level security;

-- Policies (Drop first to avoid duplication error)
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update using ( auth.uid() = id );

drop policy if exists "Profiles are viewable by everyone" on public.profiles;
create policy "Profiles are viewable by everyone" on public.profiles
  for select using ( true );

-- 3. Fix the Trigger Function (SECURITY DEFINER is key - it bypasses RLS during signup)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, username, full_name, avatar_url)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- 4. Re-attach the trigger (safely)
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
