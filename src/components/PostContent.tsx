import { useMemo, useState } from 'react';
import { IMAGE_LINE, VIDEO_LINE, stripCreditLines } from '@/lib/posts';
import RichLine from '@/components/RichLine';
import VideoEmbed from '@/components/VideoEmbed';
import Lightbox, { type LightboxImage } from '@/components/Lightbox';
import { splitAlign } from '@/lib/richText';

/** Hiển thị nội dung blog: dòng chữ -> đoạn văn (giữ phông, cỡ, màu, đậm...), ![](url) -> ảnh (bấm để phóng to), @[video](url) -> video. */
export default function PostContent({ content }: { content: string }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  // Bỏ dòng ghi công kiểu "Bởi ... | Ngày đăng: [...]" ở đầu bài
  const lines = useMemo(() => stripCreditLines(content.split('\n')), [content]);

  // Gom mọi ảnh trong bài để lướt qua lại trong lightbox
  const images = useMemo<LightboxImage[]>(() => {
    const list: LightboxImage[] = [];
    for (const line of lines) {
      const m = line.trim().match(IMAGE_LINE);
      if (m) list.push({ alt: m[1] || '', src: m[2] });
    }
    return list;
  }, [lines]);

  let imageCounter = 0;

  return (
    <>
      <div className="space-y-5">
        {lines.map((line, i) => {
          const t = line.trim();
          if (!t) return null;

          const v = t.match(VIDEO_LINE);
          if (v) return <VideoEmbed key={i} url={v[1]} />;

          const m = t.match(IMAGE_LINE);
          if (m) {
            const idx = imageCounter++;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setOpenIndex(idx)}
                aria-label="Xem ảnh lớn"
                className="block w-full cursor-zoom-in overflow-hidden rounded-2xl"
              >
                <img
                  src={m[2]}
                  alt={m[1] || ''}
                  loading="lazy"
                  className="w-full object-cover transition duration-300 hover:brightness-95"
                />
              </button>
            );
          }

          const { align, html } = splitAlign(t);
          return (
            <p key={i} className="whitespace-pre-wrap" style={{ textAlign: align }}>
              <RichLine html={html} />
            </p>
          );
        })}
      </div>

      {openIndex !== null && (
        <Lightbox
          images={images}
          index={openIndex}
          onClose={() => setOpenIndex(null)}
          onIndexChange={setOpenIndex}
        />
      )}
    </>
  );
}