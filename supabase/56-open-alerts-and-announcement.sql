-- 56-open-alerts-and-announcement.sql
--
-- Two things, run together.
--
-- 1. An email to the athlete when a coach opens their profile link.
--    email_open_alerts is the switch, on by default: the athlete asked to be
--    told by sending the link in the first place, and the email is about their
--    own account. One email per coach per day at most (app/api/opened).
--
-- 2. A one-off "what's new" email to existing accounts, sent from a button
--    only the owner sees in account settings.
--    email_product_updates is its own opt-out, so turning off an announcement
--    never touches camp reminders or the newsletter. announce_features_sent_at
--    records who already got this one, so pressing the button twice can't
--    send anyone a second copy.
--
-- is_owner marks the account allowed to send it. It and the sent-at column are
-- protected from browser writes the same way the parent columns are (55):
-- otherwise any signed-in user could make themselves the owner.
--
-- RUN THIS BEFORE THE CODE DEPLOYS — the settings screen writes these columns.
--
-- After running, mark your own account as owner (not kept in this file,
-- which is public):
--   update profiles set is_owner = true where login_email = 'YOUR EMAIL';

alter table profiles add column if not exists email_open_alerts boolean not null default true;
alter table profiles add column if not exists email_product_updates boolean not null default true;
alter table profiles add column if not exists announce_features_sent_at timestamptz;
alter table profiles add column if not exists is_owner boolean not null default false;

create or replace function protect_owner_columns()
returns trigger
language plpgsql
as $$
begin
  if coalesce(auth.jwt() ->> 'role', '') in ('authenticated', 'anon') then
    if tg_op = 'INSERT' then
      new.is_owner := false;
      new.announce_features_sent_at := null;
    else
      new.is_owner := old.is_owner;
      new.announce_features_sent_at := old.announce_features_sent_at;
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_owner_columns on profiles;
create trigger protect_owner_columns
  before insert or update on profiles
  for each row execute function protect_owner_columns();
