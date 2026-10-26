-- Where athletes stop. One row per stage, newest cohort first.
--
-- Replaces the August activation check, which ended at "added a coach".
-- Publishing moved from 2 to 9 between September and late October, so the
-- question is no longer whether people set up an account — it is whether a
-- coach ever hears from them, and whether that coach opens anything.
--
-- Read it top to bottom and find the first row where the number collapses.
-- That is the only thing worth building for. Everything below a collapse is
-- starved of traffic, not broken.

with athletes as (
  select p.id,
         p.created_at,
         p.name is not null and p.sport is not null            as has_profile,
         coalesce(p.public_published, false)                   as published,
         (select count(*) from coaches c where c.user_id = p.id)                              as coaches,
         (select count(*) from coaches c where c.user_id = p.id
            and c.last_emailed_at is not null)                                                as emailed,
         (select count(*) from coaches c where c.user_id = p.id
            and c.link_first_opened_at is not null)                                           as opened,
         (select count(*) from film f where f.user_id = p.id)                                 as film,
         (select count(*) from user_camps uc where uc.user_id = p.id)                         as camps,
         p.challenge_started_at is not null                    as started_challenge,
         (select max(u.last_sign_in_at) from auth.users u where u.id = p.id)                  as last_seen
  from profiles p
)
select
  count(*)                                                        as "1 accounts",
  count(*) filter (where has_profile)                             as "2 name + sport",
  count(*) filter (where published)                               as "3 published",
  count(*) filter (where coaches > 0)                             as "4 added a coach",
  count(*) filter (where emailed > 0)                             as "5 emailed a coach",
  count(*) filter (where opened > 0)                              as "6 coach opened it",
  count(*) filter (where film > 0)                                as "7 added film",
  count(*) filter (where camps > 0)                               as "8 saved a camp",
  count(*) filter (where started_challenge)                       as "9 started challenge",
  count(*) filter (where last_seen::date > created_at::date)      as "10 came back later"
from athletes;
