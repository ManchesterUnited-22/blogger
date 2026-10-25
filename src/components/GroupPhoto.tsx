import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

/* ===================== CẤU HÌNH ===================== */
const INTERVAL_MS = 3500; // thời gian dừng ở mỗi ảnh
const SLIDE_MS = 700; // thời gian trượt giữa 2 ảnh
const PLAY_ONLY_ON_HOVER = false; // true: rê chuột mới chạy | false: luôn tự chạy

// Chú thích mặc định cho mọi ảnh
const DEFAULT_CAPTION = {
  
  sub: 'Dã ngoại thực tế Đà Nẵng – Quy Nhơn · Thực tập Nhận thức',
};

// (Tùy chọn) chú thích riêng cho từng ảnh, khóa là TÊN FILE
const CAPTIONS: Record<string, { title: string; sub?: string }> = {
  '01.jpg': { title: 'Eo Gió', sub: 'Dã ngoại thực tế Đà Nẵng – Quy Nhơn · Thực tập Nhận thức' },
  
};
/* ==================================================== */

// Tự gom mọi ảnh trong src/assets/gallery, xếp theo tên file
const modules = import.meta.glob('../assets/gallery/*.{jpg,jpeg,png,webp,JPG,PNG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

type Photo = { src: string; title: string; sub?: string };

export default function GroupPhoto() {
  const photos: Photo[] = useMemo(
    () =>
      Object.entries(modules)
        .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
        .map(([path, src]) => {
          const file = path.split('/').pop() ?? '';
          const cap = CAPTIONS[file] ?? DEFAULT_CAPTION;
          return { src, title: cap.title, sub: cap.sub };
        }),
    [],
  );
  const total = photos.length;

  // Thêm 1 bản sao ảnh đầu vào cuối để lặp vòng mượt (không bị giật ngược)
  const slides = total > 1 ? [...photos, photos[0]] : photos;

  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(true);
  const [hovering, setHovering] = useState(false);
  const touchX = useRef<number | null>(null);

  const canHover = useMemo(() => window.matchMedia('(hover: hover)').matches, []);
  const reduceMotion = useMemo(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches, []);

  const playing = total > 1 && !reduceMotion && (!PLAY_ONLY_ON_HOVER || !canHover || hovering);

  const next = useCallback(() => {
    setAnimate(true);
    setIndex((i) => i + 1);
  }, []);

  const prev = useCallback(() => {
    setAnimate(true);
    setIndex((i) => (i <= 0 ? total - 1 : (i >= total ? total : i) - 1));
  }, [total]);

  // Tự chuyển ảnh
  useEffect(() => {
    if (!playing) return;
    const t = setTimeout(next, INTERVAL_MS);
    return () => clearTimeout(t);
  }, [playing, index, next]);

  // Trượt tới bản sao ảnh đầu -> nhảy về ảnh đầu thật, không hiệu ứng
  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    if (index >= total) {
      setAnimate(false);
      setIndex(0);
      requestAnimationFrame(() => requestAnimationFrame(() => setAnimate(true)));
    }
  };

  const current = photos[index % total] ?? photos[0];

  if (total === 0) {
    return (
      <section className="mx-auto max-w-6xl px-6 pt-4">
        <p className="rounded-2xl bg-gray-50 p-6 text-center text-sm text-gray-500">
          Chưa có ảnh nào. Hãy bỏ ảnh vào thư mục <code>src/assets/gallery/</code>.
        </p>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-6 pt-4">
      <ScrollReveal>
        <figure
          className="group relative aspect-[3/2] w-full select-none overflow-hidden rounded-3xl border border-teal-100 bg-gray-100 shadow-xl"
          onMouseEnter={() => setHovering(true)}
          onMouseLeave={() => setHovering(false)}
          onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            touchX.current = null;
            if (Math.abs(dx) > 50) (dx < 0 ? next : prev)();
          }}
        >
          {/* Dải ảnh trượt ngang */}
          <div
            className="flex h-full w-full"
            style={{
              transform: `translateX(-${index * 100}%)`,
              transition: animate ? `transform ${SLIDE_MS}ms cubic-bezier(0.65, 0, 0.35, 1)` : 'none',
            }}
            onTransitionEnd={handleTransitionEnd}
          >
            {slides.map((p, i) => (
              <img
                key={i}
                src={p.src}
                alt={p.title}
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                className="h-full w-full shrink-0 object-cover"
              />
            ))}
          </div>

          {/* Lớp mờ dưới ảnh để chữ dễ đọc */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

          {/* Chú thích (đổi theo ảnh hiện tại) */}
          <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4 sm:p-6">
            <div key={index % total} className="animate-[fadeIn_0.6s_ease]">
              <div className="text-lg font-extrabold text-white drop-shadow sm:text-2xl">{current.title}</div>
              {current.sub && <div className="mt-0.5 text-xs text-white/85 sm:text-sm">{current.sub}</div>}
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-white sm:text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                <CalendarDays className="h-4 w-4" /> 15–18/10/2026
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                <MapPin className="h-4 w-4" /> Quy Nhơn
              </span>
            </div>
          </figcaption>

          {total > 1 && (
            <>
              {/* Mũi tên (chỉ hiện trên máy tính khi rê chuột) */}
              <button
                type="button"
                onClick={prev}
                aria-label="Ảnh trước"
                className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-900 opacity-0 shadow transition-opacity hover:bg-white group-hover:opacity-100 md:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Ảnh sau"
                className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/80 text-gray-900 opacity-0 shadow transition-opacity hover:bg-white group-hover:opacity-100 md:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>

             
             
            </>
          )}
        </figure>
      </ScrollReveal>
    </section>
  );
}