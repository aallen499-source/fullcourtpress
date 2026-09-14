-- 54-profile-link-opens.sql
--
-- "Opened your profile": the honest version of what CaptainU, FieldLevel,
-- SportsRecruits and NCSA all charge families for.
--
-- Those platforms sell "see who viewed your profile" — which coaches came
-- across a profile in a database. This records something narrower and more
-- useful: whether the coach an athlete emailed opened the profile link in
-- that email. Each roster row gets its own short code, the {{profile_link}}
-- merge tag carries it (recruitgrid.app/<slug>?c=<code>), and the public
-- profile page reports an open back to /api/opened.
--
-- What counts as an open is decided in the route and the page, not here: the
-- page must stay visible for four seconds, known link scanners and bots are
-- ignored (Outlook's Safe Links and similar tools click every link in an
-- email to check it, and a false "your coach looked" is worse than none),
-- the athlete viewing their own page never counts, and repeat opens within
-- thirty minutes count once.
--
-- Nothing about the visitor is stored — no IP address, no user agent. Only
-- the time and a count, on the athlete's own roster row.

alter table coaches add column if not exists link_token text;

-- 12 hex characters from a random UUID: short enough to sit in an email
-- without looking like tracking junk, far too many combinations to guess.
update coaches
   set link_token = substr(replace(gen_random_uuid()::text, '-', ''), 1, 12)
 where link_token is null;

alter table coaches
  alter column link_token set default substr(replace(gen_random_uuid()::text, '-', ''), 1, 12);

create unique index if not exists coaches_link_token_idx on coaches (link_token);

alter table coaches add column if not exists link_first_opened_at timestamptz;
alter table coaches add column if not exists link_last_opened_at timestamptz;
alter table coaches add column if not exists link_open_count integer not null default 0;

-- Expect every coach row to have a code, and none opened yet.
select
  count(*)                                   as coach_rows,
  count(*) filter (where link_token is null) as missing_code,
  count(*) filter (where link_open_count > 0) as opened
from coaches;
