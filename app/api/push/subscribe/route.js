import { createClient } from '@/lib/supabase-server';

// Save or remove the caller's own push subscription.
//
// Deliberately uses the request-scoped Supabase client, not the admin one, so
// the RLS policy in supabase/37-push-subscriptions.sql is what enforces
// ownership. An admin client here would let a crafted body attach a
// subscription to someone else's account, and the policy would never see it.

export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  let sub;
  try {
    sub = await request.json();
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }

  const endpoint = sub?.endpoint;
  const p256dh = sub?.keys?.p256dh;
  const auth = sub?.keys?.auth;
  if (!endpoint || !p256dh || !auth) {
    return new Response('Incomplete subscription', { status: 400 });
  }

  // onConflict on endpoint, because the same browser re-subscribing is an
  // update rather than a new row — a person who signs out and back in should
  // not collect a second copy and get every reminder twice.
  const { error } = await supabase.from('push_subscriptions').upsert(
    {
      user_id: user.id,
      endpoint,
      p256dh,
      auth,
      user_agent: request.headers.get('user-agent')?.slice(0, 300) || null,
    },
    { onConflict: 'endpoint' }
  );
  if (error) return new Response(`Could not save subscription: ${error.message}`, { status: 500 });

  return Response.json({ ok: true });
}

export async function DELETE(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return new Response('Unauthorized', { status: 401 });

  let endpoint;
  try {
    ({ endpoint } = await request.json());
  } catch {
    return new Response('Bad JSON', { status: 400 });
  }
  if (!endpoint) return new Response('No endpoint', { status: 400 });

  // The RLS policy scopes this to the caller's own rows, so a stolen endpoint
  // from someone else's account cannot be unsubscribed by this route.
  const { error } = await supabase.from('push_subscriptions').delete().eq('endpoint', endpoint);
  if (error) return new Response(`Could not remove subscription: ${error.message}`, { status: 500 });

  return Response.json({ ok: true });
}
