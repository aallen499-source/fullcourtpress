-- 57-game-invite-template.sql
--
-- Adds the Invite to a Game template to every account that already has its
-- templates. New accounts get it from lib/default-templates.js.
--
-- Same guard as 48 and 50: accounts with no templates are skipped, because the
-- app seeds the defaults only when an account has ZERO templates.

insert into templates (user_id, name, subject, body)
select p.id,
       $nm$Invite to a Game$nm$,
       $sub${{tagline}} | Game schedule$sub$,
       $body$Hi Coach {{coach_last}},

I'd like to invite you to see me play in person. My next games:

[Date, time, opponent and gym address for each game — for example: Fri Dec 5, 7:00pm vs. Bishop Gorman, Durango HS gym, Las Vegas]

{{vitals}}
Season: {{stat_line}}
Jersey: {{jersey}}
Film and stats: {{profile_link}}
{{academics}}

If you're able to make one, I'd appreciate a heads-up so I can send you a roster.

Thanks for your time,
{{your_name}}$body$
from profiles p
where exists (select 1 from templates t where t.user_id = p.id)
on conflict (user_id, name) do nothing;

-- Expect the two numbers to match.
select
  (select count(distinct user_id) from templates) as accounts_with_templates,
  (select count(*) from templates where name = $nm$Invite to a Game$nm$) as have_game_invite;
