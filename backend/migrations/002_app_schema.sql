-- Run this once in the Supabase SQL editor (after 001_profiles.sql).
-- Adds plan field to profiles and creates the app schema:
-- projects, project_members, tasks, activity_log.

-- ─── profiles: plan + avatar_url already exists ─────────────────────────────
alter table public.profiles
  add column if not exists plan text not null default 'free'
  check (plan in ('free', 'pro', 'premium'));

-- ─── projects ───────────────────────────────────────────────────────────────
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tag text not null default 'General',
  color text not null default 'violet',
  owner_id uuid not null references public.profiles(id) on delete cascade,
  due_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists projects_owner_idx on public.projects (owner_id);
alter table public.projects enable row level security;

-- ─── project_members ────────────────────────────────────────────────────────
create table if not exists public.project_members (
  project_id uuid not null references public.projects(id) on delete cascade,
  user_id    uuid not null references public.profiles(id) on delete cascade,
  added_at   timestamptz not null default now(),
  primary key (project_id, user_id)
);
alter table public.project_members enable row level security;

-- ─── tasks ──────────────────────────────────────────────────────────────────
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  description text,
  status text not null default 'todo'
    check (status in ('todo', 'in_progress', 'done')),
  priority text not null default 'medium'
    check (priority in ('low', 'medium', 'high')),
  project_id  uuid references public.projects(id) on delete set null,
  assignee_id uuid references public.profiles(id) on delete set null,
  creator_id  uuid not null references public.profiles(id) on delete cascade,
  due_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists tasks_assignee_idx on public.tasks (assignee_id);
create index if not exists tasks_project_idx  on public.tasks (project_id);
create index if not exists tasks_status_idx   on public.tasks (status);
create index if not exists tasks_due_idx      on public.tasks (due_date);
alter table public.tasks enable row level security;

-- ─── activity_log ───────────────────────────────────────────────────────────
create table if not exists public.activity_log (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid not null references public.profiles(id) on delete cascade,
  verb text not null,                -- e.g. 'created', 'completed', 'commented'
  target_type text not null,         -- e.g. 'task', 'project'
  target_id uuid,
  message text not null,
  created_at timestamptz not null default now()
);
create index if not exists activity_created_idx on public.activity_log (created_at desc);
alter table public.activity_log enable row level security;

-- The Express backend uses the service-role key, which bypasses RLS.
-- RLS is enabled defensively in case the anon key is ever pointed here.
