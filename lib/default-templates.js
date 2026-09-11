// The 10 starter templates every new account is seeded with.
//
// Several of these used to promise "my film and results are below" and then
// end at the sign-off, because there was nothing to put there — a coach read
// "below", scrolled, and found a signature. {{profile_link}} resolves to the
// athlete's public profile, so the promise is now kept.
//
// It fills in blank until that profile is published, which is deliberate: an
// empty line beats sending a coach a slug that 404s. See profileForTags.
//
// Placement follows the advice the weekly newsletter gives — name, grad year,
// position, link, in the first two lines, because recruiting mail is read on a
// phone between meetings and anything under a paragraph does not get watched.
// A product that tells people to lead with the link should ship templates
// that do.
//
// Three things about the current set, all learned from reading a real plan a
// parent had written for their own kid:
//
//   - The greeting is {{coach_last}}, not {{coach_name}}. Coaches are addressed
//     by surname, and the name field gets typed as "Charles Mann Jr." as often
//     as "Mann". "Hi Coach Charles Mann Jr." reads as a mail merge on the one
//     line a cold email cannot afford to.
//   - Subjects lead with class, position and name, because that is how a coach
//     searches an inbox, and because a phone truncates a subject around forty
//     characters. "interested in {{school}}" was spending those characters to
//     tell the recipient which school they coach.
//   - The bracketed lines are deliberate. A template cannot know why an athlete
//     wants a particular programme, and boilerplate in that slot ("I have been
//     following your program") is the tell that the mail went to two hundred
//     people. An obvious blank asking for one true sentence beats a fluent lie,
//     and the sentence around it still reads as a complete email if deleted.
export const DEFAULT_TEMPLATES = [
  {
    id: 't_intro',
    name: 'Initial Introduction',
    subject: '{{tagline}} | {{location}}',
    body: `Hi Coach {{coach_last}},

{{vitals}}
Season: {{stat_line}}
Film and stats: {{profile_link}}
{{academics}}

[One line on why this program specifically — a style of play, a major, a player you've watched. If you don't have a real one, delete this line. A blank says less than a guess.]

I'd like to be on your list as I go through this process. I can send my schedule if it helps to know where to see me play.

Thanks for your time,
{{your_name}}`,
  },
  {
    id: 't_followup',
    name: 'Follow-up',
    subject: '{{tagline}} | Following up',
    body: `Hi Coach {{coach_last}},

Following up on my note from a few weeks ago — here's what's changed since:

[What's new: a game, a number, new film, a test score, an event you've added. If nothing has changed, don't send this yet.]

{{vitals}}
Film and stats: {{profile_link}}

Best,
{{your_name}}`,
  },
  {
    id: 't_camp',
    name: 'After a Camp or Combine',
    subject: '{{tagline}} | {{school}} camp',
    body: `Hi Coach {{coach_last}},

Thanks for having me at camp this past weekend. I enjoyed seeing how your program runs, and it reinforced my interest in {{school}}.

[One specific thing from the day — a drill, something a coach said to you, who you matched up against.]

{{vitals}}
Film and stats: {{profile_link}}

Let me know if there's anything else you'd like to see from me.

Thanks again,
{{your_name}}`,
  },
  {
    id: 't_film_update',
    name: 'Season / Film Update',
    subject: '{{tagline}} | Updated film',
    body: `Hi Coach {{coach_last}},

New film is up, with an updated stat line:

[What the new film shows that the old film didn't.]

{{vitals}}
Season: {{stat_line}}
Film and stats: {{profile_link}}
{{academics}}

Happy to send box scores, full-game footage or my schedule.

Best,
{{your_name}}`,
  },
  {
    id: 't_visit_request',
    name: 'Requesting a Visit or Call',
    subject: '{{tagline}} | Visit or call request',
    body: `Hi Coach {{coach_last}},

{{school}} is one of the programs I'm most interested in, and I'd like to learn more directly.

Would you have time for a short call in the next couple of weeks, or would an unofficial visit be possible this season? I can work around your schedule.

{{vitals}}
Film and stats: {{profile_link}}

Thanks,
{{your_name}}`,
  },
  {
    id: 't_thankyou',
    name: 'Thank You (After a Call or Visit)',
    subject: '{{tagline}} | Thank you',
    body: `Hi Coach {{coach_last}},

Thank you for the time today. I appreciated learning more about {{school}}, and it made me more excited about the possibility of playing there.

[One thing from the conversation you want them to remember you brought up.]

Please let me know if there's anything else I can send.

Best,
{{your_name}}`,
  },
  {
    id: 't_questionnaire',
    name: 'After Submitting a Questionnaire',
    subject: '{{tagline}} | Questionnaire submitted',
    body: `Hi Coach {{coach_last}},

I filled out {{school}}'s recruiting questionnaire and wanted to follow up directly so it doesn't sit in the pile.

{{vitals}}
Season: {{stat_line}}
Film and stats: {{profile_link}}
{{academics}}

Happy to send anything else that would help — more film, a transcript, or my schedule.

Thanks for your time,
{{your_name}}`,
  },
  {
    id: 't_transfer',
    name: 'Transfer Portal — Introduction',
    subject: '{{tagline}} | Transfer inquiry',
    body: `Hi Coach {{coach_last}},

I'm in the transfer portal and wanted to reach out directly about {{school}}.

{{vitals}}
Season: {{stat_line}}
Film and season numbers: {{profile_link}}
{{academics}}

[One line on what you're looking for and what you'd bring — minutes, a role, a system that fits.]

I have eligibility remaining and can get on a call whenever works.

Thanks,
{{your_name}}`,
  },
  {
    id: 't_transfer_followup',
    name: 'Transfer Portal — Follow-up',
    subject: '{{tagline}} | Transfer, following up',
    body: `Hi Coach {{coach_last}},

Checking back on my note about {{school}}. The portal moves fast, so I wanted to make sure I'm still on your radar.

[Anything new since — a game, a number, a decision timeline.]

{{vitals}}
Film and stats: {{profile_link}}

I'm available for a call this week and can send my transcript right away.

Best,
{{your_name}}`,
  },
  {
    id: 't_close',
    name: 'Courtesy Close-out (Committed Elsewhere)',
    subject: '{{tagline}} | Recruiting update',
    body: `Hi Coach {{coach_last}},

I wanted to let you know directly that I've committed to another program. I appreciated the time you and your staff spent getting to know me, and I have a lot of respect for {{school}}.

Thanks again for everything,
{{your_name}}`,
  },
];

