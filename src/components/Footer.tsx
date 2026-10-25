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
    <footer className="bg-aurora relative mt-4 overflow-hidden rounded-t-[1.75rem] border-t border-gray-200/80 text-gray-800">
      <div className="relative mx-auto max-w-6xl px-6 py-5">
        <div className="grid items-center gap-4 lg:grid-cols-[0.75fr_1.25fr]">
          {/* ===== Thương hiệu + bản quyền ===== */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="bg-pop flex h-8 w-8 items-center justify-center rounded-lg text-white shadow-md shadow-teal-500/25">
                <Sparkles className="h-4 w-4" />
              </span>
              <span className="font-display text-2xl font-extrabold tracking-tight text-gray-900">
                VTD<span className="text-pop">.News</span>
              </span>
            </div>
            <p className="mt-2 font-display text-lg font-extrabold leading-snug text-ink">
              Dã ngoại thực tế <span className="text-pop">Đà Nẵng – Quy Nhơn</span>
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 text-xs font-medium text-gray-500">
              <span>Môn học thực tập nhận thức</span>
              <span aria-hidden>·</span>
              <span>© 2026</span>
              <span aria-hidden>·</span>
              <span className="inline-flex items-center gap-1">
                Made with <Heart className="h-3 w-3 fill-rose-400 text-rose-400" /> in Quy Nhơn
              </span>
            </p>
          </div>

          {/* ===== Liên hệ: mỗi người một hàng mỏng, Mơ trên – Dương dưới ===== */}
          <ul className="space-y-2">
            {CONTACTS.map((c) => {
              const RoleIcon = c.roleIcon;
              const initial = c.name.split(' ').pop()?.charAt(0) ?? '?';
              return (
                <li
                  key={c.email}
                  className="flex flex-col gap-2 rounded-xl border border-white bg-white/90 px-3 py-2 shadow-sm shadow-gray-900/5 transition-all hover:shadow-md hover:shadow-teal-500/15 md:flex-row md:items-center md:gap-3"
                >
                  {/* Avatar + tên + chức vụ cùng một dòng */}
                  <div className="flex items-center gap-2.5 md:w-64 md:shrink-0">
                    <span
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br ${c.avatarCls} font-display text-sm font-extrabold text-white shadow`}
                    >
                      {initial}
                    </span>
                    <span className="font-serif text-[15px] font-bold leading-tight text-gray-900">{c.name}</span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-wide ${c.roleCls}`}
                    >
                      <RoleIcon className="h-3 w-3" />
                      {c.role}
                    </span>
                  </div>

                  {/* Điện thoại + email */}
                  <div className="flex min-w-0 flex-1 flex-wrap gap-1.5 text-[12.5px] font-semibold">
                    <a
                      href={`tel:${c.phone}`}
                      className="group inline-flex items-center gap-1.5 rounded-md bg-teal-50 px-2.5 py-1 text-teal-800 transition-colors hover:bg-teal-500 hover:text-white"
                    >
                      <Phone className="h-3.5 w-3.5 shrink-0 text-teal-500 group-hover:text-white" />
                      {c.phone}
                    </a>
                    <a
                      href={`mailto:${c.email}`}
                      className="group inline-flex min-w-0 items-center gap-1.5 break-all rounded-md bg-violet-50 px-2.5 py-1 text-violet-800 transition-colors hover:bg-violet-500 hover:text-white"
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
      </div>
    </footer>
  );
}