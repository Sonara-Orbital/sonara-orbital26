"use client";

import { useSwiper } from "swiper/react";

export function SwiperUpDown() {
  const swiper = useSwiper();

  return (
    <div className="absolute right-4 top-1/2 z-10 flex -translate-y-1/2 flex-col gap-2 bg-black/10 p-3 rounded rounded-xl hover:bg-black/20">
      <button
        type="button"
        onClick={() => swiper.slidePrev()}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-white/90 text-xl shadow-md transition hover:bg-white hover:shadow-xl"
        aria-label="Previous song"
      >
        ▲
      </button>
      <button
        type="button"
        onClick={() => swiper.slideNext()}
        className="flex h-10 w-10 items-center text-sm justify-center rounded-full bg-white/90 text-xl shadow-md transition hover:bg-white hover:shadow-xl"
        aria-label="Next song"
      >
        ▼
      </button>
    </div>
  );
}
