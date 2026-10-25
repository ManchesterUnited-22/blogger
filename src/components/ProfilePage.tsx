import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  Eye,
  EyeOff,
  FileText,
  Heart,
  ImagePlus,
  Loader2,
  MessageCircle,
  Pencil,
  Save,
  Send,
  Star,
  Trash2,
  Video,
  X,
  ArrowRight,
  PenLine
} from 'lucide-react';
import { supabase, formatDate, getUserProfile } from '@/lib/supabase';
import {
  MAX_IMAGE_MB,
  POST_BUCKET,
  extractCover,
  imagePathsInContent,
  makeExcerpt,
  uploadPostImage,
  youtubeId,
  type Post,
} from '@/lib/posts';
import BodyEditor, { type BodyEditorHandle } from '@/components/BodyEditor';
import PostContent from '@/components/PostContent';

type Props = {
  user: User;
  onBack: () => void;
  onOpenPost: (post: Post) => void;
  onPostsChanged: () => void;
};

type Stat = { likes: number; comments: number };

/* ---------- Avatar tròn dùng lại nhiều chỗ ---------- */
function Avatar({ url, name, className }: { url: string | null; name: string; className: string }) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-teal-500 font-bold text-white ${className}`}
    >
      {url ? (
        <img src={url} alt={name} referrerPolicy="no-referrer" className="h-full w-full object-cover" />
      ) : (
        name.charAt(0).toUpperCase()
      )}
    </div>
  );
}

/* ---------- Thẻ bài viết (thường + nổi bật) ---------- */
function PostTile({
  post,
  stat,
  featured,
  editing,
  onOpen,
  onEdit,
  onDelete,
}: {
  post: Post;
  stat?: Stat;
  featured?: boolean;
  editing: boolean;
  onOpen: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const label = post.title || makeExcerpt(post.content, 60) || 'Bài viết không có tiêu đề';
  const actions = (
    <div className="ml-auto flex">
      <button
        onClick={onEdit}
        aria-label="Sửa bài"
        className="rounded-lg p-2 text-gray-500 hover:bg-teal-50 hover:text-teal-600"
      >
        <Pencil className="h-4 w-4" />
      </button>
      <button
        onClick={onDelete}
        aria-label="Xóa bài"
        className="rounded-lg p-2 text-gray-500 hover:bg-rose-50 hover:text-rose-600"
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
  const meta = (
    <>
      <span className="font-semibold tracking-wide text-gray-600">{formatDate(post.created_at)}</span>
      <span className="inline-flex items-center gap-1 font-serif text-sm font-black tabular-nums text-gray-900">
        <Heart className={`h-3.5 w-3.5 ${(stat?.likes ?? 0) > 0 ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`} />
        {stat?.likes ?? 0}
      </span>
      <span className="inline-flex items-center gap-1 font-serif text-sm font-black tabular-nums text-gray-900">
        <MessageCircle className="h-3.5 w-3.5 text-teal-600" />
        {stat?.comments ?? 0}
      </span>
    </>
  );
  const ring = editing ? 'ring-2 ring-teal-400' : '';

  if (featured) {
    return (
      <div className={`overflow-hidden rounded-xl border border-gray-200 bg-white shadow-soft ${ring}`}>
        <button onClick={onOpen} className="relative block h-52 w-full text-left sm:h-60">
          <div className="absolute inset-0 bg-teal-500">
            {post.cover_url && <img src={post.cover_url} alt="" className="h-full w-full object-cover" />}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/75 via-slate-900/20 to-transparent" />
          <span className="absolute left-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold tracking-wide text-teal-700 shadow-sm backdrop-blur">
            <Star className="h-3.5 w-3.5 fill-current" />
            Bài nổi bật
          </span>
          <div className="absolute inset-x-0 bottom-0 p-5">
            <div className="line-clamp-2 font-serif text-xl font-black text-white sm:text-2xl">{label}</div>
            {post.title && <p className="mt-1 line-clamp-1 text-sm text-white/80">{makeExcerpt(post.content, 120)}</p>}
          </div>
        </button>
        <div className="flex items-center gap-3 px-5 py-2 text-xs text-gray-600">
          {meta}
          {actions}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white transition hover:border-teal-300 hover:shadow-soft ${ring}`}>
      <button onClick={onOpen} className="block text-left">
        <div className="h-32 w-full overflow-hidden bg-gray-200">
          {post.cover_url && <img src={post.cover_url} alt="" className="h-full w-full object-cover" />}
        </div>
        <div className="px-4 pt-3">
          <div className="line-clamp-2 font-serif text-lg font-bold text-gray-900 hover:text-teal-700">{label}</div>
          {post.title && <p className="mt-1 line-clamp-2 text-sm text-gray-600">{makeExcerpt(post.content, 100)}</p>}
        </div>
      </button>
      <div className="mt-auto flex items-center gap-3 px-4 pb-3 pt-3 text-xs text-gray-600">
        {meta}
        {actions}
      </div>
    </div>
  );
}

