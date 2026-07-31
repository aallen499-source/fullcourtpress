-- Full Court Press — schema
-- Run this FIRST in Supabase → SQL Editor, then run 02-policies.sql separately.

-- extends Supabase's built-in auth.users
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text,
  name text,
  sport text,
  grad_year text,
  school text,
  bio text,
  signature text,
  position text,
  height text,
  gpa text,
  ncaa_id text,
  show_ncaa_publicly boolean default false,
  public_slug text unique,
  public_published boolean default false,
  film_slug text unique,
  film_published boolean default false,
  created_at timestamptz default now()
);

create table if not exists coaches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  school text,
  sport text,
  level text,                       -- D1 / D2 / D3 / NAIA / JUCO / Club
  email text,
  status text default 'not_contacted',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists film (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  title text not null,
  url text not null,
  sport text,
  description text,
  created_at timestamptz default now()
);

create table if not exists templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  subject text,
  body text,
  created_at timestamptz default now()
);

-- an athlete's own camp tracking
create table if not exists user_camps (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  camp_id uuid,                     -- points at camps.id when it came from the shared list
  name text,
  type text,
  status text default 'considering',
  location text,
  dates text,
  url text,
  notes text,
  coach_ids uuid[] default '{}',
  created_at timestamptz default now()
);

-- SHARED reference data — everyone reads, nobody writes from the app.
-- This is the moat: keep verified_at current and show it in the UI.
create table if not exists camps (
  id uuid primary key default gen_random_uuid(),
  school text,
  division text,
  camp_name text,
  date date,
  city text,
  state text,
  region text,
  cost numeric,
  eligibility text,
  registration_status text,
  source_url text,
  sport text default 'basketball',
  verified_at date,
  created_at timestamptz default now()
);

create table if not exists schools (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  conference text,
  division text,
  sport text default 'basketball'
);

-- subscriptions, written by a Stripe webhook (never by the browser)
create table if not exists subscriptions (
  user_id uuid primary key references profiles(id) on delete cascade,
  plan text,                        -- annual / season / team
  status text,                      -- active / canceled / past_due
  current_period_end timestamptz,
  stripe_customer_id text,
  updated_at timestamptz default now()
);

create index if not exists coaches_user_idx     on coaches(user_id);
create index if not exists film_user_idx        on film(user_id);
create index if not exists templates_user_idx   on templates(user_id);
create index if not exists user_camps_user_idx  on user_camps(user_id);
create index if not exists camps_date_idx       on camps(date);
create index if not exists camps_state_idx      on camps(state);
