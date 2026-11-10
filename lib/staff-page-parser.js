// Turn an athletics staff-directory page into "who coaches this sport, and
// what address did the school publish for them".
//
// Every recruiting platform sells this list. Every athletics site already
// publishes it. The step families stall on is not finding the page (the app
// links it) but getting from a sixty-person staff list to the one address
// that matters, so this does that step.
//
// Two layouts cover every page looked at in the 2026-11-10 pilot:
//
//   TABLE  Rows of NAME / TITLE / EMAIL / PHONE. A section heading is a row
//          whose only cell is a <th colspan>. Old Sidearm puts every section
//          in one table (Colorado Mesa, 34 headings in one table); new Sidearm
//          gives each section its own table (Duke, 52 tables). Same rule
//          either way.
//
//   LIST   One <h2 data-test-id="…list__title"> per group, then a <ul> of
//          person cards: <h3> name, a "__position" title, a mailto. Oklahoma
//          State. The group title carries a phone after a pipe.
//
// Traps, each of which produced a wrong answer before it was handled:
//
//   - A person with no address listed is a <td> row like any other. The
//     pilot read "short row, no email" as a heading, so after Duke's first
//     unlisted basketball coach every later coach was filed under that
//     person's name instead of the sport. Headings are <th> rows. Only.
//   - "Flag Football" and "Sprint Football" are not football. Meredith
//     College, a women's college, matched \bfootball\b. Beach volleyball is
//     not volleyball either.
//   - Sport names inside TITLES mark support staff, not coaches. Duke's
//     "Assistant Director of Athletic Medicine / Football" and "Men's
//     Basketball Academic Coordinator" both sit under department headings.
//     The sport comes from the section heading, and a title only decides
//     whether the person is a coach.
//   - Head coaches at big programs publish a gatekeeper's inbox as their own.
//     Duke lists Jon Scheyer as mikaela.staton@duke.edu, and the whole
//     men's basketball staff as lahoward@duke.edu. That is the address Duke
//     wants recruits to use, so it is correct, not a parsing error. It was
//     reported as one for most of a morning.
//   - Head coaches often have no published address while assistants do
//     (Colorado Mesa football). Falling back to an assistant is right.
//   - Vue leaves <!--[--> comment markers everywhere. Strip them first.
//
// No imports, so `node scripts/test-staff-page-parser.mjs` can load it.

