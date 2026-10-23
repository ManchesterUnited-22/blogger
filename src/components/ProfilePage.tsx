import { useCallback, useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { ArrowLeft, Eye, EyeOff, ImagePlus, Loader2, Pencil, Save, Send, Trash2, X, Camera, Video } from 'lucide-react';
import { supabase, formatDate, getUserProfile } from '@/lib/supabase';
import {
  POST_BUCKET,
  extractCover,
  imagePathsInContent,
  makeExcerpt,
  uploadPostImage,
  uploadPostVideo,
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

export default function ProfilePage({ user, onBack, onOpenPost, onPostsChanged }: Props) {
  const profile = getUserProfile(user);
  // Ảnh gốc của Google (nếu có) để người dùng quay lại dùng
  const rawMeta = (user.user_metadata ?? {}) as Record<string, unknown>;
  let googleAvatar = ((rawMeta.avatar_url as string) || (rawMeta.picture as string) || null);
  if (googleAvatar && googleAvatar.includes('googleusercontent.com')) {
    googleAvatar = googleAvatar.replace(/=s\d+-c$/, '=s256-c');
  }

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [myPosts, setMyPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  const editorRef = useRef<BodyEditorHandle>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const formRef = useRef<HTMLElement>(null);
  const [editingProfile, setEditingProfile] = useState(false);
  const [nameInput, setNameInput] = useState('');
  const [avatarInput, setAvatarInput] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null);

  const loadMyPosts = useCallback(async () => {
    setLoadingPosts(true);
    const { data } = await supabase
      .from('posts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    setMyPosts((data as Post[]) ?? []);
    setLoadingPosts(false);
  }, [user.id]);

  useEffect(() => {
    loadMyPosts();
  }, [loadMyPosts]);

  // Chèn ảnh tại vị trí con trỏ trong khung viết bài
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

  // Chèn video tại vị trí con trỏ trong khung viết bài
  const handlePickVideo = async (file: File | undefined) => {
    if (!file) return;
    setError(null);
    setSuccess(null);
    setUploadingVideo(true);
    try {
      const url = await uploadPostVideo(user.id, file);
      editorRef.current?.insertVideo(url);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Không tải được video.');
    } finally {
      setUploadingVideo(false);
      if (videoFileRef.current) videoFileRef.current.value = '';
    }
  };

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
    setTitle('');
    setContent('');
    setPreview(false);
    setSuccess('Đã đăng bài! Bài viết sẽ hiện ở trang chủ.');
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
    if (editingId === post.id) cancelEdit();
    const paths = imagePathsInContent(post.content);
    if (paths.length) await supabase.storage.from(POST_BUCKET).remove(paths);
    loadMyPosts();
    onPostsChanged();
  };

  // Nạp bài viết vào form để chỉnh sửa
  const startEdit = (post: Post) => {
    setError(null);
    setSuccess(null);
    setEditingId(post.id);
    setTitle(post.title);
    setContent(post.content);
    setPreview(false);
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setTitle('');
    setContent('');
    setPreview(false);
    setError(null);
  };

  // Lưu thay đổi: cập nhật bài, bài trên trang chủ tự đổi theo
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

    // Xóa khỏi Storage những ảnh/video đã bị gỡ khỏi bài
    const stillUsed = new Set(imagePathsInContent(newContent));
    const removed = imagePathsInContent(old.content).filter((p) => !stillUsed.has(p));
    if (removed.length) await supabase.storage.from(POST_BUCKET).remove(removed);

    cancelEdit();
    setSuccess('Đã cập nhật bài viết!');
    loadMyPosts();
    onPostsChanged();
  };

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

  return (
    <div className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại trang chủ
      </button>

      {/* Thông tin cá nhân */}
      <div className="rounded-2xl bg-gradient-to-br from-teal-50 to-cyan-50 p-6 ring-1 ring-gray-100">
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-3xl font-bold text-white shadow">
              {(editingProfile ? avatarInput : profile.avatarUrl) ? (
                <img
                  src={(editingProfile ? avatarInput : profile.avatarUrl) as string}
                  alt={profile.name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                (editingProfile ? nameInput || profile.name : profile.name).charAt(0).toUpperCase()
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
                  className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-gray-900 text-white shadow hover:bg-teal-600 disabled:opacity-60"
                >
                  {avatarUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Camera className="h-4 w-4" />}
                </button>
              </>
            )}
          </div>

          <div className="min-w-0 flex-1">
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
            {profile.email && <p className="truncate text-sm text-gray-500">{profile.email}</p>}
            <p className="mt-1 text-xs text-gray-400">{myPosts.length} bài viết</p>
          </div>

          {!editingProfile && (
            <button
              type="button"
              onClick={startEditProfile}
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-200 hover:bg-gray-50"
            >
              <Pencil className="h-4 w-4" />
              Sửa hồ sơ
            </button>
          )}
        </div>

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
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-gray-400">Ảnh tối đa 3MB. Tên và ảnh mới sẽ áp dụng cho cả các bài đã đăng.</p>
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
      </div>

      {/* Viết bài / Chỉnh sửa bài */}
      <section ref={formRef} className="mt-8 rounded-2xl bg-white p-6 shadow-md ring-1 ring-gray-100">
        <h2 className="text-xl font-extrabold text-gray-900">
          {editingId ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}
        </h2>

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
              placeholder="Hôm nay bạn muốn chia sẻ điều gì? Bấm 'Chèn ảnh' hoặc 'Chèn video' để thêm vào đúng vị trí con trỏ."
            />
          )}

          {error && <p className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-600">{error}</p>}
          {success && <p className="rounded-lg bg-teal-50 px-3 py-2 text-sm text-teal-700">{success}</p>}

          <div className="flex flex-wrap items-center gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="hidden"
              onChange={(e) => handlePickImage(e.target.files?.[0])}
            />
            <input
              ref={videoFileRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => handlePickVideo(e.target.files?.[0])}
            />
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              disabled={uploading || uploadingVideo || preview}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
              Chèn ảnh
            </button>
            <button
              type="button"
              onClick={() => videoFileRef.current?.click()}
              disabled={uploading || uploadingVideo || preview}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-50"
            >
              {uploadingVideo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
              {uploadingVideo ? 'Đang tải video...' : 'Chèn video'}
            </button>
            <button
              type="button"
              onClick={() => setPreview((p) => !p)}
              className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
            >
              {preview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {preview ? 'Tiếp tục viết' : 'Xem trước'}
            </button>
            <div className="ml-auto flex gap-2">
              {editingId && (
                <button
                  type="button"
                  onClick={cancelEdit}
                  disabled={publishing}
                  className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200 disabled:opacity-60"
                >
                  <X className="h-4 w-4" />
                  Hủy
                </button>
              )}
              <button
                type="button"
                onClick={editingId ? handleSave : handlePublish}
                disabled={publishing || uploading || uploadingVideo}
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
            Ảnh tối đa 3MB (JPG, PNG, WEBP, GIF). Video tối đa 50MB (MP4, WEBM, MOV). Ảnh đầu tiên sẽ làm nền mờ cho bài trên trang chủ.
          </p>
        </div>
      </section>

      {/* Bài của tôi */}
      <section className="mt-10">
        <h2 className="text-xl font-extrabold text-gray-900">Bài viết của tôi</h2>
        {loadingPosts ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-6 w-6 animate-spin text-teal-500" />
          </div>
        ) : myPosts.length === 0 ? (
          <p className="py-8 text-center text-sm text-gray-400">Bạn chưa đăng bài nào.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {myPosts.map((p) => (
              <li key={p.id} className="flex items-center gap-4 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-gray-100">
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-teal-100 to-cyan-100">
                  {p.cover_url && <img src={p.cover_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <button onClick={() => onOpenPost(p)} className="min-w-0 flex-1 text-left">
                  <div className="truncate font-bold text-gray-900 hover:text-teal-600">
  {p.title || makeExcerpt(p.content, 60) || 'Bài viết không có tiêu đề'}
</div>
                  <div className="text-xs text-gray-400">{formatDate(p.created_at)}</div>
                </button>
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
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}