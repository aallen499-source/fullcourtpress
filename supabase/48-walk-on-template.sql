-- 48-walk-on-template.sql
--
-- Adds the Walk-On Inquiry template to every account that already has its
-- templates. New accounts get it automatically: it is now one of the eleven
-- in lib/default-templates.js, seeded on first load.
--
-- Deliberately skips accounts with no templates at all. The app only seeds
-- the defaults when an account has ZERO templates, so dropping this one row
-- into an empty account would stop the other ten ever being seeded.
--
-- on conflict (user_id, name) do nothing — safe to run twice, and it never
-- touches an athlete who already made a template with this name.

insert into templates (user_id, name, subject, body)
select p.id,
       $nm$Walk-On Inquiry$nm$,
       $sub${{tagline}} | Walk-on interest$sub$,
       $body$Hi Coach {{coach_last}},

I'd like to be considered for a walk-on spot at {{school}}.

{{vitals}}
Season: {{stat_line}}
Film and stats: {{profile_link}}
{{academics}}

[Where you are with admissions — applied, admitted, or applying by a specific date. Walk-ons are admitted like any other student, so this is the first thing a coach needs.]

[One line on the role you'd take — a position you can add depth at, or being a practice player. Delete it if you don't have a real one.]

Is there a walk-on tryout, or anything I should do now to be considered?

Thanks for your time,
{{your_name}}$body$
from profiles p
where exists (select 1 from templates t where t.user_id = p.id)
on conflict (user_id, name) do nothing;

-- Check: every account that has templates should now have this one.
-- Expect the two numbers to match.
select
  (select count(distinct user_id) from templates) as accounts_with_templates,
  (select count(*) from templates where name = $nm$Walk-On Inquiry$nm$) as have_walk_on;
