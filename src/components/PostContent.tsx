import { IMAGE_LINE, VIDEO_LINE } from '@/lib/posts';
import RichLine from '@/components/RichLine';
import VideoEmbed from '@/components/VideoEmbed';
import { splitAlign } from '@/lib/richText';

/** Hiển thị nội dung blog: dòng chữ -> đoạn văn (giữ phông, cỡ, màu, đậm...), ![](url) -> ảnh, @[video](url) -> video (YouTube nhúng hoặc video thường). */
export default function PostContent({ content }: { content: string }) {
  return (
    <div className="space-y-5">
      {content.split('\n').map((line, i) => {
        const t = line.trim();
        if (!t) return null;

        const v = t.match(VIDEO_LINE);
        if (v) return <VideoEmbed key={i} url={v[1]} />;

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

        const { align, html } = splitAlign(t);
        return (
          <p key={i} className="whitespace-pre-wrap" style={{ textAlign: align }}>
            <RichLine html={html} />
          </p>
        );
      })}
    </div>
  );
}