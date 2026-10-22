import { IMAGE_LINE } from '@/lib/posts';
import RichLine from '@/components/RichLine';

/** Hiển thị nội dung blog: dòng chữ -> đoạn văn, dòng ![](url) -> ảnh. */
export default function PostContent({ content }: { content: string }) {
  return (
    <div className="space-y-5">
      {content.split('\n').map((line, i) => {
        const t = line.trim();
        if (!t) return null;
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