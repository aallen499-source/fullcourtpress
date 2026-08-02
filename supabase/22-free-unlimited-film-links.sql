-- Full Court Press — free tier gets unlimited film LINKS, uploads stay capped
--
-- 21-enforce-free-limits.sql capped free accounts at 2 film rows of any kind.
-- That's the feature athletes compare most directly against competitors, and
-- being stingier there costs more in signups than it saves.
--
-- But "film" is two different things with very different economics:
--   * a YouTube/Hudl link  -> a row of text; the bandwidth is theirs, not ours
--   * an uploaded video    -> Supabase storage + egress, billed per view
--
-- A 2GB game watched by 30 coaches is ~60GB of egress (~$5.40) against an
-- Athlete plan that grosses ~$6.58/month. Unlimited free uploads loses money
-- on every free user who uses the feature; unlimited free links costs
-- essentially nothing. So the cap moves off "film rows" and onto "uploads".
--
-- Uploaded film is identifiable by URL: Supabase public storage objects for
-- this bucket always contain /storage/v1/object/public/film/. Same test the
-- client uses (isUploadedVideoUrl in lib/video-embed.js).

create or replace function fcp_film_upload_count()
returns integer
language sql
security definer          -- bypasses RLS internally; see 09/21 for why
set search_path = public
stable
as $$
  select count(*)::int from film
  where user_id = auth.uid()
    and url like '%/storage/v1/object/public/film/%';
$$;

drop policy if exists "own film insert" on film;

-- Links are unlimited on every tier. Uploads stay capped at 2 for free
-- accounts. Keep this number in sync with FREE_FILM_UPLOAD_LIMIT in
-- app/app/page.jsx.
create policy "own film insert" on film
  for insert with check (
    auth.uid() = user_id
    and (
      fcp_is_paid_or_trial()
      or url not like '%/storage/v1/object/public/film/%'
      or fcp_film_upload_count() < 2
    )
  );

-- ============================================================
-- VERIFY
-- ============================================================
-- On a free account (trial expired, no active subscription):
--   1. Add three or more YouTube/Hudl links -> all should succeed.
--   2. Upload a third video file -> should be refused.
--   3. Editing and deleting existing film should still work (those policies
--      were split out in 21 and are untouched here).
