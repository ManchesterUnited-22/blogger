import { Feather } from 'lucide-react';

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

const ringColors = [
  'from-teal-400 to-cyan-500',
  'from-orange-400 to-amber-500',
  'from-rose-400 to-red-500',
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-emerald-400 to-green-500',
];

export default function MembersSection({ members, postCounts, currentUserId }: Props) {
  return (
    <section id="members" className="scroll-mt-20 bg-gradient-to-b from-teal-50/60 to-white py-16">
      <div className="mx-auto max-w-6xl px-6">
        <div className="text-center">
          <Feather className="mx-auto h-6 w-6 text-teal-500" />
          <h2 className="mt-3 font-serif text-3xl font-extrabold text-gray-900">Những cây bút đồng hành</h2>
          <p className="mt-2 font-serif italic text-gray-500">
            Mỗi người một câu chuyện, cùng viết nên trang blog này
          </p>
          <p className="mt-1 text-xs text-gray-400">{members.length} thành viên</p>
        </div>

        <ul className="mt-10 flex flex-wrap justify-center gap-x-8 gap-y-6">
          {members.map((m, i) => {
            const name = m.full_name || 'Thành viên';
            const count = postCounts[m.id] ?? 0;
            return (
              <li key={m.id} className="flex w-24 flex-col items-center text-center">
                <div className={`rounded-full bg-gradient-to-br p-0.5 ${ringColors[i % ringColors.length]}`}>
                  {m.avatar_url ? (
                    <img
                      src={m.avatar_url}
                      alt={name}
                      referrerPolicy="no-referrer"
                      className="h-14 w-14 rounded-full object-cover ring-2 ring-white"
                    />
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-white text-lg font-bold text-gray-700 ring-2 ring-white">
                      {name.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="mt-2 w-full truncate text-sm font-semibold text-gray-800" title={name}>
                  {name}
                  {m.id === currentUserId ? ' (Bạn)' : ''}
                </span>
                <span className="text-xs text-teal-600">{count > 0 ? `${count} bài viết` : 'Cây bút mới'}</span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}