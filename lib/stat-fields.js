// Per-sport season stats for the athlete profile.
//
// Every email template promises "Film and stats: {{profile_link}}", and until
// now the profile behind that link showed position, height and GPA — no stats
// at all. Same broken promise the templates themselves used to make.
//
// Two rules shape this file, both learned the hard way on this product:
//
//   - Keep each list SHORT. Six fields, never more. The original My Info page
//     met new users with a wall of blanks and they left; a stat sheet with
//     twenty rows would do it again. Six is enough to look like a real player
//     and short enough to finish in a sitting.
//   - Everything is optional. A profile with two stats filled renders two
//     stats. Nothing is ever shown as empty, dashed or zero, because a zero a
//     coach reads as real is worse than a blank.
//
// `sport` on profiles is a free-text input, not a dropdown, so it arrives as
// "Basketball", "basketball", "Boys Basketball", "Girls' Volleyball" and worse.
// sportKey() normalises loosely and falls back to null, which renders the plain
// free-text key_stats box instead of guessing at a schema.

export const STAT_FIELDS = {
  basketball: [
    { key: 'ppg', label: 'PPG', placeholder: '14.2' },
    { key: 'rpg', label: 'RPG', placeholder: '6.1' },
    { key: 'apg', label: 'APG', placeholder: '4.8' },
    { key: 'spg', label: 'SPG', placeholder: '2.0' },
    { key: 'fg', label: 'FG', pct: true, placeholder: '48' },
    { key: 'tp', label: '3PT', pct: true, placeholder: '37' },
  ],
  baseball: [
    { key: 'avg', label: 'AVG', placeholder: '.342' },
    { key: 'obp', label: 'OBP', placeholder: '.410' },
    { key: 'hr', label: 'HR', placeholder: '6' },
    { key: 'rbi', label: 'RBI', placeholder: '28' },
    { key: 'sb', label: 'SB', placeholder: '12' },
    { key: 'era', label: 'ERA', placeholder: '2.85' },
  ],
  softball: [
    { key: 'avg', label: 'AVG', placeholder: '.371' },
    { key: 'obp', label: 'OBP', placeholder: '.445' },
    { key: 'hr', label: 'HR', placeholder: '4' },
    { key: 'rbi', label: 'RBI', placeholder: '31' },
    { key: 'sb', label: 'SB', placeholder: '15' },
    { key: 'era', label: 'ERA', placeholder: '1.92' },
  ],
  soccer: [
    { key: 'goals', label: 'goals', placeholder: '11' },
    { key: 'assists', label: 'assists', placeholder: '7' },
    { key: 'shutouts', label: 'shutouts', placeholder: '5' },
    { key: 'saves', label: 'saves', placeholder: '64' },
    { key: 'minutes', label: 'minutes', placeholder: '1,420' },
  ],
  volleyball: [
    { key: 'kps', label: 'kills/set', placeholder: '3.4' },
    { key: 'hitpct', label: 'hitting', pct: true, placeholder: '31' },
    { key: 'aces', label: 'aces', placeholder: '42' },
    { key: 'dps', label: 'digs/set', placeholder: '2.8' },
    { key: 'blocks', label: 'blocks', placeholder: '58' },
    { key: 'aps', label: 'assists/set', placeholder: '9.1' },
  ],
  football: [
    { key: 'passyds', label: 'pass yds', placeholder: '2,140' },
    { key: 'rushyds', label: 'rush yds', placeholder: '860' },
    { key: 'recyds', label: 'rec yds', placeholder: '710' },
    { key: 'tds', label: 'TDs', placeholder: '18' },
    { key: 'tackles', label: 'tackles', placeholder: '74' },
    { key: 'ints', label: 'INTs', placeholder: '4' },
  ],
  tennis: [
    { key: 'singles', label: 'singles', placeholder: '18-3' },
    { key: 'doubles', label: 'doubles', placeholder: '14-5' },
    { key: 'utr', label: 'UTR', placeholder: '9.2' },
    { key: 'ranking', label: 'state rank', placeholder: '#14' },
  ],
  // Track and field is event-shaped rather than average-shaped: a coach wants
  // the event and the mark, not a season rate.
  track: [
    { key: 'event1', label: '', placeholder: '400m' },
    { key: 'mark1', label: '', placeholder: '49.31' },
    { key: 'event2', label: '', placeholder: 'Long jump' },
    { key: 'mark2', label: '', placeholder: "22' 4\"" },
  ],
};

export const TRACK_PAIRS = [['event1', 'mark1'], ['event2', 'mark2']];

export function sportKey(sport) {
  const s = String(sport || '').toLowerCase();
  if (!s) return null;
  if (s.includes('basketball')) return 'basketball';
  if (s.includes('softball')) return 'softball';           // before baseball
  if (s.includes('baseball')) return 'baseball';
  if (s.includes('volleyball')) return 'volleyball';
  if (s.includes('soccer') || s.includes('football') === false && s.includes('futbol')) return 'soccer';
  if (s.includes('football')) return 'football';
  if (s.includes('tennis')) return 'tennis';
  if (s.includes('track') || s.includes('field') || s.includes('cross country')) return 'track';
  return null;
}

export function fieldsForSport(sport) {
  const k = sportKey(sport);
  return k ? STAT_FIELDS[k] : null;
}

// "14.2 PPG · 6.1 RPG · 48% FG" — only what is filled in, in the order above.
// Track reads as "400m 49.31 · Long jump 22' 4"" instead, pairing event to mark
// and dropping a pair unless both halves are present.
export function statLine(sport, stats) {
  const k = sportKey(sport);
  const v = stats || {};
  const val = (x) => String(v[x] ?? '').trim();
  if (!k) return '';
  if (k === 'track') {
    return TRACK_PAIRS
      .map(([e, m]) => (val(e) && val(m) ? `${val(e)} ${val(m)}` : ''))
      .filter(Boolean)
      .join(' · ');
  }
  return STAT_FIELDS[k]
    .map((f) => {
      const x = val(f.key);
      if (!x) return '';
      return f.pct ? `${x}% ${f.label}` : `${x} ${f.label}`;
    })
    .filter(Boolean)
    .join(' · ');
}
