-- 52-showcase-programs-check.sql
--
-- The eight upcoming showcase rows that 51 hid for naming no programs, each
-- re-read on 2026-09-14 against its own page.
--
-- TENNIS
--   Indiana UTR College Camp (Sep 26-27)  still listed by UTR, registration open.
--     It is hosted at one university rather than a multi-college showcase, and
--     the host is the program the page names. Programs filled in, status fixed
--     from 'Closed' to 'Open'.
--   Methodist UTR College Camp (Oct 10)   no longer on UTR's list. UTR now lists
--     Methodist on Dec 12-13 instead, so the October row is replaced by that one.
--   Liberty UTR College Camp (Oct 24)     no longer on UTR's list, nothing to
--     replace it with. Deleted.
--   UTR College Tennis Showcase, Rome GA (Oct 30)  real, but UTR's pages name no
--     attending colleges for this year, only quotes from last year's coaches.
--     Stays hidden.
--
-- SOFTBALL
--   Park City College Coaches Showcase (Oct 17)  its event page names five
--     programs and caps the ratio at 8 players per coach. Programs, cost ($219
--     for one session) and the event page link filled in.
--   Triple Crown Xtreme Fall Showcase (Oct 16)  the only coach list on the page
--     is headed "2025 Schools that Attending". Last year's list is not this
--     year's. Stays hidden; cost ($180) and the event page link updated.
--   Elite College Camps "Player Skills Camp" (Oct 24)  that date no longer
--     exists. The company's next event is Oct 2 in Stockton, and its home page
--     names 26 colleges attending "our upcoming event". The October 24 row is
--     replaced by October 2. (Their November 7 camp names no colleges.)
--   ALL-IN Softball Camps, Berea KY (Nov 21)  a grades 6-12 skills camp run by
--     an individual, which states it is not affiliated with Berea College, and
--     names no college programs. Not a showcase. Deleted.

-- Tennis
update camps
   set attending_programs = array['Indiana University'],
       registration_status = 'Open',
       verified_at = '2026-09-14'::date
where school = 'Indiana University' and camp_name = 'UTR Sports College Camp'
  and date = '2026-09-26'::date;

delete from camps
where camp_name = 'UTR Sports College Camp'
  and ((school = 'Methodist University' and date = '2026-10-10'::date)
    or (school = 'Liberty University'   and date = '2026-10-24'::date));

insert into camps
  (school, camp_name, division, region, cost, eligibility, registration_status,
   city, state, date, type, source_url, sport, verified_at, attending_programs)
values
  ('Methodist University', 'UTR Sports College Camp', 'NCAA D3 host', 'Southeast', null,
   'Junior players; verify age and UTR', 'Open', 'Fayetteville', 'NC', '2026-12-12'::date,
   'Open Exposure / Showcase', 'https://www.utrsports.net/pages/college-camps', 'tennis-coed',
   '2026-09-14'::date, array['Methodist University'])
on conflict do nothing;

-- Softball
update camps
   set attending_programs = array['Cal State Bakersfield', 'Cal State Fullerton', 'Idaho State University', 'University of Utah', 'Utah State University'],
       division = 'Showcase',
       cost = 219,
       eligibility = 'High school players; $219 one session, $319 two, $419 three; max 8 players per coach',
       source_url = 'https://www.collegesoftballprospects.com/park-city-ut.cfm',
       verified_at = '2026-09-14'::date
where school = 'College Coaches Showcase Camps' and camp_name = 'Park City College Coaches Showcase'
  and date = '2026-10-17'::date;

update camps
   set cost = 180,
       eligibility = 'Open to all players; two instructional games coached by college coaches',
       source_url = 'https://www.triplecrownfastpitch.com/events/xtreme-summer-fall-camp',
       verified_at = '2026-09-14'::date
where school = 'Triple Crown Fastpitch' and camp_name = 'Xtreme Fall Showcase Camp'
  and date = '2026-10-16'::date;

delete from camps
where (school = 'Elite College Camps' and camp_name = 'Player Skills Camp' and date = '2026-10-24'::date)
   or (school = 'All-In Softball Camps' and date = '2026-11-21'::date);

insert into camps
  (school, camp_name, division, region, cost, eligibility, registration_status,
   city, state, date, type, source_url, sport, verified_at, attending_programs)
values
  ('Elite College Camps', 'Player Camp', 'Showcase', 'West', 325,
   'Grad years 2026-2031 plus JUCO and transfer players; college list is for "our upcoming event"', 'Open',
   'Stockton', 'CA', '2026-10-02'::date, 'Open Exposure / Showcase',
   'https://register.ryzer.com/camp.cfm?sport=3&id=338542', 'softball-women', '2026-09-14'::date,
   array['Notre Dame', 'PSU', 'Cal State Bakersfield', 'Saint Mary''s College', 'San Diego State',
         'University of Nevada', 'Sacramento State', 'Fresno State', 'San Jose State', 'Santa Clara',
         'University of the Pacific', 'USD', 'SF State', 'Cal State San Marcos', 'Whitworth',
         'CSU Monterey Bay', 'College of San Mateo', 'Cal State East Bay', 'Dominican University',
         'University of La Verne', 'Concordia University Irvine', 'William Jessup University',
         'La Sierra University', 'UC Riverside', 'Chico State', 'Simpson University'])
on conflict do nothing;

-- Expect visible_showcases = 34 (the 30 basketball showcases plus Indiana,
-- Methodist, Park City and Elite) and hidden_showcases = 2 (Rome and Triple Crown).
select
  (select count(*) from camps
    where type = 'Open Exposure / Showcase' and cardinality(attending_programs) > 0
      and date >= current_date) as visible_showcases,
  (select count(*) from camps
    where type = 'Open Exposure / Showcase'
      and (attending_programs is null or cardinality(attending_programs) = 0)
      and date >= current_date) as hidden_showcases;
