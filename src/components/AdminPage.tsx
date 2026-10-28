import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  Check,
  FileText,
  Heart,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  Search,
  ShieldCheck,
  Trash2,
  Users,
  X,
  type LucideIcon,
} from 'lucide-react';
import type { User } from '@supabase/supabase-js';
import { supabase, formatDate, timeAgo } from '@/lib/supabase';
import { POST_BUCKET, imagePathsInContent, makeExcerpt, type Post } from '@/lib/posts';
import {
  adminDeleteUser,
  adminLoadAll,
  adminSetMember,
  useIsAdmin,
  type AdminComment,
  type AdminPost,
  type AdminProfile,
} from '@/lib/admin';

type Props = {
  user: User;
  onBack: () => void;
  onOpenPost: (post: Post) => void;
  onDataChanged: () => void; // để trang chủ tải lại bài viết / thành viên
};

type Tab = 'overview' | 'posts' | 'comments' | 'members';

const TABS: { id: Tab; label: string; icon: LucideIcon }[] = [
  { id: 'overview', label: 'Tổng quan', icon: LayoutDashboard },
  { id: 'posts', label: 'Bài viết', icon: FileText },
  { id: 'comments', label: 'Bình luận', icon: MessageCircle },
  { id: 'members', label: 'Thành viên', icon: Users },
];

