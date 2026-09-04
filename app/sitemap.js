// Served at /sitemap.xml by Next.js.
//
// Marketing pages plus the public questionnaire directory. Athlete profiles and
// film share links are deliberately absent — they are noindex, and listing them
// here would be handing a crawler the exact URLs we just asked it to skip.
//
// The directory pages are generated from the data, so a new sport or state
// appears in the sitemap the moment it has rows — no edit here.

import { createClient } from '@supabase/supabase-js';
import { STATE_NAMES, slugify, getAllQuestionnaires, directoryIndex, schoolIndex } from '@/lib/questionnaire-directory';
import { campIndex } from '@/lib/camp-directory';

const SITE = 'https://recruitgrid.app';

export const revalidate = 3600;

export default async function sitemap() {
  const now = new Date();
  const base = [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/questionnaires`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/camps`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  let pages = [];
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      { auth: { persistSession: false } }
    );
    const rows = await getAllQuestionnaires(supabase);

    // Per-school pages. Higher priority than the sport/state pages because
    // they match how people actually search — "iowa state football recruiting
    // questionnaire" rather than a sport-and-state combination — and because
    // nothing else on the site links to all 242 of them.
    for (const slug of Object.keys(schoolIndex(rows))) {
      pages.push({
        url: `${SITE}/questionnaires/school/${slug}`,
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.8,
      });
    }

    const index = directoryIndex(rows);
    for (const sport of Object.keys(index)) {
      for (const { state } of index[sport]) {
        pages.push({
          url: `${SITE}/questionnaires/${slugify(sport)}/${slugify(STATE_NAMES[state])}`,
          lastModified: now,
          changeFrequency: 'monthly',
          priority: 0.7,
        });
      }
    }
    // Camp pages change as dates roll past, so they get a weekly cadence.
    const camps = await campIndex(supabase);
    for (const sport of Object.keys(camps)) {
      for (const { state } of camps[sport]) {
        pages.push({
          url: `${SITE}/camps/${sport}/${slugify(STATE_NAMES[state])}`,
          lastModified: now,
          changeFrequency: 'weekly',
          priority: 0.8,
        });
      }
    }
  } catch {
    // A sitemap missing the directory beats a build that fails on a fetch.
  }

  return [...base, ...pages];
}
