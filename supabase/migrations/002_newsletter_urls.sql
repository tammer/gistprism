-- Table: newsletter_urls
-- Per-user list of newsletter URLs to display on the home page.
create table if not exists public.newsletter_urls (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  url text not null,
  created_at timestamptz not null default now(),
  unique (user_id, url)
);

-- Index for fast lookups by user_id when loading the list
create index if not exists newsletter_urls_user_id_idx on public.newsletter_urls (user_id);

-- RLS
alter table public.newsletter_urls enable row level security;

-- Users can only select their own newsletter URLs
create policy "Users can select own newsletter_urls"
  on public.newsletter_urls for select
  using (auth.uid() = user_id);

-- Users can only insert newsletter_urls for themselves
create policy "Users can insert own newsletter_urls"
  on public.newsletter_urls for insert
  with check (auth.uid() = user_id);

-- Users can only delete their own newsletter URLs
create policy "Users can delete own newsletter_urls"
  on public.newsletter_urls for delete
  using (auth.uid() = user_id);
