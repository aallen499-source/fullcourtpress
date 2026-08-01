-- Full Court Press — enforce free-tier limits in the database
--
-- Until now the 10-coach / 2-film caps were JavaScript checks in
-- app/app/page.jsx. They stop an honest user, but anyone who opens dev
-- tools can call Supabase directly and blow straight past them, because
-- the RLS policy only ever asked "is this your row?" — never "are you
-- allowed another one?".
--
-- These policies move the ceiling to the database, where the client can't
-- argue with it.
--
-- NOTE ON RECURSION: a policy on `coaches` that runs `select count(*) from
-- coaches` re-triggers that same policy and Postgres refuses to evaluate it
-- ("infinite recursion detected in policy"). That bug already bit this
-- project once — see 09-fix-team-rls-recursion.sql. The counting helpers
-- below are SECURITY DEFINER, so they run as the table owner and skip RLS
-- internally, which breaks the cycle.

-- Paid subscription, or still inside the 3-day trial. Team members granted
-- access via an invite code have a real subscriptions row, so they're
-- covered by the first branch.
create or replace function fcp_is_paid_or_trial()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select
    exists (
      select 1 from subscriptions s
      where s.user_id = auth.uid()
        and s.status = 'active'
        and (s.current_period_end is null or s.current_period_end > now())
    )
    or exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and p.trial_started_at is not null
        and p.trial_started_at + interval '3 days' > now()
    );
$$;

create or replace function fcp_coach_count()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from coaches where user_id = auth.uid();
$$;

create or replace function fcp_film_count()
returns integer
language sql
security definer
set search_path = public
stable
as $$
  select count(*)::int from film where user_id = auth.uid();
$$;

-- ---------- coaches ----------
-- The old "own coaches" policy was `for all`, which covers insert too. It
-- has to be split so reading, editing and deleting stay unrestricted while
-- only *adding* is capped — otherwise a free user who hits the limit could
-- no longer open or delete what they already have.
drop policy if exists "own coaches" on coaches;

create policy "own coaches select" on coaches
  for select using (auth.uid() = user_id);

create policy "own coaches update" on coaches
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own coaches delete" on coaches
  for delete using (auth.uid() = user_id);

-- Keep this number in sync with FREE_COACH_LIMIT in app/app/page.jsx.
create policy "own coaches insert" on coaches
  for insert with check (
    auth.uid() = user_id
    and (fcp_is_paid_or_trial() or fcp_coach_count() < 10)
  );

-- ---------- film ----------
drop policy if exists "own film" on film;

create policy "own film select" on film
  for select using (auth.uid() = user_id);

create policy "own film update" on film
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "own film delete" on film
  for delete using (auth.uid() = user_id);

-- Keep this number in sync with FREE_FILM_LIMIT in app/app/page.jsx.
create policy "own film insert" on film
  for insert with check (
    auth.uid() = user_id
    and (fcp_is_paid_or_trial() or fcp_film_count() < 2)
  );

-- 02-policies.sql's "published film readable" policy is untouched and still
-- applies, so published profiles keep working for logged-out visitors.

-- ============================================================
-- VERIFY BEFORE RELYING ON THIS
-- ============================================================
-- 1. Signed in on a PAID or in-trial account: add a coach and a film link.
--    Both should still work with no limit.
-- 2. On a free account (trial expired, no active subscription): adding an
--    11th coach or a 3rd film link should now fail server-side, not just in
--    the UI.
-- 3. Still on that free account, confirm you can open, edit and delete the
--    coaches and film you already have — the cap is on adding only.
-- 4. Open a published profile while signed out and confirm film still loads.
--
-- To roll back, restore the originals from 02-policies.sql:
--   drop policy if exists "own coaches select"  on coaches;
--   drop policy if exists "own coaches update"  on coaches;
--   drop policy if exists "own coaches delete"  on coaches;
--   drop policy if exists "own coaches insert"  on coaches;
--   create policy "own coaches" on coaches
--     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
--   -- (and the same shape for film)
