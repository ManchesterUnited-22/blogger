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
    <footer className="relative mt-10 overflow-hidden rounded-t-[2.5rem] bg-gradient-to-br from-violet-700 via-fuchsia-600 to-orange-500 text-white">
      {/* Quả cầu sáng trang trí */}
      <div aria-hidden className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-cyan-300/30 blur-3xl" />
      <div aria-hidden className="absolute -bottom-24 right-0 h-80 w-80 rounded-full bg-yellow-300/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2">
          {/* Cột trái: tên báo + khẩu hiệu */}
          <div>
            <div className="flex items-center gap-2.5">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/25 backdrop-blur">
                <Sparkles className="h-5 w-5" />
              </span>
              <span className="font-display text-3xl font-extrabold tracking-tight">VTD.News</span>
            </div>
            <p className="mt-6 font-display text-3xl font-extrabold leading-tight md:text-4xl">
              Dã ngoại thực tế
              <br />
              <span className="text-yellow-200">Đà Nẵng – Quy Nhơn</span>
            </p>
            <p className="mt-4 text-sm font-medium text-white/80">Môn học thực tập nhận thức</p>
          </div>

          {/* Cột phải: liên hệ trong thẻ kính mờ */}
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-yellow-200">Liên hệ</p>
            <ul className="mt-3 space-y-3">
              {CONTACTS.map((c) => (
                <li
                  key={c.email}
                  className="rounded-2xl border border-white/25 bg-white/15 p-4 backdrop-blur transition-colors hover:bg-white/25"
                >
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="font-serif text-lg font-bold">{c.name}</span>
                    <span className="rounded-full bg-white/25 px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide">
                      {c.role}
                    </span>
                  </div>
                  <div className="mt-2 flex flex-col gap-1.5 text-sm font-medium text-white/90">
                    <a href={`tel:${c.phone}`} className="inline-flex items-center gap-2 hover:text-yellow-200">
                      <Phone className="h-4 w-4" />
                      {c.phone}
                    </a>
                    <a
                      href={`mailto:${c.email}`}
                      className="inline-flex items-center gap-2 break-all hover:text-yellow-200"
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

        {/* Dòng cuối trang */}
        <div className="mt-10 flex flex-wrap items-center justify-between gap-2 border-t border-white/25 pt-5 text-sm font-medium text-white/80">
          <span>© 2026 VTD.News</span>
          <span className="inline-flex items-center gap-1.5">
            Made with <Heart className="h-4 w-4 fill-white text-white" /> in Quy Nhơn
          </span>
        </div>
      </div>
    </footer>
  );
}