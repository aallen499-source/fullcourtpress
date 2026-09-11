// Recruiting questionnaire links — national starter set.
//
// Standalone rather than attached to College Finder rows: this file names
// schools officially ("University of South Alabama") while college-data.js
// uses short names, and the two don't reconcile cleanly enough to attach a
// link without risking the wrong school's form. So these live in their own
// searchable finder keyed by nothing but themselves.
//
// Source: hand-verified lists, publish=TRUE + Verified, updated 2026-09-05.
// Shape: [school, state, level, gender, sport, url]. state is a 2-letter code,
// gender is Men | Women | Both. Add rows for new sports the same way.
//
// One URL can legitimately appear on several rows. Some schools run a single
// athletics-wide form with a sport dropdown rather than one form per programme
// — McNeese State is seven rows on one link for that reason, and the gender on
// each comes from what that dropdown actually offers (it lists Men's and
// Women's Basketball, but only Women's Soccer, Tennis and Volleyball). Repeated
// URLs here are not duplicates to be cleaned up.
//
// McNeese's baseball row was the first Baseball entry added here, and the
// first row pointing at a PDF rather than a web form — their prospective
// athlete form sends baseball to a separate document. Two things about it are
// worth knowing rather than rediscovering:
//
//   - It is a download, not a form. The page it opens is titled "(PDF)", so
//     nobody is ambushed, but it is a different experience from every other
//     row here and it cannot be filled in a browser.
//   - The document dates from 2016 (see the path). It is live, and McNeese's
//     own current form points at it, so it is where baseball recruits are
//     genuinely sent. But the coach names and return address inside were not
//     verifiable from outside and may be stale. Re-check before relying on it.
//
// Not every athletics form called a "questionnaire" belongs here. UTEP's
// utepminers.com/sb_output.aspx?form=1034 is titled "UTEP Student-Athlete
// Questionnaire" and lists every sport in a dropdown, but it says "for
// incoming UTEP student-athletes ONLY" and asks for your UTEP major and how
// you want your name printed on the roster. It is the sports-information bio
// form for athletes who already signed, and its dropdown includes "Chat",
// "MAC" and "Strength & Conditioning". Sending a recruit there wastes them.
// Read past the title: a recruiting form asks what you did in high school, a
// bio form asks what you will do on campus.
//
// JumpForward sportid values are per-institution, not global. iid=396
// (UTEP) uses 54 for football while iid=510 (Oregon) uses 18, so you cannot
// carry a sportid from one school to another to guess a URL. Load the page:
// a configured form prints its own name ("WELCOME TO THE UTEP WOMEN'S
// BASKETBALL QUESTIONNAIRE!!!"). An unconfigured slot still renders a blank
// generic form rather than an error, so a form with no name on it is not
// evidence the programme accepts recruits there — leave those out.
//
// UTEP men's basketball has no public questionnaire and that is not an
// oversight to correct. Every sportid from 1 to 170 on iid=396 was checked;
// nine UTEP programmes have a configured form and men's basketball is not
// among them. It is not on FieldLevel either (fieldlevel.com/utep 500s — the
// org does not exist), and utepminers.com has exactly two forms, the roster
// bio form above and a softball visiting-team logistics form. High-major
// men's basketball recruits through AAU and the portal, so a missing form
// there is normal. Absence beats a link that goes nowhere.
//
// A warning about the FieldLevel rows here, of which there are still ~124.
// Two separate problems, found 2026-09-07:
//
//   - The /recruiting path 302s to fieldlevel.com's homepage for anyone not
//     signed in, which is every athlete arriving from our public directory
//     pages. A real slug behaves exactly like an invented one, so "it returns
//     200" proves nothing — follow the redirect and look at where you land.
//   - Nine school slugs did not exist at all. The readable ones were the
//     guesses: FieldLevel's slug for Ohio State is 7cwan776, Nebraska is unl,
//     Wyoming is uwyo. Guessing "osu" or "nebraska" produces a 500.
//
// Eight rows sat on those dead slugs. Four had a school-run form to move to
// and did; four did not and were removed. Oklahoma and Wyoming volleyball are
// the interesting deletions — both programmes deliberately send recruits to
// FieldLevel instead of running their own form, so they can only come back
// once the redirect question is settled.
//
// On Sidearm sites, /form/3 is titled "Prospective Athlete Form" at nearly
// every school, and the title is not evidence of what it covers. The sport
// dropdown is the only thing that is. Creighton's lists Golf, Rowing, Soccer
// and Tennis and nothing else; Butler, Marquette, Seton Hall, Providence and
// Georgetown ship the same form with the dropdown EMPTY — never configured.
// An empty dropdown is not an athletics-wide form, so those are not rows here;
// only the sport-specific questionnaires each school actually runs are.
//
// A related finding worth not rediscovering: high-major men's basketball does
// not take questionnaires. Across the whole Big East, plus UTEP, there is not
// one public men's basketball recruiting form — those programmes recruit
// through AAU circuits and the transfer portal instead. Searching harder will
// not turn one up; third-party recruiting sites claim to host them and do not.
//
// California, swept 2026-09-10, refines that: mid-major D1 DOES run men's
// basketball questionnaires — Cal Poly, Long Beach State, Pepperdine, Saint
// Mary's — as do D2 and D3. It is the power conferences specifically that do
// not. Do not generalise "high-major does not" into "D1 does not".
//
// That sweep also put a number on the alumni trap: of 148 ARMS forms linked
// from California sport pages, 40 were ALUMNI questionnaires sitting on the
// same page as the recruiting one, differing by a single word in a title that
// is not visible in the HTML. Cal Poly and CSUN list both for nearly every
// programme. Resolving each hash through
// questionnaires.armssoftware.com/arms/api/public/questionnaires/<hash>
// (Accept: application/json) returns questionnaireTitle and is the only
// reliable way to tell them apart — the page they are linked from will not.
//
// The California COMMUNITY colleges are a near-total blank, and that is a
// finding rather than an unfinished job. Sixty 3C2A athletics sites were swept
// on 2026-09-10 — sport pages, homepage navigation, and fifteen guessed recruit
// paths each. Exactly one college, Monterey Peninsula, publishes recruiting
// forms, and it publishes ten of them as Google Forms. Nobody else published
// anything findable.
//
// That is the opposite of the NWAC, where the same sweep found forms at eight
// of the Washington and Oregon colleges. California juco programmes appear to
// recruit through high-school coaches and film rather than through a form.
//
// One caveat on the sweep, so nobody trusts it further than it deserves:
// roughly half of those sixty sites render their navigation in JavaScript
// behind CloudFront, which returns 403 to this toolchain. Their sport pages
// were readable; their nav was not. So a fourth pass was run against all sixty
// SITEMAPS, which list pages regardless of how the navigation renders and are
// therefore immune to that blind spot. It surfaced two leads and both were
// dead: Ohlone publishes a page titled "Men's Soccer: Recruiting Questionnaire"
// whose entire content is now a disclaimer, and West Valley's /recruiting/*
// pages return nothing at all. Everything else matching "recruit" was HR
// hiring, international-student admissions, or accreditation PDFs.
//
// Four methods, sixty colleges, one result. Monterey Peninsula is genuinely the
// only California community college publishing usable recruiting forms. Treat
// this as settled rather than re-sweeping it.
//
// A third failure mode, found in Nevada on 2026-09-11 and distinct from both
// the empty dropdown and the alumni form: a questionnaire page that renders
// its title, a Print button, and NOTHING ELSE. Nevada's form 6 is titled
// "RECRUITING QUESTIONNAIRE", returns HTTP 200, and has no fields — the form
// was decommissioned and the page left standing. It was a row in this file,
// so athletes were being sent to a dead page for a Mountain West programme.
//
// Server HTML cannot detect this. Sidearm renders these forms in JavaScript,
// so the raw response looks identical for a working form and an empty one —
// both show only the site search and a coupon field. The page has to be
// rendered. College of Southern Nevada's ARI form fails the same way with a
// plainer message: "This form is no longer available for submissions."
//
// So: a 200 is not a form. Before trusting any questionnaire URL, render it
// and confirm there are fields on the page.
//
// Arizona and Utah, 2026-09-11, add a fourth way for a link to be worthless:
// the whole questionnaire HOST can disappear. Grand Canyon links nine forms at
// questionnaire.frontrush.com and that subdomain is NXDOMAIN — every sport, one
// dead hostname. BYU is a milder version: byu-football-recruiting-form and two
// "recruiting contact information" pages render no form at all, and their
// athlete-manager form answers "Oops, Something Went Wrong". Only BYU's women's
// tennis form is real.
//
// Worth knowing for the next sweep: a school can route every sport through one
// third-party host, so one dead DNS record takes out a whole athletic
// department at once. Check the host resolves before working through its links.
//
// ARI Recruiting (forms.arirecruiting.com) is a WORKING platform with a couple
// of dead tenants — this note said the opposite for two days and was wrong.
// College of Southern Nevada's and Whitman's forms answer "This form is no
// longer available for submissions", but Macalester runs seven live ones and
// Lynchburg nine, at nineteen to thirty fields each. Render an ARI link before
// judging it, the same as any other.
//
// Wyoming was swept on 2026-09-11 and yielded nothing new. The university links
// no questionnaires from its sport pages, and of the juco athletics sites only
// four resolve at all — one of those, sheridangenerals.com, currently serves a
// fundraiser page. Four rows for the whole state is the real number, not a gap.
//
// questionnaire.frontrush.com is NXDOMAIN and has now taken out forms in three
// states: Grand Canyon's entire department, Texas Tech men's basketball and
// track, North Texas women's soccer, Texas Southern volleyball. Note the
// hostname carefully — www.frontrush.com is a DIFFERENT, working host, and
// Texas Lutheran softball and Whitman volleyball are live on it. One subdomain
// dead, one alive, same company.
//
// Rice's women's basketball page links a Google Form titled "Rice Women's
// Basketball Alumni Information". Google Forms carry no platform convention to
// warn you, so the only defence is reading the form's own title before trusting
// the page that links it — the discipline the ARMS API enforces for free.
//
// Texas jucos, swept 2026-09-11: thirty-six colleges, one result. Navarro is
// the only one publishing a usable form, and it is the stock Sidearm
// Prospective Athlete Form with the sport dropdown ACTUALLY CONFIGURED —
// Baseball, Football, Men's Basketball, Softball, Women's Soccer, Women's
// Volleyball, plus cheer and eSports. That makes it the first school where
// form 3 earns rows, and it is the reason the dropdown is always worth
// rendering rather than assuming empty. San Jacinto ships the same form with
// nothing in the dropdown and gets none.
//
// Two things about that sweep worth reusing. Guessing juco athletics domains
// does not work — six of thirty-six guesses resolved, and the ones that did
// were not predictable from the mascot. The reliable route is the college's
// own .edu homepage, which links its athletics site whatever it is called.
// And Kilgore's only recruiting-looking link is a Google Form titled "June
// 30th/July 1st Youth Skills Camp" — a camp registration, not a
// questionnaire, in the same family as the Boise State ticket form.
//
// That family now has four members and all four are Google Forms: Rice women's
// basketball ("Alumni Information"), Boise State football (a premium seating
// ticket request), Kilgore (a youth skills camp), and Cameron baseball, whose
// forms.gle short link resolves to "Cameron Baseball Alumni Info" and is closed
// to responses besides. A forms.gle link hides its destination until it is
// followed, and curl cannot follow it — the redirect is done in JavaScript, so
// only a real browser reveals the title. Never accept a Google Form on the
// strength of the page that links it.
//
// Five now, and one counter-example. Mizzou's volleyball page links a Google
// Form called "Mizzou Volleyball - 2026 Season - Youth Game Day Helpers Sign
// up"; their real questionnaire is on ARMS, on the same page. But Bethany
// College's men's basketball form IS a genuine Google Form, correctly titled,
// and it is the only questionnaire that programme publishes. So the rule is not
// "skip Google Forms" — it is "open the form and read its own title", which
// costs one browser load and has now been right five times out of six.
//
// Nebraska, 2026-09-11, is the worst split identity found so far: the same
// university under "University of Nebraska" AND "University of Nebraska-
// Lincoln", and Omaha under "University of Nebraska Omaha" AND "University of
// Nebraska - Omaha". Two Lincoln rows pointed at the SAME ARMS forms already
// listed under the other spelling, so one programme's questionnaire appeared
// twice under two school names while each name got half a directory page.
//
// Check for this after every sweep. The dedupe key is (school, gender, sport),
// so a second spelling of a school defeats it silently — UC Davis, UT Tyler and
// now Nebraska twice. A same-URL-different-school count catches it in one pass.
//
// Two corrections from the Minnesota and Wisconsin sweep, 2026-09-11.
//
// ARI Recruiting is NOT universally dead. The earlier note said to assume it
// was, on three dead examples; Macalester's forms are live and complete, one
// per programme, thirty fields each. Three retired forms were three retired
// forms, not a dead platform. Render it.
//
// A Sidearm page with only three or four inputs can still be a real
// questionnaire: St. Olaf, Concordia Wisconsin, Bethel and UW-Eau Claire all
// EMBED a FrontRush form in an iframe, so the host page shows nothing but its
// own site search while the questionnaire loads inside. Rows here point at the
// school's own page rather than the raw iframe URL, which keeps the school's
// branding and survives them switching provider. Counting inputs on the outer
// page would have discarded all four schools.
//
// A recheck on 2026-09-11 revisited every school this session rejected for
// "no fields on the page" and recovered thirteen rows. St. Edward's tennis,
// Briar Cliff football and men's basketball all embed FrontRush. Coastal Bend
// publishes a genuine per-sport "Information Form" with forty-odd fields — the
// first pass had hit an HTTP 202 with an empty body and read that as no form.
// South Puget Sound's landing page carries no form but links one that does.
//
// Correctly rejected, for the record, so nobody re-checks them again: Alvin
// Community College's recruiting page says "Move along. Nothing to see here";
// West Valley links only an ALUMNI questionnaire; Umpqua, Linn-Benton and
// Grand View's "2026-2027 Recruits" have no form and no link to one; and
// Nevada's form 6 renders a heading and a Print button.
//
// The lesson is that one negative signal is not enough. Inputs on the page,
// iframes, outbound links and the HTTP status each miss a different real case.
//
// Split identities are more common than they look, and the same-URL test only
// catches half of them. On 2026-09-11 a NORMALISED-NAME pass — lowercase, strip
// every non-letter, compare — found nine more pairs the URL test could not see,
// because each spelling carried a different form: Hawai'i under THREE spellings
// (ASCII apostrophe, U+02BB okina, and none), Maryland Baltimore County under
// three (dash, comma, neither), plus Minnesota State Mankato, Montana State
// Billings, UMass Amherst, Illinois Chicago and Indiana University.
//
// Run both checks after any sweep: same full URL under two school names, and
// normalised-name collisions. Neither finds what the other does.
//
// Georgia and Florida, 2026-09-11, brought the Google Form tally to eight
// wrong forms found, and seven of the eight are alumni or events rather than
// recruiting: Rice women's basketball, Boise State football (ticket request),
// Kilgore (youth camp), Cameron baseball, Winona State (booster club), Mizzou
// volleyball (game-day helpers), Florida State volleyball and Florida Tech
// women's soccer. One Google Form in nine has been genuine (Bethany College).
//
// Florida Tech's arrived wrapped in an Outlook safelink around a forms.gle
// short link around the real docs.google URL — three redirects, none of which
// reveal the title. Only a rendered browser does.
//
// The Carolinas, 2026-09-11, took the Google Form count to ten wrong forms
// against two genuine ones. Clemson softball links "2026 Clemson Softball
// Media Credential Requests", closed to responses; North Carolina men's tennis
// links "Carolina Tennis Circle", a membership organisation. But North
// Carolina VOLLEYBALL's Google Form is real and correctly titled, and it sits
// two sport pages away from the tennis one. Same athletic department, one
// genuine and one not — which is why the rule is to open every one.
//
// Two more hosts confirmed dead here: Charlotte's JotForm answers "This form
// is currently unavailable", and Duke's collegewarroom.com football form fails
// exactly as BYU's did. collegewarroom has never returned a working form.
//
// Two Tennessee traps are worth naming because both sat on a SPORT page rather
// than a general one, which is where they are hardest to doubt: Lipscomb's
// baseball page links "Lipscomb Baseball Alumni Info", and their men's AND
// women's basketball pages both link "Lipscomb Basketball Credential Request",
// a press credential form sitting on two recruiting pages. Memphis volleyball's
// Google Form is genuine. Twelve wrong Google Forms now against three real.
//
// And verify the DOMAIN belongs to the school you think it does. vuathletics
// .com is Vincennes University in Indiana, not Virginia Union; bceagles.com is
// Boston College, not Bridgewater. Both would have filed another state's forms
// under a Virginia school, and both were caught only because the domain pass
// prints each site's own title. Always print the title.
//
// Ohio and Kentucky, 2026-09-11, take the Google Form tally to fifteen wrong
// against three genuine. Akron softball and Morehead State baseball both link
// forms titled "... Alumni", and Wright State links a "Wright State Athletics
// Partnership Interest Form" — a SPONSORSHIP enquiry — from three separate
// sport pages: baseball, men's basketball and women's basketball. One wrong
// link reached from three recruiting pages is the pattern to watch for; the
// same URL appearing under several sports usually means it belongs to none.
//
// Michigan, Pennsylvania and Hawai'i, 2026-09-11. Google Forms now stand at
// seventeen wrong against four genuine, and a JotForm joined them: Drexel's
// women's soccer page links "Drexel Women's Soccer Alumni Questionnaire". The
// hosting platform predicts nothing. Central Michigan links "CMU Soccer Free
// Clinic", Shippensburg links "SUSB Alumni Questionnaire", Oakland's link is a
// dead Drive file — while Ferris State's football Google Form is real.
//
// A reminder to the next person who writes a deadness check, because this cost
// time twice: do NOT match on the bare words "unavailable" or "not available".
// JumpForward's client-side validation script contains both, so every live
// JumpForward form reads as dead. Match the exact copy a dead form shows.
//
// Fourteen alumni forms dropped here too. Toledo, Akron, Miami and Bowling
// Green all publish paired recruiting and alumni questionnaires.
// Washington was swept school by school on 2026-09-07, going from 4 schools to
// 12. Three things that sweep taught, worth reusing on the next state:
//
//   - ARMS titles are readable without a browser. The page is an Angular shell,
//     but GET /arms/api/public/questionnaires/<hash> with an Accept and a
//     Content-Type of application/json returns questionnaireTitle and
//     questionnaireEnabled. Without those headers it answers 415. That turns
//     "load 24 pages and wait for JS" into one fast loop.
//   - Schools hide their forms in three different places: an on-site form
//     (/form/N or /sb_output.aspx?form=N), a per-sport link in the sport page's
//     nav, or a single hub page. Sweeping form numbers alone found only Gonzaga
//     here; scraping sport pages found Pacific Lutheran, Whitworth and
//     Washington State. Do both.
//   - Nav anchor text beats the questionnaire's own title. Whitworth's softball
//     form is titled "Athletics Questionaire Basic Info" and its nav label is
//     "Softball". The label is what the school means.
//
// Two Washington schools were checked and deliberately left out. Eastern
// Washington and Western Washington publish no recruiting form on any of those
// three surfaces. Evergreen State is not a search miss either — it has no
// athletics site left to search.
//
// Washington State's volleyball link is the third instance of the bio-form
// trap: it is a "WSU Signee Questionnaire", for athletes who already signed.
// Football and women's basketball are the only two WSU forms here.
//
// One mechanical hazard, learned by breaking it. The last element of this
// array carries no trailing comma, so a script that appends a row after it
// produces two adjacent array literals. That is not a syntax error — JS reads
// it as a computed member access, and the row before it silently disappears
// while the file still parses. Any script that inserts rows must check the
// exported length afterwards, not just that the import succeeded.
//
// Oregon swept 2026-09-07, 3 schools to 11. Same method, and it hardened one
// rule: read the form before trusting its name. Seven Oregon forms carry the
// word "questionnaire" and are for athletes who already signed — Oregon
// State's "Basketball Newcomer Questionnaire" asks your contemplated
// profession and your favourite athlete, its "Softball Questionnaire" says
// outright that the Sports Information Office will use it for publicity, and
// Pacific University's and Linfield's only forms are publicity forms too.
// Pacific and Linfield are therefore absent on purpose: neither publishes a
// recruiting form at all.
//
// Corban is the model everyone else should copy — it labels its two forms
// "Prospective Athlete Form (Unsigned Recruits ONLY)" and "Player Information
// (Signed Recruits ONLY)", which removes the guesswork entirely.
//
// Western Oregon's men's basketball form is missing here because their own
// nav link to it 404s. Their other eight work. Willamette blocks automated
// requests at the CDN (its own error page, not a bot wall we should evade),
// so it was never checked rather than checked and found empty. Warner Pacific
// has no athletics site left and Multnomah is now part of Jessup.
//
// Both sweeps covered four-year schools only. Neither state's NWAC junior
// colleges were touched, and those are where a lot of realistic landing spots
// live — worth its own pass.
//
// That pass ran the same day. NWAC has about 34 members and six are here, the
// six whose own forms name the gender: Clark, Grays Harbor, Highline,
// Columbia Basin, Everett and Lane. The rest are unfinished, not absent, and
// the reason is worth writing down.
//
// A junior-college "Prospective Athlete Form" is usually athletics-wide with a
// free-text sport box, so nothing on the page says whether the school fields
// men's soccer, women's soccer or both. Guessing would put a boy in front of a
// women's programme. NWAC's own team listings answer it, and the URL shape is
//
//     https://nwacsports.org/sports/<code>/<season>/teams
//
// with these codes — the ones worth writing down because four of them are not
// what you would guess: bsb baseball, sball softball (not sb), wvball
// volleyball (not vb), mbkb and wbkb basketball, msoc and wsoc soccer, track,
// xc, mgolf and wgolf. Each sport also runs on its own season string: the
// autumn sports were on 2026-27 and the spring ones on 2025-26 when this was
// written, so a listing that 404s usually wants the other year, not a
// different code.
//
// Verified against three schools whose own forms already told us the answer:
// Columbia Basin matched all seven of its sports, Grays Harbor matched its
// four exactly, and Highline correctly came back with no baseball. Yakima
// Valley, Lower Columbia and Southwestern Oregon went in on the strength of
// that. NWAC throttles — sustained parallel requests start returning 202
// rather than 200, and the fix is to wait twenty seconds and retry, not to
// conclude the page is missing.
//
// Its track code is ungendered, so track and field cannot be split into men's
// and women's rows this way. Any NWAC track row needs the school's own form to
// say.
//
// Sixteen NWAC schools are now here. Where the school's own form lists its
// sports, that list wins over NWAC's — Skagit Valley fields softball and
// volleyball but its form offers neither, so it carries three rows, not five.
// The form is what the school will actually accept.
//
// Nine members are still out, each for a stated reason rather than for not
// being looked at:
//
//   - Umpqua, Linn-Benton, South Puget Sound, Big Bend: recruit pages render
//     entirely in JavaScript. Their CDN also refuses our headless browser with
//     a 403 while accepting a desktop user-agent from a plain fetch, so the
//     one tool that could run their scripts is the one they block. Nothing was
//     readable, so nothing was recorded.
//   - Whatcom, Treasure Valley: 403 to everything tried.
//   - Spokane: athletics.spokane.edu is one site for two colleges, Spokane and
//     Spokane Falls. A single school name on that row would be a guess about
//     which programme a recruit reaches.
//   - Bellevue, Green River, Centralia, Peninsula, Shoreline, Clackamas,
//     Columbia Gorge, Klamath, Mt. Hood, Rogue, Chemeketa, Wenatchee Valley,
//     Blue Mountain: no recruiting form found on the surfaces checked.
//     Wenatchee publishes printable PDFs only and Chemeketa a bare Google
//     Form; both were left out as unverifiable rather than wrong.
//
// Big Bend, Lane and Willamette share a smaller obstacle: their CDN answers a
// plain browser with 403 and only a desktop user-agent gets through. Lane is
// here because that request confirmed a real form behind it (GPA, graduation
// year, a Hudl field). Big Bend's pages render entirely in JavaScript and
// returned nothing to read, so it is left out rather than guessed at.

