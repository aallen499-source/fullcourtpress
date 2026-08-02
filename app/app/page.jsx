'use client';

import { useEffect, useState } from 'react';
import * as tus from 'tus-js-client';
import { createClient } from '@/lib/supabase-browser';
import { DEFAULT_TEMPLATES, fillMergeTags } from '@/lib/default-templates';
import { D1_SCHOOLS, D2_SCHOOLS, D3_JUCO_SCHOOLS } from '@/lib/college-data';
import { getEmbedUrl, isUploadedVideoUrl, generateShareId } from '@/lib/video-embed';
import { PLANS, STRIPE_LINKS } from '@/lib/plans';

const TABS = [
  { id: 'roster', label: 'Coach Roster' },
  { id: 'film', label: 'Film Locker' },
  { id: 'templates', label: 'Email Templates' },
  { id: 'college', label: 'College Finder' },
  { id: 'camps', label: 'Camps' },
  { id: 'myinfo', label: 'My Info' },
  { id: 'team', label: 'Team' },
  { id: 'plans', label: 'Plans' },
];

// A club/team coach isn't recruiting for themselves — they're not tracking
// college coaches, uploading their own film, or emailing programs as a
// prospect. Those three tabs are athlete-only.
const COACH_HIDDEN_TABS = ['roster', 'film', 'templates'];


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
  coachIds: [],
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

