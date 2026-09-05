// Shared helpers for the PUBLIC camp directory pages.
//
// Unlike the questionnaire directory, this one is deliberately partial. The
// verified camp catalogue is the paid tier's headline feature and is gated
// in-app, so camps within WINDOW_DAYS publish complete, with registration
// links — because a page that hides the one link a parent came for converts
// badly and protects little (they can find the school's own page anyway).
//
// Everything after that window publishes as school and date ONLY: no cost, no
// eligibility, no registration link. Those rows used to render nothing at all,
// which cost twice over. Search Console showed these pages earning impressions
// for "<state> basketball camps" and close to zero clicks — Virginia ranked on
// a page holding one camp and 1,448 characters, against competitors listing
// forty. And the gap that was supposed to be the pitch was invisible: a parent
// saw one camp and concluded the catalogue was small rather than gated.
//
// Naming the rest of the season fixes both. Google gets a page that answers
// the query, and the gap becomes specific — thirty-three camps you can see the
// dates of and not the details. The tracking, reminders and outreach stay
// behind the plan regardless.

import { STATE_NAMES, slugify, stateSlugToCode } from './questionnaire-directory';

export { STATE_NAMES, slugify, stateSlugToCode };

export const WINDOW_DAYS = 45;

// Cap on the names-and-dates list. Generous enough that most states publish
// their whole season, low enough that a heavy state doesn't ship a thousand-row
// page. Anything beyond it is summarised as a count.
export const LATER_LIST_MAX = 60;

// Display names only, for sports whose label isn't just the capitalised slug.
// This is NOT an allowlist — sportLabel() falls back to the slug, so adding a
// sport to the catalogue is still a SQL-only change. It was an allowlist once,
// and a lacrosse camp inserted fine but its page 404'd because nobody
// remembered to edit this map.
export const SPORT_LABELS = {
  basketball: 'Basketball',
  baseball: 'Baseball',
  softball: 'Softball',
  volleyball: 'Volleyball',
  tennis: 'Tennis',
  track: 'Track & Field',
  dance: 'Dance',
  soccer: 'Soccer',
  football: 'Football',
  lacrosse: 'Lacrosse',
};

/** Human label for a sport slug; unknown sports get a capitalised slug. */
export function sportLabel(slug) {
  if (SPORT_LABELS[slug]) return SPORT_LABELS[slug];
  const s = (slug || '').replace(/[^a-z0-9]+/gi, ' ').trim();
  return s ? s[0].toUpperCase() + s.slice(1) : '';
}

export const sportKey = (sport) => (sport || '').split('-')[0];
export const genderOf = (sport) => (sport || '').split('-')[1] || '';

export const teamLabel = (g) =>
  g === 'men' ? "Boys" : g === 'women' ? "Girls" : g === 'coed' ? 'Co-ed' : '';

/** YYYY-MM-DD for "today" and the end of the public window, in UTC. */
export function windowRange(now = new Date()) {
  const start = now.toISOString().slice(0, 10);
  const end = new Date(now.getTime() + WINDOW_DAYS * 86400000).toISOString().slice(0, 10);
  return { start, end };
}

export function formatDate(d) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC',
  });
}

/**
 * All future camps, split by how much of each one this page may publish.
 * `upcoming` is inside the window and publishes in full. `later` is everything
 * after it, published as school and date only. `laterCount` is later.length,
 * kept separate so callers can show a total without walking the array.
 */
export async function getCamps(supabase, sportSlug, stateCode) {
  const { start, end } = windowRange();
  const { data } = await supabase
    .from('camps')
    .select('school, camp_name, division, cost, eligibility, city, state, date, type, source_url, sport')
    .eq('state', stateCode)
    .gte('date', start)
    .order('date');
  const all = (data || []).filter((c) => sportKey(c.sport) === sportSlug);
  const later = all.filter((c) => c.date > end);
  return {
    upcoming: all.filter((c) => c.date <= end),
    later,
    laterCount: later.length,
    total: all.length,
  };
}

/** Sport+state combos that have any future camp — the pages worth building. */
export async function campIndex(supabase) {
  const { start } = windowRange();
  const { data } = await supabase
    .from('camps')
    .select('sport, state, date')
    .gte('date', start);
  const map = new Map();
  for (const c of data || []) {
    const s = sportKey(c.sport);
    if (!s || !STATE_NAMES[c.state]) continue;
    const key = `${s}|${c.state}`;
    map.set(key, (map.get(key) || 0) + 1);
  }
  const index = {};
  for (const [key, count] of map) {
    const [sport, state] = key.split('|');
    (index[sport] ||= []).push({ state, count });
  }
  for (const sport of Object.keys(index)) {
    index[sport].sort((a, b) => STATE_NAMES[a.state].localeCompare(STATE_NAMES[b.state]));
  }
  return index;
}
