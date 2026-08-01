-- Full Court Press — coach/athlete role, high school city/state, social handles

-- Distinguishes club/team coaches (who don't need athlete-specific fields
-- like position/GPA, or a public recruiting profile) from athletes.
alter table profiles add column if not exists role text default 'athlete';

-- Many high schools share the same name across different states/cities —
-- "Lincoln High School" alone isn't enough to identify one.
alter table profiles add column if not exists school_city text;
alter table profiles add column if not exists school_state text;

-- Social handles shown on the public profile so coaches can find film/highlights.
alter table profiles add column if not exists instagram text;
alter table profiles add column if not exists twitter text;
alter table profiles add column if not exists facebook text;
