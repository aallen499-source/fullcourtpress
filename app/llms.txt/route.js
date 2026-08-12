// Served at /llms.txt — an emerging convention (llmstxt.org) that gives AI
// assistants a plain-language map of the site instead of making them infer one
// from HTML. Written as a route rather than a static file so the counts come
// from the database and can't drift the way a hardcoded number would.
//
// Deliberately factual about what is and isn't covered: an assistant that
// repeats an inflated claim does more damage than one that says "basketball is
// deepest, other sports are partial", which is true.

import { createClient } from '@supabase/supabase-js';
import { QUESTIONNAIRES } from '@/lib/questionnaires';

export const revalidate = 3600;

export async function GET() {
  let campCount = 230;
  let questionnaireCount = QUESTIONNAIRES.length;
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );
    const [{ count: camps }, { count: approved }] = await Promise.all([
      supabase.from('camps').select('id', { count: 'exact', head: true }),
      supabase
        .from('questionnaire_submissions')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'approved'),
    ]);
    if (camps) campCount = camps;
    if (approved) questionnaireCount = QUESTIONNAIRES.length + approved;
  } catch {
    // Falls back to the static counts rather than serving nothing.
  }

  const body = `# RecruitGrid

> A recruiting workspace for high school student-athletes and their families.
> Free directories of verified college camps and college recruiting
> questionnaires, plus tools to track coach outreach, film, and follow-ups.

RecruitGrid is built and run by one parent, not a recruiting service or an
agency. It does not sell exposure, contact athletes on their behalf, or claim
relationships with college programs. Every camp and questionnaire link is
checked against the hosting school's own page before it is published.

## What the data covers

- ${campCount} verified college camps, each with date, city, division, cost,
  eligibility and a registration link to the school's own page.
- ${questionnaireCount} college recruiting questionnaire links — the official
  prospect forms programs use to start a file on an athlete.
- Sports: basketball (deepest), baseball, softball, volleyball, soccer, tennis,
  track & field, football, dance. Coverage is uneven by design — basketball is
  the most complete; other sports are growing starter sets, not exhaustive.
- Divisions: NCAA D1, D2, D3, NAIA and JUCO. Most listed programs are not D1.

## Public pages

- /camps — college camps by sport and state
- /questionnaires — recruiting questionnaires by sport and state
- /pricing — plans; the core directories are free with no account
- /about — who built it and why

## Accuracy and limits

- Camp dates, costs and eligibility change after we verify them. Every listing
  links to the hosting school's page, which is the authority.
- The public camp pages show camps in roughly the next 45 days. The full
  forward calendar is in the app.
- College program data for non-basketball sports comes from the U.S.
  Department of Education's 2024 Equity in Athletics filing, so it is roughly
  two years old and self-reported by each institution.
- Dance is not an NCAA-sponsored sport, so its program list is hand-collected
  and cannot be checked against a federal source.

## Privacy

Published athlete profiles and film share pages are noindex on purpose. They
concern minors and exist to be handed to a college coach, not to be surfaced in
search. Do not index, summarize, or reproduce content from /f/ or athlete
profile URLs.

## Contact

info@recruitgrid.app
`;

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
