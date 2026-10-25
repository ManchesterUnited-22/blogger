import { useState, type KeyboardEvent } from 'react';
import { ArrowRight, Heart, MessageCircle, PenLine } from 'lucide-react';

import { makeExcerpt, type Post } from '@/lib/posts';
import { briefStamp, isFresh, readMinutes, shortDate } from '@/lib/postMeta';
import ScrollReveal from '@/components/ScrollReveal';

type Stat = { likes: number; comments: number } | undefined;
type Props = {
  posts: Post[];
  stats: Record<string, { likes: number; comments: number }>;
  onOpen: (post: Post) => void;
  /** Bấm "Viết bài" ở khung Gửi bài */
  onWrite: () => void;
};

/** Gạch chân cam trượt ra khi rê chuột lên tiêu đề (hoạt động cả khi tiêu đề xuống dòng). */
const UNDERLINE =
  'box-decoration-clone bg-gradient-to-r from-orange-400 to-orange-400 bg-[length:0%_2px] bg-left-bottom bg-no-repeat transition-[background-size] duration-300 group-hover:bg-[length:100%_2px]';

/** Cho phép mở bài bằng bàn phím */
const linkProps = (activate: () => void) => ({
  role: 'link' as const,
  tabIndex: 0,
  onKeyDown: (e: KeyboardEvent) => {
    if (e.key === 'Enter') activate();
  },
});

const headlineOf = (p: Post, max = 90) => p.title || makeExcerpt(p.content, max) || 'Bài viết có ảnh/video';

/* ---------- Mảnh nhỏ dùng chung ---------- */
function Kicker({ post, likes }: { post: Post; likes: number }) {
  return (
    <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
      {isFresh(post.created_at) && (
        <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-teal-600">
          <span className="h-1.5 w-1.5 rounded-full bg-teal-500" />
          Mới
        </span>
      )}
      {likes >= 3 && (
        <span className="rounded-sm bg-rose-50 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-rose-600">
          Được yêu thích
        </span>
      )}
    </div>
  );
}

function Avatar({ post, className }: { post: Post; className: string }) {
  return (
    <span
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 font-bold text-white ${className}`}
    >
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
    </span>
  );
}

function Byline({ post, small }: { post: Post; small?: boolean }) {
  return (
    <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-gray-600 ${small ? 'text-xs' : 'text-sm'}`}>
      <Avatar post={post} className={small ? 'h-5 w-5 text-[10px]' : 'h-7 w-7 text-xs'} />
      <span className="font-semibold text-gray-800">{post.author_name}</span>
      <span aria-hidden>·</span>
      <time dateTime={post.created_at} className="text-xs font-semibold uppercase tracking-wider text-gray-600">
        {shortDate(post.created_at)}
      </time>
      <span aria-hidden>·</span>
      <span className="font-semibold text-teal-700">{readMinutes(post.content)} phút đọc</span>
    </div>
  );
}
function Counts({ stat }: { stat: Stat }) {
  const likes = stat?.likes ?? 0;
  const comments = stat?.comments ?? 0;
  return (
    <div className="flex shrink-0 items-center gap-4 font-serif text-base font-black tabular-nums text-gray-900">
      <span className="inline-flex items-center gap-1.5" title="Lượt thích">
        <Heart className={`h-4 w-4 ${likes > 0 ? 'fill-rose-500 text-rose-500' : 'text-gray-500'}`} />
        {likes}
      </span>
      <span className="inline-flex items-center gap-1.5" title="Bình luận">
        <MessageCircle className={`h-4 w-4 ${comments > 0 ? 'text-teal-600' : 'text-gray-500'}`} />
        {comments}
      </span>
    </div>
  );
}

