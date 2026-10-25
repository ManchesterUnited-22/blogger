import { ArrowUpRight } from 'lucide-react';
import type { Article } from '@/lib/supabase';
import { timeAgo } from '@/lib/supabase';

type Props = {
  article: Article;
  onClick: () => void;
  /** lead: tin lớn phủ chữ · tile: ô ảnh phủ chữ · accent: ô màu nhấn · row: dòng trong danh sách số */
  variant?: 'lead' | 'tile' | 'accent' | 'row';
  /** Số thứ tự hiện ở variant "row" (bắt đầu từ 1) */
  index?: number;
  className?: string;
};

function Byline({ article, light, small }: { article: Article; light?: boolean; small?: boolean }) {
  const a = article.author;
  return (
    <div
      className={`flex flex-wrap items-center gap-x-2 gap-y-1 ${small ? 'text-xs' : 'text-sm'} ${
        light ? 'text-white/75' : 'text-gray-500'
      }`}
    >
      {a?.avatar_url && (
        <img
          src={a.avatar_url}
          alt={a.name}
          className={`rounded-full object-cover ${small ? 'h-5 w-5' : 'h-6 w-6'}`}
        />
      )}
      {a && <span className={`font-semibold ${light ? 'text-white' : 'text-gray-700'}`}>{a.name}</span>}
      {a && <span aria-hidden>·</span>}
      <time dateTime={article.published_at}>{timeAgo(article.published_at)}</time>
    </div>
  );
}

export default function ArticleCard({ article, onClick, variant = 'tile', index = 1, className = '' }: Props) {
  // Cho phép mở tin bằng bàn phím
  const a11y = {
    role: 'link' as const,
    tabIndex: 0,
    onKeyDown: (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') onClick();
    },
  };

  /* ---------- Dòng trong danh sách có số thứ tự ---------- */
  if (variant === 'row') {
    return (
      <article
        {...a11y}
        onClick={onClick}
        className={`group flex cursor-pointer items-center gap-4 border-b border-gray-200 py-5 sm:gap-6 ${className}`}
      >
        <span className="w-12 shrink-0 text-right font-serif text-4xl font-black leading-none text-gray-200 transition-colors group-hover:text-teal-400 sm:w-16 sm:text-5xl">
          {String(index).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="line-clamp-2 font-serif text-lg font-bold leading-snug text-gray-900 transition-colors group-hover:text-teal-700 sm:text-xl">
            {article.title}
          </h3>
          <p className="mt-1 hidden line-clamp-2 text-sm leading-relaxed text-gray-600 sm:block">{article.excerpt}</p>
          <div className="mt-2">
            <Byline article={article} small />
          </div>
        </div>
        <div className="h-20 w-28 shrink-0 overflow-hidden rounded-xl bg-gray-100 sm:h-24 sm:w-36">
          <img
            src={article.image_url}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </article>
    );
  }

  /* ---------- Ô màu nhấn (chấm phá) ---------- */
  if (variant === 'accent') {
    return (
      <article
        {...a11y}
        onClick={onClick}
        className={`group relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-pop p-5 text-white shadow-soft transition-all hover:-translate-y-0.5 hover:brightness-105 ${className}`}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -right-1 -top-8 select-none font-serif text-[9rem] leading-none text-white/15"
        >
          “
        </span>
        <span className="relative text-[11px] font-bold tracking-wide text-white/80">Đáng đọc</span>
        <h3 className="relative mt-2 line-clamp-4 font-serif text-xl font-bold leading-snug">{article.title}</h3>
        <p className="relative mt-2 line-clamp-2 text-sm leading-relaxed text-white/85">{article.excerpt}</p>
        <div className="relative mt-auto flex items-end justify-between gap-3 pt-4">
          <Byline article={article} light small />
          <ArrowUpRight className="h-5 w-5 shrink-0 transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </div>
      </article>
    );
  }

  /* ---------- Ô ảnh phủ chữ (lead + tile) ---------- */
  const isLead = variant === 'lead';
  return (
    <article
      {...a11y}
      onClick={onClick}
      className={`group relative cursor-pointer overflow-hidden rounded-2xl bg-gray-900 ${className}`}
    >
      <img
        src={article.image_url}
        alt={article.title}
        loading={isLead ? 'eager' : 'lazy'}
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/25 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        {isLead && (
          <span className="mb-3 inline-block rounded-full bg-white/90 px-3 py-1 text-[11px] font-bold tracking-wide text-teal-700 shadow-sm backdrop-blur">
            Tin nổi bật
          </span>
        )}
        <h3
          className={`font-serif font-bold text-white ${
            isLead
              ? 'line-clamp-4 text-2xl leading-tight sm:text-3xl lg:text-4xl'
              : 'line-clamp-3 text-lg leading-snug sm:text-xl'
          }`}
        >
          {article.title}
        </h3>
        {isLead && (
          <>
            <span className="mt-3 block h-1 w-14 rounded-full bg-gradient-to-r from-teal-300 to-cyan-300 transition-all duration-300 group-hover:w-28" />
            <p className="mt-3 hidden max-w-xl line-clamp-2 text-base leading-relaxed text-white/80 sm:block">
              {article.excerpt}
            </p>
          </>
        )}
        <div className="mt-3">
          <Byline article={article} light small={!isLead} />
        </div>
      </div>
    </article>
  );
}