import { createAdminClient } from '@/lib/supabase-admin';

// "Don't email me again" for the single signup reminder.
//
// Separate from /api/unsubscribe because that one works off
// profiles.unsubscribe_token, and the people who receive this email have no
// profiles row — that is the whole point of supabase/73. Pointing them at the
// existing route would hand them a link that silently does nothing, which is
// worse than no link at all.
//
// GET as well as POST, which is the opposite of the rule /api/unsubscribe
// follows, and deliberately. That route is POST-only because mail scanners GET
// every link in a message and would opt people out of mail they wanted. Here
// there is nothing to lose: the reminder is sent once and never repeats, so a
// scanner marking it stopped costs the recipient nothing, while a person who
// clicks and lands on "method not allowed" is left with no way to say no. When
// the two failure modes are that lopsided, take the one that respects the ask.

async function stop(token) {
  if (!token) return Response.json({ error: 'Missing token' }, { status: 400 });
  const admin = createAdminClient();
  const { error } = await admin
    .from('signup_reminders')
    .update({ stopped_at: new Date().toISOString() })
    .eq('stop_token', token);
  // A bad token reports success, same reasoning as /api/unsubscribe: saying
  // "no such token" turns this into an oracle for guessing valid ones, and the
  // sender cannot act on the difference anyway.
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
     <title>Done</title>
     <body style="margin:0;background:#EDEEF0;font:400 16px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#2A2C30;">
       <div style="max-width:480px;margin:12vh auto;padding:28px 24px;background:#fff;border-radius:10px;">
         <h1 style="margin:0 0 10px;font-size:20px;">That's done</h1>
         <p style="margin:0 0 10px;">You won't hear from RecruitGrid again.</p>
         <p style="margin:0;color:#6B6E75;font-size:14px;">
           You were never added to a mailing list — you asked for a sign-in link and we sent
           one reminder when it went unused. There was nothing else coming.
         </p>
       </div>
     </body>`,
    { headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  );
}

export async function GET(request) {
  return stop(new URL(request.url).searchParams.get('t'));
}

export async function POST(request) {
  return stop(new URL(request.url).searchParams.get('t'));
}
