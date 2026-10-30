-- NEW SIGNUP CHECK — read-only. NOT a migration; nothing here changes data.
--
-- Run this after someone new signs up, to answer "did it actually work for
-- them" rather than "did the number go up". activation-check.sql looks at the
-- whole population and asks whether anybody comes back; this looks at one
-- person's first few days and asks whether anything is broken for them.
--
-- The failure it exists to catch: there is no database trigger creating a
-- profile row. The app upserts one when the account first loads the workspace,
-- so somebody can sign up, bounce off a confirmation email or an error, and
-- leave an auth.users row with no profile attached. That account is invisible
-- to every other query in this folder, because they all start FROM profiles.
-- Query 1 starts from auth.users for that reason. Nothing else here will.
--
-- Emails are masked. Unmask only if you are about to write to someone.

-- 0. THE ONE TO RUN. Everything below this, one row per account, because the
--    Supabase SQL editor shows you only the last result set when you paste
--    several queries at once — so five good queries pasted together look like
--    one. Run this on its own; drop to the numbered sections when something in
--    it looks wrong and you want the detail.
select
  left(coalesce(u.email, p.email, p.login_email), 3) || '***' as who,
  u.created_at                                       as signed_up,
  u.last_sign_in_at                                  as last_seen,
  case
    when p.id is null                 then 'BROKEN — no profile row, signup did not complete'
    when u.email_confirmed_at is null then 'BROKEN — never confirmed their email'
    when u.last_sign_in_at is null    then 'BROKEN — confirmed but never signed in'
    when p.unsubscribe_token is null  then 'BROKEN — no unsubscribe token, their emails have no opt-out'
    else 'account ok'
  end                                                as account,
  case
    when p.id is null              then '(nothing — never reached the workspace)'
    when p.name is null            then 'stopped before adding their name'
    when p.sport is null           then 'stopped before choosing a sport'
    when p.grad_year is null       then 'stopped before grad year'
    when p.position is null        then 'stopped before position'
    when not coalesce(p.public_published, false) then 'filled it in, has not published'
    else 'published'
  end                                                as got_as_far_as,
  (select count(*) from coaches    c where c.user_id = p.id) as coaches,
  (select count(*) from coaches    c where c.user_id = p.id
     and c.status <> 'not_contacted')                as contacted,
  (select count(*) from film       f where f.user_id = p.id) as film,
  (select count(*) from user_camps x where x.user_id = p.id) as camps,
  case
    when p.id is null                        then 'nothing will send — no profile row'
    when coalesce(p.public_published, false) then 'published, so setup nudges stopped — correct'
    when p.setup_nudge1_at is not null       then 'setup nudge 1 sent ' || p.setup_nudge1_at::date
    else 'setup nudge 1 due ' || (u.created_at::date + 3)
  end                                                as next_email
from auth.users u
left join profiles p on p.id = u.id
where u.created_at > now() - interval '7 days'
order by u.created_at desc;

-- 1. INTEGRITY: every account from the last 7 days, including any that never
--    got a profile row. "no profile row" means they never reached the
--    workspace — that is a broken signup, not a quiet user.
select
  left(u.email, 3) || '***'                         as who,
  u.created_at                                      as signed_up,
  u.email_confirmed_at is not null                  as confirmed,
  u.last_sign_in_at                                 as last_seen,
  case
    when p.id is null                 then 'NO PROFILE ROW — signup did not complete'
    when u.email_confirmed_at is null then 'never confirmed their email'
    when u.last_sign_in_at is null    then 'confirmed but never signed in'
    else 'ok'
  end                                               as status
from auth.users u
left join profiles p on p.id = u.id
where u.created_at > now() - interval '7 days'
order by u.created_at desc;

-- 2. HOW FAR THEY GOT. Each column is one step of the setup the app asks for,
--    in order. The first `false` is where they stopped, and that is the thing
--    worth fixing or nudging about.
select
  left(coalesce(p.email, p.login_email), 3) || '***' as who,
  p.created_at::date                                 as signed_up,
  coalesce(p.role, '(none)')                         as role,
  p.name is not null                                 as has_name,
  p.sport is not null                                as has_sport,
  p.grad_year is not null                            as has_grad_year,
  p.position is not null                             as has_position,
  (select count(*) from film       f where f.user_id = p.id) as film,
  coalesce(p.public_published, false)                as published,
  (select count(*) from coaches    c where c.user_id = p.id) as coaches,
  (select count(*) from coaches    c where c.user_id = p.id
     and c.status <> 'not_contacted')                as coaches_contacted,
  (select count(*) from user_camps x where x.user_id = p.id) as camps
from profiles p
where p.created_at > now() - interval '7 days'
order by p.created_at desc;

