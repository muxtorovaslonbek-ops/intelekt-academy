create extension if not exists "uuid-ossp";

create table if not exists public.profiles (
  id uuid primary key default uuid_generate_v4(),
  first_name text,
  last_name text,
  phone_number text,
  email text,
  telegram_handle text,
  role text default 'student' check (role in ('student','admin')),
  status text default 'pending' check (status in ('pending','approved','rejected')),
  avatar_url text,
  bio text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.courses (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  category text,
  level text,
  duration text,
  lessons_count integer default 0,
  rating numeric default 5,
  instructor text,
  description text,
  thumbnail text,
  status text default 'active' check (status in ('active','draft')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.lessons (
  id uuid primary key default uuid_generate_v4(),
  course_id uuid references public.courses(id) on delete cascade,
  course_name text,
  title text not null,
  description text,
  duration text,
  bunny_video_id text,
  library_id text,
  video_url text,
  video_name text,
  pdf_url text,
  pdf_name text,
  image_url text,
  image_name text,
  attachments jsonb default '[]'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.announcements (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  message text not null,
  category text default 'important' check (category in ('important','news','system','update')),
  author text,
  is_pinned boolean default false,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists public.feedback (
  id uuid primary key default uuid_generate_v4(),
  user_name text,
  user_email text,
  user_phone text,
  user_telegram text,
  subject text,
  message text not null,
  rating integer,
  status text default 'new' check (status in ('new','reviewed','resolved')),
  admin_reply text,
  admin_replied_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists courses_status_idx on public.courses(status);
create index if not exists lessons_course_id_idx on public.lessons(course_id);

-- The app uses its own approval flow and does not require Supabase Auth for
-- the admin account, so the public client needs explicit table policies.
alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.lessons enable row level security;
alter table public.announcements enable row level security;
alter table public.feedback enable row level security;

drop policy if exists profiles_public_access on public.profiles;
create policy profiles_public_access on public.profiles for all to anon, authenticated using (true) with check (true);
drop policy if exists courses_public_access on public.courses;
create policy courses_public_access on public.courses for all to anon, authenticated using (true) with check (true);
drop policy if exists lessons_public_access on public.lessons;
create policy lessons_public_access on public.lessons for all to anon, authenticated using (true) with check (true);
drop policy if exists announcements_public_access on public.announcements;
create policy announcements_public_access on public.announcements for all to anon, authenticated using (true) with check (true);
drop policy if exists feedback_public_access on public.feedback;
create policy feedback_public_access on public.feedback for all to anon, authenticated using (true) with check (true);

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do update set public = true;

insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do update set public = true;

drop policy if exists avatars_public_access on storage.objects;
create policy avatars_public_access on storage.objects for all to anon, authenticated
using (bucket_id in ('avatars', 'media'))
with check (bucket_id in ('avatars', 'media'));
