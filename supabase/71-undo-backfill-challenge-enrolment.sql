-- 71-undo-backfill-challenge-enrolment.sql
--
-- Repairs damage done by migration 70's backfill on 2026-10-30.
--
-- WHAT WENT WRONG. Migration 70 inserted profile rows for accounts that had
-- confirmed an email address and never got one. It set setup_nudge1_at and
-- setup_nudge2_at on those rows specifically so that running a migration could
-- not post "finish setting up" to people who abandoned a signup weeks ago.
-- That reasoning was right and the precaution was not enough, because it
-- guarded the wrong door.
--
-- profiles already carries a BEFORE INSERT trigger, protect_owner_columns,
-- most recently rewritten by migration 67. Its last clause is:
--
--     if tg_op = 'INSERT' and new.challenge_started_at is null then
--       new.challenge_started_at := now();
--     end if;
--
-- and that clause sits OUTSIDE the `auth.jwt() ->> 'role' in (...)` guard that
-- protects everything above it. So it fires for any insert from anywhere,
-- including one typed into the SQL editor. Every row the backfill created was
-- therefore enrolled in the 7-day challenge, and from the next morning those
-- people began receiving a daily email about finishing a signup they had
-- walked away from — triggered by a schema change rather than by anything they
-- did. Precisely the outcome migration 70's comments claimed to prevent.
--
-- The lesson, and it is not "read the triggers" — it is narrower and more
-- useful: an INSERT into a table that other features hang off is not a data
-- change, it is an EVENT. profiles has three triggers and several jobs that
-- select from it, and creating a row there means "a new athlete has arrived"
-- to every one of them. A backfill is the one case where that is false, and
-- nothing in the insert says so.
--
-- WHAT THIS DOES NOT TOUCH. New accounts are supposed to start the challenge,
-- so the trigger stays exactly as it is and the signup path in migration 70 is
-- correct and unchanged. This only unwinds the historic rows.

-- The fingerprint for a backfilled row: setup_nudge1_at and setup_nudge2_at
-- set to the very same instant. The real job writes them 28 days apart and one
-- at a time, so no genuine account can look like this.
--
-- challenge_day is captured HERE, before step 1 resets it. Reading it
-- afterwards would report zero emails sent for everybody, which is the
-- comforting answer rather than the true one.
create temporary table backfilled as
select p.id,
       u.created_at   as real_signup,
       p.challenge_day as emails_sent
from profiles p
join auth.users u on u.id = p.id
where p.setup_nudge1_at is not null
  and p.setup_nudge1_at = p.setup_nudge2_at;

-- 1. Un-enrol them. Nulling challenge_started_at rather than setting
--    email_challenge = false, because that is the truthful record: they were
--    never enrolled by any act of their own. The cron selects on
--    `challenge_started_at is not null`, so this stops the sending, and it
--    leaves them eligible for a genuine invitation later. Flipping
--    email_challenge would instead store a preference the person never
--    expressed, and would quietly exclude them from a week they might want.
update profiles p
   set challenge_started_at = null,
       challenge_day        = 0,
       challenge_day_sent_at = null
  from backfilled b
 where p.id = b.id
   and p.challenge_day < 7;

-- 2. Give them back their real signup date. profiles.created_at defaults to
--    now(), so every backfilled row claims it was created on 2026-10-30 — the
--    day of the migration, not the day the person signed up. Left alone that
--    silently corrupts every cohort and funnel count this project has, and in
--    the most annoying way: the numbers stay plausible.
update profiles p
   set created_at = b.real_signup
  from backfilled b
 where p.id = b.id
   and p.created_at > b.real_signup;

-- Verify. Expect still_enrolled = 0 and wrong_date = 0. emails_they_received
-- is the count that is already spent — it cannot be taken back, and it is the
-- number worth knowing before deciding whether anyone deserves an apology.
select
  (select count(*) from backfilled)                                      as backfilled_rows,
  (select count(*) from profiles p join backfilled b on b.id = p.id
    where p.challenge_started_at is not null)                            as still_enrolled,
  (select count(*) from profiles p join backfilled b on b.id = p.id
    where p.created_at > b.real_signup)                                  as wrong_date,
  (select coalesce(sum(emails_sent), 0) from backfilled)                 as emails_they_received,
  (select count(*) from backfilled where emails_sent > 0)                as people_who_got_one;

-- ---------------------------------------------------------------------------
-- 2026-11-03: the repair above matched ZERO rows, which is good news but needs
-- confirming rather than assuming, because there are two ways to get a zero
-- and only one of them is harmless:
--
--   (a) migration 70's backfill inserted nothing, because no account was ever
--       actually stranded. Likely: the one suspect, from 25 October, turned
--       out never to have CONFIRMED, and the backfill filters on confirmed.
--       The original "no profile row" alarm came from an older query that did
--       not yet separate "never clicked" from "broken", so the thing I was
--       repairing may never have existed.
--
--   (b) the backfill did insert rows, and the fingerprint is wrong — if
--       protect_owner_columns blanked setup_nudge1_at and setup_nudge2_at on
--       insert they would be null, not equal, and those people would still be
--       mid-challenge and still receiving email while this query reports zero.
--
-- This tells them apart. It looks at the state itself instead of at a
-- fingerprint: everyone currently enrolled in the challenge, and anyone whose
-- profile row was created suspiciously long after they signed up.
select
  left(coalesce(u.email, p.email, '?'), 3) || '***'   as who,
  u.created_at::date                                  as signed_up,
  p.created_at::date                                  as profile_row_made,
  p.created_at::date - u.created_at::date             as days_between,
  p.challenge_day                                     as challenge_emails_sent,
  p.challenge_day_sent_at::date                       as last_challenge_email,
  p.setup_nudge1_at::date                             as nudge1,
  p.setup_nudge2_at::date                             as nudge2,
  case
    when p.created_at::date - u.created_at::date > 1
      then 'PROFILE MADE LONG AFTER SIGNUP — look at this one'
    else 'normal'
  end                                                 as shape
from profiles p
join auth.users u on u.id = p.id
where p.challenge_started_at is not null
   or p.created_at::date - u.created_at::date > 1
order by p.challenge_day desc, u.created_at desc;
