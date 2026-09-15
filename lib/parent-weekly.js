// The Sunday parent update: what goes in it, and sending it.
//
// The athlete does the recruiting; the parent usually pays for it and wonders
// how it's going. A short weekly note built from what the athlete already
// tracks gives the parent something specific to ask about, and brings back the
// athletes who signed up and stalled — which is most of them.
//
// Everything here is read from stored data. Nothing is guessed: a quiet week
// says it was quiet, because that is the week a parent most needs to know.
//
// Used by the Sunday job (app/api/cron/parent-weekly) and the "send a preview"
// button, so the two can never drift apart.

import { monthlyChecklist, checklistAutoDone, resolveChecklist, ymdIn } from './monthly-checklist';
import { listMatches, athleteGenderFrom } from './list-matches';
import { isListable, namedPrograms, isShowcase } from './showcases';
import { parentWeeklyEmail } from './emails/parent-weekly';

export const PARENT_TZ = 'America/Los_Angeles';
const SITE = 'https://recruitgrid.app';
const DAY = 86400000;
const UPCOMING_DAYS = 21;
const NUDGE_DAYS = 30;

const CONTACTED = (status) => !!status && status !== 'not_contacted';
const firstNameOf = (name) => String(name || '').trim().split(/\s+/)[0] || '';

function shortDate(ts, timeZone = PARENT_TZ) {
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone });
}
function weekday(ts, timeZone = PARENT_TZ) {
  return new Date(ts).toLocaleDateString('en-US', { weekday: 'long', timeZone });
}
// Catalogue and user_camps dates are plain dates; read them as UTC so they
// don't shift a day.
function plainDate(d) {
  return new Date(`${d}T00:00:00Z`).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', timeZone: 'UTC' });
}

