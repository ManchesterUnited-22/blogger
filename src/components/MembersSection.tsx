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

// Mỗi người một màu phẳng riêng: viền vòng ảnh, chữ cái đầu và số bài
const GRADIENTS = [
  { bg: 'bg-teal-400', solid: 'bg-teal-500', shadow: 'shadow-teal-300/60', num: 'text-teal-600' },
  { bg: 'bg-orange-400', solid: 'bg-orange-500', shadow: 'shadow-orange-300/60', num: 'text-orange-600' },
  { bg: 'bg-cyan-400', solid: 'bg-cyan-500', shadow: 'shadow-cyan-300/60', num: 'text-cyan-600' },
  { bg: 'bg-violet-400', solid: 'bg-violet-500', shadow: 'shadow-violet-300/60', num: 'text-violet-600' },
  { bg: 'bg-pink-400', solid: 'bg-pink-500', shadow: 'shadow-pink-300/60', num: 'text-pink-600' },
  { bg: 'bg-amber-400', solid: 'bg-amber-500', shadow: 'shadow-amber-300/60', num: 'text-amber-600' },
];

export default function MembersSection({ members, postCounts, currentUserId }: Props) {
  const totalPosts = members.reduce((n, m) => n + (postCounts[m.id] ?? 0), 0);
  const topCount = members.reduce((max, m) => Math.max(max, postCounts[m.id] ?? 0), 0);

  return (
    <section id="members" className="relative scroll-mt-20 overflow-hidden py-20">
      {/* Nền: các mảng màu mờ */}
      <div
        aria-hidden
        className="absolute -left-32 top-20 h-96 w-96 animate-float-slow rounded-full bg-cyan-200 opacity-30 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-32 bottom-10 h-96 w-96 animate-float rounded-full bg-orange-200 opacity-30 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute left-1/3 top-0 h-80 w-80 animate-float-slow rounded-full bg-violet-200 opacity-30 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Đầu mục */}
        <div className="text-center">
          <span className="bg-pop inline-block rounded-full px-4 py-1 text-xs font-bold tracking-wide text-white shadow-md shadow-teal-500/25">
            Danh bạ cây bút
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Những cây bút <span className="text-pop">đồng hành</span>
          </h2>

          {/* Câu nói: viết hoa, giãn chữ, có đường kẻ hai bên */}
          <p className="mx-auto mt-4 flex max-w-xl items-center justify-center gap-3 text-[11px] font-semibold uppercase leading-relaxed tracking-[0.22em] text-gray-500 sm:text-xs">
            <span aria-hidden className="hidden h-px w-8 bg-gray-300 sm:block" />
            <span>Mỗi người một câu chuyện, cùng viết nên trang báo này</span>
            <span aria-hidden className="hidden h-px w-8 bg-gray-300 sm:block" />
          </p>

          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <span className="rounded-full bg-violet-100 px-4 py-1.5 text-sm font-semibold text-violet-700">
              <b className="font-display text-base">{members.length}</b> thành viên
            </span>
            <span className="rounded-full bg-pink-100 px-4 py-1.5 text-sm font-semibold text-pink-700">
              <b className="font-display text-base">{totalPosts}</b> bài viết
            </span>
          </div>
        </div>

        {/* Lưới thành viên: mỗi người một vòng tròn */}
        <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-12 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {members.map((m, i) => {
            const name = m.full_name || 'Thành viên';
            const count = postCounts[m.id] ?? 0;
            const g = GRADIENTS[i % GRADIENTS.length];
            const isMe = m.id === currentUserId;
            const isTop = topCount >= 2 && count === topCount;

            return (
              <li key={m.id} className="group flex flex-col items-center text-center">
                {/* Vòng tròn ảnh */}
                <div className="relative w-full max-w-[9.5rem]">
                  <div
                    className={`aspect-square w-full rounded-full p-1.5 shadow-lg transition-all duration-300 group-hover:-translate-y-1.5 group-hover:scale-105 group-hover:shadow-xl ${g.bg} ${g.shadow} ${
                      isMe ? 'ring-2 ring-teal-300 ring-offset-2 ring-offset-white' : ''
                    }`}
                  >
                    <div className="h-full w-full overflow-hidden rounded-full border-4 border-white bg-white">
                      {m.avatar_url ? (
                        <img
                          src={m.avatar_url}
                          alt={name}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                      ) : (
                        <div
                          className={`flex h-full w-full items-center justify-center font-display text-5xl font-extrabold text-white ${g.solid}`}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bong bóng tròn: số bài viết (hoặc ✨ nếu là cây bút mới) */}
                  <span
                    className={`absolute -bottom-1 -right-1 flex h-11 w-11 items-center justify-center rounded-full bg-white font-display text-base font-extrabold tabular-nums shadow-md ring-4 ring-white ${g.num}`}
                    title={count > 0 ? `${count} bài viết` : 'Cây bút mới'}
                  >
                    {count > 0 ? count : '✨'}
                  </span>

                  {/* Nhãn nhỏ phía trên vòng tròn */}
                  {(isMe || isTop) && (
                    <span
                      className={`absolute -top-3 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full px-3 py-0.5 text-[10px] font-extrabold tracking-wide shadow-sm ${
                        isMe ? 'bg-yellow-300 text-gray-900' : 'bg-white text-teal-600 ring-1 ring-teal-100'
                      }`}
                    >
                      {isMe ? 'Bạn' : 'Nhiều bài nhất'}
                    </span>
                  )}
                </div>

                {/* Tên */}
                <h3
                  className="mt-4 line-clamp-2 max-w-[10rem] font-serif text-base font-bold leading-snug text-gray-900"
                  title={name}
                >
                  {name}
                </h3>
                <p className={`mt-0.5 text-xs font-semibold ${count > 0 ? g.num : 'text-amber-600'}`}>
                  {count > 0 ? 'bài viết' : 'Cây bút mới'}
                </p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}