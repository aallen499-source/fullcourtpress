-- RecruitGrid — 2026 fall camps for baseball, volleyball, tennis and track
--
-- The first non-basketball camps in the catalog. Sport values follow the
-- '<sport>-<gender>' convention set by basketball-men/-women in 24a/25.
--
-- cost is a single numeric column, so tiered pricing ("$100 pitcher;
-- $120 position") is flattened to the LOWEST listed price — source_url
-- carries the real breakdown.
--
-- One camp from the source sheet is deliberately absent: University of
-- Cincinnati's 2026-27 winter clinics have no published dates, and `date`
-- feeds the catalog's sort order.
--
-- Safe to re-run — camps_school_name_date_idx makes the conflict a no-op.

insert into camps
  (school, camp_name, division, region, cost, eligibility, registration_status,
   city, state, date, type, source_url, sport, verified_at)
values
  ('Mt. Hood Community College', 'Volleyball Camp', 'NWAC / Community College', 'West', 125, 'Future Saints / prospect-age athletes; verify session', 'Open', 'Gresham', 'OR', '2026-08-05'::date, 'College Team Camp', 'https://www.mhcc.edu/athletics/volleyball-prospect-camp', 'volleyball-women', '2026-08-04'::date),
  ('Texas A&M International University', 'August Baseball Camp', 'NCAA D2', 'South Central', 100, 'Ages 15-25', 'Open', 'Laredo', 'TX', '2026-08-08'::date, 'College Team Camp', 'https://www.tamiu.edu/ce/camps-and-programs.shtml', 'baseball-men', '2026-08-04'::date),
  ('Arcadia University', 'Boys'' Volleyball Prospect Camp', 'NCAA D3', 'Mid-Atlantic', 175, 'High school age and older', 'Open', 'Glenside', 'PA', '2026-08-08'::date, 'College Team Camp', 'https://www.eventbrite.com/e/arcadia-university-boys-volleyball-prospect-camp-tickets-1987938900766', 'volleyball-men', '2026-08-04'::date),
  ('Thiel College', 'Men''s Volleyball Skills Camp', 'NCAA D3', 'Mid-Atlantic', null, 'Entering grades 9-12', 'Open', 'Greenville', 'PA', '2026-08-08'::date, 'College Team Camp', 'https://www.thiel.edu/newsroom/press-releases/detail/thiel-college-hosts-youth-sports-camps-prospect-clinics', 'volleyball-men', '2026-08-04'::date),
  ('University of North Florida', 'UNF Beach Prospect Camp', 'NCAA D1', 'Southeast', 249, 'Ages 14-18; grades 8-12', 'Open', 'Jacksonville', 'FL', '2026-08-08'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=337232&sport=54', 'volleyball-women', '2026-08-04'::date),
  ('Thiel College', 'Men''s Volleyball Prospect Camp', 'NCAA D3', 'Mid-Atlantic', null, 'Entering grades 11-12', 'Open', 'Greenville', 'PA', '2026-08-09'::date, 'College Team Camp', 'https://www.thiel.edu/newsroom/press-releases/detail/thiel-college-hosts-youth-sports-camps-prospect-clinics', 'volleyball-men', '2026-08-04'::date),
  ('Hartwick College', 'Women''s Volleyball Prospect Camp', 'NCAA D3', 'Northeast', null, 'Prospective college athletes; verify grade', 'Open', 'Oneonta', 'NY', '2026-08-11'::date, 'College Team Camp', 'https://calendar.hartwick.edu/calendar/ViewCal.html', 'volleyball-women', '2026-08-04'::date),
  ('Dakota State University', 'Baseball High School Prospect Camp', 'NAIA', 'Midwest', 60, 'Classes 2027-2030', 'Open', 'Madison', 'SD', '2026-08-16'::date, 'College Team Camp', 'https://dsu.edu/camps/athletics-camps/baseball-camps/baseball-hs-prospect-camp.html', 'baseball-men', '2026-08-04'::date),
  ('Cairn University', 'Baseball Prospect Camp', 'NCAA D3', 'Mid-Atlantic', null, 'Prospective college baseball players', 'Open', 'Langhorne', 'PA', '2026-08-22'::date, 'College Team Camp', 'https://admissions.cairn.edu/register/?id=5d07c4f8-1011-46d1-88fc-5ddcc20a9b72', 'baseball-men', '2026-08-04'::date),
  ('Covenant College', 'Baseball Prospect Camp #1', 'NCAA D3', 'Southeast', 125, 'Classes 2027-2029', 'Open', 'Lookout Mountain', 'GA', '2026-08-29'::date, 'College Team Camp', 'https://online.covenant.edu/register/baseballprospectcampaugust', 'baseball-men', '2026-08-04'::date),
  ('LSU Eunice', 'Baseball Prospect Camp', 'NJCAA', 'Southeast', 100, 'High school players', 'Open', 'Eunice', 'LA', '2026-08-29'::date, 'College Team Camp', 'https://athletics.lsue.edu/sports/2007/10/22/prospect_camps_baseball.aspx', 'baseball-men', '2026-08-04'::date),
  ('Worcester State University', 'Baseball Prospect Camp', 'NCAA D3', 'Northeast', 75, 'Classes 2027-2030', 'Open', 'Worcester', 'MA', '2026-08-29'::date, 'College Team Camp', 'https://wellnesscenterportal.worcester.edu/program/GetProgramDetails?courseId=9f42b601-ec6f-4718-bbf2-57d5b19048df', 'baseball-men', '2026-08-04'::date),
  ('Salem State University', 'Volleyball Prospect ID Camp', 'NCAA D3', 'Northeast', 95, 'Girls, grades 9-12', 'Open', 'Salem', 'MA', '2026-08-29'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=338749&sport=8', 'volleyball-women', '2026-08-04'::date),
  ('University of Notre Dame', 'UTR Sports College Series', 'NCAA D1 host', 'Midwest', 396, 'Junior players; limited to 24', 'Open', 'Notre Dame', 'IN', '2026-09-05'::date, 'Open Exposure / Showcase', 'https://app.utrsports.net/events/383581', 'tennis-coed', '2026-08-04'::date),
  ('Case Western Reserve University', 'Spartan Baseball Prospect Camp', 'NCAA D3', 'Midwest', 150, 'HS prospects and college-eligible student-athletes', 'Open', 'Cleveland', 'OH', '2026-09-06'::date, 'College Team Camp', 'https://athletics.case.edu/news/2026/7/10/2026-spartan-baseball-prospect-camp-sunday-sep-6.aspx', 'baseball-men', '2026-08-04'::date),
  ('Mount Holyoke College', 'Fall Prospect ID Clinic', 'NCAA D3', 'Northeast', 100, 'Girls, grades 9-12', 'Open', 'South Hadley', 'MA', '2026-09-13'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=339871&sport=8', 'volleyball-women', '2026-08-04'::date),
  ('Westmont College', 'Baseball Prospect Camp', 'NCAA D2', 'West', 200, 'Grades 9-12 and JUCO', 'Open', 'Santa Barbara', 'CA', '2026-09-19'::date, 'College Team Camp', 'https://www.westmont.edu/prospect-camps/baseball', 'baseball-men', '2026-08-04'::date),
  ('Alma College', 'Baseball Prospect Camp', 'NCAA D3', 'Midwest', 80, 'High school prospects; verify grade', 'Open', 'Alma', 'MI', '2026-09-20'::date, 'College Team Camp', 'https://admissions.alma.edu/register/?id=5aad1deb-5df0-454e-a540-c47c915596ce', 'baseball-men', '2026-08-04'::date),
  ('Indiana University', 'UTR Sports College Camp', 'NCAA D1 host', 'Midwest', 350, 'UTR 1.0-16.0', 'Closed', 'Bloomington', 'IN', '2026-09-26'::date, 'Open Exposure / Showcase', 'https://app.utrsports.net/events/385042', 'tennis-coed', '2026-08-04'::date),
  ('University of North Florida', 'UNF Beach Fall Prospect Camp', 'NCAA D1', 'Southeast', 249, 'Ages 14-18; grades 8-12', 'Waitlist', 'Jacksonville', 'FL', '2026-09-26'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=339777&sport=54', 'volleyball-women', '2026-08-04'::date),
  ('Roanoke College', 'Fall Baseball Prospect Camp', 'NCAA D3', 'Mid-Atlantic', null, 'Prospective college baseball players', 'Open', 'Salem', 'VA', '2026-10-03'::date, 'College Team Camp', 'https://www.roanoke.edu/events/roanoke_college_baseball_prospect_camp', 'baseball-men', '2026-08-04'::date),
  ('LSU Eunice', 'Baseball Prospect Camp', 'NJCAA', 'Southeast', 100, 'High school players', 'Open', 'Eunice', 'LA', '2026-10-10'::date, 'College Team Camp', 'https://athletics.lsue.edu/sports/2007/10/22/prospect_camps_baseball.aspx', 'baseball-men', '2026-08-04'::date),
  ('Methodist University', 'UTR Sports College Camp', 'NCAA D3 host', 'Southeast', null, 'Junior college prospects; verify age/UTR', 'Open', 'Fayetteville', 'NC', '2026-10-10'::date, 'Open Exposure / Showcase', 'https://www.utrsports.net/pages/college-camps', 'tennis-coed', '2026-08-04'::date),
  ('Covenant College', 'Baseball Prospect Camp #2', 'NCAA D3', 'Southeast', 125, 'Classes 2027-2029', 'Open', 'Lookout Mountain', 'GA', '2026-10-17'::date, 'College Team Camp', 'https://online.covenant.edu/register/baseballprospectcampoctober', 'baseball-men', '2026-08-04'::date),
  ('Westmont College', 'Baseball Prospect Camp', 'NCAA D2', 'West', 200, 'Grades 9-12 and JUCO', 'Open', 'Santa Barbara', 'CA', '2026-10-24'::date, 'College Team Camp', 'https://www.westmont.edu/prospect-camps/baseball', 'baseball-men', '2026-08-04'::date),
  ('Liberty University', 'UTR Sports College Camp', 'NCAA D1 host', 'Mid-Atlantic', 300, 'Junior college prospects; verify age/UTR', 'Open', 'Lynchburg', 'VA', '2026-10-24'::date, 'Open Exposure / Showcase', 'https://app.utrsports.net/events/358664', 'tennis-coed', '2026-08-04'::date),
  ('Rome Tennis Center at Berry College', '2nd Annual UTR College Tennis Showcase', 'Multi-college showcase', 'Southeast', null, 'Aspiring college tennis players', 'Open', 'Rome', 'GA', '2026-10-30'::date, 'Open Exposure / Showcase', 'https://www.utrsports.net/pages/college-showcases', 'tennis-coed', '2026-08-04'::date),
  ('Westmont College', 'Baseball Prospect Camp', 'NCAA D2', 'West', 200, 'Grades 9-12 and JUCO', 'Open', 'Santa Barbara', 'CA', '2026-11-14'::date, 'College Team Camp', 'https://www.westmont.edu/prospect-camps/baseball', 'baseball-men', '2026-08-04'::date),
  ('Winthrop University', 'Winter Clinic', 'NCAA D1', 'Southeast', 150, 'Ages 13-17', 'Open', 'Rock Hill', 'SC', '2026-12-06'::date, 'College Team Camp', 'https://www.fieldlevel.com/app/events/14202', 'track-women', '2026-08-04'::date)
on conflict (school, camp_name, date) do nothing;

-- ============================================================
-- VERIFY — expect basketball-men/-women plus the new sports
-- ============================================================
--   select sport, count(*) from camps group by sport order by sport;
