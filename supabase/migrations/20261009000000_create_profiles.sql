/*
  # Bảng profiles – đồng bộ hồ sơ từ Google / Facebook / email

  - Mỗi user trong auth.users có 1 dòng trong public.profiles
  - Tự động tạo khi đăng ký, tự động cập nhật tên/ảnh mỗi lần đăng nhập lại
  - Ai cũng đọc được (để hiển thị tên + avatar), chỉ chủ tài khoản được sửa
*/

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  avatar_url text,
  email text,
  provider text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update their own profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

create or replace function public.sync_profile_from_auth()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  meta jsonb := coalesce(new.raw_user_meta_data, '{}'::jsonb);
begin
  insert into public.profiles (id, full_name, avatar_url, email, provider)
  values (
    new.id,
    coalesce(meta->>'full_name', meta->>'name', split_part(new.email, '@', 1)),
    coalesce(meta->>'avatar_url', meta->>'picture', meta #>> '{picture,data,url}'),
    new.email,
    coalesce(new.raw_app_meta_data->>'provider', 'email')
  )
  on conflict (id) do update set
    full_name  = coalesce(excluded.full_name, public.profiles.full_name),
    avatar_url = coalesce(excluded.avatar_url, public.profiles.avatar_url),
    email      = coalesce(excluded.email, public.profiles.email),
    provider   = excluded.provider,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_sync_profile on auth.users;
create trigger on_auth_user_sync_profile
  after insert or update on auth.users
  for each row execute function public.sync_profile_from_auth();

-- Tạo profile cho các user đã tồn tại
insert into public.profiles (id, full_name, avatar_url, email, provider)
select id,
       coalesce(raw_user_meta_data->>'full_name', raw_user_meta_data->>'name', split_part(email, '@', 1)),
       coalesce(raw_user_meta_data->>'avatar_url', raw_user_meta_data->>'picture'),
       email,
       coalesce(raw_app_meta_data->>'provider', 'email')
from auth.users
on conflict (id) do nothing;