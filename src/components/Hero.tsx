import { useEffect, useState } from 'react';
import { MapPin, ArrowDown, Flame, Waves, UtensilsCrossed, Landmark } from 'lucide-react';
import VietnamMap from './VietnamMap';

// Các từ khóa xoay vòng trong câu "Những câu chuyện về ..."
const WORDS = ['biển xanh', 'món ngon', 'đất võ', 'con người'];

const TOPICS = [
  { icon: Waves, label: 'Biển xanh' },
  { icon: UtensilsCrossed, label: 'Ẩm thực' },
  { icon: Landmark, label: 'Văn hóa' },
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
    <header className="relative overflow-hidden bg-ink text-white">
      {/* Ảnh nền đen đỏ, rất tối */}
      <img
        src="https://images.pexels.com/photos/29162860/pexels-photo-29162860.jpeg?auto=compress&cs=tinysrgb&w=1600"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-[0.18] grayscale"
      />
      {/* Lớp đỏ phát sáng + lưới chấm + sọc chéo */}
      <div aria-hidden className="absolute inset-0 bg-gradient-to-br from-ink via-ink/80 to-teal-900/60" />
      <div
        aria-hidden
        className="absolute -left-40 top-1/3 h-[32rem] w-[32rem] animate-glow rounded-full bg-teal-600/40 blur-[120px]"
      />
      <div
        aria-hidden
        className="absolute -right-32 -top-24 h-[26rem] w-[26rem] animate-glow rounded-full bg-orange-500/30 blur-[110px]"
      />
      <div aria-hidden className="dots absolute inset-0" />
      {/* Vệt chéo lớn bên phải */}
      <div
        aria-hidden
        className="absolute -right-24 top-0 hidden h-full w-48 skew-x-[-14deg] bg-teal-600/25 lg:block"
      />
      <div
        aria-hidden
        className="absolute right-24 top-0 hidden h-full w-4 skew-x-[-14deg] bg-volt/80 lg:block"
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-24 pt-14 lg:pb-32 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.25fr_0.75fr]">
          {/* ===== Cột trái: tiêu đề khổng lồ ===== */}
          <div>
            <p className="skew-sting inline-flex items-center gap-2 bg-volt px-3 py-1 text-xs font-black uppercase tracking-widest text-ink">
              <span className="unskew-sting inline-flex items-center gap-2">
                <Flame className="h-4 w-4" />
                Bản tin chuyến đi
              </span>
            </p>

            <h1 className="mt-5 font-display text-6xl uppercase leading-[0.95] tracking-tight sm:text-7xl lg:text-[6.5rem]">
              Những câu chuyện về
              <br />
              <span
                className={`inline-block bg-gradient-to-r from-teal-500 via-orange-500 to-volt bg-clip-text text-transparent transition-opacity duration-300 ${
                  visible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {WORDS[wordIndex]}
              </span>
              <span className="text-teal-500">.</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-300">
              Một chuyến đi, một nhóm sinh viên và rất nhiều kỷ niệm. VTD.News là nơi bọn mình kể lại Quy Nhơn: những
              nơi đã đi, những người đã gặp và những khoảnh khắc không có trong sách hướng dẫn.
            </p>

            {/* Dải chỉ số kiểu băng rôn thể thao */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-white/15 py-4">
              <div className="flex items-center gap-2.5 pr-6 sm:border-r sm:border-white/15">
                <span className="font-display text-5xl leading-none text-teal-500">100%</span>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-300">Đam mê</span>
              </div>
              {TOPICS.map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-300"
                >
                  <Icon className="h-4 w-4 text-volt" />
                  {label}
                </span>
              ))}
            </div>

            <a
              href="#feed"
              className="skew-sting mt-8 inline-flex items-center gap-2 bg-teal-600 px-7 py-3.5 text-sm font-black uppercase tracking-widest text-white shadow-[6px_6px_0_0_#ffe600] transition-all hover:translate-x-[3px] hover:translate-y-[3px] hover:bg-teal-500 hover:shadow-[3px_3px_0_0_#ffe600]"
            >
              <span className="unskew-sting inline-flex items-center gap-2">
                Khám phá bài viết
                <ArrowDown className="h-4 w-4 animate-bounce" />
              </span>
            </a>
          </div>

          {/* ===== Cột phải: bản đồ trong khung đen viền đỏ phát sáng ===== */}
          <figure className="group relative mx-auto w-full max-w-sm -rotate-2 transition-transform duration-500 hover:rotate-0">
            <span
              aria-hidden
              className="absolute -top-3 left-6 z-10 skew-x-[-14deg] bg-volt px-3 py-0.5 text-[11px] font-black uppercase tracking-widest text-ink"
            >
              <span className="inline-block skew-x-[14deg]">Điểm đến</span>
            </span>
            <div className="glow-red border-2 border-teal-500 bg-ink-800 p-6 shadow-[8px_8px_0_0_#d4002b]">
              <VietnamMap />
            </div>
            <figcaption className="mt-4 flex items-start gap-3 border-t-4 border-teal-500 pt-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-volt" />
              <div>
                <div className="font-serif text-xl font-bold uppercase leading-tight text-white">Quy Nhơn, Gia Lai</div>
                <div className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  13.78°B, 109.22°Đ · Điểm đến của chuyến đi
                </div>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>

      {/* Mép cắt chéo xuống phần ảnh */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-14 bg-teal-600"
        style={{ clipPath: 'polygon(0 100%, 100% 0, 100% 100%)' }}
      />
    </header>
  );
}