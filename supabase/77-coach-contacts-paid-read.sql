-- RecruitGrid - coach_contacts is read by paid accounts, and by every
-- account that existed before the Coach Finder shipped
--
-- The roster suggestion (the card under the email field) stays free for
-- everyone and does NOT depend on this policy: app/api/coach-suggest reads
-- the table through the service role after checking the session. This
-- policy gates DIRECT reads, which is what the Coach Finder is — searching
-- every coach in a sport by state and division — and what a free account
-- could otherwise do from the browser console. Same lesson as
-- supabase/21: a limit that lives only in JavaScript is not a limit.
--
-- Grandfathering: every account created before 2026-11-11 keeps full read
-- access. Those 41 families were told on 2026-11-10 that all of it works on
-- the free plan, and that stays true for them. Only accounts created from
-- 2026-11-11 need a paid plan for the finder.

drop policy if exists "signed-in athletes can read coach contacts" on coach_contacts;

create policy "paid or founding athletes can read coach contacts"
  on coach_contacts for select to authenticated
  using (
    fcp_is_paid_or_trial()
    or exists (
      select 1 from profiles p
      where p.id = auth.uid()
        and (p.is_owner or p.created_at < timestamptz '2026-11-11 00:00:00+00')
    )
  );

notify pgrst, 'reload schema';

-- ============================================================
-- VERIFY
-- ============================================================
-- Signed in as an account created 2026-11-11 or later with no subscription:
--   select count(*) from coach_contacts;   -- 0, no error
-- Signed in as any account created before 2026-11-11:
--   select count(*) from coach_contacts;   -- 75,000+
-- The roster card keeps working for both; it never used this policy.
