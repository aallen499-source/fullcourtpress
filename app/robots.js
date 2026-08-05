// Served at /robots.txt by Next.js.
//
// The disallows are about crawl waste, not secrecy — /app and the API are
// behind auth anyway. Published profiles and film share pages carry their own
// noindex in generateMetadata, which is the directive that actually keeps them
// out of results; a Disallow here would only stop Google reading the page, and
// a URL it cannot read can still be indexed from an inbound link.

const SITE = 'https://recruitgrid.app';

export default function robots() {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/app', '/api/', '/auth/', '/signin'],
      },
    ],
    sitemap: `${SITE}/sitemap.xml`,
  };
}
