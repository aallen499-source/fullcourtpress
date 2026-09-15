-- 62-november-mens-basketball-camps.sql
--
-- November men's basketball camps for high school players, college-run.
--
-- There is almost nothing: college seasons tip off in early November, so
-- programs stop running prospect camps. A search of Ryzer on 2026-09-15 for
-- college-hosted basketball events 1–30 November returned nine, and one was a
-- men's camp for high school players. A web search and the showcase companies
-- turned up no other college-run November camp with a live registration page.
--
-- Dakota State University (NAIA), read off its Ryzer page: Sunday 1 November,
-- 12–3pm, classes of 2027–2030, $60 ($50 + $10 fees), 40 players max.

insert into camps
  (school, division, camp_name, date, city, state, region, cost, eligibility,
   registration_status, source_url, sport, verified_at, type)
values
  ('Dakota State University', 'NAIA', 'Dakota State Prospect Camp', '2026-11-01'::date,
   'Madison', 'SD', 'Midwest', 60, 'Classes of 2027–2030 · 12–3pm · $50 + $10 fees · limit 40', 'Open',
   'https://register.ryzer.com/camp.cfm?id=341066', 'basketball-men', '2026-09-15'::date, 'College Team Camp')
on conflict do nothing;

select date, school, camp_name, cost
from camps
where sport = 'basketball-men' and date between '2026-11-01' and '2026-11-30'
order by date;
