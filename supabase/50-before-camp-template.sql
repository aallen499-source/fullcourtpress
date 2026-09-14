-- 50-before-camp-template.sql
--
-- Adds the Before a Camp or Showcase template to every account that already
-- has its templates. New accounts get it from lib/default-templates.js.
--
-- Same guard as 48: accounts with no templates at all are skipped, because the
-- app seeds the defaults only when an account has ZERO templates, and one row
-- dropped into an empty account would stop the rest ever being seeded.

insert into templates (user_id, name, subject, body)
select p.id,
       $nm$Before a Camp or Showcase$nm$,
       $sub${{tagline}} | Coming to camp$sub$,
       $body$Hi Coach {{coach_last}},

I'm registered for [camp name] on [date], and wanted to introduce myself before I get there.

{{vitals}}
Season: {{stat_line}}
Film and stats: {{profile_link}}
{{academics}}

[One thing to watch for — a part of your game you'll show, or something you'd like feedback on. Delete it if you don't have a real one.]

I'm looking forward to competing in front of your staff.

Thanks for your time,
{{your_name}}$body$
from profiles p
where exists (select 1 from templates t where t.user_id = p.id)
on conflict (user_id, name) do nothing;

-- Expect the two numbers to match.
select
  (select count(distinct user_id) from templates) as accounts_with_templates,
  (select count(*) from templates where name = $nm$Before a Camp or Showcase$nm$) as have_before_camp;
