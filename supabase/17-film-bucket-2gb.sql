-- Full Court Press — bring the film bucket down to 2GB
--
-- 05-film-size-limit.sql set this to 5GB back when the plan was to host
-- full-game footage directly. After pricing out egress (~$0.09/GB beyond
-- the included 250GB, billed per view, not per upload), the call was to
-- keep full games on YouTube/Hudl links and use direct upload for clips
-- and shorter film. 2GB is the ceiling for that.
--
-- This also unblocks setting the Storage → Settings → "Global file size
-- limit" to 2GB: Supabase rejects a global limit lower than any
-- individual bucket's limit, so the bucket has to come down first.
--
-- Keep this in sync with NEXT_PUBLIC_MAX_FILM_UPLOAD_MB in Vercel (2000),
-- which is what the client checks before starting an upload.

update storage.buckets
set file_size_limit = 2147483648 -- 2GB
where id = 'film';

-- ============================================================
-- VERIFY
-- ============================================================
-- select id, file_size_limit from storage.buckets where id = 'film';
-- Should return 2147483648. Then set the global limit to 2 GB in
-- Dashboard → Storage → Files → Settings (it will save once this has run).
