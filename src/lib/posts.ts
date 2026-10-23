import { supabase } from '@/lib/supabase';
import { lineToText } from '@/lib/richText';
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
export const MAX_IMAGE_MB = 50;
export const MAX_VIDEO_MB = 100;
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
     .map((l) => lineToText(l).trim())
     .filter(Boolean)
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
const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME as string | undefined;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET as string | undefined;

/**
 * Tải video lên Cloudinary (unsigned upload), trả về link công khai (https).
 * onProgress: tùy chọn, nhận số phần trăm 0-100 để hiện tiến độ.
 */
export function uploadPostVideo(
  userId: string,
  file: File,
  onProgress?: (percent: number) => void,
): Promise<string> {
  if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
    return Promise.reject(new Error('Chỉ hỗ trợ video MP4, WEBM hoặc MOV.'));
  }
  if (file.size > MAX_VIDEO_MB * 1024 * 1024) {
    return Promise.reject(new Error(`Video quá lớn, tối đa ${MAX_VIDEO_MB}MB.`));
  }
  if (!CLOUD_NAME || !UPLOAD_PRESET) {
    return Promise.reject(new Error('Chưa cấu hình Cloudinary (thiếu biến môi trường).'));
  }

  return new Promise((resolve, reject) => {
    const form = new FormData();
    form.append('file', file);
    form.append('upload_preset', UPLOAD_PRESET);
    form.append('tags', userId); // gắn id người đăng để dễ tìm trong Media Library

    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/video/upload`);

    xhr.upload.onprogress = (e) => {
      if (onProgress && e.lengthComputable) {
        onProgress(Math.round((e.loaded / e.total) * 100));
      }
    };

    xhr.onload = () => {
      let data: { secure_url?: string; error?: { message?: string } } = {};
      try {
        data = JSON.parse(xhr.responseText);
      } catch {
        /* bỏ qua */
      }
      if (xhr.status >= 200 && xhr.status < 300 && data.secure_url) {
        resolve(data.secure_url);
      } else {
        reject(new Error('Không tải được video: ' + (data.error?.message ?? `lỗi ${xhr.status}`)));
      }
    };

    xhr.onerror = () => reject(new Error('Không tải được video: lỗi mạng.'));
    xhr.send(form);
  });
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
/** Link Cloudinary -> bản MP4/H.264 chạy được trên mọi trình duyệt và điện thoại. */
export function playableVideoUrl(url: string): string {
  const marker = '/video/upload/';
  if (!url.includes('res.cloudinary.com') || !url.includes(marker) || url.includes(`${marker}f_mp4`)) {
    return url;
  }
  return url.replace(marker, `${marker}f_mp4,vc_h264,ac_aac/`).replace(/\.(mov|webm|mp4)$/i, '.mp4');
}

/** Ảnh bìa (khung hình đầu tiên) của video Cloudinary, để khung video không đen khi chưa phát. */
export function videoPosterUrl(url: string): string | undefined {
  const marker = '/video/upload/';
  if (!url.includes('res.cloudinary.com') || !url.includes(marker)) return undefined;
  return url.replace(marker, `${marker}so_0,f_jpg/`).replace(/\.\w+$/, '.jpg');
}