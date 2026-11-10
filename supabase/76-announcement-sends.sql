-- RecruitGrid - one row per account per announcement campaign
--
-- The 2026-09-14 "what's new" email stamped profiles.announce_features_sent_at
-- so a retry could never send twice. That worked for one campaign and makes a
-- second one impossible: every account that got the first is stamped, so a
-- new announcement would reach only people who joined since. This table holds
-- the stamp per campaign instead. The old column stays as the record of the
-- first send and is not read any more.
--
-- Same shape as outreach_sends: RLS on with no policies, so no browser
-- session can read or write it. app/api/announce writes it through the
-- service role after checking is_owner.

create table if not exists announcement_sends (
  user_id   uuid        not null references profiles(id) on delete cascade,
  campaign  text        not null,                 -- e.g. 'coach-addresses-2026-11'
  sent_at   timestamptz not null default now(),
  primary key (user_id, campaign)
);

alter table announcement_sends enable row level security;

-- ============================================================
-- VERIFY
-- ============================================================
-- select campaign, count(*) from announcement_sends group by campaign;
