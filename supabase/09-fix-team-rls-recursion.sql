-- Full Court Press — fix infinite recursion in team RLS policies
-- Run after 06-teams.sql (and 07, 08, 09 build on top of it).
--
-- The bug: profiles' "team owner can read team members" policy queries
-- teams, and teams' "member can read own team" policy queries profiles
-- right back — a circular RLS dependency Postgres detects and refuses to
-- evaluate, throwing "infinite recursion detected in policy for relation
-- profiles" on ANY select against profiles (which is why this broke the
-- data-migration upsert, not just the team feature itself).
--
-- Fix: security-definer helper functions bypass RLS internally (they run
-- as the table owner, which isn't subject to RLS on its own tables by
-- default), so calling them from a policy never re-triggers the other
-- table's policies — breaking the cycle entirely.

create or replace function is_team_owner(check_team_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from teams where id = check_team_id and owner_id = auth.uid()
  );
$$;

create or replace function my_team_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select team_id from profiles where id = auth.uid();
$$;

drop policy if exists "team owner can read team members" on profiles;
create policy "team owner can read team members" on profiles
  for select using (
    team_id is not null and is_team_owner(team_id)
  );

drop policy if exists "member can read own team" on teams;
create policy "member can read own team" on teams
  for select using (
    id = my_team_id()
  );

-- ============================================================
-- VERIFY BEFORE RELYING ON THIS
-- ============================================================
-- 1. Sign in as any account, confirm a plain `select * from profiles`-style
--    load (e.g. loading /app, or the "bring your data over" migration
--    prompt) works with no "infinite recursion" error
-- 2. Re-run the team join/roster-visibility test from 06-teams.sql's own
--    verification steps to confirm the fix didn't remove the actual access
