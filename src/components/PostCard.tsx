import { Heart, MessageCircle } from 'lucide-react';
import { timeAgo } from '@/lib/supabase';
import { makeExcerpt, type Post } from '@/lib/posts';
import { accentFor } from '@/lib/postMeta';

type Props = {
  post: Post;
  onClick: () => void;
  likes?: number;
  comments?: number;
};

export default function PostCard({ post, onClick, likes = 0, comments = 0 }: Props) {
  const hasCover = !!post.cover_url;
  const accent = accentFor(post.id);

  return (
    <article onClick={onClick} className="group flex h-full cursor-pointer flex-col">
      {/* Có ảnh thì hiện ảnh; không có ảnh thì chỉ có đường kẻ màu ở trên */}
      {hasCover ? (
        <div className="aspect-[16/10] overflow-hidden rounded-2xl bg-gray-100">
          <img
            src={post.cover_url as string}
            alt={post.title || 'Ảnh bài viết'}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      ) : (
        <div className={`h-1.5 rounded-full ${accent.line}`} />
      )}

      <div className="flex flex-1 flex-col pt-5">
        {post.title && (
          <h3 className={`line-clamp-2 font-serif text-2xl font-bold leading-snug text-gray-900 transition-colors ${accent.hover}`}>
            {post.title}
          </h3>
        )}
        <p
          className={`text-base leading-relaxed text-gray-600 ${post.title ? 'mt-3' : ''} ${
            hasCover ? 'line-clamp-3' : 'line-clamp-6'
          }`}
        >
          {makeExcerpt(post.content) || 'Bài viết có ảnh/video, bấm để xem.'}
        </p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-5 text-sm text-gray-500">
          <div className="flex min-w-0 items-center gap-2.5">
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full ${accent.avatar} text-xs font-bold text-white`}>
              {post.author_avatar ? (
                <img
                  src={post.author_avatar}
                  alt={post.author_name}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover"
                />
              ) : (
                post.author_name.charAt(0).toUpperCase()
              )}
            </div>
            <span className="truncate font-semibold text-gray-700">{post.author_name}</span>
            <span aria-hidden>·</span>
            <time dateTime={post.created_at} className="shrink-0">
              {timeAgo(post.created_at)}
            </time>
          </div>
          <div className="flex shrink-0 items-center gap-3">
            <span className="inline-flex items-center gap-1.5" title="Lượt thích">
              <Heart className={`h-4 w-4 ${likes > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {likes}
            </span>
            <span className="inline-flex items-center gap-1.5" title="Bình luận">
              <MessageCircle className="h-4 w-4" />
              {comments}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
}