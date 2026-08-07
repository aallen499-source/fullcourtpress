-- RecruitGrid — recruiting questionnaires
--
-- Two parts:
--  1. Per-school tracking on the coach roster: has this school's prospect
--     questionnaire been submitted, and the link to its form.
--  2. A master questionnaire on the athlete's profile — the standard fields
--     every school's form asks, filled once and reused. Most already exist
--     (grad_year, gpa, position, height, ncaa_id); these are the additions.

-- 1. Coach roster
alter table coaches add column if not exists questionnaire_submitted_at timestamptz;
alter table coaches add column if not exists questionnaire_url text;

-- 2. Master questionnaire (only fields not already on profiles)
alter table profiles add column if not exists weight text;
alter table profiles add column if not exists jersey_number text;
alter table profiles add column if not exists club_team text;
alter table profiles add column if not exists club_coach text;
alter table profiles add column if not exists test_scores text;
alter table profiles add column if not exists intended_major text;
alter table profiles add column if not exists key_stats text;
alter table profiles add column if not exists parent_contact text;

-- ============================================================
-- VERIFY
-- ============================================================
--   select column_name from information_schema.columns
--    where table_name = 'coaches'
--      and column_name in ('questionnaire_submitted_at','questionnaire_url');
--   -- expect 2 rows.
