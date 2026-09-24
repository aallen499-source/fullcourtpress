import { createClient } from '@/lib/supabase-server';
import { fieldsForSport, sportKey, TRACK_PAIRS } from '@/lib/stat-fields';
import { notFound } from 'next/navigation';
import { getEmbedUrl, isUploadedVideoUrl } from '@/lib/video-embed';
import styles from './profile.module.css';
import OpenBeacon from './OpenBeacon';

const KIND_LABELS = {
  game: 'Game',
  tournament: 'Tournament',
  showcase: 'Showcase',
  camp: 'Camp',
  visit: 'Visit',
};

/** "Fri Oct 10" or "Oct 10–11" — short enough to read at a glance. */
function eventDates(e) {
  // Dates are stored as plain YYYY-MM-DD. Parsing them with new Date(str)
  // would read them as UTC midnight and show the day before west of Greenwich.
  const at = (ymd) => {
    const [y, m, d] = String(ymd).split('-').map(Number);
    return new Date(y, m - 1, d);
  };
  const start = at(e.date);
  const fmtDay = (dt) => dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  if (e.end_date && e.end_date !== e.date) {
    const end = at(e.end_date);
    const sameMonth = start.getMonth() === end.getMonth();
    return `${fmtDay(start)}–${sameMonth ? end.getDate() : fmtDay(end)}`;
  }
  return `${start.toLocaleDateString('en-US', { weekday: 'short' })} ${fmtDay(start)}`;
}

function FilmCard({ film }) {
  const embed = getEmbedUrl(film.url);
  return (
    <div className={styles.filmCard}>
      {embed ? (
        <div className={styles.filmEmbed}>
          <iframe
            src={embed}
            loading="lazy"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      ) : isUploadedVideoUrl(film.url) ? (
        <div className={styles.filmEmbed}>
          <video controls preload="metadata" src={film.url} />
        </div>
      ) : (
        <div className={styles.filmThumb}>▶</div>
      )}
      <div className={styles.filmBody}>
        <div className={styles.filmTitle}>{film.title}</div>
        <div className={styles.filmMeta}>{film.sport || ''}</div>
        <div className={styles.filmDesc}>{film.description || ''}</div>
        {/* The link is optional in the Film Locker, so a published entry can
            legitimately have no URL — don't render a dead anchor for it. */}
        {film.url && (
          <a className={styles.filmLink} href={film.url} target="_blank" rel="noopener noreferrer">
            Open original ↗
          </a>
        )}
      </div>
    </div>
  );
}

async function getPublishedProfile(slug) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    // Only the columns a visitor may see (supabase/58). The view already
    // limits it to published profiles and masks hidden fields.
    .from('public_profiles')
    .select('*')
    .eq('public_slug', slug)
    .single();
  if (!profile) return null;

  const { data: film } = await supabase
    .from('film')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: true });

  // Upcoming only. A schedule is the one part of a profile that rots in
  // public — last month's games tell a coach the athlete stopped updating it,
  // which is worse than showing nothing. Multi-day events stay listed until
  // the last day passes. Today is taken in Pacific time rather than UTC so a
  // game tonight does not vanish from the page at 5pm.
  const todayPT = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Los_Angeles' });
  const { data: events } = await supabase
    .from('athlete_events')
    .select('*')
    .eq('user_id', profile.id)
    .or(`end_date.gte.${todayPT},and(end_date.is.null,date.gte.${todayPT})`)
    .order('date', { ascending: true })
    .limit(8);

  return { profile, film: film || [], events: events || [] };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const result = await getPublishedProfile(slug);
  return {
    title: result ? `${result.profile.name || 'Athlete'} — Recruiting Profile` : 'Profile not found',
    // These pages carry a minor's name, grad year, school and film. They exist
    // so an athlete can hand a link to a coach — not so the page turns up when
    // someone searches the kid's name. Keeping them out of the index costs
    // nothing: the link still works for anyone the athlete sends it to.
    robots: { index: false, follow: false },
  };
}

