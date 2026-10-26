import { useEffect, useState } from 'react';
import { MapPin, ArrowDown, Sparkles, Waves, UtensilsCrossed, Landmark, ScrollText } from 'lucide-react';
import VietnamMap from './VietnamMap';

// Ảnh nền hero: bỏ ảnh vào thư mục src/assets/hero/ (tên file nào cũng được).
// Chưa có ảnh thì hero vẫn chạy bình thường với nền aurora.
const heroModules = import.meta.glob('../assets/hero/*.{jpg,jpeg,png,webp,JPG,PNG}', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>;
const HERO_PHOTO: string | undefined = Object.values(heroModules)[0];

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
      {/* Khung ảnh nền.
          - Điện thoại / máy tính bảng: thẻ 16:9 nằm trên cùng, thấy trọn khung hình.
          - Máy tính (lg): trải kín nền hero phía sau chữ. */}
      <div className="relative mx-6 mt-6 aspect-video overflow-hidden rounded-3xl bg-gray-100 shadow-soft-lg lg:absolute lg:inset-0 lg:m-0 lg:aspect-auto lg:rounded-none lg:bg-transparent lg:shadow-none">
        {HERO_PHOTO && (
          <img
            src={HERO_PHOTO}
            alt=""
            aria-hidden
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
      </div>

      {/* Lớp phủ giữ chữ dễ đọc: chỉ cần ở máy tính, vì trên điện thoại chữ nằm ngoài ảnh.
          Đậm bên trái (chỗ có chữ), nhạt dần sang phải. Muốn ảnh rõ hơn: giảm 90 / 60 / 15. */}
      <div
        aria-hidden
        className="absolute inset-0 hidden bg-gradient-to-r from-paper/60 via-paper/25 to-transparent lg:block"
      />

      {/* Lớp mờ dần về màu nền ở chân hero (chỉ máy tính).
          Muốn ảnh rõ hơn ở chân: giảm h-40 xuống h-28. */}
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 hidden h-28 bg-gradient-to-t from-paper via-paper/60 to-transparent lg:block"
      />

      {/* 2 mảng màu phẳng nằm yên phía sau (chỉ máy tính, để không phủ màu lên thẻ ảnh trên điện thoại) */}
      <div
        aria-hidden
        className="absolute -left-24 top-10 hidden h-72 w-72 rounded-full bg-violet-200 opacity-30 blur-3xl lg:block"
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-1/3 hidden h-72 w-72 rounded-full bg-orange-200 opacity-40 blur-3xl lg:block"
      />

      <div className="relative mx-auto max-w-6xl px-6 pb-28 pt-8 lg:pb-32 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          {/* ===== Cột trái: trên máy tính nằm trên nền kính mờ cho dễ đọc =====
              Muốn chữ rõ hơn: tăng lg:bg-white/60 lên /75. Muốn thấy ảnh rõ hơn: giảm xuống /45. */}
          <div className="lg:rounded-3xl lg:bg-white/40 lg:p-8 lg:shadow-soft-lg lg:ring-1 lg:ring-white/60 lg:backdrop-blur-md">
            <p className="glass inline-flex items-center gap-2 rounded-full border border-white px-4 py-1.5 text-sm font-semibold text-violet-700 shadow-sm">
              <Sparkles className="h-4 w-4 text-teal-500" />
              Bản tin chuyến đi
            </p>

            <h1 className="mt-5 font-display text-5xl font-extrabold leading-[1.1] tracking-tight text-ink sm:text-6xl lg:text-7xl">
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

            <p className="mt-5 max-w-xl text-lg font-medium leading-relaxed text-gray-800">
              Một chuyến đi, một nhóm sinh viên và rất nhiều kỷ niệm. VTD.News là nơi bọn mình kể lại Quy Nhơn: những
              nơi đã đi, những người đã gặp và những khoảnh khắc không có trong sách hướng dẫn.
            </p>

            {/* Chip chủ đề: mỗi chip một màu riêng */}
            <div className="mt-7 flex flex-wrap items-center gap-2.5">
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
              className="group mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-8 py-4 text-base font-bold text-white shadow-lg shadow-gray-900/20 transition-all hover:-translate-y-1 hover:bg-gray-800"
            >
              Khám phá bài viết
              <ArrowDown className="h-5 w-5 group-hover:animate-bounce" />
            </a>
          </div>

          {/* ===== Cột phải: bản đồ đứng yên ===== */}
          <figure className="relative mx-auto w-full max-w-sm">
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

      {/* Mép lượn sóng xuống phần ảnh.
          - Sóng phía sau mờ hơn để làm mềm viền.
          - Sóng chính tràn xuống dưới 1px (-bottom-px) để không hở khe.
          - geometricPrecision giúp viền cong mịn, không còn vệt răng cưa. */}
      <svg
        aria-hidden
        viewBox="0 0 1440 80"
        preserveAspectRatio="none"
        shapeRendering="geometricPrecision"
        className="absolute inset-x-0 -bottom-px block h-14 w-full text-paper"
      >
        <path
          fill="currentColor"
          fillOpacity="0.5"
          d="M0,34 C240,84 480,-6 720,24 C960,54 1200,84 1440,24 L1440,81 L0,81 Z"
        />
        <path
          fill="currentColor"
          d="M0,40 C240,90 480,0 720,30 C960,60 1200,90 1440,30 L1440,81 L0,81 Z"
        />
      </svg>
    </header>
  );
}