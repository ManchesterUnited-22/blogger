import { Mail, Phone, Heart, Sparkles, Crown, Users } from 'lucide-react';

const CONTACTS = [
  {
    name: 'Phan Thùy Mơ',
    role: 'Trưởng nhóm',
    roleIcon: Crown,
    roleCls: 'bg-amber-100 text-amber-700',
    avatarCls: 'from-teal-400 to-cyan-500',
    phone: '0368396050',
    email: 'phanthuymo136ltri@gmail.com',
  },
  {
    name: 'Lê Văn Dương',
    role: 'Nhóm phó',
    roleIcon: Users,
    roleCls: 'bg-violet-100 text-violet-700',
    avatarCls: 'from-violet-400 to-pink-500',
    phone: '0384678558',
    email: 'Leekunngo2306@gmail.com',
  },
];

export default function Footer() {
  return (
    <footer className="bg-aurora relative mt-10 overflow-hidden rounded-t-[2rem] border-t border-gray-200/80 text-gray-800">
      <div className="relative mx-auto max-w-6xl px-6 py-9">
        <div className="grid items-center gap-6 lg:grid-cols-[0.8fr_1.2fr]">
          {/* ===== Thương hiệu ===== */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="bg-pop flex h-9 w-9 items-center justify-center rounded-xl text-white shadow-md shadow-teal-500/25">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-display text-2xl font-extrabold tracking-tight text-gray-900">
                VTD<span className="text-pop">.News</span>
              </span>
            </div>
            <p className="mt-3 font-display text-xl font-extrabold leading-snug text-ink md:text-2xl">
              Dã ngoại thực tế <span className="text-pop">Đà Nẵng – Quy Nhơn</span>
            </p>
            <p className="mt-1 text-sm font-medium text-gray-500">Môn học thực tập nhận thức</p>
          </div>

          {/* ===== Liên hệ ===== */}
          <ul className="grid gap-3 sm:grid-cols-2">
            {CONTACTS.map((c) => {
              const RoleIcon = c.roleIcon;
              const initial = c.name.split(' ').pop()?.charAt(0) ?? '?';
              return (
                <li
                  key={c.email}
                  className="rounded-2xl border border-white bg-white/90 p-4 shadow-md shadow-gray-900/5 transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-teal-500/15"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${c.avatarCls} font-display text-lg font-extrabold text-white shadow`}
                    >
                      {initial}
                    </span>
                    <div className="min-w-0">
                      <div className="font-serif text-base font-bold leading-tight text-gray-900">{c.name}</div>
                      <span
                        className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${c.roleCls}`}
                      >
                        <RoleIcon className="h-3 w-3" />
                        {c.role}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 flex flex-col gap-1.5 text-[13px] font-semibold">
                    <a
                      href={`tel:${c.phone}`}
                      className="group inline-flex items-center gap-2 rounded-lg bg-teal-50 px-3 py-1.5 text-teal-800 transition-colors hover:bg-teal-500 hover:text-white"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0 text-teal-500 group-hover:text-white" />
                      {c.phone}
                    </a>
                    <a
                      href={`mailto:${c.email}`}
                      className="group inline-flex items-center gap-2 break-all rounded-lg bg-violet-50 px-3 py-1.5 text-violet-800 transition-colors hover:bg-violet-500 hover:text-white"
                    >
                      <Mail className="h-3.5 w-3.5 shrink-0 text-violet-500 group-hover:text-white" />
                      {c.email}
                    </a>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-4 text-sm font-medium text-gray-500">
          <span>© 2026 VTD.News</span>
          <span className="inline-flex items-center gap-1.5">
            Made with <Heart className="h-4 w-4 fill-rose-400 text-rose-400" /> in Quy Nhơn
          </span>
        </div>
      </div>
    </footer>
  );
}