import { statLine } from './stat-fields';

// A coach is addressed by surname: "Coach Mann", never "Coach Charles Mann Jr."
// Names get typed in every shape — "Mann", "Charles Mann", "Charles Mann Jr." —
// so take the last word that is not a suffix, and fall back to whatever was
// entered rather than producing an empty greeting.
const SUFFIXES = new Set(['jr', 'jr.', 'sr', 'sr.', 'ii', 'iii', 'iv', 'v']);
export function coachLastName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  while (parts.length > 1 && SUFFIXES.has(parts[parts.length - 1].toLowerCase())) parts.pop();
  return parts.length ? parts[parts.length - 1] : '';
}

// Composite tags are assembled from whatever the athlete has actually filled
// in. A template that writes out "{{height}} · {{gpa}} GPA" renders " ·  GPA"
// for a profile missing both, so the joining happens here instead, where empty
// parts can simply be dropped.
const join = (parts, sep) => parts.map((x) => String(x || '').trim()).filter(Boolean).join(sep);

// Removes the wreckage a blank tag leaves behind: a label with nothing after
// it, a dangling separator, doubled spaces, a pile of blank lines.
function tidy(str) {
  return String(str || '')
    .split('\n')
    .filter((line) => !/^\s*[A-Za-z][A-Za-z ,'&/-]*:\s*$/.test(line))
    .join('\n')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]*[|·—-]\s*$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function fillMergeTags(str, coach, profile) {
  const location  = join([profile?.school_city, profile?.school_state], ', ');
  const tagline   = join([profile?.grad_year, profile?.position, profile?.name], ' ');
  const vitals    = join([
    join([profile?.grad_year, profile?.position], ' '),
    profile?.height,
    profile?.school,
    location,
  ], ' · ');
  const academics = join([
    profile?.gpa ? profile.gpa + ' GPA' : '',
    profile?.test_scores,
    profile?.intended_major ? 'Intended major: ' + profile.intended_major : '',
  ], ' · ');

  return tidy((str || '')
    .replaceAll('{{coach_name}}', coach?.name || '')
    .replaceAll('{{coach_last}}', coachLastName(coach?.name))
    .replaceAll('{{school}}', coach?.school || '')
    .replaceAll('{{sport}}', profile?.sport || coach?.sport || '')
    .replaceAll('{{your_name}}', profile?.name || '')
    .replaceAll('{{grad_year}}', profile?.grad_year || '')
    .replaceAll('{{position}}', profile?.position || '')
    .replaceAll('{{height}}', profile?.height || '')
    .replaceAll('{{gpa}}', profile?.gpa || '')
    .replaceAll('{{ncaa_id}}', profile?.ncaa_id || '')
    .replaceAll('{{my_school}}', profile?.school || '')
    .replaceAll('{{profile_link}}', profile?.profile_link || '')
    .replaceAll('{{location}}', location)
    .replaceAll('{{club_team}}', profile?.club_team || '')
    .replaceAll('{{key_stats}}', profile?.key_stats || '')
    .replaceAll('{{tagline}}', tagline)
    .replaceAll('{{vitals}}', vitals)
    .replaceAll('{{academics}}', academics)
    .replaceAll('{{stat_line}}', statLine(profile?.sport, profile?.stats)));
}
