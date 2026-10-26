import { useMemo } from 'react';
import { Image as ImageIcon, PlayCircle } from 'lucide-react';
import { extractCover, makeExcerpt, type Post } from '@/lib/posts';
import { accentFor, postKind, shortDate } from '@/lib/postMeta';
import { findRelatedPosts } from '@/lib/related';

type Props = {
  current: Post;
  posts: Post[];
  onOpen: (post: Post) => void;
};

export default function RelatedPosts({ current, posts, onOpen }: Props) {
  const related = useMemo(() => findRelatedPosts(current, posts, 4), [current, posts]);

  // Không có bài liên quan thì không hiện gì cả
  if (related.length === 0) return null;

  return (
    <section className="mt-14 border-t-2 border-gray-200 pt-8" aria-label="Tin liên quan">
      <div className="mb-5 flex items-center gap-3">
        <span className="h-6 w-1.5 rounded-full bg-teal-500" />
        <h2 className="font-display text-2xl font-extrabold tracking-tight text-gray-900">Tin liên quan</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {related.map((p) => {
          const accent = accentFor(p.id);
          const cover = p.cover_url || extractCover(p.content);
          const kind = postKind(p.content);
          const excerpt = makeExcerpt(p.content, 110);

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => onOpen(p)}
              className={`group flex gap-3 rounded-xl border-l-4 bg-white p-3 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${accent.bar}`}
            >
              {cover ? (
                <img
                  src={cover}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-20 w-24 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-20 w-24 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-400">
                  {kind === 'video' ? <PlayCircle className="h-6 w-6" /> : <ImageIcon className="h-6 w-6" />}
                </div>
              )}

              <div className="min-w-0 flex-1">
                <h3
                  className={`line-clamp-2 font-serif text-base font-bold leading-snug text-gray-900 transition-colors ${accent.hover}`}
                >
                  {p.title || excerpt || 'Bài viết'}
                </h3>
                {p.title && excerpt && (
                  <p className="mt-1 line-clamp-2 text-xs text-gray-500">{excerpt}</p>
                )}
                <div className="mt-1.5 text-xs font-semibold text-gray-500">
                  <span className={accent.text}>{p.author_name}</span>
                  <span className="mx-1.5">·</span>
                  <time dateTime={p.created_at}>{shortDate(p.created_at)}</time>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}