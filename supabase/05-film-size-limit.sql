-- Full Court Press — raise film upload size limit for full-game footage
-- Run after 01 through 04.
--
-- This only raises the BUCKET's own limit. Supabase also enforces a
-- project-wide global upload size cap in Dashboard → Storage → Settings →
-- "Global file size limit" — the smaller of the two always wins. Check that
-- setting and raise it to match (or higher) after running this.
--
-- Also worth knowing: this does NOT raise your total storage quota, just the
-- per-file limit. Free tier gives 1GB total across everyone's uploads
-- combined — a single 4GB game would blow past that on its own. If you're
-- expecting real usage at this file size, budget for Supabase's paid tier
-- (Pro starts around $25/mo and includes more storage, with overage billing
-- beyond that) before this becomes a real bottleneck.

update storage.buckets
set file_size_limit = 5368709120 -- 5GB per file
where id = 'film';
