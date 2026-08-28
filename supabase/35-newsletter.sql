-- Weekly newsletter opt-in.
--
-- Deliberately SEPARATE from email_reminders, and deliberately default FALSE.
--
-- email_reminders covers transactional mail: you marked a camp as registered,
-- so we remind you before it. Defaulting that to true is fair — you asked for
-- it by registering.
--
-- The newsletter is marketing. It goes to people who did nothing in particular
-- to request it, the recipients are high school athletes, and a good number of
-- the addresses belong to their parents. Opting minors' families into marketing
-- by default is the kind of thing that is technically legal under CAN-SPAM and
-- still the wrong call. A smaller list of people who said yes is worth more
-- than a large one that resents you, and it keeps complaint rates — the thing
-- that actually decides whether your mail reaches inboxes — near zero.
--
-- One flag, two meanings avoided: someone who turns off the newsletter must
-- keep getting camp reminders they asked for, and vice versa.

alter table profiles
  add column if not exists email_newsletter boolean not null default false;

comment on column profiles.email_newsletter is
  'Opt-in for the weekly marketing newsletter. Separate from email_reminders '
  '(transactional camp reminders). Defaults false: recipients are minors and '
  'their parents, so this is opt-in rather than opt-out.';

-- The weekly send reads exactly this set, so keep it cheap as the list grows.
create index if not exists profiles_email_newsletter_idx
  on profiles (email_newsletter)
  where email_newsletter;

-- Who's actually subscribed:
--
--   select count(*) filter (where email_newsletter) as newsletter,
--          count(*) filter (where email_reminders)  as reminders,
--          count(*)                                 as total
--   from profiles;
