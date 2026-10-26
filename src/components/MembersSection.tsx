import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export type Member = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

type Props = {
  members: Member[];
  postCounts: Record<string, number>;
  currentUserId?: string;
};

// Mỗi người một màu: viền vòng ảnh, chữ cái đầu và số bài
const COLORS = [
  { ring: 'bg-teal-400', solid: 'bg-teal-500', num: 'text-teal-600' },
  { ring: 'bg-orange-400', solid: 'bg-orange-500', num: 'text-orange-600' },
  { ring: 'bg-cyan-400', solid: 'bg-cyan-500', num: 'text-cyan-600' },
  { ring: 'bg-violet-400', solid: 'bg-violet-500', num: 'text-violet-600' },
  { ring: 'bg-pink-400', solid: 'bg-pink-500', num: 'text-pink-600' },
  { ring: 'bg-amber-400', solid: 'bg-amber-500', num: 'text-amber-600' },
];

/** Từ chừng này thành viên trở lên mới dùng dải trôi + nút "Xem tất cả". */
const MARQUEE_MIN = 8;

type Color = (typeof COLORS)[number];

function MemberChip({
  m,
  color,
  count,
  isMe,
  large,
  className,
}: {
  m: Member;
  color: Color;
  count: number;
  isMe: boolean;
  large?: boolean;
  className?: string;
}) {
  const name = m.full_name || 'Thành viên';
  return (
    <li
      className={`group flex flex-col items-center text-center ${className ?? ''}`}
      title={count > 0 ? `${name} · ${count} bài viết` : `${name} · Cây bút mới`}
    >
      <div className="relative">
        <div
          className={`rounded-full p-1 shadow-md transition-transform duration-300 group-hover:-translate-y-1 group-hover:scale-105 ${color.ring} ${
            isMe ? 'ring-2 ring-yellow-300 ring-offset-2 ring-offset-white' : ''
          }`}
        >
          <div
            className={`overflow-hidden rounded-full border-2 border-white bg-white ${
              large ? 'h-16 w-16' : 'h-14 w-14'
            }`}
          >
            {m.avatar_url ? (
              <img
                src={m.avatar_url}
                alt={name}
                referrerPolicy="no-referrer"
                loading="lazy"
                className="h-full w-full object-cover"
              />
            ) : (
              <div
                className={`flex h-full w-full items-center justify-center font-display text-xl font-extrabold text-white ${color.solid}`}
              >
                {name.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
        </div>

        {/* Bong bóng số bài (✨ nếu là cây bút mới) */}
        <span
          className={`absolute -bottom-1 -right-1 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white px-1 text-[11px] font-extrabold tabular-nums shadow ring-2 ring-white ${color.num}`}
        >
          {count > 0 ? count : '✨'}
        </span>
      </div>

      <span className="mt-2 w-full truncate text-xs font-semibold text-gray-800">
        {isMe ? 'Bạn' : name}
      </span>
    </li>
  );
}

export default function MembersSection({ members, postCounts, currentUserId }: Props) {
  const [open, setOpen] = useState(false);

  // Người đăng nhiều bài nhất đứng đầu
  const sorted = [...members].sort((a, b) => (postCounts[b.id] ?? 0) - (postCounts[a.id] ?? 0));
  const totalPosts = members.reduce((n, m) => n + (postCounts[m.id] ?? 0), 0);
  const expandable = sorted.length >= MARQUEE_MIN;

  const chips = (large: boolean, className: string) =>
    sorted.map((m, i) => (
      <MemberChip
        key={m.id}
        m={m}
        color={COLORS[i % COLORS.length]}
        count={postCounts[m.id] ?? 0}
        isMe={m.id === currentUserId}
        large={large}
        className={className}
      />
    ));

  return (
    <section id="members" className="scroll-mt-20 py-8">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-3xl border border-violet-100 bg-white/80 p-5 shadow-sm backdrop-blur sm:p-6">
          {/* Đầu thẻ: tên mục, số liệu, nút mở rộng */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
              <h2 className="font-display text-xl font-extrabold tracking-tight text-ink sm:text-2xl">
                Cây bút <span className="text-pop">đồng hành</span>
              </h2>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                {members.length} thành viên · {totalPosts} bài
              </span>
            </div>

            {expandable && (
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className="inline-flex items-center gap-1.5 rounded-full border border-violet-200 bg-white px-4 py-1.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-violet-50 hover:text-violet-700"
              >
                {open ? 'Thu gọn' : `Xem tất cả ${members.length}`}
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
              </button>
            )}
          </div>
          <p className="mt-1 text-xs text-gray-500">Mỗi người một câu chuyện, cùng viết nên trang báo này</p>

          {/* Ít thành viên: hiện hết thành một hàng */}
          {!expandable && (
            <ul className="mt-5 flex flex-wrap justify-center gap-6">{chips(false, 'w-20')}</ul>
          )}

          {/* Nhiều thành viên, đang thu gọn: dải avatar trôi ngang, rê chuột thì dừng */}
          {expandable && !open && (
            <div className="mt-4 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_6%,black_94%,transparent)]">
              <div
                className="flex w-max animate-marquee py-2 hover:[animation-play-state:paused] motion-reduce:animate-none"
                style={{ animationDuration: `${Math.max(30, sorted.length * 4)}s` }}
              >
                {[0, 1].map((k) => (
                  <ul key={k} aria-hidden={k === 1} className="flex shrink-0 gap-5 pr-5">
                    {chips(false, 'w-20 shrink-0')}
                  </ul>
                ))}
              </div>
            </div>
          )}

          {/* Mở rộng: danh bạ đầy đủ xổ xuống tại chỗ */}
          {expandable && (
            <div
              aria-hidden={!open}
              className={`grid transition-[grid-template-rows] duration-500 ease-out ${
                open ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
              }`}
            >
              <div className="overflow-hidden">
                <ul className="grid grid-cols-3 gap-x-3 gap-y-6 pt-6 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8">
                  {chips(true, 'w-full')}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}