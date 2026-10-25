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

// Mỗi thẻ một màu nhấn (vạch trên) + màu chữ cái đầu khi chưa có ảnh
const ACCENTS = [
  { bar: 'border-t-teal-500', text: 'text-teal-400', bg: 'bg-teal-950' },
  { bar: 'border-t-volt', text: 'text-volt', bg: 'bg-ink-600' },
  { bar: 'border-t-orange-500', text: 'text-orange-400', bg: 'bg-orange-950' },
  { bar: 'border-t-white', text: 'text-white', bg: 'bg-ink-600' },
];

// Thẻ nghiêng so le như ảnh dán trên bảng tin; rê chuột thì ngay ngắn lại
const TILTS = ['-rotate-1', 'rotate-1', 'rotate-0', 'rotate-1', '-rotate-1', 'rotate-0'];

export default function MembersSection({ members, postCounts, currentUserId }: Props) {
  const totalPosts = members.reduce((n, m) => n + (postCounts[m.id] ?? 0), 0);
  const topCount = members.reduce((max, m) => Math.max(max, postCounts[m.id] ?? 0), 0);

  return (
    <section id="members" className="relative scroll-mt-20 overflow-hidden bg-ink py-20 text-white">
      {/* Nền: lưới chấm + quầng đỏ */}
      <div aria-hidden className="dots absolute inset-0" />
      <div
        aria-hidden
        className="absolute -right-40 top-10 h-[28rem] w-[28rem] animate-glow rounded-full bg-teal-600/25 blur-[120px]"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Đầu mục */}
        <div className="border-t-8 border-teal-600">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-white/20 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-400">
            <span>Danh bạ cây bút</span>
            <span className="inline-flex items-center gap-2">
              <span className="font-display text-2xl leading-none tabular-nums text-volt">{members.length}</span>
              thành viên
              <span aria-hidden className="h-4 w-px bg-white/20" />
              <span className="font-display text-2xl leading-none tabular-nums text-volt">{totalPosts}</span>
              bài viết
            </span>
          </div>
          <div className="py-6">
            <h2 className="flex items-center gap-3 font-display text-5xl uppercase leading-none tracking-tight text-white sm:text-6xl">
              <span aria-hidden className="skew-sting inline-block h-10 w-3 bg-teal-500" />
              Những cây bút <span className="text-teal-500">đồng hành</span>
            </h2>
            <p className="mt-3 text-base text-gray-400">
              Mỗi người một câu chuyện, cùng viết nên trang blog này
            </p>
          </div>
        </div>

        {/* Bảng thẻ phóng viên */}
        <ul className="mt-4 grid grid-cols-2 gap-x-5 gap-y-9 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {members.map((m, i) => {
            const name = m.full_name || 'Thành viên';
            const count = postCounts[m.id] ?? 0;
            const accent = ACCENTS[i % ACCENTS.length];
            const isMe = m.id === currentUserId;
            const isTop = topCount >= 2 && count === topCount;

            return (
              <li
                key={m.id}
                className={`group relative transition-transform duration-300 hover:rotate-0 ${TILTS[i % TILTS.length]}`}
              >
                {/* Miếng băng vàng */}
                {i % 3 === 0 && (
                  <span
                    aria-hidden
                    className="absolute -top-3 left-1/2 z-10 h-5 w-14 -translate-x-1/2 -rotate-3 bg-volt/90 shadow-sm"
                  />
                )}

                <article
                  className={`flex h-full flex-col border border-white/15 border-t-4 bg-ink-800 p-3 shadow-[4px_4px_0_0_#d4002b] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[7px_7px_0_0_#f0173a] ${accent.bar} ${
                    isMe ? 'ring-2 ring-volt ring-offset-2 ring-offset-ink' : ''
                  }`}
                >
                  {/* Số thứ tự + nhãn */}
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <span className="tabular-nums text-gray-500">Nº {String(i + 1).padStart(2, '0')}</span>
                    {isMe ? (
                      <span className="bg-volt px-1.5 py-0.5 text-ink">Bạn</span>
                    ) : isTop ? (
                      <span className="bg-teal-600 px-1.5 py-0.5 text-white">Nhiều bài nhất</span>
                    ) : null}
                  </div>

                  {/* Ảnh chân dung vuông */}
                  <div className="mt-2 aspect-square w-full overflow-hidden border border-white/15 bg-ink">
                    {m.avatar_url ? (
                      <img
                        src={m.avatar_url}
                        alt={name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="h-full w-full object-cover transition-all duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center font-display text-7xl ${accent.bg} ${accent.text}`}
                      >
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Tên */}
                  <h3
                    className="mt-3 line-clamp-2 font-serif text-lg font-bold uppercase leading-snug text-white"
                    title={name}
                  >
                    {name}
                  </h3>

                  {/* Số bài */}
                  <div className="mt-auto flex items-end justify-between gap-2 border-t border-dashed border-white/20 pt-2">
                    {count > 0 ? (
                      <>
                        <span className="font-display text-4xl leading-none tabular-nums text-teal-500">{count}</span>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">bài viết</span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-volt">
                        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-volt" />
                        Cây bút mới
                      </span>
                    )}
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}