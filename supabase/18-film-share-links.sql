-- Full Court Press — short branded share links for individual clips
--
-- Before this, "Open original" handed out the raw Supabase storage URL:
--   https://<project-ref>.supabase.co/storage/v1/object/public/film/<user-uuid>/<timestamp>-<file>
-- which leaks the project ref and the athlete's user id, and looks like
-- nothing an athlete would want to paste into an email to a college coach.
-- Now each clip can get a short id served at fullcourtpress.app/f/<id>.
--
-- share_id is NULL until the athlete explicitly clicks "Create share link",
-- so sharing stays opt-in rather than something that happens silently on
-- upload — the right default for minors' film.
--
-- Deliberately NO new RLS policy here. The watch page reads the film
-- server-side with the service-role key instead. A policy like
-- `using (share_id is not null)` would technically work, but the anon key
-- is public by design, so anyone could then run
-- `select * from film where share_id is not null` and enumerate every
-- shared clip on the platform. Keeping the lookup server-side means only
-- the exact share_id in the URL ever resolves.

alter table film add column if not exists share_id text unique;

create index if not exists film_share_id_idx on film(share_id);

-- ============================================================
-- VERIFY
-- ============================================================
-- select id, title, share_id from film;
-- share_id should be null for every existing row until an athlete
-- generates one from the Film Locker.
