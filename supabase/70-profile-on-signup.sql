-- 70-profile-on-signup.sql
--
-- Create the profile row the moment an account is confirmed, instead of
-- waiting for the app to write one.
--
-- THE PROBLEM THIS REMOVES, rather than monitors. Until now nothing created a
-- profile row: app/app/page.jsx upserts one the first time the athlete SAVES
-- something. So between clicking their sign-in link and typing their first
-- field, a person existed in auth.users and nowhere else — and in that gap
-- they were not a slightly incomplete account, they were invisible:
--
--   * every query we have starts FROM profiles, so they appeared in no count,
--     no funnel, no activation check. The numbers were not merely missing
--     them, the numbers could not see them.
--   * every scheduled email selects FROM profiles, so no setup nudge, no
--     challenge, nothing could reach them. The person most in need of "here is
--     how to finish" was the one person unreachable by it.
--   * profiles.created_at, which the setup nudges count from, did not exist
--     until they had already done the thing the nudges are meant to prompt.
--
-- The health check now reports these daily, which is worth having. But a check
-- that tells you about a hole every morning is not the same as filling it in.
-- This fills it in; the check becomes the backstop rather than the mechanism.
--
-- ON CONFIRMATION, NOT ON SIGNUP, and the distinction matters here more than
-- it would anywhere else. Sign-in is a magic link (signInWithOtp with
-- shouldCreateUser), and GoTrue writes the auth.users row when the link is
-- REQUESTED, not when it is clicked. A trigger on plain INSERT would therefore
-- mint a profile for every address anybody ever typed into the sign-in box —
-- inflating every count with people who never arrived, and worse, making them
-- eligible for setup nudges. We would be emailing "finish setting up your
-- profile" to someone who never confirmed an address, which is both useless to
-- them and exactly the kind of mail that costs a domain its reputation.
--
-- So: two triggers, one function. The UPDATE one is the real path — null
-- email_confirmed_at becoming non-null is the click. The INSERT one covers an
-- account that arrives already confirmed, which is how an admin-created or
-- OAuth account would appear, so that route cannot quietly reopen the gap.
--
-- WHAT IT DELIBERATELY DOES NOT SET. Only id and email. role in particular is
-- left null on purpose: migration 16 dropped its default precisely so My Info
-- shows the "athlete or club/team coach?" picker, which only appears while
-- role is empty. Setting it here would hide that picker from every new account
-- and quietly turn every coach into an athlete. Everything else on profiles
-- has a sensible default — including unsubscribe_token's gen_random_uuid() —
-- so a two-column insert produces a complete, usable row.
--
-- WHY IT CANNOT BREAK SIGNING IN. The insert is wrapped. A trigger that raises
-- on auth.users rolls back the transaction it is part of, and somebody who
-- cannot sign in at all is a far worse outcome than somebody with a missing
-- profile row. If this ever fails it warns in the Postgres logs and lets the
-- sign-in through, and the health check's stranded-signup report catches
-- whatever slips past. Prevention first, detection behind it.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
-- Pinned so the function cannot be hijacked by a search_path that resolves
-- `profiles` to another table. Standard hardening for SECURITY DEFINER, which
-- runs with the owner's rights and so bypasses RLS — which is the point, since
-- this runs before any user session exists.
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
exception when others then
  raise warning 'handle_new_user could not create a profile for %: %', new.id, sqlerrm;
  return new;
end;
$$;

-- Named for what it keys on. An earlier draft called this on_auth_user_created
-- and fired on every insert, which was the bug described above.
drop trigger if exists on_auth_user_created          on auth.users;
drop trigger if exists on_auth_user_confirmed_insert on auth.users;
drop trigger if exists on_auth_user_confirmed_update on auth.users;

-- Already confirmed at creation: admin-created and OAuth accounts.
create trigger on_auth_user_confirmed_insert
  after insert on auth.users
  for each row
  when (new.email_confirmed_at is not null)
  execute function handle_new_user();

-- The normal path: they clicked the magic link.
create trigger on_auth_user_confirmed_update
  after update on auth.users
  for each row
  when (old.email_confirmed_at is null and new.email_confirmed_at is not null)
  execute function handle_new_user();

-- Backfill everyone who confirmed and never got a row, so they stop being
-- invisible. CONFIRMED ONLY, for the same reason the trigger is: an address
-- that requested a link and never clicked it is an unconverted lead, not a
-- broken account, and giving it a profile row would put a stranger into the
-- email rotation.
insert into public.profiles (id, email, setup_nudge1_at, setup_nudge2_at)
select
  u.id,
  u.email,
  -- Both nudge timestamps filled, so these accounts get NO automated setup
  -- email. That is a choice and the alternative was worse: leave them null and
  -- the next cron run posts "finish setting up" to everyone who abandoned a
  -- signup weeks ago, all at once, triggered by a migration rather than by
  -- anything they did. Running a migration should not send mail to a stranger.
  --
  -- They are now visible, countable and reachable. Writing to them becomes a
  -- decision to make deliberately, not a side effect of a schema change.
  now(),
  now()
from auth.users u
left join public.profiles p on p.id = u.id
where p.id is null
  and u.email_confirmed_at is not null
on conflict (id) do nothing;

-- A note on the two `before insert or update` triggers already on profiles
-- (protect_owner_columns from 56, protect_parent_update_columns from 55),
-- because they look like they should interfere and do not:
--
--   * The signup trigger is unaffected either way. Those guards only blank
--     server-only columns, and this inserts nothing but id and email.
--   * The backfill sets setup_nudge1_at and setup_nudge2_at, which
--     protect_owner_columns WOULD blank on insert — but only when
--     auth.jwt() ->> 'role' is 'authenticated' or 'anon', i.e. a browser
--     request. In the SQL editor there is no JWT, the guard does not fire, and
--     the values stick. Migration 63 is the proof: its own `update profiles
--     set setup_nudge1_at = ...` ran from here and took effect, which it could
--     not have done if the guard applied to this context.

-- Verify. Expect stranded = 0 and triggers_installed = 2.
--
-- unconfirmed is NOT a problem to fix here and should not be zero — it is
-- everyone who ever typed an address into the sign-in box and never clicked
-- the link. If that number is large relative to accounts, the question is
-- email deliverability or the wording of the sign-in page, not this migration.
select
  (select count(*) from auth.users u
     left join public.profiles p on p.id = u.id
    where p.id is null and u.email_confirmed_at is not null)        as stranded,
  (select count(*) from pg_trigger
    where tgname in ('on_auth_user_confirmed_insert', 'on_auth_user_confirmed_update')
      and not tgisinternal)                                         as triggers_installed,
  (select count(*) from auth.users where email_confirmed_at is null) as unconfirmed,
  (select count(*) from public.profiles)                            as profiles,
  (select count(*) from auth.users)                                 as accounts,
  (select count(*) from public.profiles where unsubscribe_token is null) as missing_token,
  (select count(*) from public.profiles where role is null)         as role_null_picker_shows;
