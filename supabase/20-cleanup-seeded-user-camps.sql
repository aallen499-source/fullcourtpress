-- Full Court Press — clear out the old per-user camp copies
--
-- Before 19-shared-camps.sql, every athlete got their own private copy of
-- all 65 seeded camps in user_camps. Now that the catalog lives in the
-- shared `camps` table, those copies are duplicates: an existing account
-- sees its 65 old rows in "my camps" AND the same camps again in "Browse
-- All Camps".
--
-- This removes ONLY the untouched ones. A row is deleted when all of:
--   * camp_id is null       -> predates the Track button (a tracked camp
--                              always records which catalog row it came from)
--   * status = 'considering'-> never moved to registered/attended
--   * no linked coaches     -> never connected to anyone on their roster
--   * name matches a catalog entry -> actually one of the seeded ones, not
--                              a camp the athlete typed in themselves
--
-- So anything an athlete actually engaged with survives, and so does every
-- camp they added by hand. Deliberately conservative: leaving a stray
-- duplicate is annoying, deleting someone's real tracking data is not.

-- Have a look before deleting:
-- select count(*) from user_camps uc
-- where uc.camp_id is null
--   and uc.status = 'considering'
--   and coalesce(array_length(uc.coach_ids, 1), 0) = 0
--   and exists (select 1 from camps c
--               where uc.name = concat_ws(' — ', c.school, c.camp_name));

delete from user_camps uc
where uc.camp_id is null
  and uc.status = 'considering'
  and coalesce(array_length(uc.coach_ids, 1), 0) = 0
  and exists (
    select 1 from camps c
    where uc.name = concat_ws(' — ', c.school, c.camp_name)
  );

-- ============================================================
-- VERIFY
-- ============================================================
-- select count(*) from user_camps;
-- Should drop by roughly 64 per existing account. Anything remaining is
-- either a camp with a real status, one linked to a coach, one the athlete
-- added themselves, or one tracked from the new catalog.
