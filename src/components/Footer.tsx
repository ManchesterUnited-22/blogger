import { Newspaper, Mail, Phone, Heart } from 'lucide-react';

const CONTACTS = [
  {
    name: 'Phan Thùy Mơ',
    role: 'Trưởng nhóm',
    phone: '0368396050',
    email: 'phanthuymo136ltri@gmail.com',
    card: 'border-teal-100 shadow-teal-100/70',
    badge: 'from-teal-500 to-cyan-500',
    link: 'text-teal-700 hover:text-teal-900',
  },
  {
    name: 'Lê Văn Dương',
    role: 'Nhóm phó',
    phone: '0384678558',
    email: 'Leekunngo2306@gmail.com',
    card: 'border-orange-100 shadow-orange-100/70',
    badge: 'from-orange-500 to-rose-500',
    link: 'text-orange-700 hover:text-orange-900',
  },
];

export default function Footer() {
  return (
    <footer className="mt-10 border-t border-gray-100 bg-gray-50">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-8 md:grid-cols-2">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500">
                <Newspaper className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-extrabold text-gray-900">
                DuyTan<span className="text-orange-500">.</span>News
              </span>
            </div>
            <p className="mt-4 bg-gradient-to-r from-teal-500 via-cyan-500 to-orange-500 bg-clip-text py-1 text-xl font-black uppercase leading-snug tracking-wide text-transparent md:text-2xl">
              DÃ NGOẠI THỰC TẾ ĐÀ NẴNG - QUY NHƠN
            </p>
            <p className="mt-1 text-lg font-extrabold text-black md:text-xl">
              Môn học Nhận thức
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900">Liên hệ</h4>
            <ul className="mt-3 space-y-4">
              {CONTACTS.map((c) => (
                <li
                  key={c.email}
                  className={`rounded-2xl border bg-white p-4 shadow-md ${c.card}`}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-base font-extrabold text-gray-900">{c.name}</span>
                    <span
                      className={`rounded-full bg-gradient-to-r px-2.5 py-0.5 text-xs font-bold text-white ${c.badge}`}
                    >
                      {c.role}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-col gap-2">
                    <a
                      href={`tel:${c.phone}`}
                      className={`inline-flex items-center gap-2 text-sm font-bold transition-colors ${c.link}`}
                    >
                      <Phone className="h-4 w-4" />
                      {c.phone}
                    </a>
                    <a
                      href={`mailto:${c.email}`}
                      className={`inline-flex items-center gap-2 break-all text-sm font-bold transition-colors ${c.link}`}
                    >
                      <Mail className="h-4 w-4 shrink-0" />
                      {c.email}
                    </a>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex items-center justify-center gap-1.5 border-t border-gray-200 pt-6 text-sm text-gray-400">
          <span>© 2026 DuyTan.News · Made with</span>
          <Heart className="h-3.5 w-3.5 text-rose-500" />
          <span>in Quy Nhơn</span>
        </div>
      </div>
    </footer>
  );
}