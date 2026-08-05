// Served at /manifest.webmanifest by Next.js. Makes the site installable:
// "Add to Home Screen" gives the RG icon and opens full-screen with no
// browser chrome. No app store, no review, no developer fee.
//
// start_url is /app rather than / on purpose. Someone who has installed this
// is a returning user; the landing page is for people who haven't signed up.
// Signed-out visitors get bounced to /signin by middleware, which is the
// right first screen for them anyway.

export default function manifest() {
  return {
    name: 'RecruitGrid',
    short_name: 'RecruitGrid',
    description:
      'Verified camps, college programs at every division, coach outreach and film — one place to run your recruiting.',
    start_url: '/app',
    display: 'standalone',
    background_color: '#17181A',
    theme_color: '#17181A',
    orientation: 'portrait',
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      // Android crops icons to a circle or squircle and only guarantees the
      // middle ~80%. This copy carries the extra padding so the monogram
      // isn't clipped; without a maskable entry Android adds its own white
      // plate behind the icon instead.
      { src: '/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
