import { useEffect, useRef, useState } from 'react';
import { LogOut, LogIn, UserRound, Trash2, Home, BookOpen, Users, Sparkles, type LucideIcon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase, formatDate, getUserProfile, deleteMyAccount } from '@/lib/supabase';
import { dateLine } from '@/lib/postMeta';

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
      // Section nào có đỉnh đã vượt quá vạch 120px thì là section đang xem
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
        className="bg-pop-anim inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-teal-500/30 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-teal-500/40"
      >
        <LogIn className="h-4 w-4" />
        Đăng nhập
      </button>
    );
  }

  const { name, email, avatarUrl, provider } = getUserProfile(user);
  const providerLabel: Record<string, string> = { google: 'Google', email: 'Email' };
  const avatar = (size: string) => (
    <div
      className={`${size} flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-500 font-bold text-white`}
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
      {/* Avatar + tên tài khoản */}
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={`Tài khoản ${name}`}
        aria-expanded={open}
        className="flex items-center gap-2 rounded-full border border-teal-200 bg-white/80 py-1 pl-1 pr-3.5 shadow-sm transition hover:border-cyan-300 hover:bg-white hover:shadow-md sm:gap-2.5 sm:pr-4"
      >
        {avatar('h-9 w-9 text-sm')}
        <span className="max-w-[84px] truncate text-sm font-semibold text-gray-800 sm:max-w-[160px]">
          {name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 rounded-2xl border border-violet-100 bg-white p-4 shadow-2xl shadow-violet-500/20">
          <div className="flex items-center gap-3">
            {avatar('h-12 w-12 text-lg')}
            <div className="min-w-0">
              <p className="truncate font-serif text-base font-bold text-gray-900">{name}</p>
              {email && <p className="truncate text-xs text-gray-500">{email}</p>}
            </div>
          </div>
          <p className="mt-3 border-t border-violet-100 pt-3 text-xs text-gray-500">
            Đăng nhập bằng {providerLabel[provider] ?? provider} · Tham gia: {formatDate(user.created_at)}
          </p>
          <button
            onClick={() => {
              onProfileClick();
              setOpen(false);
            }}
            className="bg-pop mt-3 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-500/25 transition-all hover:-translate-y-0.5"
          >
            <UserRound className="h-4 w-4" /> Trang cá nhân
          </button>
          <button
            onClick={() => {
              supabase.auth.signOut();
              setOpen(false);
            }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
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
                  className="flex-1 rounded-lg bg-white py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
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

  // Mục đang xem: nền gradient + chữ trắng; mục còn lại: chữ xám, rê chuột thì ngả xanh rêu
  const linkClass = (id: string | null) =>
    `inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
      active === id
        ? 'bg-pop text-white shadow-md shadow-teal-500/30'
        : 'text-gray-600 hover:bg-violet-100 hover:text-violet-700'
    }`;

  const navButtons = NAV_ITEMS.map(({ label, id, icon: Icon }) => (
    <button key={label} onClick={() => onNavigate(id)} className={linkClass(id)}>
      <Icon className="h-4 w-4" />
      {label}
    </button>
  ));

  return (
    <>
      {/* Dải trên cùng: nền nhạt, ngày + chữ chạy ngang */}
      <div className="overflow-hidden border-b border-teal-100/70 bg-soft-gradient text-gray-700">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-2">
          <span className="shrink-0 rounded-full bg-white px-3 py-0.5 text-[11px] font-bold tracking-wide text-teal-700 shadow-sm">
            Hôm nay
          </span>
          <span className="shrink-0 text-sm font-semibold">{dateLine()}</span>
          <div className="relative hidden min-w-0 flex-1 overflow-hidden md:block">
            <div className="flex w-max animate-marquee gap-8 whitespace-nowrap text-xs font-medium text-gray-500">
              {[0, 1].map((k) => (
                <span key={k} className="flex gap-8">
                  <span>Nhật ký Quy Nhơn</span>
                  <span className="text-teal-300">✦</span>
                  <span>Biển Nam Trung Bộ</span>
                  <span className="text-teal-300">✦</span>
                  <span>Thực tập nhận thức</span>
                  <span className="text-teal-300">✦</span>
                  <span>15–18/10/2026</span>
                  <span className="text-teal-300">✦</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <nav className="glass sticky top-0 z-50 border-b border-gray-200/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          {/* Logo: ô gradient + chữ chuyển sắc */}
          <button
            onClick={() => onNavigate(null)}
            aria-label="Về trang chủ"
            className="group flex shrink-0 items-center gap-2.5"
          >
            <span className="bg-pop-anim flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-lg shadow-teal-500/30 transition-transform duration-300 group-hover:rotate-12">
              <Sparkles className="h-5 w-5" />
            </span>
            <span className="font-display text-2xl font-extrabold tracking-tight text-gray-900">
              VTD<span className="text-pop">.News</span>
            </span>
          </button>

          {/* Menu giữa (từ md trở lên) */}
          <div className="hidden items-center gap-1 md:flex">{navButtons}</div>

          <UserMenu
            user={user}
            onLoginClick={onLoginClick}
            onProfileClick={onProfileClick}
            onAccountDeleted={onAccountDeleted}
          />
        </div>

        {/* Menu trên điện thoại: một hàng dưới logo, vuốt ngang nếu thiếu chỗ */}
        <div className="flex items-center justify-around gap-1 overflow-x-auto border-t border-violet-100 px-3 py-2 md:hidden">
          {navButtons}
        </div>
      </nav>
    </>
  );
}