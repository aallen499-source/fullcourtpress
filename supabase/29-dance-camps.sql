-- RecruitGrid — dance clinics
--
-- One row, and that is not an oversight. The source workbook tracks 142 dance
-- programmes but marks 179 of its 180 event rows "TBD — monitor" with no date,
-- and its own instructions say only rows labelled "Confirmed 2026" should be
-- treated as confirmed. Importing the rest would mean inventing dates for
-- clinics that have not been announced, which is the one thing this catalogue
-- cannot do and stay worth using.
--
-- The programmes themselves are not wasted — all 142 went into the College
-- Finder (lib/college-dance-data.js), where a school with no announced clinic
-- is still somewhere to send film.
--
-- Safe to re-run — camps_school_name_date_idx makes the conflict a no-op.

insert into camps
  (school, camp_name, division, region, cost, eligibility, registration_status,
   city, state, date, type, source_url, sport, verified_at)
values
  ('Dallas Baptist University', 'Fall Prep Clinic', 'NCAA D2', 'South Central', null,
   'Prospective college dance team members; verify age and level on the clinic page', 'Open',
   'Dallas', 'TX', '2026-10-17'::date, 'College Team Camp',
   'https://dbupatriots.com/sports/2023/8/15/clinics.aspx', 'dance-women', '2026-08-04'::date)
on conflict (school, camp_name, date) do nothing;

-- ============================================================
-- VERIFY
-- ============================================================
--   select sport, count(*) from camps group by sport order by sport;
--   -- expect dance-women = 1, everything else unchanged, 147 total.
