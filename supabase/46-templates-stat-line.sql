-- 46-templates-stat-line.sql
--
-- Adds "Season: {{stat_line}}" to the four templates that promise numbers, so
-- a coach sees the stat line in the email body rather than only behind the
-- profile link. {{stat_line}} is assembled in lib/stat-fields.js from the
-- season stats now stored on the profile — "14.2 PPG · 6.1 RPG · 48% FG".
--
-- An athlete who has filled in no stats sends exactly what they sent before:
-- the label-only line is stripped at render time, so nothing appears. Run 45
-- first; without the stats column the tag resolves empty for everyone.
--
-- Same exact-body rule as always: a template the athlete has edited will not
-- match and will not be touched.

-- Initial Introduction
update templates set body = $b$Hi Coach {{coach_last}},

{{vitals}}
Season: {{stat_line}}
Film and stats: {{profile_link}}
{{academics}}

[One line on why this program specifically — a style of play, a major, a player you've watched. If you don't have a real one, delete this line. A blank says less than a guess.]

I'd like to be on your list as I go through this process. I can send my schedule if it helps to know where to see me play.

Thanks for your time,
{{your_name}}$b$
 where name = $nm$Initial Introduction$nm$
   and body = $ob$Hi Coach {{coach_last}},

{{vitals}}
Film and stats: {{profile_link}}
{{academics}}

[One line on why this program specifically — a style of play, a major, a player you've watched. If you don't have a real one, delete this line. A blank says less than a guess.]

I'd like to be on your list as I go through this process. I can send my schedule if it helps to know where to see me play.

Thanks for your time,
{{your_name}}$ob$;

-- Season / Film Update
update templates set body = $b$Hi Coach {{coach_last}},

New film is up, with an updated stat line:

[What the new film shows that the old film didn't.]

{{vitals}}
Season: {{stat_line}}
Film and stats: {{profile_link}}
{{academics}}

Happy to send box scores, full-game footage or my schedule.

Best,
{{your_name}}$b$
 where name = $nm$Season / Film Update$nm$
   and body = $ob$Hi Coach {{coach_last}},

New film is up, with an updated stat line:

[What the new film shows that the old film didn't.]

{{vitals}}
Film and stats: {{profile_link}}
{{academics}}

Happy to send box scores, full-game footage or my schedule.

Best,
{{your_name}}$ob$;

-- After Submitting a Questionnaire
update templates set body = $b$Hi Coach {{coach_last}},

I filled out {{school}}'s recruiting questionnaire and wanted to follow up directly so it doesn't sit in the pile.

{{vitals}}
Season: {{stat_line}}
Film and stats: {{profile_link}}
{{academics}}

Happy to send anything else that would help — more film, a transcript, or my schedule.

Thanks for your time,
{{your_name}}$b$
 where name = $nm$After Submitting a Questionnaire$nm$
   and body = $ob$Hi Coach {{coach_last}},

I filled out {{school}}'s recruiting questionnaire and wanted to follow up directly so it doesn't sit in the pile.

{{vitals}}
Film and stats: {{profile_link}}
{{academics}}

Happy to send anything else that would help — more film, a transcript, or my schedule.

Thanks for your time,
{{your_name}}$ob$;

-- Transfer Portal — Introduction
update templates set body = $b$Hi Coach {{coach_last}},

I'm in the transfer portal and wanted to reach out directly about {{school}}.

{{vitals}}
Season: {{stat_line}}
Film and season numbers: {{profile_link}}
{{academics}}

[One line on what you're looking for and what you'd bring — minutes, a role, a system that fits.]

I have eligibility remaining and can get on a call whenever works.

Thanks,
{{your_name}}$b$
 where name = $nm$Transfer Portal — Introduction$nm$
   and body = $ob$Hi Coach {{coach_last}},

I'm in the transfer portal and wanted to reach out directly about {{school}}.

{{vitals}}
Film and season numbers: {{profile_link}}
{{academics}}

[One line on what you're looking for and what you'd bring — minutes, a role, a system that fits.]

I have eligibility remaining and can get on a call whenever works.

Thanks,
{{your_name}}$ob$;

-- Should equal the number of accounts times four.
select count(*) as carrying_stat_line
  from templates
 where body like '%{{stat_line}}%';
