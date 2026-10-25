import { IMAGE_LINE, VIDEO_LINE, makeExcerpt } from '@/lib/posts';

export type PostKind = 'video' | 'photo' | 'text';

export const KIND_LABEL: Record<PostKind, string> = {
  video: 'Video',
  photo: 'Ảnh',
  text: 'Chia sẻ',
};

const pad = (n: number) => String(n).padStart(2, '0');

function wordCount(content: string): number {
  return makeExcerpt(content, 100000).split(/\s+/).filter(Boolean).length;
}

/** Suy ra loại bài từ nội dung: có video / nhiều ảnh ít chữ / còn lại là chia sẻ. */
export function postKind(content: string): PostKind {
  let images = 0;
  let hasVideo = false;
  for (const line of content.split('\n')) {
    const t = line.trim();
    if (VIDEO_LINE.test(t)) hasVideo = true;
    else if (IMAGE_LINE.test(t)) images++;
  }
  if (hasVideo) return 'video';
  if (images >= 2) return 'photo';
  if (images === 1 && wordCount(content) < 30) return 'photo';
  return 'text';
}

/** Thời gian đọc ước tính (phút), tối thiểu 1. */
export function readMinutes(content: string): number {
  return Math.max(1, Math.round(wordCount(content) / 200));
}
/** Ngày đăng dạng gọn kiểu báo mạng: "22/10/2026". */
export function shortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Nhãn giờ cho tin vắn: hôm nay thì "14:32", cũ hơn thì "25/10". */
export function briefStamp(dateStr: string): string {
  const d = new Date(dateStr);
  const same = d.toDateString() === new Date().toDateString();
  return same ? `${pad(d.getHours())}:${pad(d.getMinutes())}` : `${pad(d.getDate())}/${pad(d.getMonth() + 1)}`;
}

/** Dòng ngày kiểu đầu báo: "Chủ nhật, 25/10/2026". */
export function dateLine(d: Date = new Date()): string {
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  return `${days[d.getDay()]}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** Bài đăng trong vòng `hours` giờ gần đây (mặc định 24). */
export function isFresh(dateStr: string, hours = 24): boolean {
  return Date.now() - new Date(dateStr).getTime() < hours * 3600 * 1000;
}