import { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { CornerDownRight, Loader2, Send, Smile, Trash2 } from 'lucide-react';
import { getUserProfile } from '@/lib/supabase';
import {
  MAX_COMMENT,
  addComment,
  deleteComment,
  fetchComments,
  subscribeComments,
  type Comment,
} from '@/lib/comments';

const EMOJIS = [
  '😀', '😂', '🤣', '😊', '😍', '🥰', '😘', '😎', '🤩', '🥳',
  '😋', '😅', '🥹', '😇', '🤭', '😜', '🤗', '🤔', '🙄', '😴',
  '😢', '😭', '😡', '😱', '👍', '👎', '👏', '🙌', '🙏', '💪',
  '👌', '✌️', '🤝', '❤️', '🧡', '💛', '💚', '💙', '💜', '🔥',
  '✨', '🎉', '💯', '🌟', '🌸', '🌈', '☀️', '🌊', '🏖️', '🍜',
  '☕', '🍀',
];

// Thụt lề tối đa bao nhiêu cấp (sâu hơn thì giữ nguyên cấp cuối để không bị hẹp trên mobile)
const MAX_INDENT_DEPTH = 3;

function timeAgo(iso: string): string {
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return 'Vừa xong';
  if (s < 3600) return `${Math.floor(s / 60)} phút trước`;
  if (s < 86400) return `${Math.floor(s / 3600)} giờ trước`;
  if (s < 86400 * 30) return `${Math.floor(s / 86400)} ngày trước`;
  return new Date(iso).toLocaleDateString('vi-VN');
}

/** Xóa 1 bình luận cùng toàn bộ các trả lời con cháu của nó. */
function removeWithDescendants(list: Comment[], id: string): Comment[] {
  const removed = new Set<string>([id]);
  let changed = true;
  while (changed) {
    changed = false;
    for (const c of list) {
      if (c.parent_id && removed.has(c.parent_id) && !removed.has(c.id)) {
        removed.add(c.id);
        changed = true;
      }
    }
  }
  return list.filter((c) => !removed.has(c.id));
}

/** Thêm bình luận, bỏ qua nếu đã có (tránh trùng giữa state cục bộ và realtime). */
function addUnique(list: Comment[], c: Comment): Comment[] {
  return list.some((x) => x.id === c.id) ? list : [...list, c];
}

function Avatar({ name, url, size = 'h-9 w-9' }: { name: string; url: string | null; size?: string }) {
  return (
    <div
      className={`flex ${size} shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-sm font-bold text-white`}
    >
      {url ? (
        <img src={url} alt={name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}

/** Ô nhập trả lời, hiện ngay dưới bình luận được trả lời. */
function ReplyBox({
  user,
  replyToName,
  onSubmit,
  onCancel,
}: {
  user: User;
  replyToName: string;
  onSubmit: (text: string) => Promise<void>;
  onCancel: () => void;
}) {
  const me = getUserProfile(user);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    ref.current?.focus();
  }, []);

  const send = async () => {
    if (sending || !text.trim()) return;
    setErr(null);
    setSending(true);
    try {
      await onSubmit(text);
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'Gửi trả lời thất bại.');
      setSending(false);
    }
  };

  return (
    <div className="mt-3 flex gap-2.5">
      <Avatar name={me.name} url={me.avatarUrl} size="h-7 w-7" />
      <div className="min-w-0 flex-1">
        <textarea
          ref={ref}
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, MAX_COMMENT))}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
              e.preventDefault();
              send();
            }
            if (e.key === 'Escape') onCancel();
          }}
          rows={2}
          placeholder={`Trả lời ${replyToName}...`}
          className="w-full resize-y rounded-sm border border-gray-300 bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-gray-900"
        />
        {err && <p className="mt-1 text-xs text-rose-600">{err}</p>}
        <div className="mt-1.5 flex items-center justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-sm px-3 py-1.5 text-xs font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-100"
          >
            Hủy
          </button>
          <button
            type="button"
            onClick={send}
            disabled={sending || !text.trim()}
            className="inline-flex items-center gap-1.5 rounded-sm bg-gray-900 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-white hover:bg-teal-600 disabled:opacity-50"
          >
            {sending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
            Trả lời
          </button>
        </div>
      </div>
    </div>
  );
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
  const [replyingTo, setReplyingTo] = useState<string | null>(null); // id bình luận đang được trả lời
  const areaRef = useRef<HTMLTextAreaElement>(null);

  // Tải lần đầu
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setReplyingTo(null);
    fetchComments(postId)
      .then((c) => alive && setComments(c))
      .catch((e) => alive && setError(e instanceof Error ? e.message : 'Lỗi tải bình luận.'))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [postId]);

  // Realtime: bình luận mới / bị xóa tự cập nhật, không cần tải lại trang
  useEffect(() => {
    const unsubscribe = subscribeComments(postId, {
      onInsert: (c) => setComments((prev) => addUnique(prev, c)),
      onDelete: (id) => setComments((prev) => removeWithDescendants(prev, id)),
    });
    return unsubscribe;
  }, [postId]);

  // Gom bình luận theo cha để dựng cây
  const childrenMap = useMemo(() => {
    const map = new Map<string | null, Comment[]>();
    for (const c of comments) {
      const key = c.parent_id ?? null;
      const arr = map.get(key);
      if (arr) arr.push(c);
      else map.set(key, [c]);
    }
    return map;
  }, [comments]);

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
      setComments((prev) => addUnique(prev, c));
      setText('');
      setEmojiOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Gửi bình luận thất bại.');
    } finally {
      setSending(false);
    }
  };

  const handleReply = async (parent: Comment, content: string) => {
    if (!user) return;
    const c = await addComment(postId, user, content, parent.id);
    setComments((prev) => addUnique(prev, c));
    setReplyingTo(null);
  };

  const handleDelete = async (c: Comment) => {
    const hasReplies = comments.some((x) => x.parent_id === c.id);
    const msg = hasReplies ? 'Xóa bình luận này và tất cả trả lời của nó?' : 'Xóa bình luận này?';
    if (!window.confirm(msg)) return;
    try {
      await deleteComment(c.id);
      setComments((prev) => removeWithDescendants(prev, c.id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Xóa bình luận thất bại.');
    }
  };

  const me = user ? getUserProfile(user) : null;

  // Vẽ 1 bình luận + các trả lời của nó (đệ quy)
  const renderComment = (c: Comment, depth: number) => {
    const canDelete = !!user && (user.id === c.user_id || user.id === postOwnerId);
    const replies = childrenMap.get(c.id) ?? [];
    const indent = depth < MAX_INDENT_DEPTH;

    return (
      <li key={c.id} className="flex gap-3">
        <Avatar name={c.author_name} url={c.author_avatar} size={depth === 0 ? 'h-9 w-9' : 'h-7 w-7'} />
        <div className="min-w-0 flex-1">
          <div className="rounded-sm border border-gray-300 bg-white px-4 py-2.5">
            <div className="flex items-center gap-2">
              <span className="truncate font-serif text-base font-bold text-gray-900">{c.author_name}</span>
              {c.user_id === postOwnerId && (
                <span className="rounded-sm bg-orange-500 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                  Tác giả
                </span>
              )}
            </div>
            <p className="mt-0.5 whitespace-pre-wrap break-words text-sm text-gray-800">{c.content}</p>
          </div>

          <div className="mt-1 flex items-center gap-3 px-2 text-xs font-semibold text-gray-600">
            <span>{timeAgo(c.created_at)}</span>
            <button
              onClick={() => (user ? setReplyingTo(replyingTo === c.id ? null : c.id) : onLoginClick())}
              className="inline-flex items-center gap-1 font-medium hover:text-teal-600"
            >
              <CornerDownRight className="h-3 w-3" />
              Trả lời
            </button>
            {canDelete && (
              <button onClick={() => handleDelete(c)} className="inline-flex items-center gap-1 hover:text-rose-600">
                <Trash2 className="h-3 w-3" />
                Xóa
              </button>
            )}
          </div>

          {user && replyingTo === c.id && (
            <ReplyBox
              user={user}
              replyToName={c.author_name}
              onSubmit={(content) => handleReply(c, content)}
              onCancel={() => setReplyingTo(null)}
            />
          )}

          {replies.length > 0 && (
            <ul className={`mt-3 space-y-4 ${indent ? 'border-l-2 border-gray-300 pl-3 sm:pl-4' : ''}`}>
              {replies.map((r) => renderComment(r, depth + 1))}
            </ul>
          )}
        </div>
      </li>
    );
  };

  const roots = childrenMap.get(null) ?? [];

  return (
    <section className="mt-12 border-t border-gray-300 pt-8">
      <h2 className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-900">
        <span aria-hidden className="h-2.5 w-2.5 bg-teal-500" />
        Bình luận ({comments.length})
        <span className="h-px flex-1 bg-gray-300" />
      </h2>

      {/* Ô nhập */}
      {user && me ? (
        <div className="mt-5 flex gap-3">
          <Avatar name={me.name} url={me.avatarUrl} />
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
              placeholder="Để lại vài dòng..."
              className="w-full resize-y rounded-sm border border-gray-300 bg-white px-4 py-2.5 text-sm outline-none transition-colors focus:border-gray-900"
            />
            <div className="relative mt-2 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setEmojiOpen((o) => !o)}
                  aria-label="Chọn biểu tượng cảm xúc"
                  className="inline-flex items-center gap-1.5 rounded-sm border border-gray-300 bg-white px-3 py-1.5 text-sm font-semibold text-gray-700 hover:border-gray-900"
                >
                  <Smile className="h-4 w-4" />
                  Emoji
                </button>
                <span className="text-xs tabular-nums text-gray-500">
                  {text.length}/{MAX_COMMENT}
                </span>
              </div>
              <button
                type="button"
                onClick={handleSend}
                disabled={sending || !text.trim()}
                className="inline-flex items-center gap-2 rounded-sm bg-gray-900 px-5 py-2 text-sm font-bold uppercase tracking-widest text-white hover:bg-teal-600 disabled:opacity-50"
              >
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                Gửi
              </button>

              {emojiOpen && (
                <div className="absolute bottom-full left-0 z-20 mb-2 grid w-72 grid-cols-9 gap-1 rounded-md border border-gray-900 bg-white p-2 shadow-[4px_4px_0_0_#111827]">
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
        <div className="mt-5 rounded-sm border border-dashed border-gray-400 bg-[#faf8f3] p-4 text-sm text-gray-700">
          Bạn cần{' '}
          <button onClick={onLoginClick} className="font-semibold text-teal-700 underline decoration-teal-300 decoration-2 underline-offset-4 hover:decoration-teal-600">
            đăng nhập
          </button>{' '}
          để bình luận.
        </div>
      )}

      {error && <p className="mt-3 rounded-sm bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

      {/* Danh sách */}
      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
        </div>
      ) : comments.length === 0 ? (
        <p className="py-8 text-center font-serif text-sm italic text-gray-500">Chưa có bình luận nào. Hãy là người đầu tiên!</p>
      ) : (
        <ul className="mt-6 space-y-5">{roots.map((c) => renderComment(c, 0))}</ul>
      )}
    </section>
  );
}