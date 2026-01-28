-- 1. Create a table for public profiles
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade,
  email text,
  username text, -- Optional
  full_name text, -- Optional
  avatar_url text, -- Optional
  updated_at timestamp with time zone,
  
  primary key (id)
);

-- 2. Enable RLS
alter table public.profiles enable row level security;

-- 3. Create policies (Drop first to avoid conflicts)
drop policy if exists "Public profiles are viewable by everyone." on profiles;
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

drop policy if exists "Users can insert their own profile." on profiles;
create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 4. Create a Function to handle new user signup
create or replace function public.handle_new_user() 
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- 5. Create the Trigger
-- This triggers ensures that whenever a user signs up via Supabase Auth,
-- a row is automatically created in public.profiles.
create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
