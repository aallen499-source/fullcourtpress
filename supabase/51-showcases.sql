-- 51-showcases.sql
--
-- Showcases get their own place in the catalogue, and the first 30 go in.
--
-- A showcase is a camp run by an events company rather than one college, with
-- several programs sending a coach. They were left out of camp collection for a
-- while; the rule that replaces that is in lib/showcases.js: a showcase is shown
-- only when its own page names the programs attending, and those names live in
-- the new attending_programs column. A showcase row without them stays in the
-- table and is simply not shown until they are filled in.
--
-- RUN THIS BEFORE THE CODE DEPLOYS. The app and the public camp pages now read
-- attending_programs, and a select on a column that does not exist fails the
-- whole query.
--
-- The 30 rows are College Basketball Prospect ID's autumn men's schedule,
-- 19 September to 4 October 2026, each read off its own event page on
-- 2026-09-14. Every one names five or six attending programs, nearly all D2,
-- NAIA, D3 or JUCO. $199 for one three-hour session, $299 for both. Their
-- refund policy, worth knowing before paying: 25% of tuition and all fees are
-- non-refundable, 75% comes back only if asked a month before, and after that
-- it is credit toward another event.
--
-- Program names are lightly normalised from how the pages print them, so the
-- same school reads the same everywhere and matches a roster search: "Concordia
-- University - Chicago" becomes Concordia University Chicago, "Le Moyne Owen" is
-- LeMoyne-Owen, "California Poly Pomona" is Cal Poly Pomona, "PennWest
-- University, California (PA)" is PennWest California, and a typo
-- ("Chrisitian") is corrected. No program was added or dropped.
--
-- Replaces the three rows from this company already in the table (19): they
-- predate the rule, named no programs, and one was wrong — Lakeland is 20
-- September, not the 26th — and "Surprise, AZ" has since moved to Glendale.

alter table camps add column if not exists attending_programs text[];

comment on column camps.attending_programs is
  'For showcases (type = ''Open Exposure / Showcase''): the programs the event page names as attending. '
  'A showcase is only shown when this is non-empty. See lib/showcases.js.';

delete from camps
where school = 'College Basketball Prospect ID'
  and camp_name like 'Men''s Basketball Camp - %';

insert into camps
  (school, camp_name, division, region, cost, eligibility, registration_status,
   city, state, date, type, source_url, sport, verified_at, attending_programs)
