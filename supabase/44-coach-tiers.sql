-- 44-coach-tiers.sql
--
-- Dream / Target / Safety on every coach row.
--
-- The point is not categorisation, it is the blank page. "Add 10 coaches" is
-- the step 20 of 22 accounts have never completed, because naming ten programmes
-- from nothing is hard and adding a realistic one feels like conceding
-- something. Three named lanes turn it into a recipe — two dream, five target,
-- three safety — which lands on exactly ten, the Free plan's cap.
--
-- Deliberately nullable: every coach already on a roster stays untiered rather
-- than being guessed into a lane, and the readiness panel counts an untiered
-- roster as work still to do rather than silently inventing an answer.
alter table coaches add column if not exists tier text;

create index if not exists coaches_tier_idx on coaches(user_id, tier);
