-- 43-refresh-default-templates.sql
--
-- Rewrites the ten seeded templates in every existing account, but ONLY where
-- the copy is still byte-identical to what it was seeded with. A body that has
-- been edited at all is left exactly as the athlete wrote it — the same rule
-- the {{profile_link}} migration used, which spared one edited copy out of 146.
--
-- What changes: the greeting moves to {{coach_last}} so a coach stored as
-- "Charles Mann Jr." is addressed as "Coach Mann"; subjects lead with class,
-- position and name; {{vitals}} and {{academics}} carry height, school,
-- location, GPA and test scores, all of which the profile already held and no
-- template could reach; the follow-ups now demand a line of actual news; and
-- the visit request finally carries a film link.
--
-- Preview first, apply second, verify third.

-- 1. PREVIEW — how many seeded copies are still untouched
select $nm$Initial Introduction$nm$ as template, count(*) as will_update from templates where name = $nm$Initial Introduction$nm$ and body = $old_b$Hi Coach {{coach_name}},

{{your_name}} — {{grad_year}} {{position}} at {{my_school}}.
Film and stats: {{profile_link}}

I've been following {{school}}'s program and wanted to introduce myself as I begin the recruiting process. I'd welcome any feedback, or a chance to talk about the program.

Thanks for your time,
{{your_name}}$old_b$
union all
select $nm$Follow-up$nm$ as template, count(*) as will_update from templates where name = $nm$Follow-up$nm$ and body = $old_b$Hi Coach {{coach_name}},

Wanted to follow up on my note from a few weeks ago. I'm still very interested in {{school}}, and happy to answer any questions.

Film and stats: {{profile_link}}

Best,
{{your_name}}$old_b$
union all
select $nm$After a Camp or Combine$nm$ as template, count(*) as will_update from templates where name = $nm$After a Camp or Combine$nm$ and body = $old_b$Hi Coach {{coach_name}},

It was great meeting you and the rest of the {{school}} staff this past weekend. I really enjoyed getting a look at how your program runs, and it reinforced my interest.

Film and stats, if it's useful to have in one place: {{profile_link}}

I'd love to stay in touch as I continue the recruiting process — let me know if there's anything else you'd like to see from me.

Thanks again for the time,
{{your_name}}$old_b$
union all
select $nm$Season / Film Update$nm$ as template, count(*) as will_update from templates where name = $nm$Season / Film Update$nm$ and body = $old_b$Hi Coach {{coach_name}},

Wanted to send over updated film from this season along with a quick stat update. I've continued to develop since we last spoke and think it's a good time to check back in on {{school}}.

Film and stats: {{profile_link}}

Let me know if you'd like anything else — box scores, additional clips, or a call.

Best,
{{your_name}}$old_b$
union all
select $nm$Requesting a Visit or Call$nm$ as template, count(*) as will_update from templates where name = $nm$Requesting a Visit or Call$nm$ and body = $old_b$Hi Coach {{coach_name}},

I'm continuing to firm up my recruiting plans and {{school}} remains a program I'm very interested in. Would you have time for a quick call in the next couple of weeks, or would an unofficial visit to campus be possible this season?

Happy to work around your schedule.

Thanks,
{{your_name}}$old_b$
union all
select $nm$Thank You (After a Call or Visit)$nm$ as template, count(*) as will_update from templates where name = $nm$Thank You (After a Call or Visit)$nm$ and body = $old_b$Hi Coach {{coach_name}},

Thank you for taking the time to talk with me / host me at {{school}}. I really appreciated getting to learn more about the program, and it only made me more excited about the possibility of playing there.

Please let me know if there's anything else I can send over.

Best,
{{your_name}}$old_b$
union all
select $nm$After Submitting a Questionnaire$nm$ as template, count(*) as will_update from templates where name = $nm$After Submitting a Questionnaire$nm$ and body = $old_b$Hi Coach {{coach_name}},

I just filled out {{school}}'s recruiting questionnaire and wanted to follow up directly so it doesn't get lost in the pile.

I'm a {{position}} in the class of {{grad_year}} at {{my_school}}, carrying a {{gpa}} GPA.

Film and stats: {{profile_link}}

Happy to send anything else that would help — additional film, a transcript, or my competition schedule.

Thanks for your time,
{{your_name}}$old_b$
union all
select $nm$Transfer Portal — Introduction$nm$ as template, count(*) as will_update from templates where name = $nm$Transfer Portal — Introduction$nm$ and body = $old_b$Hi Coach {{coach_name}},

My name is {{your_name}} and I'm currently at {{my_school}}, exploring a transfer for next season. I've entered the portal and wanted to reach out directly about {{school}}.

A quick summary: I'm a {{position}} with college game film and stats from this past season, and I have eligibility remaining. I'm looking for a program where I can contribute right away.

Film and season numbers: {{profile_link}}

Happy to jump on a call whenever works.

