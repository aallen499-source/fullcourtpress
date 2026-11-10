// Which commit is actually serving.
//
// Five times now a push has been followed by "is it live?" with no way to
// answer from outside: Vercel has silently skipped builds, and most changes
// are not visible on any page. The 2026-11-10 CPU pause added a new flavour —
// a commit pushed while the account was paused, with no way to tell whether
// it built once service resumed.
//
// Vercel sets VERCEL_GIT_COMMIT_SHA at build time, so this answers the
// question directly. A short SHA and a build date are not secrets.
//
// Deliberately NOT a Supabase or Stripe health check. Those live in
// /api/cron/health behind CRON_SECRET; this must stay cheap and public so it
// can be polled right after a push without burning anything.

export const dynamic = 'force-static';

const BUILT_AT = new Date().toISOString();

export function GET() {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA || '';
  return Response.json(
    {
      sha: sha.slice(0, 7) || 'local',
      builtAt: BUILT_AT,
      env: process.env.VERCEL_ENV || 'local',
    },
    { headers: { 'Cache-Control': 'public, max-age=60' } }
  );
}
