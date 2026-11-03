-- 72-trigger-sets-login-email.sql
--
-- Have the signup trigger set login_email too, and backfill any row missing it.
--
-- WHY. Migration 70 made the database create the profile row at confirmation,
-- and it inserted only id and email. But profiles.email is NOT the address the
-- athlete signs in with — My Info lets them set a contact email that
-- overwrites that column, which is the whole reason migration 10 added a
-- separate, immutable login_email in the first place. That bug cost real
-- money: the Stripe webhook matches a paid checkout back to an account on
-- login_email, and when it matched on the editable column instead, payments
-- silently failed to link. No error, no subscription row, no paid status.
--
-- So between my trigger firing and /auth/callback running a moment later,
-- there was a row with a null login_email. In practice the callback fills it
-- in on the same click and nothing breaks — but that is a correctness
-- guarantee resting on a redirect completing, for a column whose entire
-- purpose is to be the one address that is always right. The trigger has
-- new.email in hand from the authoritative source. It should just write it.
--
-- Not a replacement for the callback's update: that one still matters, because
-- it re-syncs login_email when somebody CHANGES their email address, which
-- this trigger never sees.

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, login_email)
  values (new.id, new.email, new.email)
  on conflict (id) do nothing;
  return new;
exception when others then
  raise warning 'handle_new_user could not create a profile for %: %', new.id, sqlerrm;
  return new;
end;
$$;

-- Backfill. Anybody whose profile row exists without a login_email cannot be
-- matched by the Stripe webhook, so this is a payment that would fail quietly
-- rather than a cosmetic gap.
update profiles p
   set login_email = u.email
  from auth.users u
 where p.id = u.id
   and p.login_email is null
   and u.email is not null;

-- Verify. Both should be 0. missing_login_email is the one that matters: any
-- row there is an account whose payment would not link.
select
  (select count(*) from profiles where login_email is null)            as missing_login_email,
  (select count(*) from profiles p join auth.users u on u.id = p.id
    where p.login_email is distinct from u.email)                      as login_email_mismatched,
  (select count(*) from profiles p join auth.users u on u.id = p.id
    where p.email is distinct from u.email)                            as contact_email_differs;
