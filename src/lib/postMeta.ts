import { IMAGE_LINE, VIDEO_LINE, makeExcerpt } from '@/lib/posts';

export type PostKind = 'video' | 'photo' | 'text';

export const KIND_LABEL: Record<PostKind, string> = {
  video: 'Video',
  photo: 'Ảnh',
  text: 'Chia sẻ',
};

/** Bộ màu nhấn dịu, mỗi bài một màu (ngọc, san hô, đại dương, rêu, hồng đất, cát).
 *  Viết đủ tên lớp để Tailwind giữ lại khi build. */
export type Accent = {
  /** vạch kẻ bên trái */
  bar: string;
  /** đường kẻ gradient trên thẻ không có ảnh */
  line: string;
  /** màu tiêu đề khi rê chuột (đặt trong phần tử có class "group") */
  hover: string;
  /** chữ nhấn (giờ đăng, nhãn "Mới") */
  text: string;
  /** chấm tròn nhỏ */
  dot: string;
  /** nền ảnh đại diện khi không có ảnh */
  avatar: string;
};

export const ACCENTS: Accent[] = [
  { bar: 'border-teal-500', line: 'bg-teal-300', hover: 'group-hover:text-teal-700', text: 'text-teal-600', dot: 'bg-teal-500', avatar: 'bg-teal-500' },
  { bar: 'border-orange-400', line: 'bg-orange-300', hover: 'group-hover:text-orange-700', text: 'text-orange-600', dot: 'bg-orange-400', avatar: 'bg-orange-500' },
  { bar: 'border-cyan-500', line: 'bg-cyan-300', hover: 'group-hover:text-cyan-700', text: 'text-cyan-600', dot: 'bg-cyan-500', avatar: 'bg-cyan-500' },
  { bar: 'border-violet-400', line: 'bg-violet-300', hover: 'group-hover:text-violet-700', text: 'text-violet-600', dot: 'bg-violet-400', avatar: 'bg-violet-500' },
  { bar: 'border-pink-400', line: 'bg-pink-300', hover: 'group-hover:text-pink-700', text: 'text-pink-600', dot: 'bg-pink-400', avatar: 'bg-pink-500' },
  { bar: 'border-amber-400', line: 'bg-amber-300', hover: 'group-hover:text-amber-700', text: 'text-amber-600', dot: 'bg-amber-400', avatar: 'bg-amber-500' },
];

/** Chọn màu nhấn ổn định theo id bài: cùng một bài luôn ra cùng một màu. */
export function accentFor(id: string): Accent {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return ACCENTS[h % ACCENTS.length];
}

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