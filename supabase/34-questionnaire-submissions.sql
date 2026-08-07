-- RecruitGrid — athlete-submitted questionnaire links
--
-- When an athlete pastes a questionnaire link onto a coach, it shows in THEIR
-- finder immediately (that's read straight from their own coaches rows, no
-- table needed). This table is the second half: the link is also queued here
-- so it can be reviewed and, once approved, merged into the shared finder every
-- athlete sees — same review model as school_submissions.
--
-- Approval is manual for now: set status = 'approved' on a row and it appears
-- for everyone. That keeps the shared list trustworthy — the whole point of a
-- "verified" catalogue is that an unreviewed link never reaches other kids.

create table if not exists questionnaire_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  school text not null,
  state text,
  level text,
  gender text,
  sport text,
  url text not null,
  status text not null default 'pending', -- pending / approved / rejected
  created_at timestamptz default now()
);

create index if not exists questionnaire_submissions_status_idx on questionnaire_submissions(status);
-- One submission per athlete per link, so re-saving a coach doesn't pile up dupes.
create unique index if not exists questionnaire_submissions_user_url_idx on questionnaire_submissions(user_id, url);

alter table questionnaire_submissions enable row level security;

drop policy if exists "users view own q submissions" on questionnaire_submissions;
create policy "users view own q submissions" on questionnaire_submissions
  for select using (auth.uid() = user_id);

drop policy if exists "anyone signed in views approved q submissions" on questionnaire_submissions;
create policy "anyone signed in views approved q submissions" on questionnaire_submissions
  for select using (status = 'approved');

drop policy if exists "users submit own q suggestions" on questionnaire_submissions;
create policy "users submit own q suggestions" on questionnaire_submissions
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- REVIEW — see what's waiting, then approve the good ones
-- ============================================================
--   select school, url, sport, created_at from questionnaire_submissions
--    where status = 'pending' order by created_at desc;
--   update questionnaire_submissions set status = 'approved' where id = '...';
