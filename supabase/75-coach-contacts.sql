-- RecruitGrid - coach contacts, read off each school's own staff directory
--
-- What the paid platforms sell and every athletics site already publishes.
-- Filled by scripts/import-coach-contacts.mjs from the output of
-- scripts/extract-coach-contacts.mjs, which renders each of the 1,228
-- directories in lib/staff-directory*.js and runs them through
-- lib/staff-page-parser.js.
--
-- One row per person per sport heading. A head coach with no published
-- address is a row with email null, on purpose: "this program lists its head
-- coach and no way to reach them" is information the app should show, and
-- dropping the row would make it look like the parser missed them.
--
-- kind is 'coach' or 'staff'. Big programs often publish no address for any
-- coach (Delaware men's basketball, Oklahoma State football) and route
-- recruiting mail through operations; the operations director is a 'staff'
-- row so the app can offer them, labelled honestly, rather than a blank.
--
-- source_url and checked_at are not optional. An address is only true on the
-- day it was read — coaches change jobs every spring — and every row has to
-- trace to a page somebody actually opened. The app shows both.

create table if not exists coach_contacts (
  id          bigint generated always as identity primary key,
  school      text        not null,
  state       text,
  assoc       text,                                  -- NCAA / NAIA / JUCO
  sport       text        not null,                  -- a key of SPORTS in lib/staff-page-parser.js
  gender      text        not null default '',       -- men / women / both / '' (heading said nothing)
  heading     text        not null default '',       -- the section heading as the school wrote it
  name        text        not null,
  title       text        not null default '',
  email       text,                                  -- null when the page lists none
  kind        text        not null check (kind in ('coach', 'staff')),
  rank        smallint,                              -- coaches only: 0 recruiting, 1 head, 2 associate, 3 assistant, 4 other
  source_url  text        not null,
  checked_at  timestamptz not null,
  -- heading and title default to '' rather than null so this key holds:
  -- Postgres treats nulls as distinct, and a null would let the same person
  -- in twice.
  unique (source_url, heading, name, title)
);

-- The app's lookup: "coaches for this school and sport".
create index if not exists coach_contacts_school_sport_idx on coach_contacts (school, sport);
-- The importer's clean-up: "rows from this page older than today's read".
create index if not exists coach_contacts_source_idx on coach_contacts (source_url, checked_at);

alter table coach_contacts enable row level security;

-- Signed-in athletes read; nobody writes from a browser. The importer uses
-- the service role, which bypasses this. Signed-in rather than public so the
-- aggregated list is not a free download for anyone who finds the endpoint —
-- each address is public on its school's site, the collection is the work.
create policy "signed-in athletes can read coach contacts"
  on coach_contacts for select to authenticated using (true);

-- ============================================================
-- VERIFY, after the importer has run
-- ============================================================
-- select assoc, count(*) filter (where kind = 'coach' and email is not null) as coaches_with_address,
--        count(distinct source_url) as schools
-- from coach_contacts group by assoc;
--
-- select sport, gender, name, title, email, kind, checked_at::date
-- from coach_contacts where school = 'Colorado Mesa University' and sport = 'football'
-- order by kind, rank;   -- head coach present with email null, assistants with addresses
