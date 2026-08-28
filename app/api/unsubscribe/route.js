import { createAdminClient } from '@/lib/supabase-admin';

// POST only, on purpose.
//
// Mail scanners and link previewers routinely GET every URL in a message. If
// unsubscribing happened on GET, corporate spam filters would quietly opt
// people out of mail they wanted. The visible link in the footer goes to
// /unsubscribe, which is a page with a button that posts here.
//
// This also serves RFC 8058 one-click: Gmail and Outlook POST here directly
// from their native "unsubscribe" control, with no confirmation step, which
// is exactly why the token has to be in the query string.
export async function POST(request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('t');
  if (!token) {
    return Response.json({ error: 'Missing token' }, { status: 400 });
  }

  // Two independent mailing streams, two independent switches. Unsubscribing
  // from the weekly newsletter must not silently stop the camp reminders
  // someone asked for by registering — that reads as a bug and costs the trust
  // the reminders are there to build. Anything other than an explicit
  // type=newsletter turns off reminders, which keeps every link already sitting
  // in an inbox working exactly as it did before this parameter existed.
  const column =
    url.searchParams.get('type') === 'newsletter' ? 'email_newsletter' : 'email_reminders';

  const admin = createAdminClient();
  const { data, error } = await admin
    .from('profiles')
    .update({ [column]: false })
    .eq('unsubscribe_token', token)
    .select('id');

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  // A bad token reports success too. Saying "no such token" would turn this
  // into an oracle for guessing valid ones, and the sender can't act on the
  // difference anyway.
  return Response.json({ ok: true, updated: data?.length ?? 0 });
}
