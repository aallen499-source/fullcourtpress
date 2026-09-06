-- RecruitGrid — record that someone opened the app installed
--
-- There is no server-side signal for a PWA install. The browser tells the page
-- it is running standalone and nothing else; nobody is notified when an icon
-- lands on a home screen. So the app stamps this the first time the dashboard
-- loads in standalone mode.
--
-- That makes this "has opened it as an installed app", not "has installed it",
-- which is the more useful number anyway — an install nobody opens is not worth
-- counting, and it is opens that push notifications depend on.
--
-- Why it exists at all: the install prompt and the push toggle are a funnel,
-- and without both numbers a zero is ambiguous. Nobody installing and everybody
-- installing but refusing notifications need completely different fixes.

alter table profiles add column if not exists installed_at timestamptz;

-- ============================================================
-- VERIFY
-- ============================================================
--   select count(*) as profiles,
--          count(installed_at) as opened_installed
--     from profiles;
