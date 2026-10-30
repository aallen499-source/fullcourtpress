-- 69-cron-heartbeat.sql
--
-- One row per scheduled job, holding the last time it finished. The daily
-- dispatcher writes its own row at the end of every run; the health check
-- reads it and shouts if it has gone stale.
--
-- Why this is needed: until now the health check ran INSIDE the daily cron, as
-- the last job in the fan-out. So it could tell you the database was down or
-- the camp directory was empty, but it could never tell you the cron itself
-- had stopped — because if the cron stops, the check stops with it and the
-- silence looks exactly like good news. The watchdog was locked in the room it
-- was guarding.
--
-- The fix is two crons rather than one (Vercel's Hobby plan allows two and we
-- were using one), and a heartbeat so the second one can see whether the first
-- is alive. That is the whole purpose of this table.
--
-- Deliberately tiny and deliberately not a log. It answers one question — when
-- did this job last finish — and a job that runs daily forever still only ever
-- has one row. Nothing here needs pruning.
--
-- RUN THIS BEFORE THE CODE DEPLOYS. The dispatcher's write is wrapped in a
-- try/catch so deploying first cannot break the daily email run, and the
-- health check treats a missing row as "not known yet" rather than as an
-- alarm, so neither order causes a false alert. Running it first just means
-- the monitoring starts working a day earlier.

create table if not exists cron_runs (
  job          text primary key,
  last_run_at  timestamptz not null default now(),
  last_status  text,
  detail       jsonb
);

-- No policies and RLS on, which denies every browser request by design. Only
-- the service role touches this, and the service role bypasses RLS. A table
-- with RLS enabled and no policy is the safest possible default: if a client
-- key is ever pointed at it by mistake, it reads nothing rather than
-- everything.
alter table cron_runs enable row level security;

comment on table cron_runs is
  'Heartbeat for scheduled jobs. Written by /api/cron/daily, read by /api/cron/health to detect that the daily cron has stopped running.';
