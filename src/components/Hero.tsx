import { useEffect, useState } from 'react';
import {
  MapPin,
  Sparkles,
  ArrowDown,
  Heart,
  Waves,
  UtensilsCrossed,
  Landmark,
} from 'lucide-react';
import VietnamMap from './VietnamMap';

// Các từ khóa xoay vòng trong câu "Những câu chuyện về ..."
const WORDS = ['biển xanh', 'món ngon', 'đất võ', 'con người'];

export default function Hero() {
  const [wordIndex, setWordIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let swap: ReturnType<typeof setTimeout> | undefined;
    const timer = setInterval(() => {
      setVisible(false); // mờ dần
      swap = setTimeout(() => {
        setWordIndex((i) => (i + 1) % WORDS.length);
        setVisible(true); // hiện từ mới
      }, 300);
    }, 2600);
    return () => {
      clearInterval(timer);
      clearTimeout(swap);
    };
  }, []);

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
      <div className="absolute top-10 left-10 h-64 w-64 animate-pulse rounded-full bg-teal-200/30 blur-3xl" />
      <div
        className="absolute bottom-20 right-20 h-72 w-72 animate-pulse rounded-full bg-orange-200/30 blur-3xl"
        style={{ animationDuration: '4s' }}
      />

      <div className="relative mx-auto max-w-6xl px-6 py-16 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
          {/* Left content */}
          <div>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-700">
              <Sparkles className="h-4 w-4" />
              Nhật ký Quy Nhơn · Biển Nam Trung Bộ
            </div>
            <h1 className="text-5xl font-extrabold leading-tight tracking-tight text-gray-900 lg:text-6xl">
                VTD<span className="text-orange-500">.</span>News
            </h1>

            {/* Dòng chữ đổi từ khóa liên tục */}
            <p className="mt-3 text-xl font-semibold text-gray-700">
              Những câu chuyện về{' '}
              <span
                className={`inline-block min-w-[7.5rem] text-orange-500 transition-opacity duration-300 ${
                  visible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {WORDS[wordIndex]}
              </span>
            </p>

            <p className="mt-4 max-w-xl text-lg leading-relaxed text-gray-600">
              Một chuyến đi, một nhóm sinh viên và rất nhiều kỷ niệm. VTD.News là nơi bọn mình kể lại Quy Nhơn: những nơi đã đi, những người đã gặp và những khoảnh khắc không có trong sách hướng dẫn
            </p>

            {/* Card đam mê + các chủ đề nổi bật */}
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-3 rounded-2xl border border-rose-100 bg-white/80 px-5 py-3 shadow-md backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-lg">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-rose-100">
                  <Heart className="h-5 w-5 animate-pulse fill-rose-500 text-rose-500" />
                </div>
                <div>
                  <div className="text-3xl font-extrabold leading-none text-rose-500">100%</div>
                  <div className="mt-1 text-sm text-gray-500">Đam mê</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-teal-100 bg-white/80 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-teal-50">
                  <Waves className="h-4 w-4 text-teal-500" /> Biển xanh
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-100 bg-white/80 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-orange-50">
                  <UtensilsCrossed className="h-4 w-4 text-orange-500" /> Ẩm thực
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-100 bg-white/80 px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50">
                  <Landmark className="h-4 w-4 text-sky-500" /> Văn hóa
                </span>
              </div>
            </div>

            <a
              href="#feed"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-gray-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-gray-800 hover:shadow-lg"
            >
              Khám phá bài viết
              <ArrowDown className="h-4 w-4 animate-bounce" />
            </a>
          </div>

          {/* Right — Vietnam map + location card */}
          <div className="relative flex flex-col items-center gap-4">
            <div className="rounded-3xl border border-teal-100 bg-white/80 p-8 shadow-xl backdrop-blur-sm">
              <VietnamMap />
            </div>
            <div className="flex items-center gap-3 rounded-2xl border border-orange-100 bg-white/80 px-6 py-4 shadow-lg backdrop-blur-sm">
              <MapPin className="h-5 w-5 text-orange-500" />
              <div>
                <div className="font-semibold text-gray-900">Quy Nhơn, Gia Lai</div>
                <div className="text-sm text-gray-500">13.78°B, 109.22°Đ · Điểm đến của chuyến đi </div>
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