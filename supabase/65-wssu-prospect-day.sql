-- 65-wssu-prospect-day.sql
--
-- Winston-Salem State men's basketball Prospect Day, 18 October 2026.
--
-- A break in the usual sourcing rule, worth naming:
-- this camp is NOT on wssurams.com. It was announced on 2026-09-21 by head
-- coach Jay Butler (@jaybutlerwssu, butlerll@wssu.edu) and reposted by the program's own account,
-- and the flyer carries the date, the 9:00 AM start, the $100 price and the
-- pitch ("play in front of our coaching staff and be evaluated"). WSSU's own
-- camps page still shows only the summer Elite Camp, whose Blackbaud form now
-- answers "Online registration for this event has now closed".
--
-- So the source_url here is the coach's account rather than a registration
-- page, and the eligibility line tells families to email the staff. If WSSU
-- posts a proper page or form, update source_url to it — a registration link
-- is worth more to a parent than a social post.
--
-- Coach contacts, from wssurams.com: head coach Jay Butler, butlerll@wssu.edu;
-- the camps page lists Coach Jones, jonesja@wssu.edu, for camp questions.

insert into camps
  (school, division, camp_name, date, city, state, region, cost, eligibility,
   registration_status, source_url, sport, verified_at, type)
values
  ('Winston-Salem State University', 'NCAA D2', 'Men''s Basketball Prospect Day', '2026-10-18'::date,
   'Winston-Salem', 'NC', 'Southeast', 100,
   'High school prospects · 9:00am start · announced on the staff''s X account — email jonesja@wssu.edu to confirm a spot',
   'Open', 'https://x.com/jaybutlerwssu', 'basketball-men', '2026-09-21'::date, 'College Team Camp')
on conflict do nothing;
