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

// Newer Stripe API versions moved current_period_end off the subscription
// object itself and onto each subscription item (to support multi-item
// subscriptions with different billing cycles). Check both shapes so this
// doesn't crash — new Date(undefined).toISOString() throws "Invalid time
// value", which was failing every single webhook delivery.
function subscriptionPeriodEndISO(sub) {
  const periodEnd = sub?.current_period_end ?? sub?.items?.data?.[0]?.current_period_end;
  return periodEnd ? new Date(periodEnd * 1000).toISOString() : null;
}

// Season Pass and Team/Club are one-time charges, not Stripe subscriptions —
// "does not auto-renew" means there's no recurring billing object for Stripe
// to give us a period end from. Both are 4-month access windows by design,
// so compute the expiration ourselves from the moment checkout completed.
const FIXED_DURATION_PLANS = [
  { match: 'season', months: 4 },
  { match: 'team', months: 4 },
];

function fixedDurationEndISO(planName, checkoutCompletedAt) {
  const lower = (planName || '').toLowerCase();
  const plan = FIXED_DURATION_PLANS.find((p) => lower.includes(p.match));
  if (!plan) return null;
  const end = new Date(checkoutCompletedAt * 1000);
  end.setMonth(end.getMonth() + plan.months);
  return end.toISOString();
}

async function findUserIdByEmail(supabaseAdmin, email) {
  // Both failure modes here were silent before: a query error and a genuine
  // "nobody has this email" miss both just returned null, so the caller's
  // upsertSubscription would quietly no-op — the webhook reported success
  // to Stripe while writing nothing. Throwing surfaces the real reason
  // directly in Stripe's dashboard response instead.
  if (!email) throw new Error('Stripe event had no email attached to it');
  // Match on login_email, not the editable "email" field — that one is a
  // customizable outreach contact address on My Info and can differ from
  // the real account email Stripe checkout was completed with.
  const { data, error } = await supabaseAdmin.from('profiles').select('id').eq('login_email', email).maybeSingle();
  if (error) throw new Error(`Looking up account for ${email} failed: ${error.message}`);
  if (!data) throw new Error(`No Full Court Press account found with login_email = ${email}`);
  return data.id;
}

async function upsertSubscription(supabaseAdmin, { userId, plan, status, currentPeriodEnd, stripeCustomerId }) {
  const { error } = await supabaseAdmin.from('subscriptions').upsert(
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
  if (error) throw new Error(`Saving subscription for user ${userId} failed: ${error.message}`);
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
          currentPeriodEnd = subscriptionPeriodEndISO(sub);
        } else {
          currentPeriodEnd = fixedDurationEndISO(planName, full.created);
        }

        await upsertSubscription(supabaseAdmin, {
          userId,
          plan: planName,
          status: 'active',
          currentPeriodEnd,
          stripeCustomerId: full.customer,
        });

        // Buying the Team/Club plan means you're the one running a roster
        // of athletes, not an athlete yourself — label the account
        // accordingly so My Info shows the coach view instead of asking.
        const lowerPlan = planName.toLowerCase();
        if (userId && (lowerPlan.includes('team') || lowerPlan.includes('club'))) {
          await supabaseAdmin.from('profiles').update({ role: 'coach' }).eq('id', userId);
        }
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
          currentPeriodEnd: subscriptionPeriodEndISO(sub),
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
