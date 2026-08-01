import { createClient } from '@/lib/supabase-server';
import { notFound } from 'next/navigation';
import { getEmbedUrl, isUploadedVideoUrl } from '@/lib/video-embed';
import styles from './profile.module.css';

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
    .from('profiles')
    .select('*')
    .eq('public_slug', slug)
    .eq('public_published', true)
    .single();
  if (!profile) return null;

  const { data: film } = await supabase
    .from('film')
    .select('*')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: true });

  return { profile, film: film || [] };
}

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const result = await getPublishedProfile(slug);
  return {
    title: result ? `${result.profile.name || 'Athlete'} — Recruiting Profile` : 'Profile not found',
  };
}

export default async function AthleteProfilePage({ params }) {
  const { slug } = await params;
  const result = await getPublishedProfile(slug);
  if (!result) notFound();
  const { profile, film } = result;

  const stats = [];
  if (profile.position) stats.push(['Position', profile.position]);
  if (profile.height) stats.push(['Height', profile.height]);
  if (profile.gpa) stats.push(['GPA', profile.gpa]);
  if (profile.show_ncaa_publicly && profile.ncaa_id) stats.push(['NCAA ID', profile.ncaa_id]);

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

  return (
    <>
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
          {profile.bio && <div className={styles.cvBio}>{profile.bio}</div>}
          <div className={styles.cvContact}>
            {mailLink && (
              <a className={styles.btnGold} href={mailLink}>
                Email {(profile.name || 'Athlete').split(' ')[0]}
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
          Shared via Full Court Press — a self-managed recruiting profile, not an agency or verified database.
        </div>
      </div>
    </>
  );
}
