// Showcases: camps run by an events company or platform rather than by one
// college, where several programs send a coach to watch.
//
// They were left out of camp collection for a while, on the reasoning that a
// catalogue sold as verified should not carry pay-to-play exposure events. That
// also hid the good ones — and D2, NAIA, D3 and JUCO programs genuinely use
// showcases, because they cannot afford to travel to see players one at a time.
//
// The rule that replaced the blanket ban: a showcase is listed only when its own
// page names the programs attending, and those names are stored on the row.
// "College coaches invited" is not a list of programs. A showcase row without
// named programs stays in the table but is not shown anywhere, so filling the
// names in later is all it takes to bring one back.

export const SHOWCASE_TYPE = 'Open Exposure / Showcase';

export const isShowcase = (c) => (c?.type || '') === SHOWCASE_TYPE;

export const namedPrograms = (c) =>
  Array.isArray(c?.attending_programs) ? c.attending_programs.map((p) => String(p || '').trim()).filter(Boolean) : [];

/** Whether a camp row may be shown to anyone. Every non-showcase camp is. */
export const isListable = (c) => !isShowcase(c) || namedPrograms(c).length > 0;
