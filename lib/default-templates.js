// Same 10 starter templates seeded in the local-storage app
// (public/recruitgrid-app.html's defaultTemplates()). Read-only here
// until Templates gets its own Supabase table + editing UI.
export const DEFAULT_TEMPLATES = [
  {
    id: 't_intro',
    name: 'Initial Introduction',
    subject: '{{your_name}} — Class of {{grad_year}}, interested in {{school}}',
    body: `Hi Coach {{coach_name}},

My name is {{your_name}}, and I'm a {{grad_year}} grad playing {{sport}}. I've been following {{school}}'s program and wanted to introduce myself as I begin the recruiting process.

My film and results are below, and I'd welcome any feedback or a chance to talk about the program.

Thanks for your time,
{{your_name}}`,
  },
  {
    id: 't_followup',
    name: 'Follow-up',
    subject: 'Following up — {{your_name}}',
    body: `Hi Coach {{coach_name}},

Wanted to follow up on my note from a few weeks ago. I'm still very interested in {{school}} and happy to send over updated film or answer any questions.

Best,
{{your_name}}`,
  },
  {
    id: 't_camp',
    name: 'After a Camp or Combine',
    subject: 'Great meeting the {{school}} staff — {{your_name}}',
    body: `Hi Coach {{coach_name}},

It was great meeting you and the rest of the {{school}} staff this past weekend. I really enjoyed getting a look at how your program runs, and it reinforced my interest.

I'd love to stay in touch as I continue the recruiting process — let me know if there's anything else you'd like to see from me.

Thanks again for the time,
{{your_name}}`,
  },
  {
    id: 't_film_update',
    name: 'Season / Film Update',
    subject: 'Updated film — {{your_name}}, {{grad_year}}',
    body: `Hi Coach {{coach_name}},

Wanted to send over updated film from this season along with a quick stat update. I've continued to develop since we last spoke and think it's a good time to check back in on {{school}}.

Let me know if you'd like anything else — box scores, additional clips, or a call.

Best,
{{your_name}}`,
  },
  {
    id: 't_visit_request',
    name: 'Requesting a Visit or Call',
    subject: 'Requesting a call or visit — {{your_name}}',
    body: `Hi Coach {{coach_name}},

I'm continuing to firm up my recruiting plans and {{school}} remains a program I'm very interested in. Would you have time for a quick call in the next couple of weeks, or would an unofficial visit to campus be possible this season?

Happy to work around your schedule.

Thanks,
{{your_name}}`,
  },
  {
    id: 't_thankyou',
    name: 'Thank You (After a Call or Visit)',
    subject: 'Thank you — {{your_name}}',
    body: `Hi Coach {{coach_name}},

Thank you for taking the time to talk with me / host me at {{school}}. I really appreciated getting to learn more about the program, and it only made me more excited about the possibility of playing there.

Please let me know if there's anything else I can send over.

Best,
{{your_name}}`,
  },
  {
    id: 't_questionnaire',
    name: 'After Submitting a Questionnaire',
    subject: 'Questionnaire submitted — {{your_name}}, {{grad_year}}',
    body: `Hi Coach {{coach_name}},

I just filled out {{school}}'s recruiting questionnaire and wanted to follow up directly so it doesn't get lost in the pile.

I'm a {{position}} in the class of {{grad_year}} at {{my_school}}, carrying a {{gpa}} GPA. My film and results are linked below.

Happy to send anything else that would help — additional film, a transcript, or my competition schedule.

Thanks for your time,
{{your_name}}`,
  },
  {
    id: 't_transfer',
    name: 'Transfer Portal — Introduction',
    subject: 'Transfer inquiry — {{your_name}}, {{position}}',
    body: `Hi Coach {{coach_name}},

My name is {{your_name}} and I'm currently at {{my_school}}, exploring a transfer for next season. I've entered the portal and wanted to reach out directly about {{school}}.

A quick summary: I'm a {{position}} with college game film and stats from this past season, and I have eligibility remaining. I'm looking for a program where I can contribute right away.

Film and season numbers are below. Happy to jump on a call whenever works.

Thanks,
{{your_name}}`,
  },
  {
    id: 't_transfer_followup',
    name: 'Transfer Portal — Follow-up',
    subject: 'Following up — {{your_name}}, transfer {{position}}',
    body: `Hi Coach {{coach_name}},

Checking back on my note about transferring to {{school}}. I know the portal moves fast, so I wanted to make sure I'm still on your radar.

I'm available for a call this week and can send updated film or my academic transcript right away.

Best,
{{your_name}}`,
  },
  {
    id: 't_close',
    name: 'Courtesy Close-out (Committed Elsewhere)',
    subject: 'Update on my recruiting process — {{your_name}}',
    body: `Hi Coach {{coach_name}},

I wanted to reach out directly to let you know I've decided to commit to another program. I appreciated the time you and your staff invested in getting to know me, and I have a lot of respect for {{school}}'s program.

Thanks again for everything,
{{your_name}}`,
  },
];

export function fillMergeTags(str, coach, profile) {
  return (str || '')
    .replaceAll('{{coach_name}}', coach?.name || '')
    .replaceAll('{{school}}', coach?.school || '')
    .replaceAll('{{sport}}', profile?.sport || coach?.sport || '')
    .replaceAll('{{your_name}}', profile?.name || '')
    .replaceAll('{{grad_year}}', profile?.grad_year || '')
    .replaceAll('{{position}}', profile?.position || '')
    .replaceAll('{{height}}', profile?.height || '')
    .replaceAll('{{gpa}}', profile?.gpa || '')
    .replaceAll('{{ncaa_id}}', profile?.ncaa_id || '')
    .replaceAll('{{my_school}}', profile?.school || '');
}
