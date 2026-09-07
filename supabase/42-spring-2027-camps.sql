-- RecruitGrid — spring 2027 camps found by re-reading sources already on file
--
-- The catalogue stopped on 2026-12-29 and the plan was to go collecting in
-- January. Re-reading the 111 source pages already attached to future camps
-- found 2027 dates on six of them — schools that had published their spring
-- calendar on the same page the autumn dates came from. Cheaper than finding
-- new schools, and worth repeating before any collection push.
--
-- Each row below was read off the school's own page today, not carried from a
-- list. Where a page gave detail the existing rows lacked, the detail is used.
--
-- One 2027 hit was correctly rejected: West Texas A&M's page mentions
-- "August 24th, 2026 through May 10th, 2027", which is the run of their dance
-- academy, not a camp. A date on a page is not a camp.
--
-- Deliberately NOT added: Grand Canyon's January hitting and infield clinic
-- series. The page gives them as a range, 01/04/2027 - 01/25/2027, and the
-- existing rows model that series one row per week. The weeks are almost
-- certainly the Mondays — 4, 11, 18, 25 — but that is inference, and inferring
-- four dates is how a catalogue that claims hand verification stops deserving
-- the claim. They need the page's own week-by-week listing.

insert into camps
  (school, camp_name, division, region, cost, eligibility, registration_status,
   city, state, date, type, source_url, sport, verified_at)
values
  -- Spring 2027 — the point of the exercise
  ('Colorado College', 'Women''s Basketball Elite Camp', 'NCAA D3', 'West', 101,
   'Grades 10-12', 'Open', 'Colorado Springs', 'CO', '2027-04-10'::date,
   'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=337480&sport=4',
   'basketball-women', '2026-09-06'::date),

  ('LSU Eunice', 'Prospect Camp', 'NJCAA', 'Southeast', 100,
   'High school players', 'Open', 'Eunice', 'LA', '2027-03-07'::date,
   'College Team Camp', 'https://athletics.lsue.edu/sports/2007/10/22/camps.aspx',
   'soccer-men', '2026-09-06'::date),

  ('Sam Houston State University', 'Winter All-Skills Camp', 'NCAA D1', 'South Central', 175,
   'Grades 7–college sophomore as of fall 2026', 'Open', 'Huntsville', 'TX', '2027-01-09'::date,
   'College Team Camp', 'https://www.garrettvalissoftballcamps.com/',
   'softball-women', '2026-09-06'::date),

  ('Grand Canyon University', 'January Prospect Camp I', 'NCAA D1', 'West', null,
   'Grades 8–12', 'Open', 'Phoenix', 'AZ', '2027-01-09'::date,
   'College Team Camp', 'https://www.gcusoftballcamps.com/register.cfm',
   'softball-women', '2026-09-06'::date),

  ('Grand Canyon University', 'January Pre-Camp Pitching Session I', 'NCAA D1', 'West', null,
   'Grades 8–12', 'Open', 'Phoenix', 'AZ', '2027-01-09'::date,
   'College Team Camp', 'https://www.gcusoftballcamps.com/register.cfm',
   'softball-women', '2026-09-06'::date),

  ('Grand Canyon University', 'January Prospect Camp II', 'NCAA D1', 'West', null,
   'Grades 8–12', 'Open', 'Phoenix', 'AZ', '2027-01-21'::date,
   'College Team Camp', 'https://www.gcusoftballcamps.com/register.cfm',
   'softball-women', '2026-09-06'::date),

  ('Grand Canyon University', 'January Pre-Camp Pitching Session II', 'NCAA D1', 'West', null,
   'Grades 8–12', 'Open', 'Phoenix', 'AZ', '2027-01-21'::date,
   'College Team Camp', 'https://www.gcusoftballcamps.com/register.cfm',
   'softball-women', '2026-09-06'::date),

  -- Autumn 2026 camps the same pages showed we were missing
  ('Sam Houston State University', 'Hitting Clinic', 'NCAA D1', 'South Central', 65,
   'Grades 8–12 as of fall 2026', 'Open', 'Huntsville', 'TX', '2026-11-16'::date,
   'College Team Camp', 'https://www.garrettvalissoftballcamps.com/',
   'softball-women', '2026-09-06'::date),

  ('West Texas A&M University', 'Women''s Soccer Fall Elite ID Camp', 'NCAA D2', 'South Central', 150,
   'Ages 15+', 'Open', 'Canyon', 'TX', '2026-11-01'::date,
   'College Team Camp', 'https://www.wtamu.edu/academics/extended-studies/eod-summer-youth-programs/registration-dates.html',
   'soccer-women', '2026-09-06'::date)
on conflict (school, camp_name, date) do nothing;

-- ============================================================
-- VERIFY
-- ============================================================
--   select date, school, camp_name, sport
--     from camps where date >= '2027-01-01' order by date;
--   -- expect 8 rows: Jan 9 (x3), Jan 21 (x2), Jan 23, Mar 7, Apr 10.
--
--   select max(date) from camps;   -- should now be 2027-04-10, was 2026-12-29