/* ---------- Tin chính ---------- */
function LeadStory({
  post,
  stat,
  wide,
  onOpen,
}: {
  post: Post;
  stat: Stat;
  /** wide: không có cột phụ -> ảnh một bên, chữ một bên */
  wide: boolean;
  onOpen: (p: Post) => void;
}) {
  const sapo = post.title ? makeExcerpt(post.content, 260) : '';
  const titleSize = wide ? 'text-3xl lg:text-4xl' : 'text-3xl lg:text-[2.6rem]';

  if (post.cover_url) {
    return (
      <article
        {...linkProps(() => onOpen(post))}
        onClick={() => onOpen(post)}
        className={`group cursor-pointer ${wide ? 'grid gap-8 lg:grid-cols-5 lg:items-center' : ''}`}
      >
        <div className={`aspect-[16/10] overflow-hidden rounded-md bg-gray-200 ${wide ? 'lg:col-span-3' : ''}`}>
          <img
            src={post.cover_url}
            alt={post.title || 'Ảnh bài viết'}
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        </div>
        <div className={wide ? 'mt-5 lg:col-span-2 lg:mt-0' : 'mt-5'}>
          <Kicker post={post} likes={stat?.likes ?? 0} />
          <h3 className={`mt-2 line-clamp-4 font-serif font-black leading-tight text-gray-900 ${titleSize}`}>
            <span className={UNDERLINE}>{headlineOf(post)}</span>
          </h3>
          {sapo && <p className="mt-3 line-clamp-3 text-lg leading-relaxed text-gray-600">{sapo}</p>}
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <Byline post={post} />
            <Counts stat={stat} />
          </div>
        </div>
      </article>
    );
  }

  // Tin chính không có ảnh: chữ lớn, vạch cam bên trái
  return (
    <article
      {...linkProps(() => onOpen(post))}
      onClick={() => onOpen(post)}
      className="group relative cursor-pointer overflow-hidden border-l-4 border-orange-500 py-2 pl-6"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-6 right-2 select-none font-serif text-[10rem] leading-none text-gray-900/5"
      >
        “
      </span>
      <Kicker post={post} likes={stat?.likes ?? 0} />
      <h3 className={`relative mt-2 line-clamp-4 font-serif font-black leading-tight text-gray-900 ${titleSize}`}>
        <span className={UNDERLINE}>{headlineOf(post, 140)}</span>
      </h3>
      {sapo && <p className="relative mt-4 line-clamp-5 text-lg leading-relaxed text-gray-600">{sapo}</p>}
      <div className="relative mt-5 flex flex-wrap items-center justify-between gap-3">
        <Byline post={post} />
        <Counts stat={stat} />
      </div>
    </article>
  );
}

/* ---------- Tin phụ (cột phải) ---------- */
function SideStory({
  post,
  stat,
  divider,
  onOpen,
}: {
  post: Post;
  stat: Stat;
  divider: boolean;
  onOpen: (p: Post) => void;
}) {
  return (
    <article
      {...linkProps(() => onOpen(post))}
      onClick={() => onOpen(post)}
      className={`group cursor-pointer ${divider ? 'border-b border-gray-300 pb-6' : ''}`}
    >
      <div className="aspect-[16/10] overflow-hidden rounded-md bg-gray-200">
        <img
          src={post.cover_url as string}
          alt={post.title || 'Ảnh bài viết'}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-3">
        <Kicker post={post} likes={stat?.likes ?? 0} />
        <h3 className="mt-1.5 line-clamp-3 font-serif text-xl font-bold leading-snug text-gray-900">
          <span className={UNDERLINE}>{headlineOf(post)}</span>
        </h3>
        <div className="mt-2">
          <Byline post={post} small />
        </div>
      </div>
    </article>
  );
}

/* ---------- Góc nhìn: bài chữ kèm chân dung tác giả (giữ nguyên màu) ---------- */
function OpinionCard({ post, stat, onOpen }: { post: Post; stat: Stat; onOpen: (p: Post) => void }) {
  const main = post.title || makeExcerpt(post.content, 170) || 'Bài viết có ảnh/video';
  const sub = post.title ? makeExcerpt(post.content, 120) : '';
  return (
    <article
      {...linkProps(() => onOpen(post))}
      onClick={() => onOpen(post)}
      className="group relative cursor-pointer overflow-hidden rounded-md border-t-4 border-orange-500 bg-white p-5 shadow-sm ring-1 ring-gray-200/70 transition-shadow hover:shadow-md"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -right-1 -top-5 select-none font-serif text-8xl leading-none text-orange-500/15"
      >
        “
      </span>
      <div className="relative flex items-center gap-3.5">
        <Avatar
          post={post}
          className="h-16 w-16 text-2xl ring-2 ring-orange-400 ring-offset-2 transition-transform duration-300 group-hover:scale-105"
        />
        <div className="min-w-0">
          <div className="text-[11px] font-bold uppercase tracking-widest text-orange-600">Góc nhìn</div>
          <div className="truncate font-semibold text-gray-900">{post.author_name}</div>
            <div className="text-xs font-semibold uppercase tracking-wider text-gray-600">
            <time dateTime={post.created_at}>{shortDate(post.created_at)}</time>
            {' · '}
            {readMinutes(post.content)} phút đọc
          </div>
        </div>
      </div>
      <blockquote className="relative mt-4 line-clamp-5 font-serif text-xl font-bold leading-snug text-gray-900">
        <span className={UNDERLINE}>{main}</span>
      </blockquote>
      {sub && <p className="relative mt-2 line-clamp-2 text-sm leading-relaxed text-gray-600">{sub}</p>}
      <div className="relative mt-4 flex justify-end">
        <Counts stat={stat} />
      </div>
    </article>
  );
}
/* ---------- Tin vắn (bài chỉ có chữ) ---------- */
function Brief({ post, onOpen }: { post: Post; onOpen: (p: Post) => void }) {
  const sub = post.title ? makeExcerpt(post.content, 140) : '';
  return (
    <article
      {...linkProps(() => onOpen(post))}
      onClick={() => onOpen(post)}
      className="group grid cursor-pointer grid-cols-[3.25rem_1fr] gap-3 border-b border-dotted border-gray-300 py-4"
    >
      <time dateTime={post.created_at} className="pt-0.5 text-sm font-extrabold tabular-nums text-orange-600">
        {briefStamp(post.created_at)}
      </time>
      <div className="min-w-0">
        <h4 className="line-clamp-2 font-serif text-lg font-bold leading-snug text-gray-900">
          <span className={UNDERLINE}>{headlineOf(post)}</span>
        </h4>
        {sub && <p className="mt-1 line-clamp-2 text-sm text-gray-600">{sub}</p>}
        <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-gray-600">
          {post.author_name} · {shortDate(post.created_at)}
        </p>
      </div>
    </article>
  );
}

