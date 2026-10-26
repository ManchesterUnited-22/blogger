import { makeExcerpt, type Post } from '@/lib/posts';

/** Từ nối / từ phổ biến tiếng Việt, bỏ qua khi so khớp. */
const STOP = new Set([
  'và', 'là', 'của', 'có', 'cho', 'các', 'những', 'một', 'này', 'đó', 'được', 'trong',
  'với', 'để', 'khi', 'đã', 'sẽ', 'rất', 'cũng', 'như', 'nhưng', 'thì', 'mà', 'ở',
  'từ', 'đến', 'ra', 'vào', 'lên', 'xuống', 'nên', 'bị', 'vì', 'nếu', 'hay', 'hoặc',
  'tôi', 'bạn', 'chúng', 'mình', 'anh', 'chị', 'em', 'họ', 'nó', 'ta', 'về', 'theo',
  'người', 'không', 'còn', 'đang', 'rằng', 'lại', 'nhiều', 'ít', 'hơn', 'nhất', 'cả',
  'the', 'and', 'of', 'to', 'in', 'is', 'for', 'on', 'with', 'a', 'an',
]);

/** Tách chữ -> các đặc trưng (từ đơn + cặp từ liền kề để bắt cụm như "ngoại hạng"). */
function features(text: string): string[] {
  const words = text
    .toLowerCase()
    .normalize('NFC')
    .split(/[^\p{L}\p{N}]+/u)
    .filter(Boolean);

  const out: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const ok = w.length > 1 && !STOP.has(w) && !/^\d+$/.test(w);
    if (ok) out.push(w);
    const n = words[i + 1];
    if (ok && n && n.length > 1 && !STOP.has(n) && !/^\d+$/.test(n)) out.push(`${w} ${n}`);
  }
  return out;
}

/** Vector đặc trưng của một bài: tiêu đề nặng gấp 3 so với nội dung. */
function vectorOf(post: Post): Map<string, number> {
  const v = new Map<string, number>();
  const add = (list: string[], weight: number) => {
    for (const f of list) v.set(f, (v.get(f) ?? 0) + weight);
  };
  add(features(post.title ?? ''), 3);
  add(features(makeExcerpt(post.content, 3000)), 1);
  return v;
}

/**
 * Tìm các bài liên quan tới `current`.
 * Chỉ trả về bài có độ giống đủ cao; không có thì trả về mảng rỗng.
 */
export function findRelatedPosts(current: Post, all: Post[], limit = 4): Post[] {
  const others = all.filter((p) => p.id !== current.id);
  if (others.length === 0) return [];

  const vecs = new Map<string, Map<string, number>>();
  vecs.set(current.id, vectorOf(current));
  for (const p of others) vecs.set(p.id, vectorOf(p));

  // IDF: từ xuất hiện ở ít bài thì có giá trị phân biệt cao hơn
  const df = new Map<string, number>();
  for (const v of vecs.values()) for (const f of v.keys()) df.set(f, (df.get(f) ?? 0) + 1);
  const N = vecs.size;
  const weigh = (v: Map<string, number>) => {
    const w = new Map<string, number>();
    let norm = 0;
    for (const [f, tf] of v) {
      const x = (1 + Math.log(tf)) * Math.log(1 + N / (df.get(f) ?? 1));
      w.set(f, x);
      norm += x * x;
    }
    return { w, norm: Math.sqrt(norm) || 1 };
  };

  const cur = weigh(vecs.get(current.id)!);

  const scored = others.map((p) => {
    const other = weigh(vecs.get(p.id)!);
    let dot = 0;
    for (const [f, x] of cur.w) {
      const y = other.w.get(f);
      if (y) dot += x * y;
    }
    let score = dot / (cur.norm * other.norm); // cosine 0..1
    if (score > 0 && p.user_id === current.user_id) score += 0.04; // cùng tác giả: cộng nhẹ
    return { post: p, score };
  });

  const MIN_SCORE = 0.08; // tăng lên nếu thấy gợi ý hơi lan man, giảm xuống nếu muốn hiện nhiều hơn
  return scored
    .filter((s) => s.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score || +new Date(b.post.created_at) - +new Date(a.post.created_at))
    .slice(0, limit)
    .map((s) => s.post);
}