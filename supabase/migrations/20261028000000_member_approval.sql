/*
  # Duyệt thành viên

  - is_member = true  -> đã được duyệt, vào được trang
  - is_member = false -> người mới, phải chờ quản trị viên duyệt
  - Người mới đăng ký mặc định is_member = false
*/

alter table public.profiles
  add column if not exists is_admin  boolean not null default false,
  add column if not exists is_member boolean not null default false;

-- Chỉ chủ tài khoản được sửa tên/ảnh. KHÔNG cho tự sửa is_member / is_admin.
grant select on public.profiles to anon, authenticated;
revoke update on public.profiles from authenticated;
grant update (full_name, avatar_url) on public.profiles to authenticated;

-- Admin được đổi is_member của người khác (để duyệt / gỡ)
drop policy if exists "Admins can update profiles" on public.profiles;
create policy "Admins can update profiles"
  on public.profiles for update to authenticated
  using (exists (select 1 from public.profiles a where a.id = auth.uid() and a.is_admin))
  with check (exists (select 1 from public.profiles a where a.id = auth.uid() and a.is_admin));
grant update (is_member) on public.profiles to authenticated;

-- ===== GIỮ NGUYÊN 13 THÀNH VIÊN HIỆN TẠI =====
-- Chạy riêng câu này 1 LẦN, TRƯỚC khi cho người mới đăng nhập.
-- Trước đó xem danh sách bằng: select id, email, full_name from public.profiles order by created_at;
update public.profiles set is_member = true;