Thanks,
{{your_name}}$old_b$
union all
select $nm$Transfer Portal — Follow-up$nm$ as template, count(*) as will_update from templates where name = $nm$Transfer Portal — Follow-up$nm$ and body = $old_b$Hi Coach {{coach_name}},

Checking back on my note about transferring to {{school}}. I know the portal moves fast, so I wanted to make sure I'm still on your radar.

Film and stats: {{profile_link}}

I'm available for a call this week and can send my academic transcript right away.

Best,
{{your_name}}$old_b$
union all
select $nm$Courtesy Close-out (Committed Elsewhere)$nm$ as template, count(*) as will_update from templates where name = $nm$Courtesy Close-out (Committed Elsewhere)$nm$ and body = $old_b$Hi Coach {{coach_name}},

I wanted to reach out directly to let you know I've decided to commit to another program. I appreciated the time you and your staff invested in getting to know me, and I have a lot of respect for {{school}}'s program.

Thanks again for everything,
{{your_name}}$old_b$;

-- 2. APPLY

-- Initial Introduction
update templates set subject = $new_s${{tagline}} | {{location}}$new_s$,
                     body    = $new_b$Hi Coach {{coach_last}},

{{vitals}}
Film and stats: {{profile_link}}
{{academics}}

[One line on why this program specifically — a style of play, a major, a player you've watched. If you don't have a real one, delete this line. A blank says less than a guess.]

I'd like to be on your list as I go through this process. I can send my schedule if it helps to know where to see me play.

Thanks for your time,
{{your_name}}$new_b$
 where name = $nm$Initial Introduction$nm$
   and body = $old_b$Hi Coach {{coach_name}},

{{your_name}} — {{grad_year}} {{position}} at {{my_school}}.
Film and stats: {{profile_link}}

I've been following {{school}}'s program and wanted to introduce myself as I begin the recruiting process. I'd welcome any feedback, or a chance to talk about the program.

Thanks for your time,
{{your_name}}$old_b$;

-- Follow-up
update templates set subject = $new_s${{tagline}} | Following up$new_s$,
                     body    = $new_b$Hi Coach {{coach_last}},

Following up on my note from a few weeks ago — here's what's changed since:

