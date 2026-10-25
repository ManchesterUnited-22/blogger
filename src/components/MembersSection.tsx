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
  { bar: 'border-t-teal-500', text: 'text-teal-600', bg: 'bg-teal-50' },
  { bar: 'border-t-orange-500', text: 'text-orange-600', bg: 'bg-orange-50' },
  { bar: 'border-t-sky-500', text: 'text-sky-600', bg: 'bg-sky-50' },
  { bar: 'border-t-rose-500', text: 'text-rose-600', bg: 'bg-rose-50' },
];

// Thẻ nghiêng so le như ảnh dán trên bảng tin; rê chuột thì ngay ngắn lại
const TILTS = ['-rotate-1', 'rotate-1', 'rotate-0', 'rotate-1', '-rotate-1', 'rotate-0'];

export default function MembersSection({ members, postCounts, currentUserId }: Props) {
  const totalPosts = members.reduce((n, m) => n + (postCounts[m.id] ?? 0), 0);
  const topCount = members.reduce((max, m) => Math.max(max, postCounts[m.id] ?? 0), 0);

  return (
    <section id="members" className="scroll-mt-20 border-t border-gray-900 bg-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        {/* Đầu mục: giống "Góc cộng đồng" */}
        <div className="border-t-4 border-gray-900">
          <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-gray-300 py-2.5 text-xs font-bold uppercase tracking-widest text-gray-700">
            <span>Danh bạ cây bút</span>
            <span className="inline-flex items-center gap-2">
              <span className="font-serif text-xl font-black leading-none tabular-nums text-gray-900">
                {members.length}
              </span>
              thành viên
              <span aria-hidden className="h-4 w-px bg-gray-300" />
              <span className="font-serif text-xl font-black leading-none tabular-nums text-gray-900">
                {totalPosts}
              </span>
              bài viết
            </span>
          </div>
          <div className="py-6">
            <h2 className="flex items-center gap-3 font-serif text-4xl font-black tracking-tight text-gray-900">
              <span aria-hidden className="inline-block h-3.5 w-3.5 rotate-45 rounded-sm bg-orange-500" />
              Những cây bút đồng hành
            </h2>
            <p className="mt-1 font-serif text-base italic text-gray-700">
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
                {/* Miếng băng keo */}
                {i % 3 === 0 && (
                  <span
                    aria-hidden
                    className="absolute -top-3 left-1/2 z-10 h-5 w-14 -translate-x-1/2 -rotate-3 bg-orange-200/90 shadow-sm"
                  />
                )}

                <article
                  className={`flex h-full flex-col border border-gray-900 border-t-4 bg-white p-3 shadow-[4px_4px_0_0_#111827] transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-[6px_6px_0_0_#111827] ${accent.bar} ${
                    isMe ? 'ring-2 ring-orange-400 ring-offset-2' : ''
                  }`}
                >
                  {/* Số thứ tự + nhãn */}
                  <div className="flex items-center justify-between gap-2 text-[10px] font-bold uppercase tracking-widest">
                    <span className="tabular-nums text-gray-600">Nº {String(i + 1).padStart(2, '0')}</span>
                    {isMe ? (
                      <span className="rounded-sm bg-orange-500 px-1.5 py-0.5 text-white">Bạn</span>
                    ) : isTop ? (
                      <span className="rounded-sm bg-gray-900 px-1.5 py-0.5 text-white">Nhiều bài nhất</span>
                    ) : null}
                  </div>

                  {/* Ảnh chân dung vuông */}
                  <div className="mt-2 aspect-square w-full overflow-hidden border border-gray-900 bg-[#faf8f3]">
                    {m.avatar_url ? (
                      <img
                        src={m.avatar_url}
                        alt={name}
                        referrerPolicy="no-referrer"
                        loading="lazy"
                        className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div
                        className={`flex h-full w-full items-center justify-center font-serif text-6xl font-black ${accent.bg} ${accent.text}`}
                      >
                        {name.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>

                  {/* Tên */}
                  <h3
                    className="mt-3 line-clamp-2 font-serif text-lg font-bold leading-snug text-gray-900"
                    title={name}
                  >
                    {name}
                  </h3>

                  {/* Số bài: đường kẻ đứt như phiếu */}
                  <div className="mt-auto flex items-end justify-between gap-2 border-t border-dashed border-gray-400 pt-2">
                    {count > 0 ? (
                      <>
                        <span className="font-serif text-3xl font-black leading-none tabular-nums text-gray-900">
                          {count}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-widest text-gray-600">
                          bài viết
                        </span>
                      </>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest text-teal-700">
                        <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-teal-500" />
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