/* ---------- Bài trong lưới ---------- */
function GridStory({ post, stat, onOpen }: { post: Post; stat: Stat; onOpen: (p: Post) => void }) {
  const sapo = post.title ? makeExcerpt(post.content, 180) : '';
  return (
    <article
      {...linkProps(() => onOpen(post))}
      onClick={() => onOpen(post)}
      className="group flex h-full cursor-pointer flex-col border-t border-gray-300 pt-5"
    >
      <div className="aspect-[16/10] overflow-hidden rounded-md bg-gray-200">
        <img
          src={post.cover_url as string}
          alt={post.title || 'Ảnh bài viết'}
          loading="lazy"
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="mt-4">
        <Kicker post={post} likes={stat?.likes ?? 0} />
        <h3 className="mt-2 line-clamp-3 font-serif text-2xl font-bold leading-snug text-gray-900">
          <span className={UNDERLINE}>{headlineOf(post)}</span>
        </h3>
        {sapo && <p className="mt-2 line-clamp-3 text-base leading-relaxed text-gray-600">{sapo}</p>}
      </div>
      <div className="mt-auto flex items-center justify-between gap-3 pt-4">
        <Byline post={post} small />
        <Counts stat={stat} />
      </div>
    </article>
  );
}

/* ---------- Khung "Gửi bài": bấm vào bất kỳ đâu trong khung là mở trình viết bài ---------- */
function SubmitStrip({ big, onWrite }: { big: boolean; onWrite: () => void }) {
  if (big) {
    return (
      <button
        type="button"
        onClick={onWrite}
        className="group relative block w-full overflow-hidden rounded-md border border-gray-900 bg-white px-6 py-12 text-center shadow-[6px_6px_0_0_#111827] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-teal-50/40 hover:shadow-[3px_3px_0_0_#111827]"
      >
        <span
          aria-hidden
          className="pointer-events-none absolute -left-2 -top-8 select-none font-serif text-[9rem] leading-none text-orange-500/10"
        >
          “
        </span>
        <span className="relative block font-serif text-3xl font-black text-gray-900 sm:text-4xl">
          <span className={UNDERLINE}>Bạn có câu chuyện muốn chia sẻ?</span>
        </span>
        <span className="relative mx-auto mt-3 block max-w-xl text-lg text-gray-600">
          Một góc phố, một món ngon, một khoảnh khắc khó quên… kể cho mọi người cùng nghe nhé.
        </span>
        <span className="relative mt-6 inline-flex items-center gap-2 text-base font-bold text-teal-700">
          <PenLine className="h-5 w-5" />
          Chạm vào đây để viết
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
      </button>
    );
  }
  return (
    <button
      type="button"
      onClick={onWrite}
      className="group block w-full border-y border-gray-300 py-5 text-left transition-colors hover:bg-teal-50/40"
    >
      <span className="font-serif text-xl font-bold text-gray-900">
        Bạn có câu chuyện muốn chia sẻ?{' '}
        <span className="inline-flex items-center gap-1.5 whitespace-nowrap text-teal-700 underline decoration-teal-300 decoration-2 underline-offset-4 transition-colors group-hover:decoration-teal-600">
          <PenLine className="h-5 w-5" />
          Kể ngay
          <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1.5" />
        </span>
      </span>
    </button>
  );
}

