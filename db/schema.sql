-- MaliPamoja Database Schema — Neon (Postgres) + Neon Auth (Better Auth)
--
-- Users are managed by Neon Auth in the `neon_auth.user` table (id uuid).
-- App-specific data lives in `public.*`. Access control is enforced in the
-- app layer (API routes + proxy.ts), NOT via RLS.
--
-- Note: we intentionally do NOT add a hard FK to neon_auth."user" because that
-- schema is managed by Neon Auth. `profiles.id` mirrors neon_auth."user"(id).

create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES  (1:1 with neon_auth."user")
-- ─────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key,          -- = neon_auth."user"(id)
  full_name    text not null,
  phone        text,
  avatar_url   text,
  role         text not null default 'mwanachama'
                 check (role in ('mwenyekiti','katibu','mweka_hazina','msimamizi','mwanachama')),
  member_code  text unique,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

-- Idempotent guards so an already-created profiles table gains the new columns.
alter table public.profiles add column if not exists role text not null default 'mwanachama';
alter table public.profiles add column if not exists member_code text;
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'profiles_role_check') then
    alter table public.profiles add constraint profiles_role_check
      check (role in ('mwenyekiti','katibu','mweka_hazina','msimamizi','mwanachama'));
  end if;
  if not exists (select 1 from pg_constraint where conname = 'profiles_member_code_key') then
    alter table public.profiles add constraint profiles_member_code_key unique (member_code);
  end if;
end $$;

-- ─────────────────────────────────────────────
-- GROUPS
-- ─────────────────────────────────────────────
create table if not exists public.groups (
  id                    uuid default uuid_generate_v4() primary key,
  name                  text not null,
  description           text,
  contribution_amount   decimal(12,2) not null default 0,
  contribution_cycle    text not null default 'monthly' check (contribution_cycle in ('weekly','monthly')),
  interest_rate         decimal(5,2) not null default 10,
  max_loan_multiplier   int not null default 3,
  created_by            uuid references public.profiles(id) on delete set null,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);

-- ─────────────────────────────────────────────
-- MEMBER APPLICATIONS  (join requests, pre-approval)
-- ─────────────────────────────────────────────
create table if not exists public.member_applications (
  id               uuid default uuid_generate_v4() primary key,
  full_name        text not null,
  phone            text not null,
  id_number        text,
  occupation       text,
  reason           text,
  status           text not null default 'pending' check (status in ('pending','approved','rejected')),
  group_id         uuid references public.groups(id) on delete set null,
  reviewed_by      uuid references public.profiles(id),
  reviewed_at      timestamptz,
  member_code      text,
  rejection_reason text,
  created_at       timestamptz default now()
);

-- ─────────────────────────────────────────────
-- GROUP MEMBERS
-- ─────────────────────────────────────────────
create table if not exists public.group_members (
  id          uuid default uuid_generate_v4() primary key,
  group_id    uuid references public.groups(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  role        text not null default 'member' check (role in ('admin','treasurer','member')),
  joined_at   timestamptz default now(),
  is_active   boolean default true,
  unique(group_id, user_id)
);

-- ─────────────────────────────────────────────
-- CONTRIBUTIONS
-- ─────────────────────────────────────────────
create table if not exists public.contributions (
  id            uuid default uuid_generate_v4() primary key,
  group_id      uuid references public.groups(id) on delete cascade not null,
  member_id     uuid references public.profiles(id) on delete cascade not null,
  amount        decimal(12,2) not null,
  period_start  date not null,
  period_end    date not null,
  status        text not null default 'pending' check (status in ('pending','paid','late')),
  paid_at       timestamptz,
  recorded_by   uuid references public.profiles(id),
  notes         text,
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────────
-- LOANS
-- ─────────────────────────────────────────────
create table if not exists public.loans (
  id                uuid default uuid_generate_v4() primary key,
  group_id          uuid references public.groups(id) on delete cascade not null,
  borrower_id       uuid references public.profiles(id) on delete cascade not null,
  amount            decimal(12,2) not null,
  interest_rate     decimal(5,2) not null,
  duration_months   int not null,
  total_due         decimal(12,2) not null,
  amount_paid       decimal(12,2) not null default 0,
  status            text not null default 'pending'
                      check (status in ('pending','approved','rejected','active','completed')),
  approved_by       uuid references public.profiles(id),
  purpose           text,
  requested_at      timestamptz default now(),
  approved_at       timestamptz,
  due_date          date,
  created_at        timestamptz default now()
);

-- ─────────────────────────────────────────────
-- REPAYMENTS
-- ─────────────────────────────────────────────
create table if not exists public.repayments (
  id            uuid default uuid_generate_v4() primary key,
  loan_id       uuid references public.loans(id) on delete cascade not null,
  amount        decimal(12,2) not null,
  paid_at       timestamptz default now(),
  recorded_by   uuid references public.profiles(id),
  notes         text,
  created_at    timestamptz default now()
);

-- ─────────────────────────────────────────────
-- TRANSACTIONS (audit log)
-- ─────────────────────────────────────────────
create table if not exists public.transactions (
  id             uuid default uuid_generate_v4() primary key,
  group_id       uuid references public.groups(id) on delete cascade not null,
  type           text not null check (type in ('contribution','loan_disbursement','repayment','withdrawal','fine')),
  amount         decimal(12,2) not null,
  description    text,
  reference_id   uuid,
  performed_by   uuid references public.profiles(id),
  member_id      uuid references public.profiles(id),
  created_at     timestamptz default now()
);

-- ─────────────────────────────────────────────
-- TRIGGERS: auto-update updated_at
-- ─────────────────────────────────────────────
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_groups_updated_at on public.groups;
create trigger set_groups_updated_at
  before update on public.groups
  for each row execute function public.handle_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();