values
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Ohio Dominican University', 'Showcase', 'Midwest', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Columbus', 'OH', '2026-09-19'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/columbus-oh.cfm', 'basketball-men', '2026-09-14'::date,
   array['Denison University', 'Ohio Dominican University', 'Otterbein University', 'Tiffin University', 'University of Northwestern Ohio']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at University of Mary Washington', 'Showcase', 'Mid-Atlantic', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Fredericksburg', 'VA', '2026-09-19'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/fredericksburg-va.cfm', 'basketball-men', '2026-09-14'::date,
   array['Averett University', 'Bowie State University', 'Catawba College', 'University of Mary Washington', 'Virginia State University']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Milwaukee School of Engineering', 'Showcase', 'Midwest', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Milwaukee', 'WI', '2026-09-19'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/milwaukee-wi.cfm', 'basketball-men', '2026-09-14'::date,
   array['Concordia University Chicago', 'Edgewood University', 'Milwaukee School of Engineering', 'University of Wisconsin-Parkside', 'University of Wisconsin-Stevens Point']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Pfeiffer University', 'Showcase', 'Southeast', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Misenheimer', 'NC', '2026-09-19'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/misenheimer-nc.cfm', 'basketball-men', '2026-09-14'::date,
   array['Belmont Abbey College', 'Livingstone College', 'Pfeiffer University', 'University of Mount Olive', 'Valdosta State University', 'Warren Wilson College']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Arizona Christian University', 'Showcase', 'West', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Glendale', 'AZ', '2026-09-19'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/surprise-az.cfm', 'basketball-men', '2026-09-14'::date,
   array['Benedictine University Mesa', 'Menlo College', 'Park University Gilbert', 'Point Loma Nazarene University', 'UMass Boston']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Emory University', 'Showcase', 'Southeast', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Atlanta', 'GA', '2026-09-20'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/atlanta-ga.cfm', 'basketball-men', '2026-09-14'::date,
   array['Albany State University', 'Augusta University', 'Brewton-Parker Christian University', 'Emory University', 'Valdosta State University']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Texas Wesleyan University', 'Showcase', 'South Central', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Fort Worth', 'TX', '2026-09-20'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/fort-worth-tx.cfm', 'basketball-men', '2026-09-14'::date,
   array['Hardin-Simmons University', 'Nelson University', 'Texas A&M International University', 'Texas Wesleyan University', 'University of North Texas at Dallas']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Florida Southern College', 'Showcase', 'Southeast', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Lakeland', 'FL', '2026-09-20'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/lakeland-fl.cfm', 'basketball-men', '2026-09-14'::date,
   array['Flagler College', 'Florida Institute of Technology', 'New College of Florida', 'Rollins College', 'Saint Leo University']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Cal State Los Angeles', 'Showcase', 'West', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Los Angeles', 'CA', '2026-09-20'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/los-angeles-ca.cfm', 'basketball-men', '2026-09-14'::date,
   array['Cal State San Marcos', 'Cal Poly Pomona', 'Cal State Los Angeles', 'Point Loma Nazarene University', 'University of La Verne']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Chestnut Hill College', 'Showcase', 'Mid-Atlantic', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Philadelphia', 'PA', '2026-09-20'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/philadelphia-pa.cfm', 'basketball-men', '2026-09-14'::date,
   array['Arcadia University', 'Chestnut Hill College', 'Delaware Valley University', 'Kutztown University', 'Millersville University']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at La Roche University', 'Showcase', 'Mid-Atlantic', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Pittsburgh', 'PA', '2026-09-20'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/pittsburgh-pa.cfm', 'basketball-men', '2026-09-14'::date,
   array['PennWest California', 'Denison University', 'La Roche University', 'Saint Vincent College', 'Westminster College (PA)']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Lawrence Technological University', 'Showcase', 'Midwest', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Southfield', 'MI', '2026-09-20'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/southfield-mi.cfm', 'basketball-men', '2026-09-14'::date,
   array['Anderson University', 'Dominican University (IL)', 'Lawrence Technological University', 'Northwood University', 'Tiffin University']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Menlo College', 'Showcase', 'West', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Atherton', 'CA', '2026-09-26'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/atherton-ca.cfm', 'basketball-men', '2026-09-14'::date,
   array['Cal Poly Pomona', 'Menlo College', 'Merritt College', 'San Francisco State University', 'Yuba College']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Regis University', 'Showcase', 'Mountain', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Denver', 'CO', '2026-09-26'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/denver-co.cfm', 'basketball-men', '2026-09-14'::date,
   array['Colorado Christian University', 'Eastern New Mexico University', 'Regis University', 'University of Colorado Colorado Springs', 'Westminster University']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Spalding University', 'Showcase', 'Southeast', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Louisville', 'KY', '2026-09-26'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/louisville-ky.cfm', 'basketball-men', '2026-09-14'::date,
   array['Kentucky State University', 'Spalding University', 'Transylvania University', 'University of the Cumberlands', 'University of Indianapolis']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at North Central University', 'Showcase', 'Midwest', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Minneapolis', 'MN', '2026-09-26'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/minneapolis-mn.cfm', 'basketball-men', '2026-09-14'::date,
   array['Bemidji State University', 'Bethel University', 'North Central University', 'University of Minnesota Duluth', 'Valley City State University']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Concordia University Chicago', 'Showcase', 'Midwest', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'River Forest', 'IL', '2026-09-26'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/river-forest-il.cfm', 'basketball-men', '2026-09-14'::date,
   array['Anderson University', 'Concordia University Chicago', 'Indiana University Northwest', 'North Central University', 'North Park University']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Christian Brothers University', 'Showcase', 'Southeast', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Memphis', 'TN', '2026-09-27'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/memphis-tn.cfm', 'basketball-men', '2026-09-14'::date,
   array['Christian Brothers University', 'Fisk University', 'Langston University', 'LeMoyne-Owen College', 'Union University']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at University of Montevallo', 'Showcase', 'Southeast', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Montevallo', 'AL', '2026-09-27'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/montevallo-al.cfm', 'basketball-men', '2026-09-14'::date,
   array['Allen University', 'Flagler College', 'Miles College', 'Tuskegee University', 'University of Montevallo']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Oklahoma City University', 'Showcase', 'South Central', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Oklahoma City', 'OK', '2026-09-27'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/oklahoma-city-ok.cfm', 'basketball-men', '2026-09-14'::date,
   array['Cameron University', 'Mid-America Christian University', 'Oklahoma Christian University', 'Oklahoma City University', 'Southeastern Oklahoma State University']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Pacific Lutheran University', 'Showcase', 'West', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Parkland', 'WA', '2026-09-27'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/parkland-wa.cfm', 'basketball-men', '2026-09-14'::date,
   array['George Fox University', 'Menlo College', 'Northwest Nazarene University', 'Pacific Lutheran University', 'Walla Walla University']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Team SportsPlex', 'Showcase', 'Southeast', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Baton Rouge', 'LA', '2026-10-03'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/baton-rouge-la.cfm', 'basketball-men', '2026-09-14'::date,
   array['Central Baptist College', 'Dillard University', 'Florida Institute of Technology', 'Southern University at New Orleans', 'University of Montevallo']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at D''Youville University', 'Showcase', 'Northeast', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Buffalo', 'NY', '2026-10-03'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/buffalo-ny.cfm', 'basketball-men', '2026-09-14'::date,
   array['PennWest California', 'Chestnut Hill College', 'D''Youville University', 'Houghton University', 'Mercy University']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Caldwell University', 'Showcase', 'Northeast', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Caldwell', 'NJ', '2026-10-03'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/caldwell-nj.cfm', 'basketball-men', '2026-09-14'::date,
   array['Caldwell University', 'Chestnut Hill College', 'Houghton University', 'Mercy University', 'St. Joseph''s University, New York']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at University of Indianapolis', 'Showcase', 'Midwest', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Indianapolis', 'IN', '2026-10-03'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/indianapolis-in.cfm', 'basketball-men', '2026-09-14'::date,
   array['Anderson University', 'Indiana Wesleyan University', 'Ohio Dominican University', 'Trine University', 'University of Indianapolis']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Bridgewater State University', 'Showcase', 'Northeast', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Bridgewater', 'MA', '2026-10-04'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/bridgewater-ma.cfm', 'basketball-men', '2026-09-14'::date,
   array['Babson College', 'Bridgewater State University', 'Gordon College', 'Nichols College', 'UMass Boston']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Allen University', 'Showcase', 'Southeast', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Columbia', 'SC', '2026-10-04'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/columbia-sc.cfm', 'basketball-men', '2026-09-14'::date,
   array['Allen University', 'Columbia College (SC)', 'Columbia International University', 'Southern Wesleyan University', 'Valdosta State University']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at University of Houston-Clear Lake', 'Showcase', 'South Central', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Houston', 'TX', '2026-10-04'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/houston-tx.cfm', 'basketball-men', '2026-09-14'::date,
   array['Langston University', 'Southwestern Christian College', 'Southwestern College', 'Texas A&M International University', 'Texas Wesleyan University']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Vertical Gym', 'Showcase', 'Southeast', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'Nashville', 'TN', '2026-10-04'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/nashville-tn.cfm', 'basketball-men', '2026-09-14'::date,
   array['Christian Brothers University', 'Fisk University', 'LeMoyne-Owen College', 'Lees-McRae College', 'Valdosta State University']),
  ('College Basketball Prospect ID', 'Men''s Prospect ID Showcase at Missouri Baptist University', 'Showcase', 'Midwest', 199,
   'High school players; $199 one session or $299 for both', 'Open', 'St. Louis', 'MO', '2026-10-04'::date,
   'Open Exposure / Showcase', 'https://men.collegebasketballprospectid.com/st-louis-mo.cfm', 'basketball-men', '2026-09-14'::date,
   array['Missouri Baptist University', 'Missouri Western State University', 'Southwest Baptist University', 'Truman State University', 'Westminster University'])
on conflict do nothing;

-- Supabase shows only the last result, so both checks are one row.
-- Expect showcases_with_programs = 30. hidden_showcases counts upcoming showcase
-- rows that now stop showing because no programs are named; they are not
-- deleted, and filling in attending_programs brings them back.
select
  (select count(*) from camps
    where type = 'Open Exposure / Showcase' and cardinality(attending_programs) > 0) as showcases_with_programs,
  (select count(*) from camps
    where type = 'Open Exposure / Showcase'
      and (attending_programs is null or cardinality(attending_programs) = 0)
      and date >= current_date) as hidden_showcases;
