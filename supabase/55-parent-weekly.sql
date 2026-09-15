-- 55-parent-weekly.sql
--
-- The Sunday parent update, and checklist ticks that follow the athlete.
--
-- RUN THIS BEFORE THE CODE DEPLOYS. The Roster checklist now saves ticks to
-- profiles.checklist_ticks, and a write to a column that doesn't exist fails.
--
-- A parent gets the weekly email only after confirming it from their own
-- inbox. The athlete types the address; RecruitGrid sends one confirmation
-- email; nothing else goes to that address until someone there clicks
-- Confirm. Otherwise any account could sign any address up for weekly mail
-- about a teenager.
--
-- Confirmed means parent_confirmed_email = parent_email. Changing the address
-- un-confirms it without a separate flag to keep in step.
--
-- These columns are written only by the server (/api/parent-updates, the
-- confirm and stop links, the Sunday job). The app writes profiles directly
-- from the browser for everything else, so the trigger below keeps a signed-in
-- user from setting them by hand — in particular from marking an address
-- confirmed that never confirmed anything.

alter table profiles add column if not exists parent_email text;
alter table profiles add column if not exists parent_token text;
alter table profiles add column if not exists parent_invited_at timestamptz;
alter table profiles add column if not exists parent_confirmed_email text;
alter table profiles add column if not exists parent_confirmed_at timestamptz;
alter table profiles add column if not exists parent_last_sent_at timestamptz;
alter table profiles add column if not exists parent_preview_at timestamptz;

create unique index if not exists profiles_parent_token_idx on profiles (parent_token);

-- Hand-ticked checklist items, by month: {"2026-09": ["opened", "schedule"]}.
-- Were in the browser only, which meant the parent email couldn't see them and
-- a tick on a phone didn't show on a laptop.
alter table profiles add column if not exists checklist_ticks jsonb not null default '{}'::jsonb;

create or replace function protect_parent_update_columns()
returns trigger
language plpgsql
as $$
begin
  -- Browser requests carry the authenticated (or anon) role. The service role
  -- used by the server, and the SQL editor, pass through untouched.
  if coalesce(auth.jwt() ->> 'role', '') in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.parent_email := null;
      new.parent_token := null;
      new.parent_invited_at := null;
      new.parent_confirmed_email := null;
      new.parent_confirmed_at := null;
      new.parent_last_sent_at := null;
      new.parent_preview_at := null;
    else
      new.parent_email := old.parent_email;
      new.parent_token := old.parent_token;
      new.parent_invited_at := old.parent_invited_at;
      new.parent_confirmed_email := old.parent_confirmed_email;
      new.parent_confirmed_at := old.parent_confirmed_at;
      new.parent_last_sent_at := old.parent_last_sent_at;
      new.parent_preview_at := old.parent_preview_at;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_parent_update_columns on profiles;
create trigger protect_parent_update_columns
  before insert or update on profiles
  for each row execute function protect_parent_update_columns();

-- Expect every profile, none with a parent yet, and ticks defaulted to {}.
select
  count(*)                                               as profiles,
  count(*) filter (where parent_email is not null)       as parent_added,
  count(*) filter (where checklist_ticks = '{}'::jsonb)  as ticks_empty
from profiles;
