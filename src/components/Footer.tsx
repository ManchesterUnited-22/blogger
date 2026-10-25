import { Mail, Phone, Heart } from 'lucide-react';

const CONTACTS = [
  {
    name: 'Phan Thùy Mơ',
    role: 'Trưởng nhóm',
    phone: '0368396050',
    email: 'phanthuymo136ltri@gmail.com',
    roleColor: 'text-teal-500',
    link: 'hover:text-teal-400',
  },
  {
    name: 'Lê Văn Dương',
    role: 'Nhóm phó',
    phone: '0384678558',
    email: 'Leekunngo2306@gmail.com',
    roleColor: 'text-volt',
    link: 'hover:text-volt',
  },
];

export default function Footer() {
  return (
    <footer className="relative overflow-hidden bg-ink text-white">
      {/* Vạch đỏ trên cùng + sọc chéo mờ */}
      <div aria-hidden className="h-2 bg-gradient-to-r from-teal-600 via-orange-500 to-volt" />
      <div aria-hidden className="stripes-red pointer-events-none absolute inset-0 opacity-60" />
      {/* Chữ khổng lồ chìm phía sau */}
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-10 left-1/2 -translate-x-1/2 select-none whitespace-nowrap font-display text-[9rem] uppercase leading-none text-white/[0.04] sm:text-[14rem]"
      >
        VTD.News
      </span>

      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 md:gap-0">
          {/* Cột trái: tên báo + khẩu hiệu */}
          <div className="md:pr-10">
            <div className="group flex items-center gap-2.5">
              <span
                aria-hidden
                className="skew-sting inline-block h-7 w-3 bg-teal-500 transition-all duration-300 group-hover:w-5 group-hover:bg-volt"
              />
              <span className="font-display text-4xl uppercase leading-none tracking-wide text-white">
                VTD<span className="text-teal-500">.</span>News
              </span>
            </div>
            <p className="mt-6 font-display text-3xl uppercase leading-tight text-white md:text-4xl">
              Dã ngoại thực tế
              <br />
              <span className="text-teal-500">Đà Nẵng – Quy Nhơn</span>
            </p>
            <span className="skew-sting mt-5 block h-1.5 w-20 bg-volt" />
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-400">
              Môn học thực tập nhận thức
            </p>
          </div>

          {/* Cột phải: liên hệ */}
          <div className="md:border-l md:border-white/15 md:pl-10">
            <p className="text-xs font-bold uppercase tracking-widest text-volt">Liên hệ</p>
            <ul className="mt-3 divide-y divide-white/15 border-y border-white/15">
              {CONTACTS.map((c) => (
                <li key={c.email} className="-mx-3 px-3 py-4 transition-colors hover:bg-white/5">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-serif text-2xl font-bold uppercase text-white">{c.name}</span>
                    <span className={`text-[11px] font-bold uppercase tracking-widest ${c.roleColor}`}>{c.role}</span>
                  </div>
                  <div className="mt-2 flex flex-col gap-1.5 text-sm font-semibold text-gray-300">
                    <a href={`tel:${c.phone}`} className={`inline-flex items-center gap-2 transition-colors ${c.link}`}>
                      <Phone className="h-4 w-4 text-teal-500" />
                      {c.phone}
                    </a>
                    <a
                      href={`mailto:${c.email}`}
                      className={`inline-flex items-center gap-2 break-all transition-colors ${c.link}`}
                    >
                      <Mail className="h-4 w-4 shrink-0 text-teal-500" />
                      {c.email}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dòng cuối trang */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-white/15 pt-5 text-xs font-semibold uppercase tracking-widest text-gray-400">
          <span>© 2026 VTD.News</span>
          <span className="inline-flex items-center gap-1.5">
            Made with <Heart className="h-3.5 w-3.5 fill-teal-500 text-teal-500" /> in Quy Nhơn
          </span>
        </div>
      </div>
    </footer>
  );
}