import type { Author } from '@/lib/supabase';

type Props = {
  authors: Author[];
};

const avatarColors = [
  'from-teal-400 to-cyan-500',
  'from-orange-400 to-amber-500',
  'from-rose-400 to-red-500',
  'from-sky-400 to-blue-500',
  'from-violet-400 to-purple-500',
  'from-emerald-400 to-green-500',
];

export default function TeamSection({ authors }: Props) {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="text-center">
        <h2 className="text-3xl font-extrabold text-gray-900">Đội ngũ 15 cây bút</h2>
        <p className="mt-2 text-gray-500">Những người kể chuyện Quy Nhơn với tất cả đam mê</p>
      </div>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {authors.map((author, i) => (
          <div
            key={author.id}
            className="group flex flex-col items-center rounded-2xl bg-white p-5 text-center shadow-sm ring-1 ring-gray-100 transition-all hover:-translate-y-1 hover:shadow-lg"
          >
            <div className={`relative rounded-full p-0.5 bg-gradient-to-br ${avatarColors[i % avatarColors.length]}`}>
              {author.avatar_url ? (
                <img
                  src={author.avatar_url}
                  alt={author.name}
                  className="h-16 w-16 rounded-full object-cover ring-2 ring-white"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-lg font-bold text-gray-700 ring-2 ring-white">
                  {author.name.charAt(0)}
                </div>
              )}
            </div>
            <h3 className="mt-3 text-sm font-bold text-gray-900">{author.name}</h3>
            <span className="mt-0.5 text-xs font-medium text-teal-600">{author.role}</span>
            {author.bio && (
              <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-400">{author.bio}</p>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
