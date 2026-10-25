import { Mail, Phone, PhoneCall, Heart, Sparkles, Crown, Users, Send } from 'lucide-react';

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
    <footer className="bg-aurora relative mt-10 overflow-hidden rounded-t-[2.5rem] border-t border-gray-200/80 text-gray-800">
      <div className="relative mx-auto max-w-6xl px-6 py-14">
        <div className="grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          {/* ===== Cột trái: thương hiệu ===== */}
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

          {/* ===== Cột phải: liên hệ (nổi bật) ===== */}
          <div className="rounded-[2rem] bg-gradient-to-br from-teal-400 via-cyan-400 to-violet-400 p-[2px] shadow-xl shadow-teal-500/15">
            <div className="rounded-[calc(2rem-2px)] bg-white/90 p-5 backdrop-blur sm:p-7">
              {/* Tiêu đề */}
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-md shadow-teal-500/30">
                  <PhoneCall className="h-5 w-5" />
                </span>
                <div>
                  <p className="font-display text-2xl font-extrabold leading-tight text-gray-900">Liên hệ với nhóm</p>
                  <p className="mt-0.5 inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                    </span>
                    Luôn sẵn sàng trả lời bạn
                  </p>
                </div>
              </div>

              {/* Danh sách người liên hệ */}
              <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {CONTACTS.map((c) => {
                  const RoleIcon = c.roleIcon;
                  const initial = c.name.split(' ').pop()?.charAt(0) ?? '?';
                  return (
                    <li
                      key={c.email}
                      className="group rounded-2xl border border-gray-100 bg-white p-5 shadow-md shadow-gray-900/5 transition-all hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/15"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${c.avatarCls} font-display text-2xl font-extrabold text-white shadow-md`}
                        >
                          {initial}
                        </span>
                        <div className="min-w-0">
                          <div className="font-serif text-xl font-bold leading-tight text-gray-900">{c.name}</div>
                          <span
                            className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide ${c.roleCls}`}
                          >
                            <RoleIcon className="h-3 w-3" />
                            {c.role}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 text-sm font-semibold">
                        <a
                          href={`tel:${c.phone}`}
                          className="group/btn inline-flex items-center gap-2.5 rounded-xl bg-teal-50 px-3.5 py-2.5 text-teal-800 transition-colors hover:bg-teal-500 hover:text-white"
                        >
                          <Phone className="h-4 w-4 shrink-0 text-teal-500 group-hover/btn:text-white" />
                          <span className="tracking-wide">{c.phone}</span>
                        </a>
                        <a
                          href={`mailto:${c.email}`}
                          className="group/btn inline-flex items-center gap-2.5 break-all rounded-xl bg-violet-50 px-3.5 py-2.5 text-violet-800 transition-colors hover:bg-violet-500 hover:text-white"
                        >
                          <Mail className="h-4 w-4 shrink-0 text-violet-500 group-hover/btn:text-white" />
                          <span>{c.email}</span>
                        </a>
                      </div>
                    </li>
                  );
                })}
              </ul>

              {/* Dòng nhắn nhủ cuối khung */}
              <p className="mt-5 inline-flex items-center gap-2 text-xs font-medium text-gray-500">
                <Send className="h-3.5 w-3.5 text-teal-500" />
                Bấm vào số điện thoại hoặc email để gọi / gửi thư ngay.
              </p>
            </div>
          </div>
        </div>

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