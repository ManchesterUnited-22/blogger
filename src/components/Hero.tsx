import { useEffect, useState } from 'react';
import { MapPin, ArrowDown, Sparkles, Waves, UtensilsCrossed, Landmark, ScrollText } from 'lucide-react';
import VietnamMap from './VietnamMap';
import YouTubeBackground from './YouTubeBackground';

// Mã video YouTube làm nền (phần sau v= trong link)
const YT_ID = 'CKIUpDn39no';

// Mỗi từ xoay vòng có màu riêng, trùng màu với chip chủ đề bên dưới
const WORDS = [
  { text: 'biển xanh', color: 'text-cyan-600' },
  { text: 'món ngon', color: 'text-orange-600' },
  { text: 'đất võ', color: 'text-violet-600' },
  { text: 'con người', color: 'text-pink-600' },
];

// Mỗi chủ đề một màu và một icon riêng
const TOPICS = [
  { icon: Waves, label: 'Biển xanh', cls: 'bg-cyan-100 text-cyan-700' },
  { icon: UtensilsCrossed, label: 'Ẩm thực', cls: 'bg-orange-100 text-orange-700' },
  { icon: Landmark, label: 'Văn hóa', cls: 'bg-pink-100 text-pink-700' },
  { icon: ScrollText, label: 'Lịch sử', cls: 'bg-violet-100 text-violet-700' },
];

// Thời điểm (ms) từng phần hiện ra, sau khi video đã lộ rõ khoảng 1 giây đầu
const DELAY = {
  panel: 800,
  badge: 1000,
  title: 1150,
  text: 1300,
  chips: 1450,
  button: 1600,
  map: 1200,
};

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

  const word = WORDS[wordIndex];

  return (
    <header className="bg-aurora relative overflow-hidden">
      {/* Video nền YouTube: tự phát, tắt tiếng, lặp lại */}
      <YouTubeBackground videoId={YT_ID} />

      {/* Lớp phủ mỏng (40%). Lúc mới mở web nó trong suốt nên video hiện rõ,
          sau đó mới đặc dần lên. Muốn thấy video rõ hơn: giảm /40 xuống /30. */}
      <div aria-hidden className="hero-veil absolute inset-0 bg-paper/40" />

      {/* Các mảng màu: đứng yên, nhạt hơn để không che video */}
      <div aria-hidden className="absolute -left-24 top-10 h-72 w-72 rounded-full bg-violet-200 opacity-25 blur-3xl" />
      <div aria-hidden className="absolute -right-20 top-0 h-80 w-80 rounded-full bg-cyan-200 opacity-25 blur-3xl" />
      <div aria-hidden className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-orange-200 opacity-30 blur-3xl" />
      <div aria-hidden className="absolute bottom-10 right-1/4 h-64 w-64 rounded-full bg-pink-200 opacity-25 blur-3xl" />

      <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-14 lg:pb-32 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          {/* ===== Cột trái: nằm trong khung kính mờ ===== */}
          <div
            className="hero-fade-up rounded-3xl border border-white/70 bg-white/60 p-6 shadow-soft backdrop-blur-md sm:p-8 lg:p-10"
            style={{ animationDelay: `${DELAY.panel}ms` }}
          >
            <p
              className="hero-fade-up glass inline-flex items-center gap-2 rounded-full border border-white px-4 py-1.5 text-sm font-semibold text-violet-700 shadow-sm"
              style={{ animationDelay: `${DELAY.badge}ms` }}
            >
              <Sparkles className="h-4 w-4 text-teal-500" />
              Bản tin chuyến đi
            </p>

            <h1
              className="hero-fade-up mt-5 font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-6xl lg:text-7xl"
              style={{ animationDelay: `${DELAY.title}ms` }}
            >
              Những câu chuyện về
              <br />
              <span
                className={`inline-block pb-2 transition-opacity duration-300 ${word.color} ${
                  visible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {word.text}
              </span>
            </h1>

            <p
              className="hero-fade-up mt-5 max-w-xl text-lg leading-relaxed text-gray-700"
              style={{ animationDelay: `${DELAY.text}ms` }}
            >
              Một chuyến đi, một nhóm sinh viên và rất nhiều kỷ niệm. VTD.News là nơi bọn mình kể lại Quy Nhơn: những
              nơi đã đi, những người đã gặp và những khoảnh khắc không có trong sách hướng dẫn.
            </p>

            {/* Chip chủ đề: mỗi chip một màu riêng */}
            <div
              className="hero-fade-up mt-7 flex flex-wrap items-center gap-2.5"
              style={{ animationDelay: `${DELAY.chips}ms` }}
            >
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
              className="hero-fade-up mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-base font-bold text-white shadow-lg shadow-gray-900/20 transition-colors hover:bg-gray-800"
              style={{ animationDelay: `${DELAY.button}ms` }}
            >
              Khám phá bài viết
              <ArrowDown className="h-5 w-5 animate-bounce [animation-duration:2.4s]" />
            </a>
          </div>

          {/* ===== Cột phải: bản đồ đứng yên, trượt vào một lần ===== */}
          <figure
            className="hero-slide-in relative mx-auto w-full max-w-sm"
            style={{ animationDelay: `${DELAY.map}ms` }}
          >
            <span
              aria-hidden
              className="absolute -top-4 left-6 z-10 rounded-full bg-white px-4 py-1 text-xs font-bold tracking-wide text-teal-700 shadow-md ring-1 ring-teal-100"
            >
              Điểm đến
            </span>
            <div className="rounded-[2rem] bg-cyan-100 p-1.5 shadow-soft-lg">
              <div className="rounded-[1.6rem] bg-white p-6">
                <VietnamMap />
              </div>
            </div>
            <figcaption className="glass mt-4 flex items-center gap-3 rounded-2xl border border-white px-4 py-3 shadow-sm">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-500 text-white">
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