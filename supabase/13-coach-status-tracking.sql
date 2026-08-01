-- Full Court Press — track when a coach's status last changed, so the
-- roster can show "Contacted 16 days ago — follow up?" instead of nothing.

alter table coaches add column if not exists status_changed_at timestamptz;
