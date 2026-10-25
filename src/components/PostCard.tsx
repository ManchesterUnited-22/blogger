import { ArrowRight, Calendar, Heart, MessageCircle } from 'lucide-react';
import { formatDate } from '@/lib/supabase';
import { makeExcerpt, type Post } from '@/lib/posts';

type Props = {
  post: Post;
  onClick: () => void;
  likes?: number;
  comments?: number;
};

export default function PostCard({ post, onClick, likes = 0, comments = 0 }: Props) {
  const hasCover = !!post.cover_url;

  return (
    <article
      onClick={onClick}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl bg-white shadow-md ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Ảnh bìa; bài không có ảnh thì chỉ có dải màu mảnh ở trên */}
      {hasCover ? (
        <div className="relative aspect-[16/10] overflow-hidden bg-gray-100">
          <img
            src={post.cover_url as string}
            alt={post.title || 'Ảnh bài viết'}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/25 to-transparent" />
        </div>
      ) : (
        <div className="h-1.5 bg-gradient-to-r from-teal-400 via-cyan-400 to-orange-300" />
      )}

      <div className="flex flex-1 flex-col p-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-sm font-bold text-white">
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
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-gray-800">{post.author_name}</div>
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Calendar className="h-3 w-3" />
              {formatDate(post.created_at)}
            </div>
          </div>
        </div>

        {post.title && (
          <h3 className="mt-4 line-clamp-2 text-xl font-extrabold leading-snug text-gray-900 transition-colors group-hover:text-teal-600">
            {post.title}
          </h3>
        )}
        <p
          className={`text-[15px] leading-relaxed text-gray-600 ${post.title ? 'mt-2' : 'mt-4'} ${
            hasCover ? 'line-clamp-3' : 'line-clamp-5'
          }`}
        >
          {makeExcerpt(post.content) || 'Bài viết có ảnh/video, bấm để xem.'}
        </p>

        <div className="mt-auto flex items-center justify-between pt-5">
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <span className="inline-flex items-center gap-1.5" title="Lượt thích">
              <Heart className={`h-4 w-4 ${likes > 0 ? 'fill-rose-500 text-rose-500' : ''}`} />
              {likes}
            </span>
            <span className="inline-flex items-center gap-1.5" title="Bình luận">
              <MessageCircle className="h-4 w-4" />
              {comments}
            </span>
          </div>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-900 px-4 py-1.5 text-sm font-semibold text-white transition-colors group-hover:bg-teal-600">
            Đọc tiếp
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}