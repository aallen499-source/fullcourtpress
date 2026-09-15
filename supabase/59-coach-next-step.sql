-- 59-coach-next-step.sql
--
-- A next step on a coach: a date and a short note — "Jan 15: register for
-- camp, email Coach first". The status says where a coach stands; this says
-- what to do and when, which is what gets lost over a seven-month gap.
--
-- The roster shows it (gold when close, red when past), the Sunday parent
-- update lists what's coming due, and on the day the athlete gets an email
-- (app/api/cron/next-steps). next_step_reminded_at stops that email repeating;
-- setting a new date clears it so the new date gets its own reminder.
--
-- RUN THIS BEFORE THE CODE DEPLOYS — the coach form writes these columns.

alter table coaches add column if not exists next_step_on date;
alter table coaches add column if not exists next_step_note text;
alter table coaches add column if not exists next_step_reminded_at timestamptz;

create index if not exists coaches_next_step_on_idx on coaches (next_step_on) where next_step_on is not null;

select count(*) as coaches, count(next_step_on) as with_next_step from coaches;
