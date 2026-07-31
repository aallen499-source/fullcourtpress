-- Full Court Press — restrict team creation to the Team/Club plan
-- Run after 06-teams.sql.
--
-- Splits the single "owner manages own team" policy into separate
-- select/update/delete (unrestricted — an existing owner keeps managing
-- their team even if their subscription later lapses) and a new insert
-- policy that actually checks for an active Team-plan subscription.
--
-- NOTE: this matches on plan ilike '%team%'. That string comes from
-- whatever your Stripe product is actually named (see the webhook —
-- app/api/stripe-webhook/route.js pulls it from the Checkout line item's
-- product name). If your product isn't named with "Team" in it, either
-- rename it in Stripe or adjust the pattern below to match.

drop policy if exists "owner manages own team" on teams;

drop policy if exists "owner can select own team" on teams;
create policy "owner can select own team" on teams
  for select using (auth.uid() = owner_id);

drop policy if exists "owner can update own team" on teams;
create policy "owner can update own team" on teams
  for update using (auth.uid() = owner_id) with check (auth.uid() = owner_id);

drop policy if exists "owner can delete own team" on teams;
create policy "owner can delete own team" on teams
  for delete using (auth.uid() = owner_id);

drop policy if exists "team plan can create team" on teams;
create policy "team plan can create team" on teams
  for insert with check (
    auth.uid() = owner_id
    and exists (
      select 1 from subscriptions
      where user_id = auth.uid()
        and status = 'active'
        and plan ilike '%team%'
    )
  );
