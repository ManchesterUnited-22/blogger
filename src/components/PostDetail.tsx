import { ArrowLeft, Calendar } from 'lucide-react';
import { formatDate } from '@/lib/supabase';
import type { Post } from '@/lib/posts';
import PostContent from '@/components/PostContent';

type Props = { post: Post; onBack: () => void };

export default function PostDetail({ post, onBack }: Props) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </button>

      <h1 className="text-3xl font-extrabold leading-tight text-gray-900 lg:text-4xl">{post.title}</h1>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 text-xs font-bold text-white">
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
          <span className="font-medium text-gray-700">{post.author_name}</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {formatDate(post.created_at)}
        </div>
      </div>

      <div className="mt-8 text-lg leading-relaxed text-gray-700">
        <PostContent content={post.content} />
      </div>
    </article>
  );
}