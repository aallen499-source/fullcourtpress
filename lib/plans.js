// Single source of truth for pricing.
//
// This config used to be duplicated by hand in app/app/page.jsx (the in-app
// Plans tab) and in public/recruitgrid-app.html (the landing page), and
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
// insert policies in supabase/21-enforce-free-limits.sql and
// supabase/22-free-unlimited-film-links.sql — change both.
export const PLANS = [
  {
    id: 'free', name: 'Free', price: '$0', cadence: 'forever',
    blurb: 'Everything you need to get started and stay organized.',
    features: ['Unlimited YouTube & Hudl film links', 'Up to 10 coaches on your roster', 'All 10 email templates', 'One shareable profile link', '2 uploaded videos'],
  },
  {
    id: 'annual', name: 'Athlete', price: '$79', cadence: 'per year', highlight: true,
    blurb: 'Less than one camp registration. Cancel anytime.',
    features: ['Every verified camp — boys and girls', 'Unlimited coaches', 'Unlimited video uploads', 'Shareable single-clip links', 'Spreadsheet import'],
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

// Feature-by-feature grid for the pricing page. Deliberately compares our own
// plans and nothing else: naming a competitor's price on a commercial page is
// a claim we'd have to keep accurate and be able to defend, and it goes stale
// the moment they change it.
//
// "Email coaches" is phrased as *drafts* on purpose. The app opens a
// pre-filled message in the athlete's own mail client — it never sends on
// their behalf. Saying "message coaches" would contradict the disclosure on
// the landing page and overstate what this does.
export const COMPARISON = {
  columns: ['Free', 'Athlete', 'Season Pass', 'Team / Club'],
  rows: [
    ['Coach roster', '10 coaches', 'Unlimited', 'Unlimited', 'Unlimited'],
    ['Email templates + drafts', 'All 10', 'All 10', 'All 10', 'All 10'],
    ['YouTube / Hudl film links', 'Unlimited', 'Unlimited', 'Unlimited', 'Unlimited'],
    ['Uploaded video', '2', 'Unlimited', 'Unlimited', 'Unlimited'],
    ['Public recruiting profile', 'Yes', 'Yes', 'Yes', 'Yes'],
    ['College finder (1,577+ programs)', 'Yes', 'Yes', 'Yes', 'Yes'],
    ['Verified camp list', '—', 'Yes', 'Yes', 'Yes'],
    ['Shareable single-clip links', '—', 'Yes', 'Yes', 'Yes'],
    ['Spreadsheet import', '—', 'Yes', 'Yes', 'Yes'],
    ['Athletes covered', '1', '1', '1', 'Up to 12'],
    ['Auto-renews', 'n/a', 'Yes', 'No', 'No'],
  ],
};