function Avatar({ name, url }: { name: string; url: string | null }) {
  return (
    <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-500 text-sm font-bold text-white">
      {url ? (
        <img src={url} alt={name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </span>
  );
}

export default function AdminPage({ user, onBack, onOpenPost, onDataChanged }: Props) {
  const isAdmin = useIsAdmin(user);
  const [tab, setTab] = useState<Tab>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [query, setQuery] = useState('');

  const [posts, setPosts] = useState<AdminPost[]>([]);
  const [comments, setComments] = useState<AdminComment[]>([]);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [likeCount, setLikeCount] = useState(0);

  const load = useCallback(async () => {
    setError(null);
    try {
      const d = await adminLoadAll();
      setPosts(d.posts);
      setComments(d.comments);
      setProfiles(d.profiles);
      setLikeCount(d.likeCount);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được dữ liệu.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  // Đổi tab thì xóa ô tìm kiếm
  useEffect(() => setQuery(''), [tab]);

  const postTitle = useMemo(() => {
    const m = new Map<string, string>();
    posts.forEach((p) => m.set(p.id, p.title || makeExcerpt(p.content, 40) || '(không tiêu đề)'));
    return m;
  }, [posts]);

  const q = query.trim().toLowerCase();
  const shownPosts = posts.filter(
    (p) => !q || p.title.toLowerCase().includes(q) || p.author_name.toLowerCase().includes(q),
  );
  const shownComments = comments.filter(
    (c) => !q || c.content.toLowerCase().includes(q) || c.author_name.toLowerCase().includes(q),
  );
  const shownProfiles = profiles.filter(
    (p) =>
      !q || (p.full_name ?? '').toLowerCase().includes(q) || (p.email ?? '').toLowerCase().includes(q),
  );
  // [DUYỆT] Tài khoản mới chưa được duyệt (không tính quản trị viên)
  const isPending = (p: AdminProfile) => p.is_member !== true && p.is_admin !== true;
  const pendingAll = profiles.filter(isPending);
  const shownPending = shownProfiles.filter(isPending);
  const shownApproved = shownProfiles.filter((p) => !isPending(p));

  const run = async (id: string, fn: () => Promise<void>, okMsg: string) => {
    setBusyId(id);
    setError(null);
    setNotice(null);
    try {
      await fn();
      setNotice(okMsg);
      await load();
      onDataChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Có lỗi xảy ra.');
    } finally {
      setBusyId(null);
    }
  };

  const deletePost = (p: AdminPost) => {
    if (!window.confirm(`Xóa bài "${postTitle.get(p.id)}" của ${p.author_name}? Không thể hoàn tác.`)) return;
    run(
      p.id,
      async () => {
        const { error } = await supabase.from('posts').delete().eq('id', p.id);
        if (error) throw new Error('Xóa bài thất bại: ' + error.message);
        // Dọn ảnh/video trong Storage (nếu quyền Storage không cho phép thì bỏ qua)
        const paths = imagePathsInContent(p.content);
        if (paths.length) await supabase.storage.from(POST_BUCKET).remove(paths);
      },
      'Đã xóa bài viết.',
    );
  };

  const deleteComment = (c: AdminComment) => {
    if (!window.confirm(`Xóa bình luận của ${c.author_name}?`)) return;
    run(
      c.id,
      async () => {
        const { error } = await supabase.from('comments').delete().eq('id', c.id);
        if (error) throw new Error('Xóa bình luận thất bại: ' + error.message);
      },
      'Đã xóa bình luận.',
    );
  };

  const toggleMember = (p: AdminProfile) => {
    const next = p.is_member !== true;
    run(p.id, () => adminSetMember(p.id, next), next ? 'Đã cấp quyền thành viên.' : 'Đã gỡ quyền thành viên.');
  };

  // [DUYỆT] Duyệt: cho vào. Từ chối: xóa tài khoản (người đó đăng nhập lại sẽ phải chờ duyệt lần nữa)
  const approveUser = (p: AdminProfile) => {
    run(p.id, () => adminSetMember(p.id, true), `Đã duyệt ${p.full_name || p.email || 'tài khoản'}.`);
  };

  const rejectUser = (p: AdminProfile) => {
    const name = p.full_name || p.email || 'người dùng này';
    if (!window.confirm(`Từ chối và xóa tài khoản "${name}"?`)) return;
    run(p.id, () => adminDeleteUser(p.id), 'Đã từ chối và xóa tài khoản.');
  };

  const deleteUser = (p: AdminProfile) => {
    const name = p.full_name || p.email || 'người dùng này';
    if (
      !window.confirm(
        `Xóa vĩnh viễn tài khoản "${name}" cùng toàn bộ bài viết, bình luận và lượt thích của họ? Không thể hoàn tác.`,
      )
    )
      return;
    run(p.id, () => adminDeleteUser(p.id), 'Đã xóa tài khoản.');
  };

  const openPost = async (id: string) => {
    const { data } = await supabase.from('posts').select('*').eq('id', id).maybeSingle();
    if (data) onOpenPost(data as Post);
    else setError('Không mở được bài này.');
  };

  // ===== Chưa biết / không có quyền =====
  if (isAdmin === null) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
      </div>
    );
  }
  if (!isAdmin) {
    return (
      <div className="mx-auto max-w-md px-6 py-24 text-center">
        <ShieldCheck className="mx-auto h-12 w-12 text-gray-300" />
        <h1 className="mt-4 font-display text-2xl font-extrabold text-gray-900">Không có quyền truy cập</h1>
        <p className="mt-2 text-sm text-gray-600">Trang này chỉ dành cho quản trị viên.</p>
        <button
          onClick={onBack}
          className="bg-pop mt-6 rounded-full px-6 py-2.5 text-sm font-bold text-white"
        >
          Về trang chủ
        </button>
      </div>
    );
  }

  const memberCount = profiles.filter((p) => p.is_member === true).length;
  const stats = [
    { label: 'Bài viết', value: posts.length, icon: FileText, cls: 'bg-violet-100 text-violet-700' },
    { label: 'Bình luận', value: comments.length, icon: MessageCircle, cls: 'bg-cyan-100 text-cyan-700' },
    { label: 'Lượt tim', value: likeCount, icon: Heart, cls: 'bg-pink-100 text-pink-700' },
    { label: 'Tài khoản', value: profiles.length, icon: Users, cls: 'bg-amber-100 text-amber-700' },
    { label: 'Thành viên', value: memberCount, icon: ShieldCheck, cls: 'bg-teal-100 text-teal-700' },
  ];

  const iconBtn =
    'inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50';

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-teal-700"
      >
        <ArrowLeft className="h-4 w-4" /> Quay lại
      </button>

      <div className="mb-6 flex items-center gap-3">
        <span className="bg-pop flex h-11 w-11 items-center justify-center rounded-xl text-white">
          <ShieldCheck className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-extrabold text-ink">Quản trị</h1>
          <p className="text-sm text-gray-600">Quản lý bài viết, bình luận và thành viên</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto border-b border-gray-200">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`inline-flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-semibold transition ${
              tab === id
                ? 'border-teal-600 text-teal-700'
                : 'border-transparent text-gray-500 hover:text-gray-800'
            }`}
          >
            <Icon className="h-4 w-4" /> {label}
            {id === 'members' && pendingAll.length > 0 && (
              <span className="rounded-full bg-red-500 px-2 py-0.5 text-[10px] font-extrabold text-white">
                {pendingAll.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {notice && (
        <p className="mb-4 rounded-xl bg-teal-50 px-4 py-3 text-sm font-medium text-teal-800">{notice}</p>
      )}
      {error && <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</p>}

      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-teal-500" />
        </div>
      ) : (
        <>
          {tab !== 'overview' && (
            <div className="relative mb-4 max-w-sm">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-violet-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full rounded-full border-2 border-violet-200 bg-white py-2.5 pl-10 pr-5 text-sm outline-none focus:border-teal-400"
              />
            </div>
          )}

          {/* ===== Tổng quan ===== */}
          {tab === 'overview' && (
            <div className="space-y-8">
              <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                {stats.map(({ label, value, icon: Icon, cls }) => (
                  <div key={label} className="rounded-2xl border border-gray-200 bg-white p-4">
                    <span className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${cls}`}>
                      <Icon className="h-4 w-4" />
                    </span>
                    <p className="mt-3 font-display text-3xl font-extrabold tabular-nums text-ink">{value}</p>
                    <p className="text-xs font-semibold text-gray-500">{label}</p>
                  </div>
                ))}
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <h2 className="mb-3 font-display text-lg font-extrabold text-ink">Bài mới nhất</h2>
                  <ul className="divide-y divide-gray-100">
                    {posts.slice(0, 5).map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-3 py-2.5">
                        <button
                          onClick={() => openPost(p.id)}
                          className="min-w-0 text-left text-sm font-semibold text-gray-800 hover:text-teal-700"
                        >
                          <span className="block truncate">{postTitle.get(p.id)}</span>
                          <span className="text-xs font-normal text-gray-500">
                            {p.author_name} · {timeAgo(p.created_at)}
                          </span>
                        </button>
                      </li>
                    ))}
                    {posts.length === 0 && <li className="py-4 text-sm italic text-gray-500">Chưa có bài viết.</li>}
                  </ul>
                </div>
                <div className="rounded-2xl border border-gray-200 bg-white p-5">
                  <h2 className="mb-3 font-display text-lg font-extrabold text-ink">Bình luận mới nhất</h2>
                  <ul className="divide-y divide-gray-100">
                    {comments.slice(0, 5).map((c) => (
                      <li key={c.id} className="py-2.5 text-sm">
                        <p className="line-clamp-2 text-gray-800">{c.content}</p>
                        <p className="text-xs text-gray-500">
                          {c.author_name} · {timeAgo(c.created_at)}
                        </p>
                      </li>
                    ))}
                    {comments.length === 0 && (
                      <li className="py-4 text-sm italic text-gray-500">Chưa có bình luận.</li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* ===== Bài viết ===== */}
          {tab === 'posts' && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <ul className="divide-y divide-gray-100">
                {shownPosts.map((p) => (
                  <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <button
                        onClick={() => openPost(p.id)}
                        className="block max-w-full truncate text-left text-sm font-bold text-gray-900 hover:text-teal-700"
                      >
                        {postTitle.get(p.id)}
                      </button>
                      <p className="text-xs text-gray-500">
                        {p.author_name} · {formatDate(p.created_at)}
                      </p>
                    </div>
                    <button
                      onClick={() => deletePost(p)}
                      disabled={busyId === p.id}
                      className={`${iconBtn} text-red-600 hover:bg-red-50`}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {busyId === p.id ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  </li>
                ))}
                {shownPosts.length === 0 && (
                  <li className="px-4 py-10 text-center text-sm italic text-gray-500">Không có bài viết.</li>
                )}
              </ul>
            </div>
          )}

          {/* ===== Bình luận ===== */}
          {tab === 'comments' && (
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <ul className="divide-y divide-gray-100">
                {shownComments.map((c) => (
                  <li key={c.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <p className="whitespace-pre-wrap break-words text-sm text-gray-800">{c.content}</p>
                      <p className="mt-1 text-xs text-gray-500">
                        {c.author_name} · {timeAgo(c.created_at)} · trong bài{' '}
                        <button onClick={() => openPost(c.post_id)} className="font-semibold hover:text-teal-700">
                          {postTitle.get(c.post_id) ?? '(đã xóa)'}
                        </button>
                      </p>
                    </div>
                    <button
                      onClick={() => deleteComment(c)}
                      disabled={busyId === c.id}
                      className={`${iconBtn} text-red-600 hover:bg-red-50`}
                    >
                      <Trash2 className="h-3.5 w-3.5" /> {busyId === c.id ? 'Đang xóa...' : 'Xóa'}
                    </button>
                  </li>
                ))}
                {shownComments.length === 0 && (
                  <li className="px-4 py-10 text-center text-sm italic text-gray-500">Không có bình luận.</li>
                )}
              </ul>
            </div>
          )}

          {/* ===== Thành viên ===== */}
          {tab === 'members' && (
            <div className="space-y-6">
              {/* [DUYỆT] Danh sách chờ duyệt */}
              {shownPending.length > 0 && (
                <div className="overflow-hidden rounded-2xl border-2 border-amber-200 bg-amber-50/40">
                  <h2 className="border-b border-amber-200 bg-amber-50 px-4 py-2.5 text-sm font-extrabold text-amber-800">
                    Chờ duyệt ({shownPending.length})
                  </h2>
                  <ul className="divide-y divide-amber-100">
                    {shownPending.map((p) => {
                      const name = p.full_name || 'Chưa đặt tên';
                      return (
                        <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                          <div className="flex min-w-0 flex-1 items-center gap-3">
                            <Avatar name={name} url={p.avatar_url} />
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-gray-900">{name}</p>
                              <p className="truncate text-xs text-gray-500">
                                {p.email ?? '—'} · đăng ký {timeAgo(p.created_at)}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => approveUser(p)}
                              disabled={busyId === p.id}
                              className={`${iconBtn} bg-teal-600 text-white hover:bg-teal-700`}
                            >
                              <Check className="h-3.5 w-3.5" /> Duyệt
                            </button>
                            <button
                              onClick={() => rejectUser(p)}
                              disabled={busyId === p.id}
                              className={`${iconBtn} border border-red-200 text-red-600 hover:bg-red-50`}
                            >
                              <X className="h-3.5 w-3.5" /> Từ chối
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
              <ul className="divide-y divide-gray-100">
                {shownApproved.map((p) => {
                  const name = p.full_name || 'Chưa đặt tên';
                  const isMe = p.id === user.id;
                  const locked = isMe || p.is_admin === true; // không tự xóa / xóa quản trị viên khác
                  return (
                    <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <Avatar name={name} url={p.avatar_url} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-gray-900">
                            {name}
                            {p.is_admin && (
                              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-extrabold text-amber-700">
                                Quản trị
                              </span>
                            )}
                            {p.is_member && (
                              <span className="ml-2 rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-extrabold text-teal-700">
                                Thành viên
                              </span>
                            )}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {p.email ?? '—'} · tham gia {formatDate(p.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleMember(p)}
                          disabled={busyId === p.id}
                          className={`${iconBtn} border border-gray-200 text-gray-700 hover:bg-gray-50`}
                        >
                          {p.is_member ? 'Gỡ thành viên' : 'Cấp thành viên'}
                        </button>
                        {!locked && (
                          <button
                            onClick={() => deleteUser(p)}
                            disabled={busyId === p.id}
                            className={`${iconBtn} text-red-600 hover:bg-red-50`}
                          >
                            <Trash2 className="h-3.5 w-3.5" /> Xóa tài khoản
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
                {shownApproved.length === 0 && (
                  <li className="px-4 py-10 text-center text-sm italic text-gray-500">Không có tài khoản.</li>
                )}
              </ul>
            </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}