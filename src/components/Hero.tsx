import { useEffect, useState } from 'react';
import { MapPin, ArrowDown, Sparkles, Waves, UtensilsCrossed, Landmark } from 'lucide-react';
import VietnamMap from './VietnamMap';

// Các từ khóa xoay vòng trong câu "Những câu chuyện về ..."
const WORDS = ['biển xanh', 'món ngon', 'đất võ', 'con người'];

const TOPICS = [
  { icon: Waves, label: 'Biển xanh', cls: 'bg-cyan-100 text-cyan-700' },
  { icon: UtensilsCrossed, label: 'Ẩm thực', cls: 'bg-amber-100 text-amber-700' },
  { icon: Landmark, label: 'Văn hóa', cls: 'bg-pink-100 text-pink-700' },
];

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
    <header className="bg-aurora relative overflow-hidden">
      {/* Các quả cầu màu trôi nhẹ phía sau */}
      <div
        aria-hidden
        className="absolute -left-24 top-10 h-72 w-72 animate-float rounded-full bg-gradient-to-br from-pink-400 to-orange-300 opacity-50 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-20 top-0 h-80 w-80 animate-float-slow rounded-full bg-gradient-to-br from-cyan-300 to-blue-400 opacity-50 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-1/3 h-72 w-72 animate-float rounded-full bg-gradient-to-br from-yellow-200 to-lime-300 opacity-50 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute bottom-10 right-1/4 h-64 w-64 animate-float-slow rounded-full bg-gradient-to-br from-violet-400 to-fuchsia-400 opacity-40 blur-3xl"
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-14 lg:pb-32 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          {/* ===== Cột trái ===== */}
          <div>
            <p className="glass inline-flex items-center gap-2 rounded-full border border-white px-4 py-1.5 text-sm font-semibold text-violet-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-fuchsia-500" />
              Bản tin chuyến đi
            </p>

            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-6xl lg:text-7xl">
              Những câu chuyện về
              <br />
              <span
                className={`text-pop inline-block pb-2 transition-opacity duration-300 ${
                  visible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {WORDS[wordIndex]}
              </span>
            </h1>

            <p className="mt-5 max-w-xl text-lg leading-relaxed text-gray-600">
              Một chuyến đi, một nhóm sinh viên và rất nhiều kỷ niệm. VTD.News là nơi bọn mình kể lại Quy Nhơn: những
              nơi đã đi, những người đã gặp và những khoảnh khắc không có trong sách hướng dẫn.
            </p>

            {/* Chip chủ đề nhiều màu */}
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
              <span className="bg-pop inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold text-white shadow-md shadow-fuchsia-500/25">
                <span className="font-display text-lg leading-none">100%</span> Đam mê
              </span>
              {TOPICS.map(({ icon: Icon, label, cls }) => (
                <span
                  key={label}
                  className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold ${cls}`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </span>
              ))}
            </div>

            <a
              href="#feed"
              className="bg-pop-anim mt-8 inline-flex items-center gap-2 rounded-full px-8 py-4 text-base font-bold text-white shadow-xl shadow-fuchsia-500/30 transition-all hover:-translate-y-1 hover:shadow-2xl hover:shadow-fuchsia-500/40"
            >
              Khám phá bài viết
              <ArrowDown className="h-5 w-5 animate-bounce" />
            </a>
          </div>

          {/* ===== Cột phải: bản đồ trong khung viền gradient ===== */}
          <figure className="group relative mx-auto w-full max-w-sm rotate-2 transition-transform duration-500 hover:rotate-0">
            <span
              aria-hidden
              className="absolute -top-4 left-6 z-10 rounded-full bg-gradient-to-r from-yellow-300 to-orange-400 px-4 py-1 text-xs font-extrabold uppercase tracking-wider text-gray-900 shadow-lg"
            >
              Điểm đến
            </span>
            <div className="bg-pop-anim rounded-[2rem] p-1.5 shadow-2xl shadow-fuchsia-500/30">
              <div className="rounded-[1.6rem] bg-white p-6">
                <VietnamMap />
              </div>
            </div>
            <figcaption className="glass mt-4 flex items-center gap-3 rounded-2xl border border-white px-4 py-3 shadow-sm">
              <span className="bg-pop flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-white">
                <MapPin className="h-5 w-5" />
              </span>
              <div>
                <div className="font-serif text-lg font-bold leading-tight text-gray-900">Quy Nhơn, Gia Lai</div>
                <div className="mt-0.5 text-xs font-medium text-gray-500">
                  13.78°B, 109.22°Đ · Điểm đến của chuyến đi
                </div>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Mép lượn sóng xuống phần ảnh */}
      <svg
        aria-hidden
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        className="absolute inset-x-0 bottom-0 h-14 w-full text-paper"
      >
        <path fill="currentColor" d="M0,40 C240,90 480,0 720,30 C960,60 1200,90 1440,30 L1440,80 L0,80 Z" />
      </svg>
    </header>
  );
}