// Checklist items are written to the athlete ("Email your Target coaches").
// The parent reads them about the athlete.
export function checklistForParent(text, first) {
  const name = first || 'the athlete';
  const out = String(text)
    .replace(/\byou['’]ll\b/gi, `${name} will`)
    .replace(/\byou['’]re\b/gi, `${name} is`)
    .replace(/\byou talk\b/gi, `${name} talks`)
    .replace(/\byour\b/gi, `${name}'s`)
    .replace(/\byou\b/gi, name);
  // "Check Jamario's core courses with Jamario's counselor" reads better with
  // the name once: later possessives become "the".
  let seen = false;
  return out.replace(new RegExp(`${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}'s`, 'g'), (m) => {
    if (seen) return 'the';
    seen = true;
    return m;
  });
}

/** Everything the update needs for one athlete. */
export async function loadParentWeekly(admin, userId, now = new Date()) {
  const today = ymdIn(now, PARENT_TZ);
  const horizon = ymdIn(new Date(now.getTime() + UPCOMING_DAYS * DAY), PARENT_TZ);
  const [profileRes, coachesRes, userCampsRes, filmRes, subRes, upcomingRes] = await Promise.all([
    admin.from('profiles').select('*').eq('id', userId).maybeSingle(),
    admin.from('coaches').select('*').eq('user_id', userId),
    admin.from('user_camps').select('*').eq('user_id', userId),
    admin.from('film').select('id, created_at').eq('user_id', userId),
    admin.from('subscriptions').select('status').eq('user_id', userId).maybeSingle(),
    admin
      .from('camps')
      .select('id, school, camp_name, date, city, state, sport, type, attending_programs, source_url')
      .gte('date', today)
      .lte('date', horizon)
      .order('date'),
  ]);
  const userCamps = userCampsRes.data || [];
  const trackedIds = userCamps.map((c) => c.camp_id).filter(Boolean);
  let trackedCatalogue = [];
  if (trackedIds.length) {
    const { data } = await admin.from('camps').select('id, sport').in('id', trackedIds);
    trackedCatalogue = data || [];
  }
  return {
    profile: profileRes.data,
    coaches: coachesRes.data || [],
    userCamps,
    film: filmRes.data || [],
    isPaid: subRes.data?.status === 'active',
    upcomingCatalogue: (upcomingRes.data || []).filter(isListable),
    trackedCatalogue,
  };
}

/** The update's content, ready for the email template. */
export function composeParentWeekly(data, now = new Date()) {
  const { profile, coaches, userCamps, film, isPaid, upcomingCatalogue, trackedCatalogue } = data;
  const athleteName = String(profile?.name || '').trim() || 'Your athlete';
  const first = firstNameOf(profile?.name) || 'Your athlete';
  const weekAgo = now.getTime() - 7 * DAY;
  const inWeek = (ts) => !!ts && new Date(ts).getTime() >= weekAgo;
  const today = ymdIn(now, PARENT_TZ);
  const horizon = ymdIn(new Date(now.getTime() + UPCOMING_DAYS * DAY), PARENT_TZ);

  // ---- the week in numbers
  const contactedThisWeek = coaches.filter((c) => CONTACTED(c.status) && inWeek(c.status_changed_at));
  const openedThisWeek = coaches
    .filter((c) => inWeek(c.link_last_opened_at))
    .sort((a, b) => new Date(b.link_last_opened_at) - new Date(a.link_last_opened_at));
  const questionnairesThisWeek = coaches.filter((c) => inWeek(c.questionnaire_submitted_at));

  const opens = openedThisWeek.slice(0, 5).map((c) => {
    const times = c.link_open_count > 1 ? ` · ${c.link_open_count} opens so far` : '';
    const contact = CONTACTED(c.status) && c.status_changed_at ? ` · ${first} contacted them ${shortDate(c.status_changed_at)}` : '';
    return {
      coach: c.name && c.name !== 'Coaching Staff' ? c.name : 'Coaching staff',
      school: c.school || '',
      tier: c.tier || '',
      meta: `Last opened ${weekday(c.link_last_opened_at)}${times}${contact}`,
    };
  });

  // ---- Dream and Target schools gone quiet. Target first: those are the
  // realistic ones, and the ones a nudge most often changes.
  const seen = new Set();
  const nudges = coaches
    .filter((c) => (c.tier === 'target' || c.tier === 'dream') && c.status !== 'committed' && c.status !== 'responded')
    .filter((c) => !CONTACTED(c.status) || !c.status_changed_at || new Date(c.status_changed_at).getTime() < now.getTime() - NUDGE_DAYS * DAY)
    .sort((a, b) => (a.tier === b.tier ? 0 : a.tier === 'target' ? -1 : 1))
    .filter((c) => {
      const k = String(c.school || '').trim().toLowerCase();
      if (!k || seen.has(k)) return false;
      seen.add(k);
      return true;
    })
    .slice(0, 3)
    .map((c) => ({
      school: c.school,
      tier: c.tier,
      meta: CONTACTED(c.status) && c.status_changed_at ? `Last contacted ${shortDate(c.status_changed_at)}` : 'Not contacted yet',
    }));

  // ---- coming up: registered camps, then catalogue events at list schools.
  // Registration links only for paid accounts, same as the Camps tab.
  const registered = userCamps
    .filter((c) => c.status === 'registered' && c.camp_date && c.camp_date >= today && c.camp_date <= horizon)
    .sort((a, b) => a.camp_date.localeCompare(b.camp_date))
    .map((c) => ({ title: c.name || 'Camp', meta: `${plainDate(c.camp_date)} · Registered`, url: '', date: c.camp_date, campId: c.camp_id }));
  const trackedIdSet = new Set(userCamps.map((c) => c.camp_id).filter(Boolean));
  const gender = athleteGenderFrom(trackedIdSet, trackedCatalogue);
  const onList = listMatches(coaches, upcomingCatalogue, profile?.sport, gender)
    .filter(({ camp }) => !registered.some((r) => r.campId === camp.id))
    .map(({ camp, kind, schools }) => {
      const where = [camp.city, camp.state].filter(Boolean).join(', ');
      const programs = namedPrograms(camp);
      const who = kind === 'showcase'
        ? `${schools.map((s) => s.name).join(', ')}${programs.length > schools.length ? ` and ${programs.length - schools.length} more attending` : ' attending'}`
        : 'On the list';
      return {
        title: `${camp.school}${camp.camp_name ? ` — ${camp.camp_name}` : ''}`,
        meta: [plainDate(camp.date), where, isShowcase(camp) ? 'Showcase' : null, who].filter(Boolean).join(' · '),
        url: isPaid ? camp.source_url || '' : '',
        date: camp.date,
      };
    });
  const upcoming = [...registered, ...onList].sort((a, b) => a.date.localeCompare(b.date)).slice(0, 4);

  // ---- this month's checklist, as the Roster strip shows it
  const noon = new Date(`${today}T12:00:00`);
  const checklist = monthlyChecklist(profile?.grad_year, noon);
  const auto = checklistAutoDone({ coaches, film, camps: userCamps }, now, PARENT_TZ);
  const ticks = checklist ? profile?.checklist_ticks?.[checklist.monthKey] || [] : [];
  const items = resolveChecklist(checklist, auto, Array.isArray(ticks) ? ticks : []).map((it) => ({
    label: checklistForParent(it.label, first),
    done: it.done,
  }));

  // ---- one question, from the most useful thing that happened
  let question = '';
  const openNoFollowUp = openedThisWeek.find(
    (c) => !c.status_changed_at || new Date(c.status_changed_at) < new Date(c.link_last_opened_at)
  );
  const soon = upcoming.find((u) => u.date <= ymdIn(new Date(now.getTime() + 14 * DAY), PARENT_TZ));
  if (openNoFollowUp) {
    const who = openNoFollowUp.name && openNoFollowUp.name !== 'Coaching Staff' ? openNoFollowUp.name : 'A coach';
    question = `${who} at ${openNoFollowUp.school} opened ${first}'s profile on ${weekday(openNoFollowUp.link_last_opened_at)}. Has a follow-up gone out since?`;
  } else if (soon) {
    question = `${soon.title} is ${plainDate(soon.date)}. Have the coaches ${first} wants to meet there been told ${first} is coming?`;
  } else if (!contactedThisWeek.length && nudges.length) {
    question = `No coaches were contacted this week. Could ${first} send one short note to ${nudges[0].school} this weekend?`;
  } else if (!contactedThisWeek.length && !coaches.length) {
    question = `There are no schools on ${first}'s list yet. Which three colleges would ${first} like to start with?`;
  } else if (items.find((it) => !it.done)) {
    question = `What's the plan for this one from the checklist: “${items.find((it) => !it.done).label}”?`;
  }

  const start = shortDate(now.getTime() - 6 * DAY);
  const end = shortDate(now.getTime());
  const position = checklist ? checklist.title.split(' · ')[1] : '';
  const subtitle = [`${start} – ${end}`, profile?.grad_year ? `Class of ${profile.grad_year}` : null, position || null]
    .filter(Boolean)
    .join(' · ');

  const stats = {
    contacted: contactedThisWeek.length,
    opened: openedThisWeek.length,
    questionnaires: questionnairesThisWeek.length,
  };
  const quiet = !stats.contacted && !stats.opened && !stats.questionnaires;
  const summary = quiet
    ? 'a quiet week'
    : [
        stats.contacted ? `${stats.contacted} coach${stats.contacted === 1 ? '' : 'es'} contacted` : null,
        stats.opened ? `${stats.opened} profile open${stats.opened === 1 ? '' : 's'}` : null,
      ]
        .filter(Boolean)
        .join(', ') || `${stats.questionnaires} questionnaire${stats.questionnaires === 1 ? '' : 's'}`;

  return {
    athleteName,
    firstName: first,
    subtitle,
    subject: `${first}'s recruiting week: ${summary}`,
    preheader: question || subtitle,
    stats,
    opens,
    question,
    nudges,
    upcoming,
    checklist: { month: checklist ? checklist.title.split(' · ')[0] : '', items },
  };
}

export const stopUrlFor = (token) => `${SITE}/parent?a=stop&t=${token}`;
export const confirmUrlFor = (token) => `${SITE}/parent?a=confirm&t=${token}`;

/** Sends through Resend. Throws with Resend's message on failure. */
export async function sendEmail({ to, subject, html, headers }) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: 'RecruitGrid <notifications@recruitgrid.app>', to, subject, html, headers }),
  });
  if (!res.ok) throw new Error(`Resend ${res.status}: ${await res.text()}`);
}

/** Build and send one athlete's update to their confirmed parent address. */
export async function sendParentWeekly(admin, userId, now = new Date()) {
  const data = await loadParentWeekly(admin, userId, now);
  const p = data.profile;
  if (!p?.parent_email || p.parent_confirmed_email !== p.parent_email || !p.parent_token) {
    return { sent: false, reason: 'not confirmed' };
  }
  const content = composeParentWeekly(data, now);
  const { subject, html } = parentWeeklyEmail(content, stopUrlFor(p.parent_token));
  await sendEmail({
    to: p.parent_email,
    subject,
    html,
    headers: {
      'List-Unsubscribe': `<${SITE}/api/parent-updates/stop?t=${p.parent_token}>`,
      'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click',
    },
  });
  return { sent: true };
}