const decode = (s) =>
  String(s || '')
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&rsquo;|&#8217;|&lsquo;|&#8216;/g, "'")
    .replace(/&quot;|&#34;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+/g, ' ')
    .trim();

const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;

const emailIn = (html) => {
  const m = html.match(/mailto:([^"'?#>\s]+)/i);
  if (m) return decode(m[1]).toLowerCase();
  const t = decode(html).match(EMAIL);
  return t ? t[0].toLowerCase() : '';
};

/** "Football | (405) 744-5737" -> "Football" */
const cleanHeading = (s) => decode(s).split(/\s*\|\s*/)[0].trim();

// ---------- layout A: tables ----------

function parseTables(html) {
  const sections = [];
  let cur = { heading: '', people: [] };
  const open = (heading) => {
    if (cur.people.length) sections.push(cur);
    cur = { heading, people: [] };
  };
  // Rows AND heading elements, in document order. PrestoSports pages
  // (Goucher, Endicott, Anderson: ".../information/directory/index") put each
  // sport in its own small table with an <h2> above it, so the heading is
  // outside every row. A row-only scan filed all of those people under
  // nothing. A heading element that sits inside a row is swallowed by the
  // row match, because the row starts first.
  const tokens = html.matchAll(/<(h[1-6])\b[^>]*>([\s\S]*?)<\/\1>|<tr\b[^>]*>[\s\S]*?<\/tr>/gi);
  for (const m of tokens) {
    if (m[1]) {
      const text = decode(m[2]);
      // Long headings are page titles or sidebar blurbs, not sections.
      if (text && text.length <= 80 && !EMAIL.test(text)) open(cleanHeading(text));
      continue;
    }
    const row = m[0];
    const cells = [...row.matchAll(/<(th|td)\b([^>]*)>([\s\S]*?)<\/\1>/gi)].map((m) => ({
      tag: m[1].toLowerCase(),
      colspan: /\bcolspan\s*=/i.test(m[2]),
      html: m[3],
      text: decode(m[3]),
    }));
    if (!cells.length) continue;
    // A heading is a row with exactly ONE cell, and that cell is a <th> or
    // spans columns. Two platforms, two spellings of the same thing:
    //   Sidearm   <tr><th colspan="4">Men's Basketball</th></tr>
    //   WMT       <tr><td colspan="5"><span>Football</span></td></tr>   (Auburn, Clemson, FSU…)
    // The cell COUNT is what keeps this safe: a person with no published
    // address is still a four-cell row (name, title, empty, empty), which is
    // how the pilot's "short row with no email" heuristic went wrong.
    if (cells.length === 1 && (cells[0].tag === 'th' || cells[0].colspan) && !emailIn(row)) {
      if (cells[0].text) open(cleanHeading(cells[0].text));
      continue;
    }
    const allTh = cells.every((c) => c.tag === 'th');
    if (allTh) {
      const filled = cells.filter((c) => c.text);
      // One filled <th> among several is still a heading; several filled is
      // the column-label row (Name / Title / Email / Phone), which carries nothing.
      if (filled.length === 1) open(cleanHeading(filled[0].text));
      continue;
    }
    const tds = cells.filter((c) => c.tag === 'td' && c.text);
    if (!tds.length) continue;
    const name = tds[0].text;
    const titleCell = tds[1] || null;
    // Sidearm's new layout tags the sports a support person covers in <em>.
    const sportTag = titleCell ? decode((titleCell.html.match(/<em\b[^>]*>([\s\S]*?)<\/em>/i) || [])[1] || '') : '';
    const title = titleCell ? decode(titleCell.html.replace(/<em\b[^>]*>[\s\S]*?<\/em>/gi, ' ')) : '';
    if (!name || /^(name|title|email|phone)$/i.test(name)) continue;
    cur.people.push({ name, title, sportTag, email: emailIn(row) });
  }
  // Sections with nobody in them are dropped. Sidebar headings like Duke's
  // "Upcoming Event: Men's Basketball vs. X" would otherwise exist as empty
  // sport sections and switch off the title fallback for flat directories.
  if (cur.people.length) sections.push(cur);
  return sections;
}

// ---------- layout B: list of cards ----------

function parseList(html) {
  const marks = [...html.matchAll(/<(h[1-6])\b[^>]*data-test-id="[^"]*list__title"[^>]*>([\s\S]*?)<\/\1>/gi)];
  if (!marks.length) return [];
  const sections = [];
  for (let i = 0; i < marks.length; i++) {
    const start = marks[i].index + marks[i][0].length;
    const end = i + 1 < marks.length ? marks[i + 1].index : html.length;
    const block = html.slice(start, end);
    const people = [];
    for (const card of block.split(/class="s-person-card\b/).slice(1)) {
      const name = decode((card.match(/<h3\b[^>]*>([\s\S]*?)<\/h3>/i) || [])[1] || '');
      const title = decode((card.match(/__position[^>]*>([\s\S]*?)<\/div>\s*<\/div>/i) || [])[1] || '');
      if (!name) continue;
      people.push({ name, title, sportTag: '', email: emailIn(card) });
    }
    sections.push({ heading: cleanHeading(marks[i][2]), people });
  }
  return sections;
}

/**
 * @param {string} html a rendered staff-directory page
 * @returns {{layout:'table'|'list'|'none', sections:Array<{heading:string, people:Array}>}}
 */
export function parseStaffPage(html) {
  const clean = String(html || '').replace(/<!--[\s\S]*?-->/g, '');
  // Both strategies run and the one that found more people wins. "First one
  // that finds anybody" lost Florida State: a four-row navigation table
  // produced a couple of "people", so the 414 person cards below it were
  // never looked at.
  const tables = parseTables(clean);
  const list = parseList(clean);
  const count = (s) => s.reduce((n, x) => n + x.people.length, 0);
  const t = count(tables), l = count(list);
  if (!t && !l) return { layout: 'none', sections: [] };
  return l > t ? { layout: 'list', sections: list } : { layout: 'table', sections: tables };
}

// ---------- who is a coach ----------

export const SPORTS = {
  football: { match: /\bfootball\b/i, exclude: /\b(flag|sprint|touch)\b/i },
  basketball: { match: /\bbasketball\b/i },
  volleyball: { match: /\bvolleyball\b/i, exclude: /\b(beach|sand)\b/i },
  baseball: { match: /\bbaseball\b/i },
  softball: { match: /\bsoftball\b/i },
  soccer: { match: /\bsoccer\b/i },
  lacrosse: { match: /\blacrosse\b/i },
  wrestling: { match: /\bwrestling\b/i },
  golf: { match: /\bgolf\b/i },
  tennis: { match: /\btennis\b/i },
  swimming: { match: /\bswim/i },
  track: { match: /\btrack\b|cross[\s-]country|\bxc\b/i },
  hockey: { match: /\bice hockey\b|\bhockey\b/i, exclude: /\bfield\b/i },
  'field hockey': { match: /\bfield hockey\b/i },
  rowing: { match: /\browing\b|\bcrew\b/i },
  gymnastics: { match: /\bgymnastics\b/i },
};

// Someone families should write to.
//
// Football staffs title position coaches as coordinators with no "coach" in
// the title at all: "Defensive Coordinator / Linebackers", "Special Teams
// Coordinator", "Run Game Coordinator / Offensive Line" (Auburn, Oklahoma
// State). Those are coaches. "Academic Coordinator" and "Program Coordinator
// (MBB)" are not, so the coordinator match is specific, not generic.
const COACH = /\bcoach\b|\brecruit|player personnel|\b(?:co-)?(?:offensive|defensive|special teams|run game|pass(?:ing)? game|game)\s+coordinator\b/i;
// Someone who sits under a sport heading and is not who they should write to.
// "Strength & Conditioning Coach" has the word coach in it and is on this
// list on purpose.
const SUPPORT = /\b(operations|academic|trainer|medicine|medical|physician|communications|sports information|compliance|equipment|marketing|ticket|facilities|strength|conditioning|nutrition|analytics|video|creative|photograph|development|general manager|administrative|assistant to the|chief of staff|quality control|player development|graduate assistant|intern)\b/i;

export const isSupportTitle = (title) => SUPPORT.test(title || '');
export const isCoachTitle = (title) => COACH.test(title || '') && !(SUPPORT.test(title || '') && !/recruit/i.test(title || ''));

/**
 * Lower is better.
 *
 * The sport often sits between the words: "Head Football Coach", "Head
 * Women's Volleyball Coach". Requiring the literal "head coach" scored
 * Colorado Mesa's head coach as "other" and ranked his associate above him.
 */
export function coachRank(title) {
  const t = title || '';
  if (/recruit/i.test(t)) return 0;
  if (/\bassociate head\b/i.test(t)) return 2;
  if (/\bhead\b[^,/|]*\bcoach\b/i.test(t) && !/\b(associate|assistant)\b/i.test(t)) return 1;
  if (/\bassistant\b/i.test(t)) return 3;
  // A coordinator is an assistant-level coach; see COACH above.
  if (/\bcoordinator\b/i.test(t)) return 3;
  return 4;
}

const MEN = /(?<![a-z])men(?:['’]s)?\b|(?<![a-z])m\s|\bmbb\b/i;
const WOMEN = /(?<![a-z])women(?:['’]s)?\b|(?<![a-z])w\s|\bwbb\b/i;

/**
 * What a section heading says about gender: 'men', 'women', 'both' ("Men's
 * and Women's Track & Field") or '' when it says nothing ("Volleyball").
 */
export function genderOf(heading) {
  const men = MEN.test(heading || '');
  const women = WOMEN.test(heading || '');
  return men && women ? 'both' : men ? 'men' : women ? 'women' : '';
}

/** The SPORTS key a heading belongs to, or '' for a department heading. */
export function sportOf(heading) {
  for (const [key, spec] of Object.entries(SPORTS)) if (sportOk(heading || '', spec)) return key;
  return '';
}

function genderOk(heading, want) {
  if (!want) return true;
  const men = MEN.test(heading);
  const women = WOMEN.test(heading);
  if (!men && !women) return true; // "Volleyball": unmarked, accept
  return want === 'women' ? women : men;
}

function sportOk(text, spec) {
  if (!spec.match.test(text)) return false;
  return !(spec.exclude && spec.exclude.test(text));
}

/**
 * Every coach of a sport on the page, best first.
 *
 * @param {{sections:Array}} parsed from parseStaffPage
 * @param {string|{match:RegExp,exclude?:RegExp}} sport a key of SPORTS, or a spec
 * @param {{gender?:'men'|'women'|'', requireEmail?:boolean}} [opts]
 */
export function coachesFor(parsed, sport, { gender = '', requireEmail = true } = {}) {
  const spec = typeof sport === 'string' ? SPORTS[sport.toLowerCase()] : sport;
  if (!spec) return [];
  const out = [];
  const push = (p, heading, via) => {
    if (!isCoachTitle(p.title)) return;
    if (requireEmail && !p.email) return;
    out.push({ ...p, heading, via, rank: coachRank(p.title) });
  };

  const sportSections = (parsed.sections || []).filter((s) => sportOk(s.heading, spec));
  for (const s of sportSections) {
    if (!genderOk(s.heading, gender)) continue;
    for (const p of s.people) push(p, s.heading, 'heading');
  }

  // Only when the page has no heading for the sport at all: look at titles.
  // On pages that DO have the heading, a title match is a support person
  // under a department heading, which is exactly the wrong answer.
  if (!sportSections.length) {
    for (const s of parsed.sections || []) {
      for (const p of s.people) {
        const hay = `${p.title} ${p.sportTag}`;
        if (sportOk(hay, spec) && genderOk(hay, gender)) push(p, s.heading, 'title');
      }
    }
  }

  return out.sort((a, b) => a.rank - b.rank);
}

/** The one person to suggest, or null. */
export function findCoach(parsed, sport, opts) {
  return coachesFor(parsed, sport, opts)[0] || null;
}

/**
 * Coaches first, then the sport's own staff who DO have an address.
 *
 * Big programs often publish no address for any coach: Delaware lists seven
 * men's basketball staff and only the Director of Operations and the General
 * Manager have one; Oklahoma State lists none for football at all. For a
 * family that is not "no contact", it is "the program routes recruiting mail
 * through its office", and the operations director is who they should write
 * to. Each entry carries `kind: 'coach' | 'staff'` so the app can label the
 * difference honestly instead of presenting an operations director as a coach.
 *
 * Staff only ever come from a heading that matches the sport. A support
 * person under a department heading whose title mentions the sport is the
 * athletic trainer, never the right contact.
 */
export function contactsFor(parsed, sport, { gender = '', requireEmail = true } = {}) {
  const spec = typeof sport === 'string' ? SPORTS[sport.toLowerCase()] : sport;
  if (!spec) return [];
  const coaches = coachesFor(parsed, sport, { gender, requireEmail }).map((c) => ({ ...c, kind: 'coach' }));
  const staff = [];
  for (const s of parsed.sections || []) {
    if (!sportOk(s.heading, spec) || !genderOk(s.heading, gender)) continue;
    for (const p of s.people) {
      if (isCoachTitle(p.title)) continue;
      if (requireEmail && !p.email) continue;
      staff.push({ ...p, heading: s.heading, via: 'heading', kind: 'staff', rank: staffRank(p.title) });
    }
  }
  staff.sort((a, b) => a.rank - b.rank);
  return [...coaches, ...staff];
}

/** Among non-coaches, who a recruit should write to. Lower is better. */
function staffRank(title) {
  const t = title || '';
  if (/recruit|player personnel|operations/i.test(t)) return 0;
  if (/general manager|chief of staff/i.test(t)) return 1;
  if (/administrative|assistant to the/i.test(t)) return 2;
  return 3;
}

/** The one person to suggest, coach or staff, or null. */
export function findContact(parsed, sport, opts) {
  return contactsFor(parsed, sport, opts)[0] || null;
}

/**
 * Every person on the page attributed to a sport, for storing.
 *
 * From the section headings when the page has them. When it has NONE —
 * some directories are one flat alphabetical table where the sport lives
 * only in the title ("Head Women's Volleyball Coach") — the title is used
 * instead, for coaches only. Support staff with a sport in their title are
 * exactly the wrong answer, so they are never attributed this way. `via`
 * records which it was, because a title-derived row deserves less trust.
 */
export function contactsIndex(parsed) {
  const out = [];
  const sections = parsed.sections || [];
  const hasSportHeadings = sections.some((s) => sportOf(s.heading));
  for (const s of sections) {
    const fromHeading = sportOf(s.heading);
    for (const p of s.people) {
      const coach = isCoachTitle(p.title);
      let sport = fromHeading;
      let gender = fromHeading ? genderOf(s.heading) : '';
      let via = 'heading';
      if (!sport) {
        if (hasSportHeadings || !coach) continue;
        sport = sportOf(p.title);
        if (!sport) continue;
        gender = genderOf(p.title);
        via = 'title';
      }
      out.push({
        sport, gender, heading: s.heading, via,
        name: p.name, title: p.title, email: p.email || null,
        kind: coach ? 'coach' : 'staff',
        rank: coach ? coachRank(p.title) : null,
      });
    }
  }
  return out;
}
