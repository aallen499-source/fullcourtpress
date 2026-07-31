-- Full Court Press — Team/Club rosters
-- Run after 01 through 05.
--
-- One person (the Team/Club plan buyer) owns a team. Athletes join via an
-- invite code they enter themselves — they keep their own independent
-- account and data; joining only links their profile to the team so the
-- owner can see a roster of names + published-profile links.

create table if not exists teams (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  invite_code text unique not null,
  created_at timestamptz default now()
);

alter table profiles add column if not exists team_id uuid references teams(id) on delete set null;

alter table teams enable row level security;

drop policy if exists "owner manages own team" on teams;
create policy "owner manages own team" on teams
  for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

-- Lets someone who has joined a team look up its name (and, yes, its own
-- invite code — they could just ask whoever invited them anyway). Scoped to
-- only the one team they're actually on, via their own profile row — this
-- does NOT let anyone list or browse other teams.
drop policy if exists "member can read own team" on teams;
create policy "member can read own team" on teams
  for select using (
    id in (select team_id from profiles where id = auth.uid())
  );

-- Lets a team owner see (name, public_slug, public_published, etc. — not
-- private roster/outreach data, which lives in other tables entirely) for
-- athletes who've joined their team. Combines via OR with the existing
-- "own profile" and "published profiles readable" policies.
drop policy if exists "team owner can read team members" on profiles;
create policy "team owner can read team members" on profiles
  for select using (
    team_id is not null
    and team_id in (select id from teams where owner_id = auth.uid())
  );

create or replace function join_team(invite_code_input text)
returns table(team_id uuid, team_name text)
language plpgsql
security definer
set search_path = public
as $$
declare
  target_team_id uuid;
  target_team_name text;
begin
  select id, name into target_team_id, target_team_name
  from teams where invite_code = invite_code_input;

  if target_team_id is null then
    raise exception 'Invalid invite code';
  end if;

  update profiles set team_id = target_team_id where id = auth.uid();

  return query select target_team_id, target_team_name;
end;
$$;

-- ============================================================
-- VERIFY BEFORE RELYING ON THIS
-- ============================================================
-- 1. Sign in as you+a@gmail.com, create a team, note the invite code
-- 2. Sign in as you+b@gmail.com, join using that code
-- 3. As you+a, confirm you+b now shows up in the team roster
-- 4. As you+b, confirm `select * from teams` (if you tried it directly)
--    returns zero rows — you should only be able to join by code, not browse
