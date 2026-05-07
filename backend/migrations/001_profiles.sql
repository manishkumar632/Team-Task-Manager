-- Run this once in the Supabase SQL editor.
-- Creates the `profiles` table used by the Express backend for auth.

create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  password_hash text not null,
  name text not null,
  role text not null default 'member' check (role in ('admin', 'member')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists profiles_email_idx on public.profiles (email);

-- The Express backend uses the service-role key, which bypasses RLS.
-- We still enable RLS so that, if anyone ever points the anon key at this
-- table by mistake, no rows are exposed.
alter table public.profiles enable row level security;
