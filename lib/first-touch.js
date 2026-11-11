// Where a signup came from.
//
// Until 2026-11-10 the site had no idea: a new account was a row with a
// timestamp, and "did the Instagram post work" was answered by squinting at
// which day the number went up. That is survivable while every post is free.
// It is not survivable the day money goes into an ad, because you cannot tell
// a paid signup from a free one.
//
// HOW IT WORKS, and why it is built this way rather than the usual way.
//
//   1. On the first page of a visit, app/FirstTouch.jsx works out the source
//      (a utm_source tag, else the site that linked here, else the in-app
//      browser it is running in) and keeps it in THIS browser's local storage.
//      Nothing is sent anywhere. A visitor who never signs up is never
//      recorded by us at all.
//   2. When that visitor asks for a sign-in link, app/signin/page.jsx hands
//      the stored source to Supabase with the request. Supabase keeps it on
//      the new account (auth.users.raw_user_meta_data.rg_touch).
//
// No cookie, on purpose. app/layout.js explains why this site runs cookieless
// analytics: it holds names, GPAs and film from minors. This keeps to that. A
// cookie would also be the wrong tool. Sign-in is a magic link, and the link
// is routinely opened in a different browser from the one that asked for it
// (asked in Instagram's in-app browser, opened from the Mail app in Safari).
// A cookie would be lost in exactly the case that matters most. Sending the
// source WITH the request means it is already saved before the email goes out.
//
// Supabase only applies this data while an account is new or unconfirmed. A
// confirmed account that signs in again keeps what it was first given, so a
// returning athlete on a new phone cannot overwrite where they came from.
//
// WHAT IS NEVER STORED: click identifiers (fbclid, gclid and friends are
// noticed, then dropped: they are per-person trackers), full referrer URLs
// (host only), and the address of an athlete's own page (an athlete profile
// is recorded as "athlete-profile", never whose).
//
// No Next imports, so `node scripts/test-first-touch.mjs` can load it.

export const STORAGE_KEY = 'rg-touch';
const SESSION_KEY = 'rg-touch-seen';

