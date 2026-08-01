import Stripe from 'stripe';
import { createClient } from '@/lib/supabase-server';
import { createAdminClient } from '@/lib/supabase-admin';
import { NextResponse } from 'next/server';

// Constructed lazily — see app/api/stripe-webhook/route.js for why (an
// unset key at module load would break `next build`).
function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY);
}

// Lets a paying athlete manage or cancel their own subscription through
// Stripe's hosted portal — card details and cancellation both stay on
// Stripe's side, we never handle either directly.
export async function POST(request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: subscription } = await admin
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .maybeSingle();

  if (!subscription?.stripe_customer_id) {
    return NextResponse.json(
      { error: "No billing account on file yet — this shows up after your first payment." },
      { status: 400 }
    );
  }

  try {
    const stripe = getStripe();
    const { origin } = new URL(request.url);
    const session = await stripe.billingPortal.sessions.create({
      customer: subscription.stripe_customer_id,
      return_url: `${origin}/app`,
    });
    return NextResponse.json({ url: session.url });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
