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

// Mỗi thẻ một gradient riêng: vạch trên, vòng ảnh và chữ cái đầu
const GRADIENTS = [
  { grad: 'from-violet-500 to-fuchsia-500', shadow: 'shadow-violet-300/50', num: 'text-violet-600' },
  { grad: 'from-pink-500 to-orange-400', shadow: 'shadow-pink-300/50', num: 'text-pink-600' },
  { grad: 'from-cyan-400 to-blue-500', shadow: 'shadow-cyan-300/50', num: 'text-cyan-600' },
  { grad: 'from-amber-400 to-orange-500', shadow: 'shadow-amber-300/50', num: 'text-orange-600' },
  { grad: 'from-emerald-400 to-cyan-500', shadow: 'shadow-emerald-300/50', num: 'text-emerald-600' },
  { grad: 'from-fuchsia-500 to-rose-500', shadow: 'shadow-fuchsia-300/50', num: 'text-fuchsia-600' },
];

export default function MembersSection({ members, postCounts, currentUserId }: Props) {
  const totalPosts = members.reduce((n, m) => n + (postCounts[m.id] ?? 0), 0);
  const topCount = members.reduce((max, m) => Math.max(max, postCounts[m.id] ?? 0), 0);

  return (
    <section id="members" className="relative scroll-mt-20 overflow-hidden py-20">
      {/* Nền: các mảng màu mờ */}
      <div
        aria-hidden
        className="absolute -left-32 top-20 h-96 w-96 animate-float-slow rounded-full bg-gradient-to-br from-cyan-200 to-blue-300 opacity-50 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-32 bottom-10 h-96 w-96 animate-float rounded-full bg-gradient-to-br from-pink-200 to-orange-200 opacity-60 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Đầu mục */}
        <div className="text-center">
          <span className="bg-pop inline-block rounded-full px-4 py-1 text-xs font-bold uppercase tracking-wider text-white shadow-md shadow-fuchsia-500/25">
            Danh bạ cây bút
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Những cây bút <span className="text-pop">đồng hành</span>
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-base text-gray-600">
            Mỗi người một câu chuyện, cùng viết nên trang blog này
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

        {/* Lưới thẻ thành viên */}
        <ul className="mt-12 grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {members.map((m, i) => {
            const name = m.full_name || 'Thành viên';
            const count = postCounts[m.id] ?? 0;
            const g = GRADIENTS[i % GRADIENTS.length];
            const isMe = m.id === currentUserId;
            const isTop = topCount >= 2 && count === topCount;

            return (
              <li key={m.id} className="group">
                <article
                  className={`relative flex h-full flex-col items-center overflow-hidden rounded-3xl border border-white bg-white/80 p-4 pt-8 text-center shadow-xl backdrop-blur transition-all duration-300 group-hover:-translate-y-2 group-hover:shadow-2xl ${g.shadow} ${
                    isMe ? 'ring-2 ring-fuchsia-400 ring-offset-2 ring-offset-white' : ''
                  }`}
                >
                  {/* Dải gradient phía trên thẻ */}
                  <div aria-hidden className={`absolute inset-x-0 top-0 h-20 bg-gradient-to-br ${g.grad}`} />

                  {/* Nhãn góc */}
                  {(isMe || isTop) && (
                    <span
                      className={`absolute right-3 top-3 z-10 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wide ${
                        isMe ? 'bg-yellow-300 text-gray-900' : 'bg-white/90 text-fuchsia-600'
                      }`}
                    >
                      {isMe ? 'Bạn' : 'Nhiều bài nhất'}
                    </span>
                  )}

                  {/* Ảnh tròn đè lên dải gradient */}
                  <div className={`relative z-10 rounded-full bg-gradient-to-br p-1 ${g.grad}`}>
                    <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-white bg-white">
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
                          className={`flex h-full w-full items-center justify-center bg-gradient-to-br font-display text-3xl font-extrabold text-white ${g.grad}`}
                        >
                          {name.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Tên */}
                  <h3
                    className="mt-3 line-clamp-2 font-serif text-base font-bold leading-snug text-gray-900"
                    title={name}
                  >
                    {name}
                  </h3>

                  {/* Số bài */}
                  <div className="mt-auto pt-3">
                    {count > 0 ? (
                      <span className="inline-flex items-baseline gap-1.5 rounded-full bg-gray-50 px-3 py-1">
                        <span className={`font-display text-xl font-extrabold tabular-nums ${g.num}`}>{count}</span>
                        <span className="text-xs font-semibold text-gray-500">bài viết</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-yellow-100 px-3 py-1 text-xs font-bold text-amber-700">
                        ✨ Cây bút mới
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