export default async function AthleteProfilePage({ params }) {
  const { slug } = await params;
  const result = await getPublishedProfile(slug);
  if (!result) notFound();
  const { profile, film, events } = result;

  const stats = [];
  if (profile.position) stats.push(['Position', profile.position]);
  if (profile.height) stats.push(['Height', profile.height]);
  if (profile.gpa) stats.push(['GPA', profile.gpa]);
  if (profile.show_ncaa_publicly && profile.ncaa_id) stats.push(['NCAA ID', profile.ncaa_id]);

  // Season stats, shown as their own strip. A coach arriving from an email
  // that said "Film and stats" is here for these, not for the height.
  const sv = profile.stats && typeof profile.stats === 'object' ? profile.stats : {};
  const val = (k) => String(sv[k] ?? '').trim();
  const season = [];
  if (sportKey(profile.sport) === 'track') {
    for (const [ek, mk] of TRACK_PAIRS) {
      if (val(ek) && val(mk)) season.push([val(ek), val(mk)]);
    }
  } else {
    for (const f of fieldsForSport(profile.sport) || []) {
      if (val(f.key)) season.push([f.pct ? `${f.label} %` : f.label, val(f.key)]);
    }
  }

  const mailLink = profile.email
    ? `mailto:${encodeURIComponent(profile.email)}?subject=${encodeURIComponent('Following up on your recruiting profile')}`
    : null;

  const cleanHandle = (h) => (h || '').trim().replace(/^@/, '');
  const socialLinks = [
    profile.instagram && { label: 'Instagram', url: `https://instagram.com/${cleanHandle(profile.instagram)}` },
    profile.twitter && { label: 'X / Twitter', url: `https://x.com/${cleanHandle(profile.twitter)}` },
    profile.facebook && { label: 'Facebook', url: `https://facebook.com/${cleanHandle(profile.facebook)}` },
  ].filter(Boolean);

  const schoolLocation = [profile.school_city, profile.school_state].filter(Boolean).join(', ');

  // An athlete checking their own link — or testing it — is not a coach
  // opening it, so the open beacon is never rendered for the owner.
  const supabase = await createClient();
  const { data: { user: viewer } } = await supabase.auth.getUser();
  const isOwner = viewer?.id === profile.id;

  return (
    <>
      {!isOwner && <OpenBeacon slug={slug} />}
      <div className={styles.cvHero}>
        <div className={styles.cvHeroInner}>
          <div className={styles.cvTop}>
            {profile.avatar_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={profile.avatar_url} alt="" className={styles.cvAvatar} />
            )}
            <div>
              <div className={styles.cvName}>{profile.name || 'Athlete'}</div>
              <div className={styles.cvMeta}>
                {profile.sport || ''}
                {profile.grad_year ? ` · CLASS OF ${profile.grad_year}` : ''}
                {profile.school ? ` · ${profile.school}` : ''}
                {schoolLocation ? ` (${schoolLocation})` : ''}
              </div>
            </div>
          </div>
          {stats.length > 0 && (
            <div className={styles.cvStats}>
              {stats.map(([k, v]) => (
                <div className={styles.cvStat} key={k}>
                  <div className={styles.cvStatK}>{k}</div>
                  <div className={styles.cvStatV}>{v}</div>
                </div>
              ))}
            </div>
          )}
          {season.length > 0 && (
            <>
              <div className={styles.cvSectionLabel}>Season stats</div>
              <div className={styles.cvStats}>
                {season.map(([k, v]) => (
                  <div className={styles.cvStat} key={k}>
                    <div className={styles.cvStatK}>{k}</div>
                    <div className={styles.cvStatV}>{v}</div>
                  </div>
                ))}
              </div>
            </>
          )}
          {profile.key_stats && <div className={styles.cvStatNote}>{profile.key_stats}</div>}
          {profile.bio && <div className={styles.cvBio}>{profile.bio}</div>}
          <div className={styles.cvContact}>
            {mailLink && (
              <a className={styles.btnGold} href={mailLink}>
                Email {(profile.name || 'Athlete').split(' ')[0]}
              </a>
            )}
            {profile.phone && (
              <a className={styles.btnGold} href={`tel:${String(profile.phone).replace(/[^\d+]/g, '')}`}>
                Call {profile.phone}
              </a>
            )}
            {socialLinks.length > 0 && (
              <div className={styles.cvSocial}>
                {socialLinks.map((s) => (
                  <a key={s.label} href={s.url} target="_blank" rel="noopener noreferrer">
                    {s.label}
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className={styles.coachView}>
        {events.length > 0 && (
          <>
            {/* Above the film on purpose. A coach who has already watched the
                film comes back for this, and one who hasn't should see that
                there is somewhere to go and watch in person. */}
            <div className={styles.cvSectionTitle}>Where to watch</div>
            <div className={styles.schedule}>
              {events.map((e) => (
                <div className={styles.scheduleRow} key={e.id}>
                  <div className={styles.scheduleDate}>{eventDates(e)}</div>
                  <div>
                    <div className={styles.scheduleTitle}>{e.title}</div>
                    <div className={styles.scheduleMeta}>
                      {[KIND_LABELS[e.kind] || null, e.location, e.time_note].filter(Boolean).join(' · ')}
                    </div>
                    {e.note && <div className={styles.scheduleNote}>{e.note}</div>}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        <div className={styles.cvSectionTitle}>Film</div>
        <div className={styles.filmGrid}>
          {film.length ? (
            film.map((f) => <FilmCard film={f} key={f.id} />)
          ) : (
            <div className={styles.empty}>
              <b>No film linked yet</b>
              Ask the athlete directly for game or highlight film.
            </div>
          )}
        </div>

        <div className={styles.cvFooter}>
          Shared via RecruitGrid — a self-managed recruiting profile, not an agency or verified database.
        </div>
      </div>
    </>
  );
}