// Today in the viewer's own timezone as YYYY-MM-DD. Not toISOString(), which
// is UTC — every US timezone is behind it, so after late afternoon a camp
// happening today would look like yesterday's and vanish a day early.
function localToday() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function slugify(s) {
  return (s || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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
  const [approvedSubmissions, setApprovedSubmissions] = useState([]);
  const [suggestSchoolOpen, setSuggestSchoolOpen] = useState(false);
  const [suggestForm, setSuggestForm] = useState({ name: '', division: 'D1', state: '', conference: '' });
  const [suggestStatus, setSuggestStatus] = useState('');

  // Camps
  const [camps, setCamps] = useState([]);
  const [sharedCamps, setSharedCamps] = useState([]);
  const [catalogSearch, setCatalogSearch] = useState('');
  // Camps are men's or women's events, not interchangeable. Defaults to
  // 'all' rather than guessing from the athlete's profile — the sport field
  // is free text, so there's nothing reliable to infer gender from.
  const [catalogGender, setCatalogGender] = useState('all');
  const [campModalOpen, setCampModalOpen] = useState(false);
  const [editingCampId, setEditingCampId] = useState(null);
  const [campForm, setCampForm] = useState(emptyCampForm);
  const [campSearch, setCampSearch] = useState('');
  const [campStatusFilter, setCampStatusFilter] = useState('');
  const [campTypeFilter, setCampTypeFilter] = useState('');

  // My Info
  const [infoForm, setInfoForm] = useState({
    name: '', sport: '', gradYear: '', email: '', school: '', schoolCity: '', schoolState: '',
    position: '', height: '', gpa: '', ncaaId: '', showNcaaPublicly: false, bio: '',
    instagram: '', twitter: '', facebook: '',
  });
  const [role, setRole] = useState(null);
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarStatus, setAvatarStatus] = useState('');
  const [publishSlug, setPublishSlug] = useState('');
  const [profileLinkCopied, setProfileLinkCopied] = useState(false);
  const [publishError, setPublishError] = useState('');
  const [published, setPublished] = useState(false);
  const [infoSaved, setInfoSaved] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [managingBilling, setManagingBilling] = useState(false);

  // Team
  const [team, setTeam] = useState(null); // owned team: { id, name, invite_code }
  const [teamMembers, setTeamMembers] = useState([]);
  const [joinedTeam, setJoinedTeam] = useState(null); // { id, name } if a member elsewhere
  const [teamNameInput, setTeamNameInput] = useState('');
  const [joinCodeInput, setJoinCodeInput] = useState('');
  const [teamError, setTeamError] = useState('');
  const [teamStatus, setTeamStatus] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { user: authedUser } } = await supabase.auth.getUser();
      setUser(authedUser);
      if (!authedUser) {
        setLoading(false);
        return;
      }
      const [profileRes, coachesRes, filmRes, templatesRes, campsRes, subRes, approvedRes, sharedCampsRes] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', authedUser.id).single(),
        supabase.from('coaches').select('*').eq('user_id', authedUser.id).order('created_at', { ascending: false }),
        supabase.from('film').select('*').eq('user_id', authedUser.id).order('created_at', { ascending: false }),
        supabase.from('templates').select('*').eq('user_id', authedUser.id).order('created_at', { ascending: true }),
        supabase.from('user_camps').select('*').eq('user_id', authedUser.id).order('created_at', { ascending: true }),
        supabase.from('subscriptions').select('*').eq('user_id', authedUser.id).maybeSingle(),
        supabase.from('school_submissions').select('*').eq('status', 'approved'),
        // Shared catalog hides camps whose date has passed — browsing a list of
        // camps you can no longer register for is just noise. Undated camps are
        // kept: a "date TBD" camp is still worth seeing.
        //
        // Deliberately NOT applied to user_camps above. Those are the athlete's
        // own tracked camps, including ones they attended, and that history
        // shouldn't disappear from under them.
        supabase
          .from('camps')
          .select('*')
          .or(`date.is.null,date.gte.${localToday()}`)
          .order('date', { ascending: true }),
      ]);
      setSubscription(subRes.data || null);
      setApprovedSubmissions(approvedRes.data || []);

      const p = profileRes.data || null;
      setProfile(p);
      // No name on file yet means they haven't filled out My Info — send
      // them there first instead of an empty Coach Roster tab.
      if (p && !p.name) setActiveTab('myinfo');
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
        // Upsert with ignoreDuplicates, not a plain insert — if this load()
        // ever runs twice in close succession (React can double-invoke
        // effects), two concurrent "tpls.length === 0" checks could both
        // pass before either insert lands, seeding two full sets of
        // defaults. The unique (user_id, name) constraint makes the second
        // attempt a no-op instead of a duplicate row. Re-fetch afterward
        // since ignoreDuplicates means the response only contains rows that
        // were newly inserted, not ones skipped as conflicts.
        await supabase.from('templates').upsert(seedRows, { onConflict: 'user_id,name', ignoreDuplicates: true });
        const { data: refetched } = await supabase
          .from('templates')
          .select('*')
          .eq('user_id', authedUser.id)
          .order('created_at', { ascending: true });
        tpls = refetched || [];
      }
      setTemplates(tpls);
      if (tpls.length) setComposeTemplateId(tpls[0].id);

      // No seeding here anymore. Camps used to be copied out of a static
      // array into every athlete's user_camps on first load, which meant a
      // camp added later never reached anyone who'd already signed up, and
      // a wrong date could never be corrected. The catalog is now the
      // shared `camps` table; user_camps holds only what this athlete has
      // chosen to track.
      setCamps(campsRes.data || []);
      setSharedCamps(sharedCampsRes.data || []);

      setInfoForm({
        name: p?.name || '',
        sport: p?.sport || '',
        gradYear: p?.grad_year || '',
        email: p?.email || authedUser.email || '',
        school: p?.school || '',
        schoolCity: p?.school_city || '',
        schoolState: p?.school_state || '',
        position: p?.position || '',
        height: p?.height || '',
        gpa: p?.gpa || '',
        ncaaId: p?.ncaa_id || '',
        showNcaaPublicly: !!p?.show_ncaa_publicly,
        bio: p?.bio || '',
        instagram: p?.instagram || '',
        twitter: p?.twitter || '',
        facebook: p?.facebook || '',
      });
      setRole(p?.role || null);
      setAvatarUrl(p?.avatar_url || '');
      setPublishSlug(p?.public_slug || slugify(p?.name || ''));
      setPublished(!!p?.public_published);

      const { data: ownedTeam } = await supabase.from('teams').select('*').eq('owner_id', authedUser.id).maybeSingle();
      if (ownedTeam) {
        setTeam(ownedTeam);
        const { data: members } = await supabase
          .from('profiles')
          .select('id, name, public_slug, public_published')
          .eq('team_id', ownedTeam.id);
        setTeamMembers(members || []);
      } else if (p?.team_id) {
        const { data: joined } = await supabase.from('teams').select('id, name').eq('id', p.team_id).maybeSingle();
        setJoinedTeam(joined || null);
      }

      setLoading(false);
    }
    load();
  }, []);

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

  // The free-tier caps are enforced by RLS insert policies (see
  // supabase/21-enforce-free-limits.sql), so a blocked add comes back as a
  // generic "violates row-level security policy" error. Translate it rather
  // than showing the athlete raw Postgres.
  function saveErrorMessage(error, whatHitTheCap) {
    if (error.code === '42501') {
      return `You've reached the Free plan's ${whatHitTheCap} limit. Upgrade from the Plans tab to add more.`;
    }
    return "Couldn't save: " + error.message;
  }

  async function saveCoach(e) {
    e.preventDefault();
    if (!coachForm.name.trim()) {
      alert('Coach name is required.');
      return;
    }
    if (!editingCoachId && isFreeTier && coaches.length >= FREE_COACH_LIMIT) {
      alert(`The Free plan covers ${FREE_COACH_LIMIT} coaches. Upgrade from the homepage's Plans page to add more.`);
      return;
    }
    if (editingCoachId) {
      const { data: updated, error } = await supabase
        .from('coaches')
        .update({ ...coachForm, updated_at: new Date().toISOString() })
        .eq('id', editingCoachId)
        .select()
        .single();
      if (error) {
        alert("Couldn't save: " + error.message);
        return;
      }
      setCoaches((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      const { data: inserted, error } = await supabase
        .from('coaches')
        .insert({ ...coachForm, user_id: user.id })
        .select()
        .single();
      if (error) {
        alert(saveErrorMessage(error, 'coach'));
        return;
      }
      setCoaches((cs) => [inserted, ...cs]);
    }
    setCoachModalOpen(false);
  }

  async function deleteCoach(id) {
    if (!confirm('Remove this coach from your roster?')) return;
    const { error } = await supabase.from('coaches').delete().eq('id', id);
    if (error) {
      alert("Couldn't delete: " + error.message);
      return;
    }
    setCoaches((cs) => cs.filter((c) => c.id !== id));
  }

  async function updateStatus(id, status) {
    const previous = coaches;
    const statusChangedAt = new Date().toISOString();
    setCoaches((cs) => cs.map((c) => (c.id === id ? { ...c, status, status_changed_at: statusChangedAt } : c)));
    const { error } = await supabase.from('coaches').update({ status, status_changed_at: statusChangedAt }).eq('id', id);
    if (error) {
      setCoaches(previous);
      alert("Couldn't update status: " + error.message);
    }
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
    if (!filmForm.title.trim()) {
      alert('Give the film a title.');
      return;
    }
    // Links are unlimited on every tier — the bandwidth belongs to YouTube or
    // Hudl. Only uploads are capped on free, since those cost real egress.
    // Mirrored by the insert policy in supabase/22-free-unlimited-film-links.sql.
    if (!editingFilmId && isFreeTier && isUploadedVideoUrl(filmForm.url)) {
      const uploads = film.filter((f) => isUploadedVideoUrl(f.url)).length;
      if (uploads >= FREE_FILM_UPLOAD_LIMIT) {
        alert(
          `The Free plan covers ${FREE_FILM_UPLOAD_LIMIT} uploaded videos. YouTube and Hudl links are unlimited — paste one above, or see the Plans tab to upload more.`
        );
        return;
      }
    }
    if (editingFilmId) {
      const { data: updated, error } = await supabase
        .from('film')
        .update(filmForm)
        .eq('id', editingFilmId)
        .select()
        .single();
      if (error) {
        alert("Couldn't save: " + error.message);
        return;
      }
      setFilm((fs) => fs.map((f) => (f.id === updated.id ? updated : f)));
    } else {
      const { data: inserted, error } = await supabase
        .from('film')
        .insert({ ...filmForm, user_id: user.id })
        .select()
        .single();
      if (error) {
        alert(saveErrorMessage(error, 'uploaded video'));
        return;
      }
      setFilm((fs) => [inserted, ...fs]);
    }
    setFilmModalOpen(false);
  }

  async function createShareLink(f) {
    // Opt-in on purpose: until this runs, share_id is null and the clip has
    // no public URL at all. Retries once on the (astronomically unlikely)
    // unique-constraint collision rather than surfacing a confusing error.
    for (let attempt = 0; attempt < 2; attempt++) {
      const shareId = generateShareId();
      const { data, error } = await supabase
        .from('film')
        .update({ share_id: shareId })
        .eq('id', f.id)
        .select()
        .single();
      if (!error) {
        setFilm((fs) => fs.map((x) => (x.id === data.id ? data : x)));
        return;
      }
      if (error.code !== '23505') {
        alert("Couldn't create share link: " + error.message);
        return;
      }
    }
    alert("Couldn't create a share link — please try again.");
  }

  async function removeShareLink(f) {
    if (!confirm('Turn off this share link? Anyone you already sent it to will stop being able to open it.')) return;
    const { data, error } = await supabase.from('film').update({ share_id: null }).eq('id', f.id).select().single();
    if (error) {
      alert("Couldn't remove share link: " + error.message);
      return;
    }
    setFilm((fs) => fs.map((x) => (x.id === data.id ? data : x)));
  }

  function copyProfileLink() {
    // Full URL with protocol on purpose — "fullcourtpress.app/name" pasted
    // into Gmail or Outlook stays plain text, which is the whole point of
    // handing a coach a link.
    const url = `${window.location.origin}/${slugify(publishSlug)}`;
    navigator.clipboard
      .writeText(url)
      .then(() => {
        setProfileLinkCopied(true);
        setTimeout(() => setProfileLinkCopied(false), 2000);
      })
      .catch(() => alert('Copy failed — select the link and copy it manually.'));
  }

  function copyShareLink(shareId) {
    navigator.clipboard
      .writeText(`${window.location.origin}/f/${shareId}`)
      .then(() => alert('Share link copied.'))
      .catch(() => alert('Copy failed — select the link and copy it manually.'));
  }

  async function deleteFilm(id) {
    if (!confirm('Remove this film link?')) return;
    const { error } = await supabase.from('film').delete().eq('id', id);
    if (error) {
      alert("Couldn't delete: " + error.message);
      return;
    }
    setFilm((fs) => fs.filter((f) => f.id !== id));
  }

  async function uploadFilmFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    // The film bucket's own limit is 5GB, but Supabase also enforces a
    // project-wide cap (Dashboard → Storage → Settings → global file size
    // limit) and the smaller of the two always wins — on the free plan
    // that's 50MB. Checking here turns a slow, doomed upload ending in a
    // cryptic TUS 413 into an instant, actionable message. Raise
    // NEXT_PUBLIC_MAX_FILM_UPLOAD_MB once the plan and that setting allow it.
    const MAX_MB = Number(process.env.NEXT_PUBLIC_MAX_FILM_UPLOAD_MB) || 50;
    const MAX_BYTES = MAX_MB * 1024 * 1024;
    if (file.size > MAX_BYTES) {
      const fileMB = Math.round(file.size / (1024 * 1024));
      setFilmUploadStatus(
        `That file is ${fileMB}MB — direct uploads are capped at ${MAX_MB}MB. For a full game, upload it to YouTube or Hudl and paste the link in the field above instead — no size limit, and it plays inline on your profile.`
      );
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
      if (error) {
        alert(error.code === '23505' ? 'You already have a template with that name — try a different one.' : "Couldn't save: " + error.message);
        return;
      }
      setTemplates((ts) => ts.map((t) => (t.id === updated.id ? updated : t)));
    } else {
      const { data: inserted, error } = await supabase
        .from('templates')
        .insert({ ...templateForm, user_id: user.id })
        .select()
        .single();
      if (error) {
        alert(error.code === '23505' ? 'You already have a template with that name — try a different one.' : "Couldn't save: " + error.message);
        return;
      }
      setTemplates((ts) => [...ts, inserted]);
    }
    setTemplateModalOpen(false);
  }

  async function deleteTemplate(id) {
    if (!confirm('Delete this template?')) return;
    const { error } = await supabase.from('templates').delete().eq('id', id);
    if (error) {
      alert("Couldn't delete: " + error.message);
      return;
    }
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
      coachIds: c.coach_ids || [],
    });
    setCampModalOpen(true);
  }

  async function saveCamp(e) {
    e.preventDefault();
    if (!campForm.name.trim()) {
      alert('Camp name is required.');
      return;
    }
    const { coachIds, ...rest } = campForm;
    const payload = { ...rest, coach_ids: coachIds };
    if (editingCampId) {
      const { data: updated, error } = await supabase
        .from('user_camps')
        .update(payload)
        .eq('id', editingCampId)
        .select()
        .single();
      if (error) {
        alert("Couldn't save: " + error.message);
        return;
      }
      setCamps((cs) => cs.map((c) => (c.id === updated.id ? updated : c)));
    } else {
      const { data: inserted, error } = await supabase
        .from('user_camps')
        .insert({ ...payload, user_id: user.id })
        .select()
        .single();
      if (error) {
        alert("Couldn't save: " + error.message);
        return;
      }
      setCamps((cs) => [inserted, ...cs]);
    }
    setCampModalOpen(false);
  }

  // Copies a catalog entry into this athlete's tracked list. camp_id keeps
  // the link back to the shared row (that column has been in the schema
  // since day one, described as "points at camps.id when it came from the
  // shared list" — it just never had anything writing to it).
  async function trackSharedCamp(c) {
    const detail = [c.division, c.cost != null ? `Cost: $${c.cost}` : null, c.eligibility ? `Eligibility: ${c.eligibility}` : null, c.region]
      .filter(Boolean)
      .join(' · ');
    const { data: inserted, error } = await supabase
      .from('user_camps')
      .insert({
        user_id: user.id,
        camp_id: c.id,
        name: [c.school, c.camp_name].filter(Boolean).join(' — '),
        type: c.type || CAMP_TYPE_OPTIONS[0],
        status: 'considering',
        location: [c.city, c.state].filter(Boolean).join(', '),
        dates: c.date ? new Date(c.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '',
        url: c.source_url || '',
        notes: detail,
      })
      .select()
      .single();
    if (error) {
      alert("Couldn't add that camp: " + error.message);
      return;
    }
    setCamps((cs) => [...cs, inserted]);
  }

  async function deleteCamp(id) {
    if (!confirm('Remove this camp from your list?')) return;
    const { error } = await supabase.from('user_camps').delete().eq('id', id);
    if (error) {
      alert("Couldn't delete: " + error.message);
      return;
    }
    setCamps((cs) => cs.filter((c) => c.id !== id));
  }

  async function updateCampStatus(id, status) {
    const previous = camps;
    setCamps((cs) => cs.map((c) => (c.id === id ? { ...c, status } : c)));
    const { error } = await supabase.from('user_camps').update({ status }).eq('id', id);
    if (error) {
      setCamps(previous);
      alert("Couldn't update status: " + error.message);
    }
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
    const { error: saveError } = await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
    if (saveError) {
      setAvatarStatus("Uploaded, but couldn't save to your profile: " + saveError.message);
      return;
    }
    setAvatarUrl(publicUrl);
    setAvatarStatus('Photo saved.');
  }

  async function chooseRole(newRole) {
    const previous = role;
    setRole(newRole);
    const { error } = await supabase.from('profiles').upsert({ id: user.id, role: newRole }, { onConflict: 'id' });
    if (error) {
      setRole(previous);
      alert("Couldn't save: " + error.message);
    }
  }

  async function saveInfo(e) {
    e.preventDefault();
    const { error } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        email: infoForm.email || user.email,
        name: infoForm.name,
        sport: infoForm.sport,
        grad_year: infoForm.gradYear,
        school: infoForm.school,
        school_city: infoForm.schoolCity,
        school_state: infoForm.schoolState,
        position: infoForm.position,
        height: infoForm.height,
        gpa: infoForm.gpa,
        ncaa_id: infoForm.ncaaId,
        show_ncaa_publicly: infoForm.showNcaaPublicly,
        bio: infoForm.bio,
        instagram: infoForm.instagram,
        twitter: infoForm.twitter,
        facebook: infoForm.facebook,
      },
      { onConflict: 'id' }
    );
    if (error) {
      alert("Couldn't save: " + error.message);
      return;
    }
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
        school_city: infoForm.schoolCity,
        school_state: infoForm.schoolState,
        position: infoForm.position,
        height: infoForm.height,
        gpa: infoForm.gpa,
        ncaa_id: infoForm.showNcaaPublicly ? infoForm.ncaaId : null,
        show_ncaa_publicly: infoForm.showNcaaPublicly,
        avatar_url: avatarUrl || null,
        bio: infoForm.bio,
        instagram: infoForm.instagram,
        twitter: infoForm.twitter,
        facebook: infoForm.facebook,
        public_slug: slug,
        public_published: true,
      },
      { onConflict: 'id' }
    );
    if (error) {
      setPublishError(error.code === '23505' ? 'That profile URL is already taken — try a different one.' : "Couldn't publish: " + error.message);
      return;
    }
    const { error: deleteFilmError } = await supabase.from('film').delete().eq('user_id', user.id);
    if (deleteFilmError) {
      setPublishError("Profile saved, but couldn't refresh your film locker snapshot: " + deleteFilmError.message);
      setPublished(true);
      return;
    }
    if (film.length) {
      const { error: insertFilmError } = await supabase.from('film').insert(
        film.map((f) => ({ user_id: user.id, title: f.title, url: f.url, sport: f.sport || '', description: f.description || '' }))
      );
      if (insertFilmError) {
        setPublishError("Profile saved, but couldn't refresh your film locker snapshot: " + insertFilmError.message);
        setPublished(true);
        return;
      }
      const { data: filmRows } = await supabase.from('film').select('*').eq('user_id', user.id).order('created_at', { ascending: false });
      setFilm(filmRows || []);
    }
    setPublished(true);
    alert('Your profile page is live at fullcourtpress.app/' + slug + ' — copy the link and send it to a coach.');
  }

  async function unpublishProfile() {
    if (!confirm('Take your profile page down? The URL will stop working until you publish again.')) return;
    const { error } = await supabase.from('profiles').update({ public_published: false }).eq('id', user.id);
    if (error) {
      alert("Couldn't unpublish: " + error.message);
      return;
    }
    setPublished(false);
  }

  async function manageBilling() {
    setManagingBilling(true);
    try {
      const res = await fetch('/api/create-portal-session', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        alert("Couldn't open billing: " + (body.error || 'unknown error'));
        setManagingBilling(false);
        return;
      }
      window.location.href = body.url;
    } catch (err) {
      alert("Couldn't open billing: " + err.message);
      setManagingBilling(false);
    }
  }

  async function deleteAccount() {
    if (deleteConfirmText.trim().toLowerCase() !== user.email.toLowerCase()) {
      alert('Type your email address exactly to confirm.');
      return;
    }
    if (!confirm('This permanently deletes your account and everything in it — roster, film, photos, published profile. This cannot be undone. Continue?')) {
      return;
    }
    setDeleting(true);
    try {
      const res = await fetch('/api/delete-account', { method: 'POST' });
      const body = await res.json();
      if (!res.ok) {
        alert("Couldn't delete account: " + (body.error || 'unknown error'));
        setDeleting(false);
        return;
      }
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (e) {
      alert("Couldn't delete account: " + e.message);
      setDeleting(false);
    }
  }

  // ---------- TEAM ----------
  async function createTeam(e) {
    e.preventDefault();
    setTeamError('');
    if (!teamNameInput.trim()) {
      setTeamError('Team name is required.');
      return;
    }
    const inviteCode = Math.random().toString(36).slice(2, 8).toUpperCase();
    const { data: created, error } = await supabase
      .from('teams')
      .insert({ owner_id: user.id, name: teamNameInput.trim(), invite_code: inviteCode })
      .select()
      .single();
    if (error) {
      setTeamError("Couldn't create team: " + error.message);
      return;
    }
    setTeam(created);
    setTeamMembers([]);
    setTeamNameInput('');
  }

  async function joinTeamByCode(e) {
    e.preventDefault();
    setTeamError('');
    setTeamStatus('');
    if (!joinCodeInput.trim()) return;
    const { data, error } = await supabase.rpc('join_team', { invite_code_input: joinCodeInput.trim().toUpperCase() });
    if (error) {
      setTeamError("Couldn't join: " + error.message);
      return;
    }
    const row = data?.[0];
    if (row) setJoinedTeam({ id: row.team_id, name: row.team_name });
    setJoinCodeInput('');
    setTeamStatus(`Joined ${row?.team_name || 'the team'}.`);

    try {
      const res = await fetch('/api/grant-team-access', { method: 'POST' });
      const body = await res.json();
      if (res.ok && body.current_period_end) {
        setSubscription({ status: 'active', plan: 'Team Member', current_period_end: body.current_period_end });
        setTeamStatus(`Joined ${row?.team_name || 'the team'} — full access unlocked for 4 months.`);
      }
    } catch {
      // Team join itself already succeeded; the access grant can be
      // retried later without re-joining, so a failure here isn't fatal.
    }
  }

  async function leaveTeam() {
    if (!confirm('Leave this team?')) return;
    const { error } = await supabase.from('profiles').update({ team_id: null }).eq('id', user.id);
    if (error) {
      alert("Couldn't leave: " + error.message);
      return;
    }
    setJoinedTeam(null);
  }

  function copyInviteCode() {
    navigator.clipboard.writeText(team.invite_code).then(() => alert('Invite code copied.'));
  }

  function startCheckout(planId) {
    const link = STRIPE_LINKS[planId];
    if (!link) {
      alert('No checkout link is set up yet for this plan.');
      return;
    }
    window.open(`${link}?prefilled_email=${encodeURIComponent(user.email)}`, '_blank', 'noopener');
  }

  if (loading) return <main className="auth-wrap"><p>Loading…</p></main>;
  if (!user) return <main className="auth-wrap"><p>Loading…</p></main>;

  const visibleTabs = role === 'coach' ? TABS.filter((t) => !COACH_HIDDEN_TABS.includes(t.id)) : TABS;
  // Derived rather than stored, so switching to/from the coach role can
  // never strand someone on a tab that's no longer rendered (the default
  // activeTab is 'roster', which coaches don't have).
  const currentTab = visibleTabs.some((t) => t.id === activeTab)
    ? activeTab
    : role === 'coach'
    ? 'team'
    : 'roster';

  const isPaid = subscription?.status === 'active';
  const TRIAL_MS = 3 * 24 * 60 * 60 * 1000;
  const trialEnd = profile?.trial_started_at ? new Date(profile.trial_started_at).getTime() + TRIAL_MS : null;
  const trialActive = !isPaid && trialEnd !== null && Date.now() < trialEnd;
  const trialDaysLeft = trialActive ? Math.max(1, Math.ceil((trialEnd - Date.now()) / (24 * 60 * 60 * 1000))) : 0;
  const isFreeTier = !isPaid && !trialActive;
  // Season Pass and Team/Club are fixed 4-month windows that don't
  // auto-renew, so showing when they end matters — Athlete renews on its
  // own (cancel anytime), so there's nothing useful to show there.
  const planEndsLabel = (() => {
    if (!isPaid || !subscription.current_period_end) return null;
    const lower = (subscription.plan || '').toLowerCase();
    if (!lower.includes('season') && !lower.includes('team')) return null;
    return new Date(subscription.current_period_end).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  })();
  const planBadgeText = isPaid
    ? `${subscription.plan || 'Paid'}${planEndsLabel ? ` · ends ${planEndsLabel}` : ''}`
    : trialActive
    ? `Trial · ${trialDaysLeft}d left`
    : 'Free account';

  const FREE_COACH_LIMIT = 10;
  const FREE_FILM_UPLOAD_LIMIT = 2;

  const stats = {
    total: coaches.length,
    contacted: coaches.filter((c) => ['contacted', 'followup', 'responded', 'committed'].includes(c.status)).length,
    followup: coaches.filter((c) => c.status === 'followup').length,
    responded: coaches.filter((c) => ['responded', 'committed'].includes(c.status)).length,
  };

  const committedCoaches = coaches.filter((c) => c.status === 'committed');

  const approvedAsRows = approvedSubmissions.map((s) => [
    s.name,
    s.division,
    `https://www.google.com/search?q=${encodeURIComponent(s.name + " men's basketball athletics")}`,
    s.state || '',
    s.conference || '',
  ]);

  const collegeResults = (() => {
    const q = collegeSearch.trim().toLowerCase();
    if (collegeDivision === 'D1') {
      return [
        ...D1_SCHOOLS,
        ...approvedAsRows.filter((s) => s[1] === 'D1').map((s) => [s[0], s[4]]),
      ].filter(([name, conf]) => !q || name.toLowerCase().includes(q) || conf.toLowerCase().includes(q));
    }
    return [...D2_SCHOOLS, ...D3_JUCO_SCHOOLS, ...approvedAsRows].filter((s) => s[1] === collegeDivision).filter(
      ([name, , , state, conf]) => !q || name.toLowerCase().includes(q) || (state || '').toLowerCase().includes(q) || (conf || '').toLowerCase().includes(q)
    );
  })();

  async function submitSchoolSuggestion(e) {
    e.preventDefault();
    if (!suggestForm.name.trim()) {
      alert('School name is required.');
      return;
    }
    const { error } = await supabase.from('school_submissions').insert({
      user_id: user.id,
      name: suggestForm.name.trim(),
      division: suggestForm.division,
      state: suggestForm.state.trim(),
      conference: suggestForm.conference.trim(),
    });
    if (error) {
      alert("Couldn't submit: " + error.message);
      return;
    }
    setSuggestStatus('Thanks — submitted for review. It\'ll show up here once approved.');
    setSuggestForm({ name: '', division: 'D1', state: '', conference: '' });
    setTimeout(() => {
      setSuggestSchoolOpen(false);
      setSuggestStatus('');
    }, 2000);
  }

  const campResults = camps.filter((c) => {
    const q = campSearch.trim().toLowerCase();
    const matchesQ = !q || [c.name, c.location, c.notes].some((f) => (f || '').toLowerCase().includes(q));
    const matchesStatus = !campStatusFilter || c.status === campStatusFilter;
    const matchesType = !campTypeFilter || c.type === campTypeFilter;
    return matchesQ && matchesStatus && matchesType;
  });

  // Which catalog entries this athlete has already pulled into their own
  // list, so the Track button can show as done instead of silently adding
  // a duplicate.
  const trackedCampIds = new Set(camps.map((c) => c.camp_id).filter(Boolean));

  const catalogResults = sharedCamps.filter((c) => {
    if (catalogGender !== 'all' && c.sport !== catalogGender) return false;
    const q = catalogSearch.trim().toLowerCase();
    if (!q) return true;
    return [c.school, c.camp_name, c.city, c.state, c.division, c.region].some((f) =>
      (f || '').toLowerCase().includes(q)
    );
  });

  return (
    <main className="app-shell">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <strong>Full Court Press</strong>
          <div className="muted small">{user.email}</div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          {role === 'coach' && <span className="plan-badge">Coach</span>}
          <button className="plan-badge" style={{ cursor: 'pointer' }} onClick={() => setActiveTab('plans')}>
            {planBadgeText}
          </button>
          <button onClick={signOut}>Sign out</button>
        </div>
      </header>

      <div className="app-tabs">
        {visibleTabs.map((t) => (
          <button
            key={t.id}
            className={currentTab === t.id ? 'active' : ''}
            onClick={() => setActiveTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ---------- ROSTER ---------- */}
      {currentTab === 'roster' && (
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

          {camps.filter((c) => c.status === 'registered').length > 0 && (
            <>
              <div className="panel-head">
                <h2>Upcoming Camps</h2>
              </div>
              {camps
                .filter((c) => c.status === 'registered')
                .map((c) => {
                  const campCoaches = (c.coach_ids || [])
                    .map((id) => coaches.find((co) => co.id === id)?.name)
                    .filter(Boolean);
                  return (
                    <div className="camp-card" key={c.id}>
                      <div className="camp-head">
                        <div>
                          <div className="camp-name">{c.name}</div>
                          <div className="camp-meta">
                            {c.dates || ''} {c.dates && c.location ? '·' : ''} {c.location || ''}
                          </div>
                        </div>
                        <button className="btn ghost small" onClick={() => updateCampStatus(c.id, 'attended')}>
                          Mark Attended
                        </button>
                      </div>
                      <div className="name-sub" style={{ marginTop: 6 }}>
                        <b>Coaches:</b> {campCoaches.length > 0 ? campCoaches.join(', ') : 'None linked yet — edit this camp from the Camps tab to add some.'}
                      </div>
                    </div>
                  );
                })}
            </>
          )}

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
                {coaches.map((c) => {
                  const metAtCamps = camps.filter((camp) => (camp.coach_ids || []).includes(c.id));
                  return (
                  <tr key={c.id}>
                    <td>
                      <div className="name-cell">
                        <div className="jersey">{initials(c.name || '?')}</div>
                        <div>
                          <div className="name-main">{c.name}</div>
                          <div className="name-sub">{c.email || ''}</div>
                          {metAtCamps.length > 0 && (
                            <div className="name-sub">Met at: {metAtCamps.map((camp) => camp.name).join(', ')}</div>
                          )}
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
                      {c.status_changed_at &&
                        (() => {
                          const days = Math.floor((Date.now() - new Date(c.status_changed_at).getTime()) / (24 * 60 * 60 * 1000));
                          if (c.status === 'responded') {
                            return <div className="name-sub" style={{ marginTop: 4 }}>Responded {days === 0 ? 'today' : `${days}d ago`}</div>;
                          }
                          if (c.status === 'contacted' || c.status === 'followup') {
                            const overdue = days >= 14;
                            return (
                              <div className="name-sub" style={{ marginTop: 4, color: overdue ? 'var(--red)' : undefined }}>
                                {STATUS_LABELS[c.status]} {days === 0 ? 'today' : `${days}d ago`}
                                {overdue ? ' — follow up?' : ''}
                              </div>
                            );
                          }
                          return null;
                        })()}
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
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* ---------- FILM ---------- */}
      {currentTab === 'film' && (
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
                      {f.url ? (
                        <a className="film-link" href={f.url} target="_blank" rel="noopener noreferrer">
                          Open original ↗
                        </a>
                      ) : (
                        <span className="film-meta">No link yet</span>
                      )}
                      <div className="row-actions">
                        <button className="icon-btn" title="Edit" onClick={() => openEditFilm(f)}>
                          ✎
                        </button>
                        <button className="icon-btn" title="Delete" onClick={() => deleteFilm(f.id)}>
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="film-share">
                      {f.share_id ? (
                        <>
                          <input readOnly value={`fullcourtpress.app/f/${f.share_id}`} onFocus={(e) => e.target.select()} />
                          <div className="film-share-actions">
                            <button className="btn ghost small" onClick={() => copyShareLink(f.share_id)}>
                              Copy link
                            </button>
                            <button className="btn ghost small" onClick={() => removeShareLink(f)}>
                              Turn off
                            </button>
                          </div>
                        </>
                      ) : (
                        <button className="btn ghost small" onClick={() => createShareLink(f)}>
                          Create share link
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* ---------- TEMPLATES ---------- */}
      {currentTab === 'templates' && (
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
      {currentTab === 'college' && (
        <>
          <div className="panel-head">
            <h2>College Finder — Basketball</h2>
          </div>
          <div className="banner">
            <b>What&apos;s in here —</b> 1,577+ programs across D1, D2, D3, NAIA, and JUCO. D2&apos;s list isn&apos;t
            complete yet — some states aren&apos;t covered. Conference realignment happens constantly — confirm on
            the school&apos;s athletics site before you rely on it in an email.
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
                <option value="D2">Division II (231 programs, partial)</option>
                <option value="D3">Division III (371 programs)</option>
                <option value="NAIA">NAIA (233 programs)</option>
                <option value="JUCO">JUCO / NJCAA (376 programs)</option>
              </select>
            </div>
          </div>

          <div className="panel-head" style={{ marginBottom: 10 }}>
            <div className="hint" style={{ marginBottom: 0 }}>{collegeResults.length} programs</div>
            <button className="btn gold" onClick={() => setSuggestSchoolOpen(true)}>
              + Suggest a School
            </button>
          </div>
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

      {/* ---------- CAMPS ---------- */}
      {currentTab === 'camps' && (
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
                {(c.coach_ids || []).length > 0 && (
                  <div className="name-sub" style={{ marginTop: 6 }}>
                    <b>Coaches:</b>{' '}
                    {c.coach_ids
                      .map((id) => coaches.find((co) => co.id === id)?.name)
                      .filter(Boolean)
                      .join(', ')}
                  </div>
                )}
              </div>
            ))
          )}

          <div className="panel-head" style={{ marginTop: 30 }}>
            <h2>Browse All Camps</h2>
            <span className="hint" style={{ marginBottom: 0 }}>
              {sharedCamps.length} verified · updated monthly
            </span>
          </div>

          {isFreeTier ? (
            <div className="migrate-prompt" style={{ borderColor: 'var(--gold)' }}>
              <h2 style={{ fontSize: 16 }}>The verified camp list is a paid feature</h2>
              <div className="hint" style={{ marginBottom: 12 }}>
                {sharedCamps.length} camps with confirmed dates, cost, eligibility, and live registration links —
                kept current each season. You can still add and track your own camps above.
              </div>
              <button className="btn gold" onClick={() => setActiveTab('plans')}>
                See plans →
              </button>
            </div>
          ) : (
          <>
          <div className="hint" style={{ marginBottom: 12 }}>
            The shared list everyone sees. Add one to track it above with your own status and notes.
          </div>
          <div className="field" style={{ marginBottom: 12 }}>
            <input
              value={catalogSearch}
              onChange={(e) => setCatalogSearch(e.target.value)}
              placeholder="Search by school, city, state, or division..."
            />
          </div>
          <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
            {[
              ['all', 'All camps'],
              ['basketball-men', "Men's"],
              ['basketball-women', "Women's"],
            ].map(([val, label]) => (
              <button
                key={val}
                type="button"
                className={catalogGender === val ? 'btn small' : 'btn ghost small'}
                onClick={() => setCatalogGender(val)}
              >
                {label}
              </button>
            ))}
          </div>
          {catalogResults.length === 0 ? (
            <div className="empty">
              <b>No camps match</b>
              {sharedCamps.length === 0
                ? 'The shared camp list is empty.'
                : 'Try a different search, or switch the filter above.'}
            </div>
          ) : (
            catalogResults.slice(0, 60).map((c) => {
              const tracked = trackedCampIds.has(c.id);
              return (
                <div className="camp-card" key={c.id}>
                  <div className="camp-head">
                    <div>
                      <div className="camp-name">{[c.school, c.camp_name].filter(Boolean).join(' — ')}</div>
                      <div className="camp-meta">
                        {[
                          c.date ? new Date(c.date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : null,
                          [c.city, c.state].filter(Boolean).join(', ') || null,
                          c.division,
                          c.cost != null ? `$${c.cost}` : null,
                        ]
                          .filter(Boolean)
                          .join(' · ')}
                      </div>
                    </div>
                    <button
                      className={tracked ? 'btn ghost small' : 'btn gold small'}
                      disabled={tracked}
                      onClick={() => trackSharedCamp(c)}
                    >
                      {tracked ? 'Tracking ✓' : '+ Track'}
                    </button>
                  </div>
                  {c.eligibility && <div className="name-sub">Eligibility: {c.eligibility}</div>}
                  {c.source_url && (
                    <a className="film-link" href={c.source_url} target="_blank" rel="noopener noreferrer">
                      Registration ↗
                    </a>
                  )}
                </div>
              );
            })
          )}
          {catalogResults.length > 60 && (
            <div className="hint" style={{ marginTop: 10 }}>
              Showing the first 60 — narrow your search to see more.
            </div>
          )}
          </>
          )}
        </>
      )}

      {/* ---------- MY INFO ---------- */}
      {currentTab === 'myinfo' && (
        <>
          <div className="panel-head">
            <h2>My Info</h2>
          </div>

          {committedCoaches.length > 0 && (
            <div className="migrate-prompt" style={{ marginBottom: 20, textAlign: 'center', borderColor: 'var(--gold)' }}>
              <h2 style={{ fontSize: 20 }}>
                🎉 Committed to {committedCoaches.map((c) => c.school || c.name).join(', ')}!
              </h2>
              <div className="hint">Congratulations — that&apos;s the whole point of all this work.</div>
            </div>
          )}

          {!role && (
            <div className="migrate-prompt" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16 }}>Are you an athlete or a club/team coach?</h2>
              <div className="hint" style={{ marginBottom: 12 }}>
                This just changes which fields show up below — you can change it later.
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button type="button" className="btn gold" onClick={() => chooseRole('athlete')}>
                  I&apos;m an athlete
                </button>
                <button type="button" className="btn ghost" onClick={() => chooseRole('coach')}>
                  I&apos;m a club/team coach
                </button>
              </div>
            </div>
          )}

          {role === 'coach' && (
            <div className="migrate-prompt" style={{ marginBottom: 20 }}>
              <h2 style={{ fontSize: 16 }}>Your Team</h2>
              {team ? (
                <>
                  <div className="hint" style={{ marginBottom: 10 }}>
                    <b>{team.name}</b> — {teamMembers.length} of 12 athletes
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                    <input readOnly value={team.invite_code} style={{ maxWidth: 160 }} />
                    <button type="button" className="btn ghost small" onClick={copyInviteCode}>
                      Copy invite code
                    </button>
                  </div>
                </>
              ) : (
                <div className="hint" style={{ marginBottom: 10 }}>
                  You haven&apos;t created a team yet — set one up to get an invite code for your athletes.
                </div>
              )}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className={team ? 'btn ghost small' : 'btn gold small'}
                  onClick={() => setActiveTab('team')}
                >
                  {team ? 'Manage team →' : 'Set up my team →'}
                </button>
                <button type="button" className="btn ghost small" onClick={() => chooseRole('athlete')}>
                  Actually, I&apos;m an athlete
                </button>
              </div>
            </div>
          )}

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
                <label>{role === 'coach' ? 'Sport you coach' : 'Your sport'}</label>
                <input value={infoForm.sport} onChange={(e) => setInfoForm({ ...infoForm, sport: e.target.value })} />
              </div>
            </div>
            <div className="field-row">
              {role !== 'coach' && (
                <div className="field">
                  <label>Graduation year</label>
                  <input value={infoForm.gradYear} onChange={(e) => setInfoForm({ ...infoForm, gradYear: e.target.value })} />
                </div>
              )}
              <div className="field">
                <label>Your email</label>
                <input type="email" value={infoForm.email} onChange={(e) => setInfoForm({ ...infoForm, email: e.target.value })} />
              </div>
            </div>
            <div className="field-row">
              <div className="field">
                <label>{role === 'coach' ? 'Club / organization name' : 'High school'}</label>
                <input value={infoForm.school} onChange={(e) => setInfoForm({ ...infoForm, school: e.target.value })} />
              </div>
              {role !== 'coach' && (
                <div className="field-row" style={{ gridTemplateColumns: '2fr 1fr' }}>
                  <div className="field">
                    <label>City</label>
                    <input value={infoForm.schoolCity} onChange={(e) => setInfoForm({ ...infoForm, schoolCity: e.target.value })} />
                  </div>
                  <div className="field">
                    <label>State</label>
                    <input value={infoForm.schoolState} onChange={(e) => setInfoForm({ ...infoForm, schoolState: e.target.value })} placeholder="e.g. TX" />
                  </div>
                </div>
              )}
            </div>
            {role !== 'coach' && (
              <>
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
                <div className="field-row" style={{ gridTemplateColumns: '1fr 1fr 1fr' }}>
                  <div className="field">
                    <label>Instagram</label>
                    <input value={infoForm.instagram} onChange={(e) => setInfoForm({ ...infoForm, instagram: e.target.value })} placeholder="@handle" />
                  </div>
                  <div className="field">
                    <label>X / Twitter</label>
                    <input value={infoForm.twitter} onChange={(e) => setInfoForm({ ...infoForm, twitter: e.target.value })} placeholder="@handle" />
                  </div>
                  <div className="field">
                    <label>Facebook</label>
                    <input value={infoForm.facebook} onChange={(e) => setInfoForm({ ...infoForm, facebook: e.target.value })} placeholder="Profile or page name" />
                  </div>
                </div>
              </>
            )}
            {role !== 'coach' && (
              <div className="field">
                <label>Public bio</label>
                <textarea value={infoForm.bio} onChange={(e) => setInfoForm({ ...infoForm, bio: e.target.value })} />
              </div>
            )}
            <button type="submit" className="btn gold">
              Save Info
            </button>
            {infoSaved && <span style={{ fontSize: 12, color: '#3f7a4e', marginLeft: 10 }}>Saved ✓</span>}
          </form>

          {role !== 'coach' && (
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
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <input
                    readOnly
                    value={`fullcourtpress.app/${slugify(publishSlug)}`}
                    onFocus={(e) => e.target.select()}
                    style={{ flex: 1, minWidth: 200 }}
                  />
                  <button type="button" className="btn small" onClick={copyProfileLink}>
                    {profileLinkCopied ? 'Copied' : 'Copy link'}
                  </button>
                </div>
                <div className="hint" style={{ marginTop: 6 }}>
                  Copies the full https:// address so it turns into a clickable link in your email.
                </div>
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
          )}

          {isPaid && (
            <div className="migrate-prompt" style={{ marginTop: 26 }}>
              <h2 style={{ fontSize: 16 }}>Manage billing</h2>
              <div className="hint" style={{ marginBottom: 12 }}>
                Cancel your subscription or downgrade to the Free plan, update your payment method, or view past
                invoices — handled directly by Stripe.
              </div>
              <button type="button" className="btn ghost" onClick={manageBilling} disabled={managingBilling}>
                {managingBilling ? 'Opening…' : 'Manage / Cancel Subscription'}
              </button>
            </div>
          )}

          <div className="migrate-prompt" style={{ marginTop: 26, borderColor: 'var(--red)' }}>
            <h2 style={{ fontSize: 16, color: 'var(--red)' }}>Delete my account</h2>
            <div className="hint" style={{ marginBottom: 12 }}>
              Permanently deletes your account and everything in it — roster, film, photos, templates, camps, and
              your published profile if you have one. This can&apos;t be undone.
            </div>
            <div className="field" style={{ marginBottom: 12 }}>
              <label>Type your email ({user.email}) to confirm</label>
              <input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder={user.email} />
            </div>
            <button
              type="button"
              className="btn ghost"
              style={{ color: 'var(--red)', borderColor: 'var(--red)' }}
              onClick={deleteAccount}
              disabled={deleting}
            >
              {deleting ? 'Deleting…' : 'Delete my account permanently'}
            </button>
          </div>
        </>
      )}

      {/* ---------- TEAM ---------- */}
      {currentTab === 'team' && (
        <>
          <div className="panel-head">
            <h2>Team</h2>
          </div>

          {team ? (
            <>
              <div className="hint" style={{ marginBottom: 12 }}>
                <b>{team.name}</b> — share this invite code with your athletes so they can join.
              </div>
              <div className="field" style={{ marginBottom: 20 }}>
                <label>Invite code</label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input readOnly value={team.invite_code} style={{ flex: 1 }} />
                  <button className="btn ghost small" onClick={copyInviteCode}>
                    Copy
                  </button>
                </div>
              </div>
              <h3 style={{ fontSize: 16, marginBottom: 10 }}>Roster ({teamMembers.length})</h3>
              {teamMembers.length === 0 ? (
                <div className="empty">
                  <b>No athletes yet</b>
                  Share your invite code to get started.
                </div>
              ) : (
                teamMembers.map((m) => (
                  <div
                    key={m.id}
                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid var(--line)' }}
                  >
                    <span style={{ fontWeight: 700 }}>{m.name || '(no name set)'}</span>
                    {m.public_published && m.public_slug ? (
                      <a className="film-link" href={`/${m.public_slug}`} target="_blank" rel="noopener noreferrer">
                        View profile ↗
                      </a>
                    ) : (
                      <span className="muted small">Not published yet</span>
                    )}
                  </div>
                ))
              )}
            </>
          ) : joinedTeam ? (
            <>
              <div className="hint" style={{ marginBottom: 12 }}>
                You&apos;re on <b>{joinedTeam.name}</b>&apos;s roster. Your coach can see your name and, once you
                publish one, a link to your public profile — nothing else.
              </div>
              <button className="btn ghost" onClick={leaveTeam}>
                Leave team
              </button>
            </>
          ) : (
            <>
              <div className="migrate-prompt" style={{ marginBottom: 16 }}>
                <h2 style={{ fontSize: 16 }}>Create a team</h2>
                <div className="hint" style={{ marginBottom: 10 }}>
                  For coaches/directors on the Team plan — get an invite code to share with your athletes.
                </div>
                <form onSubmit={createTeam} style={{ display: 'flex', gap: 8 }}>
                  <input value={teamNameInput} onChange={(e) => setTeamNameInput(e.target.value)} placeholder="Team name" style={{ flex: 1 }} />
                  <button type="submit" className="btn gold">
                    Create
                  </button>
                </form>
              </div>
              <div className="migrate-prompt">
                <h2 style={{ fontSize: 16 }}>Join a team</h2>
                <div className="hint" style={{ marginBottom: 10 }}>Have an invite code from your coach? Enter it here.</div>
                <form onSubmit={joinTeamByCode} style={{ display: 'flex', gap: 8 }}>
                  <input value={joinCodeInput} onChange={(e) => setJoinCodeInput(e.target.value)} placeholder="Invite code" style={{ flex: 1 }} />
                  <button type="submit" className="btn gold">
                    Join
                  </button>
                </form>
              </div>
            </>
          )}
          {teamError && <p className="error" style={{ marginTop: 10 }}>{teamError}</p>}
          {teamStatus && <p role="status" style={{ marginTop: 10 }}>{teamStatus}</p>}
        </>
      )}

      {/* ---------- PLANS ---------- */}
      {currentTab === 'plans' && (
        <>
          <div className="panel-head">
            <h2>Plans</h2>
          </div>
          <p className="hint" style={{ marginBottom: 16 }}>
            Public pricing, no sales call, cancel in one click. Paid plans cover unlimited roster, film, and the
            full camp database.
          </p>
          <div className="plan-grid">
            {PLANS.map((p) => {
              const isCurrentPaid = isPaid && subscription?.plan?.toLowerCase().includes(p.id === 'annual' ? 'athlete' : p.id);
              const isCurrentFree = p.id === 'free' && isFreeTier;
              const isCurrent = isCurrentPaid || isCurrentFree;
              const link = STRIPE_LINKS[p.id];
              return (
                <div className={`plan-card${p.highlight ? ' featured' : ''}`} key={p.id}>
                  {p.highlight && <div className="plan-flag">Most popular</div>}
                  <div className="plan-name">{p.name}</div>
                  <div className="plan-price">
                    {p.price}
                    <span> {p.cadence}</span>
                  </div>
                  <div className="plan-blurb">{p.blurb}</div>
                  <ul className="plan-feats">
                    {p.features.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                  {isCurrent ? (
                    <div className="plan-current">
                      Your current plan
                      {isCurrentPaid && planEndsLabel && ` — ends ${planEndsLabel}`}
                    </div>
                  ) : p.id === 'free' ? null : (
                    <button className={`btn ${p.highlight ? 'gold' : 'ghost'} plan-cta`} onClick={() => startCheckout(p.id)}>
                      {link ? `Choose ${p.name}` : 'Coming soon'}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* ---------- SUGGEST A SCHOOL MODAL ---------- */}
      {suggestSchoolOpen && (
        <div className="modal-overlay" onClick={() => setSuggestSchoolOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Suggest a School</h3>
            <div className="hint" style={{ marginBottom: 12 }}>
              Missing a program? Submit it here — it gets reviewed before it&apos;s added to the shared list everyone
              sees, so it won&apos;t show up immediately.
            </div>
            <form onSubmit={submitSchoolSuggestion}>
              <div className="field">
                <label>School name</label>
                <input value={suggestForm.name} onChange={(e) => setSuggestForm({ ...suggestForm, name: e.target.value })} />
              </div>
              <div className="field-row">
                <div className="field">
                  <label>Division</label>
                  <select value={suggestForm.division} onChange={(e) => setSuggestForm({ ...suggestForm, division: e.target.value })}>
                    <option value="D1">D1</option>
                    <option value="D2">D2</option>
                    <option value="D3">D3</option>
                    <option value="NAIA">NAIA</option>
                    <option value="JUCO">JUCO</option>
                  </select>
                </div>
                <div className="field">
                  <label>State</label>
                  <input value={suggestForm.state} onChange={(e) => setSuggestForm({ ...suggestForm, state: e.target.value })} placeholder="e.g. TX" />
                </div>
              </div>
              <div className="field">
                <label>Conference (optional)</label>
                <input value={suggestForm.conference} onChange={(e) => setSuggestForm({ ...suggestForm, conference: e.target.value })} />
              </div>
              {suggestStatus && <p role="status">{suggestStatus}</p>}
              <div className="modal-actions">
                <button type="button" className="btn ghost" onClick={() => setSuggestSchoolOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn gold">
                  Submit for Review
                </button>
              </div>
            </form>
          </div>
        </div>
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
                  <label>Link (Hudl, YouTube, etc.) — optional</label>
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
              <div className="field">
                <label>Coaches you connected with here</label>
                <select
                  multiple
                  value={campForm.coachIds}
                  onChange={(e) =>
                    setCampForm({ ...campForm, coachIds: Array.from(e.target.selectedOptions).map((o) => o.value) })
                  }
                  style={{ minHeight: 90 }}
                >
                  {coaches.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} — {c.school || 'no school set'}
                    </option>
                  ))}
                </select>
                <div className="hint" style={{ marginTop: 4 }}>
                  Cmd/Ctrl-click to select more than one. Ties this camp to coaches already on your roster.
                </div>
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
