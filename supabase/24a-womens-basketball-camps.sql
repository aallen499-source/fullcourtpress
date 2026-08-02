-- Full Court Press — 2026 women's college basketball camps
--
-- Source workbook: 2026_Nationwide_Womens_College_Basketball_Camps, 55 rows,
-- researched 2026-08-01 from official athletics pages, school camp sites and
-- Ryzer (the registration platform the schools themselves use). Unlike the
-- earlier FieldLevel tracker, these links point at the actual registration
-- pages, and a spot check against Bowling Green's Ryzer listing matched the
-- workbook exactly on date, cost and eligibility.
--
-- Gender now has to be explicit. The existing 65 camps are all men's/boys
-- events but were tagged only 'basketball', and nothing in the UI filtered on
-- sport. Dropping 55 women's camps into that list would have shown every
-- athlete a mixed catalog with no way to tell which camps were for them.
--
-- Step 1 relabels the existing rows, step 2 adds the new ones, and the Camps
-- tab gains a Men's/Women's filter in the same change.

-- ============================================================
-- STEP 1 — label the existing camps as men's
-- Expect: 65
-- ============================================================
update camps set sport = 'basketball-men' where sport = 'basketball';

-- STEP 2a — women's camps, rows 1-18 of 55
-- Expect: 18 inserted

