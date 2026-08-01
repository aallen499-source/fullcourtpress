-- Full Court Press — fix Stripe payments not linking to accounts
--
-- The bug: the Stripe webhook matches a paid checkout back to an app user
-- by looking up profiles.email. But My Info lets athletes set a different
-- "contact email" for outreach, which overwrites that same profiles.email
-- column (see app/auth/callback/route.js's comment on why sign-in doesn't
-- reset it). So a real payment — checked out with the athlete's real login
-- email — silently fails to match anyone once their contact email diverges,
-- and the webhook does nothing: no error, no subscription row, no "paid"
-- status.
--
-- Fix: a separate, immutable login_email column set once at signup from
-- the real Supabase auth email, never touched by My Info. The webhook
-- matches against this instead.

alter table profiles add column if not exists login_email text;

-- Backfill existing rows from the real auth email, not the possibly-edited
-- contact email.
update profiles p
set login_email = u.email
from auth.users u
where p.id = u.id and p.login_email is null;

-- ============================================================
-- VERIFY BEFORE RELYING ON THIS
-- ============================================================
-- select id, email, login_email from profiles limit 20;
-- Confirm login_email is populated for existing accounts, and that any row
-- where email and login_email differ is a case of a customized contact
-- email (expected), not a data problem.
