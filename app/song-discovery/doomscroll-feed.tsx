"use client";
import { SimpleSong } from "@/types/song";
import { ScrollRecommender } from "@/actions/scrollRecommender";

// scroller libraries
import { Swiper, SwiperSlide } from "swiper/react";
import { Virtual, Mousewheel } from "swiper/modules";
import React, { useState } from "react";

import "swiper/css";
import "swiper/css/virtual";

// Input SimpleSong array - (song_id, title, artist)
export default function DoomscrollFeed({ currentSongs }: { currentSongs: SimpleSong[] }) {
    const [seenSongs, setSongs] = useState<SimpleSong[]>(currentSongs);
    const [isLoading, setIsLoading] = useState(false);

    const handleSwipeNext = async (swiperInstance: any) => {
        const currIndex = swiperInstance.activeIndex;
         
        if (currIndex == seenSongs.length - 2 && !isLoading) {
            setIsLoading(true);
            try {
                const nextBatchSongs = await ScrollRecommender();
                if (nextBatchSongs && nextBatchSongs.length > 0) {
                    setSongs(prevSongs => prevSongs.concat(nextBatchSongs));
                }
            } catch (error) {
                console.error("Failed to load new songs");
            } finally {
                setIsLoading(false);
            }
        }
    }

    return <main>
        <Swiper
        modules={[Virtual, Mousewheel]}
        direction="vertical"
        className="w-full h-full"
        slidesPerView={2}
        mousewheel={true}
        
        virtual={{
            enabled: true,
            addSlidesAfter: 1,
            addSlidesBefore: 1
        }}

        onSlideChange={(swiper) => {
            const currIndex = swiper.activeIndex;
            handleSwipeNext(currIndex);
        }}
        >
            {currentSongs.map((song, index) =>
                <SwiperSlide key={song.song_id} virtualIndex={index}>    
                    <div>
                        <h2>{song.title}</h2>
                        <p>{song.artist}</p>
                        <span>Card Index: {index}</span>
                    </div>
                </SwiperSlide>
            )}

        </Swiper>
    </main>
}