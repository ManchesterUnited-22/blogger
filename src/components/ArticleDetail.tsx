import { Calendar, Clock, ArrowLeft, Share2 } from 'lucide-react';
import type { Article } from '@/lib/supabase';
import { categoryLabels, categoryColors, formatDate } from '@/lib/supabase';

type Props = {
  article: Article;
  onBack: () => void;
};

export default function ArticleDetail({ article, onBack }: Props) {
  const cat = categoryColors[article.category] ?? categoryColors['tin-tuc'];

  return (
    <article className="mx-auto max-w-3xl px-6 py-10">
      <button
        onClick={onBack}
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-gray-600 transition-colors hover:text-teal-600"
      >
        <ArrowLeft className="h-4 w-4" />
        Quay lại trang chủ
      </button>

      <span className={`inline-block rounded-full px-3 py-1 text-xs font-bold text-white ${cat.solid}`}>
        {categoryLabels[article.category] ?? article.category}
      </span>

      <h1 className="mt-4 text-3xl font-extrabold leading-tight text-gray-900 lg:text-4xl">
        {article.title}
      </h1>

      <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="h-4 w-4" />
          {formatDate(article.published_at)}
        </div>
        {article.author && (
          <div className="flex items-center gap-2">
            {article.author.avatar_url && (
              <img src={article.author.avatar_url} alt={article.author.name} className="h-7 w-7 rounded-full object-cover" />
            )}
            <span className="font-medium text-gray-700">{article.author.name}</span>
            <span className="text-gray-400">· {article.author.role}</span>
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl">
        <img src={article.image_url} alt={article.title} className="w-full object-cover" />
      </div>

      <div className="mt-8 space-y-4 text-lg leading-relaxed text-gray-700">
        {article.content.split('\n').map((para, i) => (
          <p key={i} className={i === 0 ? 'font-medium text-gray-800' : ''}>
            {para}
          </p>
        ))}
      </div>

      {article.author?.bio && (
        <div className="mt-10 flex items-start gap-4 rounded-2xl bg-gray-50 p-6">
          {article.author.avatar_url && (
            <img src={article.author.avatar_url} alt={article.author.name} className="h-14 w-14 rounded-full object-cover" />
          )}
          <div>
            <div className="font-bold text-gray-900">{article.author.name}</div>
            <div className="text-sm text-teal-600">{article.author.role}</div>
            <p className="mt-1 text-sm text-gray-500">{article.author.bio}</p>
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-teal-600"
        >
          <ArrowLeft className="h-4 w-4" />
          Về trang chủ
        </button>
        <button className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-200">
          <Share2 className="h-4 w-4" />
          Chia sẻ
        </button>
      </div>
    </article>
  );
}
