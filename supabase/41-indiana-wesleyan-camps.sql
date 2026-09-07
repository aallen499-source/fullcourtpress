-- RecruitGrid — correct and extend the Indiana Wesleyan softball camps
--
-- 40-new-college-camps.sql flagged two Monday dates as worth checking, on the
-- rule that a weekday camp is usually a page carried over from last year. Both
-- checked out: Indiana Wesleyan really does run Monday Spotlight Days, and
-- Maryland's Oct 12 is Columbus Day. The flag was a false positive, and the
-- source page is the only thing that could have said so.
--
-- Reading it properly turned up more than the dates. indwessoftball.com lists
-- four camps where the source list had two, along with the city, real grade
-- eligibility and prices with fees broken out — so the two existing rows are
-- filled in and the two missing camps added.
--
-- Costs are the all-in figure an athlete actually pays, matching the rule in
-- 30-two-basketball-camps.sql: $140 + $15 fees for a Spotlight Day, $200 + $15
-- for the full three-session prospect camp. The cheaper two-session and
-- single-clinic options are deliberately not modelled — the column holds one
-- number, and the highest-value ticket is the honest one to show.
--
-- Maryland is left alone. Its page confirms October 12th, 2026 at College Park
-- and quotes $200-$300, which is a range rather than a price. A single figure
-- there would be invented, and the same reasoning that rejects a "0" for an
-- unknown cost rejects picking an end of a range.

-- Fill in the two rows already added from the source list.
update camps
   set city = 'Marion',
       eligibility = '9th-12th grade as of Fall 2026',
       cost = 155,
       verified_at = '2026-09-06'::date
 where school = 'Indiana Wesleyan University'
   and camp_name = 'Softball Spotlight Day'
   and date = '2026-10-19'::date;

update camps
   set city = 'Marion',
       eligibility = '9th-12th grade as of Fall 2026',
       cost = 215,
       verified_at = '2026-09-06'::date
 where school = 'Indiana Wesleyan University'
   and camp_name = 'Softball High School Prospect Camp'
   and date = '2026-11-21'::date;

-- The two the source list missed. The January date runs past the end of the
-- catalogue, which until now stopped on 2026-12-29.
insert into camps
  (school, camp_name, division, region, cost, eligibility, registration_status,
   city, state, date, type, source_url, sport, verified_at)
values
  ('Indiana Wesleyan University', 'Softball Spotlight Day', 'NAIA', 'Midwest', 155,
   '9th-12th grade as of Fall 2026', 'Open', 'Marion', 'IN', '2026-09-21'::date,
   'College Team Camp', 'https://www.indwessoftball.com/register.cfm', 'softball-women',
   '2026-09-06'::date),
  ('Indiana Wesleyan University', 'Softball High School Prospect Camp', 'NAIA', 'Midwest', 215,
   '9th-12th grade as of Fall 2026', 'Open', 'Marion', 'IN', '2027-01-23'::date,
   'College Team Camp', 'https://www.indwessoftball.com/register.cfm', 'softball-women',
   '2026-09-06'::date)
on conflict (school, camp_name, date) do nothing;

-- ============================================================
-- VERIFY
-- ============================================================
--   select camp_name, date, city, cost, eligibility
--     from camps
--    where school = 'Indiana Wesleyan University'
--    order by date;
--   -- expect four rows: 2026-09-21, 2026-10-19, 2026-11-21, 2027-01-23,
--   -- all with city Marion and a cost of 155 or 215.
