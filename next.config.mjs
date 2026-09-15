/** @type {import('next').NextConfig} */
const nextConfig = {
  // The resources section launched as /guides on 2026-09-15 and was renamed the
  // same day. Permanent redirects keep any link or crawl of the old address.
  async redirects() {
    return [
      { source: '/guides', destination: '/resources', permanent: true },
      { source: '/guides/:slug', destination: '/resources/:slug', permanent: true },
    ];
  },
};

export default nextConfig;
