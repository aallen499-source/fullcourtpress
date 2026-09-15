// Recruiting guides — public, indexable pages at /guides.
//
// Written for parents and athletes searching a real question, and for
// RecruitGrid's own families (the account menu links here).
//
// House rules for what goes in a guide, same spirit as lib/newsletter-tips.js:
// - Craft over rules. How to write, what to send, when to follow up stays
//   true. Rules differ by sport, division and year; where one is unavoidable,
//   state only what we're sure of and point to the official source.
// - No invented numbers ("coaches get 1,000 emails a day"), no guarantees.
// - Name the athlete's own work, not a service doing it for them.
// - Every guide ends with the RecruitGrid step that matches it.
//
// Block types: p, list (items), example (title + text, rendered as a copyable
// email), note (a callout).

export const GUIDES = [
  {
    slug: 'how-to-email-a-college-coach',
    title: 'How to Email a College Coach (With an Example)',
    description:
      'What to put in the subject line and first two lines, the one personal sentence that gets read, when to follow up, and a sample email you can adapt.',
    updated: '2026-09-15',
    readMinutes: 6,
    shortAnswer:
      'Keep it short. Put your grad year, position, height, school and a film link in the first two lines. Add one real reason you like their program. Send it from your own email, then follow up every three to four weeks with something new.',
    sections: [
      {
        heading: 'Before you write: pick the right coach',
        blocks: [
          { type: 'p', text: 'Start with the coach most likely to read it. At larger programs that is often an assistant or recruiting coordinator; at smaller schools the head coach handles recruiting too. The athletics website’s staff directory lists every coach with an email address.' },
          { type: 'list', items: [
            'Write to one coach at each school, not the whole staff.',
            'Use the coach’s name — “Coach Reyes,” never “Dear Coach.”',
            'Send it from the athlete’s own email account, one they actually check. Parents can help draft, but coaches want to hear from the player.',
          ] },
        ],
      },
      {
        heading: 'The subject line',
        blocks: [
          { type: 'p', text: 'A coach decides whether to open your email from the subject line alone, often on a phone. Make it the facts they sort by:' },
          { type: 'example', title: 'Subject line examples', text: '2028 PG · 6\'2" · Durango HS (Las Vegas, NV)\n2028 PG · 6\'2" | Coming to your October 10 camp\n2028 PG · 6\'2" | New film from this weekend' },
        ],
      },
      {
        heading: 'The first two lines do most of the work',
        blocks: [
          { type: 'p', text: 'Many coaches will read only the top of your email before deciding whether to watch film. So lead with who you are and the link — not a paragraph about how much you admire the program.' },
          { type: 'list', items: [
            'Grad year, position, height, high school and city.',
            'A link to your film or recruiting profile. A link, not an attachment — attachments get filtered and take up space in their inbox.',
            'Your season stats and GPA on the next line, if you have them.',
          ] },
        ],
      },
      {
        heading: 'One personal line — or none',
        blocks: [
          { type: 'p', text: 'Add one sentence about why this program: a style of play that fits you, a major they offer, a game of theirs you watched. It is the line that shows you are not sending the same note to fifty schools.' },
          { type: 'note', text: 'If you don’t have a real reason yet, leave the line out. A blank says less than something generic like “I’ve always admired your program.”' },
        ],
      },
      {
        heading: 'A sample email',
        blocks: [
          { type: 'example', title: 'Example', text: 'Subject: 2028 PG · 6\'2" · Durango HS (Las Vegas, NV)\n\nHi Coach Reyes,\n\n2028 PG · 6\'2" · Durango High School · Las Vegas, NV\nJunior season: 14.2 ppg, 5.1 apg · 3.4 GPA\nFilm and profile: recruitgrid.app/your-name\n\nI like how your guards push the pace in transition — that’s where I play best.\n\nI’d like to be on your list as I go through the process. I can send my fall league schedule if it helps to see me play in person.\n\nThanks for your time,\nYour Name\n(702) 555-0123' },
          { type: 'p', text: 'That is about 90 words. A coach can read it in the time it takes to decide whether to click the film — which is the whole point.' },
        ],
      },
      {
        heading: 'What to leave out',
        blocks: [
          { type: 'list', items: [
            'A long life story. Save it for when a coach asks.',
            'Every award since middle school. Pick the one or two that matter.',
            'Attachments, including your transcript — offer to send it if they’re interested.',
            'The same email to the whole list with only the name changed. Coaches can tell.',
          ] },
        ],
      },
      {
        heading: 'After you send it',
        blocks: [
          { type: 'p', text: 'No reply to a first email is normal, and it is not a no. Coaches are busy, and at many levels there are dates before which a coach isn’t allowed to answer a recruit personally — though they can still read your email.' },
          { type: 'list', items: [
            'Follow up every three to four weeks, and only when there is something new: fresh film, updated stats, your season schedule, or a camp you’ll be at.',
            'Reply within a day or two when a coach does write back, even if the answer is “not right now.”',
            'If a school hasn’t answered after a few updates over several months, put more of your energy into the schools that are answering.',
          ] },
          { type: 'note', text: 'Contact rules differ by sport and division and change over time. Before relying on a date, check the NCAA Eligibility Center or ask the school’s compliance office.' },
        ],
      },
    ],
    sources: [
      { label: 'NCAA Eligibility Center', url: 'https://web3.ncaa.org/ecwr3/' },
    ],
    cta: {
      title: 'Do this in RecruitGrid',
      text: 'Find each coach’s email from their staff directory, fill in your details automatically, write one personal email after another, and see when a coach opens your profile.',
      button: 'Start free',
      href: '/app',
    },
  },
];

// Planned, listed on /guides so families know what's coming. Not linked.
export const UPCOMING_GUIDES = [
  'When can college coaches contact you?',
  'D1, D2, D3, NAIA or JUCO: what’s the difference?',
  'Are prospect camps and showcases worth it?',
  'Your recruiting timeline, grade by grade',
  'Recruiting questionnaires: what they are and why to fill them out',
];

export const guideBySlug = (slug) => GUIDES.find((g) => g.slug === slug) || null;
