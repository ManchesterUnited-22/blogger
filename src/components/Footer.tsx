import { Newspaper, Mail, MapPin, Heart } from 'lucide-react';

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
            <p className="mt-3 text-sm leading-relaxed text-gray-500">
              Blog cộng đồng về Quy Nhơn — thành phố biển miền Trung. Viết bởi 15 thành viên đam mê kể chuyện vùng đất võ.
            </p>
          </div>

          <div>
            <h4 className="text-sm font-bold text-gray-900">Liên hệ</h4>
            <ul className="mt-3 space-y-2 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-orange-500" />
                Quy Nhơn, Bình Định, Việt Nam
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-teal-500" />
                contact@duytan.news
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