-- Full Court Press — profile photos + published profile pages
-- Run after 01-schema.sql, 02-policies.sql, and 03-film-storage.sql.

alter table profiles add column if not exists avatar_url text;

insert into storage.buckets (id, name, public, file_size_limit)
values ('avatars', 'avatars', true, 5242880) -- 5MB per file
on conflict (id) do update set public = true, file_size_limit = 5242880;

drop policy if exists "avatars readable by anyone" on storage.objects;
create policy "avatars readable by anyone" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatars uploadable by owner" on storage.objects;
create policy "avatars uploadable by owner" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatars deletable by owner" on storage.objects;
create policy "avatars deletable by owner" on storage.objects
  for delete using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- public_slug/public_published already exist on profiles from 01-schema.sql,
-- and 02-policies.sql already allows anyone to read a profile (and its film)
-- once public_published = true. Nothing else to add there.
