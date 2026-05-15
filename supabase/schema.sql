-- MaliPamoja Database Schema
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─────────────────────────────────────────────
-- PROFILES (extends auth.users)
-- ─────────────────────────────────────────────
create table public.profiles (
  id           uuid references auth.users(id) on delete cascade primary key,
  full_name    text not null,
  phone        text,
  avatar_url   text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ─────────────────────────────────────────────
-- GROUPS
-- ─────────────────────────────────────────────
create table public.groups (
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

alter table public.groups enable row level security;

create policy "Group members can view their groups"
  on public.groups for select using (
    exists (
      select 1 from public.group_members
      where group_id = groups.id and user_id = auth.uid()
    )
  );

create policy "Authenticated users can create groups"
  on public.groups for insert with check (auth.uid() = created_by);

create policy "Group admins can update their groups"
  on public.groups for update using (
    exists (
      select 1 from public.group_members
      where group_id = groups.id and user_id = auth.uid() and role = 'admin'
    )
  );

-- ─────────────────────────────────────────────
-- GROUP MEMBERS
-- ─────────────────────────────────────────────
create table public.group_members (
  id          uuid default uuid_generate_v4() primary key,
  group_id    uuid references public.groups(id) on delete cascade not null,
  user_id     uuid references public.profiles(id) on delete cascade not null,
  role        text not null default 'member' check (role in ('admin','treasurer','member')),
  joined_at   timestamptz default now(),
  is_active   boolean default true,
  unique(group_id, user_id)
);

alter table public.group_members enable row level security;

create policy "Members can view group_members in their groups"
  on public.group_members for select using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id and gm.user_id = auth.uid()
    )
  );

create policy "Admins and treasurers can manage group members"
  on public.group_members for all using (
    exists (
      select 1 from public.group_members gm
      where gm.group_id = group_members.group_id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','treasurer')
    )
  );

-- ─────────────────────────────────────────────
-- CONTRIBUTIONS
-- ─────────────────────────────────────────────
create table public.contributions (
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

alter table public.contributions enable row level security;

create policy "Group members can view contributions"
  on public.contributions for select using (
    exists (
      select 1 from public.group_members
      where group_id = contributions.group_id and user_id = auth.uid()
    )
  );

create policy "Admins and treasurers can manage contributions"
  on public.contributions for all using (
    exists (
      select 1 from public.group_members
      where group_id = contributions.group_id
        and user_id = auth.uid()
        and role in ('admin','treasurer')
    )
  );

-- ─────────────────────────────────────────────
-- LOANS
-- ─────────────────────────────────────────────
create table public.loans (
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

alter table public.loans enable row level security;

create policy "Group members can view loans"
  on public.loans for select using (
    exists (
      select 1 from public.group_members
      where group_id = loans.group_id and user_id = auth.uid()
    )
  );

create policy "Members can request loans"
  on public.loans for insert with check (
    auth.uid() = borrower_id and
    exists (
      select 1 from public.group_members
      where group_id = loans.group_id and user_id = auth.uid() and is_active = true
    )
  );

create policy "Admins and treasurers can approve loans"
  on public.loans for update using (
    exists (
      select 1 from public.group_members
      where group_id = loans.group_id
        and user_id = auth.uid()
        and role in ('admin','treasurer')
    )
  );

-- ─────────────────────────────────────────────
-- REPAYMENTS
-- ─────────────────────────────────────────────
create table public.repayments (
  id            uuid default uuid_generate_v4() primary key,
  loan_id       uuid references public.loans(id) on delete cascade not null,
  amount        decimal(12,2) not null,
  paid_at       timestamptz default now(),
  recorded_by   uuid references public.profiles(id),
  notes         text,
  created_at    timestamptz default now()
);

alter table public.repayments enable row level security;

create policy "Group members can view repayments"
  on public.repayments for select using (
    exists (
      select 1 from public.loans l
      join public.group_members gm on gm.group_id = l.group_id
      where l.id = repayments.loan_id and gm.user_id = auth.uid()
    )
  );

create policy "Admins and treasurers can manage repayments"
  on public.repayments for all using (
    exists (
      select 1 from public.loans l
      join public.group_members gm on gm.group_id = l.group_id
      where l.id = repayments.loan_id
        and gm.user_id = auth.uid()
        and gm.role in ('admin','treasurer')
    )
  );

-- ─────────────────────────────────────────────
-- TRANSACTIONS (audit log)
-- ─────────────────────────────────────────────
create table public.transactions (
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

alter table public.transactions enable row level security;

create policy "Group members can view transactions"
  on public.transactions for select using (
    exists (
      select 1 from public.group_members
      where group_id = transactions.group_id and user_id = auth.uid()
    )
  );

create policy "System can insert transactions"
  on public.transactions for insert with check (
    exists (
      select 1 from public.group_members
      where group_id = transactions.group_id and user_id = auth.uid()
    )
  );

-- ─────────────────────────────────────────────
-- FUNCTIONS & TRIGGERS
-- ─────────────────────────────────────────────

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'phone'
  );
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Auto-update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger set_groups_updated_at
  before update on public.groups
  for each row execute function public.handle_updated_at();

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();