[What's new: a game, a number, new film, a test score, an event you've added. If nothing has changed, don't send this yet.]

{{vitals}}
Film and stats: {{profile_link}}

Best,
{{your_name}}$new_b$
 where name = $nm$Follow-up$nm$
   and body = $old_b$Hi Coach {{coach_name}},

Wanted to follow up on my note from a few weeks ago. I'm still very interested in {{school}}, and happy to answer any questions.

Film and stats: {{profile_link}}

Best,
{{your_name}}$old_b$;

-- After a Camp or Combine
update templates set subject = $new_s${{tagline}} | {{school}} camp$new_s$,
                     body    = $new_b$Hi Coach {{coach_last}},

Thanks for having me at camp this past weekend. I enjoyed seeing how your program runs, and it reinforced my interest in {{school}}.

[One specific thing from the day — a drill, something a coach said to you, who you matched up against.]

{{vitals}}
Film and stats: {{profile_link}}

Let me know if there's anything else you'd like to see from me.

Thanks again,
{{your_name}}$new_b$
 where name = $nm$After a Camp or Combine$nm$
   and body = $old_b$Hi Coach {{coach_name}},

It was great meeting you and the rest of the {{school}} staff this past weekend. I really enjoyed getting a look at how your program runs, and it reinforced my interest.

Film and stats, if it's useful to have in one place: {{profile_link}}

I'd love to stay in touch as I continue the recruiting process — let me know if there's anything else you'd like to see from me.

Thanks again for the time,
{{your_name}}$old_b$;

-- Season / Film Update
update templates set subject = $new_s${{tagline}} | Updated film$new_s$,
                     body    = $new_b$Hi Coach {{coach_last}},

New film is up, with an updated stat line:

[What the new film shows that the old film didn't.]

{{vitals}}
Film and stats: {{profile_link}}
{{academics}}

Happy to send box scores, full-game footage or my schedule.

Best,
{{your_name}}$new_b$
 where name = $nm$Season / Film Update$nm$
   and body = $old_b$Hi Coach {{coach_name}},

Wanted to send over updated film from this season along with a quick stat update. I've continued to develop since we last spoke and think it's a good time to check back in on {{school}}.

Film and stats: {{profile_link}}

Let me know if you'd like anything else — box scores, additional clips, or a call.

Best,
{{your_name}}$old_b$;

-- Requesting a Visit or Call
update templates set subject = $new_s${{tagline}} | Visit or call request$new_s$,
                     body    = $new_b$Hi Coach {{coach_last}},

{{school}} is one of the programs I'm most interested in, and I'd like to learn more directly.

Would you have time for a short call in the next couple of weeks, or would an unofficial visit be possible this season? I can work around your schedule.

{{vitals}}
Film and stats: {{profile_link}}

Thanks,
{{your_name}}$new_b$
 where name = $nm$Requesting a Visit or Call$nm$
   and body = $old_b$Hi Coach {{coach_name}},

I'm continuing to firm up my recruiting plans and {{school}} remains a program I'm very interested in. Would you have time for a quick call in the next couple of weeks, or would an unofficial visit to campus be possible this season?

Happy to work around your schedule.

Thanks,
{{your_name}}$old_b$;

-- Thank You (After a Call or Visit)
update templates set subject = $new_s${{tagline}} | Thank you$new_s$,
                     body    = $new_b$Hi Coach {{coach_last}},

Thank you for the time today. I appreciated learning more about {{school}}, and it made me more excited about the possibility of playing there.

[One thing from the conversation you want them to remember you brought up.]

Please let me know if there's anything else I can send.

Best,
{{your_name}}$new_b$
 where name = $nm$Thank You (After a Call or Visit)$nm$
   and body = $old_b$Hi Coach {{coach_name}},

Thank you for taking the time to talk with me / host me at {{school}}. I really appreciated getting to learn more about the program, and it only made me more excited about the possibility of playing there.

Please let me know if there's anything else I can send over.

Best,
{{your_name}}$old_b$;

-- After Submitting a Questionnaire
update templates set subject = $new_s${{tagline}} | Questionnaire submitted$new_s$,
                     body    = $new_b$Hi Coach {{coach_last}},

I filled out {{school}}'s recruiting questionnaire and wanted to follow up directly so it doesn't sit in the pile.

{{vitals}}
Film and stats: {{profile_link}}
{{academics}}

Happy to send anything else that would help — more film, a transcript, or my schedule.

Thanks for your time,
{{your_name}}$new_b$
 where name = $nm$After Submitting a Questionnaire$nm$
   and body = $old_b$Hi Coach {{coach_name}},

I just filled out {{school}}'s recruiting questionnaire and wanted to follow up directly so it doesn't get lost in the pile.

I'm a {{position}} in the class of {{grad_year}} at {{my_school}}, carrying a {{gpa}} GPA.

Film and stats: {{profile_link}}

Happy to send anything else that would help — additional film, a transcript, or my competition schedule.

Thanks for your time,
{{your_name}}$old_b$;

-- Transfer Portal — Introduction
update templates set subject = $new_s${{tagline}} | Transfer inquiry$new_s$,
                     body    = $new_b$Hi Coach {{coach_last}},

I'm in the transfer portal and wanted to reach out directly about {{school}}.

{{vitals}}
Film and season numbers: {{profile_link}}
{{academics}}

[One line on what you're looking for and what you'd bring — minutes, a role, a system that fits.]

I have eligibility remaining and can get on a call whenever works.

Thanks,
{{your_name}}$new_b$
 where name = $nm$Transfer Portal — Introduction$nm$
   and body = $old_b$Hi Coach {{coach_name}},

My name is {{your_name}} and I'm currently at {{my_school}}, exploring a transfer for next season. I've entered the portal and wanted to reach out directly about {{school}}.

A quick summary: I'm a {{position}} with college game film and stats from this past season, and I have eligibility remaining. I'm looking for a program where I can contribute right away.

Film and season numbers: {{profile_link}}

Happy to jump on a call whenever works.

Thanks,
{{your_name}}$old_b$;

-- Transfer Portal — Follow-up
update templates set subject = $new_s${{tagline}} | Transfer, following up$new_s$,
                     body    = $new_b$Hi Coach {{coach_last}},

Checking back on my note about {{school}}. The portal moves fast, so I wanted to make sure I'm still on your radar.

[Anything new since — a game, a number, a decision timeline.]

{{vitals}}
Film and stats: {{profile_link}}

I'm available for a call this week and can send my transcript right away.

Best,
{{your_name}}$new_b$
 where name = $nm$Transfer Portal — Follow-up$nm$
   and body = $old_b$Hi Coach {{coach_name}},

Checking back on my note about transferring to {{school}}. I know the portal moves fast, so I wanted to make sure I'm still on your radar.

Film and stats: {{profile_link}}

I'm available for a call this week and can send my academic transcript right away.

Best,
{{your_name}}$old_b$;

-- Courtesy Close-out (Committed Elsewhere)
update templates set subject = $new_s${{tagline}} | Recruiting update$new_s$,
                     body    = $new_b$Hi Coach {{coach_last}},

I wanted to let you know directly that I've committed to another program. I appreciated the time you and your staff spent getting to know me, and I have a lot of respect for {{school}}.

Thanks again for everything,
{{your_name}}$new_b$
 where name = $nm$Courtesy Close-out (Committed Elsewhere)$nm$
   and body = $old_b$Hi Coach {{coach_name}},

I wanted to reach out directly to let you know I've decided to commit to another program. I appreciated the time you and your staff invested in getting to know me, and I have a lot of respect for {{school}}'s program.

Thanks again for everything,
{{your_name}}$old_b$;

-- 3. VERIFY — should be 0; anything left is a copy the athlete edited
select count(*) as still_on_old_greeting
  from templates
 where body like '%Coach {{coach_name}}%';
