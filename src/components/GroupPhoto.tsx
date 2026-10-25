import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

/* ===================== CẤU HÌNH ===================== */
const INTERVAL_MS = 3500; // thời gian dừng ở mỗi ảnh
const SLIDE_MS = 700; // thời gian trượt giữa 2 ảnh
const PLAY_ONLY_ON_HOVER = false; // true: rê chuột mới chạy | false: luôn tự chạy

type Caption = { title?: string; sub?: string };

// Chú thích mặc định cho ảnh nào không có trong CAPTIONS
const DEFAULT_CAPTION: Caption = {
  
  sub: 'Dã ngoại thực tế Đà Nẵng – Quy Nhơn · Thực tập Nhận thức',
};

// (Tùy chọn) chú thích riêng cho từng ảnh, khóa là TÊN FILE.
// Chỉ ghi title, chỉ ghi sub, hoặc cả hai đều được. Đặt {} nếu không muốn chữ.
const CAPTIONS: Record<string, Caption> = {
  '01.jpg': { sub: 'Dã ngoại thực tế Đà Nẵng – Quy Nhơn · Thực tập Nhận thức' },
  // '02.jpg': { title: 'Tháp Đôi Quy Nhơn', sub: 'Di tích Chăm Pa' },
};
/* ==================================================== */

// Tự gom mọi ảnh trong src/assets/gallery, xếp theo tên file
const modules = import.meta.glob('../assets/gallery/*.{jpg,jpeg,png,webp,JPG,PNG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;

type Photo = { src: string; title?: string; sub?: string };

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

  // Máy tính: rê chuột mới chạy. Điện thoại (không có chuột): tự chạy luôn
  const playing = total > 1 && !reduceMotion && (!PLAY_ONLY_ON_HOVER || !canHover || hovering);

  const next = useCallback(() => {
    setAnimate(true);
    setIndex((i) => i + 1);
  }, []);

  const prev = useCallback(() => {
    setAnimate(true);
    setIndex((i) => (i <= 0 ? total - 1 : Math.min(i, total) - 1));
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
    if (total === 0) {
    return (
      <section className="mx-auto max-w-6xl px-6 pb-2 pt-4">
        <p className="rounded-2xl border border-violet-100 bg-white p-6 text-center text-sm text-gray-500">
          Chưa có ảnh nào. Hãy bỏ ảnh vào thư mục <code>src/assets/gallery/</code>.
        </p>
      </section>
    );
  }

  const current = photos[index % total] ?? photos[0];

  return (
    <section className="px-6 pb-10 pt-6">
      <div className="mx-auto max-w-6xl">
      <ScrollReveal>
        <div className="bg-pop-anim rounded-[2rem] p-1.5 shadow-2xl shadow-teal-500/25">
        <figure
          className="group relative aspect-[3/2] w-full select-none overflow-hidden rounded-[1.6rem] bg-gray-100"
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
                alt={p.title ?? p.sub ?? 'Ảnh chuyến đi Quy Nhơn'}
                loading={i < 2 ? 'eager' : 'lazy'}
                decoding="async"
                draggable={false}
                className="h-full w-full shrink-0 object-cover"
              />
            ))}
          </div>

          {/* Lớp mờ dưới ảnh để chữ dễ đọc */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

          {/* Chú thích (đổi theo ảnh hiện tại) */}
          <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4 sm:p-6">
            <div key={index % total} className="animate-[fadeIn_0.6s_ease]">
              {current.title && (
                <div className="text-lg font-extrabold text-white drop-shadow sm:text-2xl">{current.title}</div>
              )}
              {current.sub && (
                <div
                  className={
                    current.title
                      ? 'mt-0.5 text-xs text-white/85 sm:text-sm'
                      : 'text-base font-semibold text-white drop-shadow sm:text-lg'
                  }
                >
                  {current.sub}
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-white sm:text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-gray-900 shadow-lg backdrop-blur">
                <CalendarDays className="h-4 w-4 text-pink-500" /> 15–18/10/2026
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/90 px-3.5 py-1.5 text-xs font-bold text-gray-900 shadow-lg backdrop-blur">
                <MapPin className="h-4 w-4 text-cyan-500" /> Quy Nhơn
              </span>
            </div>
          </figcaption>

          {/* Bộ đếm ảnh */}
          {total > 1 && (
            <div className="absolute right-3 top-3 rounded-full bg-black/40 px-3 py-1 font-serif text-xs font-bold tabular-nums text-white backdrop-blur">
              {String((index % total) + 1).padStart(2, '0')}
              <span className="text-white/60"> / {String(total).padStart(2, '0')}</span>
            </div>
          )}

          {/* Mũi tên (chỉ hiện trên máy tính khi rê chuột) */}
          {total > 1 && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Ảnh trước"
                className="absolute left-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-violet-700 opacity-0 shadow-lg backdrop-blur transition-all hover:scale-110 hover:bg-white group-hover:opacity-100 md:flex"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Ảnh sau"
                className="absolute right-3 top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-violet-700 opacity-0 shadow-lg backdrop-blur transition-all hover:scale-110 hover:bg-white group-hover:opacity-100 md:flex"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </>
          )}
        </figure>
        </div>
      </ScrollReveal>
      </div>
    </section>
  );
}