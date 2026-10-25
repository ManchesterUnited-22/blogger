import { useEffect, useRef, useState } from 'react';
import { LogOut, LogIn, UserRound, Trash2, Home, BookOpen, Users, type LucideIcon } from 'lucide-react';
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
        className="skew-sting inline-flex items-center gap-2 bg-teal-600 px-4 py-2.5 text-sm font-bold uppercase tracking-widest text-white shadow-[4px_4px_0_0_#ffe600] transition-all hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-teal-500 hover:shadow-[2px_2px_0_0_#ffe600] sm:px-5"
      >
        <span className="unskew-sting inline-flex items-center gap-2">
          <LogIn className="h-4 w-4" />
          Đăng nhập
        </span>
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
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="Tài khoản"
        className="rounded-full ring-2 ring-teal-500 ring-offset-2 ring-offset-ink transition hover:ring-volt"
      >
        {avatar('h-11 w-11 text-base')}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-64 rounded-md border border-gray-900 bg-white p-4 shadow-xl">
          <div className="flex items-center gap-3">
            {avatar('h-12 w-12 text-lg')}
            <div className="min-w-0">
              <p className="truncate font-serif text-lg font-bold text-gray-900">{name}</p>
              {email && <p className="truncate text-xs text-gray-500">{email}</p>}
            </div>
          </div>
          <p className="mt-3 border-t border-gray-200 pt-3 text-xs text-gray-500">
            Đăng nhập bằng {providerLabel[provider] ?? provider} · Tham gia: {formatDate(user.created_at)}
          </p>
          <button
            onClick={() => {
              onProfileClick();
              setOpen(false);
            }}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-sm bg-gray-900 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-600"
          >
            <UserRound className="h-4 w-4" /> Trang cá nhân
          </button>
          <button
            onClick={() => {
              supabase.auth.signOut();
              setOpen(false);
            }}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-sm border border-gray-300 bg-white py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-900 hover:text-gray-900"
          >
            <LogOut className="h-4 w-4" /> Đăng xuất
          </button>

          {!confirming ? (
            <button
              onClick={() => setConfirming(true)}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-sm py-2 text-sm font-medium text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" /> Xóa tài khoản
            </button>
          ) : (
            <div className="mt-2 rounded-md border border-red-200 bg-red-50 p-3">
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
                  className="flex-1 rounded-sm bg-white py-1.5 text-xs font-semibold text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex-1 rounded-sm bg-red-600 py-1.5 text-xs font-semibold text-white hover:bg-red-700 disabled:opacity-60"
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

  // Mục đang xem: chữ trắng + vạch đỏ vát chéo dưới chân; mục còn lại: chữ xám, rê chuột thì sáng lên
  const linkClass = (id: string | null) =>
    `relative inline-flex shrink-0 items-center gap-2 px-4 py-2.5 text-sm font-bold uppercase tracking-widest transition-colors after:absolute after:inset-x-3 after:bottom-0 after:h-[3px] after:origin-left after:-skew-x-[20deg] after:bg-teal-500 after:transition-transform after:duration-300 ${
      active === id
        ? 'text-white after:scale-x-100'
        : 'text-gray-400 after:scale-x-0 hover:text-white hover:after:scale-x-100'
    }`;

  const navButtons = NAV_ITEMS.map(({ label, id, icon: Icon }) => (
    <button key={label} onClick={() => onNavigate(id)} className={linkClass(id)}>
      <Icon className={`h-4 w-4 ${active === id ? 'text-teal-500' : 'text-gray-500'}`} />
      {label}
    </button>
  ));

  return (
    <>
      {/* Dải chữ chạy ngang: đỏ rực, chữ trắng, đúng kiểu băng rôn */}
      <div className="overflow-hidden bg-teal-600 text-white">
        <div className="mx-auto flex max-w-6xl items-center gap-4 px-6 py-1.5">
          <span className="skew-sting shrink-0 bg-volt px-2.5 py-0.5 text-[11px] font-black uppercase tracking-widest text-ink">
            <span className="unskew-sting inline-block">Hôm nay</span>
          </span>
          <span className="shrink-0 font-serif text-base font-semibold uppercase leading-none tracking-wide sm:text-lg">
            {dateLine()}
          </span>
          <div className="relative hidden min-w-0 flex-1 overflow-hidden md:block">
            <div className="flex w-max animate-marquee gap-10 whitespace-nowrap text-xs font-bold uppercase tracking-[0.25em] text-white/85">
              {[0, 1].map((k) => (
                <span key={k} className="flex gap-10">
                  <span>Nhật ký Quy Nhơn</span>
                  <span className="text-volt">///</span>
                  <span>Biển Nam Trung Bộ</span>
                  <span className="text-volt">///</span>
                  <span>Thực tập nhận thức</span>
                  <span className="text-volt">///</span>
                  <span>15–18/10/2026</span>
                  <span className="text-volt">///</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <nav className="sticky top-0 z-50 border-b border-white/10 bg-ink/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          {/* Logo: chữ Anton in hoa, dấu chấm đỏ nhấp nháy khi rê chuột */}
          <button
            onClick={() => onNavigate(null)}
            aria-label="Về trang chủ"
            className="group flex shrink-0 items-center gap-2.5"
          >
            <span
              aria-hidden
              className="skew-sting inline-block h-7 w-3 bg-teal-500 transition-all duration-300 group-hover:w-5 group-hover:bg-volt"
            />
            <span className="font-display text-3xl uppercase leading-none tracking-wide text-white">
              VTD<span className="text-teal-500 transition-colors group-hover:text-volt">.</span>News
            </span>
          </button>

          {/* Menu giữa (từ md trở lên) */}
          <div className="hidden items-center md:flex">{navButtons}</div>

          <UserMenu
            user={user}
            onLoginClick={onLoginClick}
            onProfileClick={onProfileClick}
            onAccountDeleted={onAccountDeleted}
          />
        </div>

        {/* Menu trên điện thoại: một hàng dưới logo, vuốt ngang nếu thiếu chỗ */}
        <div className="flex items-center justify-around overflow-x-auto border-t border-white/10 md:hidden">
          {navButtons}
        </div>
      </nav>
    </>
  );
}