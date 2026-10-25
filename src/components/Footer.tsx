import { Mail, Phone, Heart } from 'lucide-react';

const CONTACTS = [
  {
    name: 'Phan Thùy Mơ',
    role: 'Trưởng nhóm',
    phone: '0368396050',
    email: 'phanthuymo136ltri@gmail.com',
    roleColor: 'text-teal-700',
    link: 'hover:text-teal-700',
  },
  {
    name: 'Lê Văn Dương',
    role: 'Nhóm phó',
    phone: '0384678558',
    email: 'Leekunngo2306@gmail.com',
    roleColor: 'text-orange-600',
    link: 'hover:text-orange-600',
  },
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t-4 border-gray-900 bg-[#faf8f3]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 md:grid-cols-2 md:gap-0">
          {/* Cột trái: tên báo + khẩu hiệu */}
          <div className="md:pr-10">
            <div className="group flex items-center gap-2.5">
              <span
                aria-hidden
                className="inline-block h-3.5 w-3.5 rotate-45 rounded-sm bg-teal-500 transition-transform duration-500 group-hover:rotate-[225deg] group-hover:bg-orange-500"
              />
              <span className="font-serif text-3xl font-black leading-none tracking-tight text-gray-900">
                VTD<span className="text-orange-500">.</span>News
              </span>
            </div>
            <p className="mt-6 font-serif text-2xl font-black uppercase leading-snug text-gray-900 md:text-3xl">
              Dã ngoại thực tế Đà Nẵng -{' '}
              <span className="inline-block -rotate-1 rounded-sm bg-orange-200 px-2">Quy Nhơn</span>
            </p>
            <span className="mt-5 block h-1 w-14 rounded-full bg-orange-400" />
            <p className="mt-4 text-xs font-bold uppercase tracking-widest text-gray-500">
              Môn học thực tập nhận thức
            </p>
          </div>

          {/* Cột phải: liên hệ, kẻ ngăn bằng đường đứt như mục lục báo */}
          <div className="md:border-l md:border-dashed md:border-gray-400 md:pl-10">
            <p className="text-xs font-bold uppercase tracking-widest text-orange-600">Liên hệ</p>
            <ul className="mt-3 divide-y divide-dashed divide-gray-400 border-y border-dashed border-gray-400">
              {CONTACTS.map((c) => (
                <li key={c.email} className="-mx-3 rounded-md px-3 py-4 transition-colors hover:bg-white">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-serif text-xl font-bold text-gray-900">{c.name}</span>
                    <span className={`text-[11px] font-bold uppercase tracking-widest ${c.roleColor}`}>{c.role}</span>
                  </div>
                  <div className="mt-2 flex flex-col gap-1.5 text-sm font-semibold text-gray-700">
                    <a href={`tel:${c.phone}`} className={`inline-flex items-center gap-2 transition-colors ${c.link}`}>
                      <Phone className="h-4 w-4 text-gray-400" />
                      {c.phone}
                    </a>
                    <a
                      href={`mailto:${c.email}`}
                      className={`inline-flex items-center gap-2 break-all transition-colors ${c.link}`}
                    >
                      <Mail className="h-4 w-4 shrink-0 text-gray-400" />
                      {c.email}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Dòng cuối trang */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-dashed border-gray-400 pt-5 text-xs font-semibold uppercase tracking-widest text-gray-500">
          <span>© 2026 VTD.News</span>
          <span className="inline-flex items-center gap-1.5">
            Made with <Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> in Quy Nhơn
          </span>
        </div>
      </div>
    </footer>
  );
}