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
  PenLine,
  Save,
  Send,
  Trash2,
  Video,
  X,
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
    scrollToComposer();
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
    'w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100';
  const chipBtn =
    'inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50';

  const shownAvatar = editingProfile ? avatarInput : profile.avatarUrl;
  const shownName = editingProfile ? nameInput || profile.name : profile.name;

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại trang chủ
      </button>

      {/* ===== Hồ sơ cá nhân ===== */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-gray-100">
        {/* Ảnh bìa */}
        <div className="h-28 bg-gradient-to-r from-teal-400 via-cyan-400 to-sky-400 sm:h-36" />

        <div className="px-6 pb-6">
          <div className="-mt-12 flex flex-wrap items-end justify-between gap-4 sm:-mt-14">
            {/* Avatar */}
            <div className="relative shrink-0">
              <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-4xl font-bold text-white shadow-lg ring-4 ring-white sm:h-28 sm:w-28">
                {shownAvatar ? (
                  <img
                    src={shownAvatar}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  shownName.charAt(0).toUpperCase()
                )}
              </div>
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
                    className="absolute -bottom-1 -right-1 flex h-9 w-9 items-center justify-center rounded-full bg-gray-900 text-white shadow hover:bg-teal-600 disabled:opacity-60"
                  >
                    {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                  </button>
                </>
              )}
            </div>

            {/* Nút hành động */}
            {!editingProfile && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={startEditProfile}
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
                >
                  <Pencil className="h-4 w-4" />
                  Sửa hồ sơ
                </button>
                <button
                  type="button"
                  onClick={openComposer}
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                >
                  <PenLine className="h-4 w-4" />
                  Viết bài mới
                </button>
              </div>
            )}
          </div>

          {/* Tên + email */}
          <div className="mt-4 min-w-0">
            {editingProfile ? (
              <input
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2 text-lg font-bold text-gray-900 outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100"
                placeholder="Tên hiển thị"
                value={nameInput}
                maxLength={50}
                onChange={(e) => setNameInput(e.target.value)}
              />
            ) : (
              <h1 className="truncate text-2xl font-extrabold text-gray-900">{profile.name}</h1>
            )}
            {profile.email && <p className="mt-0.5 truncate text-sm text-gray-500">{profile.email}</p>}
            <p className="mt-2 inline-flex items-center gap-1.5 text-xs text-gray-400">
              <CalendarDays className="h-3.5 w-3.5" />
              Tham gia {formatDate(user.created_at)}
            </p>
          </div>

          {/* Khối sửa hồ sơ */}
          {editingProfile && (
            <div className="mt-4 space-y-3">
              {googleAvatar && avatarInput !== googleAvatar && (
                <button
                  type="button"
                  onClick={() => setAvatarInput(googleAvatar)}
                  className="rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50"
                >
                  Dùng lại ảnh Google
                </button>
              )}
              {profileError && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{profileError}</p>}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs text-gray-400">
                  Ảnh tối đa {MAX_IMAGE_MB}MB. Tên và ảnh mới sẽ áp dụng cho cả các bài đã đăng.
                </p>
                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={cancelEditProfile}
                    disabled={savingProfile}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 ring-1 ring-gray-200 hover:bg-gray-50 disabled:opacity-60"
                  >
                    <X className="h-4 w-4" />
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveProfile}
                    disabled={savingProfile || avatarUploading}
                    className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-60"
                  >
                    {savingProfile ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Lưu
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Thống kê */}
          <div className="mt-5 grid grid-cols-3 divide-x divide-gray-100 rounded-2xl bg-gray-50 py-3 text-center">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xl font-extrabold text-gray-900">
                <FileText className="h-4 w-4 text-teal-500" />
                {myPosts.length}
              </div>
              <div className="text-xs text-gray-500">Bài viết</div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xl font-extrabold text-gray-900">
                <Heart className="h-4 w-4 text-rose-500" />
                {totalLikes}
              </div>
              <div className="text-xs text-gray-500">Lượt tim</div>
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 text-xl font-extrabold text-gray-900">
                <MessageCircle className="h-4 w-4 text-cyan-500" />
                {totalComments}
              </div>
              <div className="text-xs text-gray-500">Bình luận</div>
            </div>
          </div>
        </div>
      </div>

      {/* Thông báo chung (đã đăng, đã cập nhật...) */}
      {success && !composerOpen && (
        <p className="mt-4 rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">{success}</p>
      )}
      {error && !composerOpen && <p className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}

      {/* ===== Khung soạn bài (chỉ hiện khi cần) ===== */}
      {composerOpen && (
        <section ref={formRef} className="mt-6 scroll-mt-24 rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-100">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-xl font-extrabold text-gray-900">
              {editingId ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
            </h2>
            <button
              type="button"
              onClick={handleCancelComposer}
              disabled={publishing}
              aria-label="Đóng khung soạn bài"
              className="rounded-full p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-700 disabled:opacity-50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-4 space-y-3">
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

            <div className="flex flex-wrap items-center gap-2">
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

              {/* Dán link YouTube -> nhúng video */}
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
                  className="w-56 rounded-full bg-gray-100 px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-teal-200 disabled:opacity-50"
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
                <button
                  type="button"
                  onClick={handleCancelComposer}
                  disabled={publishing}
                  className={chipBtn}
                >
                  <X className="h-4 w-4" />
                  Hủy
                </button>
                <button
                  type="button"
                  onClick={editingId ? handleSave : handlePublish}
                  disabled={publishing || uploading}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-600 disabled:opacity-60"
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
            <p className="text-xs text-gray-400">
              Ảnh tối đa {MAX_IMAGE_MB}MB (JPG, PNG, WEBP, GIF). Video: dán link YouTube (nên để chế độ Không công khai
              hoặc Công khai). Ảnh đầu tiên sẽ làm nền mờ cho bài trên trang chủ.
            </p>
          </div>
        </section>
      )}

      {/* ===== Bài viết của tôi ===== */}
      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-gray-900">Bài viết của tôi</h2>

        {loadingPosts ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
          </div>
        ) : myPosts.length === 0 ? (
          <div className="mt-4 rounded-2xl border border-dashed border-gray-200 px-6 py-10 text-center">
            <p className="text-sm text-gray-500">Bạn chưa đăng bài nào.</p>
            {!composerOpen && (
              <button
                type="button"
                onClick={openComposer}
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white hover:bg-teal-600"
              >
                <PenLine className="h-4 w-4" />
                Viết bài đầu tiên
              </button>
            )}
          </div>
        ) : (
          <ul className="mt-4 grid gap-4 sm:grid-cols-2">
            {myPosts.map((p) => {
              const s = stats[p.id];
              const label = p.title || makeExcerpt(p.content, 60) || 'Bài viết không có tiêu đề';
              return (
                <li
                  key={p.id}
                  className={`flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 transition hover:shadow-md ${
                    editingId === p.id ? 'ring-2 ring-teal-400' : 'ring-gray-100'
                  }`}
                >
                  <button onClick={() => onOpenPost(p)} className="block text-left">
                    <div className="h-32 w-full overflow-hidden bg-gradient-to-br from-teal-100 to-cyan-100">
                      {p.cover_url && <img src={p.cover_url} alt="" className="h-full w-full object-cover" />}
                    </div>
                    <div className="px-4 pt-3">
                      <div className="line-clamp-2 font-bold text-gray-900 hover:text-teal-600">{label}</div>
                      {p.title && (
                        <p className="mt-1 line-clamp-2 text-sm text-gray-500">{makeExcerpt(p.content, 100)}</p>
                      )}
                    </div>
                  </button>

                  <div className="mt-auto flex items-center gap-3 px-4 pb-3 pt-3 text-xs text-gray-400">
                    <span>{formatDate(p.created_at)}</span>
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3.5 w-3.5" />
                      {s?.likes ?? 0}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="h-3.5 w-3.5" />
                      {s?.comments ?? 0}
                    </span>
                    <div className="ml-auto flex">
                      <button
                        onClick={() => startEdit(p)}
                        aria-label="Sửa bài"
                        className="rounded-full p-2 text-gray-400 hover:bg-teal-50 hover:text-teal-600"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
                        aria-label="Xóa bài"
                        className="rounded-full p-2 text-gray-400 hover:bg-rose-50 hover:text-rose-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}