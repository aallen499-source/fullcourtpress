-- Full Court Press — Row Level Security
-- Run AFTER 01-schema.sql.
--
-- This is the most important file in the project. Signing in identifies WHO
-- someone is; these policies are what stop them reading someone else's rows.
-- Every athlete's data sits in the same tables — these are the only separation.

alter table profiles      enable row level security;
alter table coaches       enable row level security;
alter table film          enable row level security;
alter table templates     enable row level security;
alter table user_camps    enable row level security;
alter table camps         enable row level security;
alter table schools       enable row level security;
alter table subscriptions enable row level security;

-- ---------- an athlete's own data ----------
drop policy if exists "own profile" on profiles;
create policy "own profile" on profiles
  for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "own coaches" on coaches;
create policy "own coaches" on coaches
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own film" on film;
create policy "own film" on film
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own templates" on templates;
create policy "own templates" on templates
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "own camps" on user_camps;
create policy "own camps" on user_camps
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- The `with check` half matters as much as `using`. Without it, someone could
-- INSERT a row with another user's user_id even though they can't read theirs.

-- ---------- public profile pages ----------
-- Lets a logged-out coach open a published profile link. Only rows the athlete
-- explicitly published are visible.
drop policy if exists "published profiles readable" on profiles;
create policy "published profiles readable" on profiles
  for select using (public_published = true);

-- Film shown on a published profile.
drop policy if exists "published film readable" on film;
create policy "published film readable" on film
  for select using (
    exists (
      select 1 from profiles p
      where p.id = film.user_id and p.public_published = true
    )
  );

-- ---------- shared reference data ----------
-- Readable by everyone, writable by nobody through the app.
-- Load and update these from the Supabase dashboard or a server-side script.
drop policy if exists "camps readable" on camps;
create policy "camps readable" on camps for select using (true);

drop policy if exists "schools readable" on schools;
create policy "schools readable" on schools for select using (true);

-- ---------- subscriptions ----------
-- Athletes may READ their own subscription; only the Stripe webhook (running with
-- the service_role key, which bypasses RLS) may write it. No insert/update policy
-- is defined here on purpose — that's what stops someone granting themselves a plan.
drop policy if exists "read own subscription" on subscriptions;
create policy "read own subscription" on subscriptions
  for select using (auth.uid() = user_id);


-- ============================================================
-- VERIFY BEFORE BUILDING ANYTHING ELSE
-- ============================================================
-- 1. Sign up as you+a@gmail.com
-- 2. Insert a coaches row for that user
-- 3. Sign out; sign up as you+b@gmail.com
-- 4. From the app, select * from coaches  →  MUST return zero rows
-- 5. Try selecting account A's row by its id  →  still zero
--
-- If B can see A's data, stop and fix this file. Nothing built after this
-- matters until that test passes.
