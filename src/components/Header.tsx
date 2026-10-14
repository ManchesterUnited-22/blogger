import { useEffect, useRef, useState } from 'react';
import { Newspaper, LogOut, UserRound } from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase, formatDate, getUserProfile } from '@/lib/supabase';

type Props = {
  user: User | null;
  onLoginClick: () => void;
  onProfileClick: ()=> void;
};


function UserMenu({ user, onLoginClick, onProfileClick }: { user: User | null; onLoginClick: () => void; onProfileClick: () => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  if (!user) {
    return (
      <button
        onClick={onLoginClick}
        className="rounded-full bg-gray-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-gray-700"
      >
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
      {avatarUrl ? <img src={avatarUrl} alt={name} referrerPolicy="no-referrer" className="h-full w-full object-cover" /> : name.charAt(0).toUpperCase()}
    </div>
  );

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
        </div>
      )}
    </div>
  );
}

export default function Header({ user, onLoginClick, onProfileClick }: Props) {
  return (
    <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-cyan-500">
            <Newspaper className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-gray-900">
            DuyTan<span className="text-orange-500">.</span>News
          </span>
        </div>

        <UserMenu user={user} onLoginClick={onLoginClick} onProfileClick={onProfileClick} />
      </div>
    </nav>
  );
}