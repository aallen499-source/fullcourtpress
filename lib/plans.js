// Single source of truth for pricing.
//
// This config used to be duplicated by hand in app/app/page.jsx (the in-app
// Plans tab) and in public/full-court-press-app.html (the landing page), and
// they drifted — the landing copy still advertised "All 7 email templates"
// long after there were 10. Adding a /pricing page would have made a third
// copy, so it lives here instead.

// Stripe hosts checkout, so card details never touch this site.
export const STRIPE_LINKS = {
  annual: 'https://buy.stripe.com/dRm8wP7picbTdGy5ke0Fi02',
  monthly: '', // not created yet — the monthly option stays hidden until it is
  season: 'https://buy.stripe.com/cNi7sLgZSa3LcCucMG0Fi03',
  team: 'https://buy.stripe.com/dRmbJ14d6gs9byq6oi0Fi06',
};

// The free-tier numbers here are copy. What actually enforces them is the
// insert policies in supabase/21-enforce-free-limits.sql — change both.
export const PLANS = [
  {
    id: 'free', name: 'Free', price: '$0', cadence: 'forever',
    blurb: 'Everything you need to get started and stay organized.',
    features: ['Up to 10 coaches on your roster', 'Up to 2 film links', 'All 10 email templates', 'One shareable profile link'],
  },
  {
    id: 'annual', name: 'Athlete', price: '$79', cadence: 'per year', highlight: true,
    blurb: 'Less than one camp registration. Cancel anytime.',
    features: ['Every verified camp — 64 and growing', 'Unlimited coaches and film', 'Unlimited film + single-clip links', 'Spreadsheet import', 'Camp database kept current each season'],
  },
  {
    id: 'season', name: 'Season Pass', price: '$39', cadence: '4 months',
    blurb: 'For camp season only. Does not auto-renew.',
    features: ['Everything in Athlete', 'Expires on its own — nothing to cancel'],
  },
  {
    id: 'team', name: 'Team / Club', price: '$360', cadence: 'per season',
    blurb: 'Up to 12 athletes on one roster. About $30 each.',
    features: ['Everything in Athlete, for every athlete', 'One invoice for the program', 'Coach/director overview'],
  },
];
