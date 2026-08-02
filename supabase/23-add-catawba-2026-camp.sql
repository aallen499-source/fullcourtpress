-- Full Court Press — add verified camps from the FieldLevel tracker workbook
--
-- Source workbook: FieldLevel_Nationwide_Camps_Tracker, Basketball tab,
-- 12 rows, snapshot dated 2026-08-01.
--
-- Only ONE of those 12 rows survived verification against the school's own
-- site. The workbook's own Read Me flagged the risk ("a practical snapshot,
-- not a guaranteed complete export", "verify before registering"), and that
-- turned out to matter:
--
--   Catawba College      Aug 9 2026, $100   -> CONFIRMED on catawbabasketballcamps.com
--   Barton College       Jul 30 - Aug 1     -> already over
--   RPI                  Aug 1 - 2          -> starts the day of the snapshot
--   UW-Milwaukee         Aug 29 2026        -> the only Elite Camp page found is
--                                             Aug 31 *2024*, marked completed
--   Western New Mexico   Aug 22, $200,      -> school lists Jul 22, $50,
--                        ages 14-18            7th-8th grade
--   Bucknell             Aug 29, no cost    -> school lists Jun 6-7
--   Navarro College      Aug 9, $50         -> no 2026 elite camp found
--   Central State        Aug 8, $50         -> no 2026 camp found
--   Dakota State         Aug 29, $70        -> camps site 404s
--   Truett McConnell     Aug 29, $85        -> camps site has a bad TLS cert
--   Southwestern College Aug 29, $150       -> no campus showcase found
--   Outwork Showcase     Aug 9, $120        -> not verified
--
-- The rest are deliberately NOT imported. This catalog is sold as verified
-- with confirmed dates and live registration links, and a wrong date here
-- means a family books travel around a camp that isn't happening.

insert into camps (
  school, division, camp_name, date, city, state, region,
  cost, eligibility, registration_status, source_url, sport, verified_at
)
select
  'Catawba College', 'D2', 'Elite Camp', date '2026-08-09', 'Salisbury', 'NC', 'Southeast',
  100, 'Rising 9th-12th grade as of Fall 2026', 'open',
  'https://catawbabasketballcamps.com/content/2026-elite-camp', 'basketball', date '2026-08-01'
where not exists (
  select 1 from camps
  where school = 'Catawba College'
    and camp_name = 'Elite Camp'
    and date = date '2026-08-09'
);

-- ============================================================
-- VERIFY
-- ============================================================
-- Expect 65 (was 64):
--   select count(*) from camps;
--
-- Expect one row, cost 100, verified_at 2026-08-01:
--   select school, camp_name, date, cost, source_url
--   from camps where school = 'Catawba College';
