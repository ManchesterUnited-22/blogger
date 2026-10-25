import { ArrowLeft } from 'lucide-react';
import type { Post } from '@/lib/posts';
import { shortDate } from '@/lib/postMeta';
import PostContent from '@/components/PostContent';
import type { User } from '@supabase/supabase-js';
import CommentSection from '@/components/CommentSection';
import PostActions from '@/components/PostActions';

type Props = { post: Post; user: User | null; onLoginClick: () => void; onBack: () => void };

export default function PostDetail({ post, user, onLoginClick, onBack }: Props) {
  return (
    <article className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại
      </button>

      {post.title && (
        <h1 className="font-serif text-3xl font-black leading-tight text-gray-900 lg:text-5xl">{post.title}</h1>
      )}

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
          <div className="leading-tight">
            <div className="font-medium text-gray-700">{post.author_name}</div>
            <time dateTime={post.created_at} className="text-xs font-semibold uppercase tracking-wider text-gray-600">
              {shortDate(post.created_at)}
            </time>
          </div>
        </div>
      </div>

      <div className="mt-8 text-lg leading-relaxed text-gray-700">
        <PostContent content={post.content} />
      </div>

      <PostActions post={post} user={user} onLoginClick={onLoginClick} />
      <CommentSection postId={post.id} postOwnerId={post.user_id} user={user} onLoginClick={onLoginClick} />
    </article>
  );
}