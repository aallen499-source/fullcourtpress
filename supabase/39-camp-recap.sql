-- RecruitGrid — post-camp recap and follow-up
--
-- The weekend is exposure; the week after is when recruiting actually happens.
-- Nothing in the product acknowledged that a camp had been and gone, so the
-- one moment an athlete has something concrete to say to a coach — "I was at
-- your camp on Saturday" — passed in silence.
--
-- Three columns, no new table: user_camps already carries notes and a
-- coach_ids array linking the coaches met there.

-- The camp's real date. user_camps.dates is free text ("August 8-10") because
-- athletes type their own camps, so it cannot be compared against today. This
-- is populated from the shared catalogue when a camp is tracked, and stays null
-- for hand-typed camps — which is why those get no automatic prompt. Guessing a
-- date from free text to nag someone about the wrong weekend is worse than
-- staying quiet.
alter table user_camps add column if not exists camp_date date;

-- How it went, in the athlete's own words. Separate from notes, which already
-- holds the catalogue's division/cost/eligibility detail — overwriting that to
-- store a reflection would lose the camp's own information.
alter table user_camps add column if not exists recap text;

-- Stamped when the recap is saved. Also the "stop asking" marker: the prompt
-- keys off this being null, not off recap being non-empty, so someone who
-- genuinely has nothing to write can still put the question to bed.
alter table user_camps add column if not exists recap_at timestamptz;

-- Backfill dates for camps already tracked from the catalogue.
update user_camps uc
   set camp_date = c.date
  from camps c
 where c.id = uc.camp_id
   and uc.camp_date is null;

create index if not exists user_camps_recap_idx
  on user_camps (user_id, camp_date) where recap_at is null;

-- ============================================================
-- VERIFY
-- ============================================================
--   select count(*) as tracked,
--          count(camp_date) as dated,
--          count(*) filter (where camp_date < current_date and recap_at is null) as awaiting_recap
--     from user_camps;
--   -- dated should equal the number of rows with a camp_id.
