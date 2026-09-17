'use client';

import { useEffect, useRef, useState } from 'react';

// Crop a profile photo to a square before it is uploaded.
//
// The photo is always shown as a circle — on the athlete's public profile, and
// at 64px in My Info — so a phone photo with the face off to one side, or a
// full-length team shot, ends up as a forehead or a jersey. This lets the
// athlete drag the photo and zoom until the face sits in the circle.
//
// Built by hand rather than with a crop library: it is one drag and one slider,
// and a dependency for that is more to keep patched than the code itself.
// Works with mouse and touch (pointer events), and exports a 600×600 JPEG,
// which also keeps a 5MB phone photo from being served on the profile page.

const VIEW = 280; // on-screen crop square, in CSS pixels
const OUT = 600; // exported size

export default function PhotoCropper({ src, onCancel, onSave }) {
  const imgRef = useRef(null);
  const drag = useRef(null);
  const [natural, setNatural] = useState(null); // { w, h }
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // The smallest scale at which the image still covers the whole square.
  const baseScale = natural ? Math.max(VIEW / natural.w, VIEW / natural.h) : 1;
  const scale = baseScale * zoom;
  const shownW = natural ? natural.w * scale : VIEW;
  const shownH = natural ? natural.h * scale : VIEW;

  // Keep the square covered: the image may never be dragged so far that an
  // edge shows inside the crop.
  const clamp = (x, y, w = shownW, h = shownH) => ({
    x: Math.min(0, Math.max(VIEW - w, x)),
    y: Math.min(0, Math.max(VIEW - h, y)),
  });

  function init(img) {
    const w = img?.naturalWidth;
    const h = img?.naturalHeight;
    if (!w || !h) return;
    setNatural({ w, h });
    const s = Math.max(VIEW / w, VIEW / h);
    // Start centred.
    setOffset({ x: (VIEW - w * s) / 2, y: (VIEW - h * s) / 2 });
  }

  // A cached photo can finish loading before React attaches onLoad, and then
  // onLoad never fires — the cropper would sit there disabled. Check on mount.
  useEffect(() => {
    const img = imgRef.current;
    if (!img?.complete) return;
    const t = setTimeout(() => init(img), 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src]);

  function onZoom(next) {
    if (!natural) return;
    // Zoom around the centre of the square, so the face stays put.
    const nextScale = baseScale * next;
    const cx = (VIEW / 2 - offset.x) / scale;
    const cy = (VIEW / 2 - offset.y) / scale;
    const w = natural.w * nextScale;
    const h = natural.h * nextScale;
    setZoom(next);
    setOffset(clamp(VIEW / 2 - cx * nextScale, VIEW / 2 - cy * nextScale, w, h));
  }

  function onPointerDown(e) {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, ox: offset.x, oy: offset.y };
  }
  function onPointerMove(e) {
    if (!drag.current) return;
    const d = drag.current;
    setOffset(clamp(d.ox + e.clientX - d.px, d.oy + e.clientY - d.py));
  }
  function onPointerUp() {
    drag.current = null;
  }

  // Escape closes, like the other dialogs.
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onCancel(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onCancel]);

  async function save() {
    if (!natural || !imgRef.current) return;
    setSaving(true);
    setError('');
    try {
      const canvas = document.createElement('canvas');
      canvas.width = OUT;
      canvas.height = OUT;
      const ctx = canvas.getContext('2d');
      // The part of the original image inside the square.
      const sx = -offset.x / scale;
      const sy = -offset.y / scale;
      const sSize = VIEW / scale;
      ctx.drawImage(imgRef.current, sx, sy, sSize, sSize, 0, 0, OUT, OUT);
      const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
      if (!blob) throw new Error('Could not prepare the photo.');
      await onSave(blob);
    } catch (err) {
      setError(err?.message || 'Could not save the photo.');
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal cropper-modal" onClick={(e) => e.stopPropagation()}>
        <h3>Position your photo</h3>
        <p className="hint" style={{ marginTop: -6 }}>Drag to move it, and use the slider to zoom. The circle is what coaches see.</p>
        <div
          className="cropper-frame"
          style={{ width: VIEW, height: VIEW }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={imgRef}
            src={src}
            alt=""
            crossOrigin="anonymous"
            draggable={false}
            onLoad={(e) => init(e.currentTarget)}
            style={{ width: shownW, height: shownH, transform: `translate(${offset.x}px, ${offset.y}px)` }}
          />
          <div className="cropper-mask" aria-hidden="true" />
        </div>
        <div className="cropper-zoom">
          <span aria-hidden="true">−</span>
          <input
            type="range"
            min="1"
            max="4"
            step="0.01"
            value={zoom}
            onChange={(e) => onZoom(parseFloat(e.target.value))}
            aria-label="Zoom"
            disabled={!natural}
          />
          <span aria-hidden="true">+</span>
        </div>
        {error && <p className="setup-error">{error}</p>}
        <div className="modal-actions">
          <button type="button" className="btn ghost" onClick={onCancel} disabled={saving}>Cancel</button>
          <button type="button" className="btn gold" onClick={save} disabled={saving || !natural}>
            {saving ? 'Saving…' : 'Save photo'}
          </button>
        </div>
      </div>
    </div>
  );
}