-- 3. CAN WE EMAIL THEM. unsubscribe_token is the one that bites silently: the
--    CAN-SPAM footer builds its unsubscribe link from it, so a null token
--    means that account's emails either break or go out without a working
--    opt-out. It should never be null.
select
  left(coalesce(p.email, p.login_email), 3) || '***' as who,
  p.unsubscribe_token is not null                    as can_unsubscribe,
  p.email_product_updates                            as product_updates,
  p.email_reminders                                  as reminders,
  p.email_newsletter                                 as newsletter,
  p.parent_email is not null                         as parent_invited,
  p.parent_confirmed_at is not null                  as parent_confirmed
from profiles p
where p.created_at > now() - interval '7 days'
order by p.created_at desc;

-- 4. WHICH ACTIVATION EMAILS HAVE FIRED, and what is due next. The three
--    streams run on their own clocks: setup nudges count from the signup,
--    first-email nudges count from the PUBLISH, and the challenge counts from
--    whenever they started it. So a brand-new account showing nothing here is
--    correct, not broken — the first setup nudge is three days out.
select
  left(coalesce(p.email, p.login_email), 3) || '***' as who,
  p.created_at::date                                 as signed_up,
  p.setup_nudge1_at::date                            as setup_1,
  p.setup_nudge2_at::date                            as setup_2,
  p.published_at::date                               as published,
  p.first_email_nudge1_at::date                      as first_email_1,
  p.first_email_nudge2_at::date                      as first_email_2,
  p.challenge_started_at::date                       as challenge_started,
  p.challenge_day                                    as challenge_day,
  case
    when coalesce(p.public_published, false) then 'published — setup nudges stopped, correctly'
    when p.setup_nudge1_at is not null       then 'first setup nudge sent'
    else 'setup nudge 1 due ' || (p.created_at::date + 3)
  end                                                as next_up
from profiles p
where p.created_at > now() - interval '7 days'
order by p.created_at desc;

-- 5. BILLING, if they are on anything. A free account has no row here and that
--    is normal — an empty result is the expected result.
select
  left(coalesce(p.email, p.login_email), 3) || '***' as who,
  s.status,
  s.current_period_end
from profiles p
join subscriptions s on s.user_id = p.id
where p.created_at > now() - interval '7 days';

-- 6. WHY DIDN'T A NUDGE SEND. Run this when section 0 says a setup nudge was
--    due on a date that has already passed and the account still shows none
--    sent. app/api/cron/setup-nudges skips an account for five different
--    reasons and records none of them, so from the outside a correct skip and
--    a broken send look identical. This prints the reason.
--
--    The last branch is the one worth knowing about: the job looks the address
--    up in auth.users and, if it finds nothing, does `continue` — no error, no
--    failure logged, nothing written. It then returns sent:0 with an empty
--    failures list, which reads as success.
select
  left(coalesce(u.email, p.email, p.login_email), 3) || '***' as who,
  p.created_at::date                                 as signed_up,
  (p.created_at::date + 3)                           as nudge_was_due,
  case
    when p.role = 'coach'               then 'skipped on purpose — coach account, these only go to athletes'
    when p.email_product_updates = false then 'skipped on purpose — they turned off update emails'
    when p.challenge_started_at is not null
         and coalesce(p.email_challenge, true)
         and coalesce(p.challenge_day, 0) < 7
                                        then 'skipped on purpose — mid 7-day challenge, day ' || coalesce(p.challenge_day, 0)
    when p.setup_nudge2_at is not null  then 'skipped — already had the second nudge, that is the last one'
    when u.email is null                then 'SILENTLY DROPPED — no address in auth.users, the job skips without logging'
    when p.unsubscribe_token is null    then 'would send with a broken unsubscribe link — fix the token'
    else 'nothing is stopping it — the job did not run, or Resend rejected it'
  end                                                as why
from profiles p
left join auth.users u on u.id = p.id
where coalesce(p.public_published, false) = false
  and p.setup_nudge1_at is null
  and p.created_at::date + 3 <= current_date
order by p.created_at desc;

-- 7. SIGNUPS THAT NEVER COMPLETED. An auth.users row with no profile. Tells
--    you whether they never confirmed the email (the link expired, went to
--    spam, or they changed their mind) or confirmed and still never arrived,
--    which would be the app failing them rather than the email.
select
  left(u.email, 3) || '***'            as who,
  u.created_at                         as signed_up,
  u.email_confirmed_at                 as confirmed,
  u.last_sign_in_at                    as ever_signed_in,
  case
    when u.email_confirmed_at is null then 'never clicked the confirmation link'
    else 'confirmed, then never reached the workspace — look at this one'
  end                                  as what_happened
from auth.users u
left join profiles p on p.id = u.id
where p.id is null
order by u.created_at desc;