/** Lower-case, URL-safe, bounded. Everything stored passes through this. */
export function clean(value, max = 40) {
  return String(value ?? '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9._/-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, max);
}

// Directory sections whose paths are public catalogue pages. Knowing WHICH
// school page or guide brought someone in is the point of recording a landing
// page, and none of these paths names a person.
const DIRECTORY = new Set(['coaches', 'questionnaires', 'camps', 'resources']);
const PLAIN = new Set(['pricing', 'quiz', 'challenge', 'playbook', 'about', 'signin', 'app', 'parent', 'privacy', 'terms', 'outreach', 'unsubscribe', 'auth']);

/** The page a visit started on, with anything personal collapsed. */
export function landingOf(pathname) {
  const parts = String(pathname || '/').split(/[?#]/)[0].split('/').filter(Boolean).map((p) => p.toLowerCase());
  if (!parts.length) return 'home';
  const [first] = parts;
  if (DIRECTORY.has(first)) return clean(parts.slice(0, 4).join('/'), 90);
  if (PLAIN.has(first)) return first;
  if (first === 'f') return 'film-share';
  // /[slug] is an athlete's published page. Record that a profile brought
  // someone in; never record which athlete's.
  return 'athlete-profile';
}

const HOSTS = [
  [/(^|\.)instagram\.com$/, 'instagram', 'social'],
  [/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/, 'facebook', 'social'],
  [/^mail\.google\.com$/, 'email', 'email'],
  [/(^|\.)google\.[a-z.]{2,6}$/, 'google', 'search'],
  [/(^|\.)bing\.com$/, 'bing', 'search'],
  [/(^|\.)duckduckgo\.com$/, 'duckduckgo', 'search'],
  [/(^|\.)yahoo\.com$/, 'yahoo', 'search'],
  [/(^|\.)skool\.com$/, 'skool', 'community'],
  [/(^|\.)(t\.co|twitter\.com|x\.com)$/, 'x', 'social'],
  [/(^|\.)tiktok\.com$/, 'tiktok', 'social'],
  [/(^|\.)(youtube\.com|youtu\.be)$/, 'youtube', 'social'],
  [/(^|\.)linktr\.ee$/, 'linktree', 'social'],
];
const MEDIUM_FOR = Object.fromEntries(HOSTS.map(([, src, med]) => [src, med]));

function hostOf(url) {
  try { return new URL(url).hostname.toLowerCase().replace(/^www\./, ''); } catch { return ''; }
}

/**
 * One visit's source.
 * @param {object} o
 * @param {string} [o.search]     location.search
 * @param {string} [o.referrer]   document.referrer
 * @param {string} [o.pathname]   location.pathname
 * @param {string} [o.userAgent]
 * @param {string} [o.selfHost]   location.hostname, so our own pages are not a "referrer"
 * @param {Date}   [o.now]
 * @returns {{src:string, med?:string, camp?:string, cont?:string, ref?:string, land:string, at:string}}
 */
export function touchFrom({ search = '', referrer = '', pathname = '/', userAgent = '', selfHost = '', now = new Date() } = {}) {
  const q = new URLSearchParams(search || '');
  const refHost = hostOf(referrer);
  const self = String(selfHost || '').toLowerCase().replace(/^www\./, '');
  const external = refHost && refHost !== self ? refHost : '';

  let src = '';
  let med = '';

  const utm = clean(q.get('utm_source'));
  if (utm) {
    src = utm;
    med = clean(q.get('utm_medium')) || MEDIUM_FOR[utm] || '';
  } else if (q.has('gclid') || q.has('gbraid') || q.has('wbraid')) {
    src = 'google'; med = 'paid';
  } else if (q.has('msclkid')) {
    src = 'bing'; med = 'paid';
  } else if (q.has('ttclid')) {
    src = 'tiktok'; med = 'paid';
  } else if (external) {
    const known = HOSTS.find(([re]) => re.test(external));
    src = known ? known[1] : clean(external, 60);
    med = known ? known[2] : 'referral';
  } else if (q.has('fbclid')) {
    // Meta adds this to every outbound tap, paid or not, from Facebook and
    // Instagram alike. It says "Meta" and nothing finer.
    src = 'meta'; med = 'social';
  } else if (/Instagram/i.test(userAgent)) {
    // The link in an Instagram bio opens in Instagram's own browser and often
    // arrives with no referrer at all. The browser itself gives it away.
    src = 'instagram'; med = 'social';
  } else if (/FBAN|FBAV|FB_IAB/i.test(userAgent)) {
    src = 'facebook'; med = 'social';
  } else if (/TikTok|musical_ly|Bytedance/i.test(userAgent)) {
    src = 'tiktok'; med = 'social';
  } else {
    src = 'direct';
  }

  const touch = { src, land: landingOf(pathname), at: now.toISOString().slice(0, 10) };
  if (med) touch.med = med;
  const camp = clean(q.get('utm_campaign'), 60);
  if (camp) touch.camp = camp;
  const cont = clean(q.get('utm_content'), 60);
  if (cont) touch.cont = cont;
  if (external) touch.ref = clean(external, 60);
  return touch;
}

/** True when the URL itself carries a tag or a click id (worth re-reading mid-visit). */
export function isTagged(search = '') {
  const q = new URLSearchParams(search || '');
  return ['utm_source', 'gclid', 'gbraid', 'wbraid', 'msclkid', 'ttclid', 'fbclid'].some((k) => q.has(k));
}

function tidy(t) {
  if (!t || typeof t !== 'object') return null;
  const src = clean(t.src);
  if (!src) return null;
  const out = { src, land: clean(t.land, 90) || 'home', at: /^\d{4}-\d\d-\d\d$/.test(t.at || '') ? t.at : '' };
  for (const [k, max] of [['med', 40], ['camp', 60], ['cont', 60], ['ref', 60]]) {
    const v = clean(t[k], max);
    if (v) out[k] = v;
  }
  if (!out.at) delete out.at;
  return out;
}

/**
 * Fold one visit into what is already stored.
 *   first: the very first visit on this browser, never replaced.
 *   last:  the most recent visit that actually came FROM somewhere. A later
 *          direct visit does not erase it, which is what lets an ad take
 *          credit for someone who first wandered in untagged.
 * Stored values are re-cleaned on the way through: local storage is the
 * visitor's to edit, and whatever is in it ends up on an account.
 */
export function mergeTouch(stored, touch) {
  const out = {};
  const first = tidy(stored?.first) || tidy(touch);
  if (first) out.first = first;
  const last = touch && touch.src !== 'direct' ? tidy(touch) : tidy(stored?.last);
  if (last) out.last = last;
  return out;
}

/** "instagram / bio", "google / search", "direct". Empty when nothing was recorded. */
export function sourceLabel(rgTouch) {
  const t = rgTouch?.last?.src ? rgTouch.last : rgTouch?.first;
  if (!t?.src) return '';
  const src = clean(t.src);
  const med = clean(t.med);
  return med ? `${src} / ${med}` : src;
}

/** Count accounts per source, biggest first. Accounts with nothing stored are "not recorded". */
export function tallySources(touches) {
  const counts = new Map();
  for (const t of touches || []) {
    const label = sourceLabel(t) || 'not recorded';
    counts.set(label, (counts.get(label) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

// ---------------------------------------------------------------------------
// Browser side. Both are safe to call anywhere: they do nothing on the server
// and swallow storage errors (private windows, blocked storage).

/** Read this page load into local storage. Returns what is now stored, or null. */
export function captureTouch() {
  if (typeof window === 'undefined') return null;
  try {
    let stored = null;
    try { stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) || 'null'); } catch { stored = null; }
    // Once per visit, not once per page: inside Instagram's browser EVERY page
    // looks like it came from Instagram, and re-reading each one would turn
    // "landed on" into "last looked at". A tagged URL is always worth reading.
    const seen = window.sessionStorage.getItem(SESSION_KEY) === '1';
    if (seen && stored?.first && !isTagged(window.location.search)) return stored;
    const touch = touchFrom({
      search: window.location.search,
      referrer: document.referrer,
      pathname: window.location.pathname,
      userAgent: navigator.userAgent,
      selfHost: window.location.hostname,
    });
    const next = mergeTouch(stored, touch);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    try { window.sessionStorage.setItem(SESSION_KEY, '1'); } catch {}
    return next;
  } catch {
    return null;
  }
}

/** What to send with a sign-in link request, or null. */
export function touchForSignup() {
  const stored = captureTouch();
  const out = mergeTouch(stored, null);
  return out.first ? out : null;
}
