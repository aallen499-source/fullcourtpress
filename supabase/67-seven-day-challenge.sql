-- 67-seven-day-challenge.sql
--
-- The 7-day challenge: one task a day for a week, ending with the athlete
-- having emailed a real college coach. Sent by app/api/cron/challenge, one
-- email each morning, day N going N days after the account was created.
--
-- Why: the 2026-09-23 activation pull. 35 accounts, 4 published profiles, and
-- exactly one athlete who had ever emailed a coach. Outside the founder's own
-- account, not a single user had saved even one coach's address — so day 3 of
-- the week is nothing but "find one human being to write to".
--
-- ENROLMENT IS FOR NEW ACCOUNTS ONLY. The trigger stamps challenge_started_at
-- when a profile row is created, so every account that existed before this
-- migration stays null and hears nothing. That is deliberate: the people who
-- signed up weeks ago deserve a personal note first, not an automated week.
--
-- To invite an existing account by hand, once they've agreed:
--   update profiles set challenge_started_at = now(), challenge_day = 0
--    where id = '<uuid>';
--
-- To stop somebody mid-week without touching their other email settings:
--   update profiles set email_challenge = false where id = '<uuid>';
--
-- RUN THIS BEFORE THE CODE DEPLOYS.

alter table profiles add column if not exists challenge_started_at  timestamptz;
alter table profiles add column if not exists challenge_day         integer not null default 0;
alter table profiles add column if not exists challenge_day_sent_at timestamptz;
alter table profiles add column if not exists email_challenge       boolean not null default true;

-- Server-only columns, same rule as the other nudge stamps: a browser can't
-- decide which day of the challenge it is on, or backdate its start. The
-- stamping at the end runs after the reverts, so the trigger is the only thing
-- that ever sets challenge_started_at.
--
-- email_challenge is NOT protected — it is a preference, and the unsubscribe
-- route needs to be able to turn it off the same way it does the others.
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
      new.challenge_started_at := null;
      new.challenge_day := 0;
      new.challenge_day_sent_at := null;
    else
      new.is_owner := old.is_owner;
      new.announce_features_sent_at := old.announce_features_sent_at;
      new.setup_nudge1_at := old.setup_nudge1_at;
      new.setup_nudge2_at := old.setup_nudge2_at;
      new.first_email_nudge1_at := old.first_email_nudge1_at;
      new.first_email_nudge2_at := old.first_email_nudge2_at;
      new.published_at := old.published_at;
      new.challenge_started_at := old.challenge_started_at;
      new.challenge_day := old.challenge_day;
      new.challenge_day_sent_at := old.challenge_day_sent_at;
    end if;
  end if;

  if coalesce(new.public_published, false) = true
     and (tg_op = 'INSERT' or coalesce(old.public_published, false) = false)
     and new.published_at is null then
    new.published_at := now();
  end if;

  -- Every new account starts the week. Coaches are filtered out by the job
  -- rather than here, because the role can be chosen after the row exists.
  if tg_op = 'INSERT' and new.challenge_started_at is null then
    new.challenge_started_at := now();
  end if;

  return new;
end;
$$;

-- Who is mid-challenge right now (nothing is sent by running this). Expect
-- zero rows immediately after this migration — enrolment starts with the next
-- account that signs up.
select
  count(*) filter (where challenge_started_at is not null and challenge_day < 7 and email_challenge) as in_progress,
  count(*) filter (where challenge_day >= 7)                                                         as finished,
  count(*) filter (where challenge_started_at is not null and email_challenge = false)               as opted_out
from profiles;
