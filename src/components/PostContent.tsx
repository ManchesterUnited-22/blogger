import { IMAGE_LINE, VIDEO_LINE } from '@/lib/posts';
import RichLine from '@/components/RichLine';

/** Hiển thị nội dung blog: dòng chữ -> đoạn văn (giữ phông, cỡ, màu, đậm...), ![](url) -> ảnh, @[video](url) -> video. */
export default function PostContent({ content }: { content: string }) {
  return (
    <div className="space-y-5">
      {content.split('\n').map((line, i) => {
        const t = line.trim();
        if (!t) return null;

        const v = t.match(VIDEO_LINE);
        if (v) {
          return (
            <video
              key={i}
              src={v[1]}
              controls
              playsInline
              preload="metadata"
              className="max-h-[32rem] w-full rounded-2xl bg-black"
            />
          );
        }

        const m = t.match(IMAGE_LINE);
        if (m) {
          return (
            <img
              key={i}
              src={m[2]}
              alt={m[1] || ''}
              loading="lazy"
              className="w-full rounded-2xl object-cover"
            />
          );
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            <RichLine html={t} />
          </p>
        );
      })}
    </div>
  );
}