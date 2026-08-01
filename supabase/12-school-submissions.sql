-- Full Court Press — user-suggested schools for College Finder
--
-- The D1/D2/D3/NAIA/JUCO lists are static reference data compiled into the
-- app, not a live database table — that's deliberate (see 01-schema.sql's
-- note on "camps" being a moat you keep verified). This table lets athletes
-- suggest missing schools without letting anyone write directly into that
-- shared list: submissions sit as 'pending' until you flip them to
-- 'approved' yourself (just edit the status column in Supabase's Table
-- Editor), at which point the app picks them up automatically — no code
-- deploy needed.

create table if not exists school_submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  name text not null,
  division text not null,
  state text,
  conference text,
  status text not null default 'pending', -- pending / approved / rejected
  created_at timestamptz default now()
);

create index if not exists school_submissions_user_idx on school_submissions(user_id);
create index if not exists school_submissions_status_idx on school_submissions(status);

alter table school_submissions enable row level security;

create policy "users can view their own submissions" on school_submissions
  for select using (auth.uid() = user_id);

create policy "anyone signed in can view approved submissions" on school_submissions
  for select using (status = 'approved');

create policy "users can submit their own suggestions" on school_submissions
  for insert with check (auth.uid() = user_id);

-- ============================================================
-- HOW TO APPROVE A SUBMISSION
-- ============================================================
-- Supabase dashboard -> Table Editor -> school_submissions -> find the row
-- -> change its "status" cell from "pending" to "approved" -> save.
-- It'll show up in every athlete's College Finder next time they load /app.
