/** @type {import('next').NextConfig} */
const nextConfig = {
  // The Playbook PDF lives in private/, not public/, so nobody can guess their
  // way to a paid file. Next only ships what it can see being imported, and a
  // runtime fs.readFile is invisible to it — without this the download works
  // on localhost and 500s in production.
  outputFileTracingIncludes: {
    '/api/playbook/download': ['./private/playbook.pdf'],
  },

  // The resources section launched as /guides on 2026-09-15 and was renamed the
  // same day. Permanent redirects keep any link or crawl of the old address.
  async redirects() {
    return [
      // www serves the site rather than redirecting, because the redirect set
      // in Vercel's domain settings did not stick. Doing it here keeps it in
      // version control and applies to every path, not just the home page.
      // Listed first so a www request leaves www in one hop and the rules
      // below then run against the canonical host.
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.recruitgrid.app' }],
        destination: 'https://recruitgrid.app/:path*',
        permanent: true,
      },
      { source: '/guides', destination: '/resources', permanent: true },
      { source: '/guides/:slug', destination: '/resources/:slug', permanent: true },
    ];
  },
};

export default nextConfig;
