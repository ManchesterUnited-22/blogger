import { MapPin, Sparkles, ArrowDown } from 'lucide-react';
import VietnamMap from './VietnamMap';

export default function Hero() {
  return (
    <header className="relative min-h-[600px] overflow-hidden bg-gradient-to-br from-teal-50 via-white to-sky-50">
      {/* Background image with overlay */}
      <div className="absolute inset-0">
        <img
          src="https://images.pexels.com/photos/29162860/pexels-photo-29162860.jpeg?auto=compress&cs=tinysrgb&w=1600"
          alt="Bãi biển Quy Nhơn"
          className="h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-white/90" />
      </div>

      {/* Decorative blobs */}
      <div className="absolute top-10 left-10 h-64 w-64 rounded-full bg-teal-200/30 blur-3xl" />
      <div className="absolute bottom-20 right-20 h-72 w-72 rounded-full bg-orange-200/30 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Left content */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              <Sparkles className="h-4 w-4" />
              Blog về Quy Nhơn — Thành phố biển miền Trung
            </div>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-gray-900 lg:text-6xl">
              DuyTan<span className="text-orange-500">.</span>News
            </h1>
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-600">
              Khám phá Quy Nhơn qua lăng kính của 15 cây bút trẻ — những mẩu tin về
               vùng đất võ Bình Định.
            </p>

            {/* Quick stats */}
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold text-teal-600">15</div>
                <div className="text-sm text-gray-500">Thành viên</div>
              </div>
             
              <div className="text-center">
                <div className="text-3xl font-bold text-rose-500">100%</div>
                <div className="text-sm text-gray-500">Đam mê</div>
              </div>
            </div>

            <a
              href="#feed"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:shadow-lg"
            >
              Khám phá bài viết
              <ArrowDown className="h-4 w-4" />
            </a>
          </div>

          {/* Right — Vietnam map + location card */}
          <div className="relative flex flex-col items-center gap-4">
            <div className="rounded-3xl bg-white/80 p-8 shadow-xl backdrop-blur-sm border border-teal-100">
              <VietnamMap />
            </div>
            <div className="rounded-2xl bg-white/80 px-6 py-4 shadow-lg backdrop-blur-sm border border-orange-100 flex items-center gap-3">
              <MapPin className="h-5 w-5 text-orange-500" />
              <div>
                <div className="font-semibold text-gray-900">Quy Nhơn, Bình Định</div>
                <div className="text-sm text-gray-500">13.78°B, 109.22°Đ · Ven biển miền Trung</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Wave divider */}
      <svg className="absolute bottom-0 w-full" viewBox="0 0 1440 80" fill="none" preserveAspectRatio="none">
        <path d="M0 40C240 60 480 80 720 60C960 40 1200 20 1440 40V80H0V40Z" fill="white" />
      </svg>
    </header>
  );
}
