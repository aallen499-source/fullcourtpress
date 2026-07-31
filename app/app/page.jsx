'use client';

import { useEffect, useState } from 'react';
import * as tus from 'tus-js-client';
import { createClient } from '@/lib/supabase-browser';
import { hasLegacyData, legacySummary, migrateLocalData } from '@/lib/migrate-local-data';
import { DEFAULT_TEMPLATES, fillMergeTags } from '@/lib/default-templates';
import { D1_SCHOOLS, D2_CONFERENCES, D3_JUCO_SCHOOLS } from '@/lib/college-data';
import { SEED_CAMPS } from '@/lib/camps-data';

const TABS = [
  { id: 'roster', label: 'Coach Roster' },
  { id: 'film', label: 'Film Locker' },
  { id: 'templates', label: 'Email Templates' },
  { id: 'college', label: 'College Finder' },
  { id: 'camps', label: 'Camps' },
  { id: 'myinfo', label: 'My Info' },
];

const STATUS_OPTIONS = ['not_contacted', 'contacted', 'followup', 'responded', 'committed'];
const STATUS_LABELS = {
  not_contacted: 'Not contacted',
  contacted: 'Contacted',
  followup: 'Follow-up',
  responded: 'Responded',
  committed: 'Committed',
};
const LEVEL_OPTIONS = ['D1', 'D2', 'D3', 'NAIA', 'JUCO', 'Club/Other'];
const CAMP_STATUS_OPTIONS = ['considering', 'registered', 'attended'];
const CAMP_TYPE_OPTIONS = [
  'Open Exposure / Showcase',
  'College Team Camp',
  'Elite / Invite-Only',
  'Skills / Training Camp',
  'Other',
];

const emptyCoachForm = { name: '', school: '', sport: '', level: 'D1', email: '', status: 'not_contacted', notes: '' };
const emptyFilmForm = { title: '', url: '', sport: '', description: '' };
const emptyTemplateForm = { name: '', subject: '', body: '' };
const emptyCampForm = {
  name: '',
  type: 'Open Exposure / Showcase',
  status: 'considering',
  location: '',
  dates: '',
  url: '',
  notes: '',
};

function initials(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getEmbedUrl(url) {
  try {
    const u = new URL(url);
    const host = u.hostname.replace(/^www\./, '');
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const id = u.searchParams.get('v');
      if (id) return 'https://www.youtube.com/embed/' + id;
      if (u.pathname.startsWith('/embed/')) return url;
      if (u.pathname.startsWith('/shorts/')) return 'https://www.youtube.com/embed/' + u.pathname.split('/')[2];
    }
    if (host === 'youtu.be') {
      const id = u.pathname.slice(1);
      if (id) return 'https://www.youtube.com/embed/' + id;
    }
    if (host === 'vimeo.com') {
      const id = u.pathname.split('/').filter(Boolean)[0];
      if (id && /^\d+$/.test(id)) return 'https://player.vimeo.com/video/' + id;
    }
  } catch {
    // not a valid URL
  }
  return null;
}

function isUploadedVideoUrl(url) {
  return typeof url === 'string' && url.includes('/storage/v1/object/public/film/');
}

// Supabase Storage rejects keys with spaces and other special characters
// (e.g. macOS's default screenshot names like "Image 7-30-26 at 11.27 PM.png"),
// so strip anything that isn't alphanumeric, a dot, dash, or underscore.
function sanitizeFileName(name) {
  return name.replace(/[^a-zA-Z0-9.\-_]/g, '_');
}

// Resumable upload via the TUS protocol — needed for full-game footage in
// the multiple-GB range, where a single-request upload is too fragile (one
// dropped connection restarts the whole transfer from zero). Supabase
// requires an exact 6MB chunk size for this endpoint.
function uploadResumable({ bucket, path, file, accessToken, onProgress }) {
  return new Promise((resolve, reject) => {
    const upload = new tus.Upload(file, {
      endpoint: `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/upload/resumable`,
      retryDelays: [0, 3000, 5000, 10000, 20000],
      headers: { authorization: `Bearer ${accessToken}` },
      uploadDataDuringCreation: true,
      removeFingerprintOnSuccess: true,
      metadata: {
        bucketName: bucket,
        objectName: path,
        contentType: file.type || 'application/octet-stream',
        cacheControl: '3600',
      },
      chunkSize: 6 * 1024 * 1024,
      onError: reject,
      onProgress: (bytesSent, bytesTotal) => onProgress?.(bytesSent / bytesTotal),
      onSuccess: () => resolve(),
    });

    upload.findPreviousUploads().then((previousUploads) => {
      if (previousUploads.length) upload.resumeFromPreviousUpload(previousUploads[0]);
      upload.start();
    });
  });
}

