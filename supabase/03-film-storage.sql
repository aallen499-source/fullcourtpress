-- Full Court Press — Film upload storage
-- Run this in Supabase → SQL Editor, after 01-schema.sql and 02-policies.sql.
--
-- Creates a public storage bucket for athlete-uploaded film. Files are stored
-- under a path prefixed with the uploader's user id (e.g. "<user_id>/171234-clip.mp4"),
-- and only that user can add/remove their own files. Anyone with the resulting
-- link can view/play the video — same sharing model as the rest of the app.

insert into storage.buckets (id, name, public, file_size_limit)
values ('film', 'film', true, 209715200) -- 200MB per file
on conflict (id) do update set public = true, file_size_limit = 209715200;

drop policy if exists "film readable by anyone" on storage.objects;
create policy "film readable by anyone" on storage.objects
  for select using (bucket_id = 'film');

drop policy if exists "film uploadable by owner" on storage.objects;
create policy "film uploadable by owner" on storage.objects
  for insert with check (
    bucket_id = 'film'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "film deletable by owner" on storage.objects;
create policy "film deletable by owner" on storage.objects
  for delete using (
    bucket_id = 'film'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- ============================================================
-- VERIFY BEFORE RELYING ON THIS
-- ============================================================
-- 1. Sign in as you+a@gmail.com, upload a clip from the Film Locker tab
-- 2. Copy the resulting link, open it in a private/incognito window — it
--    should play with no sign-in required
-- 3. Sign in as you+b@gmail.com — they should NOT be able to delete or
--    overwrite you+a's file (try only if you're comfortable poking at the
--    Storage API directly; the UI itself never exposes another user's files)
