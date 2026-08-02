-- Full Court Press — catch any camps left on the old 'basketball' label
--
-- Migration 23 originally inserted Catawba with sport = 'basketball', which
-- 24a only relabels if 23 ran first. A row left on the bare 'basketball'
-- label still appears under "All camps" but is missing from the Men's
-- filter, so it looks like it vanished.
--
-- Safe to run any number of times, and safe if nothing is stray.

update camps set sport = 'basketball-men' where sport = 'basketball';

-- ============================================================
-- VERIFY — expect only basketball-men and basketball-women
-- ============================================================
--   select sport, count(*) from camps group by sport order by sport;
