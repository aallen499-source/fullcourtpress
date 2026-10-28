// Programs confirmed NOT to publish a public recruiting questionnaire.
//
// A missing row and a program that has deliberately chosen not to have one
// look identical in a catalogue, and they mean opposite things to a family.
// A gap says "we haven't got to this yet". This says "there is nothing to
// find, stop looking, here is what to do instead" — which is the more useful
// answer and the harder one to get anywhere else.
//
// It also stops the same program being re-researched every few months. Each
// entry records what was actually checked and when, so the next person can
// judge whether it is worth re-checking rather than starting from nothing.
//
// Rules for adding one, same discipline as the rest of the directory:
//   - Only after opening the program's own pages and finding nothing. A
//     search returning no result is not evidence; search engines surface
//     aggregators and scraped spam for these queries.
//   - Record the paths checked. "I looked" is not reproducible.
//   - Absence is a claim like any other. If a form turns up later, that is a
//     correction, not a surprise.
//   - A form can exist and be linked from nowhere. Auburn and Nebraska both
//     have working football questionnaires in this catalogue that are not
//     reachable from their football page or from ten other obvious paths. So
//     "we found no link" is NOT "there is no form", and an entry here needs
//     better evidence than a failed search: a forms index that covers other
//     sports and omits this one, or a published link that is broken.
//
// Fields: school, sport, checked, paths, instead. Optional `gender` when only
// one squad is affected, and optional `headline` to replace the default "No
// public questionnaire." lead — Kentucky publishes a questionnaire whose link
// is broken, which is a different thing from publishing none.

