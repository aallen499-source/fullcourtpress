-- SIGNUP SOURCE CHECK. Read-only. NOT a migration; nothing here changes data.
--
-- Where new accounts came from, since source tracking shipped on 2026-11-10.
-- The source is sent with the sign-in link request (lib/first-touch.js) and
-- Supabase keeps it on the auth account, so these read auth.users, not
-- profiles. An account from before that date shows as "(not recorded)".
--
-- "source" is the most recent place a visitor came FROM before signing up
-- (a tagged link, a search engine, Instagram's in-app browser), falling back
-- to their very first visit. "direct" means they typed the address or used a
-- link that carries no trace, which is what most email and text links look
-- like.
--
-- Run ONE query at a time. The SQL editor shows only the last result when
-- several are pasted together.

-- 1. THE ONE TO RUN. Signups and paying accounts by source.
--    An ad pays for itself when (ad spend / signed_up) is under about $7.
select
  coalesce(nullif(u.raw_user_meta_data #>> '{rg_touch,last,src}', ''),
           nullif(u.raw_user_meta_data #>> '{rg_touch,first,src}', ''),
           '(not recorded)')                                    as source,
  coalesce(nullif(u.raw_user_meta_data #>> '{rg_touch,last,med}', ''),
           nullif(u.raw_user_meta_data #>> '{rg_touch,first,med}', ''),
           '')                                                  as medium,
  coalesce(nullif(u.raw_user_meta_data #>> '{rg_touch,last,camp}', ''),
           nullif(u.raw_user_meta_data #>> '{rg_touch,first,camp}', ''),
           '')                                                  as campaign,
  count(*)                                                      as asked_for_a_link,
  count(*) filter (where u.email_confirmed_at is not null)      as signed_up,
  count(*) filter (where s.status = 'active')                   as paying
from auth.users u
left join subscriptions s on s.user_id = u.id
where u.created_at >= timestamptz '2026-11-11 00:00:00+00'
group by 1, 2, 3
order by signed_up desc, asked_for_a_link desc;

-- 2. Which page people landed on first. School pages show as
--    coaches/<school>, guides as resources/<guide>. An athlete's own page is
--    only ever "athlete-profile", never whose.
-- select
--   coalesce(nullif(u.raw_user_meta_data #>> '{rg_touch,first,land}', ''), '(not recorded)') as first_page,
--   count(*) filter (where u.email_confirmed_at is not null) as signed_up
-- from auth.users u
-- where u.created_at >= timestamptz '2026-11-11 00:00:00+00'
-- group by 1
-- order by signed_up desc;

-- 3. One ad campaign at a time: replace the campaign name.
-- select
--   count(*) filter (where u.email_confirmed_at is not null) as signed_up,
--   count(*) filter (where s.status = 'active')              as paying
-- from auth.users u
-- left join subscriptions s on s.user_id = u.id
-- where u.raw_user_meta_data #>> '{rg_touch,last,camp}' = 'three-things-nov';
