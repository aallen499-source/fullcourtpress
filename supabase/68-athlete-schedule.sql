-- 68-athlete-schedule.sql
--
-- Where to watch the athlete play: a short list of upcoming games, tournaments
-- and showcases, shown on the public profile and pulled into the "Invite to a
-- Game" email.
--
-- Why: a coach who likes the film has exactly one next question — when can I
-- see this kid? Right now a profile cannot answer it, so the coach has to
-- write back and ask, which is a round trip most of them will not make. Other
-- platforms put an events table on the profile for this reason; it is the one
-- thing theirs does that ours could not.
--
-- Deliberately plain: a date, what it is, where it is. No opponent records, no
-- brackets, no importing a season schedule — a list nobody maintains is worse
-- than no list, so this is short enough to keep current in a minute.
--
-- Past events are kept rather than deleted (a coach may ask what happened at a
-- showcase), but the public profile only ever shows what is still ahead.
--
-- RUN THIS BEFORE THE CODE DEPLOYS.

create table if not exists athlete_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  date date not null,
  end_date date,                    -- multi-day tournaments; null for one day
  kind text not null default 'game',-- game | tournament | showcase | camp | visit
  title text not null,              -- "vs Durango", "USA Preps Showcase"
  location text,                    -- "Liberty HS, Henderson NV"
  time_note text,                   -- "6pm" or "Court 3, 9am" — free text on purpose
  note text,                        -- anything else the athlete wants a coach to know
  created_at timestamptz default now()
);

create index if not exists athlete_events_user_date_idx on athlete_events (user_id, date);

alter table athlete_events enable row level security;

drop policy if exists "own events" on athlete_events;
create policy "own events" on athlete_events
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Same rule as film: visible to a logged-out coach only when the athlete has
-- published their profile.
drop policy if exists "published events readable" on athlete_events;
create policy "published events readable" on athlete_events
  for select using (
    exists (
      select 1 from profiles p
      where p.id = athlete_events.user_id and p.public_published = true
    )
  );

-- Nothing is listed yet — this is the starting count, not a problem.
select count(*) as events, count(distinct user_id) as athletes from athlete_events;
