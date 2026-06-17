-- ============================================================
-- HarNova Database Schema
-- Run this in Supabase SQL Editor → Run
-- ============================================================

-- PROFILES
create table if not exists public.profiles (
  id              uuid references auth.users(id) on delete cascade primary key,
  email           text not null,
  full_name       text,
  avatar_url      text,
  token_balance   integer not null default 10,
  github_token    text,
  created_at      timestamptz default now()
);

-- SITES
create table if not exists public.sites (
  id                  uuid default gen_random_uuid() primary key,
  user_id             uuid references public.profiles(id) on delete cascade not null,
  name                text not null,
  description         text,
  subdomain           text unique not null,
  custom_domain       text,
  html                text not null default '',
  files               jsonb,
  site_type           text not null default 'landing'
                        check (site_type in ('landing','portfolio','ecommerce','restaurant','fullstack','saas')),
  status              text not null default 'draft'
                        check (status in ('draft','building','deployed','expired','error')),
  deployed_url        text,
  vercel_project_id   text,
  deploy_expires_at   timestamptz,
  github_repo         text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);

-- TOKEN TRANSACTIONS
create table if not exists public.token_transactions (
  id                      uuid default gen_random_uuid() primary key,
  user_id                 uuid references public.profiles(id) on delete cascade not null,
  amount                  integer not null,
  type                    text not null check (type in ('purchase','spend','refund','bonus')),
  description             text not null,
  stripe_payment_intent   text,
  created_at              timestamptz default now()
);

-- AUTO-CREATE PROFILE ON SIGNUP (gives 10 free tokens)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, token_balance)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    10
  );
  -- Log the welcome bonus
  insert into public.token_transactions (user_id, amount, type, description)
  values (new.id, 10, 'bonus', 'Welcome bonus — 10 free tokens');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- AUTO UPDATE updated_at
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end;
$$;

drop trigger if exists sites_updated_at on public.sites;
create trigger sites_updated_at
  before update on public.sites
  for each row execute procedure public.set_updated_at();

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table public.profiles          enable row level security;
alter table public.sites             enable row level security;
alter table public.token_transactions enable row level security;

-- Profiles
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
create policy "own profile update" on public.profiles for update using (auth.uid() = id);

-- Sites
create policy "own sites select" on public.sites for select using (auth.uid() = user_id);
create policy "own sites insert" on public.sites for insert with check (auth.uid() = user_id);
create policy "own sites update" on public.sites for update using (auth.uid() = user_id);
create policy "own sites delete" on public.sites for delete using (auth.uid() = user_id);

-- Transactions
create policy "own tx select" on public.token_transactions for select using (auth.uid() = user_id);

-- ============================================================
-- INDEXES
-- ============================================================
create index if not exists idx_sites_user    on public.sites(user_id);
create index if not exists idx_sites_status  on public.sites(status);
create index if not exists idx_tx_user       on public.token_transactions(user_id);
create index if not exists idx_sites_expires on public.sites(deploy_expires_at) where deploy_expires_at is not null;
