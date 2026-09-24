-- 66-first-email-nudges.sql
--
-- Two nudges towards the FIRST coach email, sent by app/api/cron/first-email:
--   1. two calendar days after the profile was published
--   2. seven days after the first
-- Then nothing more. Stops the moment any school on the roster has been
-- emailed or marked contacted, or if the account turns off update emails.
--
-- Why: the 2026-09-23 activation pull. 35 accounts, 4 published profiles, and
-- exactly one athlete who had ever emailed a coach — the founder's son. The
-- setup wizard fixed the first wall (3 of 6 new accounts publish, against 1 of
-- 21 before it) and simply moved the problem one step along: people publish,
-- feel finished, and never write to anybody.
--
-- published_at is new because the nudge has to count from the publish, not the
-- signup — somebody who joins in September and publishes in November should
-- hear two days after November, not get chased from the start.
--
-- RUN THIS BEFORE THE CODE DEPLOYS.

alter table profiles add column if not exists published_at         timestamptz;
alter table profiles add column if not exists first_email_nudge1_at timestamptz;
alter table profiles add column if not exists first_email_nudge2_at timestamptz;

-- Backfill: everyone already published is treated as having published when
-- they signed up. That is wrong by a few days for a couple of accounts and
-- right in the only way that matters — they are all long past the two-day
-- mark, so they qualify for the first nudge on the next run either way.
update profiles
   set published_at = created_at
 where coalesce(public_published, false) = true
   and published_at is null;

-- The owner columns a browser must never write, now including publish time and
-- the two nudge stamps. This replaces the version in supabase/63 — same
-- function, longer list.
--
-- The stamping at the end runs AFTER the reverts on purpose: the trigger is
-- what sets published_at, for browser and server writes alike, so nobody can
-- backdate their own publish to pull a nudge forward, and re-publishing after
-- a spell offline keeps the original date rather than restarting the clock.
create or replace function protect_owner_columns()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.is_owner := false;
      new.announce_features_sent_at := null;
      new.setup_nudge1_at := null;
      new.setup_nudge2_at := null;
      new.first_email_nudge1_at := null;
      new.first_email_nudge2_at := null;
      new.published_at := null;
    else
      new.is_owner := old.is_owner;
      new.announce_features_sent_at := old.announce_features_sent_at;
      new.setup_nudge1_at := old.setup_nudge1_at;
      new.setup_nudge2_at := old.setup_nudge2_at;
      new.first_email_nudge1_at := old.first_email_nudge1_at;
      new.first_email_nudge2_at := old.first_email_nudge2_at;
      new.published_at := old.published_at;
    end if;
  end if;

  if coalesce(new.public_published, false) = true
     and (tg_op = 'INSERT' or coalesce(old.public_published, false) = false)
     and new.published_at is null then
    new.published_at := now();
  end if;

  return new;
end;
$$;

-- Who this would write to right now (nothing is sent by running this):
--   due_soon   — published, nobody contacted, never nudged
--   writing    — published and already talking to at least one school
select
  count(*) filter (
    where coalesce(p.public_published, false)
      and p.first_email_nudge1_at is null
      and not exists (
        select 1 from coaches c
         where c.user_id = p.id
           and (c.last_emailed_at is not null or (c.status is not null and c.status <> 'not_contacted'))
      )
  ) as due_soon,
  count(*) filter (
    where coalesce(p.public_published, false)
      and exists (
        select 1 from coaches c
         where c.user_id = p.id
           and (c.last_emailed_at is not null or (c.status is not null and c.status <> 'not_contacted'))
      )
  ) as writing
from profiles p;
