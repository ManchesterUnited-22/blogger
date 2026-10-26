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

const COLORS = [
  { ring: 'bg-teal-400', solid: 'bg-teal-500', num: 'text-teal-600' },
  { ring: 'bg-orange-400', solid: 'bg-orange-500', num: 'text-orange-600' },
  { ring: 'bg-cyan-400', solid: 'bg-cyan-500', num: 'text-cyan-600' },
  { ring: 'bg-violet-400', solid: 'bg-violet-500', num: 'text-violet-600' },
  { ring: 'bg-pink-400', solid: 'bg-pink-500', num: 'text-pink-600' },
  { ring: 'bg-amber-400', solid: 'bg-amber-500', num: 'text-amber-600' },
];

/** Số người hiện sẵn ở trạng thái thu gọn */
const VISIBLE = 7;

type Color = (typeof COLORS)[number];

function MemberChip({
  m,
  color,
  count,
  isMe,
  large,
}: {
  m: Member;
  color: Color;
  count: number;
  isMe: boolean;
  large?: boolean;
}) {
  const name = m.full_name || 'Thành viên';
  return (
    <li
      className="group flex w-20 flex-col items-center text-center"
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
        <span
          className={`absolute -bottom-1 -right-1 flex h-6 min-w-[1.5rem] items-center justify-center rounded-full bg-white px-1 text-[11px] font-extrabold tabular-nums shadow ring-2 ring-white ${color.num}`}
        >
          {count > 0 ? count : '✨'}
        </span>
      </div>
      <span className="mt-2 w-full truncate text-xs font-semibold text-gray-800">{isMe ? 'Bạn' : name}</span>
    </li>
  );
}

export default function MembersSection({ members, postCounts, currentUserId }: Props) {
  const [open, setOpen] = useState(false);

  // Người đăng nhiều bài nhất đứng đầu
  const sorted = [...members].sort((a, b) => (postCounts[b.id] ?? 0) - (postCounts[a.id] ?? 0));
  const totalPosts = members.reduce((n, m) => n + (postCounts[m.id] ?? 0), 0);
  const hidden = sorted.length - VISIBLE;
  const expandable = hidden > 0;

  const renderChips = (list: Member[], large: boolean) =>
    list.map((m) => (
      <MemberChip
        key={m.id}
        m={m}
        color={COLORS[sorted.indexOf(m) % COLORS.length]}
        count={postCounts[m.id] ?? 0}
        isMe={m.id === currentUserId}
        large={large}
      />
    ));

  return (
    <section id="members" className="scroll-mt-20 py-8">
      <div className="mx-auto max-w-6xl px-6">
        <div className="rounded-3xl border border-violet-100 bg-white/80 p-5 shadow-sm sm:p-6">
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

          {/* Thu gọn: một hàng + ô "+N" */}
          {!open && (
            <ul className="mt-5 flex flex-wrap justify-center gap-5">
              {renderChips(sorted.slice(0, VISIBLE), false)}
              {expandable && (
                <li className="flex w-20 flex-col items-center text-center">
                  <button
                    type="button"
                    onClick={() => setOpen(true)}
                    aria-label={`Xem thêm ${hidden} thành viên`}
                    className="flex h-[4.5rem] w-[4.5rem] items-center justify-center rounded-full border-2 border-dashed border-violet-300 bg-violet-50 font-display text-lg font-extrabold text-violet-600 transition-colors hover:bg-violet-100"
                  >
                    +{hidden}
                  </button>
                  <span className="mt-2 text-xs font-semibold text-gray-500">Xem thêm</span>
                </li>
              )}
            </ul>
          )}

          {/* Mở rộng: danh bạ đầy đủ */}
          {open && (
            <ul className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-6">{renderChips(sorted, true)}</ul>
          )}
        </div>
      </div>
    </section>
  );
}