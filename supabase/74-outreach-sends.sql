-- RecruitGrid - owner outreach log
--
-- The /outreach page sends personal, one-to-one emails to named families.
-- Unlike the announcement send, there is no per-profile "sent_at" column to
-- stamp, because these are ad hoc: a family can legitimately get a second
-- note weeks later. So the record lives in its own table and the API treats
-- an existing row as "ask again before you send", not as a hard block.
--
-- The full body is stored, not just the subject. If somebody replies three
-- weeks later asking "what did you mean by this", the exact text she sent
-- needs to still exist. Re-deriving it from the draft builder would give the
-- CURRENT wording, which may have changed.

create table if not exists outreach_sends (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  kind text not null,                       -- 'wall' | 'stalled'
  to_email text not null,
  subject text not null,
  body text not null,                       -- exactly what was sent
  sent_at timestamptz not null default now(),
  sent_by uuid references profiles(id) on delete set null
);

create index if not exists outreach_sends_user_idx on outreach_sends(user_id, sent_at desc);

-- No policies on purpose.
--
-- RLS on with zero policies means no browser session can read or write this
-- table at all, whoever they are. The outreach page reaches it through the
-- service-role client after checking is_owner, which bypasses RLS. That is
-- the safest shape available: these rows contain other families' email
-- addresses and the full text of private correspondence, so the default has
-- to be "nobody", not "the owner" (an is_owner policy would be one bad
-- profiles write away from leaking the lot).
alter table outreach_sends enable row level security;

-- ============================================================
-- VERIFY
-- ============================================================
-- 1. select * from outreach_sends;  -- as the SQL editor (service role): works
-- 2. From a signed-in browser session, the same select returns zero rows
--    even for the owner. That is correct, not a bug.
