import { Clock, LogOut, RefreshCw } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase, getUserProfile } from '@/lib/supabase';

/** Màn hình cho người mới đăng nhập, chưa được quản trị viên duyệt. */
export default function PendingApproval({ user }: { user: User }) {
  const { name, email, avatarUrl } = getUserProfile(user);

  return (
    <div className="flex min-h-screen items-center justify-center bg-paper px-6">
      <div className="w-full max-w-md rounded-3xl border border-violet-100 bg-white p-8 text-center shadow-2xl shadow-violet-500/10">
        <span className="bg-pop mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-lg shadow-teal-500/30">
          <Clock className="h-7 w-7" />
        </span>

        <h1 className="mt-5 font-display text-2xl font-extrabold text-gray-900">Đang chờ duyệt</h1>
        <p className="mt-2 text-sm leading-relaxed text-gray-600">
          Tài khoản của bạn đã được ghi nhận. Quản trị viên cần xác nhận thì bạn mới vào được trang. Vui lòng quay lại
          sau, hoặc liên hệ quản trị viên để được duyệt nhanh hơn.
        </p>

        <div className="mt-6 flex items-center gap-3 rounded-2xl bg-violet-50 px-4 py-3 text-left">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-500 font-bold text-white">
            {avatarUrl ? (
              <img src={avatarUrl} alt={name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase()
            )}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-bold text-gray-900">{name}</p>
            {email && <p className="truncate text-xs text-gray-500">{email}</p>}
          </div>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <button
            onClick={() => window.location.reload()}
            className="bg-pop flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-500/25"
          >
            <RefreshCw className="h-4 w-4" /> Kiểm tra lại
          </button>
          <button
            onClick={() => supabase.auth.signOut()}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white py-2.5 text-sm font-semibold text-gray-700 hover:bg-violet-50"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>
        </div>
      </div>
    </div>
  );
}
