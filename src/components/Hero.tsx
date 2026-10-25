import { useEffect, useState } from 'react';
import { MapPin, ArrowDown, Heart, Waves, UtensilsCrossed, Landmark } from 'lucide-react';
import VietnamMap from './VietnamMap';

// Các từ khóa xoay vòng trong câu "Những câu chuyện về ..."
const WORDS = ['biển xanh', 'món ngon', 'đất võ', 'con người'];

const TOPICS = [
  { icon: Waves, label: 'Biển xanh', color: 'text-teal-600' },
  { icon: UtensilsCrossed, label: 'Ẩm thực', color: 'text-orange-500' },
  { icon: Landmark, label: 'Văn hóa', color: 'text-sky-600' },
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
    <header className="relative overflow-hidden border-b border-gray-900 bg-[#faf8f3]">
      {/* Ảnh nền rất nhạt, như ảnh in mờ trên giấy báo (xóa khối này nếu muốn nền kem trơn) */}
      <img
        src="https://images.pexels.com/photos/29162860/pexels-photo-29162860.jpeg?auto=compress&cs=tinysrgb&w=1600"
        alt=""
        aria-hidden
        className="absolute inset-0 h-full w-full object-cover opacity-[0.12] grayscale"
      />

      <div className="relative mx-auto max-w-6xl px-6 py-14 lg:py-20">
        <div className="grid items-center gap-12 lg:grid-cols-[1.25fr_0.75fr]">
          {/* ===== Cột trái: tiêu đề lớn như trang nhất ===== */}
          <div>
            <p className="inline-flex items-center gap-3 text-xs font-bold uppercase tracking-widest text-orange-600">
              <span aria-hidden className="inline-block h-2.5 w-2.5 rotate-45 rounded-sm bg-teal-500" />
              Bản tin chuyến đi
            </p>

            <h1 className="mt-4 font-serif text-5xl font-black leading-[1.05] tracking-tight text-gray-900 sm:text-6xl lg:text-7xl">
              Những câu chuyện về{' '}
              <span
                className={`inline-block text-orange-500 transition-opacity duration-300 ${
                  visible ? 'opacity-100' : 'opacity-0'
                }`}
              >
                {WORDS[wordIndex]}
              </span>
            </h1>

            <span className="mt-6 block h-1 w-16 rounded-full bg-orange-400" />

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-gray-700">
              Một chuyến đi, một nhóm sinh viên và rất nhiều kỷ niệm. VTD.News là nơi bọn mình kể lại Quy Nhơn: những
              nơi đã đi, những người đã gặp và những khoảnh khắc không có trong sách hướng dẫn.
            </p>

            {/* Dải thông tin kẻ đường mảnh trên dưới, như hàng chỉ mục trong báo */}
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-gray-300 py-4">
              <div className="flex items-center gap-2.5 pr-6 sm:border-r sm:border-gray-300">
                <Heart className="h-5 w-5 fill-rose-500 text-rose-500" />
                <span className="font-serif text-3xl font-black leading-none text-gray-900">100%</span>
                <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Đam mê</span>
              </div>
              {TOPICS.map(({ icon: Icon, label, color }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-gray-700"
                >
                  <Icon className={`h-4 w-4 ${color}`} />
                  {label}
                </span>
              ))}
            </div>

            <a
              href="#feed"
              className="mt-8 inline-flex items-center gap-2 rounded-sm bg-gray-900 px-6 py-3 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-teal-600"
            >
              Khám phá bài viết
              <ArrowDown className="h-4 w-4 animate-bounce" />
            </a>
          </div>

          {/* ===== Cột phải: bản đồ như một hình minh họa có chú thích ===== */}
          <figure className="mx-auto w-full max-w-sm">
            <div className="border border-gray-900 bg-white p-6">
              <VietnamMap />
            </div>
            <figcaption className="mt-3 flex items-start gap-3 border-t-4 border-gray-900 pt-3">
              <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-orange-500" />
              <div>
                <div className="font-serif text-lg font-bold leading-tight text-gray-900">Quy Nhơn, Gia Lai</div>
                <div className="mt-0.5 text-xs font-semibold uppercase tracking-widest text-gray-500">
                  13.78°B, 109.22°Đ · Điểm đến của chuyến đi
                </div>
              </div>
            </figcaption>
          </figure>
        </div>
      </div>
    </header>
  );
}