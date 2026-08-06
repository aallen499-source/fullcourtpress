-- RecruitGrid — log when a coach was last emailed
--
-- Distinct from status_changed_at (13), which tracks any status change. This
-- records specifically "an email went out," so the roster can show
-- "Emailed 9d ago" and, later, drive a "no reply in 3 weeks — follow up?"
-- nudge that's about outreach rather than a status label.
--
-- We don't send the email — the athlete does, from their own mail app (see the
-- mailto compose flow). This just records that they took the send action, so
-- the CRM stays honest without any Gmail integration or tracking pixels.

alter table coaches add column if not exists last_emailed_at timestamptz;

-- ============================================================
-- VERIFY
-- ============================================================
--   select count(*) as coaches,
--          count(last_emailed_at) as with_email_logged
--     from coaches;
