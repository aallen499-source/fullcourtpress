-- Remove the 3-day trial from the server-side limit checks.
--
-- The trial's clock started when the profile row was created, not when the
-- athlete first did anything, so it ran out during the single session most
-- people ever had. And what it unlocked — unlimited coaches and film above the
-- free 10 and 2 — was headroom nobody approached: of nineteen accounts,
-- seventeen let a trial expire having added zero coaches. It never once
-- decided whether someone could do what they were trying to do.
--
-- The free tier is the trial now, and it doesn't expire. A parent who comes
-- back three weeks later — which is the actual rhythm of a recruiting season —
-- finds their roster where they left it rather than a paywall.
--
-- This replaces the function in 21-enforce-free-limits.sql. The name is kept
-- (fcp_is_paid_or_trial) on purpose: it's referenced by the coaches and film
-- RLS policies created in that migration, and renaming it would mean dropping
-- and recreating every one of them for no benefit.
--
-- profiles.trial_started_at is deliberately NOT dropped. It's harmless
-- history, and dropping a column is the only irreversible step here.

create or replace function fcp_is_paid_or_trial()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  -- Paid only. Team members granted access via an invite code have a real
  -- subscriptions row, so they're still covered.
  select exists (
    select 1 from subscriptions s
    where s.user_id = auth.uid()
      and s.status = 'active'
      and (s.current_period_end is null or s.current_period_end > now())
  );
$$;

-- Sanity check — should return false for a free account with no subscription,
-- regardless of how recently they signed up:
--
--   select fcp_is_paid_or_trial();
