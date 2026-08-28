-- ACTIVATION CHECK — read-only. NOT a migration; nothing here changes data.
--
-- The question this answers is not "how many signups do we have" but "does
-- anyone actually use this". On 2026-08-28 the answer was no: 13 free signups,
-- zero coaches added between them, and every single account's last sign-in was
-- the same day it was created. Nobody had ever come back a second time.
--
-- That finding is why the app now opens on Camps instead of the My Info form,
-- and why pricing and plan limits were left alone — a paywall nobody reaches is
-- not worth tuning.
--
-- Re-run this before drawing any conclusion about pricing, plan limits, upgrade
-- prompts, or ad spend.

-- 1. THE NUMBER THAT MATTERS: did anyone return on a later day than they
--    signed up? One repeat session from a stranger means more than any single
--    sale. If "returned" is 0, activation is still the problem.
select
  count(*)                                                          as accounts,
  count(*) filter (where u.last_sign_in_at::date > u.created_at::date) as returned,
  count(*) filter (where u.last_sign_in_at is null)                 as never_logged_in
from auth.users u;

-- 2. What people actually did, newest first. Emails are masked — unmask only
--    if you're about to write to someone.
select
  left(p.email, 3) || '***'                    as who,
  p.created_at::date                           as signed_up,
  u.last_sign_in_at::date                      as last_seen,
  case when s.status = 'active' then 'PAID' else 'free' end as tier,
  (p.name is not null and p.sport is not null) as filled_profile,
  (select count(*) from coaches    c where c.user_id = p.id) as coaches,
  (select count(*) from user_camps x where x.user_id = p.id) as camps,
  (select count(*) from film       f where f.user_id = p.id) as film
from profiles p
left join auth.users u    on u.id = p.id
left join subscriptions s on s.user_id = p.id
order by p.created_at desc;

-- 3. Email opt-in state, for the newsletter.
select
  count(*) filter (where email_newsletter) as newsletter,
  count(*) filter (where email_reminders)  as reminders,
  count(*)                                 as total
from profiles;
