// Shared helpers for the PUBLIC camp directory pages.
//
// Unlike the questionnaire directory, this one is deliberately partial. The
// verified camp catalogue is the paid tier's headline feature and is gated
// in-app, so these pages publish only camps happening within WINDOW_DAYS —
// complete, with registration links, because a page that hides the one link a
// parent came for converts badly and protects little (they can find the
// school's own page anyway). The rest of the season, and all the tracking,
// stays behind the plan. The gap between what's shown and what exists is the
// pitch, and it's stated honestly on the page.

import { STATE_NAMES, slugify, stateSlugToCode } from './questionnaire-directory';

export { STATE_NAMES, slugify, stateSlugToCode };

export const WINDOW_DAYS = 45;

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
};

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
 * All camps, split into what this page may publish and what it may only count.
 * `upcoming` is inside the window; `laterCount` is everything after it, which
 * becomes the "+ N more this season" line that argues for signing up.
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
  return {
    upcoming: all.filter((c) => c.date <= end),
    laterCount: all.filter((c) => c.date > end).length,
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
