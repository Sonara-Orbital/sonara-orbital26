"use client";

import { useSwiper } from "swiper/react";

export function SwiperUpDown() {
  const swiper = useSwiper();

  return (
    <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2">
      <button
        type="button"
        onClick={() => swiper.slidePrev()}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl shadow-md transition hover:bg-white"
        aria-label="Previous song"
      >
        ↑
      </button>
      <button
        type="button"
        onClick={() => swiper.slideNext()}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl shadow-md transition hover:bg-white"
        aria-label="Next song"
      >
        ↓
      </button>
    </div>
  );
}
