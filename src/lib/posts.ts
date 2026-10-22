import { supabase } from '@/lib/supabase';

export type Post = {
  id: string;
  user_id: string;
  author_name: string;
  author_avatar: string | null;
  title: string;
  content: string;
  cover_url: string | null;
  created_at: string;
};

export const POST_BUCKET = 'post-images';
export const MAX_IMAGE_MB = 3;
export const MAX_VIDEO_MB = 50;
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

/** Một dòng chỉ chứa ảnh có dạng: ![mô tả](https://...) */
export const IMAGE_LINE = /^!\[(.*?)\]\((https?:\/\/[^\s)]+)\)$/;

/** Một dòng chỉ chứa video có dạng: @[video](https://...) */
export const VIDEO_LINE = /^@\[video\]\((https?:\/\/[^\s)]+)\)$/;

/** Ảnh đầu tiên trong bài (dùng làm nền mờ cho card). */
export function extractCover(content: string): string | null {
  for (const line of content.split('\n')) {
    const m = line.trim().match(IMAGE_LINE);
    if (m) return m[2];
  }
  return null;
}

/** Đoạn trích: bỏ dòng ảnh/video, nối các dòng chữ lại. */
export function makeExcerpt(content: string, max = 240): string {
  const text = content
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !IMAGE_LINE.test(l) && !VIDEO_LINE.test(l))
    .join(' ');
  return text.length > max ? text.slice(0, max).trimEnd() + '…' : text;
}

/** Tải ảnh lên Storage, trả về link công khai. */
export async function uploadPostImage(userId: string, file: File): Promise<string> {
  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Chỉ hỗ trợ ảnh JPG, PNG, WEBP hoặc GIF.');
  }
  if (file.size > MAX_IMAGE_MB * 1024 * 1024) {
    throw new Error(`Ảnh quá lớn, tối đa ${MAX_IMAGE_MB}MB.`);
  }
  const ext = file.type.split('/')[1].replace('jpeg', 'jpg');
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(POST_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
  });
  if (error) throw new Error('Không tải được ảnh: ' + error.message);
  return supabase.storage.from(POST_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Tải video lên Storage (cùng bucket với ảnh), trả về link công khai. */
export async function uploadPostVideo(userId: string, file: File): Promise<string> {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    throw new Error('Chỉ hỗ trợ video MP4, WEBM hoặc MOV.');
  }
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
    throw new Error(`Video quá lớn, tối đa ${MAX_VIDEO_MB}MB.`);
  }
  const ext = file.type.split('/')[1].replace('quicktime', 'mov');
  const path = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from(POST_BUCKET).upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type,
  });
  if (error) throw new Error('Không tải được video: ' + error.message);
  return supabase.storage.from(POST_BUCKET).getPublicUrl(path).data.publicUrl;
}

/** Lấy đường dẫn file trong bucket từ các link ảnh + video có trong bài (để xóa khi xóa bài / gỡ khỏi bài). */
export function imagePathsInContent(content: string): string[] {
  const marker = `/${POST_BUCKET}/`;
  const paths: string[] = [];
  for (const line of content.split('\n')) {
    const t = line.trim();
    const url = t.match(IMAGE_LINE)?.[2] ?? t.match(VIDEO_LINE)?.[1];
    if (url && url.includes(marker)) paths.push(decodeURIComponent(url.split(marker)[1]));
  }
  return paths;
}