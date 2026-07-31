'use client';

import { createClient } from '@/lib/supabase-browser';

// Athletes using the browser-only version have everything in localStorage under
// this key. Without this migration they sign into their new account and find it
// empty — which feels like data loss even though nothing was lost.
const LEGACY_KEY = 'recruiting-hq-data';

export function hasLegacyData() {
  try {
    const raw = localStorage.getItem(LEGACY_KEY);
    if (!raw) return false;
    const d = JSON.parse(raw);
    return Boolean(
      (d.coaches && d.coaches.length) ||
      (d.camps && d.camps.length) ||
      (d.film && d.film.length)
    );
  } catch {
    return false;
  }
}

export function legacySummary() {
  try {
    const d = JSON.parse(localStorage.getItem(LEGACY_KEY) || '{}');
    return {
      coaches: (d.coaches || []).length,
      camps: (d.camps || []).length,
      film: (d.film || []).length,
      templates: (d.templates || []).length
    };
  } catch {
    return { coaches: 0, camps: 0, film: 0, templates: 0 };
  }
}

export async function migrateLocalData(userId) {
  const supabase = createClient();
  const raw = localStorage.getItem(LEGACY_KEY);
  if (!raw) return { migrated: false };

  const d = JSON.parse(raw);
  const results = {};

  if (d.settings) {
    const s = d.settings;
    const { error } = await supabase.from('profiles').upsert({
      id: userId,
      name: s.name,
      sport: s.sport,
      grad_year: s.gradYear,
      school: s.school,
      bio: s.bio,
      signature: s.signature,
      position: s.position,
      height: s.height,
      gpa: s.gpa,
      ncaa_id: s.ncaaId,
      show_ncaa_publicly: s.showNcaaPublicly || false
    }, { onConflict: 'id' });
    if (error) throw error;
  }

  if (d.coaches?.length) {
    const { error } = await supabase.from('coaches').insert(
      d.coaches.map(c => ({
        user_id: userId,
        name: c.name,
        school: c.school,
        sport: c.sport,
        level: c.level,
        email: c.email,
        status: c.status || 'not_contacted',
        notes: c.notes
      }))
    );
    if (error) throw error;
    results.coaches = d.coaches.length;
  }

  if (d.film?.length) {
    const { error } = await supabase.from('film').insert(
      d.film.map(f => ({
        user_id: userId,
        title: f.title,
        url: f.url,
        sport: f.sport,
        description: f.desc
      }))
    );
    if (error) throw error;
    results.film = d.film.length;
  }

  if (d.templates?.length) {
    const { error } = await supabase.from('templates').insert(
      d.templates.map(t => ({
        user_id: userId,
        name: t.name,
        subject: t.subject,
        body: t.body
      }))
    );
    if (error) throw error;
    results.templates = d.templates.length;
  }

  if (d.camps?.length) {
    const { error } = await supabase.from('user_camps').insert(
      d.camps.map(c => ({
        user_id: userId,
        name: c.name,
        type: c.type,
        status: c.status || 'considering',
        location: c.location,
        dates: c.dates,
        url: c.url,
        notes: c.notes
      }))
    );
    if (error) throw error;
    results.camps = d.camps.length;
  }

  // Only clear the old data once every insert above succeeded. If anything threw,
  // the original is still sitting there and the athlete can retry.
  localStorage.removeItem(LEGACY_KEY);

  return { migrated: true, ...results };
}
