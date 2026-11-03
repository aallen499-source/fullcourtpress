-- 73-signup-reminders.sql
--
-- One record per person who asked for a sign-in link, never clicked it, and
-- was sent a single reminder.
--
-- WHY A TABLE AND NOT A COLUMN. Every other email stamp in this project lives
-- on profiles, and this one cannot: the people it is about have no profile
-- row. That is deliberate — migration 70 creates the row at CONFIRMATION, so
-- that an address somebody typed into the sign-in box and never confirmed does
-- not become an account, a count or a mailing-list entry. These are the only
-- people we email who are not users, so they get their own, separate record.
--
-- WHAT THE PROBLEM IS. 51 people have asked for a sign-in link and 13 never
-- came back. Right now those 13 get nothing further, ever: they are not in
-- profiles, so no setup nudge, no challenge, nothing can reach them. Their
-- original link expired in an hour. From their side they tried the product
-- once and it did not work.
--
-- The confirm rate by provider is 92% on Gmail and 29% everywhere else, which
-- looked like a delivery fault until the sending setup turned out to be
-- correct — custom SMTP through Resend, SPF, DKIM and DMARC all aligned on
-- recruitgrid.app. And the monthly rate shows a slope, not a cliff: 100%, 81%,
-- 68%, 67%, 75%. A broken configuration gives you a cliff. A slope like that
-- is the audience changing, from people Angela told personally in July to
-- strangers from search who were not watching for an email.
--
-- So this does not try to decide whether the first email was blocked or merely
-- missed. It sends a second one, 24 hours later, from the same authenticated
-- domain, and fixes both cases without having to tell them apart.
--
-- ONE, AND ONLY ONE. The primary key is the user id, the job inserts before it
-- sends, and a duplicate insert fails. Somebody who ignores the reminder hears
-- nothing more — they typed an address into a box once and that does not earn
-- a campaign. That guarantee comes from the key, not from a flag anybody has
-- to remember to check.
--
-- stopped_at therefore has no job to do today: the row existing already stops
-- a second send. It is here because "they asked us not to contact them" is a
-- fact worth keeping permanently and separately from "we already did". The
-- day anything else is built on this table, that distinction is the one that
-- matters, and it cannot be reconstructed later.

create table if not exists signup_reminders (
  user_id      uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  sent_at      timestamptz not null default now(),
  -- Random, unguessable and per-person, so the "don't email me again" link in
  -- the message cannot be used to opt anybody else out.
  stop_token   uuid not null default gen_random_uuid(),
  stopped_at   timestamptz
);

create unique index if not exists signup_reminders_stop_token_idx
  on signup_reminders (stop_token);

-- RLS on with no policy: every browser request is denied. Only the service
-- role touches this, and the service role bypasses RLS. It holds the addresses
-- of people who are not users and never finished signing up, which makes it
-- the last table in the project that should ever be readable from a client.
alter table signup_reminders enable row level security;

comment on table signup_reminders is
  'One row per unconfirmed signup that has been sent its single reminder. Written by /api/cron/signup-reminder. These people have no profiles row by design, so their send state cannot live there.';

-- Expect 0 before the job has ever run.
select count(*) as reminders_sent from signup_reminders;