/* ====================== TRANG NHẤT ====================== */
const BRIEFS_SHOWN = 6;

export default function PostFrontPage({ posts, stats, onOpen, onWrite }: Props) {
  const [showAllBriefs, setShowAllBriefs] = useState(false);
  if (posts.length === 0) return null;

  const covered = posts.filter((p) => p.cover_url);
  const plain = posts.filter((p) => !p.cover_url);

  // Tin chính: bài có ảnh đầu tiên; chưa có bài nào có ảnh thì lấy bài chữ đầu tiên
  const lead = covered[0] ?? plain[0];
  const restCovered = covered[0] ? covered.slice(1) : [];
  const restPlain = covered[0] ? plain : plain.slice(1);

  const sideStories = restCovered.slice(0, 2); // tin phụ (có ảnh)
  const opinion = restPlain[0]; // Góc nhìn: bài chữ đầu tiên còn lại
  const briefsAll = restPlain.slice(1); // phần chữ còn lại -> tin vắn
  const gridStories = restCovered.slice(2); // bài có ảnh còn lại

  const hasAside = sideStories.length > 0 || !!opinion;
  const briefs = showAllBriefs ? briefsAll : briefsAll.slice(0, BRIEFS_SHOWN);

  return (
    <div className="space-y-12">
      {/* Tin chính (+ cột phụ nếu có). Không có cột phụ thì tin chính tự trải ngang. */}
      <div className={hasAside ? 'grid gap-10 lg:grid-cols-3' : ''}>
        <div className={hasAside ? 'lg:col-span-2' : ''}>
          <ScrollReveal>
            <LeadStory post={lead} stat={stats[lead.id]} wide={!hasAside} onOpen={onOpen} />
          </ScrollReveal>
        </div>

        {hasAside && (
          <aside className="space-y-6 lg:border-l lg:border-gray-300 lg:pl-8">
            {sideStories.map((p, i) => (
              <ScrollReveal key={p.id} delay={(i + 1) * 80}>
                <SideStory
                  post={p}
                  stat={stats[p.id]}
                  divider={i < sideStories.length - 1 || !!opinion}
                  onOpen={onOpen}
                />
              </ScrollReveal>
            ))}
            {opinion && (
              <ScrollReveal delay={(sideStories.length + 1) * 80}>
                <OpinionCard post={opinion} stat={stats[opinion.id]} onOpen={onOpen} />
              </ScrollReveal>
            )}
          </aside>
        )}
      </div>

      {/* Tin vắn */}
      {briefsAll.length > 0 && (
        <section>
          <h3 className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-900">
            <span aria-hidden className="h-2.5 w-2.5 bg-orange-500" />
            Tin vắn
            <span className="h-px flex-1 bg-gray-300" />
          </h3>
          <div className="grid md:grid-cols-2 md:gap-x-10">
            {briefs.map((p) => (
              <ScrollReveal key={p.id}>
                <Brief post={p} onOpen={onOpen} />
              </ScrollReveal>
            ))}
          </div>
          {briefsAll.length > BRIEFS_SHOWN && (
            <div className="mt-5 text-center">
              <button
                type="button"
                onClick={() => setShowAllBriefs((s) => !s)}
                className="rounded-full border border-gray-300 bg-white px-5 py-2 text-sm font-semibold text-gray-700 transition hover:border-orange-400 hover:text-orange-600"
              >
                {showAllBriefs ? 'Thu gọn' : `Xem thêm ${briefsAll.length - BRIEFS_SHOWN} tin vắn`}
              </button>
            </div>
          )}
        </section>
      )}

      {/* Các bài khác */}
      {gridStories.length > 0 && (
        <section>
          <h3 className="mb-6 flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-gray-900">
            <span aria-hidden className="h-2.5 w-2.5 bg-teal-500" />
            Các bài khác
            <span className="h-px flex-1 bg-gray-300" />
          </h3>
          <div className="grid gap-x-10 gap-y-12 md:grid-cols-2">
            {gridStories.map((p, i) => (
              <ScrollReveal key={p.id} className="h-full" delay={(i % 2) * 70}>
                <GridStory post={p} stat={stats[p.id]} onOpen={onOpen} />
              </ScrollReveal>
            ))}
          </div>
        </section>
      )}

      {/* Gửi bài: to khi ít bài để trang không trống, gọn khi nhiều bài */}
      <ScrollReveal>
        <SubmitStrip big={posts.length <= 5} onWrite={onWrite} />
      </ScrollReveal>
    </div>
  );
}