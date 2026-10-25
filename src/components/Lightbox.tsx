import { useCallback, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

export type LightboxImage = { src: string; alt: string };

type Props = {
  images: LightboxImage[];
  index: number;
  onClose: () => void;
  onIndexChange: (i: number) => void;
};

export default function Lightbox({ images, index, onClose, onIndexChange }: Props) {
  const total = images.length;
  const touchX = useRef<number | null>(null);

  const go = useCallback(
    (d: number) => onIndexChange((index + d + total) % total),
    [index, total, onIndexChange],
  );

  // Phím tắt + khóa cuộn trang phía sau
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowLeft') go(-1);
      else if (e.key === 'ArrowRight') go(1);
    };
    window.addEventListener('keydown', onKey);
    const old = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = old;
    };
  }, [go, onClose]);

  // Tải trước ảnh kế bên cho chuyển ảnh nhanh
  useEffect(() => {
    if (total < 2) return;
    [images[(index + 1) % total], images[(index - 1 + total) % total]].forEach((im) => {
      const img = new Image();
      img.src = im.src;
    });
  }, [index, images, total]);

  const current = images[index];
  if (!current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Xem ảnh"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null || total < 2) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1);
      }}
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="Đóng"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30"
      >
        <X className="h-5 w-5" />
      </button>

      {total > 1 && (
        <>
          <span className="absolute left-4 top-4 rounded-full bg-white/15 px-3 py-1.5 text-sm font-medium text-white">
            {index + 1}/{total}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(-1);
            }}
            aria-label="Ảnh trước"
            className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              go(1);
            }}
            aria-label="Ảnh sau"
            className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white hover:bg-white/30"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
        </>
      )}

      <figure className="flex max-h-full max-w-full flex-col items-center" onClick={(e) => e.stopPropagation()}>
        <img
          key={current.src}
          src={current.src}
          alt={current.alt}
          className="max-h-[85vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
        />
        {current.alt && <figcaption className="mt-3 max-w-xl text-center text-sm text-white/80">{current.alt}</figcaption>}
      </figure>
    </div>,
    document.body,
  );
}