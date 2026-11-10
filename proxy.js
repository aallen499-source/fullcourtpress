import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function proxy(request) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        }
      }
    }
  );

  // IMPORTANT: getUser(), not getSession().
  // getSession() reads the cookie without verifying it, so a forged cookie would
  // pass. getUser() validates against the Supabase auth server. This one word is
  // the difference between real protection and the appearance of it.
  const { data: { user } } = await supabase.auth.getUser();

  const isProtected = request.nextUrl.pathname.startsWith('/app');

  if (isProtected && !user) {
    const url = request.nextUrl.clone();
    url.pathname = '/signin';
    url.searchParams.set('next', request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }

  // Already signed in? Skip the sign-in page.
  if (request.nextUrl.pathname === '/signin' && user) {
    const url = request.nextUrl.clone();
    url.pathname = '/app';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return response;
}

// Only the paths that actually use the session.
//
// Until 2026-11-10 this matched everything that was not a static asset, so
// every request to every public page — all ~2,700 questionnaire, camp and
// coach pages, the sitemap, robots — ran this function and made a Supabase
// auth round-trip, and then did nothing with the answer, because only /app
// and /signin branch on it. In Next 16 the proxy is a Node function, so each
// of those invocations was billed CPU. Crawlers sweep those pages constantly,
// and that is the most likely reason the Hobby plan's four hours of Fluid
// Active CPU ran out and Vercel paused the account.
//
// Public pages that read the session themselves (a published profile, the
// owner's /outreach) still work: they call getUser() with whatever cookie is
// present. The only thing they lose is the token refresh, which happens the
// next time the person opens /app.
export const config = {
  matcher: ['/app/:path*', '/app', '/signin', '/outreach'],
};
