-- Full Court Press — let new signups actually pick a role
--
-- 14-role-school-location-social.sql created profiles.role with
-- `default 'athlete'`, which meant every row — existing and newly
-- created — got 'athlete' automatically. My Info only shows the
-- "athlete or club/team coach?" picker when role is empty, so that
-- prompt never appeared for anyone, and a coach signing up before
-- buying Team/Club had no way to identify themselves.
--
-- Dropping the default lets new profiles start with role = null, which
-- is what makes the picker show. Existing rows keep whatever they have.

alter table profiles alter column role drop default;

-- Label the account that already bought Team/Club as a coach. Matches on
-- the plan name rather than a Stripe customer id prefix so it doesn't
-- depend on getting that string exactly right.
update profiles
set role = 'coach'
where id in (
  select user_id from subscriptions
  where status = 'active'
    and (plan ilike '%team%' or plan ilike '%club%')
);

-- ============================================================
-- VERIFY
-- ============================================================
-- select p.id, p.name, p.role, s.plan
-- from profiles p left join subscriptions s on s.user_id = p.id;
--
-- The Team/Club account should now show role = 'coach'.
