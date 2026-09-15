-- 63-setup-nudges.sql
--
-- Two friendly reminders for athletes who signed up but haven't published a
-- profile — and then nothing more. Sent by app/api/cron/setup-nudges:
--   1. three days after signup
--   2. a month after the first
-- Stops for good once the profile is published, if the account turns off
-- update emails, or after the second one.
--
-- Accounts that got the what's-new email (56) have effectively had their first
-- reminder, so it's recorded as their first nudge: if they're still not set up
-- a month after that, they get the second, and that's the last.
--
-- RUN THIS BEFORE THE CODE DEPLOYS.

alter table profiles add column if not exists setup_nudge1_at timestamptz;
alter table profiles add column if not exists setup_nudge2_at timestamptz;

update profiles
set setup_nudge1_at = announce_features_sent_at
where announce_features_sent_at is not null
  and setup_nudge1_at is null
  and coalesce(public_published, false) = false;

-- Same protection as the other server-only columns: a browser request can't
-- change when these were sent.
create or replace function protect_owner_columns()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.is_owner := false;
      new.announce_features_sent_at := null;
      new.setup_nudge1_at := null;
      new.setup_nudge2_at := null;
    else
      new.is_owner := old.is_owner;
      new.announce_features_sent_at := old.announce_features_sent_at;
      new.setup_nudge1_at := old.setup_nudge1_at;
      new.setup_nudge2_at := old.setup_nudge2_at;
    end if;
  end if;
  return new;
end;
$$;

-- Who is waiting on each reminder right now (nothing is sent by running this).
select
  count(*) filter (where coalesce(public_published, false) = false and role is distinct from 'coach') as not_set_up,
  count(*) filter (where setup_nudge1_at is not null and setup_nudge2_at is null
                   and coalesce(public_published, false) = false)                                   as had_first_reminder
from profiles;