export default function AppHome() {
  const supabase = createClient();

  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('roster');

  const [showMigrate, setShowMigrate] = useState(false);
  const [migrating, setMigrating] = useState(false);
  const [migrateMsg, setMigrateMsg] = useState('');

  // Roster
  const [coaches, setCoaches] = useState([]);
  const [coachModalOpen, setCoachModalOpen] = useState(false);
  const [editingCoachId, setEditingCoachId] = useState(null);
  const [coachForm, setCoachForm] = useState(emptyCoachForm);

  // Compose (shared by Roster)
  const [composeOpen, setComposeOpen] = useState(false);
  const [composeCoach, setComposeCoach] = useState(null);
  const [composeTemplateId, setComposeTemplateId] = useState(null);
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');

  // Film
  const [film, setFilm] = useState([]);
  const [filmModalOpen, setFilmModalOpen] = useState(false);
  const [editingFilmId, setEditingFilmId] = useState(null);
  const [filmForm, setFilmForm] = useState(emptyFilmForm);
  const [filmUploadStatus, setFilmUploadStatus] = useState('');

  // Templates
  const [templates, setTemplates] = useState([]);
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [editingTemplateId, setEditingTemplateId] = useState(null);
  const [templateForm, setTemplateForm] = useState(emptyTemplateForm);
  const [openTemplateId, setOpenTemplateId] = useState(null);

  // College Finder
  const [collegeSearch, setCollegeSearch] = useState('');
  const [collegeDivision, setCollegeDivision] = useState('D1');

  // Camps
  const [camps, setCamps] = useState([]);
  const [campModalOpen, setCampModalOpen] = useState(false);
  const [editingCampId, setEditingCampId] = useState(null);
  const [campForm, setCampForm] = useState(emptyCampForm);
  const [campSearch, setCampSearch] = useState('');
  const [campStatusFilter, setCampStatusFilter] = useState('');
  const [campTypeFilter, setCampTypeFilter] = useState('');

  // My Info
  const [infoForm, setInfoForm] = useState({
    name: '', sport: '', gradYear: '', email: '', school: '',
    position: '', height: '', gpa: '', ncaaId: '', showNcaaPublicly: false, bio: '',
  });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarStatus, setAvatarStatus] = useState('');
  const [publishSlug, setPublishSlug] = useState('');
  const [publishError, setPublishError] = useState('');
  const [published, setPublished] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: { user: authedUser } } = await supabase.auth.getUser();
      setUser(authedUser);
      if (!authedUser) {
        setLoading(false);
        return;
      }
      if (hasLegacyData()) setShowMigrate(true);

      const [profileRes, coachesRes, filmRes, templatesRes, campsRes, subRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', authedUser.id).single(),
        supabase.from('coaches').select('*').eq('user_id', authedUser.id).order('created_at', { ascending: false }),
        supabase.from('film').select('*').eq('user_id', authedUser.id).order('created_at', { ascending: false }),
        supabase.from('templates').select('*').eq('user_id', authedUser.id).order('created_at', { ascending: true }),
        supabase.from('user_camps').select('*').eq('user_id', authedUser.id).order('created_at', { ascending: true }),
        supabase.from('subscriptions').select('*').eq('user_id', authedUser.id).maybeSingle(),
      ]);
      setSubscription(subRes.data || null);

      const p = profileRes.data || null;
      setProfile(p);
      setCoaches(coachesRes.data || []);
      setFilm(filmRes.data || []);

      let tpls = templatesRes.data || [];
      if (tpls.length === 0) {
        const seedRows = DEFAULT_TEMPLATES.map((t) => ({
          user_id: authedUser.id,
          name: t.name,
          subject: t.subject,
          body: t.body,
        }));
        const { data: inserted } = await supabase.from('templates').insert(seedRows).select();
        tpls = inserted || [];
      }
      setTemplates(tpls);
      if (tpls.length) setComposeTemplateId(tpls[0].id);

      let campRows = campsRes.data || [];
      if (campRows.length === 0) {
        const seedCampRows = SEED_CAMPS.map((c) => ({
          user_id: authedUser.id,
          name: c.name,
          type: c.type,
          status: c.status,
          location: c.location,
          dates: c.dates,
          url: c.url,
          notes: c.notes,
        }));
        const { data: insertedCamps } = await supabase.from('user_camps').insert(seedCampRows).select();
        campRows = insertedCamps || [];
      }
      setCamps(campRows);

      setInfoForm({
        name: p?.name || '',
        sport: p?.sport || '',
        gradYear: p?.grad_year || '',
        email: p?.email || authedUser.email || '',
        school: p?.school || '',
        position: p?.position || '',
        height: p?.height || '',
        gpa: p?.gpa || '',
        ncaaId: p?.ncaa_id || '',
        showNcaaPublicly: !!p?.show_ncaa_publicly,
        bio: p?.bio || '',
      });
      setAvatarUrl(p?.avatar_url || '');
      setPublishSlug(p?.public_slug || slugify(p?.name || ''));
      setPublished(!!p?.public_published);

      setLoading(false);
    }
    load();
  }, []);

  async function runMigration() {
    setMigrating(true);
    setMigrateMsg('');
    try {
      const r = await migrateLocalData(user.id);
      const parts = [];
      if (r.coaches) parts.push(`${r.coaches} coaches`);
      if (r.camps) parts.push(`${r.camps} camps`);
      if (r.film) parts.push(`${r.film} film links`);
      if (r.templates) parts.push(`${r.templates} templates`);
      setMigrateMsg(`Moved over ${parts.join(', ') || 'your settings'}.`);
      setShowMigrate(false);
      const [{ data: coachRows }, { data: filmRows }] = await Promise.all([
        supabase.from('coaches').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
        supabase.from('film').select('*').eq('user_id', user.id).order('created_at', { ascending: false }),
      ]);
      setCoaches(coachRows || []);
      setFilm(filmRows || []);
    } catch (e) {
      setMigrateMsg(`Couldn't move your data: ${e.message}. Nothing was deleted — try again.`);
    }
    setMigrating(false);
  }

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  // ---------- ROSTER ----------
  function openAddCoach() {
    setEditingCoachId(null);
    setCoachForm(emptyCoachForm);
    setCoachModalOpen(true);
  }

  function openEditCoach(c) {
    setEditingCoachId(c.id);
    setCoachForm({
      name: c.name || '',
      school: c.school || '',
      sport: c.sport || '',
      level: c.level || 'D1',
      email: c.email || '',
      status: c.status || 'not_contacted',
      notes: c.notes || '',
    });
    setCoachModalOpen(true);
  }

  async function saveCoach(e) {
    e.preventDefault();
    if (!coachForm.name.trim()) {
      alert('Coach name is required.');
      return;
    }
    if (editingCoachId) {
      const { data: updated, error } = await supabase
        .from('coaches')
        .update({ ...coachForm, updated_at: new Date().toISOString() })
        .eq('id', editingCoachId)
        .select()
        .single();
      if (!error) setCoaches((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      const { data: inserted, error } = await supabase
        .from('coaches')
        .insert({ ...coachForm, user_id: user.id })
        .select()
        .single();
      if (!error) setCoaches((cs) => [inserted, ...cs]);
    }
    setCoachModalOpen(false);
  }

  async function deleteCoach(id) {
    if (!confirm('Remove this coach from your roster?')) return;
    await supabase.from('coaches').delete().eq('id', id);
    setCoaches((cs) => cs.filter((c) => c.id !== id));
  }

  async function updateStatus(id, status) {
    setCoaches((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));
    await supabase.from('coaches').update({ status }).eq('id', id);
  }

  function quickAddCoachFromCollege(name) {
    setEditingCoachId(null);
    setCoachForm({ ...emptyCoachForm, name: '', school: name });
    setCoachModalOpen(true);
  }

  // ---------- COMPOSE ----------
  function templateById(id) {
    return templates.find((t) => t.id === id) || templates[0];
  }

  function openCompose(c) {
    setComposeCoach(c);
    const t = templateById(composeTemplateId) || templates[0];
    if (t) {
      setComposeTemplateId(t.id);
      setComposeSubject(fillMergeTags(t.subject, c, profileForTags()));
      setComposeBody(fillMergeTags(t.body, c, profileForTags()));
    }
    setComposeOpen(true);
  }

  function profileForTags() {
    return {
      name: infoForm.name,
      sport: infoForm.sport,
      grad_year: infoForm.gradYear,
      school: infoForm.school,
      position: infoForm.position,
      height: infoForm.height,
      gpa: infoForm.gpa,
      ncaa_id: infoForm.ncaaId,
    };
  }

  function onComposeTemplateChange(id) {
    setComposeTemplateId(id);
    const t = templates.find((x) => x.id === id);
    if (!t) return;
    setComposeSubject(fillMergeTags(t.subject, composeCoach, profileForTags()));
    setComposeBody(fillMergeTags(t.body, composeCoach, profileForTags()));
  }

  function sendCompose() {
    const to = composeCoach?.email;
    if (!to) {
      alert("This coach doesn't have an email on file yet — add one from the roster, or use Copy Text to paste it in manually.");
      return;
    }
    window.location.href = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(composeSubject)}&body=${encodeURIComponent(composeBody)}`;
    setComposeOpen(false);
  }

  function copyCompose() {
    const text = `Subject: ${composeSubject}\n\n${composeBody}`;
    navigator.clipboard
      .writeText(text)
      .then(() => {
        alert('Copied — paste it into your email app.');
        setComposeOpen(false);
      })
      .catch(() => alert('Could not copy automatically — select the text manually.'));
  }

  // ---------- FILM ----------
  function openAddFilm() {
    setEditingFilmId(null);
    setFilmForm(emptyFilmForm);
    setFilmUploadStatus('');
    setFilmModalOpen(true);
  }

  function openEditFilm(f) {
    setEditingFilmId(f.id);
    setFilmForm({ title: f.title || '', url: f.url || '', sport: f.sport || '', description: f.description || '' });
    setFilmUploadStatus('');
    setFilmModalOpen(true);
  }

  async function saveFilm(e) {
    e.preventDefault();
    if (!filmForm.title.trim() || !filmForm.url.trim()) {
      alert('Title and link are required.');
      return;
    }
    if (editingFilmId) {
      const { data: updated, error } = await supabase
        .from('film')
        .update(filmForm)
        .eq('id', editingFilmId)
        .select()
        .single();
      if (!error) setFilm((fs) => fs.map((f) => (f.id === updated.id ? updated : f)));
    } else {
      const { data: inserted, error } = await supabase
        .from('film')
        .insert({ ...filmForm, user_id: user.id })
        .select()
        .single();
      if (!error) setFilm((fs) => [inserted, ...fs]);
    }
    setFilmModalOpen(false);
  }

  async function deleteFilm(id) {
    if (!confirm('Remove this film link?')) return;
    await supabase.from('film').delete().eq('id', id);
    setFilm((fs) => fs.filter((f) => f.id !== id));
  }

  async function uploadFilmFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_BYTES = 5 * 1024 * 1024 * 1024; // 5GB
    if (file.size > MAX_BYTES) {
      setFilmUploadStatus('That file is over 5GB — trim it down or link to it from YouTube/Hudl instead.');
      e.target.value = '';
      return;
    }
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const path = `${user.id}/${Date.now()}-${sanitizeFileName(file.name)}`;
    try {
      await uploadResumable({
        bucket: 'film',
        path,
        file,
        accessToken: session.access_token,
        onProgress: (fraction) => setFilmUploadStatus(`Uploading… ${Math.round(fraction * 100)}%`),
      });
    } catch (err) {
      setFilmUploadStatus('Upload failed: ' + err.message + ' — reselect the same file to resume from where it left off.');
      return;
    }
    const {
      data: { publicUrl },
    } = supabase.storage.from('film').getPublicUrl(path);
    setFilmForm((f) => ({ ...f, url: publicUrl, title: f.title || file.name.replace(/\.[^.]+$/, '') }));
    setFilmUploadStatus('Uploaded. Click "Save Film" below to add it to your locker.');
  }

  function filmThumb(f) {
    const embed = getEmbedUrl(f.url);
    if (embed) {
      return (
        <div className="film-embed">
          <iframe src={embed} loading="lazy" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowFullScreen />
        </div>
      );
    }
    if (isUploadedVideoUrl(f.url)) {
      return (
        <div className="film-embed">
          <video controls preload="metadata" src={f.url} />
        </div>
      );
    }
    return <div className="film-thumb">▶</div>;
  }

  // ---------- TEMPLATES ----------
  function openAddTemplate() {
    setEditingTemplateId(null);
    setTemplateForm(emptyTemplateForm);
    setTemplateModalOpen(true);
  }

  function openEditTemplate(t) {
    setEditingTemplateId(t.id);
    setTemplateForm({ name: t.name || '', subject: t.subject || '', body: t.body || '' });
    setTemplateModalOpen(true);
  }

  async function saveTemplate(e) {
    e.preventDefault();
    if (!templateForm.name.trim()) {
      alert('Template name is required.');
      return;
    }
    if (editingTemplateId) {
      const { data: updated, error } = await supabase
        .from('templates')
        .update(templateForm)
        .eq('id', editingTemplateId)
        .select()
        .single();
      if (!error) setTemplates((ts) => ts.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const { data: inserted, error } = await supabase
        .from('templates')
        .insert({ ...templateForm, user_id: user.id })
        .select()
        .single();
      if (!error) setTemplates((ts) => [...ts, inserted]);
    }
    setTemplateModalOpen(false);
  }

  async function deleteTemplate(id) {
    if (!confirm('Delete this template?')) return;
    await supabase.from('templates').delete().eq('id', id);
    setTemplates((ts) => ts.filter((t) => t.id !== id));
  }

  function insertTag(tag) {
    setTemplateForm((f) => ({ ...f, body: f.body + `{{${tag}}}` }));
  }

  // ---------- CAMPS ----------
  function openAddCamp() {
    setEditingCampId(null);
    setCampForm(emptyCampForm);
    setCampModalOpen(true);
  }

  function openEditCamp(c) {
    setEditingCampId(c.id);
    setCampForm({
      name: c.name || '',
      type: c.type || CAMP_TYPE_OPTIONS[0],
      status: c.status || 'considering',
      location: c.location || '',
      dates: c.dates || '',
      url: c.url || '',
      notes: c.notes || '',
    });
    setCampModalOpen(true);
  }

  async function saveCamp(e) {
    e.preventDefault();
    if (!campForm.name.trim()) {
      alert('Camp name is required.');
      return;
    }
    if (editingCampId) {
      const { data: updated, error } = await supabase
        .from('user_camps')
        .update(campForm)
        .eq('id', editingCampId)
        .select()
        .single();
      if (!error) setCamps((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      const { data: inserted, error } = await supabase
        .from('user_camps')
        .insert({ ...campForm, user_id: user.id })
        .select()
        .single();
      if (!error) setCamps((cs) => [inserted, ...cs]);
    }
    setCampModalOpen(false);
  }

  async function deleteCamp(id) {
    if (!confirm('Remove this camp from your list?')) return;
    await supabase.from('user_camps').delete().eq('id', id);
    setCamps((cs) => cs.filter((c) => c.id !== id));
  }

  async function updateCampStatus(id, status) {
    setCamps((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));
    await supabase.from('user_camps').update({ status }).eq('id', id);
  }

  // ---------- MY INFO ----------
  async function uploadAvatar(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const MAX_BYTES = 5 * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      setAvatarStatus('That image is over 5MB — try a smaller one.');
      e.target.value = '';
      return;
    }
    setAvatarStatus('Uploading…');
    const path = `${user.id}/${Date.now()}-${sanitizeFileName(file.name)}`;
    const { error: uploadError } = await supabase.storage.from('avatars').upload(path, file);
    if (uploadError) {
      setAvatarStatus('Upload failed: ' + uploadError.message);
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path);
    setAvatarUrl(publicUrl);
    await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
    setAvatarStatus('Photo saved.');
  }

  async function saveInfo(e) {
    e.preventDefault();
    await supabase.from('profiles').upsert(
      {
        id: user.id,
        email: infoForm.email || user.email,
        name: infoForm.name,
        sport: infoForm.sport,
        grad_year: infoForm.gradYear,
        school: infoForm.school,
        position: infoForm.position,
        height: infoForm.height,
        gpa: infoForm.gpa,
        ncaa_id: infoForm.ncaaId,
        show_ncaa_publicly: infoForm.showNcaaPublicly,
        bio: infoForm.bio,
      },
      { onConflict: 'id' }
    );
    setInfoSaved(true);
    setTimeout(() => setInfoSaved(false), 1800);
  }

  async function publishProfile() {
    setPublishError('');
    const slug = slugify(publishSlug);
    if (!slug) {
      setPublishError('Add a profile URL first (letters, numbers, and hyphens only).');
      return;
    }
    if (!infoForm.name) {
      alert("Add your name in the fields above first — it's what coaches will see at the top of the page.");
      return;
    }
    const { error } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        email: infoForm.email || user.email,
        name: infoForm.name,
        sport: infoForm.sport,
        grad_year: infoForm.gradYear,
        school: infoForm.school,
        position: infoForm.position,
        height: infoForm.height,
        gpa: infoForm.gpa,
        ncaa_id: infoForm.showNcaaPublicly ? infoForm.ncaaId : null,
        show_ncaa_publicly: infoForm.showNcaaPublicly,
        avatar_url: avatarUrl || null,
        bio: infoForm.bio,
        public_slug: slug,
        public_published: true,
      },
      { onConflict: 'id' }
    );
    if (error) {
      setPublishError(error.code === '23505' ? 'That profile URL is already taken — try a different one.' : "Couldn't publish: " + error.message);
      return;
    }
    await supabase.from('film').delete().eq('user_id', user.id);
    if (film.length) {
      await supabase.from('film').insert(
        film.map((f) => ({ user_id: user.id, title: f.title, url: f.url, sport: f.sport || '', description: f.description || '' }))
      );
      const { data: filmRows } = await supabase.from('film').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setFilm(filmRows || []);
    }
    setPublished(true);
    alert('Your profile page is live at fullcourtpress.app/' + slug + ' — copy the link and send it to a coach.');
  }

  async function unpublishProfile() {
    if (!confirm('Take your profile page down? The URL will stop working until you publish again.')) return;
    await supabase.from('profiles').update({ public_published: false }).eq('id', user.id);
    setPublished(false);
  }

  if (loading) return <main className="auth-wrap"><p>Loading…</p></main>;
  if (!user) return <main className="auth-wrap"><p>Loading…</p></main>;

  const stats = {
    total: coaches.length,
    contacted: coaches.filter((c) => ['contacted', 'followup', 'responded', 'committed'].includes(c.status)).length,
    followup: coaches.filter((c) => c.status === 'followup').length,
    responded: coaches.filter((c) => ['responded', 'committed'].includes(c.status)).length,
  };

  const collegeResults = (() => {
    const q = collegeSearch.trim().toLowerCase();
    if (collegeDivision === 'D1') {
      return D1_SCHOOLS.filter(([name, conf]) => !q || name.toLowerCase().includes(q) || conf.toLowerCase().includes(q));
    }
    if (collegeDivision === 'D2') return [];
    return D3_JUCO_SCHOOLS.filter((s) => s[1] === collegeDivision).filter(
      ([name, , , state, conf]) => !q || name.toLowerCase().includes(q) || (state || '').toLowerCase().includes(q) || (conf || '').toLowerCase().includes(q)
    );
  })();

  const campResults = camps.filter((c) => {
    const q = campSearch.trim().toLowerCase();
    const matchesQ = !q || [c.name, c.location, c.notes].some((f) => (f || '').toLowerCase().includes(q));
    const matchesStatus = !campStatusFilter || c.status === campStatusFilter;
    const matchesType = !campTypeFilter || c.type === campTypeFilter;
    return matchesQ && matchesStatus && matchesType;
  });

  return (
    <main className="app-shell">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <strong>Full Court Press</strong>
          <div className="muted small">{user.email}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span className="plan-badge">{subscription?.status === 'active' ? subscription.plan || 'Paid' : 'Free'}</span>
          <button onClick={signOut}>Sign out</button>
        </div>
      </header>

      {showMigrate &&
        (() => {
          const s = legacySummary();
          return (
            <section className="migrate-prompt">
              <h2>Bring your existing data over?</h2>
              <p>
                We found {s.coaches} coaches, {s.camps} camps, {s.film} film links and {s.templates} templates saved in
                this browser from before you had an account.
              </p>
              <button onClick={runMigration} disabled={migrating}>
                {migrating ? 'Moving…' : 'Move it into my account'}
              </button>
              <button onClick={() => setShowMigrate(false)} disabled={migrating}>
                Not now
              </button>
            </section>
          );
        })()}

      {migrateMsg && <p role="status">{migrateMsg}</p>}

      <div className="app-tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={activeTab === t.id ? 'active' : ''}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ---------- ROSTER ---------- */}
      {activeTab === 'roster' && (
        <>
          <div className="roster-stats">
            <div className="roster-stat">
              <div className="roster-stat-num">{stats.total}</div>
              <div className="roster-stat-label">Coaches</div>
            </div>
            <div className="roster-stat">
              <div className="roster-stat-num">{stats.contacted}</div>
              <div className="roster-stat-label">Contacted</div>
            </div>
            <div className="roster-stat">
              <div className="roster-stat-num">{stats.followup}</div>
              <div className="roster-stat-label">Needs follow-up</div>
            </div>
            <div className="roster-stat">
              <div className="roster-stat-num">{stats.responded}</div>
              <div className="roster-stat-label">Responded</div>
            </div>
          </div>

          <div className="panel-head">
            <h2>Coach Roster</h2>
            <button className="btn gold" onClick={openAddCoach}>
              + Add Coach
            </button>
          </div>

          {coaches.length === 0 ? (
            <div className="empty">
              <b>No coaches yet</b>
              Add the first program on your list to start tracking outreach.
            </div>
          ) : (
            <table className="roster-table">
              <thead>
                <tr>
                  <th>Coach</th>
                  <th>School</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {coaches.map((c) => (
                  <tr key={c.id}>
                    <td>
                      <div className="name-cell">
                        <div className="jersey">{initials(c.name || '?')}</div>
                        <div>
                          <div className="name-main">{c.name}</div>
                          <div className="name-sub">{c.email || ''}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      {c.school}
                      <div className="name-sub">
                        {c.sport || ''} {c.sport && c.level ? '·' : ''} {c.level || ''}
                      </div>
                    </td>
                    <td>
                      <select
                        className={`status-select status-${c.status}`}
                        value={c.status}
                        onChange={(e) => updateStatus(c.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <div className="row-actions">
                        <button className="icon-btn" title="Compose email" onClick={() => openCompose(c)}>
                          ✉
                        </button>
                        <button className="icon-btn" title="Edit" onClick={() => openEditCoach(c)}>
                          ✎
                        </button>
                        <button className="icon-btn" title="Delete" onClick={() => deleteCoach(c.id)}>
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ---------- FILM ---------- */}
      {activeTab === 'film' && (
        <>
          <div className="panel-head">
            <h2>Film Locker</h2>
            <button className="btn gold" onClick={openAddFilm}>
              + Add Film
            </button>
          </div>
          {film.length === 0 ? (
            <div className="empty">
              <b>Your locker is empty</b>
              Add a link to your highlight reel or game film, or upload a file.
            </div>
          ) : (
            <div className="film-grid">
              {film.map((f) => (
                <div className="film-card" key={f.id}>
                  {filmThumb(f)}
                  <div className="film-body">
                    <div className="film-title">{f.title}</div>
                    <div className="film-meta">{f.sport || ''}</div>
                    <div className="film-desc">{f.description || ''}</div>
                    <div className="film-foot">
                      <a className="film-link" href={f.url} target="_blank" rel="noopener noreferrer">
                        Open original ↗
                      </a>
                      <div className="row-actions">
                        <button className="icon-btn" title="Edit" onClick={() => openEditFilm(f)}>
                          ✎
                        </button>
                        <button className="icon-btn" title="Delete" onClick={() => deleteFilm(f.id)}>
                          ✕
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ---------- TEMPLATES ---------- */}
      {activeTab === 'templates' && (
        <>
          <div className="panel-head">
            <h2>Email Templates</h2>
            <button className="btn gold" onClick={openAddTemplate}>
              + New Template
            </button>
          </div>
          <div className="tmpl-list">
            {templates.map((t) => (
              <div className={`tmpl-card${openTemplateId === t.id ? ' open' : ''}`} key={t.id}>
                <div className="tmpl-head">
                  <div className="tmpl-name" style={{ cursor: 'pointer' }} onClick={() => setOpenTemplateId(openTemplateId === t.id ? null : t.id)}>
                    {t.name}
                  </div>
                  <div className="row-actions">
                    <button className="icon-btn" title="Edit" onClick={() => openEditTemplate(t)}>
                      ✎
                    </button>
                    <button className="icon-btn" title="Delete" onClick={() => deleteTemplate(t.id)}>
                      ✕
                    </button>
                  </div>
                </div>
                <div className="tmpl-subject">{t.subject}</div>
                {openTemplateId === t.id && <div className="tmpl-body">{t.body}</div>}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ---------- COLLEGE FINDER ---------- */}
      {activeTab === 'college' && (
        <>
          <div className="panel-head">
            <h2>College Finder — Basketball</h2>
          </div>
          <div className="banner">
            <b>What&apos;s in here —</b> 1,346 programs across D1, D3, NAIA, and JUCO. Conference realignment happens
            constantly — confirm on the school&apos;s athletics site before you rely on it in an email.
          </div>
          <div className="field-row" style={{ gridTemplateColumns: '2fr 1fr', marginBottom: 14 }}>
            <div className="field">
              <label>Search school or conference</label>
              <input value={collegeSearch} onChange={(e) => setCollegeSearch(e.target.value)} placeholder="School, state, or conference" />
            </div>
            <div className="field">
              <label>Division</label>
              <select value={collegeDivision} onChange={(e) => setCollegeDivision(e.target.value)}>
                <option value="D1">Division I (full list)</option>
                <option value="D2">Division II (conferences only)</option>
                <option value="D3">Division III (371 programs)</option>
                <option value="NAIA">NAIA (233 programs)</option>
                <option value="JUCO">JUCO / NJCAA (376 programs)</option>
              </select>
            </div>
          </div>

          {collegeDivision === 'D2' ? (
            <>
              <div className="hint" style={{ marginBottom: 10 }}>Division II conferences (member schools change yearly — not enumerated here)</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                {D2_CONFERENCES.map((c) => (
                  <span className="merge-tag" key={c}>
                    {c}
                  </span>
                ))}
              </div>
            </>
          ) : (
            <>
              <div className="hint" style={{ marginBottom: 10 }}>{collegeResults.length} programs</div>
              {collegeResults.slice(0, 200).map((row) => (
                <div key={row[0]} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}>
                  <div>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{row[0]}</span>{' '}
                    <span className="merge-tag">{collegeDivision === 'D1' ? row[1] : row[1]}</span>
                  </div>
                  <button className="btn ghost small" onClick={() => quickAddCoachFromCollege(row[0])}>
                    + Add Coach
                  </button>
                </div>
              ))}
              {collegeResults.length > 200 && (
                <div className="hint" style={{ marginTop: 10 }}>Showing the first 200 matches — narrow your search to see more.</div>
              )}
            </>
          )}
        </>
      )}

      {/* ---------- CAMPS ---------- */}
      {activeTab === 'camps' && (
        <>
          <div className="panel-head">
            <h2>Camps &amp; Showcases</h2>
            <button className="btn gold" onClick={openAddCamp}>
              + Add Camp
            </button>
          </div>
          <div className="field-row" style={{ gridTemplateColumns: '2fr 1fr 1fr', marginBottom: 14 }}>
            <div className="field">
              <label>Search</label>
              <input value={campSearch} onChange={(e) => setCampSearch(e.target.value)} placeholder="Name, city, state..." />
            </div>
            <div className="field">
              <label>Status</label>
              <select value={campStatusFilter} onChange={(e) => setCampStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                {CAMP_STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s[0].toUpperCase() + s.slice(1)}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Type</label>
              <select value={campTypeFilter} onChange={(e) => setCampTypeFilter(e.target.value)}>
                <option value="">All types</option>
                {CAMP_TYPE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {campResults.length === 0 ? (
            <div className="empty">
              <b>No camps match</b>
              Try a different search or add one directly.
            </div>
          ) : (
            campResults.map((c) => (
              <div className="camp-card" key={c.id}>
                <div className="camp-head">
                  <div>
                    <div className="camp-name">{c.name}</div>
                    <div className="camp-meta">
                      {c.type} {c.location ? `· ${c.location}` : ''} {c.dates ? `· ${c.dates}` : ''}
                    </div>
                  </div>
                  <div className="row-actions">
                    <select className={`status-select status-${c.status}`} value={c.status} onChange={(e) => updateCampStatus(c.id, e.target.value)}>
                      {CAMP_STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s[0].toUpperCase() + s.slice(1)}
                        </option>
                      ))}
                    </select>
                    <button className="icon-btn" title="Edit" onClick={() => openEditCamp(c)}>
                      ✎
                    </button>
                    <button className="icon-btn" title="Delete" onClick={() => deleteCamp(c.id)}>
                      ✕
                    </button>
                  </div>
                </div>
                {c.url && (
                  <a className="film-link" href={c.url} target="_blank" rel="noopener noreferrer">
                    Registration link ↗
                  </a>
                )}
                {c.notes && <div className="name-sub" style={{ marginTop: 6 }}>{c.notes}</div>}
              </div>
            ))
          )}
        </>
      )}

      {/* ---------- MY INFO ---------- */}
      {activeTab === 'myinfo' && (
        <>
          <div className="panel-head">
            <h2>My Info</h2>
          </div>
          <div className="field">
            <label>Profile photo</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              {avatarUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover' }} />
              )}
              <input type="file" accept="image/*" onChange={uploadAvatar} style={{ flex: 1 }} />
            </div>
            <div className="hint" style={{ marginTop: 6 }}>{avatarStatus || 'Shown on your published profile page — up to 5MB.'}</div>
          </div>

          <form onSubmit={saveInfo}>
            <div className="field-row">
              <div className="field">
                <label>Your name</label>
                <input value={infoForm.name} onChange={(e) => setInfoForm({ ...infoForm, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Your sport</label>
                <input value={infoForm.sport} onChange={(e) => setInfoForm({ ...infoForm, sport: e.target.value })} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>Graduation year</label>
                <input value={infoForm.gradYear} onChange={(e) => setInfoForm({ ...infoForm, gradYear: e.target.value })} />
              </div>
              <div className="field">
                <label>Your email</label>
                <input type="email" value={infoForm.email} onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>High school</label>
              <input value={infoForm.school} onChange={(e) => setInfoForm({ ...infoForm, school: e.target.value })} />
            </div>
            <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
              <div className="field">
                <label>Position</label>
                <input value={infoForm.position} onChange={(e) => setInfoForm({ ...infoForm, position: e.target.value })} />
              </div>
              <div className="field">
                <label>Height</label>
                <input value={infoForm.height} onChange={(e) => setInfoForm({ ...infoForm, height: e.target.value })} />
              </div>
              <div className="field">
                <label>GPA</label>
                <input value={infoForm.gpa} onChange={(e) => setInfoForm({ ...infoForm, gpa: e.target.value })} />
              </div>
            </div>
            <div className="field">
              <label>NCAA Eligibility Center ID</label>
              <input value={infoForm.ncaaId} onChange={(e) => setInfoForm({ ...infoForm, ncaaId: e.target.value })} />
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8, textTransform: 'none', fontSize: 12.5, letterSpacing: 0, color: 'var(--sub)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  style={{ width: 'auto' }}
                  checked={infoForm.showNcaaPublicly}
                  onChange={(e) => setInfoForm({ ...infoForm, showNcaaPublicly: e.target.checked })}
                />
                <span>Also show my NCAA ID on my public profile</span>
              </label>
            </div>
            <div className="field">
              <label>Public bio</label>
              <textarea value={infoForm.bio} onChange={(e) => setInfoForm({ ...infoForm, bio: e.target.value })} />
            </div>
            <button type="submit" className="btn gold">
              Save Info
            </button>
            {infoSaved && <span style={{ fontSize: 12, color: '#3f7a4e', marginLeft: 10 }}>Saved ✓</span>}
          </form>

          <div className="migrate-prompt" style={{ marginTop: 26 }}>
            <h2 style={{ fontSize: 18 }}>Public Profile Link</h2>
            <div className="hint" style={{ marginBottom: 12 }}>
              Publishing generates a page at fullcourtpress.app/your-slug showing your bio, sport, grad year, and film
              locker. <b>Anyone with the link can view it.</b>
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Profile URL</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: 'var(--font-mono-fcp)', fontSize: 13, color: 'var(--sub)' }}>fullcourtpress.app/</span>
                <input value={publishSlug} onChange={(e) => setPublishSlug(e.target.value)} style={{ flex: 1, minWidth: 160 }} />
              </div>
            </div>
            {publishError && <p className="error" style={{ marginBottom: 12 }}>{publishError}</p>}
            {published && (
              <div className="field" style={{ marginBottom: 12 }}>
                <label>Your public link</label>
                <input readOnly value={`fullcourtpress.app/${slugify(publishSlug)}`} />
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button type="button" className="btn gold" onClick={publishProfile}>
                Publish / Update Public Profile
              </button>
              {published && (
                <button type="button" className="btn ghost" onClick={unpublishProfile}>
                  Unpublish
                </button>
              )}
            </div>
          </div>
        </>
      )}

      {/* ---------- COACH MODAL ---------- */}
      {coachModalOpen && (
        <div className="modal-overlay" onClick={() => setCoachModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingCoachId ? 'Edit Coach' : 'Add Coach'}</h3>
            <form onSubmit={saveCoach}>
              <div className="field-row">
                <div className="field">
                  <label>Coach name</label>
                  <input value={coachForm.name} onChange={(e) => setCoachForm({ ...coachForm, name: e.target.value })} />
                </div>
                <div className="field">
                  <label>School</label>
                  <input value={coachForm.school} onChange={(e) => setCoachForm({ ...coachForm, school: e.target.value })} />
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Sport / program</label>
                  <input value={coachForm.sport} onChange={(e) => setCoachForm({ ...coachForm, sport: e.target.value })} />
                </div>
                <div className="field">
                  <label>Level</label>
                  <select value={coachForm.level} onChange={(e) => setCoachForm({ ...coachForm, level: e.target.value })}>
                    {LEVEL_OPTIONS.map((l) => (
                      <option key={l} value={l}>
                        {l}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Email</label>
                  <input type="email" value={coachForm.email} onChange={(e) => setCoachForm({ ...coachForm, email: e.target.value })} />
                </div>
                <div className="field">
                  <label>Status</label>
                  <select value={coachForm.status} onChange={(e) => setCoachForm({ ...coachForm, status: e.target.value })}>
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label>Notes</label>
                <textarea value={coachForm.notes} onChange={(e) => setCoachForm({ ...coachForm, notes: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn ghost" onClick={() => setCoachModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn gold">
                  Save Coach
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- COMPOSE MODAL ---------- */}
      {composeOpen && (
        <div className="modal-overlay" onClick={() => setComposeOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Compose Email</h3>
            <div className="field">
              <label>To</label>
              <input value={composeCoach?.email || '(no email on file)'} readOnly />
            </div>
            <div className="field">
              <label>Template</label>
              <select value={composeTemplateId || ''} onChange={(e) => onComposeTemplateChange(e.target.value)}>
                {templates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Subject</label>
              <input value={composeSubject} onChange={(e) => setComposeSubject(e.target.value)} />
            </div>
            <div className="field">
              <label>Body</label>
              <textarea style={{ minHeight: 160 }} value={composeBody} onChange={(e) => setComposeBody(e.target.value)} />
            </div>
            <div className="modal-actions">
              <button type="button" className="btn ghost" onClick={() => setComposeOpen(false)}>
                Cancel
              </button>
              <button type="button" className="btn ghost" onClick={copyCompose}>
                Copy Text
              </button>
              <button type="button" className="btn gold" onClick={sendCompose}>
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ---------- FILM MODAL ---------- */}
      {filmModalOpen && (
        <div className="modal-overlay" onClick={() => setFilmModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingFilmId ? 'Edit Film' : 'Add Film'}</h3>
            <form onSubmit={saveFilm}>
              <div className="field">
                <label>Title</label>
                <input value={filmForm.title} onChange={(e) => setFilmForm({ ...filmForm, title: e.target.value })} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Link (Hudl, YouTube, etc.)</label>
                  <input value={filmForm.url} onChange={(e) => setFilmForm({ ...filmForm, url: e.target.value })} placeholder="https://" />
                </div>
                <div className="field">
                  <label>Sport / event</label>
                  <input value={filmForm.sport} onChange={(e) => setFilmForm({ ...filmForm, sport: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>Or upload a video file</label>
                <input type="file" accept="video/*" onChange={uploadFilmFile} />
                <div className="hint" style={{ marginTop: 6 }}>{filmUploadStatus || 'Up to 5GB (full games welcome) — creates a unique link you can send to coaches.'}</div>
              </div>
              <div className="field">
                <label>Notes</label>
                <textarea value={filmForm.description} onChange={(e) => setFilmForm({ ...filmForm, description: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn ghost" onClick={() => setFilmModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn gold">
                  Save Film
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- TEMPLATE MODAL ---------- */}
      {templateModalOpen && (
        <div className="modal-overlay" onClick={() => setTemplateModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingTemplateId ? 'Edit Template' : 'New Template'}</h3>
            <form onSubmit={saveTemplate}>
              <div className="field">
                <label>Template name</label>
                <input value={templateForm.name} onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })} />
              </div>
              <div className="field">
                <label>Subject line</label>
                <input value={templateForm.subject} onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })} />
              </div>
              <div className="field">
                <label>Body</label>
                <textarea style={{ minHeight: 160 }} value={templateForm.body} onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })} />
              </div>
              <div className="merge-tags">
                {['coach_name', 'school', 'your_name', 'grad_year', 'sport', 'position', 'height', 'gpa', 'ncaa_id', 'my_school'].map((tag) => (
                  <span className="merge-tag" key={tag} style={{ cursor: 'pointer' }} onClick={() => insertTag(tag)}>
                    {`{{${tag}}}`}
                  </span>
                ))}
              </div>
              <div className="modal-actions">
                <button type="button" className="btn ghost" onClick={() => setTemplateModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn gold">
                  Save Template
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- CAMP MODAL ---------- */}
      {campModalOpen && (
        <div className="modal-overlay" onClick={() => setCampModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>{editingCampId ? 'Edit Camp' : 'Add Camp'}</h3>
            <form onSubmit={saveCamp}>
              <div className="field">
                <label>Camp / showcase name</label>
                <input value={campForm.name} onChange={(e) => setCampForm({ ...campForm, name: e.target.value })} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Type</label>
                  <select value={campForm.type} onChange={(e) => setCampForm({ ...campForm, type: e.target.value })}>
                    {CAMP_TYPE_OPTIONS.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="field">
                  <label>Status</label>
                  <select value={campForm.status} onChange={(e) => setCampForm({ ...campForm, status: e.target.value })}>
                    {CAMP_STATUS_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {s[0].toUpperCase() + s.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Location</label>
                  <input value={campForm.location} onChange={(e) => setCampForm({ ...campForm, location: e.target.value })} placeholder="City, State" />
                </div>
                <div className="field">
                  <label>Dates</label>
                  <input value={campForm.dates} onChange={(e) => setCampForm({ ...campForm, dates: e.target.value })} />
                </div>
              </div>
              <div className="field">
                <label>Website / registration link</label>
                <input value={campForm.url} onChange={(e) => setCampForm({ ...campForm, url: e.target.value })} placeholder="https://" />
              </div>
              <div className="field">
                <label>Notes</label>
                <textarea value={campForm.notes} onChange={(e) => setCampForm({ ...campForm, notes: e.target.value })} />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn ghost" onClick={() => setCampModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn gold">
                  Save Camp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
