import { CalendarDays, MapPin } from 'lucide-react';
import ScrollReveal from '@/components/ScrollReveal';

export default function GroupPhoto() {
  return (
    <section className="mx-auto max-w-6xl px-6 pt-4">
      <ScrollReveal>
        <figure className="group relative overflow-hidden rounded-3xl border border-teal-100 bg-gray-100 shadow-xl">
          <img
            src="/doan-quy-nhon.jpg"
            alt="Tập thể sinh viên Đại học Duy Tân trong chuyến dã ngoại thực tế Đà Nẵng – Quy Nhơn"
            loading="lazy"
            className="block h-auto w-full transition-transform duration-700 group-hover:scale-[1.02]"
          />

          {/* Lớp mờ dưới ảnh để chữ chú thích dễ đọc */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent" />

          <figcaption className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-3 p-4 sm:p-6">
            <div>
              
              <div className="mt-0.5 text-xs text-white/85 sm:text-sm">
                Dã ngoại thực tế Đà Nẵng – Quy Nhơn · Thực tập Nhận thức
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-medium text-white sm:text-sm">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                <CalendarDays className="h-4 w-4" /> 15–18/10/2026
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 backdrop-blur-sm">
                <MapPin className="h-4 w-4" /> Quy Nhơn
              </span>
            </div>
          </figcaption>
        </figure>
      </ScrollReveal>
    </section>
  );
}