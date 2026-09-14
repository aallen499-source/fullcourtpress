-- 49-adams-state-prospect-camp.sql
--
-- One camp, found while confirming New Mexico has none. Ryzer's event search
-- turned up no basketball events within 200 miles of Albuquerque, Las Cruces
-- or Roswell; the nearest was this one, 170 miles north in Alamosa. It is a
-- Colorado camp and goes on the Colorado page, not New Mexico's.
--
-- Read off the event page on 2026-09-14: Adams State Women's Basketball, head
-- coach Nic Cantrell, Sunday 20 September 2026, 9am-1pm, Plachy Hall, girls
-- entering 9th-12th grade, $65 ($60 + $5 fees).
--
-- Deliberately NOT added alongside it: "Horned Frogs Women's Basketball in
-- Midland" (Ryzer id 342597). It is a free K-8 youth clinic and team
-- meet-and-greet, not a recruiting camp — the same reason UW's coaches' clinic
-- was left off.

insert into camps
  (school, camp_name, division, region, cost, eligibility, registration_status,
   city, state, date, type, source_url, sport, verified_at)
values
  ('Adams State University', 'Women''s Basketball Prospect Camp', 'NCAA D2', 'Mountain', 65,
   'Girls entering 9th-12th grade', 'Open', 'Alamosa', 'CO', '2026-09-20'::date,
   'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=340240',
   'basketball-women', '2026-09-14'::date)
on conflict do nothing;

-- Expect one row.
select school, camp_name, date, cost, source_url
from camps
where school = 'Adams State University' and date = '2026-09-20'::date;
