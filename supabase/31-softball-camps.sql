-- RecruitGrid — 2026 softball camps
--
-- Softball's first entries. sport is 'softball-women' following the
-- '<sport>-<gender>' convention; softball is a women's sport at the college
-- level, so there is no men's split to make.
--
-- cost is the LOWEST listed price where the source quotes tiers ("Pitchers
-- $323; other options vary" -> 323), and null where the page shows no price —
-- source_url carries the real breakdown either way.
--
-- The source sheet has a registration-deadline column the camps table has no
-- home for, so each deadline is folded into the eligibility note ("register by
-- Sep 10") rather than dropped. A dedicated deadline column is the right long-
-- term fix, but that is a schema change for another migration.
--
-- Three third-party showcases and one camp of unverified affiliation keep
-- descriptive division labels rather than an NCAA tier, the same way the tennis
-- showcases in 27 do — the catalogue filters on sport, not division, so these
-- surface correctly under softball.
--
-- Safe to re-run — camps_school_name_date_idx makes the conflict a no-op.

insert into camps
  (school, camp_name, division, region, cost, eligibility, registration_status,
   city, state, date, type, source_url, sport, verified_at)
values
  ('George Mason University', 'Mid-Atlantic Prospect Camp', 'NCAA D1', 'Mid-Atlantic', 323.0, 'Ages 13–18; grades 8–12; register by Sep 10', 'Open', 'Fairfax', 'VA', '2026-09-12'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=323018&sport=3', 'softball-women', '2026-08-05'::date),
  ('Eckerd College', 'Showcase Camp', 'NCAA D2', 'Southeast', null, 'Grades 8–12; register by Sep 23', 'Open', 'St. Petersburg', 'FL', '2026-09-26'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=338428&sport=3', 'softball-women', '2026-08-05'::date),
  ('Coe College', 'High School Prospect Camp', 'NCAA D3', 'Midwest', 105.0, 'Grades 8–12; register by Sep 19', 'Open', 'Cedar Rapids', 'IA', '2026-09-20'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=338911&sport=3', 'softball-women', '2026-08-05'::date),
  ('Duke University', 'Elite Hitting & Fielding Camp', 'NCAA D1', 'Southeast', 255.0, 'Grades 7–12 as of fall 2026', 'Open', 'Durham', 'NC', '2026-08-22'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=330450&sport=3', 'softball-women', '2026-08-05'::date),
  ('Drake University', 'August Prospect Camp', 'NCAA D1', 'Midwest', 84.5, 'Grades 8 through JUCO; register by Aug 21', 'Open', 'Des Moines', 'IA', '2026-08-22'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=336749', 'softball-women', '2026-08-05'::date),
  ('James Madison University', 'August Prospect Camp', 'NCAA D1', 'Mid-Atlantic', 235.0, 'Ages 13–18; rising grades 8–12', 'Open', 'Harrisonburg', 'VA', '2026-08-23'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=334863&sport=3', 'softball-women', '2026-08-05'::date),
  ('College Coaches Showcase Camps', 'Park City College Coaches Showcase', 'Multi-division showcase', 'West', null, 'High school softball players', 'Open', 'Park City', 'UT', '2026-10-17'::date, 'Open Exposure / Showcase', 'https://www.collegesoftballprospects.com/', 'softball-women', '2026-08-05'::date),
  ('Triple Crown Fastpitch', 'Xtreme Fall Showcase Camp', 'Multi-division showcase', 'Mid-Atlantic', null, 'Prospective softball athletes', 'Open', 'Ewing', 'NJ', '2026-10-16'::date, 'Open Exposure / Showcase', 'https://www.triplecrownfastpitch.com/camps-clinics-showcases', 'softball-women', '2026-08-05'::date),
  ('Elite College Camps', 'Player Skills Camp', 'Multi-division showcase', 'West', null, 'Prospective softball athletes', 'Open', 'California', 'CA', '2026-10-24'::date, 'Open Exposure / Showcase', 'https://www.elitecollegecamps.com/', 'softball-women', '2026-08-05'::date),
  ('Louisburg College', 'Hurricane Prospect Camp', 'NJCAA', 'Southeast', 323.0, 'Grades 8–12; register by Nov 10', 'Open', 'Louisburg', 'NC', '2026-11-11'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=339384&sport=3', 'softball-women', '2026-08-05'::date),
  ('Asbury University', 'Softball Skills Camps', 'NAIA', 'Southeast', null, 'Grades 9–12', 'Open', 'Wilmore', 'KY', '2026-11-21'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=339307', 'softball-women', '2026-08-05'::date),
  ('All-In Softball Camps', 'ALL-IN Softball Camps', 'Showcase — verify affiliation', 'Southeast', null, 'Grades 6–12; register by Nov 21', 'Open', 'Berea', 'KY', '2026-11-21'::date, 'Open Exposure / Showcase', 'https://register.ryzer.com/camp.cfm?id=339646&sport=3', 'softball-women', '2026-08-05'::date),
  ('Sam Houston State University', 'Pitching Clinic', 'NCAA D1', 'South Central', null, 'Grades 8–12 as of fall 2026', 'Open', 'Huntsville', 'TX', '2026-11-23'::date, 'College Team Camp', 'https://www.garrettvalissoftballcamps.com/', 'softball-women', '2026-08-05'::date),
  ('Nicholls State University', 'Prospect Camp', 'NCAA D1', 'South Central', null, 'Grades 8 through college sophomore; register by Dec 4', 'Open', 'Thibodaux', 'LA', '2026-12-05'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=338876&sport=3', 'softball-women', '2026-08-05'::date),
  ('Florida Atlantic University', 'Owls Catching ID Camp', 'NCAA D1', 'Southeast', 137.5, 'Ages 12–18; register by Dec 4', 'Open', 'Boca Raton', 'FL', '2026-12-05'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=338489', 'softball-women', '2026-08-05'::date),
  ('Florida Atlantic University', 'Owls All Skills Camp', 'NCAA D1', 'Southeast', 217.0, 'Ages 12–18; register by Dec 4', 'Open', 'Boca Raton', 'FL', '2026-12-05'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=338486', 'softball-women', '2026-08-05'::date),
  ('William Peace University', 'Lauren Conway Softball ID Camp', 'NCAA D3', 'Southeast', 164.0, 'Grades 8–12; register by Dec 4', 'Open', 'Raleigh', 'NC', '2026-12-05'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=339368&sport=3', 'softball-women', '2026-08-05'::date),
  ('Saint Mary''s College of California', 'Elite ID Camp', 'NCAA D1', 'West', 226.75, 'Grades 9 through college sophomore; register by Dec 4', 'Open', 'Moraga', 'CA', '2026-12-05'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=338906&ryzer=1', 'softball-women', '2026-08-05'::date),
  ('Sam Houston State University', 'December Elite Camp', 'NCAA D1', 'South Central', null, 'Grades 8–12', 'Open', 'Huntsville', 'TX', '2026-12-05'::date, 'College Team Camp', 'https://www.garrettvalissoftballcamps.com/', 'softball-women', '2026-08-05'::date),
  ('Millsaps College', 'Prospect Camp', 'NCAA D3', 'South Central', null, 'Grades 7–12; register by Dec 28', 'Open', 'Jackson', 'MS', '2026-12-29'::date, 'College Team Camp', 'https://register.ryzer.com/camp.cfm?id=339836&sport=3', 'softball-women', '2026-08-05'::date)
on conflict (school, camp_name, date) do nothing;

-- ============================================================
-- VERIFY
-- ============================================================
--   select sport, count(*) from camps group by sport order by sport;
--   -- expect softball-women = 20, total 169.
