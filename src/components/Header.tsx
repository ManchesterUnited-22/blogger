import { useEffect, useRef, useMemo, useState } from 'react';
import { LogOut, LogIn, UserRound, Trash2, Home, BookOpen, Users, Search, Sparkles, type LucideIcon } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase, formatDate, getUserProfile, deleteMyAccount } from '@/lib/supabase';
import { dateLine } from '@/lib/postMeta';
import type { Member } from '@/components/MembersSection';
/** Các mục trên thanh menu. id = id của section trong trang chủ (null = đầu trang). */
const NAV_ITEMS: { label: string; id: string | null; icon: LucideIcon }[] = [
  { label: 'Trang chủ', id: null, icon: Home },
  { label: 'Bài viết', id: 'feed', icon: BookOpen },
  
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
  members: Member[];
  postCounts: Record<string,number>;
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
const AVATAR_BG = ['bg-teal-500', 'bg-orange-500', 'bg-cyan-500', 'bg-violet-500', 'bg-pink-500', 'bg-amber-500'];

/** Bỏ dấu + hạ chữ thường để tìm "nguyen" ra được "Nguyễn". */
const fold = (s: string) =>
  s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/đ/g, 'd');

function MiniAvatar({ m, i, className }: { m: Member; i: number; className: string }) {
  const name = m.full_name || 'Thành viên';
  return (
    <span
      className={`${className} ${AVATAR_BG[i % AVATAR_BG.length]} flex shrink-0 items-center justify-center overflow-hidden rounded-full text-xs font-bold text-white`}
    >
      {m.avatar_url ? (
        <img
          src={m.avatar_url}
          alt={name}
          referrerPolicy="no-referrer"
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </span>
  );
}

function MembersPanel({
  sorted,
  postCounts,
  currentUserId,
}: {
  sorted: Member[];
  postCounts: Record<string, number>;
  currentUserId?: string;
}) {
  const [q, setQ] = useState('');
  const totalPosts = sorted.reduce((n, m) => n + (postCounts[m.id] ?? 0), 0);
  const query = fold(q.trim());
  const list = query ? sorted.filter((m) => fold(m.full_name || 'Thành viên').includes(query)) : sorted;

  return (
    <div className="rounded-2xl border border-violet-100 bg-white p-4 shadow-2xl shadow-violet-500/20">
      <div className="flex items-center gap-2">
        <Users className="h-4 w-4 text-violet-500" />
        <h3 className="font-display text-base font-extrabold text-gray-900">Cây bút đồng hành</h3>
        <span className="ml-auto text-xs font-semibold text-gray-500">
          {sorted.length} thành viên · {totalPosts} bài
        </span>
      </div>

      {sorted.length > 6 && (
        <div className="relative mt-3">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm thành viên..."
            className="w-full rounded-full border border-violet-200 bg-white py-2 pl-9 pr-4 text-sm text-gray-700 outline-none placeholder:text-gray-400 focus:border-fuchsia-400"
          />
        </div>
      )}

      <ul className="mt-3 max-h-80 space-y-0.5 overflow-y-auto pr-1">
        {list.length === 0 ? (
          <li className="py-6 text-center text-sm italic text-gray-500">Không tìm thấy thành viên.</li>
        ) : (
          list.map((m) => {
            const count = postCounts[m.id] ?? 0;
            const isMe = m.id === currentUserId;
            return (
              <li key={m.id} className="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-violet-50">
                <MiniAvatar m={m} i={sorted.indexOf(m)} className="h-10 w-10 text-sm" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-gray-900">
                    {m.full_name || 'Thành viên'}
                    {isMe && (
                      <span className="ml-2 rounded-full bg-yellow-300 px-2 py-0.5 text-[10px] font-extrabold text-gray-900">
                        Bạn
                      </span>
                    )}
                  </p>
                </div>
                <span className={`shrink-0 text-xs font-semibold ${count > 0 ? 'text-teal-600' : 'text-amber-600'}`}>
                  {count > 0 ? `${count} bài` : 'Cây bút mới ✨'}
                </span>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}

export default function Header({
  user,
  onLoginClick,
  onProfileClick,
  onAccountDeleted,
  onNavigate,
  members,
  postCounts,
}: Props) {
  const active = useActiveSection();
  const [membersOpen, setMembersOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Người đăng nhiều bài nhất đứng đầu
  const sorted = useMemo(
    () => [...members].sort((a, b) => (postCounts[b.id] ?? 0) - (postCounts[a.id] ?? 0)),
    [members, postCounts],
  );

  // Bấm ra ngoài thanh hoặc nhấn Esc thì đóng bảng
  useEffect(() => {
    if (!membersOpen) return;
    const onDown = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) setMembersOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMembersOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [membersOpen]);

  const linkClass = (id: string | null) =>
    `inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
      active === id
        ? 'bg-pop text-white shadow-md shadow-teal-500/30'
        : 'text-gray-600 hover:bg-violet-100 hover:text-violet-700'
    }`;

  const navButtons = NAV_ITEMS.map(({ label, id, icon: Icon }) => (
    <button
      key={label}
      onClick={() => {
        setMembersOpen(false);
        onNavigate(id);
      }}
      className={linkClass(id)}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  ));

  // Nút thành viên: 3 avatar xếp chồng + số lượng
  const membersButton = members.length > 0 && (
    <button
      onClick={() => setMembersOpen((o) => !o)}
      aria-expanded={membersOpen}
      className={`inline-flex shrink-0 items-center gap-2.5 rounded-full py-1.5 pl-2 pr-4 text-sm font-semibold transition-all ${
        membersOpen
          ? 'bg-pop text-white shadow-md shadow-teal-500/30'
          : 'text-gray-600 hover:bg-violet-100 hover:text-violet-700'
      }`}
    >
      <span className="flex -space-x-2">
        {sorted.slice(0, 3).map((m, i) => (
          <MiniAvatar key={m.id} m={m} i={i} className="h-7 w-7 ring-2 ring-white" />
        ))}
      </span>
      Thành viên
      <span
        className={`rounded-full px-1.5 text-xs font-bold ${
          membersOpen ? 'bg-white/25 text-white' : 'bg-violet-100 text-violet-700'
        }`}
      >
        {members.length}
      </span>
    </button>
  );

  return (
    <>
      {/* Dải trên cùng: giữ nguyên như cũ */}
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

      <nav ref={navRef} className="glass sticky top-0 z-50 border-b border-gray-200/70">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
          <button
            onClick={() => {
              setMembersOpen(false);
              onNavigate(null);
            }}
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

          <div className="hidden items-center gap-1 md:flex">
            {navButtons}
            {membersButton}
          </div>

          <UserMenu
            user={user}
            onLoginClick={onLoginClick}
            onProfileClick={onProfileClick}
            onAccountDeleted={onAccountDeleted}
          />
        </div>

        {/* Menu trên điện thoại */}
        <div className="flex items-center justify-around gap-1 overflow-x-auto border-t border-violet-100 px-3 py-2 md:hidden">
          {navButtons}
          {membersButton}
        </div>

        {/* Bảng thành viên thả xuống */}
        {membersOpen && (
          <div className="absolute left-3 right-3 top-full mt-2 md:left-1/2 md:right-auto md:w-[26rem] md:-translate-x-1/2">
            <MembersPanel sorted={sorted} postCounts={postCounts} currentUserId={user?.id} />
          </div>
        )}
      </nav>
    </>
  );
}