import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase-admin';

// Stripe requires the raw request body for signature verification, so this
// route must not run through any body-parsing middleware.
export const runtime = 'nodejs';

// Constructed lazily inside the handler, not at module load — instantiating
// with an unset key throws immediately, which breaks `next build` since it
// evaluates route modules to collect page data even before any request
// actually arrives.
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

async function findUserIdByEmail(supabaseAdmin, email) {
  if (!email) return null;
  // Match on login_email, not the editable "email" field — that one is a
  // customizable outreach contact address on My Info and can differ from
  // the real account email Stripe checkout was completed with.
  const { data } = await supabaseAdmin.from('profiles').select('id').eq('login_email', email).maybeSingle();
  return data?.id || null;
}

async function upsertSubscription(supabaseAdmin, { userId, plan, status, currentPeriodEnd, stripeCustomerId }) {
  if (!userId) return;
  await supabaseAdmin.from('subscriptions').upsert(
    {
      user_id: userId,
      plan,
      status,
      current_period_end: currentPeriodEnd,
      stripe_customer_id: stripeCustomerId,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  );
}

export async function POST(request) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  let stripe;
  let event;
  try {
    stripe = getStripe();
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return new Response(`Webhook signature verification failed: ${err.message}`, { status: 400 });
  }

  try {
    // Inside the try/catch on purpose — if a required env var is missing,
    // this throws synchronously, and it was previously uncaught here,
    // crashing every single event uniformly before any handler logic ran.
    const supabaseAdmin = createAdminClient();

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        // Re-fetch with line_items expanded — the webhook payload alone
        // doesn't include them.
        const full = await stripe.checkout.sessions.retrieve(session.id, {
          expand: ['line_items.data.price.product'],
        });
        const email = full.customer_details?.email || full.customer_email;
        const userId = await findUserIdByEmail(supabaseAdmin, email);
        const planName = full.line_items?.data?.[0]?.price?.product?.name || 'Paid';

        let currentPeriodEnd = null;
        if (full.mode === 'subscription' && full.subscription) {
          const sub = await stripe.subscriptions.retrieve(full.subscription);
          currentPeriodEnd = new Date(sub.current_period_end * 1000).toISOString();
        }

        await upsertSubscription(supabaseAdmin, {
          userId,
          plan: planName,
          status: 'active',
          currentPeriodEnd,
          stripeCustomerId: full.customer,
        });
        break;
      }

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        const customer = await stripe.customers.retrieve(sub.customer);
        const email = customer.email;
        const userId = await findUserIdByEmail(supabaseAdmin, email);
        const planName = sub.items?.data?.[0]?.price?.nickname || undefined;

        await upsertSubscription(supabaseAdmin, {
          userId,
          plan: planName,
          status: event.type === 'customer.subscription.deleted' ? 'canceled' : sub.status,
          currentPeriodEnd: new Date(sub.current_period_end * 1000).toISOString(),
          stripeCustomerId: sub.customer,
        });
        break;
      }

      default:
        // Ignore anything else — we only care about payment/subscription state.
        break;
    }
  } catch (err) {
    // Log-and-500 so Stripe retries, rather than silently losing the event.
    // The message is echoed in the response body too, since Stripe's own
    // dashboard shows that directly — faster to read than digging through
    // Vercel's function logs.
    console.error('Stripe webhook handler error:', err);
    return new Response(`Webhook handler error: ${err.message}`, { status: 500 });
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
