-- ImpactLens schema: organizations, projects, media, AI analysis, timeline,
-- comparisons, reports and search history, isolated per organization via RLS.

create extension if not exists "pgcrypto";

-- ── Organizations & users ──────────────────────────────────────────────
create table if not exists public.organizations (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

-- Application profile for each Supabase Auth user.
create table if not exists public.users (
  id               uuid primary key references auth.users (id) on delete cascade,
  organization_id  uuid references public.organizations (id) on delete set null,
  name             text,
  email            text,
  role             text not null default 'member',
  created_at       timestamptz not null default now()
);

-- Membership table used by RLS (a user can belong to several organizations).
create table if not exists public.organization_members (
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  user_id          uuid not null references auth.users (id) on delete cascade,
  role             text not null default 'member',
  created_at       timestamptz not null default now(),
  primary key (organization_id, user_id)
);

-- ── Projects ───────────────────────────────────────────────────────────
create table if not exists public.projects (
  id               uuid primary key default gen_random_uuid(),
  organization_id  uuid not null references public.organizations (id) on delete cascade,
  name             text not null check (char_length(name) >= 3),
  description      text not null default '',
  type             text not null default 'Environmental Restoration',
  location         text not null,
  start_date       date not null,
  end_date         date not null,
  status           text not null default 'active' check (status in ('planning', 'active', 'completed')),
  focus_activity   text,
  cover_url        text,
  created_at       timestamptz not null default now(),
  check (end_date >= start_date)
);
create index if not exists projects_org_idx on public.projects (organization_id);

-- ── Media (files live in Cloudinary; this is the index) ────────────────
create table if not exists public.media_assets (
  id                    uuid primary key default gen_random_uuid(),
  project_id            uuid not null references public.projects (id) on delete cascade,
  cloudinary_public_id  text not null,
  cloudinary_url        text not null,
  resource_type         text not null check (resource_type in ('image', 'video')),
  filename              text not null,
  format                text,
  width                 integer,
  height                integer,
  duration              numeric,
  phase                 text not null default 'during' check (phase in ('before', 'during', 'after')),
  captured_at           timestamptz,
  location              text,
  site                  text,
  created_at            timestamptz not null default now(),
  unique (project_id, cloudinary_public_id)
);
create index if not exists media_project_idx on public.media_assets (project_id, captured_at);

create table if not exists public.media_analysis (
  id                   uuid primary key default gen_random_uuid(),
  media_asset_id       uuid not null references public.media_assets (id) on delete cascade,
  description          text not null,
  tags                 text[] not null default '{}',
  detected_objects     text[] not null default '{}',
  detected_activities  text[] not null default '{}',
  confidence           integer not null check (confidence between 0 and 100),
  ai_provider          text not null default 'demo',
  created_at           timestamptz not null default now()
);
create index if not exists analysis_asset_idx on public.media_analysis (media_asset_id, created_at desc);
create index if not exists analysis_tags_idx on public.media_analysis using gin (tags);

-- ── Timeline & comparisons ─────────────────────────────────────────────
create table if not exists public.project_timeline (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects (id) on delete cascade,
  date         date not null,
  title        text not null,
  description  text not null default '',
  ai_summary   text not null default '',
  phase        text not null default 'during' check (phase in ('before', 'during', 'after')),
  media_count  integer not null default 0,
  asset_ids    uuid[] not null default '{}',
  created_at   timestamptz not null default now()
);
create index if not exists timeline_project_idx on public.project_timeline (project_id, date);

create table if not exists public.comparisons (
  id               uuid primary key default gen_random_uuid(),
  project_id       uuid not null references public.projects (id) on delete cascade,
  before_asset_id  uuid not null references public.media_assets (id) on delete cascade,
  after_asset_id   uuid not null references public.media_assets (id) on delete cascade,
  title            text not null default '',
  ai_observations  text[] not null default '{}',
  confidence       integer not null check (confidence between 0 and 100),
  summary          text not null default '',
  created_at       timestamptz not null default now(),
  check (before_asset_id <> after_asset_id)
);

-- ── Reports ────────────────────────────────────────────────────────────
create table if not exists public.reports (
  id          uuid primary key default gen_random_uuid(),
  project_id  uuid not null references public.projects (id) on delete cascade,
  title       text not null,
  summary     text not null default '',
  content     jsonb not null,
  created_at  timestamptz not null default now()
);

create table if not exists public.report_assets (
  report_id       uuid not null references public.reports (id) on delete cascade,
  media_asset_id  uuid not null references public.media_assets (id) on delete cascade,
  primary key (report_id, media_asset_id)
);

create table if not exists public.search_queries (
  id                 uuid primary key default gen_random_uuid(),
  project_id         uuid not null references public.projects (id) on delete cascade,
  user_id            uuid default auth.uid() references auth.users (id) on delete set null,
  query              text not null,
  interpreted_query  jsonb,
  created_at         timestamptz not null default now()
);

-- ── Row Level Security ─────────────────────────────────────────────────
create or replace function public.is_org_member(org uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.organization_members m where m.organization_id = org and m.user_id = auth.uid());
$$;

create or replace function public.can_access_project(pid uuid)
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.projects p where p.id = pid and public.is_org_member(p.organization_id));
$$;

alter table public.organizations        enable row level security;
alter table public.users                enable row level security;
alter table public.organization_members enable row level security;
alter table public.projects             enable row level security;
alter table public.media_assets         enable row level security;
alter table public.media_analysis       enable row level security;
alter table public.project_timeline     enable row level security;
alter table public.comparisons          enable row level security;
alter table public.reports              enable row level security;
alter table public.report_assets        enable row level security;
alter table public.search_queries       enable row level security;

create policy "members read their organizations" on public.organizations for select using (public.is_org_member(id));
create policy "users read own profile" on public.users for select using (id = auth.uid() or public.is_org_member(organization_id));
create policy "users update own profile" on public.users for update using (id = auth.uid());
create policy "members read memberships" on public.organization_members for select using (user_id = auth.uid() or public.is_org_member(organization_id));

create policy "members manage projects" on public.projects for all
  using (public.is_org_member(organization_id)) with check (public.is_org_member(organization_id));

create policy "members manage media" on public.media_assets for all
  using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));

create policy "members manage analysis" on public.media_analysis for all
  using (exists (select 1 from public.media_assets m where m.id = media_asset_id and public.can_access_project(m.project_id)))
  with check (exists (select 1 from public.media_assets m where m.id = media_asset_id and public.can_access_project(m.project_id)));

create policy "members manage timeline" on public.project_timeline for all
  using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));

create policy "members manage comparisons" on public.comparisons for all
  using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));

create policy "members manage reports" on public.reports for all
  using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));

create policy "members manage report assets" on public.report_assets for all
  using (exists (select 1 from public.reports r where r.id = report_id and public.can_access_project(r.project_id)))
  with check (exists (select 1 from public.reports r where r.id = report_id and public.can_access_project(r.project_id)));

create policy "members manage searches" on public.search_queries for all
  using (public.can_access_project(project_id)) with check (public.can_access_project(project_id));
