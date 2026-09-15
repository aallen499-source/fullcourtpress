-- 61-october-mens-basketball-camps.sql
--
-- Ten college-run men's basketball camps in October 2026, from the list Angela
-- supplied, each checked on its own official or registration page on
-- 2026-09-15 (date, price, grades). University of Chicago runs two days, so it
-- is two rows. None of these schools had an October men's basketball camp in
-- the catalogue before.
--
-- Where the page and the list differed, the page won: Brockport runs 1–5pm
-- for classes of 2027–2029; Rivier is $126 for high school players (ages 14+).
-- Lees-McRae's form doesn't show a price, so cost is left empty rather than
-- guessed.

insert into camps
  (school, division, camp_name, date, city, state, region, cost, eligibility,
   registration_status, source_url, sport, verified_at, type)
values
  ('Azusa Pacific University', 'NCAA D2', 'Elite Camp II', '2026-10-03'::date,
   'Azusa', 'CA', 'West', 111, 'Boys grades 9–12 · 9am–12pm · $100 + $11 fees', 'Open',
   'https://register.ryzer.com/camp.cfm?id=341545&sport=4', 'basketball-men', '2026-09-15'::date, 'College Team Camp'),

  ('Covenant College', 'NCAA D3', 'Men''s Basketball Elite Camp', '2026-10-03'::date,
   'Lookout Mountain', 'GA', 'Southeast', 75, 'High school players · 9am–12pm · Ashe Gym', 'Open',
   'https://athletics.covenant.edu/news/2026/9/2/mens-basketball-announces-elite-camp-on-october-3.aspx', 'basketball-men', '2026-09-15'::date, 'College Team Camp'),

  ('University of Chicago', 'NCAA D3', 'Fall Prospect Camp - Day 1', '2026-10-03'::date,
   'Chicago', 'IL', 'Midwest', 200, 'Ages 14–19 · 9:30am–4:30pm · $380 for both days', 'Open',
   'https://universityofchicagomensbasketball.totalcamps.com/shop/product/656956', 'basketball-men', '2026-09-15'::date, 'College Team Camp'),

  ('University of Chicago', 'NCAA D3', 'Fall Prospect Camp - Day 2', '2026-10-04'::date,
   'Chicago', 'IL', 'Midwest', 200, 'Ages 14–19 · 9:30am–4:30pm · $380 for both days', 'Open',
   'https://universityofchicagomensbasketball.totalcamps.com/shop/product/656956', 'basketball-men', '2026-09-15'::date, 'College Team Camp'),

  ('Wheeling University', 'NCAA D2', 'Elite Camp - Session II', '2026-10-04'::date,
   'Wheeling', 'WV', 'Mid-Atlantic', 60, 'Boys entering grades 9–12 · 2–5pm', 'Open',
   'https://wheelingmensbasketball.totalcamps.com/shop', 'basketball-men', '2026-09-15'::date, 'College Team Camp'),

  ('Warner Pacific University', 'NAIA', 'Men''s Basketball Prospect Camp', '2026-10-10'::date,
   'Portland', 'OR', 'West', 75, 'High school players · 9am–3pm · plus processing fees', 'Open',
   'https://warnerpacific.regfox.com/2026-mens-basketball-prospect-camp', 'basketball-men', '2026-09-15'::date, 'College Team Camp'),

  ('Pacific University', 'NCAA D3', 'High School Elite Camp', '2026-10-10'::date,
   'Forest Grove', 'OR', 'West', 65, 'Grades 9–12 · 8am–1pm · Stoller Center', 'Open',
   'http://coachluntbasketballcamps.com/camps.php', 'basketball-men', '2026-09-15'::date, 'College Team Camp'),

  ('SUNY Brockport', 'NCAA D3', 'Brockport Hoops Prospect Camp', '2026-10-11'::date,
   'Brockport', 'NY', 'Northeast', 85, 'Classes of 2027–2029 · 1–5pm · $75 + $10 fees', 'Open',
   'https://register.ryzer.com/camp.cfm?id=339328&sport=4', 'basketball-men', '2026-09-15'::date, 'College Team Camp'),

  ('Rivier University', 'NCAA D3', 'Columbus Day Prospect Camp', '2026-10-12'::date,
   'Nashua', 'NH', 'Northeast', 126, 'High school players, ages 14+ · 12–3pm', 'Open',
   'https://rivierathletics.com/sports/2025/4/1/sport-camps.aspx', 'basketball-men', '2026-09-15'::date, 'College Team Camp'),

  ('Lees-McRae College', 'NCAA D2', 'Men''s Basketball Elite Camp', '2026-10-24'::date,
   'Banner Elk', 'NC', 'Southeast', null, 'High school grades 9–12', 'Open',
   'https://leesmcrae.formstack.com/forms/men_s_basketball_elite_camp_fall2026', 'basketball-men', '2026-09-15'::date, 'College Team Camp'),

  ('Milwaukee School of Engineering', 'NCAA D3', 'Elite Prospect Camp', '2026-10-31'::date,
   'Milwaukee', 'WI', 'Midwest', 50, 'Boys grades 9–12 · 11:30am–2:30pm · open practice after', 'Open',
   'https://msoeraiders.com/sports/2023/2/17/camps-clinics-Mens-Prospect-Basketball.aspx', 'basketball-men', '2026-09-15'::date, 'College Team Camp')
on conflict do nothing;

-- Expect 11 rows (Chicago counts twice).
select date, school, camp_name, cost
from camps
where sport = 'basketball-men' and verified_at = '2026-09-15' and date between '2026-10-01' and '2026-10-31'
order by date;
