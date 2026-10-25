import type { Author } from '@/lib/supabase';

type Props = {
  authors: Author[];
};

const avatarColors = [
  'from-teal-400 to-cyan-500',
  'from-orange-400 to-amber-500',
  'from-rose-400 to-red-500',
  'from-teal-500 to-orange-400',
  'from-yellow-300 to-orange-500',
  'from-red-500 to-orange-400',
];

export default function TeamSection({ authors }: Props) {
  return (
    <section className="bg-ink text-white">
      <div className="mx-auto max-w-6xl px-6 py-20">
        <div className="text-center">
          <h2 className="font-display text-5xl uppercase leading-none tracking-tight sm:text-6xl">
            Đội ngũ <span className="text-teal-500">15</span> cây bút
          </h2>
          <span className="skew-sting mx-auto mt-4 block h-1.5 w-20 bg-volt" />
          <p className="mt-4 text-gray-400">Những người kể chuyện Quy Nhơn với tất cả đam mê</p>
        </div>

        <div className="mt-10 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {authors.map((author, i) => (
            <div
              key={author.id}
              className="group flex flex-col items-center border border-white/15 border-t-4 border-t-teal-500 bg-ink-800 p-5 text-center shadow-[4px_4px_0_0_#d4002b] transition-all hover:-translate-y-1 hover:shadow-[7px_7px_0_0_#f0173a]"
            >
              <div className={`relative rounded-full bg-gradient-to-br p-0.5 ${avatarColors[i % avatarColors.length]}`}>
                {author.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.name}
                    className="h-16 w-16 rounded-full object-cover ring-2 ring-ink-800"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-ink font-display text-2xl text-white ring-2 ring-ink-800">
                    {author.name.charAt(0)}
                  </div>
                )}
              </div>
              <h3 className="mt-3 font-serif text-base font-bold uppercase text-white">{author.name}</h3>
              <span className="mt-0.5 text-xs font-semibold uppercase tracking-wider text-volt">{author.role}</span>
              {author.bio && (
                <p className="mt-2 line-clamp-2 text-xs leading-relaxed text-gray-400">{author.bio}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}