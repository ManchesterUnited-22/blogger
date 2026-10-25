import { Mail, Phone, Heart, Sparkles } from 'lucide-react';

const CONTACTS = [
  {
    name: 'Phan Thùy Mơ',
    role: 'Trưởng nhóm',
    phone: '0368396050',
    email: 'phanthuymo136ltri@gmail.com',
  },
  {
    name: 'Lê Văn Dương',
    role: 'Nhóm phó',
    phone: '0384678558',
    email: 'Leekunngo2306@gmail.com',
  },
];

export default function Footer() {
  return (
    <footer className="bg-aurora relative mt-10 overflow-hidden rounded-t-[2.5rem] border-t border-gray-200/80 text-gray-800">
      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Cột trái: tên báo + khẩu hiệu */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="bg-pop flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md shadow-teal-500/25">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="font-display text-3xl font-extrabold tracking-tight text-gray-900">
                VTD<span className="text-pop">.News</span>
              </span>
            </div>
            <p className="mt-6 font-display text-3xl font-extrabold leading-tight text-ink md:text-4xl">
              Dã ngoại thực tế
              <br />
              <span className="text-pop">Đà Nẵng – Quy Nhơn</span>
            </p>
            <p className="mt-4 text-sm font-medium text-gray-500">Môn học thực tập nhận thức</p>
          </div>

          {/* Cột phải: liên hệ trong thẻ kính mờ */}
          <div>
            <p className="text-sm font-bold tracking-wide text-teal-700">Liên hệ</p>
            <ul className="mt-3 space-y-3">
              {CONTACTS.map((c) => (
                <li
                  key={c.email}
                  className="glass rounded-2xl border border-white p-4 shadow-soft transition-all hover:-translate-y-0.5 hover:bg-white"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-serif text-lg font-bold text-gray-900">{c.name}</span>
                    <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-teal-700">
                      {c.role}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-col gap-1.5 text-sm font-medium text-gray-600">
                    <a href={`tel:${c.phone}`} className="inline-flex items-center gap-2 hover:text-teal-600">
                      <Phone className="h-4 w-4 text-teal-500" />
                      {c.phone}
                    </a>
                    <a
                      href={`mailto:${c.email}`}
                      className="inline-flex items-center gap-2 break-all hover:text-teal-600"
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
        <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-gray-200 pt-5 text-sm font-medium text-gray-500">
          <span>© 2026 VTD.News</span>
          <span className="inline-flex items-center gap-1.5">
            Made with <Heart className="h-4 w-4 fill-rose-400 text-rose-400" /> in Quy Nhơn
          </span>
        </div>
      </div>
    </footer>
  );
}