import { createAdminClient } from '@/lib/supabase-admin';
import { getEmbedUrl, isUploadedVideoUrl } from '@/lib/video-embed';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import styles from './watch.module.css';

// Read with the service-role key rather than the anon key on purpose. film's
// RLS only exposes rows belonging to a *published* profile, and a clip can be
// shared without publishing a whole profile. Adding a public policy like
// `using (share_id is not null)` would have covered that, but the anon key is
// public, so anyone could then enumerate every shared clip on the platform.
// Looking it up server-side means only the exact share_id in the URL resolves.
async function getSharedFilm(shareId) {
  const admin = createAdminClient();
  const { data: film } = await admin.from('film').select('*').eq('share_id', shareId).maybeSingle();
  if (!film) return null;

  const { data: profile } = await admin
    .from('profiles')
    .select('name, sport, grad_year, school, public_slug, public_published, avatar_url')
    .eq('id', film.user_id)
    .maybeSingle();

  return { film, profile };
}

export async function generateMetadata({ params }) {
  const { shareId } = await params;
  const result = await getSharedFilm(shareId);
  if (!result) return { title: 'Film not found' };
  const who = result.profile?.name || 'Athlete';
  return {
    title: `${result.film.title || 'Film'} — ${who} | RecruitGrid`,
    description: result.film.description || `${who} recruiting film.`,
    // Same reasoning as the published profile: film of a minor, shared by
    // link on purpose. Unguessable share ids are not privacy on their own
    // once a crawler indexes one.
    robots: { index: false, follow: false },
  };
}

export default async function WatchFilmPage({ params }) {
  const { shareId } = await params;
  const result = await getSharedFilm(shareId);
  if (!result) notFound();
  const { film, profile } = result;

  const embed = getEmbedUrl(film.url);
  const meta = [profile?.sport, profile?.grad_year ? `Class of ${profile.grad_year}` : null, profile?.school]
    .filter(Boolean)
    .join(' · ');

  return (
    <div className={styles.wrap}>
      <div className={styles.inner}>
        <div className={styles.player}>
          {embed ? (
            <iframe
              src={embed}
              loading="lazy"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isUploadedVideoUrl(film.url) ? (
            <video controls preload="metadata" src={film.url} />
          ) : (
            <a className={styles.fallback} href={film.url} target="_blank" rel="noopener noreferrer">
              Open film ↗
            </a>
          )}
        </div>

        <h1 className={styles.title}>{film.title || 'Film'}</h1>
        {meta && <div className={styles.meta}>{meta}</div>}
        {profile?.name && <div className={styles.athlete}>{profile.name}</div>}
        {film.description && <p className={styles.desc}>{film.description}</p>}

        {profile?.public_published && profile?.public_slug && (
          <Link className={styles.profileLink} href={`/${profile.public_slug}`}>
            View full profile →
          </Link>
        )}

        <div className={styles.footer}>
          Shared via <Link href="/">RecruitGrid</Link> — a self-managed recruiting profile, not an agency or
          verified database.
        </div>
      </div>
    </div>
  );
}
