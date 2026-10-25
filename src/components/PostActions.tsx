import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Check, Facebook, Heart, Link2, Share2 } from 'lucide-react';
import type { Post } from '@/lib/posts';
import { fetchLikes, likePost, subscribeLikes, unlikePost } from '@/lib/likes';

/** Link riêng của bài: https://trang-cua-ban/?post=<id> */
function postUrl(id: string): string {
  const u = new URL(window.location.origin + window.location.pathname);
  u.searchParams.set('post', id);
  return u.toString();
}

async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Trình duyệt cũ / không có HTTPS
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  }
}

const isMobile = () => /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

type Props = { post: Post; user: User | null; onLoginClick: () => void };

export default function PostActions({ post, user, onLoginClick }: Props) {
  const [likedBy, setLikedBy] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const noticeTimer = useRef<ReturnType<typeof setTimeout>>();

  const liked = !!user && likedBy.includes(user.id);
  const url = postUrl(post.id);

  const flash = (msg: string) => {
    setNotice(msg);
    clearTimeout(noticeTimer.current);
    noticeTimer.current = setTimeout(() => setNotice(null), 3000);
  };

  // Tải lượt thích
  useEffect(() => {
    let alive = true;
    setLikedBy([]);
    fetchLikes(post.id)
      .then((ids) => alive && setLikedBy(ids))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [post.id]);

  // Realtime
  useEffect(
    () =>
      subscribeLikes(post.id, {
        onAdd: (uid) => setLikedBy((p) => (p.includes(uid) ? p : [...p, uid])),
        onRemove: (uid) => setLikedBy((p) => p.filter((x) => x !== uid)),
      }),
    [post.id],
  );

  // Bấm ra ngoài thì đóng menu chia sẻ
  useEffect(() => {
    if (!menuOpen) return;
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [menuOpen]);

  const toggleLike = async () => {
    if (!user) {
      onLoginClick();
      return;
    }
    if (busy) return;
    setBusy(true);
    const was = liked;
    // Cập nhật ngay cho mượt, lỗi thì hoàn lại
    setLikedBy((p) => (was ? p.filter((x) => x !== user.id) : p.includes(user.id) ? p : [...p, user.id]));
    try {
      if (was) await unlikePost(post.id, user.id);
      else await likePost(post.id, user.id);
    } catch {
      setLikedBy((p) => (was ? [...p, user.id] : p.filter((x) => x !== user.id)));
      flash('Không thực hiện được, vui lòng thử lại.');
    } finally {
      setBusy(false);
    }
  };

  const shareFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
      '_blank',
      'noopener,noreferrer,width=600,height=500',
    );
    setMenuOpen(false);
  };

  const shareZalo = async () => {
    setMenuOpen(false);
    // Điện thoại: mở bảng chia sẻ của máy, trong đó có Zalo
    if (isMobile() && navigator.share) {
      try {
        await navigator.share({ title: post.title || 'VTD.News', url });
        return;
      } catch (e) {
        if ((e as Error).name === 'AbortError') return; // người dùng tự đóng
      }
    }
    // Máy tính: sao chép link rồi mở Zalo Web để dán
    await copyText(url);
    flash('Đã sao chép liên kết, hãy dán vào Zalo.');
    window.open('https://chat.zalo.me/', '_blank', 'noopener,noreferrer');
  };

  const copyLink = async () => {
    const ok = await copyText(url);
    flash(ok ? 'Đã sao chép liên kết.' : 'Không sao chép được, hãy copy từ thanh địa chỉ.');
    setMenuOpen(false);
  };

  return (
    <div className="mt-10 border-t border-gray-300 pt-5">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={toggleLike}
          aria-pressed={liked}
          className={`inline-flex items-center gap-2 rounded-sm border px-5 py-2 text-sm font-bold uppercase tracking-widest transition-all active:scale-95 ${
            liked
              ? 'border-rose-600 bg-rose-50 text-rose-600'
              : 'border-gray-900 bg-white text-gray-900 hover:bg-rose-50 hover:text-rose-600'
          }`}
        >
          <Heart className={`h-5 w-5 transition-transform ${liked ? 'scale-110 fill-rose-500 text-rose-500' : ''}`} />
          {liked ? 'Đã thích' : 'Thích'}
          <span className="font-serif font-black tabular-nums text-gray-900">· {likedBy.length}</span>
        </button>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((o) => !o)}
            aria-expanded={menuOpen}
            className="inline-flex items-center gap-2 rounded-sm border border-gray-900 bg-white px-5 py-2 text-sm font-bold uppercase tracking-widest text-gray-900 transition-all hover:bg-teal-50 hover:text-teal-700"
          >
            <Share2 className="h-5 w-5" />
            Chia sẻ
          </button>

          {menuOpen && (
            <div className="absolute bottom-full left-0 z-20 mb-2 w-56 overflow-hidden rounded-md border border-gray-900 bg-white py-1 shadow-[4px_4px_0_0_#111827]">
              <button
                type="button"
                onClick={shareFacebook}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-teal-50/60"
              >
                <Facebook className="h-5 w-5 text-[#1877F2]" />
                Facebook
              </button>
              <button
                type="button"
                onClick={shareZalo}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-teal-50/60"
              >
                <span className="flex h-5 w-5 items-center justify-center rounded bg-[#0068FF] text-[9px] font-extrabold text-white">
                  Z
                </span>
                Zalo
              </button>
              <button
                type="button"
                onClick={copyLink}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-gray-700 hover:bg-teal-50/60"
              >
                <Link2 className="h-5 w-5 text-gray-500" />
                Sao chép liên kết
              </button>
            </div>
          )}
        </div>

        {notice && (
          <span className="inline-flex items-center gap-1.5 text-sm text-teal-600">
            <Check className="h-4 w-4" />
            {notice}
          </span>
        )}
      </div>
    </div>
  );
}