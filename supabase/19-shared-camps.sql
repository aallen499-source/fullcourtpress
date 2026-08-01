-- Full Court Press — move camps into the shared `camps` table
--
-- The `camps` table has existed since 01-schema.sql, described there as
-- "the moat: keep verified_at current and show it in the UI" — but nothing
-- ever read or wrote it. Camps actually lived in lib/camps-data.js and were
-- copied into every athlete's private user_camps on first load.
--
-- That meant: new camps only reached brand-new signups (existing accounts
-- were seeded once and never again), fixing a wrong date or dead
-- registration link required a code deploy, and 65 near-identical rows were
-- duplicated per user forever.
--
-- This loads those 65 into the shared table so the catalog is one row per
-- camp, editable from SQL, and instantly visible to everyone. user_camps
-- keeps its original job: what an individual athlete is actually tracking.

alter table camps add column if not exists type text;

-- Makes this migration safe to re-run and blocks accidental duplicates when
-- adding camps by hand later.
create unique index if not exists camps_school_name_date_idx
  on camps (school, camp_name, date);

insert into camps
  (school, camp_name, division, region, cost, eligibility, registration_status,
   city, state, date, type, source_url, sport, verified_at)
values
  ('Weatherford College', 'Elite Camp', 'NJCAA', 'South Central', 80, '11th-12th', 'Open', 'Weatherford', 'TX', '2026-08-01'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=338596&sport=4', 'basketball', '2026-08-01'::date),
  ('Morehouse College', 'Elite Camp II', 'NCAA D2', 'Southeast', 70, 'Ages 13-19', 'Full', 'Atlanta', 'GA', '2026-08-01'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=328000', 'basketball', '2026-08-01'::date),
  ('Goshen College', 'Men''s Basketball Prospect Camp', 'NAIA', 'Midwest', 60, 'Rising 9th-12th', 'Open', 'Goshen', 'IN', '2026-08-01'::date, 'College Team Camp', 'https://www.goshen.edu/summer-camps/mens-basketball-prospect-camp/', 'basketball', '2026-08-01'::date),
  ('Washington and Lee University', 'Generals Basketball Prospect Camp', 'NCAA D3', 'Mid-Atlantic', 195, '9th-12th', 'Open', 'Lexington', 'VA', '2026-08-01'::date, 'College Team Camp', 'https://www.fieldlevel.com/app/events/13978', 'basketball', '2026-08-01'::date),
  ('St. Bonaventure University', '2026 Elite Camp', 'NCAA D1', 'Northeast', 90, '9th-12th', 'Open', 'St. Bonaventure', 'NY', '2026-08-01'::date, 'College Team Camp', 'https://www.ncsasports.org/mens-basketball/camps', 'basketball', '2026-08-01'::date),
  ('Loras College', 'Men''s Basketball Elite Camp', 'NCAA D3', 'Midwest', 106, '10th-12th', 'Open', 'Dubuque', 'IA', '2026-07-31'::date, 'College Team Camp', 'https://www.ncsasports.org/mens-basketball/camps', 'basketball', '2026-08-01'::date),
  ('Howard University', 'August Elite Camp', 'NCAA D1', 'Mid-Atlantic', 315.5, 'Ages 14-19', 'Open', 'Washington', 'DC', '2026-08-02'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=319436&sport=4', 'basketball', '2026-08-01'::date),
  ('Valdosta State University', 'Elite Camp I', 'NCAA D2', 'Southeast', 100, '9th-12th', 'Open', 'Valdosta', 'GA', '2026-08-02'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=334145', 'basketball', '2026-08-01'::date),
  ('Colby College', 'Elite Camp II', 'NCAA D3', 'Northeast', 184, '9th-12th', 'Waitlist', 'Waterville', 'ME', '2026-08-02'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=321111', 'basketball', '2026-08-01'::date),
  ('Washington and Lee University', 'Generals Basketball Prospect Camp 2', 'NCAA D3', 'Mid-Atlantic', 195, '9th-12th', 'Open', 'Lexington', 'VA', '2026-08-02'::date, 'College Team Camp', 'https://www.fieldlevel.com/app/events/13978', 'basketball', '2026-08-01'::date),
  ('Menlo College', 'Men''s Basketball Prospect Camp - Day 1', 'NCAA D2', 'West', null, 'Class of 2027-2028', 'Open', 'Atherton', 'CA', '2026-08-06'::date, 'College Team Camp', 'https://menlomensbasketball.totalcamps.com/', 'basketball', '2026-08-01'::date),
  ('Menlo College', 'Men''s Basketball Prospect Camp - Day 2', 'NCAA D2', 'West', null, 'Class of 2027-2028', 'Open', 'Atherton', 'CA', '2026-08-07'::date, 'College Team Camp', 'https://menlomensbasketball.totalcamps.com/', 'basketball', '2026-08-01'::date),
  ('UT Tyler', 'Prospect Basketball Summer Camp #2', 'NCAA D2', 'South Central', null, 'High school prospects', 'Open', 'Tyler', 'TX', '2026-08-07'::date, 'College Team Camp', 'https://www.fieldlevel.com/app/events/14004', 'basketball', '2026-08-01'::date),
  ('Rivier University', 'Summer Prospect Day 1', 'NCAA D3', 'Northeast', null, 'High school prospects', 'Open', 'Nashua', 'NH', '2026-08-07'::date, 'College Team Camp', 'https://www.fieldlevel.com/app/events/12634', 'basketball', '2026-08-01'::date),
  ('Whitman College', 'Men''s Basketball Prospect Camp', 'NCAA D3', 'West', 65, 'Entering 9th-12th', 'Open', 'Walla Walla', 'WA', '2026-08-08'::date, 'College Team Camp', 'https://www.fieldlevel.com/app/events/13061', 'basketball', '2026-08-01'::date),
  ('Bob Hoffman Basketball / University-hosted', 'Elite Camp Session 1', 'College Staff Camp', 'National', 100, 'Ages 14+', 'Open', null, null, '2026-08-08'::date, 'College Team Camp', 'https://www.bobhoffmanhoops.com/content/2026-camp-dates-pricing/2026-elite-camp', 'basketball', '2026-08-01'::date),
  ('Outwork Basketball Showcase', 'Daytona Beach Showcase', 'JUCO Showcase', 'Southeast', null, 'High school prospects', 'Open', 'Daytona Beach', 'FL', '2026-08-09'::date, 'Open Exposure / Showcase', 'https://www.fieldlevel.com/app/events/13613', 'basketball', '2026-08-01'::date),
  ('University of Redlands', 'High School Elite Camp', 'NCAA D3', 'West', 99, 'Ages 14-18 / 9th-12th', 'Open', 'Redlands', 'CA', '2026-08-15'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=339543&sport=4', 'basketball', '2026-08-01'::date),
  ('Salve Regina University', 'Men''s Basketball Prospect Clinic', 'NCAA D3', 'Northeast', null, 'High school prospects', 'Open', 'Newport', 'RI', '2026-08-15'::date, 'College Team Camp', 'https://www.fieldlevel.com/app/events/12200', 'basketball', '2026-08-01'::date),
  ('Cornell College', 'Elite Camp 2026', 'NCAA D3', 'Midwest', 59, '9th-12th', 'Open', 'Mount Vernon', 'IA', '2026-08-16'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=333745', 'basketball', '2026-08-01'::date),
  ('Piedmont University', 'Men''s Basketball Prospect Camp', 'NCAA D3', 'Southeast', null, 'Boys 9th-12th', 'Open', 'Demorest', 'GA', '2026-08-22'::date, 'College Team Camp', 'https://www.piedmontbasketballcamps.com/mens-basketball-prospect-camp.cfm', 'basketball', '2026-08-01'::date),
  ('UIndy', 'Men''s Basketball Elite Camp - Aug 22', 'NCAA D2', 'Midwest', null, '9th-12th', 'Open', 'Indianapolis', 'IN', '2026-08-22'::date, 'College Team Camp', 'https://www.scottheadyuindybasketballcamps.com/', 'basketball', '2026-08-01'::date),
  ('Air Force Academy', 'Boys Basketball Elite Camp', 'NCAA D1', 'Mountain', 80, 'High school prospects', 'Open', 'Colorado Springs', 'CO', '2026-08-22'::date, 'College Team Camp', 'https://goairforcefalcons.com/sports/2018/6/21/camps-boys-basketball-elite-html', 'basketball', '2026-08-01'::date),
  ('UCLA', 'Elite Camp', 'NCAA D1', 'West', 164, '9th-12th', 'Open', 'Los Angeles', 'CA', '2026-08-22'::date, 'College Team Camp', 'https://mensbasketball.bruincamps.com/elite-camp.cfm', 'basketball', '2026-08-01'::date),
  ('Jacksonville University', 'Prospect Camp - Aug 23', 'NCAA D1', 'Southeast', 180, '7th-12th', 'Open', 'Jacksonville', 'FL', '2026-08-23'::date, 'College Team Camp', 'https://www.jordanmincybasketballcamps.com/', 'basketball', '2026-08-01'::date),
  ('Jacksonville University', 'Prospect Camp - Aug 29', 'NCAA D1', 'Southeast', 180, '7th-12th', 'Open', 'Jacksonville', 'FL', '2026-08-29'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=331889&sport=4', 'basketball', '2026-08-01'::date),
  ('Bucknell University', 'John Griffin Elite Basketball Camp', 'NCAA D1', 'Mid-Atlantic', null, 'High school prospects', 'Open', 'Lewisburg', 'PA', '2026-08-29'::date, 'College Team Camp', 'https://www.fieldlevel.com/app/events/11866', 'basketball', '2026-08-01'::date),
  ('Young Harris College', 'Elite Camp - Aug 29', 'NCAA D2', 'Southeast', 125, '9th-recent graduates', 'Open', 'Young Harris', 'GA', '2026-08-29'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=338493&sport=4', 'basketball', '2026-08-01'::date),
  ('UC Riverside', 'Gus Argenal Elite Camp', 'NCAA D1', 'West', 100, '9th-12th', 'Open', 'Riverside', 'CA', '2026-08-29'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=332643', 'basketball', '2026-08-01'::date),
  ('Pomona-Pitzer', 'Elite Camp', 'NCAA D3', 'West', null, '2027-2028 graduates', 'Open', 'Claremont', 'CA', '2026-09-05'::date, 'College Team Camp', 'https://sagehens.com/sports/2023/8/10/mens-basketball-camps.aspx', 'basketball', '2026-08-01'::date),
  ('Messiah University', 'Men''s Basketball Elite Camp', 'NCAA D3', 'Mid-Atlantic', 100, '9th-12th', 'Open', 'Mechanicsburg', 'PA', '2026-09-05'::date, 'College Team Camp', 'https://leagues.bluesombrero.com/Default.aspx?tabid=2204446', 'basketball', '2026-08-01'::date),
  ('Ohio Northern University', 'Men''s Basketball Elite Camp', 'NCAA D3', 'Midwest', 80, 'Juniors and seniors; younger by request', 'Open', 'Ada', 'OH', '2026-09-05'::date, 'College Team Camp', 'https://payment.onu.edu/C21185_ustores/web/store_main.jsp?STOREID=211', 'basketball', '2026-08-01'::date),
  ('Young Harris College', 'Elite Camp - Sep 5', 'NCAA D2', 'Southeast', 125, '9th-recent graduates', 'Open', 'Young Harris', 'GA', '2026-09-05'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=338494&sport=4', 'basketball', '2026-08-01'::date),
  ('LeTourneau University', 'LETU Basketball Elite Camp', 'NCAA D3', 'South Central', null, 'High school prospects', 'Open', 'Longview', 'TX', '2026-09-05'::date, 'College Team Camp', 'https://www.fieldlevel.com/app/events/14067', 'basketball', '2026-08-01'::date),
  ('St. Mary''s College of Maryland', '2026 St. Mary''s Elite Camp', 'NCAA D3', 'Mid-Atlantic', 130, 'Ages 15-18', 'Open', 'St. Mary''s City', 'MD', '2026-09-06'::date, 'College Team Camp', 'https://www.fieldlevel.com/app/events/13553', 'basketball', '2026-08-01'::date),
  ('Claremont-Mudd-Scripps', 'Stags Elite Prospect Camp - Day 1', 'NCAA D3', 'West', null, 'High school prospects', 'Open', 'Claremont', 'CA', '2026-09-12'::date, 'College Team Camp', 'https://www.fieldlevel.com/app/events/12849', 'basketball', '2026-08-01'::date),
  ('UIndy', 'Men''s Basketball Elite Camp - Sep 12', 'NCAA D2', 'Midwest', null, '9th-12th', 'Open', 'Indianapolis', 'IN', '2026-09-12'::date, 'College Team Camp', 'https://www.scottheadyuindybasketballcamps.com/', 'basketball', '2026-08-01'::date),
  ('Claremont-Mudd-Scripps', 'Stags Elite Prospect Camp - Day 2', 'NCAA D3', 'West', null, 'High school prospects', 'Open', 'Claremont', 'CA', '2026-09-13'::date, 'College Team Camp', 'https://www.fieldlevel.com/app/events/12849', 'basketball', '2026-08-01'::date),
  ('Saint Mary-of-the-Woods College', 'Elite Camp - Session I', 'NAIA', 'Midwest', 80, 'Ages 14-18 / 9th-12th', 'Open', 'Saint Mary-of-the-Woods', 'IN', '2026-09-13'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=334884', 'basketball', '2026-08-01'::date),
  ('Saint Mary-of-the-Woods College', 'Elite Camp - Session II', 'NAIA', 'Midwest', 80, 'Ages 14-18 / 9th-12th', 'Open', 'Saint Mary-of-the-Woods', 'IN', '2026-09-13'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=334884', 'basketball', '2026-08-01'::date),
  ('Colorado Christian University', 'Elite Camp - Session 1', 'NCAA D2', 'Mountain', 100, '9th-12th', 'Open', 'Lakewood', 'CO', '2026-09-13'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=331326', 'basketball', '2026-08-01'::date),
  ('Colorado Christian University', 'Elite Camp - Session 2', 'NCAA D2', 'Mountain', 100, '9th-12th', 'Open', 'Lakewood', 'CO', '2026-09-13'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=331326', 'basketball', '2026-08-01'::date),
  ('DePauw University', 'Men''s Basketball Elite Camp', 'NCAA D3', 'Midwest', 105, '10th-12th', 'Open', 'Greencastle', 'IN', '2026-09-13'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=339378&sport=4', 'basketball', '2026-08-01'::date),
  ('University of Hartford', 'Elite Camp', 'NCAA D3', 'Northeast', 105, '9th-12th', 'Open', 'West Hartford', 'CT', '2026-09-13'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=333827', 'basketball', '2026-08-01'::date),
  ('Westmont College', 'Warriors Basketball College Prospect Camp', 'NCAA D2', 'West', null, 'High school prospects', 'Open', 'Santa Barbara', 'CA', '2026-09-19'::date, 'College Team Camp', 'https://www.fieldlevel.com/app/events/11280', 'basketball', '2026-08-01'::date),
  ('Taylor University', 'Boys Basketball Elite Camp', 'NAIA', 'Midwest', null, 'High school prospects', 'Open', 'Upland', 'IN', '2026-09-19'::date, 'College Team Camp', 'https://x.com/taylor_hoops/status/2079210020227424618', 'basketball', '2026-08-01'::date),
  ('Coe College', 'Elite Camp', 'NCAA D3', 'Midwest', 90, '9th-12th', 'Open', 'Cedar Rapids', 'IA', '2026-09-20'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=336598&sport=4', 'basketball', '2026-08-01'::date),
  ('University of Montevallo', 'High School Elite Camp', 'NCAA D2', 'Southeast', 133, '9th-12th', 'Open', 'Montevallo', 'AL', '2026-09-20'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=337166', 'basketball', '2026-08-01'::date),
  ('Belhaven University', 'Elite Camp - Session 1', 'NCAA D3', 'Southeast', 60, '10th-12th', 'Waitlist', 'Jackson', 'MS', '2026-09-26'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=335601&sport=4', 'basketball', '2026-08-01'::date),
  ('Cedarville University', 'Elite Camp 4', 'NCAA D2', 'Midwest', 87, '9th-12th', 'Open', 'Cedarville', 'OH', '2026-09-26'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=332868', 'basketball', '2026-08-01'::date),
  ('UCLA', 'Elite Camp', 'NCAA D1', 'West', 164, '9th-12th', 'Open', 'Los Angeles', 'CA', '2026-09-26'::date, 'College Team Camp', 'https://mensbasketball.bruincamps.com/elite-camp.cfm', 'basketball', '2026-08-01'::date),
  ('Huntington University', 'Men''s Basketball Elite Camp', 'NAIA', 'Midwest', null, '9th-12th', 'Open', 'Huntington', 'IN', '2026-09-26'::date, 'College Team Camp', 'https://www.huathletics.com/camps', 'basketball', '2026-08-01'::date),
  ('Valdosta State University', 'Elite Camp II', 'NCAA D2', 'Southeast', 100, '9th-12th', 'Open', 'Valdosta', 'GA', '2026-09-27'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=334146', 'basketball', '2026-08-01'::date),
  ('Pomona-Pitzer', 'Men''s Basketball Elite Camp', 'NCAA D3', 'West', 210, 'High school prospects', 'Open', 'Claremont', 'CA', '2026-09-05'::date, 'College Team Camp', 'https://sagehens.com/sports/2023/8/10/mens-basketball-camps.aspx', 'basketball', '2026-08-01'::date),
  ('University of Redlands', 'High School Elite Camp', 'NCAA D3', 'West', 99, 'Grades 9-12', 'Open', 'Redlands', 'CA', '2026-08-15'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=339543&sport=4', 'basketball', '2026-08-01'::date),
  ('Cornell College', 'Men''s Basketball Elite Camp', 'NCAA D3', 'Midwest', 59, 'Grades 9-12', 'Open', 'Mount Vernon', 'IA', '2026-08-16'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=333745', 'basketball', '2026-08-01'::date),
  ('Ball State University', 'Men''s Basketball Elite Camp', 'NCAA D1', 'Midwest', 106, 'Entering grades 9-12', 'Open', 'Muncie', 'IN', '2026-08-22'::date, 'College Team Camp', 'https://ballstatemensbasketballcamps.totalcamps.com/shop', 'basketball', '2026-08-01'::date),
  ('Capital University', 'Men''s Basketball Elite Camp', 'NCAA D3', 'Midwest', null, 'High school prospects', 'Open', 'Columbus', 'OH', '2026-08-29'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=339228&sport=4', 'basketball', '2026-08-01'::date),
  ('Young Harris College', 'Elite Camp', 'NCAA D2', 'Southeast', 125, 'Grades 9-college freshman', 'Open', 'Young Harris', 'GA', '2026-08-29'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=338493&sport=4', 'basketball', '2026-08-01'::date),
  ('MSU Denver', 'Elite Camp', 'NCAA D2', 'Mountain', 121.5, 'Grades 9-12', 'Open', 'Denver', 'CO', '2026-08-29'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=338892', 'basketball', '2026-08-01'::date),
  ('University of Charleston', 'Charleston Elite Camp', 'NCAA D2', 'Mid-Atlantic', 85, 'High school athletes', 'Open', 'Charleston', 'WV', '2026-09-13'::date, 'College Team Camp', 'https://charlestonmensbasketballcamps.totalcamps.com/shop', 'basketball', '2026-08-01'::date),
  ('New York University', 'NY Elite Camp', 'NCAA D3', 'Northeast', null, 'Boys grades 9-12', 'Open', 'New York', 'NY', '2026-09-26'::date, 'College Team Camp', 'https://nyumensbasketballcamps.totalcamps.com/Content/82510', 'basketball', '2026-08-01'::date),
  ('College Basketball Prospect ID', 'Men''s Basketball Camp - Surprise', 'Exposure', 'West', null, 'High school prospects', 'Open', 'Surprise', 'AZ', '2026-09-19'::date, 'College Team Camp', 'https://men.collegebasketballprospectid.com/register.cfm', 'basketball', '2026-08-01'::date),
  ('College Basketball Prospect ID', 'Men''s Basketball Camp - Atlanta', 'Exposure', 'Southeast', null, 'High school prospects', 'Open', 'Atlanta', 'GA', '2026-09-20'::date, 'College Team Camp', 'https://men.collegebasketballprospectid.com/register.cfm', 'basketball', '2026-08-01'::date),
  ('College Basketball Prospect ID', 'Men''s Basketball Camp - Lakeland', 'Exposure', 'Southeast', null, 'High school prospects', 'Open', 'Lakeland', 'FL', '2026-09-26'::date, 'College Team Camp', 'https://men.collegebasketballprospectid.com/register.cfm', 'basketball', '2026-08-01'::date)
on conflict do nothing;

-- ============================================================
-- ADDING MORE CAMPS LATER
-- ============================================================
-- insert into camps (school, camp_name, division, region, cost, eligibility,
--   registration_status, city, state, date, type, source_url, sport, verified_at)
-- values ('Some College', 'Elite Camp', 'NCAA D2', 'Midwest', 75,
--   '9th-12th', 'Open', 'Springfield', 'IL', '2026-11-14'::date,
--   'College Team Camp', 'https://...', 'basketball', current_date)
-- on conflict do nothing;
--
-- To retire a camp that has passed or filled:
--   update camps set registration_status = 'Closed' where id = '...';
--
-- ============================================================
-- VERIFY
-- ============================================================
-- select count(*) from camps;            -- expect 64, not 65 (see below)
--
-- The source data had 65 entries but only 64 distinct camps: University of
-- Redlands "High School Elite Camp" on 2026-08-15 was listed twice — same
-- date, cost, city, and even the same registration URL (id=339543), differing
-- only in eligibility wording ("Ages 14-18 / 9th-12th" vs "Grades 9-12").
-- Every athlete had been seeing it twice. camps_school_name_date_idx collapses
-- it and prevents a repeat.
-- select count(*) from camps where date >= current_date;
