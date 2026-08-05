-- RecruitGrid — camp reminder emails: opt-out flag, unsubscribe token, send log
--
-- Reminders go to free and paid users alike. They are what brings someone back
-- to the app, so gating them behind a plan would cost more than it earns.

-- Default true: someone who saved a camp wants to hear about that camp. The
-- unsubscribe link in every email is the off switch.
alter table profiles add column if not exists email_reminders boolean not null default true;

-- Lets an unsubscribe link work from an email client with no session. A uuid
-- rather than the user id so the link can't be used to enumerate accounts or
-- act as a bearer token for anything else.
--
-- gen_random_uuid() is volatile, so Postgres rewrites the table on ADD COLUMN
-- and evaluates it per row — existing profiles each get their own token rather
-- than all sharing one.
alter table profiles add column if not exists unsubscribe_token uuid not null default gen_random_uuid();

create unique index if not exists profiles_unsubscribe_token_idx on profiles (unsubscribe_token);

-- Same idea as subscriptions.reminder_sent_at in 11: the cron runs daily, and
-- without a marker it would email the same person about the same camp every
-- day for a week.
alter table user_camps add column if not exists reminder_sent_at timestamptz;

-- The cron looks up registered camps that came from the shared catalog, so it
-- filters on these two constantly.
create index if not exists user_camps_reminder_idx
  on user_camps (status, camp_id) where reminder_sent_at is null;

-- ============================================================
-- VERIFY
-- ============================================================
--   select count(*) as profiles,
--          count(*) filter (where email_reminders) as opted_in,
--          count(distinct unsubscribe_token) as distinct_tokens
--     from profiles;
--   -- distinct_tokens should equal profiles: every row needs its own token.
