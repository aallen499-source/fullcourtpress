-- RecruitGrid — 21 new college camps (23 rows), Sept-Dec 2026
--
-- Source: a verified list compiled on 2026-09-06 against the criteria stated on
-- it — a college program or staff, with an official school source or a
-- college-linked registration. Third-party showcases and pay-to-play exposure
-- events excluded. verified_at reflects that compilation.
--
-- Divisions come from the EADA extract in lib/college-sports-data.js, not from
-- the camp pages, on the same principle as 30-two-basketball-camps.sql. Every
-- school resolved there except Indiana University Columbus, whose division is
-- left null rather than guessed.
--
-- Two camps run on more than one date and are stored as one row each, matching
-- how multi-day camps are already held: IU Columbus (Sept 12 and 20) and North
-- Florida beach volleyball (Sept 26 and 27).
--
-- KNOWN GAPS, deliberately left rather than invented:
--   * city is null on all but Maryland. The source list gives state only, and
--     260 of the 261 existing rows carry a city — so these will read thinner on
--     the camp cards until someone fills them in.
--   * Seven registration links point at a shop, a platform root or an athletics
--     home page rather than the camp itself: Indiana Wesleyan (x2), San Diego
--     State, Charlotte, Western Illinois, MSOE and Saint Mary's. They resolve,
--     but a parent lands somewhere they still have to search. Worth replacing
--     with deep links when they exist.
--   * "Charlotte" is ambiguous in the EADA extract — UNC Charlotte and Queens
--     University of Charlotte are both D1 in NC, so the division is safe either
--     way, but the school name should be confirmed and made specific.
--   * Two dates fall on a Monday: Indiana Wesleyan's Spotlight Day (Oct 19) and
--     Maryland (Oct 12, Columbus Day). Every other camp here is a weekend. A
--     weekday date is the usual sign of a page copied from last year, so both
--     are worth checking against the source before anyone travels.
--
-- Safe to re-run — the conflict target makes it a no-op.

insert into camps
  (school, camp_name, division, region, cost, eligibility, registration_status,
   city, state, date, type, source_url, sport, verified_at)
