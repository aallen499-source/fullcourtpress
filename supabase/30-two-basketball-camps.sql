-- RecruitGrid — two boys' basketball prospect camps, added from source pages
--
-- Both verified against the hosting site on 2026-08-04, and both dates checked
-- against the weekday each page states (Oct 4 is a Sunday, Aug 8 a Saturday) —
-- a mismatch there is the usual sign a page was copied from last year.
--
-- Divisions come from the EADA extract in lib/college-sports-data.js rather
-- than from the camp pages, neither of which states one: Roger Williams and
-- Oglethorpe are both D3.
--
-- cost is the total an athlete actually pays, fees included — $125 + $15 and
-- $95 + $5 respectively. Splitting them out would understate the real number.
--
-- Note Oglethorpe is Aug 8 2026, four days after this was written: it will
-- show as a past camp almost immediately. Added anyway because it is real and
-- the catalogue keeps its history.
--
-- Safe to re-run — camps_school_name_date_idx makes the conflict a no-op.

insert into camps
  (school, camp_name, division, region, cost, eligibility, registration_status,
   city, state, date, type, source_url, sport, verified_at)
values
  ('Roger Williams University', 'Elite Prospect Camp', 'NCAA D3', 'Northeast', 140,
   'Boys, grades 11-12', 'Open', 'Bristol', 'RI', '2026-10-04'::date, 'College Team Camp',
   'https://register.ryzer.com/camp.cfm?sport=4&id=338440', 'basketball-men', '2026-08-04'::date),
  ('Oglethorpe University', '2026 Elite/Prospect Camp', 'NCAA D3', 'Southeast', 100,
   'Boys, rising grades 10-12', 'Open', 'Brookhaven', 'GA', '2026-08-08'::date, 'College Team Camp',
   'https://www.oglethorpebasketballcamp.com/elite-camp.cfm', 'basketball-men', '2026-08-04'::date)
on conflict (school, camp_name, date) do nothing;

-- ============================================================
-- VERIFY
-- ============================================================
--   select sport, count(*) from camps group by sport order by sport;
--   -- basketball-men 62 -> 64, total 149 (with the dance clinic in 29).