export const QUESTIONNAIRES = [
  ["Academy of Art University","CA","D2","Men","Baseball","https://college.jumpforward.com/questionnaire.aspx?iid=1748&sportid=16"],
  ["Ashland University","OH","D2","Men","Baseball","https://questionnaires.armssoftware.com/67246832af7e"],
  ["Ball State University","IN","D1","Men","Baseball","https://questionnaires.armssoftware.com/ff7f8c2e511d"],
  ["Baylor University","TX","D1","Men","Baseball","https://questionnaires.armssoftware.com/aa72ebcc5cb6"],
  ["Bemidji State University","MN","D2","Men","Baseball","https://questionnaires.armssoftware.com/17db8703544f"],
  ["Bethel University","MN","D3","Men","Baseball","https://athletics.bethel.edu/sports/2023/9/14/recruits.aspx?path=baseball"],
  ["Boise State University","ID","D1","Men","Baseball","https://questionnaires.armssoftware.com/a751bd1a63a5"],
  ["Bowling Green State University","OH","D1","Men","Baseball","https://questionnaires.armssoftware.com/bcb890208175"],
  ["Bushnell University","OR","NAIA","Men","Baseball","https://bushnellbeacons.com/sb_output.aspx?form=38"],
  ["California Polytechnic State University","CA","D1","Men","Baseball","https://questionnaires.armssoftware.com/2bbfb412a984"],
  ["California State University, Bakersfield","CA","D1","Men","Baseball","https://questionnaires.armssoftware.com/2ce30fe34df5"],
  ["California State University, Northridge","CA","D1","Men","Baseball","https://questionnaires.armssoftware.com/4eaeb5c73315"],
  ["Carleton College","MN","D3","Men","Baseball","https://questionnaires.armssoftware.com/2aa36bf19a5e"],
  ["Central Washington University","WA","D2","Men","Baseball","https://wildcatsports.com/sb_output.aspx?form=3"],
  ["Clark College","WA","JUCO","Men","Baseball","https://clarkpenguins.com/sb_output.aspx?form=3"],
  ["Clemson University","SC","D1","Men","Baseball","https://questionnaires.armssoftware.com/02d2cc79da2c"],
  ["Coastal Bend College","TX","JUCO","Men","Baseball","https://www.cbcathletics.com/sports/bsb/recruit"],
  ["Concordia University Irvine","CA","D2","Men","Baseball","https://questionnaires.armssoftware.com/bfea8fd7e432"],
  ["Corban University","OR","NAIA","Men","Baseball","https://corbanwarriors.com/sb_output.aspx?form=3&tab=prospectivestudent-athletequestionnaire"],
  ["Creighton University","NE","D1","Men","Baseball","https://questionnaires.armssoftware.com/5701c948dab5"],
  ["Davidson College","NC","D1","Men","Baseball","https://questionnaires.armssoftware.com/c9265ba08601"],
  ["Duke University","NC","D1","Men","Baseball","https://questionnaires.armssoftware.com/cbbc86f9e17d"],
  ["East Carolina University","NC","D1","Men","Baseball","https://questionnaires.armssoftware.com/1c0400d4bccb"],
  ["Eastern Michigan University","MI","D1","Men","Baseball","https://questionnaires.armssoftware.com/bb8389b142dd"],
  ["Eastern Oregon University","OR","NAIA","Men","Baseball","https://eousports.com/sb_output.aspx?form=3"],
  ["Edmonds College","WA","JUCO","Men","Baseball","https://www.edmonds.edu/campus-life/triton-athletics/prosp-athlete-form.html"],
  ["Emory University","GA","D3","Men","Baseball","https://questionnaires.armssoftware.com/1bf24edf5a62"],
  ["Everett Community College","WA","JUCO","Men","Baseball","https://athletics.everettcc.edu/Recruits/Recruiting_Form_-_Baseball"],
  ["Florida Atlantic University","FL","D1","Men","Baseball","https://questionnaires.armssoftware.com/4dcc55bdd441"],
  ["Franklin & Marshall College","PA","D3","Men","Baseball","https://questionnaires.armssoftware.com/5adb85ec2007"],
  ["Fresno State University","CA","D1","Men","Baseball","https://questionnaires.armssoftware.com/37d495904c99"],
  ["Gardner-Webb University","NC","D1","Men","Baseball","https://questionnaires.armssoftware.com/9e3e9fbd1b30"],
  ["GateWay Community College","AZ","JUCO","Men","Baseball","https://questionnaires.armssoftware.com/0c15b5258d08"],
  ["George Fox University","OR","D3","Men","Baseball","https://athletics.georgefox.edu/sb_output.aspx?form=3"],
  ["Georgetown University","DC","D1","Men","Baseball","https://questionnaires.armssoftware.com/f3b59e9c95cc"],
  ["Gonzaga University","WA","D1","Men","Baseball","https://gozags.com/sb_output.aspx?form=3"],
  ["Grays Harbor College","WA","JUCO","Men","Baseball","https://ghcathletics.com/sb_output.aspx?form=3"],
  ["Kent State University","OH","D1","Men","Baseball","https://college.jumpforward.com/questionnaire.aspx?iid=339&sportid=16"],
  ["Kutztown University","PA","D2","Men","Baseball","https://questionnaires.armssoftware.com/bb7c15b54b87"],
  ["Lane Community College","OR","JUCO","Men","Baseball","https://www.lanetitans.com/sports/bsb/2018-19/questionnaire"],
  ["Lewis & Clark College","OR","D3","Men","Baseball","https://apply.lclark.edu/register/recruit"],
  ["Long Beach State University","CA","D1","Men","Baseball","https://questionnaires.armssoftware.com/275b1cfd1f07"],
  ["Lower Columbia College","WA","JUCO","Men","Baseball","https://lccreddevils.com/sb_output.aspx?form=3"],
  ["Macalester College","MN","D3","Men","Baseball","https://forms.arirecruiting.com/forms/macalestercollege_m.baseball/form"],
  ["McNeese State University","LA","D1","Men","Baseball","https://mcneesesports.com/documents/2016/8/18/Baseball_Questionnaire.pdf"],
  ["Mercyhurst University","PA","D1","Men","Baseball","https://questionnaires.armssoftware.com/408de3495b08"],
  ["Miami University","OH","D1","Men","Baseball","https://questionnaires.armssoftware.com/43e111d5cebf"],
  ["Michigan State University","MI","D1","Men","Baseball","https://questionnaires.armssoftware.com/a167f22557e3"],
  ["Millersville University","PA","D2","Men","Baseball","https://questionnaires.armssoftware.com/2177cbab768d"],
  ["Missouri State University","MO","D1","Men","Baseball","https://questionnaires.armssoftware.com/ac773b3781bd"],
  ["Monterey Peninsula College","CA","JUCO","Men","Baseball","https://docs.google.com/forms/d/e/1FAIpQLSdqp7elE81KsiwR5e7hd-HC38enn6rSixOq5gS72YwVdD8Z5A/viewform"],
  ["Navarro College","TX","JUCO","Men","Baseball","https://navarrobulldogs.com/sb_output.aspx?form=3"],
  ["Norfolk State University","VA","D1","Men","Baseball","https://questionnaires.armssoftware.com/99f120fb5009"],
  ["Ohio University","OH","D1","Men","Baseball","https://questionnaires.armssoftware.com/38e23199baeb"],
  ["Oklahoma Baptist University","OK","D2","Men","Baseball","https://questionnaires.armssoftware.com/e592848c039e"],
  ["Old Dominion University","VA","D1","Men","Baseball","https://questionnaires.armssoftware.com/b4ac421eb08e"],
  ["Olivet Nazarene University","IL","NAIA","Men","Baseball","https://onutigers.com/sports/bsb/Baseball_Recruiting_Form_2"],
  ["Olympic College","WA","JUCO","Men","Baseball","https://olympicrangers.com/landing/recruit_form"],
  ["Oregon Institute of Technology","OR","NAIA","Men","Baseball","https://oregontechowls.com/sb_output.aspx?form=3"],
  ["Oregon State University","OR","D1","Men","Baseball","https://osubeavers.com/form/3"],
  ["Pacific Lutheran University","WA","D3","Men","Baseball","https://questionnaires.armssoftware.com/c1f4194de1a4"],
  ["Pennsylvania State University","PA","D1","Men","Baseball","https://questionnaires.armssoftware.com/06f443a331a0"],
  ["Pepperdine University","CA","D1","Men","Baseball","https://questionnaires.armssoftware.com/3bedf6b49b6a"],
  ["Pierce College","WA","JUCO","Men","Baseball","https://pierceraiders.com/general/2026Prospective_Athlete_Form"],
  ["Purdue University","IN","D1","Men","Baseball","https://questionnaires.armssoftware.com/6d9b351b7878"],
  ["Rice University","TX","D1","Men","Baseball","https://questionnaires.armssoftware.com/2d3fd1563dd4"],
  ["Saint Leo University","FL","D2","Men","Baseball","https://questionnaires.armssoftware.com/5b39fc8ae19c"],
  ["Saint Martin's University","WA","D2","Men","Baseball","https://admissions.stmartin.edu/register/athletic_inquiry"],
  ["Saint Mary's College of California","CA","D1","Men","Baseball","https://questionnaires.armssoftware.com/4f1bc3ec2d07"],
  ["Sam Houston State University","TX","D1","Men","Baseball","https://questionnaires.armssoftware.com/b60b2e11469d"],
  ["Sewanee: The University of the South","TN","D3","Men","Baseball","https://questionnaires.armssoftware.com/7dfbf157d5c2"],
  ["Skagit Valley College","WA","JUCO","Men","Baseball","https://www.skagit.edu/sports_recruitment_form.asp"],
  ["Southwestern Oregon Community College","OR","JUCO","Men","Baseball","https://swoccathletics.com/sb_output.aspx?form=31"],
  ["St. John's University","NY","D1","Men","Baseball","https://questionnaires.armssoftware.com/6f362348831a"],
  ["St. Olaf College","MN","D3","Men","Baseball","https://athletics.stolaf.edu/sports/2016/9/14/baseball-recruit-questionnaire"],
  ["Stanford University","CA","D1","Men","Baseball","https://questionnaires.armssoftware.com/8a6fc83b3ecb"],
  ["Tacoma Community College","WA","JUCO","Men","Baseball","https://tacomatitans.com/information/recruiting-form"],
  ["Texas A&M University","TX","D1","Men","Baseball","https://questionnaires.armssoftware.com/de32b8fddd8b"],
  ["United States Air Force Academy","CO","D1","Men","Baseball","https://questionnaires.armssoftware.com/d226f367ec44"],
  ["University of Akron","OH","D1","Men","Baseball","https://questionnaires.armssoftware.com/cf4ba5c1cd26"],
  ["University of California, Davis","CA","D1","Men","Baseball","https://questionnaires.armssoftware.com/d4c54a0b4ff5"],
  ["University of California, Irvine","CA","D1","Men","Baseball","https://questionnaires.armssoftware.com/a3061efcaff7"],
  ["University of Central Florida","FL","D1","Men","Baseball","https://questionnaires.armssoftware.com/71e084e9b068"],
  ["University of Cincinnati","OH","D1","Men","Baseball","https://questionnaires.armssoftware.com/effe0ba96a2b"],
  ["University of Connecticut","CT","D1","Men","Baseball","https://questionnaires.armssoftware.com/e5b8b64ccee1"],
  ["University of Houston","TX","D1","Men","Baseball","https://questionnaires.armssoftware.com/34804a5863c1"],
  ["University of Illinois","IL","D1","Men","Baseball","https://college.jumpforward.com/questionnaire.aspx?iid=403&sportid=16"],
  ["University of Iowa","IA","D1","Men","Baseball","https://questionnaires.armssoftware.com/ee204abe4540"],
  ["University of Lynchburg","VA","D3","Men","Baseball","https://forms.arirecruiting.com/lynchburg_baseball/recruit"],
  ["University of Michigan","MI","D1","Men","Baseball","https://questionnaires.armssoftware.com/712374407349"],
  ["University of Minnesota","MN","D1","Men","Baseball","https://questionnaires.armssoftware.com/ba062109008a"],
  ["University of Missouri","MO","D1","Men","Baseball","https://questionnaires.armssoftware.com/dd353493bf9f"],
  ["University of Mount Olive","NC","D2","Men","Baseball","https://questionnaires.armssoftware.com/e7ebe73c445c"],
  ["University of Nebraska","NE","D1","Men","Baseball","https://questionnaires.armssoftware.com/eaf8257ee916"],
  ["University of Nebraska Omaha","NE","D1","Men","Baseball","https://questionnaires.armssoftware.com/d47ef2a77589"],
  ["University of New Mexico","NM","D1","Men","Baseball","https://questionnaires.armssoftware.com/013220e68a94"],
  ["University of North Florida","FL","D1","Men","Baseball","https://questionnaires.armssoftware.com/683db1d1a427"],
  ["University of Oregon","OR","D1","Men","Baseball","https://goducks.com/form/3"],
  ["University of Pennsylvania","PA","D1","Men","Baseball","https://questionnaires.armssoftware.com/b5d390bb357d"],
  ["University of Portland","OR","D1","Men","Baseball","https://portlandpilots.com/sb_output.aspx?form=39"],
  ["University of Richmond","VA","D1","Men","Baseball","https://questionnaires.armssoftware.com/857fd4a4300a"],
  ["University of South Carolina","SC","D1","Men","Baseball","https://questionnaires.armssoftware.com/1991290936f2"],
  ["University of South Carolina Upstate","SC","D1","Men","Baseball","https://questionnaires.armssoftware.com/fab529d465ea"],
  ["University of South Florida","FL","D1","Men","Baseball","https://questionnaires.armssoftware.com/2c3370ff1737"],
  ["University of Southern California","CA","D1","Men","Baseball","https://questionnaires.armssoftware.com/d770b75a86a7"],
  ["University of Southern Indiana","IN","D1","Men","Baseball","https://questionnaires.armssoftware.com/553cfb730504"],
  ["University of Texas at Dallas","TX","D3","Men","Baseball","https://questionnaires.armssoftware.com/63ec42f32a7e"],
  ["University of Texas at Tyler","TX","D2","Men","Baseball","https://questionnaires.armssoftware.com/cb068b31f254"],
  ["University of Toledo","OH","D1","Men","Baseball","https://questionnaires.armssoftware.com/f49d6ebcdcd1"],
  ["University of Virginia","VA","D1","Men","Baseball","https://questionnaires.armssoftware.com/4d8cc626aeb6"],
  ["University of Wisconsin-Whitewater","WI","D3","Men","Baseball","https://college.jumpforward.com/questionnaire.aspx?iid=1616&sportid=16"],
  ["Utah Valley University","UT","D1","Men","Baseball","https://college.jumpforward.com/questionnaire.aspx?iid=361&sportid=16"],
  ["Valparaiso University","IN","D1","Men","Baseball","https://questionnaires.armssoftware.com/caea154b13c9"],
  ["Villanova University","PA","D1","Men","Baseball","https://questionnaires.armssoftware.com/b483bab561ed"],
  ["Wake Forest University","NC","D1","Men","Baseball","https://questionnaires.armssoftware.com/32470f7d9cd3"],
  ["Walla Walla Community College","WA","JUCO","Men","Baseball","https://slate.wwcc.edu/register/athletic-recruits"],
  ["Western Kentucky University","KY","D1","Men","Baseball","https://college.jumpforward.com/questionnaire.aspx?iid=370&sportid=16"],
  ["Western Oregon University","OR","D2","Men","Baseball","https://wouwolves.com/sb_output.aspx?form=61"],
  ["Whitman College","WA","D3","Men","Baseball","https://whitmanblues.com/sb_output.aspx?form=3"],
  ["Wright State University","OH","D1","Men","Baseball","https://questionnaires.armssoftware.com/2cb2198c3563"],
  ["Xavier University","OH","D1","Men","Baseball","https://questionnaires.armssoftware.com/2610b6f44c53"],
  ["Yakima Valley College","WA","JUCO","Men","Baseball","https://goyaks.com/sb_output.aspx?form=3"],
  ["Academy of Art University","CA","D2","Men","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=1748&sportid=15"],
  ["Academy of Art University","CA","D2","Women","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=1748&sportid=3"],
  ["Allegany College of Maryland","MD","JUCO","Both","Basketball","https://acmtrojans.com/sb_output.aspx?form=3"],
  ["Arizona Christian University","AZ","NAIA","Men","Basketball","https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=MjQwNzM=-lV9YnCFc48E=&ptype=recruit&path=mbball"],
  ["Ashland University","OH","D2","Men","Basketball","https://questionnaires.armssoftware.com/524c0efbc054"],
  ["Ashland University","OH","D2","Women","Basketball","https://questionnaires.armssoftware.com/995b0bc748b1"],
  ["Ball State University","IN","D1","Men","Basketball","https://questionnaires.armssoftware.com/d5b46df282c6"],
  ["Ball State University","IN","D1","Women","Basketball","https://questionnaires.armssoftware.com/f2e7459f60cb"],
  ["Bethany College","KS","NAIA","Men","Basketball","https://docs.google.com/forms/d/e/1FAIpQLSeM-uR0K6Ep0-WQrh79dkLiAslmu4MKFm2lbinn_tmjp30whQ/viewform"],
  ["Bethel University","MN","D3","Men","Basketball","https://athletics.bethel.edu/sports/2023/9/14/recruits.aspx?path=mbball"],
  ["Bethel University","MN","D3","Women","Basketball","https://athletics.bethel.edu/sports/2023/9/14/recruits.aspx?path=wbball"],
  ["Bethel University Indiana","IN","NAIA","Women","Basketball","https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=MjM2MDk=-o/D/ro//Ok0=&ptype=recruit"],
  ["Bowling Green State University","OH","D1","Men","Basketball","https://questionnaires.armssoftware.com/3c0bfb0acbc5"],
  ["Briar Cliff University","IA","NAIA","Men","Basketball","https://bcuchargers.com/sports/2024/5/21/mens-basketball-recruit-questionnaire.aspx"],
  ["Bushnell University","OR","NAIA","Women","Basketball","https://bushnellbeacons.com/sb_output.aspx?form=21"],
  ["Bushnell University","OR","NAIA","Men","Basketball","https://bushnellbeacons.com/sb_output.aspx?form=20"],
  ["California Polytechnic State University","CA","D1","Men","Basketball","https://questionnaires.armssoftware.com/db385f9c05be"],
  ["California State University, Northridge","CA","D1","Men","Basketball","https://questionnaires.armssoftware.com/2725e7649df8"],
  ["California State University, Northridge","CA","D1","Women","Basketball","https://questionnaires.armssoftware.com/1e238e3e2a98"],
  ["Canisius University","NY","D1","Men","Basketball","https://gogriffs.com/sb_output.aspx?form=6"],
  ["Carleton College","MN","D3","Men","Basketball","https://questionnaires.armssoftware.com/36394aed2d63"],
  ["Carleton College","MN","D3","Women","Basketball","https://questionnaires.armssoftware.com/e586544969b7"],
  ["Carnegie Mellon University","PA","D3","Men","Basketball","https://questionnaires.armssoftware.com/4a65c03963ec"],
  ["Carnegie Mellon University","PA","D3","Women","Basketball","https://questionnaires.armssoftware.com/6aecf53dbb03"],
  ["Central Maine Community College","ME","JUCO","Men","Basketball","https://www.cmmustangs.com/information/recruiting/mbkb_recruit"],
  ["Central Washington University","WA","D2","Both","Basketball","https://wildcatsports.com/sb_output.aspx?form=3"],
  ["Clark College","WA","JUCO","Both","Basketball","https://clarkpenguins.com/sb_output.aspx?form=3"],
  ["Coastal Bend College","TX","JUCO","Men","Basketball","https://www.cbcathletics.com/sports/mbkb/recruit"],
  ["Coastal Bend College","TX","JUCO","Women","Basketball","https://www.cbcathletics.com/sports/wbkb/recruit"],
  ["Colorado School of Mines","CO","D2","Men","Basketball","https://questionnaires.armssoftware.com/3aa1ad3e9870"],
  ["Colorado State University","CO","D1","Men","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=1606&sportid=15"],
  ["Columbia Basin College","WA","JUCO","Women","Basketball","https://cbchawks.com/sb_output.aspx?form=1017"],
  ["Columbia Basin College","WA","JUCO","Men","Basketball","https://cbchawks.com/sb_output.aspx?form=1016"],
  ["Concordia University Irvine","CA","D2","Men","Basketball","https://questionnaires.armssoftware.com/b5952e9d940c"],
  ["Concordia University Irvine","CA","D2","Women","Basketball","https://questionnaires.armssoftware.com/2196524f1528"],
  ["Concordia University Wisconsin","WI","D3","Men","Basketball","https://cuwfalcons.com/sports/2025/7/3/mens-basketball-recruit-me.aspx"],
  ["Corban University","OR","NAIA","Both","Basketball","https://corbanwarriors.com/sb_output.aspx?form=3&tab=prospectivestudent-athletequestionnaire"],
  ["Dakota State University","SD","NAIA","Men","Basketball","https://dsuathletics.com/sb_output.aspx?form=6"],
  ["Davidson College","NC","D1","Women","Basketball","https://questionnaires.armssoftware.com/8add413cd574"],
  ["Daytona State College","FL","JUCO","Women","Basketball","https://dscfalcons.com/sports/wbkb/RecruIt_Questionnaire"],
  ["Delaware State University","DE","D1","Men","Basketball","https://questionnaires.armssoftware.com/a8afdc2bf465"],
  ["Dominican University New York","NY","D2","Men","Basketball","https://questionnaires.armssoftware.com/b6891d1e43a2"],
  ["East Georgia State College","GA","JUCO","Both","Basketball","https://www.ega.edu/athletics/recruit-questionnaire.html"],
  ["Eastern Michigan University","MI","D1","Men","Basketball","https://questionnaires.armssoftware.com/637c6b3344a7"],
  ["Eastern Michigan University","MI","D1","Women","Basketball","https://questionnaires.armssoftware.com/fd7803f30df4"],
  ["Eastern Oregon University","OR","NAIA","Both","Basketball","https://eousports.com/sb_output.aspx?form=3"],
  ["Eastern University","PA","D3","Men","Basketball","https://goeasterneagles.com/sb_output.aspx?frform=3&path=mbball"],
  ["Edmonds College","WA","JUCO","Both","Basketball","https://www.edmonds.edu/campus-life/triton-athletics/prosp-athlete-form.html"],
  ["Everett Community College","WA","JUCO","Women","Basketball","https://athletics.everettcc.edu/Recruits/Recruiting_Form_-_Women-s_Basketball"],
  ["Everett Community College","WA","JUCO","Men","Basketball","https://athletics.everettcc.edu/Recruits/Recruiting_Form_-_Men-s_Basketball"],
  ["Ferris State University","MI","D2","Women","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=1771&sportid=3"],
  ["Florida Institute of Technology","FL","D2","Men","Basketball","https://floridatechsports.com/sb_output.aspx?form=40"],
  ["Florida State College at Jacksonville","FL","JUCO","Men","Basketball","https://fscjmantarays.com/sports/mbkb/questionnaire"],
  ["Franklin & Marshall College","PA","D3","Men","Basketball","https://questionnaires.armssoftware.com/ac133c0dfd56"],
  ["Franklin & Marshall College","PA","D3","Women","Basketball","https://questionnaires.armssoftware.com/48faa7ab77c4"],
  ["Fresno State University","CA","D1","Men","Basketball","https://questionnaires.armssoftware.com/1d04929038a4"],
  ["Fresno State University","CA","D1","Women","Basketball","https://questionnaires.armssoftware.com/c6f405caebf1"],
  ["Garden City Community College","KS","JUCO","Men","Basketball","https://www.gobroncbusters.com/information/mbkb-recuriting"],
  ["Gardner-Webb University","NC","D1","Men","Basketball","https://questionnaires.armssoftware.com/6f4206954975"],
  ["Gardner-Webb University","NC","D1","Women","Basketball","https://questionnaires.armssoftware.com/7a54d7025c09"],
  ["George Fox University","OR","D3","Both","Basketball","https://athletics.georgefox.edu/sb_output.aspx?form=3"],
  ["Georgia Institute of Technology","GA","D1","Both","Basketball","https://ramblinwreck.com/student-athlete-questionnaire/"],
  ["Georgia Southern University","GA","D1","Women","Basketball","https://questionnaires.armssoftware.com/8710142d5b95"],
  ["Georgia State University","GA","D1","Men","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=564&sportid=15"],
  ["Georgia State University","GA","D1","Women","Basketball","https://georgiastatesports.com/news/2008/11/1/3731625.aspx"],
  ["Gonzaga University","WA","D1","Both","Basketball","https://gozags.com/sb_output.aspx?form=3"],
  ["Grand Rapids Community College","MI","JUCO","Men","Basketball","https://grccraiders.com/sb_output.aspx?form=21"],
  ["Grays Harbor College","WA","JUCO","Men","Basketball","https://ghcathletics.com/sb_output.aspx?form=3"],
  ["Hamline University","MN","D3","Men","Basketball","https://hamlineathletics.com/sb_output.aspx?frform=2"],
  ["Hawai'i Pacific University","HI","D2","Both","Basketball","https://hpusharks.com/sb_output.aspx?form=3"],
  ["Highline College","WA","JUCO","Both","Basketball","https://highlineathletics.com/sb_output.aspx?form=3"],
  ["Illinois Institute of Technology","IL","D3","Both","Basketball","https://illinoistechathletics.com/sports/2023/7/13/recruit-form.aspx"],
  ["Illinois State University","IL","D1","Women","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=354&sportid=3"],
  ["Illinois Wesleyan University","IL","D3","Men","Basketball","https://www.iwusports.com/sb_output.aspx?frform=1"],
  ["Indiana State University","IN","D1","Men","Basketball","https://gosycamores.com/sb_output.aspx?form=14"],
  ["Indiana University Bloomington","IN","D1","Women","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=436&sportid=3"],
  ["Indiana University South Bend","IN","NAIA","Both","Basketball","https://iusbtitans.com/sb_output.aspx?form=6"],
  ["Indiana University Southeast","IN","NAIA","Both","Basketball","https://iusathletics.com/sb_output.aspx?form=3"],
  ["IU Indianapolis","IN","D1","Men","Basketball","https://questionnaires.armssoftware.com/1e2ec3958a81"],
  ["Iowa State University","IA","D1","Women","Basketball","https://questionnaires.armssoftware.com/ba63e6522f77"],
  ["Kansas City Kansas Community College","KS","JUCO","Men","Basketball","https://bluedevils.kckcc.edu/sports/mbkb/recruiting_questionnaire"],
  ["Kent State University","OH","D1","Women","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=339&sportid=3"],
  ["Kentucky State University","KY","D2","Both","Basketball","https://ksuthorobreds.com/sb_output.aspx?form=3"],
  ["Kutztown University","PA","D2","Men","Basketball","https://questionnaires.armssoftware.com/15c4f39b528f"],
  ["Kutztown University","PA","D2","Women","Basketball","https://questionnaires.armssoftware.com/735b6f52de71"],
  ["Lake Michigan College","MI","JUCO","Men","Basketball","https://redhawks.lakemichigancollege.edu/sports/mbkb/Men-s_basketball_recruit_form"],
  ["Lane Community College","OR","JUCO","Women","Basketball","https://www.lanetitans.com/sports/wbkb/2018-19/questionnaire"],
  ["Lane Community College","OR","JUCO","Men","Basketball","https://www.lanetitans.com/sports/mbkb/2018-19/questionnaire"],
  ["Lewis & Clark College","OR","D3","Both","Basketball","https://apply.lclark.edu/register/recruit"],
  ["Long Beach State University","CA","D1","Men","Basketball","https://questionnaires.armssoftware.com/01a70b483d08"],
  ["Long Beach State University","CA","D1","Women","Basketball","https://questionnaires.armssoftware.com/5f5640036931"],
  ["Louisiana Tech University","LA","D1","Women","Basketball","https://latechsports.com/sports/2018/7/20/ot-recruiting-questionnaires-html"],
  ["Lower Columbia College","WA","JUCO","Both","Basketball","https://lccreddevils.com/sb_output.aspx?form=3"],
  ["Macalester College","MN","D3","Men","Basketball","https://forms.arirecruiting.com/forms/macalestercollege_m.basketball/form"],
  ["Macalester College","MN","D3","Women","Basketball","https://forms.arirecruiting.com/forms/macalestercollege_w.basketball/form"],
  ["Maine Maritime Academy","ME","D3","Men","Basketball","https://questionnaires.armssoftware.com/5f0f295037b5"],
  ["Massachusetts College of Liberal Arts","MA","D3","Men","Basketball","https://athletics.mcla.edu/sports/mbkb/Recruit_Me"],
  ["Massachusetts Institute of Technology","MA","D3","Men","Basketball","https://questionnaires.armssoftware.com/307fecfb9396"],
  ["McNeese State University","LA","D1","Both","Basketball","https://mcneesesports.com/sb_output.aspx?form=3&tab=prospectiveathleteform"],
  ["Mercer University","GA","D1","Women","Basketball","https://questionnaires.armssoftware.com/afe5e171bc22"],
  ["Mercy University","NY","D2","Both","Basketball","https://mercyathletics.com/sb_output.aspx?form=7"],
  ["Mercyhurst University","PA","D1","Men","Basketball","https://questionnaires.armssoftware.com/85ed925cd048"],
  ["Mercyhurst University","PA","D1","Women","Basketball","https://questionnaires.armssoftware.com/faea88829968"],
  ["Miami University","OH","D1","Men","Basketball","https://questionnaires.armssoftware.com/adcbaa296673"],
  ["Miami University","OH","D1","Women","Basketball","https://questionnaires.armssoftware.com/fa5e4c891bb5"],
  ["Michigan Technological University","MI","D2","Men","Basketball","https://questionnaires.armssoftware.com/1f0f9b481572"],
  ["Millersville University","PA","D2","Men","Basketball","https://questionnaires.armssoftware.com/49eece0b5580"],
  ["Millersville University","PA","D2","Women","Basketball","https://questionnaires.armssoftware.com/103eab9b66b0"],
  ["Minnesota State University Mankato","MN","D2","Men","Basketball","https://questionnaires.armssoftware.com/6b36740adf92"],
  ["Mississippi State University","MS","D1","Men","Basketball","https://hailstate.com/form/9"],
  ["Mississippi State University","MS","D1","Women","Basketball","https://hailstate.com/form/2042"],
  ["Missouri Southern State University","MO","D2","Men","Basketball","https://questionnaires.armssoftware.com/3ed47a00a1b6"],
  ["Missouri State University","MO","D1","Men","Basketball","https://questionnaires.armssoftware.com/bd377e8cbcce"],
  ["Missouri State University","MO","D1","Women","Basketball","https://questionnaires.armssoftware.com/7fc6479d1124"],
  ["Montana State University","MT","D1","Men","Basketball","https://questionnaires.armssoftware.com/9f932dabdd0b"],
  ["Montana State University Billings","MT","D2","Men","Basketball","https://msubsports.com/sb_output.aspx?form=18"],
  ["Montana State University Northern","MT","NAIA","Both","Basketball","https://golightsgo.com/sb_output.aspx?form=3"],
  ["Monterey Peninsula College","CA","JUCO","Men","Basketball","https://docs.google.com/forms/d/e/1FAIpQLSc13yHx3jKzH7OM_IJ15QFiFaQsXORuo3MPrWOb6_eD63IcVA/viewform"],
  ["Monterey Peninsula College","CA","JUCO","Women","Basketball","https://docs.google.com/forms/d/e/1FAIpQLSfT5MqFMPHevFJZwtDxUFsqoQZdulP790rapsNkeSgsCIlxRw/viewform"],
  ["Navarro College","TX","JUCO","Men","Basketball","https://navarrobulldogs.com/sb_output.aspx?form=3"],
  ["New Jersey Institute of Technology","NJ","D1","Men","Basketball","https://questionnaires.armssoftware.com/3cb1c79fc8d0"],
  ["New Mexico State University","NM","D1","Men","Basketball","https://nmstatesports.com/sb_output.aspx?form=22"],
  ["Norfolk State University","VA","D1","Men","Basketball","https://questionnaires.armssoftware.com/7ba08045e850"],
  ["Norfolk State University","VA","D1","Women","Basketball","https://questionnaires.armssoftware.com/8f4a9b8a0c9d"],
  ["North Carolina State University","NC","D1","Both","Basketball","https://gopack.com/sports/2015/4/27/GEN_20140101185"],
  ["North Carolina Wesleyan University","NC","D3","Both","Basketball","https://ncwsports.com/sports/2024/7/19/prospective-student-athlete-questionnaire-forms.aspx"],
  ["North Dakota State University","ND","D1","Men","Basketball","https://questionnaires.armssoftware.com/d9b8c21c0ead"],
  ["Northern Illinois University","IL","D1","Men","Basketball","https://questionnaires.armssoftware.com/9accef2bda60"],
  ["Northern Oklahoma College","OK","JUCO","Both","Basketball","https://www.nocmavs.com/recruits"],
  ["Northwest University","WA","NAIA","Both","Basketball","https://nueagles.com/sb_output.aspx?form=3"],
  ["Occidental College","CA","D3","Men","Basketball","https://questionnaires.armssoftware.com/46ac2724567e"],
  ["Occidental College","CA","D3","Women","Basketball","https://questionnaires.armssoftware.com/321da5d97a32"],
  ["Ohio Christian University","OH","NAIA","Both","Basketball","https://ocutrailblazers.com/sports/2023/9/13/recruiting-questionnaires.aspx"],
  ["Oklahoma Baptist University","OK","D2","Men","Basketball","https://questionnaires.armssoftware.com/0199cbf2b50b"],
  ["Oklahoma Baptist University","OK","D2","Women","Basketball","https://questionnaires.armssoftware.com/7f9c04aca240"],
  ["Olympic College","WA","JUCO","Both","Basketball","https://olympicrangers.com/landing/recruit_form"],
  ["Oregon Institute of Technology","OR","NAIA","Both","Basketball","https://oregontechowls.com/sb_output.aspx?form=3"],
  ["Oregon State University","OR","D1","Both","Basketball","https://osubeavers.com/form/3"],
  ["Pacific Lutheran University","WA","D3","Women","Basketball","https://questionnaires.armssoftware.com/4977abc94a6c"],
  ["Pacific Lutheran University","WA","D3","Men","Basketball","https://questionnaires.armssoftware.com/29190184a77f"],
  ["Pepperdine University","CA","D1","Men","Basketball","https://questionnaires.armssoftware.com/4135b76381e2"],
  ["Pepperdine University","CA","D1","Women","Basketball","https://questionnaires.armssoftware.com/d40a7a0a6ce9"],
  ["Pierce College","WA","JUCO","Both","Basketball","https://pierceraiders.com/general/2026Prospective_Athlete_Form"],
  ["Portland Community College","OR","JUCO","Both","Basketball","https://panthers.pcc.edu/sb_output.aspx?form=3"],
  ["Portland State University","OR","D1","Both","Basketball","https://goviks.com/sb_output.aspx?form=3"],
  ["Providence College","RI","D1","Women","Basketball","https://questionnaires.armssoftware.com/65c76c606a20"],
  ["Regis College","MA","D3","Men","Basketball","https://www.goregispride.com/sports/mbkb/Recruit_Questionnaire"],
  ["Rhodes College","TN","D3","Men","Basketball","https://rhodeslynx.com/sb_output.aspx?form=6&path=mbball"],
  ["Rowan College of South Jersey","NJ","JUCO","Both","Basketball","https://www.dukesathletics.com/Recruits/questionnaire"],
  ["Saint Martin's University","WA","D2","Both","Basketball","https://admissions.stmartin.edu/register/athletic_inquiry"],
  ["Saint Mary's College of California","CA","D1","Men","Basketball","https://questionnaires.armssoftware.com/99ffb5c83126"],
  ["Saint Mary's College of California","CA","D1","Women","Basketball","https://questionnaires.armssoftware.com/bbf4b29afb9a"],
  ["Sam Houston State University","TX","D1","Men","Basketball","https://questionnaires.armssoftware.com/0e17ffba264c"],
  ["San Jose State University","CA","D1","Women","Basketball","https://questionnaires.armssoftware.com/116331543457"],
  ["Seattle Pacific University","WA","D2","Women","Basketball","https://app.winwontech.com/questionnaire/seattlepacific/basketball-w/mjbcOS9g03t4cArTAg7y"],
  ["Seattle Pacific University","WA","D2","Men","Basketball","https://app.winwontech.com/questionnaire/seattlepacific/basketball-m/oREwqMbF6EDNg7wGljvE"],
  ["Sewanee: The University of the South","TN","D3","Men","Basketball","https://questionnaires.armssoftware.com/8d0595c5412a"],
  ["Sewanee: The University of the South","TN","D3","Women","Basketball","https://questionnaires.armssoftware.com/a305b80da73e"],
  ["Skagit Valley College","WA","JUCO","Both","Basketball","https://www.skagit.edu/sports_recruitment_form.asp"],
  ["South Carolina State University","SC","D1","Men","Basketball","https://my.armssoftware.com/arms/public/questionnaire/d428372a19c3"],
  ["South Carolina State University","SC","D1","Women","Basketball","https://my.armssoftware.com/arms/public/questionnaire/4cf99266ad6f"],
  ["South Puget Sound Community College","WA","JUCO","Both","Basketball","https://spsccathletics.com/recruiting/Prospective_Athlete"],
  ["Southeast Missouri State University","MO","D1","Men","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=315&sportid=15"],
  ["Southeastern Louisiana University","LA","D1","Men","Basketball","https://questionnaires.armssoftware.com/080d49de4a1a"],
  ["Southern Arkansas University","AR","D2","Men","Basketball","https://muleriderathletics.com/sb_output.aspx?form=10"],
  ["Southern Illinois University","IL","D1","Women","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=458&sportid=3"],
  ["Southern New Hampshire University","NH","D2","Both","Basketball","https://snhupenmen.com/sports/2021/5/5/information-PSA-questionnaires-index"],
  ["Southwestern Oregon Community College","OR","JUCO","Both","Basketball","https://swoccathletics.com/sb_output.aspx?form=31"],
  ["St. Olaf College","MN","D3","Men","Basketball","https://athletics.stolaf.edu/sports/2016/9/14/recruit-questionnaire-mbb"],
  ["St. Olaf College","MN","D3","Women","Basketball","https://athletics.stolaf.edu/sports/2016/9/14/womens-basketball-recruit-questionnaire"],
  ["Tacoma Community College","WA","JUCO","Both","Basketball","https://tacomatitans.com/information/recruiting-form"],
  ["Temple University","PA","D1","Men","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=1723&sportid=15"],
  ["Temple University","PA","D1","Women","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=1723&sportid=3"],
  ["Tennessee Technological University","TN","D1","Both","Basketball","https://www.ttusports.com/be_a_golden_eagle/questionnaire_page"],
  ["Texas A&M University","TX","D1","Both","Basketball","https://12thman.com/news/2011/08/04/prospective-athlete-questionnaire"],
  ["Texas A&M University-Kingsville","TX","D2","Women","Basketball","https://questionnaires.armssoftware.com/2081bfaa1be6"],
  ["Texas Wesleyan University","TX","NAIA","Men","Basketball","https://ramsports.net/sb_output.aspx?form=7"],
  ["Texas Woman's University","TX","D2","Women","Basketball","https://questionnaires.armssoftware.com/ba551a9e5448"],
  ["Thomas Jefferson University","PA","D2","Men","Basketball","https://jeffersonrams.com/sb_output.aspx?form=7"],
  ["Union College","NY","D3","Men","Basketball","https://questionnaires.armssoftware.com/1d274cb1dc08"],
  ["United States Air Force Academy","CO","D1","Men","Basketball","https://questionnaires.armssoftware.com/5a19ca7eeed5"],
  ["United States Air Force Academy","CO","D1","Women","Basketball","https://questionnaires.armssoftware.com/58d3e5744750"],
  ["University of Akron","OH","D1","Men","Basketball","https://questionnaires.armssoftware.com/064bf3dc0434"],
  ["University of Akron","OH","D1","Women","Basketball","https://questionnaires.armssoftware.com/8a188656a4c4"],
  ["University of Alabama in Huntsville","AL","D2","Men","Basketball","https://uahchargers.com/sb_output.aspx?form=5"],
  ["University of Alaska Fairbanks","AK","D2","Men","Basketball","https://alaskananooks.com/sb_output.aspx?form=5"],
  ["University of Alaska Fairbanks","AK","D2","Women","Basketball","https://questionnaires.armssoftware.com/428bd553cc26"],
  ["University of Arkansas at Monticello","AR","D2","Men","Basketball","https://www.uamsports.com/sb_output.aspx?form=27"],
  ["University of Arkansas at Pine Bluff","AR","D1","Both","Basketball","https://uapblionsroar.com/sb_output.aspx?form=1"],
  ["University of California, Irvine","CA","D1","Women","Basketball","https://questionnaires.armssoftware.com/3dc770447a76"],
  ["University of Central Arkansas","AR","D1","Men","Basketball","https://questionnaires.armssoftware.com/f3520c867103"],
  ["University of Central Florida","FL","D1","Men","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=382&path=mbball&sportid=15"],
  ["University of Central Oklahoma","OK","D2","Men","Basketball","https://questionnaires.armssoftware.com/ba4f9cb5c69b"],
  ["University of Cincinnati","OH","D1","Men","Basketball","https://questionnaires.armssoftware.com/e12ae88ff33c"],
  ["University of Colorado","CO","D1","Men","Basketball","https://questionnaires.armssoftware.com/f90a0074dcc3"],
  ["University of Connecticut","CT","D1","Both","Basketball","https://uconnhuskies.com/form/3"],
  ["University of Delaware","DE","D1","Both","Basketball","https://www1.udel.edu/forms/sportsinfo/"],
  ["University of Denver","CO","D1","Men","Basketball","https://questionnaires.armssoftware.com/c621da122e47"],
  ["University of Denver","CO","D1","Women","Basketball","https://questionnaires.armssoftware.com/91dc9b8b9cd5"],
  ["University of Florida","FL","D1","Women","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=1679&sportid=3"],
  ["University of Georgia","GA","D1","Women","Basketball","https://questionnaires.armssoftware.com/fe42da945040"],
  ["University of Hawai'i at Hilo","HI","D2","Men","Basketball","https://questionnaires.armssoftware.com/3a40af83cb1a"],
  ["University of Kansas","KS","D1","Women","Basketball","https://questionnaires.armssoftware.com/e27bc4305342"],
  ["University of Kentucky","KY","D1","Both","Basketball","https://ukathletics.com/recruits/"],
  ["University of Louisiana Monroe","LA","D1","Men","Basketball","https://ulmwarhawks.com/sb_output.aspx?form=6"],
  ["University of Lynchburg","VA","D3","Men","Basketball","https://forms.arirecruiting.com/lynchburg_m.basketball/2024_25"],
  ["University of Lynchburg","VA","D3","Women","Basketball","https://forms.arirecruiting.com/lynchburg_w.basketball/2024_25"],
  ["University of Maine at Augusta","ME","USCAA","Both","Basketball","https://www.umamoose.com/information/Recruiting_questionaire/basketball_questionnaire"],
  ["University of Maine at Farmington","ME","D3","Men","Basketball","https://goumfbeavers.com/sports/2022/5/9/information-forms-recruiting-mens-basketball.aspx"],
  ["University of Maryland, College Park","MD","D1","Both","Basketball","https://umterps.com/form/5"],
  ["University of Maryland, College Park","MD","D1","Men","Basketball","https://questionnaires.armssoftware.com/637b2b6f576e"],
  ["University of Massachusetts Amherst","MA","D1","Both","Basketball","https://umassathletics.com/form/3"],
  ["University of Massachusetts Boston","MA","D3","Men","Basketball","https://beaconsathletics.com/sb_output.aspx?form=9"],
  ["University of Miami","FL","D1","Women","Basketball","https://questionnaires.armssoftware.com/3c349c843d42"],
  ["University of Michigan","MI","D1","Women","Basketball","https://questionnaires.armssoftware.com/b7db3742a950"],
  ["University of Michigan-Dearborn","MI","NAIA","Both","Basketball","https://athletics.umdearborn.edu/information/recruiting"],
  ["University of Minnesota","MN","D1","Women","Basketball","https://questionnaires.armssoftware.com/9b6155865a82"],
  ["University of Minnesota Crookston","MN","D2","Men","Basketball","https://questionnaires.armssoftware.com/5834ab4b585d"],
  ["University of Minnesota Morris","MN","NAIA","Both","Basketball","https://admissions.morris.umn.edu/register/RecruitQuestionnaire"],
  ["University of Mount Olive","NC","D2","Men","Basketball","https://questionnaires.armssoftware.com/ade03294468e"],
  ["University of Mount Olive","NC","D2","Women","Basketball","https://questionnaires.armssoftware.com/18d478013501"],
  ["University of Nebraska","NE","D1","Men","Basketball","https://questionnaires.armssoftware.com/e6b75ca567a7"],
  ["University of Nebraska","NE","D1","Women","Basketball","https://questionnaires.armssoftware.com/c5f23845f6fb"],
  ["University of Nebraska Omaha","NE","D1","Men","Basketball","https://questionnaires.armssoftware.com/24fa7e5ad0df"],
  ["University of Nebraska Omaha","NE","D1","Women","Basketball","https://questionnaires.armssoftware.com/6447c9907c49"],
  ["University of Nebraska at Kearney","NE","D2","Both","Basketball","https://lopers.com/sb_output.aspx?form=4"],
  ["University of Nevada, Reno","NV","D1","Women","Basketball","https://questionnaires.armssoftware.com/3f419f551a8e"],
  ["University of New England","ME","D3","Men","Basketball","https://athletics.une.edu/sb_output.aspx?form=29&path=mbball"],
  ["University of New Hampshire","NH","D1","Both","Basketball","https://unhwildcats.com/sports/2020/6/19/prospective-student-athlete-questionnaires"],
  ["University of New Hampshire","NH","D1","Men","Basketball","https://questionnaires.armssoftware.com/113c1085775c"],
  ["University of North Carolina Asheville","NC","D1","Men","Basketball","https://questionnaires.armssoftware.com/ae7cd96f3678"],
  ["University of North Carolina Pembroke","NC","D2","Women","Basketball","https://questionnaires.armssoftware.com/acd1d3d5e56c"],
  ["University of Northern Iowa","IA","D1","Men","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=537&sportid=15"],
  ["University of Northwestern Ohio","OH","NAIA","Both","Basketball","https://www.unoh.edu/athletics/recruit-questionnaire/"],
  ["University of Oregon","OR","D1","Women","Basketball","https://goducks.com/form/14"],
  ["University of Oregon","OR","D1","Men","Basketball","https://goducks.com/form/6"],
  ["University of Pennsylvania","PA","D1","Men","Basketball","https://questionnaires.armssoftware.com/2e4c68cbd39e"],
  ["University of Portland","OR","D1","Both","Basketball","https://portlandpilots.com/sb_output.aspx?form=39"],
  ["University of Rhode Island","RI","D1","Both","Basketball","https://gorhody.com/sports/2020/6/9/information-psa-questionnaires.aspx"],
  ["University of Rhode Island","RI","D1","Women","Basketball","https://questionnaires.armssoftware.com/58324baf0ee4"],
  ["University of Richmond","VA","D1","Women","Basketball","https://questionnaires.armssoftware.com/9978ab5cc532"],
  ["University of South Alabama","AL","D1","Women","Basketball","https://questionnaires.armssoftware.com/c83498187260"],
  ["University of South Carolina","SC","D1","Both","Basketball","https://gamecocksonline.com/news/2018/06/21/ot-recruiting-questionnaires-html/"],
  ["University of South Carolina Aiken","SC","D2","Both","Basketball","https://pacersports.com/sb_output.aspx?form=3"],
  ["University of South Carolina Upstate","SC","D1","Men","Basketball","https://questionnaires.armssoftware.com/671c57b9015a"],
  ["University of South Carolina Upstate","SC","D1","Women","Basketball","https://questionnaires.armssoftware.com/2ac536870b15"],
  ["University of South Dakota","SD","D1","Men","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=453&sportid=15"],
  ["University of South Florida","FL","D1","Men","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=1625&sportid=15"],
  ["University of South Florida","FL","D1","Women","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=1625&sportid=3"],
  ["University of Southern California","CA","D1","Women","Basketball","https://questionnaires.armssoftware.com/9fee7dbcce7b"],
  ["University of Southern Indiana","IN","D1","Men","Basketball","https://questionnaires.armssoftware.com/3eca5203693e"],
  ["University of Southern Indiana","IN","D1","Women","Basketball","https://questionnaires.armssoftware.com/b9356fc2664f"],
  ["University of Tennessee at Chattanooga","TN","D1","Men","Basketball","https://questionnaires.armssoftware.com/f9deb539a785"],
  ["University of Tennessee at Chattanooga","TN","D1","Women","Basketball","https://questionnaires.armssoftware.com/b6cf971cd105"],
  ["University of Texas at Austin","TX","D1","Women","Basketball","https://questionnaires.armssoftware.com/351da7501f2d"],
  ["University of Texas at Dallas","TX","D3","Both","Basketball","https://utdcomets.com/sb_output.aspx?form=3"],
  ["University of Texas at Dallas","TX","D3","Men","Basketball","https://questionnaires.armssoftware.com/bcc3263f7612"],
  ["University of Texas at Dallas","TX","D3","Women","Basketball","https://questionnaires.armssoftware.com/863bc71158fb"],
  ["University of Texas at El Paso","TX","D1","Women","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=396&sportid=3"],
  ["University of Texas at San Antonio","TX","D1","Both","Basketball","https://goutsa.com/prospective-student-athletes-questionnaires"],
  ["University of Toledo","OH","D1","Men","Basketball","https://questionnaires.armssoftware.com/8f67058ed306"],
  ["University of Toledo","OH","D1","Women","Basketball","https://questionnaires.armssoftware.com/1288dabb55a4"],
  ["University of Vermont","VT","D1","Men","Basketball","https://questionnaires.armssoftware.com/a4faa3edaa60"],
  ["University of Washington","WA","D1","Men","Basketball","https://questionnaires.armssoftware.com/d215414b6cf8"],
  ["University of Wisconsin-Green Bay","WI","D1","Men","Basketball","https://greenbayphoenix.com/sb_output.aspx?form=5"],
  ["University of Wisconsin-La Crosse","WI","D3","Women","Basketball","https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=MzMwOQ==-Li4Kb3AbbZk=&ptype=recruit"],
  ["University of Wisconsin-Parkside","WI","D2","Women","Basketball","https://questionnaires.armssoftware.com/fce8a8a8d9a0"],
  ["University of Wisconsin-Whitewater","WI","D3","Men","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=1616&sportid=15"],
  ["Virginia Polytechnic Institute and State University","VA","D1","Men","Basketball","https://college.jumpforward.com/questionnaire.aspx?iid=472&sportid=15"],
  ["Virginia Tech","VA","D1","Men","Basketball","https://questionnaires.armssoftware.com/7fde1baa7859"],
  ["Virginia Tech","VA","D1","Women","Basketball","https://questionnaires.armssoftware.com/2d8352e162bd"],
  ["Wagner College","NY","D1","Men","Basketball","https://wagnerathletics.com/sb_output.aspx?form=26"],
  ["Weber State University","UT","D1","Women","Basketball","https://questionnaires.armssoftware.com/11a6aebcef7c"],
  ["Western Connecticut State University","CT","D3","Men","Basketball","https://westconnathletics.com/sb_output.aspx?form=18"],
  ["Western Illinois University","IL","D1","Both","Basketball","https://goleathernecks.com/sb_output.aspx?form=3"],
  ["Western Oklahoma State College","OK","JUCO","Men","Basketball","https://pioneers.wosc.edu/sports/mbkb/recruiting_form"],
  ["WVU Potomac State College","WV","JUCO","Men","Basketball","https://www.potomacstatesports.com/recruits/mbasketball-recruits"],
  ["Walla Walla Community College","WA","JUCO","Both","Basketball","https://slate.wwcc.edu/register/athletic-recruits"],
  ["Washington State University","WA","D1","Women","Basketball","https://questionnaires.armssoftware.com/7228fbfbb7cb"],
  ["Western Oregon University","OR","D2","Women","Basketball","https://wouwolves.com/sb_output.aspx?form=42"],
  ["Whitman College","WA","D3","Women","Basketball","https://whitmanblues.com/sb_output.aspx?form=3"],
  ["Whitworth University","WA","D3","Women","Basketball","https://questionnaires.armssoftware.com/8cea7646e588"],
  ["Whitworth University","WA","D3","Men","Basketball","https://questionnaires.armssoftware.com/f62f34846591"],
  ["Winthrop University","SC","D1","Women","Basketball","https://questionnaires.armssoftware.com/c3c739347fc8"],
  ["Xavier University","OH","D1","Women","Basketball","https://questionnaires.armssoftware.com/8f1ec038f228"],
  ["Xavier University of Louisiana","LA","NAIA","Both","Basketball","https://xulagold.com/sports/2019/3/20/recruiting-questionnaires"],
  ["Yakima Valley College","WA","JUCO","Both","Basketball","https://goyaks.com/sb_output.aspx?form=3"],
  ["Arizona State University","AZ","D1","Men","Football","https://questionnaires.armssoftware.com/ab20d3134f9f"],
  ["Austin Peay State University","TN","D1","Men","Football","https://letsgopeay.com/sb_output.aspx?form=24"],
  ["Ball State University","IN","D1","Men","Football","https://questionnaires.armssoftware.com/489a56db71f3"],
  ["Bethel University","MN","D3","Men","Football","https://athletics.bethel.edu/sports/2023/9/14/recruits.aspx?path=football"],
  ["Boise State University","ID","D1","Men","Football","https://questionnaires.armssoftware.com/654c9875b45c"],
  ["Bowling Green State University","OH","D1","Men","Football","https://questionnaires.armssoftware.com/da9ecb9101b1"],
  ["Briar Cliff University","IA","NAIA","Men","Football","https://bcuchargers.com/sports/2021/1/7/football-recruiting-form.aspx"],
  ["Carnegie Mellon University","PA","D3","Men","Football","https://questionnaires.armssoftware.com/76a7d2b99313"],
  ["Central Michigan University","MI","D1","Men","Football","https://questionnaires.armssoftware.com/6b6c8f52db3f"],
  ["Central Washington University","WA","D2","Men","Football","https://wildcatsports.com/sb_output.aspx?form=3"],
  ["Claremont-Mudd-Scripps Colleges","CA","D3","Men","Football","https://questionnaires.armssoftware.com/419df429a557"],
  ["Colorado Mesa University","CO","D2","Men","Football","https://cmumavericks.com/sb_output.aspx?form=2"],
  ["Colorado School of Mines","CO","D2","Men","Football","https://questionnaires.armssoftware.com/6b9feb2d5656"],
  ["Colorado State University","CO","D1","Men","Football","https://college.jumpforward.com/questionnaire.aspx?iid=1606&sportid=18"],
  ["Concordia University Wisconsin","WI","D3","Men","Football","https://cuwfalcons.com/sports/2025/7/3/football-recruit-me.aspx"],
  ["Davidson College","NC","D1","Men","Football","https://questionnaires.armssoftware.com/9fd3f4e0e154"],
  ["Delaware State University","DE","D1","Men","Football","https://questionnaires.armssoftware.com/d50b35477ad7"],
  ["Eastern Kentucky University","KY","D1","Men","Football","https://college.jumpforward.com/questionnaire.aspx?iid=1637&sportid=54"],
  ["Eastern Michigan University","MI","D1","Men","Football","https://questionnaires.armssoftware.com/0b95647b5489"],
  ["Elmhurst University","IL","D3","Men","Football","https://questionnaires.armssoftware.com/a30fffca72ca"],
  ["Ferris State University","MI","D2","Men","Football","https://forms.gle/AVDZMbYmBMequJCc9"],
  ["Florida Atlantic University","FL","D1","Men","Football","https://questionnaires.armssoftware.com/4f0d0d975c59"],
  ["Franklin & Marshall College","PA","D3","Men","Football","https://questionnaires.armssoftware.com/ce4f3c984618"],
  ["Fresno State University","CA","D1","Men","Football","https://questionnaires.armssoftware.com/43d0748bd98a"],
  ["Gardner-Webb University","NC","D1","Men","Football","https://questionnaires.armssoftware.com/85948d591686"],
  ["George Fox University","OR","D3","Men","Football","https://athletics.georgefox.edu/sb_output.aspx?form=3"],
  ["Indiana University Bloomington","IN","D1","Men","Football","https://questionnaires.armssoftware.com/ee805559225c"],
  ["Kansas State University","KS","D1","Men","Football","https://questionnaires.armssoftware.com/8fd884a36fbc"],
  ["Kutztown University","PA","D2","Men","Football","https://questionnaires.armssoftware.com/b53971ecd6df"],
  ["Lewis & Clark College","OR","D3","Men","Football","https://apply.lclark.edu/register/recruit"],
  ["Louisiana Tech University","LA","D1","Men","Football","https://questionnaires.armssoftware.com/ae17badbf668"],
  ["Madonna University","MI","NAIA","Men","Football","https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=MjM5NTU=-tXENfsPqgdY=&ptype=recruit"],
  ["McNeese State University","LA","D1","Men","Football","https://mcneesesports.com/sb_output.aspx?form=3&tab=prospectiveathleteform"],
  ["Mercer University","GA","D1","Men","Football","https://college.jumpforward.com/questionnaire.aspx?iid=500&sportid=54"],
  ["Mercyhurst University","PA","D1","Men","Football","https://questionnaires.armssoftware.com/d236e1ddcdc1"],
  ["Miami University","OH","D1","Men","Football","https://questionnaires.armssoftware.com/8ec82a98b444"],
  ["Millersville University","PA","D2","Men","Football","https://questionnaires.armssoftware.com/2b06d027b120"],
  ["Minnesota State University Mankato","MN","D2","Men","Football","https://questionnaires.armssoftware.com/cbe67caed9e3"],
  ["Missouri State University","MO","D1","Men","Football","https://questionnaires.armssoftware.com/cfea5c47a460"],
  ["Missouri University of Science and Technology","MO","D2","Men","Football","https://questionnaires.armssoftware.com/7db0d273d7d8"],
  ["Monmouth University","NJ","D1","Men","Football","https://questionnaires.armssoftware.com/91eeff38abfc"],
  ["Monterey Peninsula College","CA","JUCO","Men","Football","https://docs.google.com/forms/d/e/1FAIpQLSfLhXW0FaSLHspwwILQJR0OTs_u9bVsscTjT1vqyDiC3Swt7A/viewform"],
  ["Navarro College","TX","JUCO","Men","Football","https://navarrobulldogs.com/sb_output.aspx?form=3"],
  ["Nichols College","MA","D3","Men","Football","https://slate.nichols.edu/register/footballrecruitment"],
  ["Norfolk State University","VA","D1","Men","Football","https://questionnaires.armssoftware.com/46973fd70003"],
  ["North Carolina State University","NC","D1","Men","Football","https://questionnaires.armssoftware.com/fa5122606469"],
  ["North Dakota State University","ND","D1","Men","Football","https://questionnaires.armssoftware.com/8f1dc9c11e14"],
  ["Norwich University","VT","D3","Men","Football","https://connect.norwich.edu/register/athlete"],
  ["Ohio University","OH","D1","Men","Football","https://questionnaires.armssoftware.com/233a2d93ee59"],
  ["Olivet Nazarene University","IL","NAIA","Men","Football","https://college.jumpforward.com/questionnaire.aspx?iid=1812&sportid=18"],
  ["Pacific Lutheran University","WA","D3","Men","Football","https://questionnaires.armssoftware.com/592d5a8668d8"],
  ["Plymouth State University","NH","D3","Men","Football","https://athletics.plymouth.edu/sports/2020/8/6/football-front-rush-recruit-form.aspx"],
  ["Portland State University","OR","D1","Men","Football","https://goviks.com/sb_output.aspx?form=20"],
  ["Purdue University","IN","D1","Men","Football","https://college.jumpforward.com/questionnaire.aspx?iid=1670&sportid=54"],
  ["Sam Houston State University","TX","D1","Men","Football","https://questionnaires.armssoftware.com/6a16f89fe9a4"],
  ["San Jose State University","CA","D1","Men","Football","https://questionnaires.armssoftware.com/a685a82d7583"],
  ["Sewanee: The University of the South","TN","D3","Men","Football","https://questionnaires.armssoftware.com/f9d11f21fdaf"],
  ["South Carolina State University","SC","D1","Men","Football","https://questionnaires.armssoftware.com/d8ebb8308ef1"],
  ["Southern Illinois University","IL","D1","Men","Football","https://questionnaires.armssoftware.com/4a091efa1362"],
  ["Southern Utah University","UT","D1","Men","Football","https://college.jumpforward.com/questionnaire.aspx?DB_OEM_ID=20100&iid=1675&sportid=54"],
  ["St. Olaf College","MN","D3","Men","Football","https://athletics.stolaf.edu/sports/2016/9/14/football-recruit-questionnaire"],
  ["Stephen F. Austin State University","TX","D1","Men","Football","https://questionnaires.armssoftware.com/01b15e0e7694"],
  ["Temple University","PA","D1","Men","Football","https://college.jumpforward.com/questionnaire.aspx?iid=1723&sportid=18"],
  ["Union College","NY","D3","Men","Football","https://questionnaires.armssoftware.com/42d8e6235983"],
  ["United States Air Force Academy","CO","D1","Men","Football","https://questionnaires.armssoftware.com/eff272a5aeb4"],
  ["University of Akron","OH","D1","Men","Football","https://questionnaires.armssoftware.com/3242f548bc75"],
  ["University of Arkansas","AR","D1","Men","Football","https://questionnaires.armssoftware.com/567edf1eacb2"],
  ["University of California, Davis","CA","D1","Men","Football","https://questionnaires.armssoftware.com/54fb93553a2c"],
  ["University of California, Los Angeles","CA","D1","Men","Football","https://questionnaires.armssoftware.com/74c822368ab9"],
  ["University of Central Oklahoma","OK","D2","Men","Football","https://questionnaires.armssoftware.com/4e64987dd835"],
  ["University of Cincinnati","OH","D1","Men","Football","https://college.jumpforward.com/questionnaire.aspx?iid=379&sportid=18"],
  ["University of Colorado","CO","D1","Men","Football","https://college.jumpforward.com/questionnaire.aspx?iid=1684&sportid=18"],
  ["University of Connecticut","CT","D1","Men","Football","https://questionnaires.armssoftware.com/a34f74e9b093"],
  ["University of Georgia","GA","D1","Men","Football","https://questionnaires.armssoftware.com/7443102ccb8e"],
  ["University of Hawai'i at Mānoa","HI","D1","Men","Football","https://questionnaires.armssoftware.com/79737af39e0a"],
  ["University of Idaho","ID","D1","Men","Football","https://questionnaires.armssoftware.com/2a7618939f4f"],
  ["University of Illinois","IL","D1","Men","Football","https://questionnaires.armssoftware.com/5c988717357b"],
  ["University of Maine","ME","D1","Men","Football","https://questionnaires.armssoftware.com/66a51f31ef1b"],
  ["University of Maryland, College Park","MD","D1","Men","Football","https://questionnaires.armssoftware.com/b37f2f0aac44"],
  ["University of Montana","MT","D1","Men","Football","https://questionnaires.armssoftware.com/b0fb10cd0c64"],
  ["University of Nebraska","NE","D1","Men","Football","https://questionnaires.armssoftware.com/d388bb15000c"],
  ["University of Nevada, Reno","NV","D1","Men","Football","https://questionnaires.armssoftware.com/6f8b6c2472a1"],
  ["University of New Mexico","NM","D1","Men","Football","https://questionnaires.armssoftware.com/fc6335185ee7"],
  ["University of North Carolina Pembroke","NC","D2","Men","Football","https://questionnaires.armssoftware.com/f13f023492fb"],
  ["University of Northern Iowa","IA","D1","Men","Football","https://college.jumpforward.com/questionnaire.aspx?iid=537&sportid=54"],
  ["University of Oregon","OR","D1","Men","Football","https://college.jumpforward.com/questionnaire.aspx?iid=510&sportid=18"],
  ["University of Pennsylvania","PA","D1","Men","Football","https://questionnaires.armssoftware.com/a8e4bf5dd078"],
  ["University of Puget Sound","WA","D3","Men","Football","https://admission.pugetsound.edu/register/loggerfootball"],
  ["University of Rhode Island","RI","D1","Men","Football","https://questionnaires.armssoftware.com/cfa3d431c131"],
  ["University of Richmond","VA","D1","Men","Football","https://questionnaires.armssoftware.com/9b3dbbe78d24"],
  ["University of South Alabama","AL","D1","Men","Football","https://questionnaires.armssoftware.com/d043922d4bc0"],
  ["University of South Dakota","SD","D1","Men","Football","https://college.jumpforward.com/questionnaire.aspx?iid=453&sportid=54"],
  ["University of South Florida","FL","D1","Men","Football","https://college.jumpforward.com/questionnaire.aspx?iid=1625&sportid=18"],
  ["University of Southern California","CA","D1","Men","Football","https://questionnaires.armssoftware.com/b91abe2ae0c8"],
  ["University of Southern Mississippi","MS","D1","Men","Football","https://questionnaires.armssoftware.com/8714178713d4"],
  ["University of Texas at El Paso","TX","D1","Men","Football","https://college.jumpforward.com/questionnaire.aspx?iid=396&sportid=54"],
  ["University of Toledo","OH","D1","Men","Football","https://questionnaires.armssoftware.com/97ef9cb72419"],
  ["University of Tulsa","OK","D1","Men","Football","https://questionnaires.armssoftware.com/0596f42dbdd9"],
  ["University of Utah","UT","D1","Men","Football","https://questionnaires.armssoftware.com/c15fb5f63631"],
  ["University of Virginia","VA","D1","Men","Football","https://questionnaires.armssoftware.com/5eb2b0c4eed7"],
  ["University of Wisconsin","WI","D1","Men","Football","https://questionnaires.armssoftware.com/73384a600a7f"],
  ["University of Wisconsin-Eau Claire","WI","D3","Men","Football","https://blugolds.com/sports/2023/7/20/fb-recruiting.aspx"],
  ["University of Wyoming","WY","D1","Men","Football","https://college.jumpforward.com/questionnaire.aspx?iid=556&sportid=54"],
  ["Wake Forest University","NC","D1","Men","Football","https://questionnaires.armssoftware.com/b35995e9775c"],
  ["Washington State University","WA","D1","Men","Football","https://questionnaires.armssoftware.com/07fbe4e87211"],
  ["Weber State University","UT","D1","Men","Football","https://questionnaires.armssoftware.com/7d8f54310bb0"],
  ["West Virginia Wesleyan College","WV","D2","Men","Football","https://bobcats.wvwc.edu/"],
  ["Western Oregon University","OR","D2","Men","Football","https://wouwolves.com/sb_output.aspx?form=62"],
  ["Youngstown State University","OH","D1","Men","Football","https://college.jumpforward.com/questionnaire.aspx?iid=1593&sportid=54"],
  ["Academy of Art University","CA","D2","Men","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=1748&sportid=21"],
  ["Angelo State University","TX","D2","Women","Soccer","https://questionnaires.armssoftware.com/a9f759adc54d"],
  ["Arizona State University","AZ","D1","Women","Soccer","https://questionnaires.armssoftware.com/da2cc671ee6a"],
  ["Ashland University","OH","D2","Men","Soccer","https://questionnaires.armssoftware.com/753ab1ef9787"],
  ["Ashland University","OH","D2","Women","Soccer","https://questionnaires.armssoftware.com/5f74f3846c98"],
  ["Baker University","KS","NAIA","Men","Soccer","https://www.fieldlevel.com/bakeru/soccermen/recruiting"],
  ["Ball State University","IN","D1","Women","Soccer","https://questionnaires.armssoftware.com/d71ed3c6e11f"],
  ["Baylor University","TX","D1","Women","Soccer","https://questionnaires.armssoftware.com/3afafc86a273"],
  ["Bethel University","MN","D3","Men","Soccer","https://athletics.bethel.edu/sports/2023/9/14/recruits.aspx?path=msoc"],
  ["Bethel University","MN","D3","Women","Soccer","https://athletics.bethel.edu/sports/2023/9/14/recruits.aspx?path=wsoc"],
  ["Boise State University","ID","D1","Women","Soccer","https://questionnaires.armssoftware.com/b27d8322eb94"],
  ["Bowling Green State University","OH","D1","Men","Soccer","https://questionnaires.armssoftware.com/b4c91f280175"],
  ["Bowling Green State University","OH","D1","Women","Soccer","https://questionnaires.armssoftware.com/1f4b5df4e4ac"],
  ["Bushnell University","OR","NAIA","Women","Soccer","https://bushnellbeacons.com/sb_output.aspx?form=25"],
  ["Bushnell University","OR","NAIA","Men","Soccer","https://bushnellbeacons.com/sb_output.aspx?form=24"],
  ["California Polytechnic State University","CA","D1","Men","Soccer","https://questionnaires.armssoftware.com/c99587ec5515"],
  ["California Polytechnic State University","CA","D1","Women","Soccer","https://questionnaires.armssoftware.com/888398367064"],
  ["California State University, Northridge","CA","D1","Men","Soccer","https://questionnaires.armssoftware.com/1c8df28f9016"],
  ["California State University, Northridge","CA","D1","Women","Soccer","https://questionnaires.armssoftware.com/eda926ad242e"],
  ["Carleton College","MN","D3","Men","Soccer","https://questionnaires.armssoftware.com/279614fcf85f"],
  ["Carnegie Mellon University","PA","D3","Men","Soccer","https://questionnaires.armssoftware.com/9345af192503"],
  ["Carnegie Mellon University","PA","D3","Women","Soccer","https://questionnaires.armssoftware.com/75e49a9c4039"],
  ["Central Connecticut State University","CT","D1","Men","Soccer","https://www.fieldlevel.com/ccsu/soccermen/recruiting"],
  ["Central Washington University","WA","D2","Women","Soccer","https://wildcatsports.com/sb_output.aspx?form=3"],
  ["Central Wyoming College","WY","JUCO","Men","Soccer","https://www.fieldlevel.com/k4tr4dj4/soccermen/recruiting"],
  ["Claremont-Mudd-Scripps Colleges","CA","D3","Men","Soccer","https://questionnaires.armssoftware.com/b9cf2a7bf971"],
  ["Clark College","WA","JUCO","Both","Soccer","https://clarkpenguins.com/sb_output.aspx?form=3"],
  ["Clemson University","SC","D1","Women","Soccer","https://questionnaires.armssoftware.com/e3ad8fa53093"],
  ["Coastal Bend College","TX","JUCO","Men","Soccer","https://www.cbcathletics.com/sports/msoc/recruit"],
  ["College of Southern Nevada","NV","JUCO","Men","Soccer","https://www.fieldlevel.com/csn/soccermen/recruiting"],
  ["Colorado State University Pueblo","CO","D2","Women","Soccer","https://questionnaires.armssoftware.com/d4aed0b1c2cd"],
  ["Columbia Basin College","WA","JUCO","Women","Soccer","https://cbchawks.com/sb_output.aspx?form=1020"],
  ["Columbia Basin College","WA","JUCO","Men","Soccer","https://cbchawks.com/sb_output.aspx?form=1019"],
  ["Concordia University Irvine","CA","D2","Men","Soccer","https://questionnaires.armssoftware.com/f9c06f86cb90"],
  ["Concordia University Irvine","CA","D2","Women","Soccer","https://questionnaires.armssoftware.com/66faf90698ca"],
  ["Concordia University Wisconsin","WI","D3","Men","Soccer","https://cuwfalcons.com/sports/2025/7/3/mens-soccer-recruit-me.aspx"],
  ["Concordia University Wisconsin","WI","D3","Women","Soccer","https://cuwfalcons.com/sports/2025/7/3/womens-soccer-recruit-me.aspx"],
  ["Corban University","OR","NAIA","Both","Soccer","https://corbanwarriors.com/sb_output.aspx?form=3&tab=prospectivestudent-athletequestionnaire"],
  ["Creighton University","NE","D1","Men","Soccer","https://gocreighton.com/form/3"],
  ["Creighton University","NE","D1","Women","Soccer","https://gocreighton.com/form/3"],
  ["Dakota Wesleyan University","SD","NAIA","Men","Soccer","https://www.dwu.edu/Form-Mens-Soccer-Questionnaire"],
  ["Davidson College","NC","D1","Men","Soccer","https://questionnaires.armssoftware.com/ec344e1777fd"],
  ["Davidson College","NC","D1","Women","Soccer","https://questionnaires.armssoftware.com/958345f15d10"],
  ["Drake University","IA","D1","Men","Soccer","https://questionnaires.armssoftware.com/8f6585279e17"],
  ["Drexel University","PA","D1","Men","Soccer","https://questionnaires.armssoftware.com/8e1c712fd22e"],
  ["Drexel University","PA","D1","Women","Soccer","https://questionnaires.armssoftware.com/d858beb9129a"],
  ["Duke University","NC","D1","Men","Soccer","https://questionnaires.armssoftware.com/53edda1ddb41"],
  ["Duke University","NC","D1","Women","Soccer","https://questionnaires.armssoftware.com/e30a0fa07878"],
  ["East Mississippi Community College","MS","JUCO","Men","Soccer","https://www.fieldlevel.com/pynjrecy/soccermen/recruiting"],
  ["East Tennessee State University","TN","D1","Women","Soccer","https://questionnaires.armssoftware.com/1a80fa9ed0a3"],
  ["Eastern Michigan University","MI","D1","Women","Soccer","https://questionnaires.armssoftware.com/7cca99af3ee2"],
  ["Eastern Oregon University","OR","NAIA","Both","Soccer","https://eousports.com/sb_output.aspx?form=3"],
  ["Edmonds College","WA","JUCO","Both","Soccer","https://www.edmonds.edu/campus-life/triton-athletics/prosp-athlete-form.html"],
  ["Emory University","GA","D3","Men","Soccer","https://questionnaires.armssoftware.com/03bcc037c123"],
  ["Emory University","GA","D3","Women","Soccer","https://questionnaires.armssoftware.com/2451c505d2c4"],
  ["Everett Community College","WA","JUCO","Women","Soccer","https://athletics.everettcc.edu/Recruits/Recruiting_Form_-_Women-s_Soccer"],
  ["Everett Community College","WA","JUCO","Men","Soccer","https://athletics.everettcc.edu/Recruits/Recruiting_Form_-_Men-s_Soccer"],
  ["Florida Atlantic University","FL","D1","Women","Soccer","https://questionnaires.armssoftware.com/713c3f2f2b95"],
  ["Florida State University","FL","D1","Women","Soccer","https://www.fieldlevel.com/fsu/soccerwomen/recruiting"],
  ["Fordham University","NY","D1","Men","Soccer","https://www.fieldlevel.com/fordham/soccermen/recruiting"],
  ["Franklin & Marshall College","PA","D3","Men","Soccer","https://questionnaires.armssoftware.com/d3929e1cc3fe"],
  ["Franklin & Marshall College","PA","D3","Women","Soccer","https://questionnaires.armssoftware.com/75120e745b81"],
  ["Fresno State University","CA","D1","Women","Soccer","https://questionnaires.armssoftware.com/3144b8dc1bda"],
  ["Gardner-Webb University","NC","D1","Men","Soccer","https://questionnaires.armssoftware.com/bc9fddb829ad"],
  ["Gardner-Webb University","NC","D1","Women","Soccer","https://questionnaires.armssoftware.com/024db0867d15"],
  ["GateWay Community College","AZ","JUCO","Men","Soccer","https://questionnaires.armssoftware.com/34ba3871ffd9"],
  ["GateWay Community College","AZ","JUCO","Women","Soccer","https://questionnaires.armssoftware.com/515e1597c8f1"],
  ["George Fox University","OR","D3","Both","Soccer","https://athletics.georgefox.edu/sb_output.aspx?form=3"],
  ["Georgetown University","DC","D1","Men","Soccer","https://questionnaires.armssoftware.com/90f7d68c208b"],
  ["Georgia Southern University","GA","D1","Men","Soccer","https://questionnaires.armssoftware.com/350ec954fad8"],
  ["Georgia Southern University","GA","D1","Women","Soccer","https://questionnaires.armssoftware.com/c6e5fb83dbce"],
  ["Gonzaga University","WA","D1","Both","Soccer","https://gozags.com/sb_output.aspx?form=3"],
  ["Gonzaga University","WA","D1","Women","Soccer","https://questionnaires.armssoftware.com/2a751b8a2ebe"],
  ["Grand Canyon University","AZ","D1","Men","Soccer","https://www.fieldlevel.com/gcu/soccermen/recruiting"],
  ["Grays Harbor College","WA","JUCO","Women","Soccer","https://ghcathletics.com/sb_output.aspx?form=3"],
  ["Hawai'i Pacific University","HI","D2","Men","Soccer","https://questionnaires.armssoftware.com/e034dc2b6256"],
  ["Highline College","WA","JUCO","Both","Soccer","https://highlineathletics.com/sb_output.aspx?form=3"],
  ["Idaho State University","ID","D1","Women","Soccer","https://questionnaires.armssoftware.com/a0c31a09903d"],
  ["Indiana University Bloomington","IN","D1","Women","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=436&sportid=9"],
  ["Iowa State University","IA","D1","Women","Soccer","https://questionnaires.armssoftware.com/a1a044b7fb40"],
  ["Kent State University","OH","D1","Women","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=339&sportid=9"],
  ["Kutztown University","PA","D2","Women","Soccer","https://questionnaires.armssoftware.com/f8d95eeacf9a"],
  ["Lane Community College","OR","JUCO","Men","Soccer","https://www.lanetitans.com/sports/msoc/2018-19/questionnaire"],
  ["Lewis & Clark College","OR","D3","Both","Soccer","https://apply.lclark.edu/register/recruit"],
  ["Long Beach State University","CA","D1","Women","Soccer","https://questionnaires.armssoftware.com/b76884fb22bd"],
  ["Louisiana State University","LA","D1","Women","Soccer","https://questionnaires.armssoftware.com/f39aa5844321"],
  ["Lower Columbia College","WA","JUCO","Women","Soccer","https://lccreddevils.com/sb_output.aspx?form=3"],
  ["Macalester College","MN","D3","Women","Soccer","https://forms.arirecruiting.com/forms/macalestercollege_w.soccer/form"],
  ["Marquette University","WI","D1","Men","Soccer","https://gomarquette.com/form/1080"],
  ["McNeese State University","LA","D1","Women","Soccer","https://mcneesesports.com/sb_output.aspx?form=3&tab=prospectiveathleteform"],
  ["Mercyhurst University","PA","D1","Men","Soccer","https://questionnaires.armssoftware.com/f68d2d9f13c9"],
  ["Mercyhurst University","PA","D1","Women","Soccer","https://questionnaires.armssoftware.com/ea1a983cf352"],
  ["Miami University","OH","D1","Women","Soccer","https://questionnaires.armssoftware.com/96637152d31b"],
  ["Michigan State University","MI","D1","Men","Soccer","https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=MTA1NDc=-g/Pntk9ljUg=&ptype=recruit"],
  ["Michigan State University","MI","D1","Women","Soccer","https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=MjM3OTY=-PzbWioXlJsM=&ptype=recruit"],
  ["Middle Georgia State University","GA","NAIA","Men","Soccer","https://www.fieldlevel.com/mgc/soccermen/recruiting"],
  ["Millersville University","PA","D2","Men","Soccer","https://questionnaires.armssoftware.com/9bbee4d008b2"],
  ["Millersville University","PA","D2","Women","Soccer","https://questionnaires.armssoftware.com/de17facdb996"],
  ["Mississippi State University","MS","D1","Women","Soccer","https://www.fieldlevel.com/msstate/soccerwomen/recruiting"],
  ["Missouri State University","MO","D1","Men","Soccer","https://www.fieldlevel.com/missouristate/soccermen/recruiting"],
  ["Missouri State University","MO","D1","Women","Soccer","https://questionnaires.armssoftware.com/0408d203b824"],
  ["Montana State University Billings","MT","D2","Men","Soccer","https://www.fieldlevel.com/msubillings/soccermen/recruiting"],
  ["Monterey Peninsula College","CA","JUCO","Men","Soccer","https://docs.google.com/forms/d/e/1FAIpQLSfpl07PNX1wbavVAg9Xw9R0A10Z1CINTtsUEw6hGW8dCaiS0w/viewform"],
  ["Navarro College","TX","JUCO","Women","Soccer","https://navarrobulldogs.com/sb_output.aspx?form=3"],
  ["New Jersey Institute of Technology","NJ","D1","Women","Soccer","https://questionnaires.armssoftware.com/a533ccf4606f"],
  ["North Dakota State College of Science","ND","JUCO","Men","Soccer","https://www.fieldlevel.com/mt7arpn4/soccermen/recruiting"],
  ["North Dakota State University","ND","D1","Women","Soccer","https://questionnaires.armssoftware.com/c56ae03b6138"],
  ["Northwest Nazarene University","ID","D2","Men","Soccer","https://www.fieldlevel.com/nnu/soccermen/recruiting"],
  ["Northwest University","WA","NAIA","Both","Soccer","https://nueagles.com/sb_output.aspx?form=3"],
  ["Northwestern University","IL","D1","Women","Soccer","https://questionnaires.armssoftware.com/a0a2358c88f7"],
  ["Oakland University","MI","D1","Men","Soccer","https://www.fieldlevel.com/oakland/soccermen/recruiting"],
  ["Occidental College","CA","D3","Men","Soccer","https://questionnaires.armssoftware.com/dc26d508674f"],
  ["Occidental College","CA","D3","Women","Soccer","https://questionnaires.armssoftware.com/0edbd2e6e252"],
  ["Ohio Northern University","OH","D3","Men","Soccer","https://www.fieldlevel.com/onu/soccermen/recruiting"],
  ["Oklahoma Baptist University","OK","D2","Women","Soccer","https://questionnaires.armssoftware.com/fcaeb69c9478"],
  ["Oklahoma Wesleyan University","OK","NAIA","Men","Soccer","https://www.fieldlevel.com/okwu/soccermen/recruiting"],
  ["Old Dominion University","VA","D1","Women","Soccer","https://questionnaires.armssoftware.com/68685a2e9eda"],
  ["Olivet Nazarene University","IL","NAIA","Women","Soccer","https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=NzIzMA==-pH9ynRDtJ7s=&ptype=recruit"],
  ["Oregon Institute of Technology","OR","NAIA","Both","Soccer","https://oregontechowls.com/sb_output.aspx?form=3"],
  ["Oregon State University","OR","D1","Women","Soccer","https://osubeavers.com/sports/2012/3/19/208343622"],
  ["Pacific Lutheran University","WA","D3","Men","Soccer","https://questionnaires.armssoftware.com/8b0e709ca8e7"],
  ["Pacific Lutheran University","WA","D3","Women","Soccer","https://questionnaires.armssoftware.com/92d520af9a12"],
  ["Pennsylvania State University","PA","D1","Men","Soccer","https://questionnaires.armssoftware.com/0e60bc2ee1c0"],
  ["Pennsylvania State University","PA","D1","Women","Soccer","https://questionnaires.armssoftware.com/97bcf0e0d537"],
  ["Pepperdine University","CA","D1","Women","Soccer","https://questionnaires.armssoftware.com/629dcdbea408"],
  ["Pierce College","WA","JUCO","Both","Soccer","https://pierceraiders.com/general/2026Prospective_Athlete_Form"],
  ["Portland Community College","OR","JUCO","Both","Soccer","https://panthers.pcc.edu/sb_output.aspx?form=3"],
  ["Portland State University","OR","D1","Women","Soccer","https://goviks.com/sb_output.aspx?form=4"],
  ["Providence College","RI","D1","Men","Soccer","https://questionnaires.armssoftware.com/d35a8e2575a7"],
  ["Providence College","RI","D1","Women","Soccer","https://questionnaires.armssoftware.com/4e930d45ca3e"],
  ["Regis University","CO","D2","Women","Soccer","https://questionnaires.armssoftware.com/8a93ed4d26a1"],
  ["Rhode Island College","RI","D3","Men","Soccer","https://www.fieldlevel.com/2jz2czrm/soccermen/recruiting"],
  ["Rice University","TX","D1","Women","Soccer","https://questionnaires.armssoftware.com/bdea1fdfd1cd"],
  ["Saint Francis University","PA","D1","Women","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=363&sportid=9"],
  ["Saint John's University","MN","D3","Men","Soccer","https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=6057&ptype=recruit"],
  ["Saint Leo University","FL","D2","Women","Soccer","https://questionnaires.armssoftware.com/d59804ba8251"],
  ["Saint Martin's University","WA","D2","Both","Soccer","https://admissions.stmartin.edu/register/athletic_inquiry"],
  ["Saint Mary's College of California","CA","D1","Women","Soccer","https://questionnaires.armssoftware.com/0f82215d5ae6"],
  ["Saint Xavier University","IL","NAIA","Women","Soccer","https://docs.google.com/forms/d/e/1FAIpQLSdCVnkL-RtKiWgom4_2nK4GwvVrHHRtxZrafwX3V34YBau0Kg/viewform"],
  ["Sam Houston State University","TX","D1","Women","Soccer","https://questionnaires.armssoftware.com/099b4c8d5b15"],
  ["San Jose State University","CA","D1","Men","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=533&sportid=21"],
  ["Seattle Pacific University","WA","D2","Women","Soccer","https://app.winwontech.com/questionnaire/seattlepacific/soccer-w/Rb77nT3mLp0Z0rRLHkn7"],
  ["Seattle Pacific University","WA","D2","Men","Soccer","https://app.winwontech.com/questionnaire/seattlepacific/soccer-m/91vSuEhnK1Rtb423h81e"],
  ["Seattle University","WA","D1","Men","Soccer","https://www.fieldlevel.com/seattleu/soccermen/recruiting"],
  ["Seton Hall University","NJ","D1","Men","Soccer","https://questionnaires.armssoftware.com/7d7c39c9b613"],
  ["Seton Hall University","NJ","D1","Women","Soccer","https://questionnaires.armssoftware.com/ba3dfd49f808"],
  ["Sewanee: The University of the South","TN","D3","Men","Soccer","https://questionnaires.armssoftware.com/88e46c2d2ca1"],
  ["Sewanee: The University of the South","TN","D3","Women","Soccer","https://questionnaires.armssoftware.com/72841dded323"],
  ["Skagit Valley College","WA","JUCO","Both","Soccer","https://www.skagit.edu/sports_recruitment_form.asp"],
  ["South Dakota State University","SD","D1","Women","Soccer","https://www.fieldlevel.com/sdstate/soccerwomen/recruiting"],
  ["South Puget Sound Community College","WA","JUCO","Both","Soccer","https://spsccathletics.com/recruiting/Prospective_Athlete"],
  ["Southern Illinois University","IL","D1","Women","Soccer","https://questionnaires.armssoftware.com/4883a72f897f"],
  ["Southern Maine Community College","ME","USCAA","Men","Soccer","https://www.fieldlevel.com/gvm8gz8i/soccermen/recruiting"],
  ["Southern Virginia University","VA","D3","Men","Soccer","https://www.fieldlevel.com/svu/soccermen/recruiting"],
  ["Southwestern Oregon Community College","OR","JUCO","Both","Soccer","https://swoccathletics.com/sb_output.aspx?form=31"],
  ["St. John's University","NY","D1","Men","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=413&sportid=21"],
  ["St. John's University","NY","D1","Women","Soccer","https://questionnaires.armssoftware.com/3866bc1dcdcb"],
  ["St. Olaf College","MN","D3","Men","Soccer","https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=MTI3OTc=-ESyNGtY6hMY=&ptype=recruit"],
  ["St. Olaf College","MN","D3","Women","Soccer","https://athletics.stolaf.edu/sports/2016/9/14/womens-soccer-recruit-questionnaire"],
  ["Stephen F. Austin State University","TX","D1","Women","Soccer","https://questionnaires.armssoftware.com/9ca15e5c0d0d"],
  ["Tacoma Community College","WA","JUCO","Both","Soccer","https://tacomatitans.com/information/recruiting-form"],
  ["Temple University","PA","D1","Women","Soccer","https://questionnaires.armssoftware.com/84dcf9c98f79"],
  ["Texas Woman's University","TX","D2","Women","Soccer","https://questionnaires.armssoftware.com/718237d9bd42"],
  ["The College of New Jersey","NJ","D3","Men","Soccer","https://www.fieldlevel.com/cj76kx7w/soccermen/recruiting"],
  ["UNC - Wilmington","NC","D1","Men","Soccer","https://www.fieldlevel.com/uncw/soccermen/recruiting"],
  ["United States Air Force Academy","CO","D1","Men","Soccer","https://questionnaires.armssoftware.com/f07e916b338b"],
  ["United States Air Force Academy","CO","D1","Women","Soccer","https://questionnaires.armssoftware.com/e1f3f1e57fa3"],
  ["University at Buffalo","NY","D1","Women","Soccer","https://www.fieldlevel.com/buffalo/soccerwomen/recruiting"],
  ["University of Akron","OH","D1","Men","Soccer","https://questionnaires.armssoftware.com/36bd186bcbde"],
  ["University of Akron","OH","D1","Women","Soccer","https://questionnaires.armssoftware.com/bfbb49bf9324"],
  ["University of Alabama at Birmingham","AL","D1","Men","Soccer","https://www.fieldlevel.com/uab/soccermen/recruiting"],
  ["University of Alabama at Birmingham","AL","D1","Women","Soccer","https://uabsports.com/form/25"],
  ["University of Arizona","AZ","D1","Women","Soccer","https://questionnaires.armssoftware.com/4529aa1f6572"],
  ["University of Arkansas at Little Rock","AR","D1","Women","Soccer","https://questionnaires.armssoftware.com/93ee67900e7a"],
  ["University of California, Davis","CA","D1","Men","Soccer","https://www.fieldlevel.com/ucdavis/soccermen/recruiting"],
  ["University of California, Davis","CA","D1","Women","Soccer","https://questionnaires.armssoftware.com/4d4374292a6a"],
  ["University of California, Irvine","CA","D1","Men","Soccer","https://questionnaires.armssoftware.com/e6b5a6fcc611"],
  ["University of California, Irvine","CA","D1","Women","Soccer","https://questionnaires.armssoftware.com/4f42c777a5f0"],
  ["University of California, Riverside","CA","D1","Men","Soccer","https://questionnaires.armssoftware.com/8871e6ffa9c6"],
  ["University of California, Riverside","CA","D1","Women","Soccer","https://questionnaires.armssoftware.com/b14ce390d875"],
  ["University of Central Arkansas","AR","D1","Men","Soccer","https://www.fieldlevel.com/uca/soccermen/recruiting"],
  ["University of Central Florida","FL","D1","Men","Soccer","https://ucfknights.com/ucf-mens-soccer-student-athlete-questionnaire"],
  ["University of Central Florida","FL","D1","Women","Soccer","https://questionnaires.armssoftware.com/9afa6a42b1f9"],
  ["University of Cincinnati","OH","D1","Women","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=379&sportid=9"],
  ["University of Connecticut","CT","D1","Men","Soccer","https://questionnaires.armssoftware.com/59c0dec5c0c9"],
  ["University of Connecticut","CT","D1","Women","Soccer","https://questionnaires.armssoftware.com/7efd1b2a5712"],
  ["University of Delaware","DE","D1","Men","Soccer","https://www.fieldlevel.com/udel/soccermen/recruiting"],
  ["University of Delaware","DE","D1","Women","Soccer","https://www.fieldlevel.com/udel/soccerwomen/recruiting"],
  ["University of Denver","CO","D1","Men","Soccer","https://www.fieldlevel.com/du/soccermen/recruiting"],
  ["University of Denver","CO","D1","Women","Soccer","https://questionnaires.armssoftware.com/c026fa4909b6"],
  ["University of Florida","FL","D1","Women","Soccer","https://questionnaires.armssoftware.com/2b4252073308"],
  ["University of Georgia","GA","D1","Women","Soccer","https://questionnaires.armssoftware.com/eec1454755ee"],
  ["University of Hawai'i at Hilo","HI","D2","Men","Soccer","https://www.fieldlevel.com/hawaii/soccermen/recruiting"],
  ["University of Hawai'i at Hilo","HI","D2","Women","Soccer","https://questionnaires.armssoftware.com/c89532dbdb4e"],
  ["University of Illinois","IL","D1","Women","Soccer","https://questionnaires.armssoftware.com/95745d16b893"],
  ["University of Illinois Chicago","IL","D1","Men","Soccer","https://www.fieldlevel.com/uic/soccermen/recruiting"],
  ["University of Iowa","IA","D1","Women","Soccer","https://questionnaires.armssoftware.com/407d9084738d"],
  ["University of Kansas","KS","D1","Women","Soccer","https://www.fieldlevel.com/ku/soccerwomen/recruiting"],
  ["University of Kentucky","KY","D1","Men","Soccer","https://www.fieldlevel.com/uky/soccermen/recruiting"],
  ["University of Kentucky","KY","D1","Women","Soccer","https://www.fieldlevel.com/uky/soccerwomen/recruiting"],
  ["University of Louisville","KY","D1","Women","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=502&sportid=9"],
  ["University of Lynchburg","VA","D3","Men","Soccer","https://forms.arirecruiting.com/lynchburg_m.soccer/2024_25"],
  ["University of Lynchburg","VA","D3","Women","Soccer","https://forms.arirecruiting.com/lynchburg_w.soccer/recruit"],
  ["University of Maine at Augusta","ME","USCAA","Women","Soccer","https://www.umamoose.com/information/Recruiting_questionaire/Recruit_Me_Page"],
  ["University of Maryland Baltimore County","MD","D1","Men","Soccer","https://www.fieldlevel.com/umbc/soccermen/recruiting"],
  ["University of Maryland Baltimore County","MD","D1","Women","Soccer","https://www.fieldlevel.com/umbc/soccerwomen/recruiting"],
  ["University of Massachusetts Amherst","MA","D1","Men","Soccer","https://www.fieldlevel.com/umass/soccermen/recruiting"],
  ["University of Massachusetts Amherst","MA","D1","Women","Soccer","https://questionnaires.armssoftware.com/2014c82d78a3"],
  ["University of Memphis","TN","D1","Men","Soccer","https://www.fieldlevel.com/memphis/soccermen/recruiting"],
  ["University of Memphis","TN","D1","Women","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=569&sportid=9"],
  ["University of Michigan","MI","D1","Women","Soccer","https://questionnaires.armssoftware.com/88f3355d2c08"],
  ["University of Minnesota","MN","D1","Women","Soccer","https://questionnaires.armssoftware.com/eb86872cd989"],
  ["University of Minnesota Morris","MN","D3","Men","Soccer","https://www.fieldlevel.com/y9j3c9c9/soccermen/recruiting"],
  ["University of Missouri","MO","D1","Women","Soccer","https://questionnaires.armssoftware.com/d01925a6d474"],
  ["University of Montana","MT","D1","Women","Soccer","https://questionnaires.armssoftware.com/dfa8ed5216ba"],
  ["University of Mount Olive","NC","D2","Men","Soccer","https://questionnaires.armssoftware.com/d6a3b56821a9"],
  ["University of Mount Olive","NC","D2","Women","Soccer","https://questionnaires.armssoftware.com/ea7ffc8306e7"],
  ["University of Nebraska","NE","D1","Women","Soccer","https://questionnaires.armssoftware.com/e71f22078f46?path=wsoc"],
  ["University of Nebraska Omaha","NE","D1","Men","Soccer","https://questionnaires.armssoftware.com/aa1ebf8ecca4"],
  ["University of Nebraska Omaha","NE","D1","Women","Soccer","https://questionnaires.armssoftware.com/d9882a8f99ea"],
  ["University of Nevada, Reno","NV","D1","Women","Soccer","https://www.fieldlevel.com/unr/soccerwomen/recruiting"],
  ["University of New Hampshire","NH","D1","Men","Soccer","https://www.fieldlevel.com/crcrdkn9/soccermen/recruiting"],
  ["University of New Hampshire","NH","D1","Women","Soccer","https://www.fieldlevel.com/crcrdkn9/soccerwomen/recruiting"],
  ["University of New Mexico","NM","D1","Men","Soccer","https://www.fieldlevel.com/unm/soccermen/recruiting"],
  ["University of New Mexico","NM","D1","Women","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=425&sportid=9"],
  ["University of North Carolina Charlotte","NC","D1","Women","Soccer","https://questionnaires.armssoftware.com/ef1a73f6bfff"],
  ["University of North Carolina Wilmington","NC","D1","Women","Soccer","https://questionnaires.armssoftware.com/c9e62a233300"],
  ["University of Northern Iowa","IA","D1","Women","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=537&sportid=9"],
  ["University of Oklahoma","OK","D1","Women","Soccer","https://questionnaires.armssoftware.com/7e68c39c0af8?path=soc"],
  ["University of Oregon","OR","D1","Women","Soccer","https://goducks.com/form/3"],
  ["University of Pennsylvania","PA","D1","Men","Soccer","https://www.fieldlevel.com/upenn/soccermen/recruiting"],
  ["University of Pennsylvania","PA","D1","Women","Soccer","https://questionnaires.armssoftware.com/c8d9f2d90a4c"],
  ["University of Portland","OR","D1","Women","Soccer","https://portlandpilots.com/sb_output.aspx?form=39"],
  ["University of Portland","OR","D1","Men","Soccer","https://portlandpilots.com/sb_output.aspx?form=39"],
  ["University of Rhode Island","RI","D1","Women","Soccer","https://questionnaires.armssoftware.com/ca0cd10f36d1"],
  ["University of Richmond","VA","D1","Women","Soccer","https://questionnaires.armssoftware.com/7f83a57047da"],
  ["University of South Carolina","SC","D1","Men","Soccer","https://www.fieldlevel.com/sc/soccermen/recruiting"],
  ["University of South Carolina","SC","D1","Women","Soccer","https://questionnaires.armssoftware.com/9335cbaa7faf"],
  ["University of South Carolina Aiken","SC","D2","Women","Soccer","https://questionnaires.armssoftware.com/27dfca524b3f"],
  ["University of South Carolina Upstate","SC","D1","Men","Soccer","https://questionnaires.armssoftware.com/337a35a08105"],
  ["University of South Carolina Upstate","SC","D1","Women","Soccer","https://questionnaires.armssoftware.com/75f92081a4ba"],
  ["University of South Florida","FL","D1","Men","Soccer","https://www.fieldlevel.com/ke2crij9/soccermen/recruiting"],
  ["University of South Florida","FL","D1","Women","Soccer","https://questionnaires.armssoftware.com/4ec9cc6efbd7"],
  ["University of Southern California","CA","D1","Women","Soccer","https://questionnaires.armssoftware.com/8527ea4d131d"],
  ["University of Southern Indiana","IN","D1","Men","Soccer","https://www.fieldlevel.com/usi/soccermen/recruiting"],
  ["University of Southern Indiana","IN","D1","Women","Soccer","https://questionnaires.armssoftware.com/6bcbef423345"],
  ["University of St. Thomas","MN","D1","Women","Soccer","https://questionnaires.armssoftware.com/69f7ab9de9cd"],
  ["University of Tennessee","TN","D1","Women","Soccer","https://questionnaires.armssoftware.com/1d56b54c82e9"],
  ["University of Tennessee at Chattanooga","TN","D1","Women","Soccer","https://questionnaires.armssoftware.com/889745bb957a"],
  ["University of Texas at Austin","TX","D1","Women","Soccer","https://questionnaires.armssoftware.com/defc5954f03f"],
  ["University of Texas at Dallas","TX","D3","Men","Soccer","https://questionnaires.armssoftware.com/d665579a189a"],
  ["University of Texas at Dallas","TX","D3","Women","Soccer","https://questionnaires.armssoftware.com/c1676090b93a"],
  ["University of Texas at Tyler","TX","D2","Men","Soccer","https://www.fieldlevel.com/rkppqtch/soccermen/recruiting"],
  ["University of Texas at El Paso","TX","D1","Women","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=396&sportid=9"],
  ["University of Texas at Tyler","TX","D2","Women","Soccer","https://questionnaires.armssoftware.com/31bd2cbcad6d"],
  ["University of Toledo","OH","D1","Women","Soccer","https://questionnaires.armssoftware.com/cd7864868faa"],
  ["University of Utah","UT","D1","Women","Soccer","https://questionnaires.armssoftware.com/c14f1ff0ed47"],
  ["University of Virginia","VA","D1","Women","Soccer","https://questionnaires.armssoftware.com/3276af17e40d"],
  ["University of Washington","WA","D1","Women","Soccer","https://questionnaires.armssoftware.com/70bc0c6c87f5"],
  ["University of Wisconsin","WI","D1","Men","Soccer","https://www.fieldlevel.com/wisconsin/soccermen/recruiting"],
  ["University of Wisconsin","WI","D1","Women","Soccer","https://questionnaires.armssoftware.com/9be4ddacfb6f"],
  ["University of Wisconsin-Eau Claire","WI","D3","Women","Soccer","https://blugolds.com/sports/2023/9/27/womens-soccer-recruit-prospect-form.aspx"],
  ["University of Wisconsin-Parkside","WI","D2","Women","Soccer","https://questionnaires.armssoftware.com/8c0542ee9b09"],
  ["University of Wisconsin-Whitewater","WI","D3","Men","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=1616&sportid=21"],
  ["University of Wisconsin-Whitewater","WI","D3","Women","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=1616&sportid=9"],
  ["University of Wyoming","WY","D1","Women","Soccer","https://questionnaires.armssoftware.com/75527ed2b542"],
  ["Utah Valley University","UT","D1","Men","Soccer","https://questionnaires.armssoftware.com/aad6ac6a6826"],
  ["Utah Valley University","UT","D1","Women","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=361&sportid=9"],
  ["Vanderbilt University","TN","D1","Women","Soccer","https://questionnaires.armssoftware.com/9d434e5c40e5"],
  ["Vermont State University Lyndon","VT","D3","Men","Soccer","https://www.fieldlevel.com/lyndonstate/soccermen/recruiting"],
  ["Vermont State University Lyndon","VT","D3","Women","Soccer","https://vtsuhornets.com/sports/2022/7/26/womens-soccer-recruiting-questionnaire.aspx"],
  ["Villanova University","PA","D1","Women","Soccer","https://questionnaires.armssoftware.com/356d5c3e5d0b"],
  ["Virginia Commonwealth University","VA","D1","Women","Soccer","https://questionnaires.armssoftware.com/d26e1809ecb5"],
  ["Virginia Tech","VA","D1","Men","Soccer","https://questionnaires.armssoftware.com/ef8747873d92"],
  ["Virginia Tech","VA","D1","Women","Soccer","https://www.fieldlevel.com/vt/soccerwomen/recruiting"],
  ["Wake Forest University","NC","D1","Men","Soccer","https://questionnaires.armssoftware.com/4862c9f11814"],
  ["Wake Forest University","NC","D1","Women","Soccer","https://questionnaires.armssoftware.com/1b594f28917d"],
  ["Walla Walla Community College","WA","JUCO","Both","Soccer","https://slate.wwcc.edu/register/athletic-recruits"],
  ["Weber State University","UT","D1","Women","Soccer","https://questionnaires.armssoftware.com/4da7180de9ac"],
  ["West Virginia Tech","WV","NAIA","Men","Soccer","https://www.fieldlevel.com/wvutech/soccermen/recruiting"],
  ["West Virginia Tech","WV","NAIA","Women","Soccer","https://www.fieldlevel.com/wvutech/soccerwomen/recruiting"],
  ["Western Iowa Tech Community College","IA","JUCO","Men","Soccer","https://www.fieldlevel.com/anc3xht6/soccermen/recruiting"],
  ["Western Oregon University","OR","D2","Men","Soccer","https://wouwolves.com/sb_output.aspx?form=75"],
  ["Western Oregon University","OR","D2","Women","Soccer","https://wouwolves.com/sb_output.aspx?form=63"],
  ["Whitman College","WA","D3","Men","Soccer","https://whitmanblues.com/sb_output.aspx?form=3"],
  ["Whitworth University","WA","D3","Women","Soccer","https://questionnaires.armssoftware.com/c10adb304ddf"],
  ["Whitworth University","WA","D3","Men","Soccer","https://questionnaires.armssoftware.com/579929031f9c"],
  ["Winthrop University","SC","D1","Men","Soccer","https://questionnaires.armssoftware.com/d5257c2ecb3f"],
  ["Winthrop University","SC","D1","Women","Soccer","https://questionnaires.armssoftware.com/37825d1ffd22"],
  ["Wright State University","OH","D1","Men","Soccer","https://questionnaires.armssoftware.com/4b25184ba404"],
  ["Wright State University","OH","D1","Women","Soccer","https://questionnaires.armssoftware.com/6cf58c999cc4"],
  ["Xavier University","OH","D1","Men","Soccer","https://questionnaires.armssoftware.com/16b077bd92d8"],
  ["Xavier University","OH","D1","Women","Soccer","https://questionnaires.armssoftware.com/6462cf630012"],
  ["Xavier University of Louisiana","LA","NAIA","Men","Soccer","https://www.fieldlevel.com/fmjv29mn/soccermen/recruiting"],
  ["Yakima Valley College","WA","JUCO","Women","Soccer","https://goyaks.com/sb_output.aspx?form=3"],
  ["Youngstown State University","OH","D1","Women","Soccer","https://college.jumpforward.com/questionnaire.aspx?iid=1593&sportid=9"],
  ["Academy of Art University","CA","D2","Women","Softball","https://college.jumpforward.com/questionnaire.aspx?iid=1748&sportid=31"],
  ["Alabama A&M University","AL","D1","Women","Softball","https://www.fieldlevel.com/aamu/softball/recruiting"],
  ["Ashland University","OH","D2","Women","Softball","https://questionnaires.armssoftware.com/7617e73c054d"],
  ["Baker University","KS","NAIA","Women","Softball","https://www.fieldlevel.com/bakeru/softball/recruiting"],
  ["Ball State University","IN","D1","Women","Softball","https://questionnaires.armssoftware.com/f5bdc230d389"],
  ["Baylor University","TX","D1","Women","Softball","https://questionnaires.armssoftware.com/8ec3062aa61c"],
  ["Bemidji State University","MN","D2","Women","Softball","https://questionnaires.armssoftware.com/b768bec8bd90"],
  ["Bethel University","MN","D3","Women","Softball","https://athletics.bethel.edu/sports/2023/9/14/recruits.aspx?path=softball"],
  ["Bowling Green State University","OH","D1","Women","Softball","https://questionnaires.armssoftware.com/8f67428fa6d5"],
  ["Bushnell University","OR","NAIA","Women","Softball","https://bushnellbeacons.com/sb_output.aspx?form=26"],
  ["California Polytechnic State University","CA","D1","Women","Softball","https://questionnaires.armssoftware.com/febf65c33e75"],
  ["California State University, Bakersfield","CA","D1","Women","Softball","https://questionnaires.armssoftware.com/00a244c5c76e"],
  ["California State University, Northridge","CA","D1","Women","Softball","https://questionnaires.armssoftware.com/8234fb75948b"],
  ["Carleton College","MN","D3","Women","Softball","https://questionnaires.armssoftware.com/48bc851721da"],
  ["Carnegie Mellon University","PA","D3","Women","Softball","https://questionnaires.armssoftware.com/f9cf0a57d28d"],
  ["Central Connecticut State University","CT","D1","Women","Softball","https://www.fieldlevel.com/ccsu/softball/recruiting"],
  ["Central Washington University","WA","D2","Women","Softball","https://wildcatsports.com/sb_output.aspx?form=3"],
  ["Claremont-Mudd-Scripps Colleges","CA","D3","Women","Softball","https://questionnaires.armssoftware.com/834391a4ea6c"],
  ["Clark College","WA","JUCO","Women","Softball","https://clarkpenguins.com/sb_output.aspx?form=3"],
  ["Clemson University","SC","D1","Women","Softball","https://questionnaires.armssoftware.com/ebe3ab969190"],
  ["Coastal Bend College","TX","JUCO","Women","Softball","https://www.cbcathletics.com/sports/sball/recruit"],
  ["College of Southern Nevada","NV","JUCO","Women","Softball","https://www.fieldlevel.com/csn/softball/recruiting"],
  ["Colorado State University","CO","D1","Women","Softball","https://college.jumpforward.com/questionnaire.aspx?iid=1606&sportid=31"],
  ["Colorado State University Pueblo","CO","D2","Women","Softball","https://questionnaires.armssoftware.com/778f2361e277"],
  ["Columbia Basin College","WA","JUCO","Women","Softball","https://cbchawks.com/sb_output.aspx?form=1021"],
  ["Concordia University Irvine","CA","D2","Women","Softball","https://questionnaires.armssoftware.com/7f975f3b4d4c"],
  ["Corban University","OR","NAIA","Women","Softball","https://corbanwarriors.com/sb_output.aspx?form=3&tab=prospectivestudent-athletequestionnaire"],
  ["Creighton University","NE","D1","Women","Softball","https://questionnaires.armssoftware.com/9dfd18d84b72"],
  ["Drexel University","PA","D1","Women","Softball","https://questionnaires.armssoftware.com/7bdf62799eb2"],
  ["Duke University","NC","D1","Women","Softball","https://questionnaires.armssoftware.com/132256dbd7b8"],
  ["East Mississippi Community College","MS","JUCO","Women","Softball","https://www.fieldlevel.com/pynjrecy/softball/recruiting"],
  ["Eastern Kentucky University","KY","D1","Women","Softball","https://www.fieldlevel.com/eku/softball/recruiting"],
  ["Eastern Oregon University","OR","NAIA","Women","Softball","https://eousports.com/sb_output.aspx?form=3"],
  ["Edmonds College","WA","JUCO","Women","Softball","https://www.edmonds.edu/campus-life/triton-athletics/prosp-athlete-form.html"],
  ["Everett Community College","WA","JUCO","Women","Softball","https://athletics.everettcc.edu/Recruits/Recruiting_Form_-_Softball"],
  ["Ferris State University","MI","D2","Women","Softball","https://ferrisstatebulldogs.com/sports/sball/softballrecruit"],
  ["Florida Atlantic University","FL","D1","Women","Softball","https://questionnaires.armssoftware.com/df93f8aef655"],
  ["Florida State University","FL","D1","Women","Softball","https://questionnaires.armssoftware.com/01fb4f7b6b7f"],
  ["Franklin & Marshall College","PA","D3","Women","Softball","https://questionnaires.armssoftware.com/07a3e44d3527"],
  ["Gardner-Webb University","NC","D1","Women","Softball","https://questionnaires.armssoftware.com/f6db47f1df60"],
  ["GateWay Community College","AZ","JUCO","Women","Softball","https://questionnaires.armssoftware.com/4f2ca58fcaac"],
  ["George Fox University","OR","D3","Women","Softball","https://athletics.georgefox.edu/sb_output.aspx?form=3"],
  ["Georgetown University","DC","D1","Women","Softball","https://questionnaires.armssoftware.com/612472bb3d11"],
  ["Georgia Southern University","GA","D1","Women","Softball","https://questionnaires.armssoftware.com/6932eff0ba28"],
  ["Grays Harbor College","WA","JUCO","Women","Softball","https://ghcathletics.com/sb_output.aspx?form=3"],
  ["Highline College","WA","JUCO","Women","Softball","https://highlineathletics.com/sb_output.aspx?form=3"],
  ["Iowa State University","IA","D1","Women","Softball","https://questionnaires.armssoftware.com/75bd1185d4f8"],
  ["Kent State University","OH","D1","Women","Softball","https://college.jumpforward.com/questionnaire.aspx?iid=339&sportid=31"],
  ["Kutztown University","PA","D2","Women","Softball","https://questionnaires.armssoftware.com/5084b94b0df2"],
  ["Lewis & Clark College","OR","D3","Women","Softball","https://apply.lclark.edu/register/recruit"],
  ["Long Beach State University","CA","D1","Women","Softball","https://questionnaires.armssoftware.com/280287d4b492"],
  ["Lower Columbia College","WA","JUCO","Women","Softball","https://lccreddevils.com/sb_output.aspx?form=3"],
  ["McNeese State University","LA","D1","Women","Softball","https://mcneesesports.com/sb_output.aspx?form=3&tab=prospectiveathleteform"],
  ["Mercyhurst University","PA","D1","Women","Softball","https://questionnaires.armssoftware.com/831f577c561c"],
  ["Miami University","OH","D1","Women","Softball","https://questionnaires.armssoftware.com/2eb8b5522899"],
  ["Michigan State University","MI","D1","Women","Softball","https://questionnaires.armssoftware.com/a8ea47440122"],
  ["Middle Georgia State University","GA","NAIA","Women","Softball","https://www.fieldlevel.com/mgc/softball/recruiting"],
  ["Millersville University","PA","D2","Women","Softball","https://questionnaires.armssoftware.com/1c12fe13f018"],
  ["Missouri State University","MO","D1","Women","Softball","https://questionnaires.armssoftware.com/e34564fb91a3"],
  ["Montana State University Billings","MT","D2","Women","Softball","https://www.fieldlevel.com/msubillings/softball/recruiting"],
  ["Monterey Peninsula College","CA","JUCO","Women","Softball","https://docs.google.com/forms/d/e/1FAIpQLScZPfZ6KcWTJQpa_1XQBLOFAPx9LLXUPHAFnoBrATcRO8Za6w/viewform"],
  ["Navarro College","TX","JUCO","Women","Softball","https://navarrobulldogs.com/sb_output.aspx?form=3"],
  ["New York University","NY","D3","Women","Softball","https://questionnaires.armssoftware.com/a400ffae46f6"],
  ["Norfolk State University","VA","D1","Women","Softball","https://questionnaires.armssoftware.com/405fc7c535a4"],
  ["North Dakota State College of Science","ND","JUCO","Women","Softball","https://www.fieldlevel.com/mt7arpn4/softball/recruiting"],
  ["Northwest Nazarene University","ID","D2","Women","Softball","https://www.fieldlevel.com/nnu/softball/recruiting"],
  ["Oakland University","MI","D1","Women","Softball","https://www.fieldlevel.com/oakland/softball/recruiting"],
  ["Occidental College","CA","D3","Women","Softball","https://questionnaires.armssoftware.com/9f7ddc543af1"],
  ["Ohio Northern University","OH","D3","Women","Softball","https://www.fieldlevel.com/onu/softball/recruiting"],
  ["Ohio State University","OH","D1","Women","Softball","https://questionnaires.armssoftware.com/e9d427ebecd2"],
  ["Oklahoma State University","OK","D1","Women","Softball","https://questionnaires.armssoftware.com/833647aab4f5"],
  ["Oklahoma Wesleyan University","OK","NAIA","Women","Softball","https://www.fieldlevel.com/okwu/softball/recruiting"],
  ["Olympic College","WA","JUCO","Women","Softball","https://olympicrangers.com/landing/recruit_form"],
  ["Oregon Institute of Technology","OR","NAIA","Women","Softball","https://oregontechowls.com/sb_output.aspx?form=3"],
  ["Oregon State University","OR","D1","Women","Softball","https://osubeavers.com/form/3"],
  ["Pacific Lutheran University","WA","D3","Women","Softball","https://questionnaires.armssoftware.com/fba8cd2af515"],
  ["Pierce College","WA","JUCO","Women","Softball","https://pierceraiders.com/general/2026Prospective_Athlete_Form"],
  ["Portland State University","OR","D1","Women","Softball","https://goviks.com/sb_output.aspx?form=3"],
  ["Providence College","RI","D1","Women","Softball","https://questionnaires.armssoftware.com/178ad5e6fb11"],
  ["Purdue University","IN","D1","Women","Softball","https://questionnaires.armssoftware.com/1cad7378170b"],
  ["Ramapo College of New Jersey","NJ","D3","Women","Softball","https://www.fieldlevel.com/ramapo/Softball/recruiting"],
  ["Rhode Island College","RI","D3","Women","Softball","https://www.fieldlevel.com/2jz2czrm/softball/recruiting"],
  ["Saint Martin's University","WA","D2","Women","Softball","https://admissions.stmartin.edu/register/athletic_inquiry"],
  ["Saint Mary's College of California","CA","D1","Women","Softball","https://questionnaires.armssoftware.com/0771eaa539c6"],
  ["Sam Houston State University","TX","D1","Women","Softball","https://questionnaires.armssoftware.com/064f889d1fa3"],
  ["Seattle University","WA","D1","Women","Softball","https://www.fieldlevel.com/seattleu/softball/recruiting"],
  ["Seton Hall University","NJ","D1","Women","Softball","https://questionnaires.armssoftware.com/6d0ad4253fd7"],
  ["Sewanee: The University of the South","TN","D3","Women","Softball","https://questionnaires.armssoftware.com/b57d3e3de9dc"],
  ["Southern Maine Community College","ME","USCAA","Women","Softball","https://www.fieldlevel.com/gvm8gz8i/softball/recruiting"],
  ["Southern New Hampshire University","NH","D2","Women","Softball","https://questionnaires.armssoftware.com/3f734a933708"],
  ["Southern Virginia University","VA","D3","Women","Softball","https://www.fieldlevel.com/svu/softball/recruiting"],
  ["Southwestern Oregon Community College","OR","JUCO","Women","Softball","https://swoccathletics.com/sb_output.aspx?form=31"],
  ["St. John's University","NY","D1","Women","Softball","https://questionnaires.armssoftware.com/acb26f6f203f"],
  ["Stanford University","CA","D1","Women","Softball","https://questionnaires.armssoftware.com/23e0b06de75e"],
  ["Stephen F. Austin State University","TX","D1","Women","Softball","https://questionnaires.armssoftware.com/c8f725100761"],
  ["Texas A&M University","TX","D1","Women","Softball","https://questionnaires.armssoftware.com/b1055932b548"],
  ["Texas Lutheran University","TX","D3","Women","Softball","https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=MjM1MzA=-TPdGPBYZEm4=&ptype=recruit"],
  ["Texas Woman's University","TX","D2","Women","Softball","https://questionnaires.armssoftware.com/c6bb044071cb"],
  ["University of Akron","OH","D1","Women","Softball","https://questionnaires.armssoftware.com/cdf32f7d8073"],
  ["University of Arizona","AZ","D1","Women","Softball","https://questionnaires.armssoftware.com/8929cb527775"],
  ["University of California, Davis","CA","D1","Women","Softball","https://www.fieldlevel.com/ucdavis/softball/recruiting"],
  ["University of California, Riverside","CA","D1","Women","Softball","https://questionnaires.armssoftware.com/bc04c4d24442"],
  ["University of Central Arkansas","AR","D1","Women","Softball","https://www.fieldlevel.com/uca/softball/recruiting"],
  ["University of Central Florida","FL","D1","Women","Softball","https://questionnaires.armssoftware.com/de647cb12235"],
  ["University of Connecticut","CT","D1","Women","Softball","https://questionnaires.armssoftware.com/9971db7057e1"],
  ["University of Delaware","DE","D1","Women","Softball","https://www.fieldlevel.com/udel/softball/recruiting"],
  ["University of Georgia","GA","D1","Women","Softball","https://questionnaires.armssoftware.com/c981f5c95227"],
  ["University of Hawai'i at Hilo","HI","D2","Women","Softball","https://www.fieldlevel.com/hawaii/softball/recruiting"],
  ["University of Illinois","IL","D1","Women","Softball","https://questionnaires.armssoftware.com/b3c9bd62243b"],
  ["University of Illinois Chicago","IL","D1","Women","Softball","https://www.fieldlevel.com/uic/softball/recruiting"],
  ["University of Iowa","IA","D1","Women","Softball","https://questionnaires.armssoftware.com/506a7c8cb6c4"],
  ["University of Lynchburg","VA","D3","Women","Softball","https://forms.arirecruiting.com/lynchburg_softball/Recruit"],
  ["University of Maryland Baltimore County","MD","D1","Women","Softball","https://www.fieldlevel.com/umbc/softball/recruiting"],
  ["University of Massachusetts Amherst","MA","D1","Women","Softball","https://www.fieldlevel.com/umass/softball/recruiting"],
  ["University of Memphis","TN","D1","Women","Softball","https://www.fieldlevel.com/memphis/softball/recruiting"],
  ["University of Minnesota","MN","D1","Women","Softball","https://questionnaires.armssoftware.com/463e544c67d2"],
  ["University of Minnesota Morris","MN","D3","Women","Softball","https://www.fieldlevel.com/y9j3c9c9/softball/recruiting"],
  ["University of Missouri","MO","D1","Women","Softball","https://questionnaires.armssoftware.com/1b333c8b2889"],
  ["University of Nebraska","NE","D1","Women","Softball","https://questionnaires.armssoftware.com/2440149b866f"],
  ["University of Nebraska Omaha","NE","D1","Women","Softball","https://questionnaires.armssoftware.com/7f370ef9c49a"],
  ["University of New Mexico","NM","D1","Women","Softball","https://www.fieldlevel.com/unm/softball/recruiting"],
  ["University of North Carolina Wilmington","NC","D1","Women","Softball","https://www.fieldlevel.com/uncw/softball/recruiting"],
  ["University of Northern Iowa","IA","D1","Women","Softball","https://college.jumpforward.com/questionnaire.aspx?iid=537&sportid=31"],
  ["University of Oregon","OR","D1","Women","Softball","https://goducks.com/form/3"],
  ["University of Pennsylvania","PA","D1","Women","Softball","https://www.fieldlevel.com/upenn/softball/recruiting"],
  ["University of South Carolina","SC","D1","Women","Softball","https://questionnaires.armssoftware.com/6c6c3c70f359"],
  ["University of South Carolina Upstate","SC","D1","Women","Softball","https://www.fieldlevel.com/uscupstate/softball/recruiting"],
  ["University of South Dakota","SD","D1","Women","Softball","https://college.jumpforward.com/questionnaire.aspx?iid=453&sportid=31"],
  ["University of South Florida","FL","D1","Women","Softball","https://www.fieldlevel.com/ke2crij9/softball/recruiting"],
  ["University of Southern Indiana","IN","D1","Women","Softball","https://www.fieldlevel.com/usi/softball/recruiting"],
  ["University of Tennessee at Chattanooga","TN","D1","Women","Softball","https://questionnaires.armssoftware.com/8bde30e13bfa"],
  ["University of Texas at Austin","TX","D1","Women","Softball","https://questionnaires.armssoftware.com/06db53bfdf25"],
  ["University of Texas at Dallas","TX","D3","Women","Softball","https://questionnaires.armssoftware.com/cde82b48429c"],
  ["University of Texas at El Paso","TX","D1","Women","Softball","https://college.jumpforward.com/questionnaire.aspx?iid=396&sportid=31"],
  ["University of Texas at Tyler","TX","D2","Women","Softball","https://www.fieldlevel.com/rkppqtch/softball/recruiting"],
  ["University of Toledo","OH","D1","Women","Softball","https://questionnaires.armssoftware.com/9ab840e26af5"],
  ["University of Virginia","VA","D1","Women","Softball","https://questionnaires.armssoftware.com/4d79ed62a4d0"],
  ["University of Wisconsin","WI","D1","Women","Softball","https://www.fieldlevel.com/wisconsin/softball/recruiting"],
  ["University of Wisconsin-Eau Claire","WI","D3","Women","Softball","https://blugolds.com/sports/2023/11/28/softball-recruit-prospect-form.aspx"],
  ["University of Wisconsin-Parkside","WI","D2","Women","Softball","https://questionnaires.armssoftware.com/b8980ab8aa6d"],
  ["University of Wisconsin-Whitewater","WI","D3","Women","Softball","https://college.jumpforward.com/questionnaire.aspx?iid=1616&sportid=31"],
  ["Utah Valley University","UT","D1","Women","Softball","https://www.fieldlevel.com/uvu/softball/recruiting"],
  ["Vermont State University Lyndon","VT","D3","Women","Softball","https://www.fieldlevel.com/lyndonstate/softball/recruiting"],
  ["Walla Walla Community College","WA","JUCO","Women","Softball","https://slate.wwcc.edu/register/athletic-recruits"],
  ["Weber State University","UT","D1","Women","Softball","https://questionnaires.armssoftware.com/0bea2925c594"],
  ["West Virginia Tech","WV","NAIA","Women","Softball","https://www.fieldlevel.com/wvutech/softball/recruiting"],
  ["Western Kentucky University","KY","D1","Women","Softball","https://college.jumpforward.com/questionnaire.aspx?iid=370&sportid=31"],
  ["Western Oregon University","OR","D2","Women","Softball","https://wouwolves.com/sb_output.aspx?form=67"],
  ["Whitworth University","WA","D3","Women","Softball","https://questionnaires.armssoftware.com/4d7fb91e94f6"],
  ["Winthrop University","SC","D1","Women","Softball","https://questionnaires.armssoftware.com/18984bc5e6f2"],
  ["Xavier University of Louisiana","LA","NAIA","Women","Softball","https://www.fieldlevel.com/fmjv29mn/softball/recruiting"],
  ["Yakima Valley College","WA","JUCO","Women","Softball","https://goyaks.com/sb_output.aspx?form=3"],
  ["Academy of Art University","CA","D2","Women","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=1748&sportid=44"],
  ["Ashland University","OH","D2","Men","Tennis","https://questionnaires.armssoftware.com/a71d2abc1efb"],
  ["Ashland University","OH","D2","Women","Tennis","https://questionnaires.armssoftware.com/a98c4a1fb5fa"],
  ["Ball State University","IN","D1","Men","Tennis","https://questionnaires.armssoftware.com/2fcb3e80afdf"],
  ["Ball State University","IN","D1","Women","Tennis","https://questionnaires.armssoftware.com/56552c921ad8"],
  ["Baylor University","TX","D1","Men","Tennis","https://questionnaires.armssoftware.com/51b591626fee"],
  ["Baylor University","TX","D1","Women","Tennis","https://questionnaires.armssoftware.com/1e636cdee38b"],
  ["Bethel University","MN","D3","Men","Tennis","https://athletics.bethel.edu/sports/2023/9/14/recruits.aspx?path=mten"],
  ["Bethel University","MN","D3","Women","Tennis","https://athletics.bethel.edu/sports/2023/9/14/recruits.aspx?path=wten"],
  ["Bowling Green State University","OH","D1","Women","Tennis","https://questionnaires.armssoftware.com/0fc304338c35"],
  ["Brigham Young University","UT","D1","Women","Tennis","https://byucougars.com/womens-tennis-recruiting-form"],
  ["California Polytechnic State University","CA","D1","Men","Tennis","https://questionnaires.armssoftware.com/9f40e593d846"],
  ["California Polytechnic State University","CA","D1","Women","Tennis","https://questionnaires.armssoftware.com/f2f69ce6dd84"],
  ["California State University, Northridge","CA","D1","Women","Tennis","https://questionnaires.armssoftware.com/dfe4579db136"],
  ["Carleton College","MN","D3","Men","Tennis","https://questionnaires.armssoftware.com/5580ea55297a"],
  ["Carleton College","MN","D3","Women","Tennis","https://questionnaires.armssoftware.com/6fe82f02f305"],
  ["Carnegie Mellon University","PA","D3","Men","Tennis","https://questionnaires.armssoftware.com/1c576e614eee"],
  ["Carnegie Mellon University","PA","D3","Women","Tennis","https://questionnaires.armssoftware.com/2bc0412579e1"],
  ["Colorado State University","CO","D1","Women","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=1606&sportid=44"],
  ["Colorado State University Pueblo","CO","D2","Women","Tennis","https://questionnaires.armssoftware.com/1c859050d552"],
  ["Concordia University Irvine","CA","D2","Men","Tennis","https://questionnaires.armssoftware.com/a5a0e1a6edc4"],
  ["Concordia University Irvine","CA","D2","Women","Tennis","https://questionnaires.armssoftware.com/7f33f2a35c04"],
  ["Concordia University Wisconsin","WI","D3","Men","Tennis","https://cuwfalcons.com/sports/2025/7/3/mens-tennis-recruit-me.aspx"],
  ["Concordia University Wisconsin","WI","D3","Women","Tennis","https://cuwfalcons.com/sports/2025/7/3/womens-tennis-recruit-me.aspx"],
  ["Creighton University","NE","D1","Men","Tennis","https://gocreighton.com/form/3"],
  ["Creighton University","NE","D1","Women","Tennis","https://gocreighton.com/form/3"],
  ["Davidson College","NC","D1","Men","Tennis","https://questionnaires.armssoftware.com/742c77ab5924"],
  ["Davidson College","NC","D1","Women","Tennis","https://questionnaires.armssoftware.com/8b60763a76e1"],
  ["Delaware State University","DE","D1","Women","Tennis","https://questionnaires.armssoftware.com/9a1240910d31?path=wten"],
  ["Drake University","IA","D1","Men","Tennis","https://questionnaires.armssoftware.com/77a96dae1b45"],
  ["Duke University","NC","D1","Men","Tennis","https://questionnaires.armssoftware.com/c72cde0515e2"],
  ["Duke University","NC","D1","Women","Tennis","https://www.fieldlevel.com/duke/tenniswomen/recruiting"],
  ["Eastern Michigan University","MI","D1","Women","Tennis","https://questionnaires.armssoftware.com/bff6b7f1ea6d"],
  ["Emory University","GA","D3","Men","Tennis","https://questionnaires.armssoftware.com/dfe45ba413ff"],
  ["Emory University","GA","D3","Women","Tennis","https://questionnaires.armssoftware.com/55fc46d7dd91"],
  ["Fordham University","NY","D1","Women","Tennis","https://questionnaires.armssoftware.com/80659d3fc6a5"],
  ["Franklin & Marshall College","PA","D3","Both","Tennis","https://questionnaires.armssoftware.com/e7eb2adb46c7"],
  ["Fresno State University","CA","D1","Men","Tennis","https://questionnaires.armssoftware.com/1f18d321cfcf"],
  ["Fresno State University","CA","D1","Women","Tennis","https://questionnaires.armssoftware.com/0bfe386c7847"],
  ["George Fox University","OR","D3","Both","Tennis","https://athletics.georgefox.edu/sb_output.aspx?form=3"],
  ["Georgia Southern University","GA","D1","Men","Tennis","https://questionnaires.armssoftware.com/07701d6f530a"],
  ["Georgia Southern University","GA","D1","Women","Tennis","https://questionnaires.armssoftware.com/0cea2507c10b"],
  ["Georgia Southwestern State University","GA","D2","Men","Tennis","https://questionnaires.armssoftware.com/0ce8a7804e21"],
  ["Gonzaga University","WA","D1","Both","Tennis","https://gozags.com/sb_output.aspx?form=3"],
  ["Gonzaga University","WA","D1","Men","Tennis","https://questionnaires.armssoftware.com/41f95267a119"],
  ["Gonzaga University","WA","D1","Women","Tennis","https://questionnaires.armssoftware.com/c815b9df0050"],
  ["Hawai'i Pacific University","HI","D2","Women","Tennis","https://questionnaires.armssoftware.com/fdd66fd149cc"],
  ["Highline College","WA","JUCO","Women","Tennis","https://highlineathletics.com/sb_output.aspx?form=3"],
  ["James Madison University","VA","D1","Men","Tennis","https://questionnaires.armssoftware.com/42787b4a43bd"],
  ["James Madison University","VA","D1","Women","Tennis","https://questionnaires.armssoftware.com/7c38f31b63c6"],
  ["Kutztown University","PA","D2","Men","Tennis","https://questionnaires.armssoftware.com/ea892833b1ef"],
  ["Kutztown University","PA","D2","Women","Tennis","https://questionnaires.armssoftware.com/e88f58ddc535"],
  ["Lehigh University","PA","D1","Men","Tennis","https://questionnaires.armssoftware.com/3d0690efea2d"],
  ["Lewis & Clark College","OR","D3","Both","Tennis","https://apply.lclark.edu/register/recruit"],
  ["Long Beach State University","CA","D1","Women","Tennis","https://questionnaires.armssoftware.com/bb6cb78cec88"],
  ["Lubbock Christian University","TX","D2","Men","Tennis","https://questionnaires.armssoftware.com/4c99c94692fc"],
  ["Lubbock Christian University","TX","D2","Women","Tennis","https://questionnaires.armssoftware.com/ed1bcb844532"],
  ["Macalester College","MN","D3","Men","Tennis","https://forms.arirecruiting.com/forms/macalestercollege_m.w.tennis/form"],
  ["Macalester College","MN","D3","Women","Tennis","https://forms.arirecruiting.com/forms/macalestercollege_m.w.tennis/form"],
  ["Massachusetts Institute of Technology","MA","D3","Men","Tennis","https://questionnaires.armssoftware.com/067807003e46"],
  ["Massachusetts Institute of Technology","MA","D3","Women","Tennis","https://questionnaires.armssoftware.com/3a945315c46a"],
  ["McNeese State University","LA","D1","Women","Tennis","https://mcneesesports.com/sb_output.aspx?form=3&tab=prospectiveathleteform"],
  ["Mercyhurst University","PA","D1","Men","Tennis","https://questionnaires.armssoftware.com/70997edc1014"],
  ["Mercyhurst University","PA","D1","Women","Tennis","https://questionnaires.armssoftware.com/83f651d4a17a"],
  ["Miami University","OH","D1","Women","Tennis","https://questionnaires.armssoftware.com/1b246bed9b67"],
  ["Michigan Technological University","MI","D2","Men","Tennis","https://questionnaires.armssoftware.com/30e8c3450869"],
  ["Millersville University","PA","D2","Both","Tennis","https://questionnaires.armssoftware.com/ad624595ce9d"],
  ["Missouri State University","MO","D1","Women","Tennis","https://questionnaires.armssoftware.com/37a8f80c0d56"],
  ["Montana State University","MT","D1","Women","Tennis","https://questionnaires.armssoftware.com/0d317a81ea3f"],
  ["New York University","NY","D3","Men","Tennis","https://questionnaires.armssoftware.com/2f6065d2e25f"],
  ["Norfolk State University","VA","D1","Men","Tennis","https://questionnaires.armssoftware.com/c36b96495e70"],
  ["Norfolk State University","VA","D1","Women","Tennis","https://questionnaires.armssoftware.com/8797cc1de481"],
  ["North Carolina A&T State University","NC","D1","Both","Tennis","https://questionnaires.armssoftware.com/0ca800e11608"],
  ["North Carolina Central University","NC","D1","Men","Tennis","https://questionnaires.armssoftware.com/75ddea380e0b"],
  ["Northern Arizona University","AZ","D1","Men","Tennis","https://questionnaires.armssoftware.com/b0f9c40a80cb"],
  ["Northern Illinois University","IL","D1","Men","Tennis","https://questionnaires.armssoftware.com/9fed50810cea"],
  ["Occidental College","CA","D3","Both","Tennis","https://questionnaires.armssoftware.com/7be2357588f2"],
  ["Ohio Wesleyan University","OH","D3","Women","Tennis","https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=MjA1OTM=-87Fy1JlJnrY=&ptype=recruit"],
  ["Pepperdine University","CA","D1","Women","Tennis","https://questionnaires.armssoftware.com/137e215a92c3"],
  ["Portland State University","OR","D1","Both","Tennis","https://goviks.com/sb_output.aspx?form=5"],
  ["Purdue University","IN","D1","Men","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=1670&sportid=43"],
  ["Rice University","TX","D1","Women","Tennis","https://docs.google.com/forms/d/e/1FAIpQLSfPfCemtHYjureefZXlWM1T-Hm5s4fgAZ8vntBW5U_A4mUUAg/viewform"],
  ["Rose-Hulman Institute of Technology","IN","D3","Both","Tennis","https://athletics.rose-hulman.edu/sports/2020/6/18/tennis-recruiting-form"],
  ["Saint Mary's College of California","CA","D1","Men","Tennis","https://questionnaires.armssoftware.com/105ec96873b4"],
  ["Saint Mary's College of California","CA","D1","Women","Tennis","https://questionnaires.armssoftware.com/dbd20a889ff7"],
  ["Sewanee: The University of the South","TN","D3","Men","Tennis","https://questionnaires.armssoftware.com/3a64493d0d18"],
  ["Sewanee: The University of the South","TN","D3","Women","Tennis","https://questionnaires.armssoftware.com/41245dffdc40"],
  ["Southeastern Louisiana University","LA","D1","Women","Tennis","https://questionnaires.armssoftware.com/f8f8424e9cb0"],
  ["Southern Illinois University Edwardsville","IL","D1","Women","Tennis","https://questionnaires.armssoftware.com/60acbf3b0238"],
  ["St. Edward's University","TX","D2","Men","Tennis","https://gohilltoppers.com/sports/2016/9/27/seu-mens-tennis-recruit-questionnaire.aspx"],
  ["St. Edward's University","TX","D2","Women","Tennis","https://gohilltoppers.com/sports/2016/9/27/seu-womens-tennis-recruit-questionnaire-2.aspx"],
  ["St. John's University","NY","D1","Women","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=413&sportid=44"],
  ["St. Norbert College","WI","D3","Men","Tennis","https://explore.snc.edu/register/m.tennis.rfi"],
  ["St. Norbert College","WI","D3","Women","Tennis","https://explore.snc.edu/register/w.tennis.rfi"],
  ["St. Olaf College","MN","D3","Men","Tennis","https://athletics.stolaf.edu/sports/2016/9/14/tennis-recruit-questionnaire"],
  ["St. Olaf College","MN","D3","Women","Tennis","https://athletics.stolaf.edu/sports/2016/9/14/tennis-recruit-questionnaire"],
  ["Temple University","PA","D1","Men","Tennis","https://questionnaires.armssoftware.com/a85e8ceacf25"],
  ["Temple University","PA","D1","Women","Tennis","https://questionnaires.armssoftware.com/b90b25336c34"],
  ["Texas Christian University","TX","D1","Women","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=1677&sportid=44"],
  ["United States Air Force Academy","CO","D1","Men","Tennis","https://questionnaires.armssoftware.com/6727f7661ccf"],
  ["University of Arizona","AZ","D1","Men","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=375&sportid=43"],
  ["University of California, Davis","CA","D1","Men","Tennis","https://questionnaires.armssoftware.com/71f8b192d6f8"],
  ["University of California, Irvine","CA","D1","Women","Tennis","https://questionnaires.armssoftware.com/9827b3f36be8"],
  ["University of California, Los Angeles","CA","D1","Men","Tennis","https://questionnaires.armssoftware.com/12e7fbe05180"],
  ["University of California, Riverside","CA","D1","Men","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=1631&sportid=43"],
  ["University of Central Florida","FL","D1","Women","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=382&sportid=44"],
  ["University of Cincinnati","OH","D1","Women","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=379&sportid=44"],
  ["University of Colorado","CO","D1","Women","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=1684&sportid=44"],
  ["University of Connecticut","CT","D1","Men","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=331&sportid=43"],
  ["University of Connecticut","CT","D1","Women","Tennis","https://questionnaires.armssoftware.com/6d4f9b46d68d"],
  ["University of Denver","CO","D1","Men","Tennis","https://questionnaires.armssoftware.com/e44f06c052ec"],
  ["University of Georgia","GA","D1","Men","Tennis","https://questionnaires.armssoftware.com/ffec75636f03"],
  ["University of Georgia","GA","D1","Women","Tennis","https://questionnaires.armssoftware.com/7ac9286c58ec"],
  ["University of Hawai'i at Mānoa","HI","D1","Men","Tennis","https://questionnaires.armssoftware.com/9c7ba4a2684d"],
  ["University of Iowa","IA","D1","Women","Tennis","https://questionnaires.armssoftware.com/e85e74d7de96"],
  ["University of Kansas","KS","D1","Women","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=332&sportid=44"],
  ["University of Lynchburg","VA","D3","Men","Tennis","https://forms.arirecruiting.com/lynchburg_tennis.m.w/2024_25"],
  ["University of Lynchburg","VA","D3","Women","Tennis","https://forms.arirecruiting.com/lynchburg_tennis.m.w/2024_25"],
  ["University of Maryland, College Park","MD","D1","Women","Tennis","https://questionnaires.armssoftware.com/da23927d069f"],
  ["University of Minnesota","MN","D1","Women","Tennis","https://questionnaires.armssoftware.com/8f1b7bddc9fe"],
  ["University of Minnesota Morris","MN","D3","Men","Tennis","https://www.fieldlevel.com/y9j3c9c9/tennismen/recruiting"],
  ["University of Minnesota Morris","MN","D3","Women","Tennis","https://www.fieldlevel.com/y9j3c9c9/tenniswomen/recruiting"],
  ["University of Mount Olive","NC","D2","Men","Tennis","https://questionnaires.armssoftware.com/4cd7bbeac18d"],
  ["University of Mount Olive","NC","D2","Women","Tennis","https://questionnaires.armssoftware.com/4ad0a29b23d9"],
  ["University of Nebraska","NE","D1","Men","Tennis","https://questionnaires.armssoftware.com/c4a14b13cb97"],
  ["University of Nebraska","NE","D1","Women","Tennis","https://questionnaires.armssoftware.com/052b1e5ef4f7"],
  ["University of Nebraska Omaha","NE","D1","Men","Tennis","https://questionnaires.armssoftware.com/cf1837ec0f62"],
  ["University of Nebraska Omaha","NE","D1","Women","Tennis","https://questionnaires.armssoftware.com/d2d4273c0a83"],
  ["University of Nevada, Las Vegas","NV","D1","Men","Tennis","https://questionnaires.armssoftware.com/ad91602dd329"],
  ["University of New Mexico","NM","D1","Men","Tennis","https://questionnaires.armssoftware.com/3177fb02ca2e"],
  ["University of New Mexico","NM","D1","Women","Tennis","https://questionnaires.armssoftware.com/f6b9cecbcac8"],
  ["University of North Texas","TX","D1","Women","Tennis","https://questionnaires.armssoftware.com/f40c1ffd6eca"],
  ["University of Oregon","OR","D1","Men","Tennis","https://goducks.com/form/9"],
  ["University of Oregon","OR","D1","Women","Tennis","https://goducks.com/form/15"],
  ["University of Pennsylvania","PA","D1","Men","Tennis","https://questionnaires.armssoftware.com/53802480cf69"],
  ["University of Pennsylvania","PA","D1","Women","Tennis","https://questionnaires.armssoftware.com/be0aae4eace2"],
  ["University of Portland","OR","D1","Both","Tennis","https://portlandpilots.com/sb_output.aspx?form=39"],
  ["University of Rhode Island","RI","D1","Women","Tennis","https://questionnaires.armssoftware.com/5e11965b834f"],
  ["University of San Francisco","CA","D1","Men","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=454&sportid=43"],
  ["University of San Francisco","CA","D1","Women","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=454&sportid=44"],
  ["University of South Carolina","SC","D1","Women","Tennis","https://questionnaires.armssoftware.com/a43ff372c469"],
  ["University of South Carolina Upstate","SC","D1","Men","Tennis","https://questionnaires.armssoftware.com/7c3c390f9fb1"],
  ["University of South Carolina Upstate","SC","D1","Women","Tennis","https://questionnaires.armssoftware.com/faa19bf9e0e6"],
  ["University of Southern California","CA","D1","Women","Tennis","https://questionnaires.armssoftware.com/a62d44c45055"],
  ["University of Southern Indiana","IN","D1","Both","Tennis","https://questionnaires.armssoftware.com/91a808d54133"],
  ["University of Southern Indiana","IN","D1","Men","Tennis","https://questionnaires.armssoftware.com/91a808d54133"],
  ["University of Southern Mississippi","MS","D1","Men","Tennis","https://questionnaires.armssoftware.com/12617061d57c"],
  ["University of Tennessee at Chattanooga","TN","D1","Men","Tennis","https://questionnaires.armssoftware.com/0844da64a055"],
  ["University of Tennessee at Chattanooga","TN","D1","Women","Tennis","https://questionnaires.armssoftware.com/631ef4eecdf5"],
  ["University of Texas at Dallas","TX","D3","Women","Tennis","https://questionnaires.armssoftware.com/1a2527341e48"],
  ["University of Toledo","OH","D1","Men","Tennis","https://questionnaires.armssoftware.com/5af0186dd3ab"],
  ["University of Toledo","OH","D1","Women","Tennis","https://questionnaires.armssoftware.com/14adf3569e32"],
  ["University of Utah","UT","D1","Men","Tennis","https://questionnaires.armssoftware.com/aec82e71061a"],
  ["University of Utah","UT","D1","Women","Tennis","https://questionnaires.armssoftware.com/ed7073f0db5f"],
  ["University of Washington","WA","D1","Men","Tennis","https://questionnaires.armssoftware.com/1b9c23153018"],
  ["University of Washington","WA","D1","Women","Tennis","https://gohuskies.com/sports/2017/12/4/uw-wtennis-recruit-questionnaire"],
  ["University of West Alabama","AL","D2","Men","Tennis","https://questionnaires.armssoftware.com/058a55937d66?path=mten"],
  ["University of West Alabama","AL","D2","Women","Tennis","https://questionnaires.armssoftware.com/100cc5bf934a?path=wten"],
  ["University of West Florida","FL","D2","Men","Tennis","https://questionnaires.armssoftware.com/56d9ada8f225"],
  ["University of Wisconsin","WI","D1","Men","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=444&sportid=43"],
  ["University of Wisconsin","WI","D1","Women","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=444&sportid=44"],
  ["University of Wisconsin-Whitewater","WI","D3","Men","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=1616&sportid=43"],
  ["University of Wisconsin-Whitewater","WI","D3","Women","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=1616&sportid=44"],
  ["Utah Tech University","UT","D1","Women","Tennis","https://questionnaires.armssoftware.com/633fd02e2f01"],
  ["Vermont State University Lyndon","VT","D3","Men","Tennis","https://vtsuhornets.com/sports/2022/7/26/mens-tennis-recruiting-questionnaire.aspx"],
  ["Virginia Tech","VA","D1","Men","Tennis","https://questionnaires.armssoftware.com/eec718334433"],
  ["Virginia Tech","VA","D1","Women","Tennis","https://questionnaires.armssoftware.com/1a91cd814fa7"],
  ["Washington and Lee University","VA","D3","Women","Tennis","https://questionnaires.armssoftware.com/280718398307"],
  ["Washington University in St. Louis","MO","D3","Men","Tennis","https://washubears.com/sports/2022/8/2/mens-tennis-recruiting-questionnaire.aspx"],
  ["Washington University in St. Louis","MO","D3","Women","Tennis","https://washubears.com/sports/2022/8/2/womens-tennis-recruiting-questionnaire.aspx"],
  ["Weber State University","UT","D1","Men","Tennis","https://questionnaires.armssoftware.com/4645e65f092e"],
  ["Weber State University","UT","D1","Women","Tennis","https://questionnaires.armssoftware.com/eae6833f4645"],
  ["Western Kentucky University","KY","D1","Women","Tennis","https://college.jumpforward.com/questionnaire.aspx?iid=370&sportid=44"],
  ["Whitman College","WA","D3","Men","Tennis","https://whitmanblues.com/sb_output.aspx?form=3"],
  ["Whitworth University","WA","D3","Women","Tennis","https://questionnaires.armssoftware.com/aea351052c4e"],
  ["Whitworth University","WA","D3","Men","Tennis","https://questionnaires.armssoftware.com/775e5a5b40a4"],
  ["Winthrop University","SC","D1","Men","Tennis","https://questionnaires.armssoftware.com/c0e97652f92b"],
  ["Winthrop University","SC","D1","Women","Tennis","https://questionnaires.armssoftware.com/700ceff12ead"],
  ["Wittenberg University","OH","D3","Men","Tennis","https://www.fieldlevel.com/wittenberg/tennismen/recruiting"],
  ["Wittenberg University","OH","D3","Women","Tennis","https://www.fieldlevel.com/wittenberg/tenniswomen/recruiting"],
  ["Xavier University","OH","D1","Men","Tennis","https://questionnaires.armssoftware.com/e3cacc446dd4"],
  ["Xavier University","OH","D1","Women","Tennis","https://questionnaires.armssoftware.com/285236a54c2a"],
  ["Arizona State University","AZ","D1","Both","Track & Field","https://questionnaires.armssoftware.com/173d43444532"],
  ["Ashland University","OH","D2","Both","Track & Field","https://questionnaires.armssoftware.com/141bc5e4ed6d"],
  ["Baylor University","TX","D1","Both","Track & Field","https://questionnaires.armssoftware.com/4711f4c6ed7b"],
  ["Boise State University","ID","D1","Both","Track & Field","https://questionnaires.armssoftware.com/e0c3097c115b"],
  ["Bushnell University","OR","NAIA","Both","Track & Field","https://bushnellbeacons.com/sb_output.aspx?form=27"],
  ["California Polytechnic State University","CA","D1","Both","Track & Field","https://questionnaires.armssoftware.com/b98c4fa1a3ac"],
  ["Central Washington University","WA","D2","Both","Track & Field","https://wildcatsports.com/sb_output.aspx?form=3"],
  ["Clark College","WA","JUCO","Both","Track & Field","https://clarkpenguins.com/sb_output.aspx?form=3"],
  ["Coastal Carolina University","SC","D1","Both","Track & Field","https://questionnaires.armssoftware.com/63e6251205c3"],
  ["Colorado State University","CO","D1","Women","Track & Field","https://college.jumpforward.com/questionnaire.aspx?iid=1606&sportid=56"],
  ["Colorado State University Pueblo","CO","D2","Both","Track & Field","https://questionnaires.armssoftware.com/5a8df0a41f2c"],
  ["Corban University","OR","NAIA","Both","Track & Field","https://corbanwarriors.com/sb_output.aspx?form=3&tab=prospectivestudent-athletequestionnaire"],
  ["Drake University","IA","D1","Men","Track & Field","https://questionnaires.armssoftware.com/8afae3641693"],
  ["Drake University","IA","D1","Women","Track & Field","https://questionnaires.armssoftware.com/129ee71c3df4"],
  ["Duke University","NC","D1","Both","Track & Field","https://questionnaires.armssoftware.com/47e14e1c94d6"],
  ["Eastern New Mexico University","NM","D2","Both","Track & Field","https://questionnaires.armssoftware.com/0b15d0554513"],
  ["Eastern Oregon University","OR","NAIA","Both","Track & Field","https://eousports.com/sb_output.aspx?form=3"],
  ["Everett Community College","WA","JUCO","Women","Track & Field","https://athletics.everettcc.edu/Recruits/Recruiting_Form_-_Women-s_Track_-_Field"],
  ["Everett Community College","WA","JUCO","Men","Track & Field","https://athletics.everettcc.edu/Recruits/Recruiting_Form_-_Men-s_Track_-_Field"],
  ["Florida State University","FL","D1","Both","Track & Field","https://questionnaires.armssoftware.com/6bb68678fcd1"],
  ["Fresno State University","CA","D1","Men","Track & Field","https://questionnaires.armssoftware.com/5a2ef7be3f0e"],
  ["Fresno State University","CA","D1","Women","Track & Field","https://questionnaires.armssoftware.com/5e22e31fed6d"],
  ["Gardner-Webb University","NC","D1","Both","Track & Field","https://questionnaires.armssoftware.com/cc06ec8bd177"],
  ["George Fox University","OR","D3","Both","Track & Field","https://athletics.georgefox.edu/sb_output.aspx?form=3"],
  ["Georgia Southern University","GA","D1","Women","Track & Field","https://questionnaires.armssoftware.com/5766944f90c0"],
  ["Gonzaga University","WA","D1","Both","Track & Field","https://gozags.com/sb_output.aspx?form=3"],
  ["Grand Valley State University","MI","D2","Both","Track & Field","https://questionnaires.armssoftware.com/5f3f5e3b177b"],
  ["Idaho State University","ID","D1","Both","Track & Field","https://questionnaires.armssoftware.com/3f9f51e50cc7"],
  ["Indiana University Bloomington","IN","D1","Both","Track & Field","https://questionnaires.armssoftware.com/09c3636cf907"],
  ["Iowa State University","IA","D1","Men","Track & Field","https://questionnaires.armssoftware.com/83555dad0468"],
  ["Iowa State University","IA","D1","Women","Track & Field","https://questionnaires.armssoftware.com/1f54622f7a2f"],
  ["James Madison University","VA","D1","Women","Track & Field","https://questionnaires.armssoftware.com/e0b8fce34d7c"],
  ["Kansas State University","KS","D1","Both","Track & Field","https://questionnaires.armssoftware.com/192d07a6fea3"],
  ["Kentucky Wesleyan College","KY","D2","Both","Track & Field","https://questionnaires.armssoftware.com/ec66a53fb746"],
  ["Lane Community College","OR","JUCO","Both","Track & Field","https://www.lanetitans.com/sports/track/2018-19/questionnaire"],
  ["Lewis & Clark College","OR","D3","Both","Track & Field","https://apply.lclark.edu/register/recruit"],
  ["Long Beach State University","CA","D1","Both","Track & Field","https://questionnaires.armssoftware.com/553c4c75be91"],
  ["Louisiana State University","LA","D1","Both","Track & Field","https://questionnaires.armssoftware.com/0ac546a5bf3f"],
  ["Marquette University","WI","D1","Both","Track & Field","https://gomarquette.com/form/11"],
  ["McNeese State University","LA","D1","Both","Track & Field","https://mcneesesports.com/sb_output.aspx?form=3&tab=prospectiveathleteform"],
  ["Miami University","OH","D1","Both","Track & Field","https://questionnaires.armssoftware.com/2c862c011c39"],
  ["Michigan State University","MI","D1","Both","Track & Field","https://questionnaires.armssoftware.com/2c487b8fa2ee"],
  ["Michigan Technological University","MI","D2","Both","Track & Field","https://questionnaires.armssoftware.com/dd1ca7e09899"],
  ["Monterey Peninsula College","CA","JUCO","Both","Track & Field","https://docs.google.com/forms/d/e/1FAIpQLSfg3vofN1BkkIpjmmNguFn3whsk0IhXG3FNLq9Ky0iPNwzk9Q/viewform"],
  ["New Jersey Institute of Technology","NJ","D1","Both","Track & Field","https://questionnaires.armssoftware.com/ed12eb516a9c"],
  ["New York University","NY","D3","Both","Track & Field","https://questionnaires.armssoftware.com/72c321886bd1"],
  ["Norfolk State University","VA","D1","Both","Track & Field","https://questionnaires.armssoftware.com/be7256258ba3"],
  ["North Carolina State University","NC","D1","Both","Track & Field","https://questionnaires.armssoftware.com/3ce2f22f298a"],
  ["Northwest University","WA","NAIA","Both","Track & Field","https://nueagles.com/sb_output.aspx?form=3"],
  ["Oregon Institute of Technology","OR","NAIA","Both","Track & Field","https://oregontechowls.com/sb_output.aspx?form=3"],
  ["Oregon State University","OR","D1","Both","Track & Field","https://osubeavers.com/form/3"],
  ["Pepperdine University","CA","D1","Men","Track & Field","https://questionnaires.armssoftware.com/40d56bfda097"],
  ["Pepperdine University","CA","D1","Women","Track & Field","https://questionnaires.armssoftware.com/f1745ea28a5a"],
  ["Portland State University","OR","D1","Both","Track & Field","https://goviks.com/sb_output.aspx?form=3"],
  ["Providence College","RI","D1","Both","Track & Field","https://questionnaires.armssoftware.com/ab28e683f02b"],
  ["Saint Martin's University","WA","D2","Both","Track & Field","https://admissions.stmartin.edu/register/athletic_inquiry"],
  ["San Jose State University","CA","D1","Both","Track & Field","https://sjsuspartans.com/track-and-field-prospective-student-athlete-questionnaire"],
  ["Seattle Pacific University","WA","D2","Men","Track & Field","https://app.winwontech.com/questionnaire/seattlepacific/outdoortrackfield-m/X58t9DjfmvSgHoQ6EgDI"],
  ["South Dakota State University","SD","D1","Men","Track & Field","https://questionnaires.armssoftware.com/7808852cca9b"],
  ["Southern Connecticut State University","CT","D2","Men","Track & Field","https://questionnaires.armssoftware.com/bfd16dee13f9"],
  ["Southern Nazarene University","OK","D2","Both","Track & Field","https://questionnaires.armssoftware.com/7a1e5977d57e"],
  ["Southwest Minnesota State University","MN","D2","Both","Track & Field","https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=MjMxODY=-fAOOVF01UDI=&ptype=recruit"],
  ["St. Edward's University","TX","D2","Men","Track & Field","https://questionnaires.armssoftware.com/5980d6a1c8b8"],
  ["Stephen F. Austin State University","TX","D1","Men","Track & Field","https://questionnaires.armssoftware.com/e78dbda22b60"],
  ["Stephen F. Austin State University","TX","D1","Women","Track & Field","https://questionnaires.armssoftware.com/4440563afde5"],
  ["Texas A&M University","TX","D1","Both","Track & Field","https://questionnaires.armssoftware.com/621894d23cdb"],
  ["United States Air Force Academy","CO","D1","Both","Track & Field","https://questionnaires.armssoftware.com/e2d3c3e4022c"],
  ["University of Akron","OH","D1","Men","Track & Field","https://questionnaires.armssoftware.com/8805a5172d02"],
  ["University of Akron","OH","D1","Women","Track & Field","https://questionnaires.armssoftware.com/9d889bb07c85"],
  ["University of Alabama","AL","D1","Men","Track & Field","https://questionnaires.armssoftware.com/8192839bdf27"],
  ["University of Alaska Anchorage","AK","D2","Both","Track & Field","https://goseawolves.com/sb_output.aspx?form=9"],
  ["University of California, Davis","CA","D1","Both","Track & Field","https://questionnaires.armssoftware.com/1b3b48051717"],
  ["University of California, Los Angeles","CA","D1","Both","Track & Field","https://questionnaires.armssoftware.com/10dfbc77815b"],
  ["University of Central Arkansas","AR","D1","Both","Track & Field","https://questionnaires.armssoftware.com/945dc2639b44"],
  ["University of Central Florida","FL","D1","Both","Track & Field","https://questionnaires.armssoftware.com/97004c5e17c2"],
  ["University of Colorado","CO","D1","Men","Track & Field","https://college.jumpforward.com/questionnaire.aspx?iid=1684&sportid=56"],
  ["University of Colorado","CO","D1","Women","Track & Field","https://college.jumpforward.com/questionnaire.aspx?iid=1684&sportid=58"],
  ["University of Delaware","DE","D1","Women","Track & Field","https://questionnaires.armssoftware.com/66172e4afb25"],
  ["University of Florida","FL","D1","Men","Track & Field","https://questionnaires.armssoftware.com/39dfd9fd53ac"],
  ["University of Florida","FL","D1","Women","Track & Field","https://questionnaires.armssoftware.com/303fc1f4c17b"],
  ["University of Georgia","GA","D1","Both","Track & Field","https://questionnaires.armssoftware.com/efb958a7e4ce"],
  ["University of Hawai'i at Mānoa","HI","D1","Women","Track & Field","https://questionnaires.armssoftware.com/0cf03dc86e50"],
  ["University of Houston","TX","D1","Both","Track & Field","https://secure.assistantcoach.net/colleges/questionnaire.asp?QID=137&oid=49&sid=4700"],
  ["University of Illinois","IL","D1","Both","Track & Field","https://questionnaires.armssoftware.com/ee94b0b650db"],
  ["University of Iowa","IA","D1","Both","Track & Field","https://questionnaires.armssoftware.com/d49080741b3e"],
  ["University of Kansas","KS","D1","Both","Track & Field","https://kuathletics.wufoo.com/forms/kansas-track-questionnaire/"],
  ["University of Lynchburg","VA","D3","Both","Track & Field","https://forms.arirecruiting.com/lynchburg_xctf.m.w/2024_25"],
  ["University of Maine","ME","D1","Both","Track & Field","https://questionnaires.armssoftware.com/04e08503c551"],
  ["University of Maryland, College Park","MD","D1","Men","Track & Field","https://questionnaires.armssoftware.com/0f23c8c67469"],
  ["University of Massachusetts Amherst","MA","D1","Women","Track & Field","https://questionnaires.armssoftware.com/9512b1740211"],
  ["University of Miami","FL","D1","Men","Track & Field","https://questionnaires.armssoftware.com/474c1e06dfb3"],
  ["University of Miami","FL","D1","Women","Track & Field","https://questionnaires.armssoftware.com/c3d6606a2b1b"],
  ["University of Michigan","MI","D1","Both","Track & Field","https://questionnaires.armssoftware.com/ddd3c1e8109a"],
  ["University of Minnesota","MN","D1","Both","Track & Field","https://questionnaires.armssoftware.com/82ec9d2859b2"],
  ["University of Mississippi","MS","D1","Both","Track & Field","https://questionnaires.armssoftware.com/a0a22806e53a"],
  ["University of Missouri","MO","D1","Both","Track & Field","https://questionnaires.armssoftware.com/5df5af304de1"],
  ["University of Missouri","MO","D1","Men","Track & Field","https://college.jumpforward.com/questionnaire.aspx?iid=341&sportid=56"],
  ["University of Missouri","MO","D1","Women","Track & Field","https://college.jumpforward.com/questionnaire.aspx?iid=341&sportid=58"],
  ["University of Montana","MT","D1","Women","Track & Field","https://questionnaires.armssoftware.com/cdf78c1ea015"],
  ["University of Nebraska","NE","D1","Both","Track & Field","https://questionnaires.armssoftware.com/169514552f06"],
  ["University of Nevada, Las Vegas","NV","D1","Women","Track & Field","https://questionnaires.armssoftware.com/ed7cd3d17320"],
  ["University of New Hampshire","NH","D1","Women","Track & Field","https://questionnaires.armssoftware.com/eb017cd55142"],
  ["University of New Mexico","NM","D1","Both","Track & Field","https://questionnaires.armssoftware.com/7ac9224d71ba"],
  ["University of North Carolina at Chapel Hill","NC","D1","Both","Track & Field","https://questionnaires.armssoftware.com/7c623b73606a"],
  ["University of North Dakota","ND","D1","Both","Track & Field","https://questionnaires.armssoftware.com/c5ee17d79c8c"],
  ["University of Northern Iowa","IA","D1","Both","Track & Field","https://college.jumpforward.com/questionnaire.aspx?iid=537&sportid=56"],
  ["University of Oklahoma","OK","D1","Both","Track & Field","https://questionnaires.armssoftware.com/5d5fb3ed47b1"],
  ["University of Oregon","OR","D1","Women","Track & Field","https://goducks.com/form/17"],
  ["University of Oregon","OR","D1","Men","Track & Field","https://goducks.com/form/12"],
  ["University of Pennsylvania","PA","D1","Women","Track & Field","https://questionnaires.armssoftware.com/7bc46175accb?path=wtrack"],
  ["University of Portland","OR","D1","Both","Track & Field","https://portlandpilots.com/sb_output.aspx?form=35"],
  ["University of Rhode Island","RI","D1","Women","Track & Field","https://questionnaires.armssoftware.com/33b8965aa1e3"],
  ["University of San Francisco","CA","D1","Men","Track & Field","https://questionnaires.armssoftware.com/df268ea62be7"],
  ["University of San Francisco","CA","D1","Women","Track & Field","https://questionnaires.armssoftware.com/b013db5c011b"],
  ["University of South Carolina","SC","D1","Both","Track & Field","https://questionnaires.armssoftware.com/84bc1d9bbb6d"],
  ["University of South Carolina Upstate","SC","D1","Men","Track & Field","https://questionnaires.armssoftware.com/a912296d59c9"],
  ["University of South Carolina Upstate","SC","D1","Women","Track & Field","https://questionnaires.armssoftware.com/0986dbe2cb3c"],
  ["University of Southern California","CA","D1","Men","Track & Field","https://questionnaires.armssoftware.com/9ca188361802"],
  ["University of Southern California","CA","D1","Women","Track & Field","https://questionnaires.armssoftware.com/150ba54d0f20"],
  ["University of Tennessee","TN","D1","Men","Track & Field","https://questionnaires.armssoftware.com/10ac6d718dca"],
  ["University of Tennessee","TN","D1","Women","Track & Field","https://questionnaires.armssoftware.com/34f825715f45"],
  ["University of Tennessee at Chattanooga","TN","D1","Women","Track & Field","https://questionnaires.armssoftware.com/39047f1620c3"],
  ["University of Texas at Austin","TX","D1","Both","Track & Field","https://questionnaires.armssoftware.com/f36d3fe17d38"],
  ["University of Texas at Dallas","TX","D3","Men","Track & Field","https://questionnaires.armssoftware.com/fcacb5a7b591"],
  ["University of Texas at Dallas","TX","D3","Women","Track & Field","https://questionnaires.armssoftware.com/a67c237a0570"],
  ["University of Texas at El Paso","TX","D1","Men","Track & Field","https://college.jumpforward.com/questionnaire.aspx?iid=396&sportid=56"],
  ["University of Texas at El Paso","TX","D1","Women","Track & Field","https://college.jumpforward.com/questionnaire.aspx?iid=396&sportid=58"],
  ["University of Utah","UT","D1","Women","Track & Field","https://questionnaires.armssoftware.com/56a6b87d340b"],
  ["University of Vermont","VT","D1","Women","Track & Field","https://questionnaires.armssoftware.com/d0227476be07"],
  ["University of Washington","WA","D1","Both","Track & Field","https://questionnaires.armssoftware.com/d2b30412ba60"],
  ["University of Wisconsin","WI","D1","Both","Track & Field","https://questionnaires.armssoftware.com/ff7e7f3c2d84"],
  ["University of Wyoming","WY","D1","Women","Track & Field","https://questionnaires.armssoftware.com/b86b97822b05"],
  ["Virginia Tech","VA","D1","Both","Track & Field","https://questionnaires.armssoftware.com/74c75b5593fc"],
  ["Wake Forest University","NC","D1","Men","Track & Field","https://questionnaires.armssoftware.com/a8276f0d9d9c"],
  ["Wake Forest University","NC","D1","Women","Track & Field","https://questionnaires.armssoftware.com/c506c6d6f1e2"],
  ["Weber State University","UT","D1","Women","Track & Field","https://questionnaires.armssoftware.com/01cd59371ca1"],
  ["West Virginia State University","WV","D2","Both","Track & Field","https://wvsuyellowjackets.com/sb_output.aspx?form=33"],
  ["Western Oregon University","OR","D2","Both","Track & Field","https://wouwolves.com/sb_output.aspx?form=64"],
  ["Whitworth University","WA","D3","Women","Track & Field","https://questionnaires.armssoftware.com/8238c2e0227e?path=track"],
  ["Whitworth University","WA","D3","Men","Track & Field","https://questionnaires.armssoftware.com/b4d5a2a28cac"],
  ["Xavier University","OH","D1","Both","Track & Field","https://questionnaires.armssoftware.com/5f6b53be3278"],
  ["Academy of Art University","CA","D2","Women","Volleyball","https://college.jumpforward.com/questionnaire.aspx?iid=1748&sportid=13"],
  ["Arizona State University","AZ","D1","Women","Volleyball","https://questionnaires.armssoftware.com/9f8ef8296f71"],
  ["Arkansas State University","AR","D1","Women","Volleyball","https://www.fieldlevel.com/astate/volleyballwomen/recruiting"],
  ["Ashland University","OH","D2","Women","Volleyball","https://questionnaires.armssoftware.com/602172d61756"],
  ["Ball State University","IN","D1","Women","Volleyball","https://questionnaires.armssoftware.com/5e0f87f577c5"],
  ["Baylor University","TX","D1","Women","Volleyball","https://questionnaires.armssoftware.com/3605f78e3995"],
  ["Berry College","GA","D3","Women","Volleyball","https://questionnaires.armssoftware.com/91fcba33a90f"],
  ["Bethel University","MN","D3","Women","Volleyball","https://athletics.bethel.edu/sports/2023/9/14/recruits.aspx?path=wvball"],
  ["Bowling Green State University","OH","D1","Women","Volleyball","https://questionnaires.armssoftware.com/6cf8cf84fec3"],
  ["Bushnell University","OR","NAIA","Women","Volleyball","https://bushnellbeacons.com/sb_output.aspx?form=1"],
  ["California Polytechnic State University","CA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/0023b4455c5d"],
  ["California State University, Northridge","CA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/271e702adf0b"],
  ["Carnegie Mellon University","PA","D3","Women","Volleyball","https://questionnaires.armssoftware.com/239a59024c4e"],
  ["Central Michigan University","MI","D1","Women","Volleyball","https://questionnaires.armssoftware.com/47ff4881b2f2"],
  ["Central Washington University","WA","D2","Women","Volleyball","https://wildcatsports.com/sb_output.aspx?form=3"],
  ["Clark College","WA","JUCO","Women","Volleyball","https://clarkpenguins.com/sb_output.aspx?form=3"],
  ["Coastal Bend College","TX","JUCO","Women","Volleyball","https://www.cbcathletics.com/sports/wvball/recruit"],
  ["Colorado College","CO","D3","Women","Volleyball","https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=MjExNg==-F4N8n9iOxv0=&ptype=recruit"],
  ["Colorado Mesa University","CO","D2","Women","Volleyball","https://questionnaires.armssoftware.com/5699288f8ae1"],
  ["Colorado School of Mines","CO","D2","Women","Volleyball","https://questionnaires.armssoftware.com/4ab1d5ffba29"],
  ["Colorado State University","CO","D1","Women","Volleyball","https://college.jumpforward.com/questionnaire.aspx?iid=1606&sportid=13"],
  ["Columbia Basin College","WA","JUCO","Women","Volleyball","https://cbchawks.com/sb_output.aspx?form=1022"],
  ["Concordia University Wisconsin","WI","D3","Women","Volleyball","https://cuwfalcons.com/sports/2025/7/3/womens-volleyball-recruit-me.aspx"],
  ["Corban University","OR","NAIA","Women","Volleyball","https://corbanwarriors.com/sb_output.aspx?form=3&tab=prospectivestudent-athletequestionnaire"],
  ["Davidson College","NC","D1","Women","Volleyball","https://questionnaires.armssoftware.com/3a0213fe90c6"],
  ["Delaware State University","DE","D1","Women","Volleyball","https://questionnaires.armssoftware.com/f8b21dddf370?path=vb"],
  ["Duke University","NC","D1","Women","Volleyball","https://questionnaires.armssoftware.com/cce9abe5e236"],
  ["East Carolina University","NC","D1","Women","Volleyball","https://questionnaires.armssoftware.com/b59f77c19e9d"],
  ["East Texas A&M University","TX","D1","Women","Volleyball","https://questionnaires.armssoftware.com/c11a04e9e8ed"],
  ["Eastern Michigan University","MI","D1","Women","Volleyball","https://questionnaires.armssoftware.com/4acc7ac87853"],
  ["Edmonds College","WA","JUCO","Women","Volleyball","https://www.edmonds.edu/campus-life/triton-athletics/prosp-athlete-form.html"],
  ["Emory University","GA","D3","Women","Volleyball","https://questionnaires.armssoftware.com/100bd0cebf1a"],
  ["Everett Community College","WA","JUCO","Women","Volleyball","https://athletics.everettcc.edu/Recruits/Recruiting_Form_-_Volleyball"],
  ["Florida State University","FL","D1","Women","Volleyball","https://questionnaires.armssoftware.com/7bc7febf0520"],
  ["Franklin & Marshall College","PA","D3","Women","Volleyball","https://questionnaires.armssoftware.com/428700a0fec1"],
  ["Fresno State University","CA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/5dfab59b994b"],
  ["Gardner-Webb University","NC","D1","Women","Volleyball","https://questionnaires.armssoftware.com/34ffa73487c5"],
  ["George Fox University","OR","D3","Women","Volleyball","https://athletics.georgefox.edu/sb_output.aspx?form=3"],
  ["Georgetown University","DC","D1","Women","Volleyball","https://questionnaires.armssoftware.com/fbaaf822d556"],
  ["Georgia Southern University","GA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/c336723e7da2"],
  ["Gonzaga University","WA","D1","Women","Volleyball","https://gozags.com/sb_output.aspx?form=3"],
  ["Hawai'i Pacific University","HI","D2","Women","Volleyball","https://questionnaires.armssoftware.com/24da4a8a1956"],
  ["Highline College","WA","JUCO","Women","Volleyball","https://highlineathletics.com/sb_output.aspx?form=3"],
  ["Indiana University Bloomington","IN","D1","Women","Volleyball","https://questionnaires.armssoftware.com/77bc0adb3ddd"],
  ["Kansas State University","KS","D1","Women","Volleyball","https://www.fieldlevel.com/k-state/volleyballwomen/recruiting"],
  ["Kent State University","OH","D1","Women","Volleyball","https://college.jumpforward.com/questionnaire.aspx?iid=339&sportid=13"],
  ["Kutztown University","PA","D2","Women","Volleyball","https://questionnaires.armssoftware.com/0abb24e64a0a"],
  ["Lewis & Clark College","OR","D3","Women","Volleyball","https://apply.lclark.edu/register/recruit"],
  ["Long Beach State University","CA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/afaa9365a2a8"],
  ["Lower Columbia College","WA","JUCO","Women","Volleyball","https://lccreddevils.com/sb_output.aspx?form=3"],
  ["Macalester College","MN","D3","Women","Volleyball","https://forms.arirecruiting.com/forms/macalestercollege_w.volleyball/form"],
  ["Marquette University","WI","D1","Women","Volleyball","https://gomarquette.com/form/6"],
  ["McNeese State University","LA","D1","Women","Volleyball","https://mcneesesports.com/sb_output.aspx?form=3&tab=prospectiveathleteform"],
  ["Mercer University","GA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/058cd0cfb4c5"],
  ["Mercyhurst University","PA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/bb378294c88f"],
  ["Miami University","OH","D1","Women","Volleyball","https://questionnaires.armssoftware.com/3cf5d1feb827"],
  ["Michigan State University","MI","D1","Women","Volleyball","https://questionnaires.armssoftware.com/66c785ec802a"],
  ["Millersville University","PA","D2","Women","Volleyball","https://questionnaires.armssoftware.com/d8cbf6cbfbe4"],
  ["Mississippi State University","MS","D1","Women","Volleyball","https://hailstate.com/form/18"],
  ["Missouri State University","MO","D1","Women","Volleyball","https://questionnaires.armssoftware.com/a0a9d431d103"],
  ["Monterey Peninsula College","CA","JUCO","Women","Volleyball","https://docs.google.com/forms/d/e/1FAIpQLSch_6PVe2U697-zTJpqe9EuKPUL3t4TRtTMQnSyJ61pJk9AfQ/viewform"],
  ["Navarro College","TX","JUCO","Women","Volleyball","https://navarrobulldogs.com/sb_output.aspx?form=3"],
  ["New Jersey Institute of Technology","NJ","D1","Women","Volleyball","https://questionnaires.armssoftware.com/7f9bbf8367f1"],
  ["Norfolk State University","VA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/687aaa63b6a4"],
  ["North Dakota State University","ND","D1","Women","Volleyball","https://questionnaires.armssoftware.com/f3ae860c5e84"],
  ["Northern Arizona University","AZ","D1","Women","Volleyball","https://questionnaires.armssoftware.com/3226e13fe1e4"],
  ["Northern Illinois University","IL","D1","Women","Volleyball","https://questionnaires.armssoftware.com/14207409138f"],
  ["Northwest University","WA","NAIA","Women","Volleyball","https://nueagles.com/sb_output.aspx?form=3"],
  ["Occidental College","CA","D3","Women","Volleyball","https://questionnaires.armssoftware.com/e8020874fb1d"],
  ["Ohio State University","OH","D1","Women","Volleyball","https://ohiostatebuckeyes.com/form/37"],
  ["Ohio University","OH","D1","Women","Volleyball","https://college.jumpforward.com/questionnaire.aspx?iid=401&sportid=13"],
  ["Oklahoma Baptist University","OK","D2","Women","Volleyball","https://questionnaires.armssoftware.com/73da7a2406db"],
  ["Olympic College","WA","JUCO","Women","Volleyball","https://olympicrangers.com/landing/recruit_form"],
  ["Oregon Institute of Technology","OR","NAIA","Women","Volleyball","https://oregontechowls.com/sb_output.aspx?form=3"],
  ["Oregon State University","OR","D1","Women","Volleyball","https://osubeavers.com/form/3"],
  ["Pacific Lutheran University","WA","D3","Women","Volleyball","https://questionnaires.armssoftware.com/82c1671b519d"],
  ["Pennsylvania State University","PA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/17a7533d4fce"],
  ["Pepperdine University","CA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/eeb4e9e113fa"],
  ["Pierce College","WA","JUCO","Women","Volleyball","https://pierceraiders.com/general/2026Prospective_Athlete_Form"],
  ["Portland State University","OR","D1","Women","Volleyball","https://goviks.com/sb_output.aspx?form=3"],
  ["Providence College","RI","D1","Women","Volleyball","https://questionnaires.armssoftware.com/b86879bd2c84"],
  ["Rice University","TX","D1","Women","Volleyball","https://questionnaires.armssoftware.com/97bd3cfcd62e"],
  ["Saint Francis University","PA","D1","Women","Volleyball","https://college.jumpforward.com/questionnaire.aspx?iid=363&sportid=13"],
  ["Saint Martin's University","WA","D2","Women","Volleyball","https://admissions.stmartin.edu/register/athletic_inquiry"],
  ["Saint Mary's College of California","CA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/4095473ae0da"],
  ["Sam Houston State University","TX","D1","Women","Volleyball","https://questionnaires.armssoftware.com/2853f4aad64f"],
  ["San Jose State University","CA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/97b983c7f032"],
  ["Seattle Pacific University","WA","D2","Women","Volleyball","https://app.winwontech.com/questionnaire/seattlepacific/volleyball-w/6uUDsAJfKgKEZSn4Nikk"],
  ["Seton Hall University","NJ","D1","Women","Volleyball","https://questionnaires.armssoftware.com/5d826127178c"],
  ["Sewanee: The University of the South","TN","D3","Women","Volleyball","https://questionnaires.armssoftware.com/b7a0a4f54402"],
  ["South Dakota State University","SD","D1","Women","Volleyball","https://questionnaires.armssoftware.com/308d0714fa28"],
  ["South Puget Sound Community College","WA","JUCO","Women","Volleyball","https://spsccathletics.com/recruiting/Prospective_Athlete"],
  ["Southern Illinois University","IL","D1","Women","Volleyball","https://questionnaires.armssoftware.com/93ee29b219d3"],
  ["Southwestern Oregon Community College","OR","JUCO","Women","Volleyball","https://swoccathletics.com/sb_output.aspx?form=31"],
  ["St. John's University","NY","D1","Women","Volleyball","https://redstormsports.com/documents/2018/6/22/volleyball_prospective_student_athlete_questionnaire.pdf"],
  ["Stanford University","CA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/11bb656dfe5e"],
  ["Stephen F. Austin State University","TX","D1","Women","Volleyball","https://questionnaires.armssoftware.com/8c5ec4fb1b6a"],
  ["Tacoma Community College","WA","JUCO","Women","Volleyball","https://tacomatitans.com/information/recruiting-form"],
  ["Temple University","PA","D1","Women","Volleyball","https://college.jumpforward.com/questionnaire.aspx?iid=1723&sportid=13"],
  ["Texas Tech University","TX","D1","Women","Volleyball","https://questionnaires.armssoftware.com/37c17ff2d4c4"],
  ["Texas Woman's University","TX","D2","Women","Volleyball","https://questionnaires.armssoftware.com/49effe170371"],
  ["United States Air Force Academy","CO","D1","Women","Volleyball","https://questionnaires.armssoftware.com/e4e706dc641e"],
  ["University at Buffalo","NY","D1","Women","Volleyball","https://www.fieldlevel.com/buffalo/volleyballwomen/recruiting"],
  ["University of Akron","OH","D1","Women","Volleyball","https://questionnaires.armssoftware.com/1949ce46c044"],
  ["University of Alabama","AL","D1","Women","Volleyball","https://questionnaires.armssoftware.com/e7339f20092f"],
  ["University of Alaska Anchorage","AK","D2","Women","Volleyball","https://questionnaires.armssoftware.com/bbdc7f6b0534"],
  ["University of California, Davis","CA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/c9f1bcdd603c"],
  ["University of California, Irvine","CA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/8d901196a4a0"],
  ["University of California, Riverside","CA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/824745a488a5"],
  ["University of Connecticut","CT","D1","Women","Volleyball","https://questionnaires.armssoftware.com/4495d447fffd"],
  ["University of Georgia","GA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/640e100cba06"],
  ["University of Idaho","ID","D1","Women","Volleyball","https://college.jumpforward.com/questionnaire.aspx?iid=441&sportid=13"],
  ["University of Illinois","IL","D1","Women","Volleyball","https://college.jumpforward.com/questionnaire.aspx?iid=403&sportid=13"],
  ["University of Iowa","IA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/fc28693fb7b3"],
  ["University of Kentucky","KY","D1","Women","Volleyball","https://www.fieldlevel.com/uky/volleyballwomen/recruiting"],
  ["University of Louisiana at Lafayette","LA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/dc1f22966316"],
  ["University of Lynchburg","VA","D3","Women","Volleyball","https://forms.arirecruiting.com/lynchburg_w.volleyball/2024_25"],
  ["University of Maine at Augusta","ME","USCAA","Women","Volleyball","https://www.umamoose.com/information/Recruiting_questionaire/women-s_volleyball_questionnaire"],
  ["University of Maryland, College Park","MD","D1","Women","Volleyball","https://questionnaires.armssoftware.com/446e562694ee"],
  ["University of Massachusetts Amherst","MA","D1","Women","Volleyball","https://www.fieldlevel.com/umass/volleyballwomen/recruiting"],
  ["University of Memphis","TN","D1","Women","Volleyball","https://docs.google.com/forms/d/e/1FAIpQLSeH1lRTg84DdNk_jbxM_i76ddGOKW3CaGenC5qAKOagBzZS6w/viewform"],
  ["University of Michigan","MI","D1","Women","Volleyball","https://www.fieldlevel.com/umich/volleyballwomen/recruiting"],
  ["University of Minnesota","MN","D1","Women","Volleyball","https://questionnaires.armssoftware.com/c41edd44b1dd"],
  ["University of Missouri","MO","D1","Women","Volleyball","https://questionnaires.armssoftware.com/bb4ee00b7e2c"],
  ["University of Missouri–St. Louis","MO","D2","Women","Volleyball","https://www.fieldlevel.com/umsl/volleyballwomen/recruiting"],
  ["University of Montana","MT","D1","Women","Volleyball","https://www.fieldlevel.com/montana/volleyballwomen/recruiting"],
  ["University of Mount Olive","NC","D2","Women","Volleyball","https://questionnaires.armssoftware.com/fa032910bbf3"],
  ["University of Nebraska Omaha","NE","D1","Women","Volleyball","https://questionnaires.armssoftware.com/b37e0eab1ed3"],
  ["University of Nevada, Las Vegas","NV","D1","Women","Volleyball","https://questionnaires.armssoftware.com/6e2bcdc9412d"],
  ["University of New Hampshire","NH","D1","Women","Volleyball","https://www.fieldlevel.com/crcrdkn9/volleyballwomen/recruiting"],
  ["University of New Mexico","NM","D1","Women","Volleyball","https://www.fieldlevel.com/unm/volleyballwomen/recruiting"],
  ["University of North Carolina at Chapel Hill","NC","D1","Women","Volleyball","https://docs.google.com/forms/d/e/1FAIpQLSeIqJAKEgCdQEHIdHZGF1R3rw4ekHcipxbI4J2TvrtNa1IkJg/viewform"],
  ["University of North Carolina Greensboro","NC","D1","Women","Volleyball","https://questionnaires.armssoftware.com/620417e24325"],
  ["University of Northern Iowa","IA","D1","Women","Volleyball","https://college.jumpforward.com/questionnaire.aspx?iid=537&sportid=13"],
  ["University of Oregon","OR","D1","Women","Volleyball","https://goducks.com/form/3"],
  ["University of Pennsylvania","PA","D1","Women","Volleyball","https://www.fieldlevel.com/upenn/volleyballwomen/recruiting"],
  ["University of Rhode Island","RI","D1","Women","Volleyball","https://questionnaires.armssoftware.com/f258cf469b3f"],
  ["University of South Carolina","SC","D1","Women","Volleyball","https://questionnaires.armssoftware.com/299212cabf5e"],
  ["University of South Carolina Upstate","SC","D1","Women","Volleyball","https://questionnaires.armssoftware.com/a56568244914"],
  ["University of South Florida","FL","D1","Women","Volleyball","https://questionnaires.armssoftware.com/7fbbec0c6bd5"],
  ["University of Southern California","CA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/3af8f01739bb"],
  ["University of Tennessee at Chattanooga","TN","D1","Women","Volleyball","https://questionnaires.armssoftware.com/4b19be345d0a"],
  ["University of Texas at Dallas","TX","D3","Women","Volleyball","https://questionnaires.armssoftware.com/d49076faad79"],
  ["University of Texas at El Paso","TX","D1","Women","Volleyball","https://college.jumpforward.com/questionnaire.aspx?iid=396&sportid=13"],
  ["University of Texas at Tyler","TX","D2","Women","Volleyball","https://questionnaires.armssoftware.com/8e352fd84c8f"],
  ["University of Toledo","OH","D1","Women","Volleyball","https://questionnaires.armssoftware.com/6274400088e6"],
  ["University of Tulsa","OK","D1","Women","Volleyball","https://questionnaires.armssoftware.com/877d2cc48b82"],
  ["University of Utah","UT","D1","Women","Volleyball","https://www.fieldlevel.com/utah/volleyballwomen/recruiting"],
  ["University of Washington","WA","D1","Women","Volleyball","https://www.fieldlevel.com/washington/volleyballwomen/recruiting"],
  ["University of Wisconsin","WI","D1","Women","Volleyball","https://www.fieldlevel.com/wisconsin/volleyballwomen/recruiting"],
  ["University of Wisconsin-Parkside","WI","D2","Women","Volleyball","https://questionnaires.armssoftware.com/ec427e1b4476"],
  ["University of Wisconsin-Whitewater","WI","D3","Women","Volleyball","https://college.jumpforward.com/questionnaire.aspx?iid=1616&sportid=13"],
  ["Villanova University","PA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/5544c4adc938"],
  ["Virginia Tech","VA","D1","Women","Volleyball","https://questionnaires.armssoftware.com/3492b8cbe52b"],
  ["Walla Walla Community College","WA","JUCO","Women","Volleyball","https://slate.wwcc.edu/register/athletic-recruits"],
  ["Weber State University","UT","D1","Women","Volleyball","https://questionnaires.armssoftware.com/08415b94f751"],
  ["West Virginia University","WV","D1","Women","Volleyball","https://www.fieldlevel.com/wvu/volleyballwomen/recruiting"],
  ["Western Kentucky University","KY","D1","Women","Volleyball","https://college.jumpforward.com/questionnaire.aspx?iid=370&sportid=13"],
  ["Western Oregon University","OR","D2","Women","Volleyball","https://wouwolves.com/sb_output.aspx?form=50"],
  ["Whitman College","WA","D3","Women","Volleyball","https://www.frontrush.com/FR_Web_App/Player/PlayerSubmit.aspx?sid=NjExNg==-ucjGFEDdJhY=&ptype=recruit"],
  ["Whitworth University","WA","D3","Women","Volleyball","https://questionnaires.armssoftware.com/8b4d9268ec46"],
  ["Wichita State University","KS","D1","Women","Volleyball","https://questionnaires.armssoftware.com/533a969373d8"],
  ["Winthrop University","SC","D1","Women","Volleyball","https://questionnaires.armssoftware.com/726229f2fd53"],
  ["Wright State University","OH","D1","Women","Volleyball","https://questionnaires.armssoftware.com/e5cbc52bb1fb"],
  ["Xavier University","OH","D1","Women","Volleyball","https://questionnaires.armssoftware.com/98b9b28abfd4"],
  ["Yakima Valley College","WA","JUCO","Women","Volleyball","https://goyaks.com/sb_output.aspx?form=3"]
];