values
  ('Indiana University Columbus', 'Men''s Basketball Prospect Camp', null, 'Midwest', null, 'Boys, grades 10-12', 'Open',
   null, 'IN', '2026-09-12'::date, 'College Team Camp',
   'https://iuccrimsonpride.com/news/2026/7/27/general-iu-columbus-mens-basketball-announces-prospect-camp-dates.aspx', 'basketball-men', '2026-09-06'::date),
  ('Indiana University Columbus', 'Men''s Basketball Prospect Camp', null, 'Midwest', null, 'Boys, grades 10-12', 'Open',
   null, 'IN', '2026-09-20'::date, 'College Team Camp',
   'https://iuccrimsonpride.com/news/2026/7/27/general-iu-columbus-mens-basketball-announces-prospect-camp-dates.aspx', 'basketball-men', '2026-09-06'::date),
  ('University of Virginia''s College at Wise', 'Women''s Basketball Prospect Camp', 'NCAA D2', 'Mid-Atlantic', 85, 'Girls, grade 8 through senior', 'Open',
   null, 'VA', '2026-09-20'::date, 'College Team Camp',
   'https://uvawisecavs.com/news/2026/6/3/womens-basketball-announces-2026-prospect-camp-dates.aspx', 'basketball-women', '2026-09-06'::date),
  ('Covenant College', 'Softball Fall Prospect Camp', 'NCAA D3', 'Southeast', 95, 'Classes of 2027-2030', 'Open',
   null, 'GA', '2026-09-19'::date, 'College Team Camp',
   'https://athletics.covenant.edu/news/2026/6/30/softball-announces-fall-prospect-camp-on-september-19.aspx', 'softball-women', '2026-09-06'::date),
  ('Indiana Wesleyan University', 'Softball Spotlight Day', 'NAIA', 'Midwest', null, 'High school athletes', 'Open',
   null, 'IN', '2026-10-19'::date, 'College Team Camp',
   'https://www.indwessoftball.com/register.cfm', 'softball-women', '2026-09-06'::date),
  ('Indiana Wesleyan University', 'Softball High School Prospect Camp', 'NAIA', 'Midwest', null, 'High school athletes', 'Open',
   null, 'IN', '2026-11-21'::date, 'College Team Camp',
   'https://www.indwessoftball.com/register.cfm', 'softball-women', '2026-09-06'::date),
  ('Covenant College', 'Men''s & Women''s Tennis Prospect Camp', 'NCAA D3', 'Southeast', 75, 'Juniors, seniors and transfers', 'Open',
   null, 'GA', '2026-10-10'::date, 'College Team Camp',
   'https://online.covenant.edu/register/tennisprospect', 'tennis-coed', '2026-09-06'::date),
  ('San Diego State University', 'Baseball Prospect Camp', 'NCAA D1', 'West', null, null, 'Open',
   null, 'CA', '2026-10-25'::date, 'College Team Camp',
   'https://www.aztecbaseballcamps.com/shop', 'baseball-men', '2026-09-06'::date),
  ('University of California-Berkeley', 'Baseball Prospect Camp', 'NCAA D1', 'West', null, 'Classes of 2027-2029', 'Open',
   null, 'CA', '2026-09-26'::date, 'College Team Camp',
   'https://www.calsportscamps.com/baseball/camps/baseball-camps', 'baseball-men', '2026-09-06'::date),
  ('University of Maryland-College Park', 'Baseball Prospect Camp', 'NCAA D1', 'Mid-Atlantic', null, null, 'Open',
   'College Park', 'MD', '2026-10-12'::date, 'College Team Camp',
   'https://www.playnsports.com/organization/maryland-baseball/', 'baseball-men', '2026-09-06'::date),
  ('Roanoke College', 'Baseball Fall Prospect Camp', 'NCAA D3', 'Mid-Atlantic', null, null, 'Open',
   null, 'VA', '2026-10-03'::date, 'College Team Camp',
   'https://www.roanoke.edu/events/roanoke_college_baseball_prospect_camp', 'baseball-men', '2026-09-06'::date),
  ('Bard College', 'Baseball Prospect Camp', 'NCAA D3', 'Northeast', null, 'Grades 9-12', 'Open',
   null, 'NY', '2026-09-27'::date, 'College Team Camp',
   'https://www.bardathleticsregistration.com/baseball-prospect-camp.cfm', 'baseball-men', '2026-09-06'::date),
  ('Charlotte', 'Baseball November Prospect Camp', 'NCAA D1', 'Southeast', null, null, 'Open',
   null, 'NC', '2026-11-01'::date, 'College Team Camp',
   'https://charlottebaseball.totalcamps.com/shop', 'baseball-men', '2026-09-06'::date),
  ('Western Illinois University', 'Baseball Prospect Camp', 'NCAA D1', 'Midwest', null, 'Grades 9-12', 'Open',
   null, 'IL', '2026-11-07'::date, 'College Team Camp',
   'https://www.leatherneckbaseballcamps.com/', 'baseball-men', '2026-09-06'::date),
  ('Dordt University', 'Baseball Winter Prospect Camp', 'NAIA', 'Midwest', null, null, 'Open',
   null, 'IA', '2026-12-05'::date, 'College Team Camp',
   'https://www.dordt.edu/athletics/sports-camps-and-clinics/baseball-camps', 'baseball-men', '2026-09-06'::date),
  ('Guilford College', 'Baseball Prospect Camp', 'NCAA D3', 'Southeast', null, 'Grades 9-12', 'Open',
   null, 'NC', '2026-09-19'::date, 'College Team Camp',
   'https://www.guilfordbaseballcamps.com/guilford-college-prospect-camp.cfm', 'baseball-men', '2026-09-06'::date),
  ('University of North Florida', 'Beach Volleyball Fall Prospect Camp', 'NCAA D1', 'Southeast', null, 'Ages 14-18', 'Open',
   null, 'FL', '2026-09-26'::date, 'College Team Camp',
   'https://www.delaneyrosebeachcamps.com/fall-prospect-camp.cfm', 'volleyball-women', '2026-09-06'::date),
  ('University of North Florida', 'Beach Volleyball Fall Prospect Camp', 'NCAA D1', 'Southeast', null, 'Ages 14-18', 'Open',
   null, 'FL', '2026-09-27'::date, 'College Team Camp',
   'https://www.delaneyrosebeachcamps.com/fall-prospect-camp.cfm', 'volleyball-women', '2026-09-06'::date),
  ('Dominican University', 'Men''s Volleyball Prospect Camp', 'NCAA D3', 'Midwest', 40, 'Boys, grades 11-12', 'Open',
   null, 'IL', '2026-09-27'::date, 'College Team Camp',
   'https://dustars.com/sports/2026/7/28/dominican-mens-volleyball-high-school-prospect-camp.aspx', 'volleyball-men', '2026-09-06'::date),
  ('Milwaukee School of Engineering', 'Men''s Volleyball Prospect Camp', 'NCAA D3', 'Midwest', 50, null, 'Open',
   null, 'WI', '2026-10-10'::date, 'College Team Camp',
   'https://msoeraiders.com/', 'volleyball-men', '2026-09-06'::date),
  ('Saint Mary''s College of California', 'Beach Volleyball Prospect Camp', 'NCAA D1', 'West', null, 'Ages 13-22+', 'Open',
   null, 'CA', '2026-10-10'::date, 'College Team Camp',
   'https://register.ryzer.com/', 'volleyball-women', '2026-09-06'::date),
  ('Trine University', 'Women''s Volleyball Prospect Camp', 'NCAA D3', 'Midwest', 90, 'Girls, grades 9-12', 'Open',
   null, 'IN', '2026-11-22'::date, 'College Team Camp',
   'https://trinethunder.com/sports/2026/4/17/trine-university-athletics-camps-and-clinics.aspx', 'volleyball-women', '2026-09-06'::date),
  ('Whitman College', 'Volleyball Prospect Camp', 'NCAA D3', 'West', null, null, 'Open',
   null, 'WA', '2026-12-06'::date, 'College Team Camp',
   'https://whitmanblues.com/sports/2026/7/19/whitman-college-volleyball-camps.aspx', 'volleyball-women', '2026-09-06'::date)
on conflict (school, camp_name, date) do nothing;

-- ============================================================
-- VERIFY
-- ============================================================
--   select sport, count(*) from camps where verified_at = '2026-09-06' group by sport order by sport;
--   -- expect basketball-men 2, basketball-women 1, baseball-men 9,
--   --        softball-women 3, tennis-coed 1, volleyball-men 2, volleyball-women 5