export const NO_PUBLIC_FORM = [
  {
    school: 'University of Michigan',
    sport: 'Football',
    checked: '2026-10-26',
    // Upgraded 2026-10-26 from "no link found". Michigan's own site search
    // returns 8,070 results carrying a track & field recruiting questionnaire
    // and none for football — positive evidence rather than a failed search.
    // Two cautions recorded while checking:
    //   - /sports/football REDIRECTS to a promotional takeover feature, so what
    //     a crawler reads there is a news article with 12 links. An earlier pass
    //     read that page and concluded "no links", which was luck, not method.
    //   - /sports/football/recruit answers 200 with a 1.2 MB page titled
    //     "Page Not Found".
    paths: [
      'mgoblue.com/sports/football (redirects to a takeover feature)',
      'mgoblue.com/sports/football/roster',
      'mgoblue.com site search: 8,070 results',
      'mgoblue.com/sports/football/recruit',
      'mgoblue.com/sports/football/questionnaire',
      'mgoblue.com/recruiting',
      'mgoblue.com/prospective-student-athletes',
    ],
    instead:
      'Michigan publishes recruiting questionnaires for other sports, track and field among them, ' +
      'and not for football. They publish no coach email addresses either. The route in is your ' +
      'high school or club coach making contact directly, or a camp where their staff is working.',
    evidence: 'other sports only',
  },
  {
    school: 'University of Alabama',
    sport: 'Football',
    checked: '2026-10-26',
    // Same shape as Michigan: the rendered football page carries no recruit or
    // questionnaire link, and every plausible path 404s. The staff directory
    // does list people under Football, but they are Athletics Student Services
    // administrators, not coaches, and no coaching address is published.
    paths: [
      'rolltide.com/sports/football',
      'rolltide.com/sports/football/recruit',
      'rolltide.com/sports/football/questionnaire',
      'rolltide.com/recruiting',
      'rolltide.com/prospective-student-athletes',
      'rolltide.com/staff-directory',
      'rolltide.com site search: 399 results',
    ],
    instead:
      'Alabama publishes recruiting questionnaires for other sports \u2014 rowing, volleyball and ' +
      'track among them \u2014 and not for football. Their staff directory lists administrators ' +
      'only, so there are no football coaching addresses either. The route in is your high school ' +
      'or club coach making contact, or a camp where their staff is working.',
    evidence: 'other sports only',
  },
  {
    school: 'Pennsylvania State University',
    sport: 'Football',
    checked: '2026-10-26',
    // The strongest evidence of the three. Penn State runs a "Prospective
    // Athlete Forms" page listing questionnaires for fourteen sports —
    // baseball, basketball, fencing, golf, gymnastics, hockey, soccer,
    // swimming, tennis, track, volleyball, wrestling, field hockey, lacrosse.
    // Football is not on it. They have the infrastructure and have chosen not
    // to use it for football, which is a decision rather than an oversight.
    paths: [
      'gopsusports.com/sports/football',
      'gopsusports.com/prospective-athlete-forms',
    ],
    instead:
      'Penn State publishes questionnaires for fourteen sports and football is deliberately not ' +
      'one of them. The route in is your high school or club coach making contact, or a camp ' +
      'where their staff is working.',
  },
  {
    school: 'Pennsylvania State University',
    sport: 'Basketball',
    gender: 'Men',
    checked: '2026-10-26',
    // Not an absence of a link — an absence of the right link. Their forms page
    // has an entry labelled "Basketball" in the men's section, and rendering it
    // gives "Penn State University Men's Basketball Alumni Questionnaire". It
    // collects former players, not recruits. Filing it as a recruiting
    // questionnaire would send a family to the wrong form with no way to tell.
    paths: ['gopsusports.com/prospective-athlete-forms'],
    instead:
      'The form Penn State labels Basketball in the men\u2019s section is an alumni questionnaire, ' +
      'not a recruiting one. Their women\u2019s basketball questionnaire is real and is in the ' +
      'directory. For the men\u2019s program, go through your high school or club coach, or a camp.',
  },
  {
    school: 'University of Kentucky',
    sport: 'Football',
    headline: 'Their link is broken.',
    evidence: 'broken link',
    checked: '2026-10-26',
    // A different failure from the others: Kentucky does publish a link, and
    // the link is broken. Their "Recruitment Forms" page is live and lists 14
    // questionnaires, but every JumpForward one (iid=270) answers "The URL
    // entered appears to be invalid" over both http and https — football,
    // basketball, softball, golf, cross country and swimming. Only the three
    // on ARMS still work: rifle, men's soccer and gymnastics.
    //
    // Worth re-checking sooner than the others. This looks like a provider
    // migration Kentucky has not finished, not a decision, so a working
    // football form may appear without warning.
    paths: [
      'ukathletics.com/recruits/',
      'ukathletics.com/sports/football/recruit',
      'college.jumpforward.com/questionnaire.aspx?iid=270&sportid=18',
    ],
    instead:
      'Kentucky lists a football questionnaire but the link is broken on their end, so there is ' +
      'nothing to submit right now. Go through your high school or club coach, or a camp where ' +
      'their staff is working, and check their recruitment forms page again later.',
  },
  {
    school: 'University of Kentucky',
    sport: 'Basketball',
    headline: 'Their link is broken.',
    evidence: 'broken link',
    checked: '2026-10-26',
    // Same broken provider links. This replaces a catalogue row that pointed
    // at Kentucky's forms index rather than a form, which promised a working
    // questionnaire that is not there.
    paths: [
      'ukathletics.com/recruits/',
      'college.jumpforward.com/questionnaire.aspx?iid=270&sportid=3',
    ],
    instead:
      'Kentucky lists a basketball questionnaire but the link is broken on their end. Go through ' +
      'your high school or club coach, or a camp, and check their recruitment forms page later.',
  },
  {
    school: 'Ohio State University',
    sport: 'Football',
    checked: '2026-10-26',
    // Searching their own site returns 2,890 results with questionnaires for
    // volleyball, cheer, golf and cross country, and none for football. Also a
    // lacrosse ALUMNI questionnaire that states it is not for recruits.
    evidence: 'other sports only',
    paths: [
      'ohiostatebuckeyes.com/sports/football',
      'ohiostatebuckeyes.com/feature/recruiting',
      'ohiostatebuckeyes.com/sports/2019/5/21/recruits-main',
      'site search: 2,890 results',
    ],
    instead:
      'Ohio State hosts its own questionnaires and publishes them for volleyball, cheerleading, ' +
      'golf and cross country. There is no football one. Their recruiting pages are about ' +
      'facilities, academics and NIL. The route in is your high school or club coach making ' +
      'contact, or a camp where their staff is working.',
  },
  {
    school: 'University of Texas at Austin',
    sport: 'Football',
    checked: '2026-10-26',
    // Note texassports.com now redirects to texaslonghorns.com. Their own search
    // surfaces track and rowing questionnaires and no football one.
    evidence: 'other sports only',
    paths: [
      'texaslonghorns.com/sports/football',
      'texaslonghorns.com site search: 187 results',
    ],
    instead:
      'Texas publishes questionnaires for track and rowing and not for football. The route in is ' +
      'your high school or club coach making contact, or a camp where their staff is working.',
  },
  {
    school: 'University of Oklahoma',
    sport: 'Football',
    checked: '2026-10-26',
    evidence: 'other sports only',
    paths: [
      'soonersports.com/sports/football',
      'soonersports.com/sports/prospects',
      'soonersports.com site search: 78 results',
    ],
    instead:
      'Oklahoma publishes a rowing questionnaire and compliance guidance for prospects, and no ' +
      'football questionnaire. The route in is your high school or club coach making contact, or a ' +
      'camp where their staff is working.',
  },
  {
    school: 'University of Oregon',
    sport: 'Football',
    checked: '2026-10-26',
    // Their indexed prospective-athlete page carries the line about football
    // sending a questionnaire only after reviewing film. That page is dated 2005,
    // so it is corroboration rather than a current policy statement. The
    // 'Incoming Player Equipment Questionnaire' is for players already on roster.
    evidence: 'other sports only',
    paths: [
      'goducks.com/sports/football',
      'goducks.com site search: 3,740 results',
    ],
    instead:
      'Oregon publishes questionnaires for other sports and not for football. Their own ' +
      'prospective-athlete page says the football staff may send you a questionnaire after they ' +
      'have watched your film, so film comes first here, not a form. The route in is your high ' +
      'school or club coach making contact, or a camp where their staff is working.',
  },
  {
    school: 'University of Florida',
    sport: 'Football',
    checked: '2026-10-26',
    // Their 'Sports Publicity Questionnaire' is for athletes already on a roster,
    // not recruits.
    evidence: 'other sports only',
    paths: [
      'floridagators.com/sports/football',
      'floridagators.com/sports/2015/12/10/_prospective_',
      'floridagators.com site search: 2,070 results',
    ],
    instead:
      'Florida hosts its own questionnaires and publishes them for golf among others. There is no ' +
      'football one. The route in is your high school or club coach making contact, or a camp where ' +
      'their staff is working.',
  },
  {
    school: 'University of Tennessee',
    sport: 'Football',
    checked: '2026-10-26',
    evidence: 'other sports only',
    paths: [
      'utsports.com/sports/football',
      'utsports.com/sports/prospects',
      'utsports.com site search: 1,250 results',
    ],
    instead:
      'Tennessee hosts its own forms but the only football one is a walk-on tryout form for ' +
      'students already on campus, and it is closed. There is no recruiting questionnaire. The ' +
      'route in is your high school or club coach making contact, or a camp where their staff is ' +
      'working.',
  },
  {
    school: 'Clemson University',
    sport: 'Football',
    checked: '2026-10-26',
    // Their football page links a questionnaire at thisisdeathvalley.com, which
    // has NO DNS record at all — the domain is gone, not merely erroring.
    // Confirmed with dig and curl. Same shape as Kentucky: published and broken.
    evidence: 'broken link',
    headline: 'Their link is broken.',
    paths: [
      'clemsontigers.com/sports/football',
      'clemsontigers.com/football-additional-links',
      'thisisdeathvalley.com (no DNS record)',
    ],
    instead:
      'Clemson links a football recruiting questionnaire from their own football page and the site ' +
      'it points to no longer exists, so there is nothing to submit. Go through your high school or ' +
      'club coach, or a camp, and tell Clemson the link is dead if you get the chance.',
  },
  {
    school: 'Texas A&M University',
    sport: 'Football',
    checked: '2026-10-26',
    // Their page titled 'Prospective Athlete Questionnaire' is tagged BASEBALL and
    // dated 2011. The title alone would have been a trap. Their site search is
    // gated behind accepting tracking cookies, so it was not used.
    evidence: 'no link found',
    paths: [
      '12thman.com/sports/football',
      '12thman.com/compliance',
      '12thman.com/news/2011/08/04/prospective-athlete-questionnaire',
    ],
    instead:
      'Nothing is linked from Texas A&M\u2019s football or compliance pages, though they publish ' +
      'questionnaires for other sports. The route in is your high school or club coach making ' +
      'contact, or a camp where their staff is working.',
  },
  {
    school: 'University of Miami',
    sport: 'Football',
    checked: '2026-10-26',
    evidence: 'no link found',
    paths: [
      'miamihurricanes.com/sports/football',
      'miamihurricanes.com/recruiting',
      'miamihurricanes.com/prospective-student-athletes',
      'miamihurricanes.com/compliance',
    ],
    instead:
      'Nothing is linked from Miami\u2019s football, recruiting or compliance pages. The ' +
      'questionnaires they do publish are for other sports. The route in is your high school or ' +
      'club coach making contact, or a camp where their staff is working.',
  },
  {
    school: 'Louisiana State University',
    sport: 'Football',
    checked: '2026-10-26',
    evidence: 'no link found',
    paths: [
      'lsusports.net/sports/football',
      'lsusports.net/recruiting',
      'lsusports.net/fbwalkons',
    ],
    instead:
      'LSU publishes a football walk-on form and a signing-day form, and neither is a recruiting ' +
      'questionnaire \u2014 the walk-on form is for students already at LSU and the signing-day ' +
      'form is for athletes who have already committed. The route in is your high school or club ' +
      'coach making contact, or a camp where their staff is working.',
  },
  {
    school: 'Michigan State University',
    sport: 'Football',
    checked: '2026-10-26',
    evidence: 'no link found',
    paths: [
      'msuspartans.com/sports/football',
      'msuspartans.com/sports/prospects',
      'msuspartans.com/feature/recruiting',
      'msuspartans.com/compliance',
    ],
    instead:
      'Nothing is linked from Michigan State\u2019s football or recruiting pages. They do publish a ' +
      'general recruiting questionnaire as a PDF, but it names no sport and is from 2018. The route ' +
      'in is your high school or club coach making contact, or a camp where their staff is working.',
  },
  {
    school: 'University of South Carolina',
    sport: 'Football',
    checked: '2026-10-26',
    evidence: 'no link found',
    paths: [
      'gamecocksonline.com/sports/football',
      'gamecocksonline.com/compliance',
      'gamecocksonline.com/sports/compliance',
    ],
    instead:
      'Nothing is linked from South Carolina\u2019s football or compliance pages. The ' +
      'questionnaires they publish are for other sports. The route in is your high school or club ' +
      'coach making contact, or a camp where their staff is working.',
  },
  {
    school: 'University of Missouri',
    sport: 'Football',
    checked: '2026-10-26',
    // Missouri is on JumpForward for track, so the football sportid was tried.
    // iid=341&sportid=18 renders a form that names no sport and contains no
    // football position anywhere, so it was not treated as a football form.
    evidence: 'no link found',
    paths: [
      'mutigers.com/sports/football',
      'mutigers.com/prospective-student-athlete-introduction',
      'college.jumpforward.com/questionnaire.aspx?iid=341&sportid=18',
    ],
    instead:
      'Nothing is linked from Missouri\u2019s football or prospective-athlete pages, though they ' +
      'publish questionnaires for other sports. The route in is your high school or club coach ' +
      'making contact, or a camp where their staff is working.',
  },
  {
    school: 'Florida State University',
    sport: 'Football',
    checked: '2026-10-26',
    // The form linked from their FOOTBALL page renders as "Florida State
    // University Swimming & Diving Recruiting Questionnaire". Trusting the link
    // would have filed a swimming form under Florida State Football.
    evidence: 'no link found',
    paths: [
      'seminoles.com/sports/football',
      'seminoles.com/compliance',
    ],
    instead:
      'Nothing football-specific is linked from Florida State\u2019s football page \u2014 the ' +
      'recruiting form linked there is their swimming and diving questionnaire. They publish ' +
      'questionnaires for softball, track and volleyball, all of which are in this directory. The ' +
      'route in is your high school or club coach making contact, or a camp where their staff is ' +
      'working.',
  },
  {
    school: 'Baylor University',
    sport: 'Football',
    checked: '2026-10-26',
    evidence: 'no link found',
    paths: [
      'baylorbears.com/sports/football',
      'baylorbears.com/sports/2018/5/16/ot-psa-information-html',
      'baylorbears.com/compliance',
    ],
    instead:
      'Nothing is linked from Baylor\u2019s football or prospective-athlete pages. They publish ' +
      'questionnaires for other sports, including track. The route in is your high school or club ' +
      'coach making contact, or a camp where their staff is working.',
  },
  {
    school: 'Arizona State University',
    sport: 'Football',
    checked: '2026-10-26',
    evidence: 'no link found',
    paths: [
      'thesundevils.com/sports/football',
      'thesundevils.com/compliance',
    ],
    instead:
      'Nothing is linked from Arizona State\u2019s football or compliance pages, though they ' +
      'publish questionnaires for other sports. The route in is your high school or club coach ' +
      'making contact, or a camp where their staff is working.',
  },
  {
    school: 'University of Texas at San Antonio',
    sport: 'Football',
    checked: '2026-10-28',
    evidence: 'broken link',
    headline: 'Their link is broken.',
    // UTSA publishes a questionnaires index listing four sports, and the one
    // labelled Football points at questionnaire.frontrush.com, a hostname with
    // NO DNS record — confirmed against 8.8.8.8, 1.1.1.1 and the system
    // resolver. frontrush.com itself resolves; the questionnaire subdomain does
    // not. Their men's basketball and volleyball links go to ACS and work.
    //
    // Note this is a different failure from the ACS timeouts: ACS resolves and
    // answers for ordinary visitors, it just will not answer from the machine
    // this was checked on. No DNS record means nobody can reach it.
    paths: [
      'goutsa.com/prospective-student-athletes-questionnaires',
      'goutsa.com/sports/football',
      'questionnaire.frontrush.com (no DNS record)',
    ],
    instead:
      'UTSA lists a football questionnaire on their prospective-athlete page and the address it ' +
      'points to no longer exists, so there is nothing to submit. Go through your high school or ' +
      'club coach, or a camp where their staff is working.',
  },
  {
    school: 'Alabama A & M University',
    sport: 'Football',
    checked: '2026-10-28',
    evidence: 'broken link',
    headline: 'Their link is broken.',
    // Linked from their own football page, and the questionnaire behind it is
    // gone. The ARMS page loads its shell and then asks its own API for the
    // form; that call answers 404 and the page renders empty. Confirmed in a
    // real browser, not only headless — the network log shows
    // /arms/api/public/questionnaires/82f1cd606714 returning 404.
    paths: [
      'https://my.armssoftware.com/arms/public/questionnaire/82f1cd606714',
    ],
    instead:
      'The questionnaire linked from their football page no longer exists, so there is nothing to ' +
      'submit. Go through your high school or club coach, or a camp where their staff is working.',
  },
  {
    school: 'University of Delaware',
    sport: 'Football',
    checked: '2026-10-28',
    evidence: 'broken link',
    headline: 'Their link is broken.',
    // Linked from their own football page, and the questionnaire behind it is
    // gone. The ARMS page loads its shell and then asks its own API for the
    // form; that call answers 404 and the page renders empty. Confirmed in a
    // real browser, not only headless — the network log shows
    // /arms/api/public/questionnaires/994eae832622 returning 404.
    paths: [
      'https://questionnaires.armssoftware.com/994eae832622',
    ],
    instead:
      'The questionnaire linked from their football page no longer exists, so there is nothing to ' +
      'submit. Go through your high school or club coach, or a camp where their staff is working.',
  },
  {
    school: 'Southeastern Louisiana University',
    sport: 'Football',
    checked: '2026-10-28',
    evidence: 'broken link',
    headline: 'Their link is broken.',
    // Linked from their own football page, and the questionnaire behind it is
    // gone. The ARMS page loads its shell and then asks its own API for the
    // form; that call answers 404 and the page renders empty. Confirmed in a
    // real browser, not only headless — the network log shows
    // /arms/api/public/questionnaires/778642c52f7a returning 404.
    paths: [
      'https://questionnaires.armssoftware.com/778642c52f7a',
    ],
    instead:
      'The questionnaire linked from their football page no longer exists, so there is nothing to ' +
      'submit. Go through your high school or club coach, or a camp where their staff is working.',
  },
  {
    school: 'Old Dominion University',
    sport: 'Football',
    checked: '2026-10-28',
    evidence: 'broken link',
    headline: 'Their link is broken.',
    // Linked from their own football page, and the questionnaire behind it is
    // gone. The ARMS page loads its shell and then asks its own API for the
    // form; that call answers 404 and the page renders empty. Confirmed in a
    // real browser, not only headless — the network log shows
    // /arms/api/public/questionnaires/f57a6be3586f?SPSID=750425&SPID=127313&DB_LANG=C&DB_OEM_ID=31100 returning 404.
    paths: [
      'https://questionnaires.armssoftware.com/f57a6be3586f?SPSID=750425&SPID=127313&DB_LANG=C&DB_OEM_ID=31100',
    ],
    instead:
      'The questionnaire linked from their football page no longer exists, so there is nothing to ' +
      'submit. Go through your high school or club coach, or a camp where their staff is working.',
  },
  {
    school: 'Marshall University',
    sport: 'Football',
    checked: '2026-10-28',
    evidence: 'broken link',
    headline: 'Their link is broken.',
    // Linked from their own football page, and the questionnaire behind it is
    // gone. The ARMS page loads its shell and then asks its own API for the
    // form; that call answers 404 and the page renders empty. Confirmed in a
    // real browser, not only headless — the network log shows
    // /arms/api/public/questionnaires/67473590478d returning 404.
    paths: [
      'https://questionnaires.armssoftware.com/67473590478d',
    ],
    instead:
      'The questionnaire linked from their football page no longer exists, so there is nothing to ' +
      'submit. Go through your high school or club coach, or a camp where their staff is working.',
  },
  {
    school: 'Missouri Southern State University',
    sport: 'Football',
    checked: '2026-10-28',
    evidence: 'broken link',
    headline: 'Their link is broken.',
    // Linked from their own football page, and the questionnaire behind it is
    // gone. The ARMS page loads its shell and then asks its own API for the
    // form; that call answers 404 and the page renders empty. Confirmed in a
    // real browser, not only headless — the network log shows
    // /arms/api/public/questionnaires/b56dcd1142ef returning 404.
    paths: [
      'https://questionnaires.armssoftware.com/b56dcd1142ef',
    ],
    instead:
      'The questionnaire linked from their football page no longer exists, so there is nothing to ' +
      'submit. Go through your high school or club coach, or a camp where their staff is working.',
  },
  {
    school: 'University of Tennessee-Chattanooga',
    sport: 'Football',
    checked: '2026-10-28',
    evidence: 'broken link',
    headline: 'Their link is broken.',
    // Linked from their own football page, and the questionnaire behind it is
    // gone. The ARMS page loads its shell and then asks its own API for the
    // form; that call answers 404 and the page renders empty. Confirmed in a
    // real browser, not only headless — the network log shows
    // /arms/api/public/questionnaires/17c6cae593d4 returning 404.
    paths: [
      'http://my.armssoftware.com/arms/public/questionnaire/17c6cae593d4',
    ],
    instead:
      'The questionnaire linked from their football page no longer exists, so there is nothing to ' +
      'submit. Go through your high school or club coach, or a camp where their staff is working.',
  },
];

const key = (school, sport) =>
  `${String(school || '').trim().toLowerCase()}|${String(sport || '').trim().toLowerCase()}`;

const INDEX = new Map(NO_PUBLIC_FORM.map((e) => [key(e.school, e.sport), e]));

/** The entry for a school and sport, or null. */
export function noPublicForm(school, sport) {
  return INDEX.get(key(school, sport)) || null;
}

/** Every confirmed-absent sport for one school. */
export function noPublicFormsFor(school) {
  const s = String(school || '').trim().toLowerCase();
  return NO_PUBLIC_FORM.filter((e) => e.school.toLowerCase() === s);
}