insert into camps (
  school, camp_name, division, region, cost, eligibility,
  registration_status, city, state, date, source_url, sport, verified_at
) values
  ('Bowling Green State University', 'August Elite Camp', 'NCAA D1', 'Midwest', 105, 'Grades 8-12; ages 13-18', 'Verify immediately', 'Bowling Green', 'OH', '2026-08-02'::date, 'https://register.ryzer.com/camp.cfm?id=320823&sport=4', 'basketball-women', '2026-08-01'::date),
  ('Concordia University Texas', 'Women''s Basketball Prospect Camp', 'NCAA D3', 'South', 59, 'Girls, grade 9 and up', 'Verify immediately', 'Austin', 'TX', '2026-08-02'::date, 'https://register.ryzer.com/camp.cfm?id=338501&sport=4', 'basketball-women', '2026-08-01'::date),
  ('Kalamazoo College', 'Women''s Basketball Prospect Camp', 'NCAA D3', 'Midwest', 75, 'Grades 9-12', 'Verify immediately', 'Kalamazoo', 'MI', '2026-08-02'::date, 'https://hornets.kzoo.edu/sports/2024/5/16/camps-basketball-index.aspx', 'basketball-women', '2026-08-01'::date),
  ('St. Mary''s University (Texas)', 'Women''s Basketball Elite Camp', 'NCAA D2', 'South', 75, 'High school athletes; verify grades', 'Verify immediately', 'San Antonio', 'TX', '2026-08-02'::date, 'https://calendar.stmarytx.edu/', 'basketball-women', '2026-08-01'::date),
  ('UC San Diego', 'Elite Camp 2', 'NCAA D1', 'West', 90, 'Grades 9-12', 'Verify immediately', 'La Jolla', 'CA', '2026-08-02'::date, 'https://www.ucsandiegowomensbasketballcamps.com/', 'basketball-women', '2026-08-01'::date),
  ('University of Missouri-Kansas City', 'Women''s Basketball Elite Camp', 'NCAA D1', 'Midwest', 40, 'High school athletes', 'Verify immediately', 'Kansas City', 'MO', '2026-08-02'::date, 'https://kcroos.com/news/2026/6/23/sign-up-for-kansas-city-womens-basketball-camps', 'basketball-women', '2026-08-01'::date),
  ('Wayne State College', 'Elite Women''s Basketball Camp', 'NCAA D2', 'Midwest', null, 'High school athletes; verify grades', 'Verify immediately', 'Wayne', 'NE', '2026-08-02'::date, 'https://www.wsc.edu/basketball-camps', 'basketball-women', '2026-08-01'::date),
  ('Mid Michigan College', 'Women''s Basketball Elite/Youth Camp', 'NJCAA', 'Midwest', 55, 'Elite group: 2027-2030 graduates', 'Open; verify availability', 'Mount Pleasant', 'MI', '2026-08-05'::date, 'https://register.ryzer.com/camp.cfm?id=338290&sport=4', 'basketball-women', '2026-08-01'::date),
  ('Saint Louis University', 'August Elite Camp', 'NCAA D1', 'Midwest', 74, 'Grades 8-12', 'Open; verify availability', 'St. Louis', 'MO', '2026-08-05'::date, 'https://register.ryzer.com/camp.cfm?id=331837', 'basketball-women', '2026-08-01'::date),
  ('Benedictine College', 'High School Elite Camp', 'NAIA', 'Midwest', 70, 'Rising grades 9-12', 'Open; verify availability', 'Atchison', 'KS', '2026-08-06'::date, 'https://ravenathletics.com/news/2026/5/4/womens-basketball-announces-august-6-elite-camp.aspx', 'basketball-women', '2026-08-01'::date),
  ('Felician University', 'Women''s Basketball Prospect Camp', 'NCAA D2', 'Northeast', null, 'High school prospects; verify grades', 'Open; verify availability', 'Rutherford', 'NJ', '2026-08-08'::date, 'https://felicianuathletics.com/sports/2026/6/30/wbb-prospect-camp.aspx', 'basketball-women', '2026-08-01'::date),
  ('Houston Christian University', 'Women''s Basketball Prospect Camp', 'NCAA D1', 'South', 91, 'Grades 9-12', 'Open; verify availability', 'Houston', 'TX', '2026-08-08'::date, 'https://register.ryzer.com/camp.cfm?id=336211&sport=4', 'basketball-women', '2026-08-01'::date),
  ('Lewis University', 'Women''s Basketball Elite Camp #2', 'NCAA D2', 'Midwest', null, 'High school prospects; verify grades', 'Open; verify details', 'Romeoville', 'IL', '2026-08-08'::date, 'https://www.alumni.lewisu.edu/page.aspx?pid=1517', 'basketball-women', '2026-08-01'::date),
  ('Loras College', 'Elite Camp I', 'NCAA D3', 'Midwest', 60, 'Grades 10-12; unsigned 2026s and classes 2027-2028', 'Open; verify availability', 'Dubuque', 'IA', '2026-08-08'::date, 'https://register.ryzer.com/camp.cfm?id=335615&sport=4', 'basketball-women', '2026-08-01'::date),
  ('South Carolina State University', 'Women''s Basketball Elite Camp', 'NCAA D1', 'South', 75, 'Girls ages 14-18 or grades 9-12', 'Open; verify availability', 'Orangeburg', 'SC', '2026-08-08'::date, 'https://www.scsuathletics.com/news/2026/7/17/sc-state-womens-basketball-to-host-elite-camp-on-aug-8.aspx', 'basketball-women', '2026-08-01'::date),
  ('Southeastern University', 'Women''s Basketball Elite Camp', 'NAIA', 'South', null, 'High school prospects; verify grades', 'Open; verify details', 'Lakeland', 'FL', '2026-08-08'::date, 'https://register.ryzer.com/camp.cfm?id=337055&sport=4', 'basketball-women', '2026-08-01'::date),
  ('UC San Diego', 'Elite Camp 3', 'NCAA D1', 'West', 90, 'Grades 9-12', 'Open; verify availability', 'La Jolla', 'CA', '2026-08-08'::date, 'https://www.ucsandiegowomensbasketballcamps.com/', 'basketball-women', '2026-08-01'::date),
  ('Alma College', 'Women''s Basketball Elite Camp', 'NCAA D3', 'Midwest', null, 'High school prospects; verify grades', 'Open; verify price', 'Alma', 'MI', '2026-08-09'::date, 'https://admissions.alma.edu/register/?id=8411450c-492e-4afe-90be-04562e375ecc', 'basketball-women', '2026-08-01'::date)
on conflict do nothing;

-- Verify: select count(*) from camps where sport='basketball-women';  -- expect 18
