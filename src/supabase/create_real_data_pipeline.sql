-- ==========================================================
-- ShursunT AI — Real Data Pipeline Schema
-- Stores IPO Master Records, GMP Time-Series Snapshots,
-- Market Indices (Nifty 50, Sensex, India VIX), and News Sentiment
-- ==========================================================

-- 1. IPO Master Table
create table if not exists public.ipos (
    id uuid default gen_random_uuid() primary key,
    name text not null unique,
    symbol text,
    type text not null default 'mainboard' check (type in ('mainboard', 'sme')),
    status text not null default 'upcoming' check (status in ('open', 'upcoming', 'listed', 'closed')),
    issue_price_raw text not null,
    issue_price_min numeric,
    issue_price_max numeric,
    issue_size text,
    issue_size_cr numeric,
    lot_size integer,
    open_date text,
    close_date text,
    allotment_date text,
    listing_date text,
    listing_price numeric,
    gmp_current numeric default 0,
    gmp_percent numeric default 0,
    qib_multiple numeric default 0,
    nii_multiple numeric default 0,
    retail_multiple numeric default 0,
    employee_multiple numeric default 0,
    total_subscription numeric default 0,
    subscription_status text,
    rhp_url text,
    description text,
    financials jsonb default '{}'::jsonb,
    source text not null default 'ipo-guru',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Index for quick status/type filtering
create index if not exists idx_ipos_status_type on public.ipos (status, type);
create index if not exists idx_ipos_listing_date on public.ipos (listing_date);

-- 2. Time-Series GMP Snapshots
-- Stores daily / multi-day snapshots of Grey Market Premium to compute GMP Velocity (rate of change)
create table if not exists public.ipo_gmp_snapshots (
    id uuid default gen_random_uuid() primary key,
    ipo_id uuid references public.ipos(id) on delete cascade,
    ipo_name text not null,
    gmp_value numeric not null,
    gmp_percent numeric not null default 0,
    source text not null default 'ipo-guru',
    snapshot_date date not null default current_date,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    constraint uq_ipo_snapshot_daily unique (ipo_name, snapshot_date)
);

create index if not exists idx_ipo_gmp_snapshots_name_date on public.ipo_gmp_snapshots (ipo_name, snapshot_date desc);

-- 3. Market Indices Table (Nifty 50, Sensex, India VIX, Sector Indices)
create table if not exists public.market_indices (
    symbol text primary key,
    name text not null,
    current_value numeric not null,
    change_points numeric not null default 0,
    change_percent numeric not null default 0,
    high_24h numeric,
    low_24h numeric,
    source text not null default 'nse-public',
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Market News & Financial Sentiment Table
create table if not exists public.market_news (
    id uuid default gen_random_uuid() primary key,
    title text not null,
    description text,
    url text unique,
    source text not null,
    published_at timestamp with time zone not null,
    sentiment_score numeric not null default 0 check (sentiment_score >= -1.0 and sentiment_score <= 1.0),
    sentiment_label text not null default 'NEUTRAL' check (sentiment_label in ('BULLISH', 'BEARISH', 'NEUTRAL')),
    related_symbols text[] default array[]::text[],
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create index if not exists idx_market_news_published on public.market_news (published_at desc);

-- 5. Row Level Security (RLS) Policies
alter table public.ipos enable row level security;
alter table public.ipo_gmp_snapshots enable row level security;
alter table public.market_indices enable row level security;
alter table public.market_news enable row level security;

-- Public Read Policies
drop policy if exists "Allow public read access on ipos" on public.ipos;
create policy "Allow public read access on ipos" on public.ipos for select using (true);

drop policy if exists "Allow public read access on ipo_gmp_snapshots" on public.ipo_gmp_snapshots;
create policy "Allow public read access on ipo_gmp_snapshots" on public.ipo_gmp_snapshots for select using (true);

drop policy if exists "Allow public read access on market_indices" on public.market_indices;
create policy "Allow public read access on market_indices" on public.market_indices for select using (true);

drop policy if exists "Allow public read access on market_news" on public.market_news;
create policy "Allow public read access on market_news" on public.market_news for select using (true);

-- Service Role Write Policies
drop policy if exists "Allow service role write on ipos" on public.ipos;
create policy "Allow service role write on ipos" on public.ipos for all using (true) with check (true);

drop policy if exists "Allow service role write on ipo_gmp_snapshots" on public.ipo_gmp_snapshots;
create policy "Allow service role write on ipo_gmp_snapshots" on public.ipo_gmp_snapshots for all using (true) with check (true);

drop policy if exists "Allow service role write on market_indices" on public.market_indices;
create policy "Allow service role write on market_indices" on public.market_indices for all using (true) with check (true);

drop policy if exists "Allow service role write on market_news" on public.market_news;
create policy "Allow service role write on market_news" on public.market_news for all using (true) with check (true);

