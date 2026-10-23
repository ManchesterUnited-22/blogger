import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Loader2, MessageCircle, Send, Smile, Trash2 } from 'lucide-react';
import { getUserProfile } from '@/lib/supabase';
import { MAX_COMMENT, addComment, deleteComment, fetchComments, type Comment } from '@/lib/comments';

const EMOJIS = [
  '😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😎', '🤩', '🥳',
  '😋', '😅', '🥹', '😇', '🤭', '😜', '🤗', '🤔', '🙄', '😴',
  '😢', '😭', '😡', '😱', '👍', '👎', '👏', '🙌', '🙏', '💪',
  '👌', '✌️', '🤝', '❤️', '🧡', '💛', '💚', '💙', '💜', '🔥',
  '✨', '🎉', '💯', '🌟', '🌸', '🌈', '☀️', '🌊', '🏖️', '🍜',
  '☕', '🍀',
];

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'Vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

type Props = {
  postId: string;
  postOwnerId: string;
  user: User | null;
  onLoginClick: () => void;
};

export default function CommentSection({ postId, postOwnerId, user, onLoginClick }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [emojiOpen, setEmojiOpen] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    fetchComments(postId)
      .then((c) => alive && setComments(c))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Lỗi tải bình luận.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [postId]);

  // Chèn emoji đúng vị trí con trỏ trong ô nhập
  const insertEmoji = (emoji: string) => {
    const el = areaRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);
    if (next.length > MAX_COMMENT) return;
    setText(next);
    requestAnimationFrame(() => {
      el?.focus();
      const pos = start + emoji.length;
      el?.setSelectionRange(pos, pos);
    });
  };

  const handleSend = async () => {
    if (!user || sending || !text.trim()) return;
    setError(null);
    setSending(true);
    try {
      const c = await addComment(postId, user, text);
      setComments((prev) => [...prev, c]);
      setText('');
      setEmojiOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gửi bình luận thất bại.');
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async (c: Comment) => {
    if (!window.confirm('Xóa bình luận này?')) return;
    try {
      await deleteComment(c.id);
      setComments((prev) => prev.filter((x) => x.id !== c.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xóa bình luận thất bại.');
    }
  };

  const me = user ? getUserProfile(user) : null;

  return (
    <section className="mt-12 border-t border-gray-100 pt-8">
      <h2 className="flex items-center gap-2 text-xl font-extrabold text-gray-900">
        <MessageCircle className="h-5 w-5 text-teal-500" />
        Bình luận ({comments.length})
      </h2>

      {/* Ô nhập */}
      {user && me ? (
        <div className="mt-5 flex gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-sm font-bold text-white">
            {me.avatarUrl ? (
              <img src={me.avatarUrl} alt={me.name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
            ) : (
              me.name.charAt(0).toUpperCase()
            )}
          </div>
          <div className="min-w-0 flex-1">
            <textarea
              ref={areaRef}
              value={text}
              onChange={(e) => setText(e.target.value.slice(0, MAX_COMMENT))}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              rows={3}
              placeholder="Viết bình luận của bạn..."
              className="w-full resize-y rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
            />
            <div className="relative mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEmojiOpen((o) => !o)}
                  aria-label="Chọn biểu tượng cảm xúc"
                  className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                >
                  <Smile className="h-4 w-4" />
                  Emoji
                </button>
                <span className="text-xs text-gray-400">
                  {text.length}/{MAX_COMMENT}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !text.trim()}
                className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Gửi
              </button>

              {emojiOpen && (
                <div className="absolute bottom-full left-0 z-20 mb-2 grid w-72 grid-cols-9 gap-1 rounded-xl border border-gray-200 bg-white p-2 shadow-lg">
                  {EMOJIS.map((e) => (
                    <button
                      key={e}
                      type="button"
                      onClick={() => insertEmoji(e)}
                      className="flex h-7 w-7 items-center justify-center rounded-md text-lg transition-transform hover:scale-125 hover:bg-gray-100"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl bg-gray-50 p-4 text-sm text-gray-600">
          Bạn cần{' '}
          <button onClick={onLoginClick} className="font-semibold text-teal-600 hover:underline">
            đăng nhập
          </button>{' '}
          để bình luận.
        </div>
      )}

      {error && <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

      {/* Danh sách */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
        </div>
      ) : comments.length === 0 ? (
        <p className="py-8 text-center text-sm text-gray-400">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
      ) : (
        <ul className="mt-6 space-y-5">
          {comments.map((c) => {
            const canDelete = !!user && (user.id === c.user_id || user.id === postOwnerId);
            return (
              <li key={c.id} className="flex gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-sm font-bold text-white">
                  {c.author_avatar ? (
                    <img src={c.author_avatar} alt={c.author_name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
                  ) : (
                    c.author_name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="rounded-2xl bg-gray-50 px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="truncate text-sm font-bold text-gray-900">{c.author_name}</span>
                      {c.user_id === postOwnerId && (
                        <span className="rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                          Tác giả
                        </span>
                      )}
                    </div>
                    <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-gray-700">{c.content}</p>
                  </div>
                  <div className="mt-1 flex items-center gap-3 px-2 text-xs text-gray-400">
                    <span>{timeAgo(c.created_at)}</span>
                    {canDelete && (
                      <button onClick={() => handleDelete(c)} className="inline-flex items-center gap-1 hover:text-rose-600">
                        <Trash2 className="h-3 w-3" />
                        Xóa
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}