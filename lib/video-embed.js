// Shared video embed helpers.
//
// These lived as hand-synced copies in app/[slug]/page.jsx and
// app/app/page.jsx (the former even carried a "kept in sync by hand"
// comment). Adding the /f/[shareId] watch page would have made three
// copies, so they're extracted here instead.

export function getEmbedUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v');
      if (id) return 'https://www.youtube.com/embed/' + id;
      if (u.pathname.startsWith('/embed/')) return url;
      if (u.pathname.startsWith('/shorts/')) return 'https://www.youtube.com/embed/' + u.pathname.split('/')[2];
    }
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return 'https://www.youtube.com/embed/' + id;
    }
    if (host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return 'https://player.vimeo.com/video/' + id;
    }
  } catch {
    // not a valid URL — fall through
  }
  return null;
}

export function isUploadedVideoUrl(url) {
  return typeof url === 'string' && url.includes('/storage/v1/object/public/film/');
}

// Short, URL-safe, unguessable id for share links. 12 chars from a
// 32-character alphabet is ~60 bits — far past anything enumerable — and
// the alphabet drops vowels and lookalike characters (0/O, 1/I/l) so the
// id stays readable if someone types it off a screen.
const SHARE_ID_ALPHABET = '23456789bcdfghjkmnpqrstvwxyz';

export function generateShareId(length = 12) {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  let out = '';
  for (const b of bytes) out += SHARE_ID_ALPHABET[b % SHARE_ID_ALPHABET.length];
  return out;
}
