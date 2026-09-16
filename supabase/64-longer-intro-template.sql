-- 64-longer-intro-template.sql
--
-- Adds "Initial Introduction (longer)" to every account that already has its
-- templates. New accounts get it from lib/default-templates.js.
--
-- Same guard as 48, 50 and 57: accounts with no templates are skipped, because
-- the app seeds the defaults only when an account has ZERO templates.

insert into templates (user_id, name, subject, body)
select p.id,
       $nm$Initial Introduction (longer)$nm$,
       $sub${{tagline}} | {{location}}$sub$,
       $body$Hi Coach {{coach_last}},

My name is {{your_name}}, a {{grad_year}} {{position}} at {{my_school}} in {{location}}. I'm reaching out as I start the recruiting process.

{{vitals}}
Season: {{stat_line}}
Film and stats: {{profile_link}}
{{academics}}

[One line on the kind of player you are — how you'd describe your game to someone who hasn't seen you.]

[One line on why this program specifically — a style of play, a major, a player you've watched. If you don't have a real one, delete this line. A blank says less than a guess.]

I'd like to be on your list as I go through this process, and I'm happy to send my schedule if it helps to know where to see me play.

Thanks for your time,
{{your_name}}$body$
from profiles p
where exists (select 1 from templates t where t.user_id = p.id)
on conflict (user_id, name) do nothing;

-- Expect the two numbers to match.
select
  (select count(distinct user_id) from templates) as accounts_with_templates,
  (select count(*) from templates where name = $nm$Initial Introduction (longer)$nm$) as have_longer_intro;
