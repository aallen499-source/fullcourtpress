-- 60-westmont-october-skills-camp.sql
--
-- Westmont College's second College Skills Camp, Saturday 10 October 2026,
-- run through Building Warriors Basketball on Ryzer and led by head coach
-- Justin Leslie and staff at Murchison Gymnasium. Read off the Ryzer event
-- page on 2026-09-15: boys, grades 9–12, 10am–3pm, $175, registration closes
-- the day before.
--
-- The September 19 session was already in the catalogue without a cost; it's
-- the same camp at the same price, so it gets the $175 and today's check.

insert into camps
  (school, division, camp_name, date, city, state, region, cost, eligibility,
   registration_status, source_url, sport, verified_at, type)
values
  ('Westmont College', 'NCAA D2', 'Warriors Basketball College Prospect Camp', '2026-10-10'::date,
   'Santa Barbara', 'CA', 'West', 175, 'High school prospects, grades 9–12', 'Open',
   'https://register.ryzer.com/camp.cfm?sport=4&id=337247', 'basketball-men', '2026-09-15'::date,
   'College Team Camp')
on conflict do nothing;

update camps
set cost = 175, verified_at = '2026-09-15'::date
where school = 'Westmont College'
  and camp_name = 'Warriors Basketball College Prospect Camp'
  and date = '2026-09-19';

-- Expect two rows: Sep 19 and Oct 10, both $175.
select camp_name, date, cost, source_url
from camps
where school = 'Westmont College' and sport = 'basketball-men'
order by date;
