// Signed download links for the paid Playbook PDF.
//
// The file is NOT in public/. Anything under public/ is served to anyone who
// guesses the name, which is the wrong shape for something people pay for.
// It lives in private/ and is only ever handed out through a link signed with
// SESSION_SECRET and stamped with an expiry.
//
// The token is deliberately tied to the buyer's email. If a link is passed
// around it still works — a determined buyer can always forward the PDF
// itself, and crippling the honest majority to slow that down is not worth it
// — but the email in the token means a leaked link can be traced to the
// purchase it came from.
import { createHmac, timingSafeEqual } from 'node:crypto';

const DAYS = 30;

const secret = () => {
  const s = process.env.SESSION_SECRET;
  // Fail closed. An empty secret would make every forged token valid, which is
  // worse than the download being broken.
  if (!s) throw new Error('SESSION_SECRET is not set');
  return s;
};

const sign = (email, exp) =>
  createHmac('sha256', secret()).update(`playbook:${email.toLowerCase()}:${exp}`).digest('hex');

export function downloadToken(email) {
  const exp = Date.now() + DAYS * 86400000;
  return `${exp}.${Buffer.from(email.toLowerCase()).toString('base64url')}.${sign(email, exp)}`;
}

export function verifyToken(token) {
  const [exp, b64, mac] = String(token || '').split('.');
  if (!exp || !b64 || !mac) return null;
  let email;
  try { email = Buffer.from(b64, 'base64url').toString('utf8'); } catch { return null; }
  const expected = sign(email, exp);
  if (mac.length !== expected.length) return null;
  if (!timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  if (Number(exp) < Date.now()) return { expired: true, email };
  return { email };
}

export const downloadUrl = (email) =>
  `https://recruitgrid.app/api/playbook/download?t=${downloadToken(email)}`;
