-- Full Court Press — track whether an expiration-reminder email has
-- already gone out for a subscription's current period, so a daily cron
-- job doesn't email someone every day for a week straight.

alter table subscriptions add column if not exists reminder_sent_at timestamptz;
