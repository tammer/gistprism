-- Table: read_posts
-- Stores which articles each user has marked as "Done" (read).
create table if not exists public.read_posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  post_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, post_id)
);

-- Index for fast lookups by user_id when loading read IDs
create index if not exists read_posts_user_id_idx on public.read_posts (user_id);

-- RLS
alter table public.read_posts enable row level security;

-- Users can only select their own read posts
create policy "Users can select own read_posts"
  on public.read_posts for select
  using (auth.uid() = user_id);

-- Users can only insert read_posts for themselves
create policy "Users can insert own read_posts"
  on public.read_posts for insert
  with check (auth.uid() = user_id);
