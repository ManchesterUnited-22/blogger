import type { Article } from '@/lib/supabase';
import ArticleCard from '@/components/ArticleCard';

type Props = {
  articles: Article[];
  onOpen: (article: Article) => void;
};

/** Lưới tạp chí: 1 tin lớn + 1 ô cao + 1 ô ảnh + 1 ô màu nhấn. Ít hơn 4 tin thì chỉ hiện tin lớn. */
export default function ArticleBento({ articles, onOpen }: Props) {
  const [lead, tall, small, accent] = articles;
  if (!lead) return null;

  if (!tall || !small || !accent) {
    return (
      <ArticleCard
        variant="lead"
        article={lead}
        onClick={() => onOpen(lead)}
        className="min-h-[22rem] sm:min-h-[26rem]"
      />
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:h-[34rem] lg:grid-cols-4 lg:grid-rows-2">
      <ArticleCard
        variant="lead"
        article={lead}
        onClick={() => onOpen(lead)}
        className="min-h-[22rem] sm:col-span-2 lg:col-span-2 lg:row-span-2 lg:min-h-0"
      />
      <ArticleCard
        variant="tile"
        article={tall}
        onClick={() => onOpen(tall)}
        className="min-h-[16rem] lg:row-span-2 lg:min-h-0"
      />
      <ArticleCard
        variant="tile"
        article={small}
        onClick={() => onOpen(small)}
        className="min-h-[16rem] lg:min-h-0"
      />
      <ArticleCard
        variant="accent"
        article={accent}
        onClick={() => onOpen(accent)}
        className="min-h-[14rem] sm:col-span-2 lg:col-span-1 lg:min-h-0"
      />
    </div>
  );
}