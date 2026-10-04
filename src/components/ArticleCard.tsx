import { Calendar } from 'lucide-react';
import type { Article } from '@/lib/supabase';
import { categoryLabels, categoryColors, formatDate } from '@/lib/supabase';

type Props = {
  article: Article;
  onClick: () => void;
};

export default function ArticleCard({ article, onClick }: Props) {
  const cat = categoryColors[article.category] ?? categoryColors['tin-tuc'];

  return (
    <article
      onClick={onClick}
      className="group flex h-full cursor-pointer flex-col overflow-hidden rounded-2xl bg-white shadow-md ring-1 ring-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
    >
      <div className="relative h-52 overflow-hidden">
        <img
          src={article.image_url}
          alt={article.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className={`absolute inset-x-0 top-0 h-1.5 bg-gradient-to-r ${cat.gradient}`} />
        <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-xs font-bold text-white ${cat.solid}`}>
          {categoryLabels[article.category] ?? article.category}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="line-clamp-2 text-lg font-bold leading-snug text-gray-900 group-hover:text-teal-600 transition-colors">
          {article.title}
        </h3>
        <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-gray-500">
          {article.excerpt}
        </p>
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <Calendar className="h-3.5 w-3.5" />
            {formatDate(article.published_at)}
          </div>
          {article.author && (
            <div className="flex items-center gap-2">
              {article.author.avatar_url && (
                <img
                  src={article.author.avatar_url}
                  alt={article.author.name}
                  className="h-6 w-6 rounded-full object-cover"
                />
              )}
              <span className="text-xs font-medium text-gray-600">{article.author.name}</span>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
