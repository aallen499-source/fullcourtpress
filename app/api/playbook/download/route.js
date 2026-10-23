import fs from 'node:fs/promises';
import path from 'node:path';
import { verifyToken } from '@/lib/playbook.mjs';

// Serves the paid Playbook PDF to someone holding a valid signed link.
//
// The file sits in private/, not public/, so this route is the only way to it.
// next.config.mjs has to be told to ship private/playbook.pdf with this
// function, or the build drops it and every download 500s in production while
// working perfectly on localhost.

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const token = new URL(request.url).searchParams.get('t');
  const claim = verifyToken(token);

  if (!claim) {
    return new Response('This download link is not valid.', { status: 403 });
  }
  if (claim.expired) {
    // Say so plainly rather than 403ing — a buyer coming back after a month
    // has done nothing wrong and should be told how to get another link.
    return new Response(
      'This download link has expired. Email info@recruitgrid.app and we will send you a new one.',
      { status: 410, headers: { 'Content-Type': 'text/plain; charset=utf-8' } }
    );
  }

  try {
    const file = await fs.readFile(path.join(process.cwd(), 'private', 'playbook.pdf'));
    return new Response(file, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="RecruitGrid-Recruiting-Playbook.pdf"',
        'Cache-Control': 'private, no-store',
      },
    });
  } catch {
    return new Response('The file could not be read. Email info@recruitgrid.app.', { status: 500 });
  }
}
