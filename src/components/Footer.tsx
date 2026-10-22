import { Newspaper, Mail, Heart } from 'lucide-react';

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
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900">Liên hệ</h4>
            <ul className="mt-3 space-y-3">
              <li>
                <a
                  href="mailto:Leekunngo2306@gmail.com"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-teal-200 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Mail className="h-4 w-4" />
                  Leekunngo2306@gmail.com
                </a>
              </li>
              <li>
                <a
                  href="mailto:phanthuymo136ltri@gmail.com"
                  className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-2 text-sm font-bold text-white shadow-md shadow-orange-200 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                >
                  <Mail className="h-4 w-4" />
                  phanthuymo136ltri@gmail.com
                </a>
              </li>
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