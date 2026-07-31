-- Full Court Press — track trial start server-side
-- Run after 01 through 07.
--
-- Adding this column with a default of now() means every existing profile
-- row gets "trial starts today" the moment this runs, and every new sign-up
-- gets it automatically at profile creation (the /auth/callback insert
-- doesn't need to change — it just inherits the column default).

alter table profiles add column if not exists trial_started_at timestamptz default now();
