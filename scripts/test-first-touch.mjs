import { clean, landingOf, touchFrom, isTagged, mergeTouch, sourceLabel, tallySources } from '../lib/first-touch.js';

let failures = 0;
const ok = (label, cond, detail = '') => {
  console.log(`  ${cond ? 'ok  ' : 'FAIL'}   ${label}${cond || !detail ? '' : `   (${detail})`}`);
  if (!cond) failures++;
};
const group = (t) => console.log(t);
const NOW = new Date('2026-11-10T20:00:00Z');
const t = (o) => touchFrom({ selfHost: 'recruitgrid.app', now: NOW, ...o });

group('source: a tag wins, then a click id, then the referrer, then the in-app browser');
{
  const bio = t({ search: '?utm_source=Instagram&utm_medium=Bio', referrer: 'https://l.instagram.com/' });
  ok('utm_source and utm_medium are kept, lower-cased', bio.src === 'instagram' && bio.med === 'bio', JSON.stringify(bio));
  const ad = t({ search: '?utm_source=instagram&utm_medium=paid&utm_campaign=Three Things Nov&utm_content=v1' });
  ok('campaign and content are cleaned', ad.camp === 'three-things-nov' && ad.cont === 'v1' && ad.med === 'paid', JSON.stringify(ad));
  ok('a known source with no medium gets its usual one', t({ search: '?utm_source=skool' }).med === 'community');
  ok('gclid means a Google ad', t({ search: '?gclid=abc123' }).src === 'google' && t({ search: '?gclid=abc123' }).med === 'paid');
  ok('the click id itself is never stored', !JSON.stringify(t({ search: '?gclid=SECRET123&fbclid=ALSOSECRET' })).toLowerCase().includes('secret'));
  ok('Google search by referrer', t({ referrer: 'https://www.google.com/' }).src === 'google' && t({ referrer: 'https://www.google.co.uk/' }).med === 'search');
  ok('Instagram link shim by referrer', t({ referrer: 'https://l.instagram.com/?u=x' }).src === 'instagram');
  ok('Skool by referrer', t({ referrer: 'https://www.skool.com/recruitgrid-families-7705' }).src === 'skool');
  ok('Gmail is email, not search', t({ referrer: 'https://mail.google.com/mail/u/0/' }).src === 'email');
  const other = t({ referrer: 'https://www.somehsathletics.org/links?id=9' });
  ok('an unknown site is recorded by host only', other.src === 'somehsathletics.org' && other.med === 'referral' && other.ref === 'somehsathletics.org', JSON.stringify(other));
  ok('fbclid alone says Meta', t({ search: '?fbclid=xyz' }).src === 'meta');
  ok('a referrer beats a bare fbclid', t({ search: '?fbclid=xyz', referrer: 'https://l.instagram.com/' }).src === 'instagram');
  ok('no referrer inside Instagram is still Instagram', t({ userAgent: 'Mozilla/5.0 (iPhone) Instagram 300.0.0.0' }).src === 'instagram');
  ok('no referrer inside Facebook is Facebook', t({ userAgent: 'Mozilla/5.0 [FBAN/FBIOS;FBAV/400.0]' }).src === 'facebook');
  ok('nothing at all is direct, with no medium', t({}).src === 'direct' && !('med' in t({})));
  ok('our own pages are not a referrer', t({ referrer: 'https://recruitgrid.app/resources' }).src === 'direct' && !('ref' in t({ referrer: 'https://www.recruitgrid.app/x' })));
  ok('the date is recorded as a day', t({}).at === '2026-11-10');
}

group('landing page: catalogue pages are kept, people are not');
{
  ok('home', landingOf('/') === 'home' && landingOf('') === 'home');
  ok('a school page keeps its school', landingOf('/coaches/university-of-nevada-las-vegas') === 'coaches/university-of-nevada-las-vegas');
  ok('a guide keeps its slug', landingOf('/resources/how-to-email-a-college-coach') === 'resources/how-to-email-a-college-coach');
  ok('a directory page keeps sport and state', landingOf('/questionnaires/basketball/nevada') === 'questionnaires/basketball/nevada');
  ok('plain pages are just their name', landingOf('/pricing') === 'pricing' && landingOf('/signin') === 'signin');
  ok("an athlete's page is never named", landingOf('/jordan-reyes-2028') === 'athlete-profile');
  ok('a film share link is never kept', landingOf('/f/8f2c1e9a') === 'film-share');
  ok('query strings are dropped', landingOf('/pricing?x=1') === 'pricing');
}

group('first and last');
{
  const direct = t({ pathname: '/' });
  const ig = t({ search: '?utm_source=instagram&utm_medium=bio', pathname: '/coaches/duke-university' });
  const ad = t({ search: '?utm_source=instagram&utm_medium=paid&utm_campaign=nov', pathname: '/' });

  let s = mergeTouch(null, direct);
  ok('a direct first visit sets first and no last', s.first.src === 'direct' && !s.last);
  s = mergeTouch(s, ad);
  ok('a later ad click becomes last, first is untouched', s.first.src === 'direct' && s.last.med === 'paid');
  ok('the label credits the ad', sourceLabel(s) === 'instagram / paid', sourceLabel(s));
  s = mergeTouch(s, direct);
  ok('coming back directly does not erase the ad', s.last?.med === 'paid');

  let s2 = mergeTouch(null, ig);
  ok('a tagged first visit is both first and last', s2.first.src === 'instagram' && s2.last.land === 'coaches/duke-university');
  s2 = mergeTouch(s2, ad);
  ok('first is never replaced', s2.first.med === 'bio' && s2.last.med === 'paid');

  const dirty = mergeTouch({ first: { src: '<script>alert(1)</script>', land: '/x y', at: 'yesterday', extra: 'nope' } }, null);
  ok('stored junk is cleaned on the way out', dirty.first.src === 'script-alert-1-/script' && !('extra' in dirty.first) && !('at' in dirty.first), JSON.stringify(dirty));
  ok('nothing stored and nothing new is empty', Object.keys(mergeTouch(null, null)).length === 0);
  ok('a non-object in storage is ignored', mergeTouch('garbage', direct).first.src === 'direct');
}

group('helpers');
{
  ok('isTagged sees tags and click ids', isTagged('?utm_source=x') && isTagged('?fbclid=1') && !isTagged('?next=/app') && !isTagged(''));
  ok('clean bounds length', clean('a'.repeat(100)).length === 40 && clean('  Hello World!  ') === 'hello-world');
  ok('label: direct has no slash', sourceLabel({ first: { src: 'direct' } }) === 'direct');
  ok('label: nothing recorded is empty', sourceLabel(undefined) === '' && sourceLabel({}) === '');
  const tally = tallySources([{ last: { src: 'instagram', med: 'bio' } }, { last: { src: 'instagram', med: 'bio' } }, { first: { src: 'direct' } }, undefined]);
  ok('tally counts and sorts, with the unrecorded named', JSON.stringify(tally) === JSON.stringify([['instagram / bio', 2], ['direct', 1], ['not recorded', 1]]), JSON.stringify(tally));
}

console.log(failures ? `\n${failures} FAILED` : '\nall passed');
process.exit(failures ? 1 : 0);
