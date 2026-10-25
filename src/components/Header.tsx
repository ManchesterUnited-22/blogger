import { useEffect, useRef, useState } from 'react';
import { Newspaper, LogOut, LogIn, UserRound, Trash2, Home, BookOpen, Users, type LucideIcon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase, formatDate, getUserProfile, deleteMyAccount } from '@/lib/supabase';

/** Các mục trên thanh menu. id = id của section trong trang chủ (null = đầu trang). */
const NAV_ITEMS: { label: string; id: string | null; icon: LucideIcon }[] = [
  { label: 'Trang chủ', id: null, icon: Home },
  { label: 'Bài viết', id: 'feed', icon: BookOpen },
  { label: 'Thành viên', id: 'members', icon: Users },
];

/** Theo dõi section nào đang nằm trong màn hình để tô sáng mục menu tương ứng. */
function useActiveSection(): string | null {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => {
      // Duyệt từ dưới lên: section nào có đỉnh đã vượt quá vạch 120px thì là section đang xem
      let current: string | null = null;
      for (const item of NAV_ITEMS) {
        if (!item.id) continue;
        const el = document.getElementById(item.id);
        if (el && el.getBoundingClientRect().top <= 120) current = item.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return active;
}

type Props = {
  user: User | null;
  onLoginClick: () => void;
  onProfileClick: () => void;
  onAccountDeleted: () => void;
  onNavigate: (sectionId: string | null) => void;
};

function UserMenu({
  user,
  onLoginClick,
  onProfileClick,
  onAccountDeleted,
}: {
  user: User | null;
  onLoginClick: () => void;
  onProfileClick: () => void;
  onAccountDeleted: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setConfirming(false);
        setDeleteError(null);
      }
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  if (!user) {
    return (
            <button
        onClick={onLoginClick}
        className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2.5 text-base font-semibold text-white shadow-md shadow-teal-500/25 transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/30"
      >
        <LogIn className="h-5 w-5" />
        Đăng nhập
      </button>
    );
  }

  const { name, email, avatarUrl, provider } = getUserProfile(user);
  const providerLabel: Record<string, string> = { google: 'Google', email: 'Email' };
  const avatar = (size: string) => (
    <div
      className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 font-bold text-white`}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );

  const handleDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    const { error } = await deleteMyAccount();
    setDeleting(false);
    if (error) {
      setDeleteError(error.message || 'Không thể xóa tài khoản, vui lòng thử lại.');
      return;
    }
    setOpen(false);
    setConfirming(false);
    onAccountDeleted();
  };

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="Tài khoản" className="rounded-full ring-2 ring-white shadow">
        {avatar('h-11 w-11 text-base')}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-gray-100">
          <div className="flex items-center gap-3">
            {avatar('h-12 w-12 text-lg')}
            <div className="min-w-0">
              <p className="truncate font-bold text-gray-900">{name}</p>
              {email && <p className="truncate text-xs text-gray-500">{email}</p>}
            </div>
          </div>
          <p className="mt-3 text-xs text-gray-400">
            Đăng nhập bằng {providerLabel[provider] ?? provider} · Tham gia: {formatDate(user.created_at)}
          </p>
          <button
            onClick={() => {
              onProfileClick();
              setOpen(false);
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-2 text-sm font-medium text-white hover:bg-teal-600"
          >
            <UserRound className="h-4 w-4" /> Trang cá nhân
          </button>
          <button
            onClick={() => {
              supabase.auth.signOut();
              setOpen(false);
            }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gray-100 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>

          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Xóa tài khoản
            </button>
          ) : (
            <div className="mt-2 rounded-xl border border-red-200 bg-red-50 p-3">
              <p className="text-xs text-red-700">
                Tài khoản và các bài viết của bạn sẽ bị xóa vĩnh viễn, không thể khôi phục. Bạn chắc chắn chứ?
              </p>
              {deleteError && <p className="mt-2 text-xs font-medium text-red-800">{deleteError}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => {
                    setConfirming(false);
                    setDeleteError(null);
                  }}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-white py-1.5 text-xs font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-lg bg-red-600 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
                >
                  {deleting ? 'Đang xóa...' : 'Xóa vĩnh viễn'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function Header({
  user,
  onLoginClick,
  onProfileClick,
  onAccountDeleted,
  onNavigate,
}: Props) {
  const active = useActiveSection();

  const linkClass = (id: string | null) =>
    `relative rounded-full px-5 py-2.5 text-base font-semibold transition-colors ${
      active === id ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
    }`;

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-4">
        {/* Logo: bấm để về trang chủ */}
        <button onClick={() => onNavigate(null)} aria-label="Về trang chủ" className="flex shrink-0 items-center gap-2">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500">
            <Newspaper className="h-6 w-6 text-white" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-gray-900">
            VTD<span className="text-orange-500">.</span>News
          </span>
        </button>

        {/* Menu điều hướng (màn hình từ md trở lên) */}
        <div className="hidden items-center gap-2 md:flex">
          {NAV_ITEMS.map((item) => (
            <button key={item.label} onClick={() => onNavigate(item.id)} className={linkClass(item.id)}>
              {item.label}
            </button>
          ))}
        </div>

        <UserMenu
          user={user}
          onLoginClick={onLoginClick}
          onProfileClick={onProfileClick}
          onAccountDeleted={onAccountDeleted}
        />
      </div>

      {/* Menu điều hướng trên điện thoại */}
      <div className="flex items-center gap-1 overflow-x-auto border-t border-gray-100 px-4 py-2 md:hidden">
        {NAV_ITEMS.map((item) => (
          <button key={item.label} onClick={() => onNavigate(item.id)} className={`shrink-0 ${linkClass(item.id)}`}>
            {item.label}
          </button>
        ))}
      </div>
    </nav>
  );
}