-- 58-private-profile-columns-and-phone.sql
--
-- Stop exposing private profile columns, and add the athlete's phone number.
--
-- THE PROBLEM. "published profiles readable" (02) let anyone read a published
-- profile's ROW — every column, not just what /[slug] shows. A row-level
-- policy can't limit columns, so through the public API a stranger could read
-- the login email, parent contact, GPA with the NCAA ID even when it was
-- hidden, and the codes behind the unsubscribe and parent-update links. The
-- same was true of "team owner can read team members" (06) for a club coach.
-- A phone number for a minor cannot go into a table like that.
--
-- THE FIX. Two views that expose only the columns each audience needs. A view
-- runs as its owner, so it can read published rows without either policy, and
-- the policies are dropped. Everything else about profiles stays private to
-- the account itself.
--
-- RUN IN TWO PARTS.
--   Part 1 now, before the code deploys: adds the columns and the views, and
--   points the film policy at the view. Nothing is removed yet, so the live
--   site keeps working either way.
--   Part 2 after the deploy (the pages now read the views): drops the two
--   broad policies.

-- ============================ PART 1 ============================

alter table profiles add column if not exists phone text;
alter table profiles add column if not exists show_phone boolean not null default false;

create or replace view public_profiles as
select
  id,
  public_slug,
  public_published,
  name,
  sport,
  grad_year,
  school,
  school_city,
  school_state,
  position,
  height,
  gpa,
  case when show_ncaa_publicly then ncaa_id end as ncaa_id,
  show_ncaa_publicly,
  avatar_url,
  bio,
  instagram,
  twitter,
  facebook,
  email,
  key_stats,
  stats,
  case when show_phone then phone end as phone
from profiles
where public_published = true;

-- Supabase grants new views to the API roles by default, including writes —
-- and a simple view is updatable, running as its owner. Read only.
revoke all on public_profiles from anon, authenticated;
grant select on public_profiles to anon, authenticated;

create or replace view team_member_profiles as
select id, team_id, name, public_slug, public_published
from profiles
where team_id is not null
  and team_id in (select t.id from teams t where t.owner_id = auth.uid());

revoke all on team_member_profiles from anon, authenticated;
grant select on team_member_profiles to authenticated;

-- Film on a published profile: same rule, checked through the view so it keeps
-- working once profiles are no longer readable row by row.
drop policy if exists "published film readable" on film;
create policy "published film readable" on film
  for select using (
    exists (select 1 from public_profiles p where p.id = film.user_id)
  );

-- Expect the number of published profiles, twice.
select
  (select count(*) from profiles where public_published) as published,
  (select count(*) from public_profiles)                 as in_public_view;

-- ============================ PART 2 ============================
-- Run only after the code that reads public_profiles has deployed.
--
-- drop policy if exists "published profiles readable" on profiles;
-- drop policy if exists "team owner can read team members" on profiles;
--
-- select policyname from pg_policies where tablename = 'profiles';
-- (expect only "own profile")
