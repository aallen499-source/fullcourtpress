-- Full Court Press — fix duplicate email templates
--
-- The default-templates seeding logic checked "does this user have zero
-- templates?" then inserted a full set if not — a classic check-then-act
-- race. If that load ran twice in close succession (React can
-- double-invoke effects), both checks could pass before either insert
-- landed, seeding two complete sets of the 10 default templates.
--
-- This removes existing duplicates (keeping the oldest copy of each
-- (user_id, name) pair) and adds a unique constraint so it can't happen
-- again — the app now upserts with ignoreDuplicates instead of inserting.

delete from templates a using templates b
where a.user_id = b.user_id
  and a.name = b.name
  and a.created_at > b.created_at;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'templates_user_name_unique') then
    alter table templates add constraint templates_user_name_unique unique (user_id, name);
  end if;
end $$;

-- ============================================================
-- VERIFY
-- ============================================================
-- select user_id, name, count(*) from templates group by user_id, name having count(*) > 1;
-- Should return zero rows once this has run.