/* ====================== TRANG CÁ NHÂN ====================== */
export default function ProfilePage({ user, onBack, onOpenPost, onPostsChanged }: Props) {
  const profile = getUserProfile(user);
  // Ảnh gốc của Google (nếu có) để người dùng quay lại dùng
  const rawMeta = (user.user_metadata ?? {}) as Record<string, unknown>;
  let googleAvatar = (rawMeta.avatar_url as string) || (rawMeta.picture as string) || null;
  if (googleAvatar && googleAvatar.includes('googleusercontent.com')) {
    googleAvatar = googleAvatar.replace(/=s\d+-c$/, '=s256-c');
  }

  // ===== Khung soạn bài =====
  const [composerOpen, setComposerOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [ytUrl, setYtUrl] = useState('');
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  // ===== Bài của tôi =====
  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [stats, setStats] = useState<Record<string, Stat>>({});
  const [loadingPosts, setLoadingPosts] = useState(true);

  // ===== Sửa hồ sơ =====
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [avatarInput, setAvatarInput] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  const editorRef = useRef<BodyEditorHandle>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const formRef = useRef<HTMLElement>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const loadMyPosts = useCallback(async () => {
    setLoadingPosts(true);
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    const list = (data as Post[]) ?? [];
    setMyPosts(list);

    // Tim / bình luận nhận được (bỏ qua nếu view post_stats chưa có)
    if (list.length) {
      const { data: s, error: sErr } = await supabase
        .from('post_stats')
        .select('post_id, likes, comments')
        .in('post_id', list.map((p) => p.id));
      if (!sErr && s) {
        const map: Record<string, Stat> = {};
        for (const r of s) map[r.post_id as string] = { likes: Number(r.likes), comments: Number(r.comments) };
        setStats(map);
      }
    } else {
      setStats({});
    }
    setLoadingPosts(false);
  }, [user.id]);

  useEffect(() => {
    loadMyPosts();
  }, [loadMyPosts]);

  const totalLikes = myPosts.reduce((n, p) => n + (stats[p.id]?.likes ?? 0), 0);
  const totalComments = myPosts.reduce((n, p) => n + (stats[p.id]?.comments ?? 0), 0);

  // Bài nổi bật = bài nhiều tim nhất (phải có ít nhất 1 tim)
  const featured = myPosts.reduce<Post | null>((best, p) => {
    const likes = stats[p.id]?.likes ?? 0;
    if (likes <= 0) return best;
    if (!best || likes > (stats[best.id]?.likes ?? 0)) return p;
    return best;
  }, null);
  const restPosts = featured ? myPosts.filter((p) => p.id !== featured.id) : myPosts;

  // ===== Mở / đóng khung soạn =====
  const scrollToComposer = () => {
    requestAnimationFrame(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  const openComposer = () => {
    setError(null);
    setSuccess(null);
    setComposerOpen(true);
  };

  // Đóng và xóa sạch khung soạn, không hỏi lại
  const resetComposer = () => {
    setComposerOpen(false);
    setEditingId(null);
    setTitle('');
    setContent('');
    setYtUrl('');
    setPreview(false);
    setError(null);
  };

  // Người dùng bấm Hủy: nếu đang có nội dung thì hỏi trước
  const handleCancelComposer = () => {
    if ((title.trim() || content.trim()) && !window.confirm('Bỏ nội dung đang soạn?')) return;
    resetComposer();
  };

  const startEdit = (post: Post) => {
    setError(null);
    setSuccess(null);
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setPreview(false);
    setComposerOpen(true);
    scrollToComposer();
  };

  // ===== Chèn ảnh / video =====
  const handlePickImage = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setSuccess(null);
    setUploading(true);
    try {
      const url = await uploadPostImage(user.id, file);
      editorRef.current?.insertImage(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được ảnh.');
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const handleAddYoutube = () => {
    const id = youtubeId(ytUrl);
    if (!id) {
      setSuccess(null);
      setError('Link YouTube không hợp lệ. Hãy dán link dạng youtube.com/watch?v=... hoặc youtu.be/...');
      return;
    }
    setError(null);
    setSuccess(null);
    editorRef.current?.insertVideo(`https://www.youtube.com/watch?v=${id}`);
    setYtUrl('');
  };

  // ===== Đăng / lưu / xóa bài =====
  const handlePublish = async () => {
    setError(null);
    setSuccess(null);
    if (!content.trim()) return setError('Bạn chưa viết nội dung.');

    setPublishing(true);
    const { error } = await supabase.from('posts').insert({
      user_id: user.id,
      author_name: profile.name,
      author_avatar: profile.avatarUrl,
      title: title.trim(),
      content: content.trim(),
      cover_url: extractCover(content),
    });
    setPublishing(false);

    if (error) {
      setError('Đăng bài thất bại: ' + error.message);
      return;
    }
    resetComposer();
    setSuccess('Đã đăng bài! Bài viết sẽ hiện ở trang chủ.');
    scrollToComposer(); // kéo về chỗ thông báo để người dùng thấy
    loadMyPosts();
    onPostsChanged();
  };

  const handleSave = async () => {
    if (!editingId) return;
    setError(null);
    setSuccess(null);

    if (!content.trim()) return setError('Bạn chưa viết nội dung.');
    const old = myPosts.find((p) => p.id === editingId);
    if (!old) return;
    if (!window.confirm('Lưu thay đổi và đăng lại bài viết này?')) return;

    setPublishing(true);
    const newContent = content.trim();
    const { data, error } = await supabase
      .from('posts')
      .update({
        title: title.trim(),
        content: newContent,
        cover_url: extractCover(newContent),
      })
      .eq('id', editingId)
      .eq('user_id', user.id)
      .select('id');
    setPublishing(false);

    if (error || !data?.length) {
      setError('Lưu bài thất bại: ' + (error?.message ?? 'không có quyền sửa bài này.'));
      return;
    }

    // Xóa khỏi Storage những ảnh đã bị gỡ khỏi bài
    const stillUsed = new Set(imagePathsInContent(newContent));
    const removed = imagePathsInContent(old.content).filter((p) => !stillUsed.has(p));
    if (removed.length) await supabase.storage.from(POST_BUCKET).remove(removed);

    resetComposer();
    setSuccess('Đã cập nhật bài viết!');
    scrollToComposer();
    loadMyPosts();
    onPostsChanged();
  };

  const handleDelete = async (post: Post) => {
    if (!window.confirm(`Xóa bài ${post.title ? `"${post.title}"` : 'này'}? Không thể hoàn tác.`)) return;
    const { error } = await supabase.from('posts').delete().eq('id', post.id);
    if (error) {
      setError('Xóa bài thất bại: ' + error.message);
      return;
    }
    if (editingId === post.id) resetComposer();
    const paths = imagePathsInContent(post.content);
    if (paths.length) await supabase.storage.from(POST_BUCKET).remove(paths);
    loadMyPosts();
    onPostsChanged();
  };

  // ===== Hồ sơ =====
  const startEditProfile = () => {
    setNameInput(profile.name);
    setAvatarInput(profile.avatarUrl);
    setProfileError(null);
    setEditingProfile(true);
  };

  const cancelEditProfile = () => {
    setEditingProfile(false);
    setProfileError(null);
  };

  const handlePickAvatar = async (file: File | undefined) => {
    if (!file) return;
    setProfileError(null);
    setAvatarUploading(true);
    try {
      const url = await uploadPostImage(user.id, file);
      setAvatarInput(url);
    } catch (e) {
      setProfileError(e instanceof Error ? e.message : 'Không tải được ảnh.');
    } finally {
      setAvatarUploading(false);
      if (avatarFileRef.current) avatarFileRef.current.value = '';
    }
  };

  const handleSaveProfile = async () => {
    setProfileError(null);
    const name = nameInput.trim();
    if (!name) return setProfileError('Tên không được để trống.');
    if (name.length > 50) return setProfileError('Tên tối đa 50 ký tự.');

    setSavingProfile(true);
    const { error } = await supabase.auth.updateUser({
      data: { custom_name: name, custom_avatar: avatarInput },
    });
    setSavingProfile(false);

    if (error) return setProfileError('Lưu hồ sơ thất bại: ' + error.message);

    setEditingProfile(false);
    setSuccess('Đã cập nhật hồ sơ!');
    loadMyPosts();
    onPostsChanged();
  };

    const inputCls =
    'w-full border-0 border-b-2 border-gray-200 bg-transparent px-0 py-3 font-serif text-2xl font-bold text-gray-900 outline-none transition-colors placeholder:font-sans placeholder:text-base placeholder:font-normal placeholder:text-gray-400 focus:border-teal-400 focus:ring-4 focus:ring-teal-100';
  const chipBtn =
    'inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-teal-300 hover:text-gray-900 disabled:opacity-50';

  const shownAvatar = editingProfile ? avatarInput : profile.avatarUrl;
  const shownName = editingProfile ? nameInput || profile.name : profile.name;
  const statVal = (n: number) => (loadingPosts ? '–' : n);

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại trang chủ
      </button>

      {/* ===== 1. Hồ sơ cá nhân ===== */}
      <div className="overflow-hidden rounded-3xl border border-gray-200/80 bg-white shadow-soft-lg">
        <div className="h-28 bg-teal-100 px-6 pt-4 sm:h-36">
          <p className="inline-flex items-center gap-3 text-xs font-bold tracking-wide text-teal-700">
            <span aria-hidden className="inline-block h-2.5 w-2.5 rounded-full bg-teal-500" />
            Trang cá nhân
          </p>
        </div>

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4 sm:-mt-14">
            <div className="relative shrink-0">
              <Avatar
                url={shownAvatar}
                name={shownName}
                className="h-24 w-24 text-4xl shadow-lg ring-4 ring-white sm:h-28 sm:w-28"
              />
              {editingProfile && (
                <>
                  <input
                    ref={avatarFileRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                    onChange={(e) => handlePickAvatar(e.target.files?.[0])}
                  />
                  <button
                    type="button"
                    onClick={() => avatarFileRef.current?.click()}
                    disabled={avatarUploading}
                    aria-label="Đổi ảnh đại diện"
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-pop text-white shadow shadow-md shadow-teal-500/25 hover:brightness-110 disabled:opacity-60"
                  >
                    {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </button>
                </>
              )}
            </div>

            {!editingProfile && (
              <button
                type="button"
                onClick={startEditProfile}
                className={chipBtn}
              >
                <Pencil className="h-4 w-4" />
                Sửa hồ sơ
              </button>
            )}
          </div>

          <div className="mt-4 min-w-0">
            {editingProfile ? (
              <input
                className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-lg font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
                placeholder="Tên hiển thị"
                value={nameInput}
                maxLength={50}
                onChange={(e) => setNameInput(e.target.value)}
              />
            ) : (
              <h1 className="truncate font-serif text-3xl font-black tracking-tight text-gray-900">{profile.name}</h1>
            )}
            {profile.email && <p className="mt-0.5 truncate text-sm text-gray-600">{profile.email}</p>}

            {/* Thanh số liệu */}
            <div className="mt-4 grid grid-cols-3 divide-x divide-dashed divide-gray-400 border-y border-dashed border-gray-400 py-3">
              {[
                { Icon: FileText, cls: 'text-teal-600', n: myPosts.length, label: 'Bài viết' },
                { Icon: Heart, cls: 'fill-rose-500 text-rose-500', n: totalLikes, label: 'Lượt tim' },
                { Icon: MessageCircle, cls: 'text-cyan-500', n: totalComments, label: 'Bình luận' },
              ].map(({ Icon, cls, n, label }) => (
                <div key={label} className="flex flex-col items-center gap-1 px-2">
                  <span className="inline-flex items-center gap-2 font-serif text-3xl font-black leading-none text-gray-900">
                    <Icon className={`h-5 w-5 ${cls}`} />
                    {statVal(n)}
                  </span>
                  <span className="text-xs font-bold tracking-wide text-gray-600">{label}</span>
                </div>
              ))}
            </div>
            <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold tracking-wide text-gray-600">
              <CalendarDays className="h-4 w-4" />
              Tham gia {formatDate(user.created_at)}
            </p>
          </div>

          {editingProfile && (
            <div className="mt-4 space-y-3">
              {googleAvatar && avatarInput !== googleAvatar && (
                <button
                  type="button"
                  onClick={() => setAvatarInput(googleAvatar)}
                  className={chipBtn}
                >
                  Dùng lại ảnh Google
                </button>
              )}
              {profileError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{profileError}</p>}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-gray-500">
                  Ảnh tối đa {MAX_IMAGE_MB}MB. Tên và ảnh mới sẽ áp dụng cho cả các bài đã đăng.
                </p>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={cancelEditProfile}
                    disabled={savingProfile}
                    className={chipBtn}
                  >
                    <X className="h-4 w-4" />
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={savingProfile || avatarUploading}
                    className="inline-flex items-center gap-2 rounded-lg bg-pop px-5 py-2 text-sm font-bold tracking-wide text-white shadow-md shadow-teal-500/25 hover:brightness-110 disabled:opacity-60"
                  >
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ===== 2. Bài nổi bật (điểm nhấn) ===== */}
      {featured && (
        <div className="mt-6">
          <PostTile
            featured
            post={featured}
            stat={stats[featured.id]}
            editing={editingId === featured.id}
            onOpen={() => onOpenPost(featured)}
            onEdit={() => startEdit(featured)}
            onDelete={() => handleDelete(featured)}
          />
        </div>
      )}

           {/* ===== 3. Ô mời viết: thu gọn 1 khung, bấm thì mở rộng tại chỗ ===== */}
      <section ref={formRef} className="mt-6 scroll-mt-24">
        {success && <p className="mb-3 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">{success}</p>}
        {error && !composerOpen && (
          <p className="mb-3 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>
        )}

        {!composerOpen ? (
          <button
            type="button"
            onClick={openComposer}
            className="group flex w-full items-center gap-4 rounded-xl border border-gray-200 bg-white p-4 text-left transition-colors hover:border-teal-500 hover:bg-teal-50/40"
          >
            <Avatar url={profile.avatarUrl} name={profile.name} className="h-12 w-12 text-base" />
            <span className="min-w-0 flex-1">
              
              <span className="mt-0.5 block font-serif text-xl font-bold leading-snug text-gray-900">
                Hôm nay bạn muốn chia sẻ điều gì?{' '}
                <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-teal-700 underline decoration-teal-300 decoration-2 underline-offset-4 transition-colors group-hover:decoration-teal-600">
                  <PenLine className="h-5 w-5" />
                  Kể ngay
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
                </span>
              </span>
            </span>
            <ImagePlus className="hidden h-5 w-5 text-gray-400 sm:block" />
            <Video className="hidden h-5 w-5 text-gray-400 sm:block" />
          </button>
        ) : (
          <div className="rounded-xl border border-gray-200 border-t-4 border-t-teal-500 bg-white p-6">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[11px] font-bold tracking-wide text-teal-700">Gửi bài</p>
                <h2 className="mt-1 flex items-center gap-3 font-serif text-3xl font-black tracking-tight text-gray-900">
                  <span aria-hidden className="inline-block h-3 w-3 rotate-45 rounded-lg bg-teal-500" />
                  {editingId ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
                </h2>
              </div>
              <button
                type="button"
                onClick={handleCancelComposer}
                disabled={publishing}
                aria-label="Đóng khung soạn bài"
                className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 space-y-4">
              <input
                className={inputCls}
                placeholder="Tiêu đề bài viết"
                value={title}
                maxLength={150}
                onChange={(e) => setTitle(e.target.value)}
              />

              {preview ? (
                <div className="min-h-[12rem] rounded-xl border border-gray-200 bg-gray-50 p-4 text-gray-700">
                  {content.trim() ? <PostContent content={content} /> : <p className="text-gray-400">Chưa có nội dung.</p>}
                </div>
              ) : (
                <BodyEditor
                  ref={editorRef}
                  value={content}
                  onChange={setContent}
                  placeholder="Hôm nay bạn muốn chia sẻ điều gì? Bấm 'Chèn ảnh' hoặc dán link YouTube rồi bấm 'Chèn video' để thêm vào đúng vị trí con trỏ."
                />
              )}

              {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

              <div className="flex flex-wrap items-center gap-2 border-t border-gray-200 pt-4">
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="hidden"
                  onChange={(e) => handlePickImage(e.target.files?.[0])}
                />
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading || preview}
                  className={chipBtn}
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                  Chèn ảnh
                </button>

                <div className="inline-flex items-center gap-2">
                  <input
                    value={ytUrl}
                    onChange={(e) => setYtUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddYoutube();
                      }
                    }}
                    placeholder="Dán link YouTube..."
                    disabled={uploading || preview}
                    className="w-56 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm outline-none transition-colors focus:border-teal-400 focus:ring-4 focus:ring-teal-100 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={handleAddYoutube}
                    disabled={!ytUrl.trim() || uploading || preview}
                    className={chipBtn}
                  >
                    <Video className="h-4 w-4" />
                    Chèn video
                  </button>
                </div>

                <button type="button" onClick={() => setPreview((p) => !p)} className={chipBtn}>
                  {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  {preview ? 'Tiếp tục viết' : 'Xem trước'}
                </button>

                <div className="ml-auto flex gap-2">
                  <button type="button" onClick={handleCancelComposer} disabled={publishing} className={chipBtn}>
                    <X className="h-4 w-4" />
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={editingId ? handleSave : handlePublish}
                    disabled={publishing || uploading}
                    className="inline-flex items-center gap-2 rounded-lg bg-pop px-6 py-2 text-sm font-bold tracking-wide text-white transition-colors shadow-md shadow-teal-500/25 hover:brightness-110 disabled:opacity-60"
                  >
                    {publishing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : editingId ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                    {editingId ? 'Lưu thay đổi' : 'Đăng bài'}
                  </button>
                </div>
              </div>
              <p className="text-xs text-gray-500">
                Ảnh tối đa {MAX_IMAGE_MB}MB (JPG, PNG, WEBP, GIF). Video: dán link YouTube (nên để chế độ Không công
                khai hoặc Công khai). Ảnh đầu tiên sẽ làm nền mờ cho bài trên trang chủ.
              </p>
            </div>
          </div>
        )}
      </section>

      {/* ===== 4. Các bài viết còn lại ===== */}
      <section className="mt-8">
        {loadingPosts ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
          </div>
        ) : myPosts.length === 0 ? (
          <p className="py-6 text-center font-serif text-sm italic text-gray-500">
            Bài viết của bạn sẽ xuất hiện ở đây sau khi đăng.
          </p>
        ) : (
          restPosts.length > 0 && (
            <>
              <h2 className="flex items-center gap-3 text-xs font-bold tracking-wide text-gray-900">
                <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-teal-500" />
                {featured ? 'Các bài viết khác' : 'Bài viết của tôi'}
                <span className="h-px flex-1 bg-gray-300" />
              </h2>
              <ul className="mt-4 grid gap-4 sm:grid-cols-2">
                {restPosts.map((p) => (
                  <li key={p.id}>
                    <PostTile
                      post={p}
                      stat={stats[p.id]}
                      editing={editingId === p.id}
                      onOpen={() => onOpenPost(p)}
                      onEdit={() => startEdit(p)}
                      onDelete={() => handleDelete(p)}
                    />
                  </li>
                ))}
              </ul>
            </>
          )
        )}
      </section>
    </div>
  );
}