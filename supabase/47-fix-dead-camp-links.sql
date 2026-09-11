-- RecruitGrid — repoint or retire every camp whose registration link is dead
--
-- Same problem the questionnaire catalogue had, in the camps table. Fourteen
-- camp rows pointed at fieldlevel.com/app/events/<id>. All fourteen return
-- HTTP 200 and a correct <title> ("Warriors Basketball College Prospect Camp
-- by Westmont College"), so a status-code check passes. Render one and the
-- body is "Sorry, something went wrong. FieldLevel is aware of the issue."
-- Every one of the twelve distinct event pages does this.
--
-- Checking every other future camp link the same way — render, don't just
-- fetch — turned up four more that a 200 was hiding:
--
--   tcnjsportscamps.com          serves a certificate for *.readysetregister.com,
--                                so Chrome refuses the page outright
--   app.utrsports.net/events/N   shows a "Sign in to UTR Sports" wall, not the
--                                event; the same platform's /pages/college-camps
--                                index is public, and the Methodist row already
--                                uses it
--   athletics.covenant.edu/news/2026/6/30/...  is a real 404 titled
--                                "Page Not Found (404) - Covenant College"
--
-- Everything else in the table (80 ryzer links, the totalcamps shops, the
-- school-run pages) renders fine and is untouched.
--
-- Two of the eight repointed rows get a weaker link than they had, and say so
-- in registration_status rather than pretending otherwise:
--
--   TCNJ      the camp is real but its only published registration page is the
--             broken-certificate one. Pointed at the team page so a family can
--             reach the staff; there is nothing else public.
--   Winthrop  a December track clinic that does not appear on Winthrop's camps
--             page (which lists summer camps only). Pointed at that page, which
--             is the closest thing the school publishes.
--
-- Keyed on (school, camp_name, date) — the unique index from 19-shared-camps.

-- ---------- repoint the eight upcoming camps ----------

update camps set source_url = 'https://info.abcsportscamps.com/cmsbasketball'
where school = 'Claremont-Mudd-Scripps'
  and camp_name in ('Stags Elite Prospect Camp - Day 1', 'Stags Elite Prospect Camp - Day 2');

update camps set source_url = 'https://www.westmont.edu/prospect-camps'
where school = 'Westmont College'
  and camp_name = 'Warriors Basketball College Prospect Camp'
  and date = '2026-09-19'::date;

update camps set source_url = 'https://online.covenant.edu/register/softballprospectcamp'
where school = 'Covenant College'
  and camp_name = 'Softball Fall Prospect Camp'
  and date = '2026-09-19'::date;

update camps set source_url = 'https://www.utrsports.net/pages/college-camps'
where camp_name = 'UTR Sports College Camp'
  and school in ('Indiana University', 'Liberty University');

update camps
   set source_url = 'https://tcnjathletics.com/sports/womens-basketball',
       registration_status = 'Verify — registration site has a certificate error'
where school = 'The College of New Jersey'
  and camp_name = 'Women''s Basketball Elite Camp'
  and date = '2026-09-20'::date;

update camps
   set source_url = 'https://winthropeagles.com/sports/2012/4/19/GEN_0419120016.aspx',
       registration_status = 'Verify — not listed on the school camps page'
where school = 'Winthrop University'
  and camp_name = 'Winter Clinic'
  and date = '2026-12-06'::date;

-- ---------- retire the ten that have already happened ----------
--
-- Every surface filters date >= today, so these are invisible already; they are
-- deleted rather than repointed because a past camp whose only link is dead has
-- nothing left to offer, and leaving them means next year someone bumps the
-- date and inherits the dead URL. When these camps run again they come back as
-- fresh rows with whatever link the school publishes then.

delete from camps
where source_url like '%fieldlevel.com%'
  and date < current_date;

-- Nothing in the camps table should point at fieldlevel.com after this.
-- Expect 0.
select count(*) as fieldlevel_rows_remaining
from camps
where source_url like '%fieldlevel.com%';
