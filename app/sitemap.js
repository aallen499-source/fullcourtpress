// Served at /sitemap.xml by Next.js.
//
// Public marketing pages only. Athlete profiles and film share links are
// deliberately absent — they are noindex, and listing them here would be
// handing a crawler the exact URLs we just asked it to skip.

const SITE = 'https://recruitgrid.app';

export default function sitemap() {
  const now = new Date();
  return [
    { url: `${SITE}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${SITE}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${SITE}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${SITE}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];
}
