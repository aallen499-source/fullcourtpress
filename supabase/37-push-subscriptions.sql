-- RecruitGrid — web push subscriptions
--
-- One row per browser, not per person: someone with a phone and a laptop has
-- two, and both should get the reminder. The push service (Apple, Google,
-- Mozilla) issues the endpoint URL, and it is the identity of that browser as
-- far as we are concerned.
--
-- Why this exists at all: on iOS, web push reaches only a PWA that has been
-- added to the Home Screen. Safari in a tab gets nothing. So this table stays
-- small until people install, which is what app/app/InstallPrompt.jsx is for.

create table if not exists push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,

  -- The push service URL. Unique because a browser that re-subscribes must
  -- update its existing row rather than accumulate duplicates — otherwise one
  -- person collects a row per sign-in and gets the same reminder five times.
  endpoint text not null unique,

  -- The encryption material the push payload is sealed with. Without these the
  -- endpoint is useless: web push payloads are encrypted per subscription, and
  -- the push service itself cannot read them.
  p256dh text not null,
  auth text not null,

  -- Purely for debugging a delivery complaint six months from now.
  user_agent text,

  created_at timestamptz default now(),
  -- Stamped on each accepted send. A row that has not succeeded in a long time
  -- is a candidate for cleanup even if the push service never returned 410.
  last_success_at timestamptz
);

create index if not exists push_subscriptions_user_idx on push_subscriptions (user_id);

alter table push_subscriptions enable row level security;

-- Same shape as every other per-user table in 02-policies.sql. The `with check`
-- half matters as much as `using`: without it someone could insert a row
-- carrying another user's id and hijack their notifications.
drop policy if exists "own push subscriptions" on push_subscriptions;
create policy "own push subscriptions" on push_subscriptions
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ============================================================
-- VERIFY
-- ============================================================
--   select count(*) as subscriptions,
--          count(distinct user_id) as people,
--          count(*) filter (where last_success_at is not null) as ever_delivered
--     from push_subscriptions;
--   -- subscriptions >= people is expected: one row per browser, not per person.
