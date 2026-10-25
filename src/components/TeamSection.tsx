import type { Author } from '@/lib/supabase';

type Props = {
  authors: Author[];
};

const avatarColors = [
  'from-teal-400 to-cyan-400',
  'from-orange-300 to-pink-300',
  'from-cyan-300 to-cyan-500',
  'from-violet-300 to-teal-400',
  'from-pink-300 to-rose-400',
  'from-amber-300 to-orange-300',
];

export default function TeamSection({ authors }: Props) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
            Đội ngũ <span className="text-pop">15</span> cây bút
          </h2>
          <p className="mt-3 text-gray-600">Những người kể chuyện Quy Nhơn với tất cả đam mê</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {authors.map((author, i) => (
            <div
              key={author.id}
              className="group flex flex-col items-center rounded-3xl border border-white bg-white/80 p-5 text-center shadow-lg shadow-violet-200/50 backdrop-blur transition-all hover:-translate-y-1.5 hover:shadow-xl"
            >
              <div className={`rounded-full bg-gradient-to-br p-1 ${avatarColors[i % avatarColors.length]}`}>
                {author.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.name}
                    className="h-16 w-16 rounded-full border-2 border-white object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white bg-white font-display text-2xl font-extrabold text-gray-700">
                    {author.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="mt-3 font-serif text-base font-bold text-gray-900">{author.name}</h3>
              <span className="mt-1 rounded-full bg-violet-100 px-2.5 py-0.5 text-xs font-semibold text-violet-700">
                {author.role}
              </span>
              {author.bio && (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-500">{author.bio}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}