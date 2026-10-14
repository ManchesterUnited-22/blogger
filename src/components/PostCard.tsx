import { ArrowRight, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/supabase';
import { makeExcerpt, type Post } from '@/lib/posts';

type Props = { post: Post; onClick: () => void };

export default function PostCard({ post, onClick }: Props) {
  return (
    <article
      onClick={onClick}
      className="group relative flex min-h-[20rem] cursor-pointer flex-col overflow-hidden rounded-3xl bg-gradient-to-br from-teal-50 to-cyan-50 shadow-md ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      {/* Ảnh chèn trong bài làm nền mờ phía sau */}
      {post.cover_url && (
        <>
          <img
            src={post.cover_url}
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full scale-110 object-cover opacity-30 blur-[3px] transition-all duration-500 group-hover:scale-125 group-hover:opacity-40"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/70 to-white/30" />
        </>
      )}

      <div className="relative flex flex-1 flex-col p-7">
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

        <h3 className="mt-5 line-clamp-2 text-2xl font-extrabold leading-snug text-gray-900 transition-colors group-hover:text-teal-600">
          {post.title}
        </h3>
        <p className="mt-3 line-clamp-4 text-[15px] leading-relaxed text-gray-700">
          {makeExcerpt(post.content)}
        </p>

        <div className="mt-auto pt-5">
          <span className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-5 py-2 text-sm font-semibold text-white transition-colors group-hover:bg-teal-600">
            Đọc tiếp
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </article>
  );
}