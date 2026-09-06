// Sending web push, and pruning the subscriptions that have died.
//
// Push payloads are encrypted per subscription with the keys the browser gave
// us at subscribe time, which is why push_subscriptions stores p256dh and auth
// alongside the endpoint. The push service relays an opaque blob; it cannot
// read the notification, and neither can we once it has left.

import webpush from 'web-push';

// VAPID identifies *us* to the push service across every send. The public half
// also ships to the browser (NEXT_PUBLIC_) because subscribing requires it —
// that is by design, it is not a secret. The private half must never leave the
// server, and rotating it invalidates every existing subscription, so it is
// generated once and left alone.
let configured = false;
function configure() {
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return false;
  if (!configured) {
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:info@recruitgrid.app',
      publicKey,
      privateKey
    );
    configured = true;
  }
  return true;
}

export function pushConfigured() {
  return configure();
}

/**
 * Push one notification to every browser a user has subscribed.
 *
 * Never throws. This is called from the reminder cron beside the email send,
 * and a push failure must not cost someone their email — the email is the
 * reliable channel and push is the nicer one.
 *
 * Returns { sent, removed, failed }.
 */
export async function sendPushToUser(admin, userId, { title, body, url, tag }) {
  if (!configure()) return { sent: 0, removed: 0, failed: 0, reason: 'VAPID keys unset' };

  const { data: subs, error } = await admin
    .from('push_subscriptions')
    .select('id, endpoint, p256dh, auth')
    .eq('user_id', userId);
  if (error || !subs?.length) return { sent: 0, removed: 0, failed: 0 };

  const payload = JSON.stringify({ title, body, url, tag });
  let sent = 0, removed = 0, failed = 0;

  for (const s of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        payload
      );
      sent++;
      await admin
        .from('push_subscriptions')
        .update({ last_success_at: new Date().toISOString() })
        .eq('id', s.id);
    } catch (err) {
      // 404 and 410 are the push service telling us this subscription is gone
      // for good — the app was uninstalled, or the browser data cleared. Those
      // rows must be deleted or the table fills with endpoints that can never
      // receive anything, and every future send wastes a request on each.
      // Anything else (429, 5xx) is transient and the row is kept.
      const status = err?.statusCode;
      if (status === 404 || status === 410) {
        await admin.from('push_subscriptions').delete().eq('id', s.id);
        removed++;
      } else {
        failed++;
        console.error(`push send failed (${status ?? 'no status'}):`, err?.message || err);
      }
    }
  }

  return { sent, removed, failed };
}
