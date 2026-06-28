"use client";
import { SimpleSong } from "@/types/song";
import { ScrollRecommender } from "@/actions/scrollRecommender";

// scroller libraries
import { Swiper, SwiperSlide } from "swiper/react";
import { Virtual, Mousewheel } from "swiper/modules";
import React, { useState } from "react";

import "swiper/css";
import "swiper/css/virtual";

// import { cookies } from "next/headers";
import { getUserBlacklist } from "@/actions/getUserBlacklist";
import { saveUserBlacklist } from "@/actions/saveUserBlacklist";

import { SwiperUpDown } from "@/components/ui/swiperUpDown"

export default function DoomscrollFeed({ currentSongs }: { currentSongs: SimpleSong[] }) {
    const [sessionSeenSongs, setSongs] = useState<SimpleSong[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [allUserSeenSongIds, setAllUserSeenSongIds] = useState<string[]>([])
    const excludedIdsRef = React.useRef<string[]>([]);
    
    // Query first batch of songs on page load
    // Retrieve user's seen songs, update during session, send back to db after session ends
    React.useEffect(() => {
        const fetchInitialSongs = async () => {
            const userSeenSongsData: string[] = (await getUserBlacklist()) ?? [];  // array of seen song_id's
            excludedIdsRef.current = userSeenSongsData;
            setAllUserSeenSongIds(userSeenSongsData);
            console.log("SET", allUserSeenSongIds, userSeenSongsData);
            try {
                const recommenderRes = await ScrollRecommender(userSeenSongsData);  // blacklist songs that have been viewed
                const firstBatchSongs = recommenderRes.data ?? [];
                const firstBatchIds = firstBatchSongs.map((song: SimpleSong) => song.song_id);
                const updatedExcludedIds = [...userSeenSongsData, ...firstBatchIds];

                excludedIdsRef.current = updatedExcludedIds;
                setAllUserSeenSongIds(updatedExcludedIds);
                setSongs(firstBatchSongs);
            } catch (error) {
                console.error("Cannot load first batch of songs", error)
            } finally {
                setIsLoading(false);
            }
        }
            
        const persistBlacklist = () => {
            saveUserBlacklist(excludedIdsRef.current);
        };

        window.addEventListener("beforeunload", persistBlacklist);
        document.addEventListener("visibilitychange", () => {
            if (document.visibilityState === "hidden") {
                persistBlacklist();
            }
        });

        fetchInitialSongs();

        return () => {
            window.removeEventListener("beforeunload", persistBlacklist);
            document.removeEventListener("visibilitychange", persistBlacklist);
        };
    }, []);
    

    const handleSwipeNext = async (swiperInstance: any) => {
        const currIndex = swiperInstance.activeIndex;
        console.log("YOUR SEEN SONGS ARE", sessionSeenSongs, " and Index is ", currIndex, "and length is ", sessionSeenSongs.length);

        // GET NEW 5 SONG BATCH EVERY 5 SCROLLS
        if (currIndex == sessionSeenSongs.length - 2 && !isLoading) {
            console.log("RECOMMENDING NEW SONGS...")

            setIsLoading(true);
            try {
                const recommenderRes = await ScrollRecommender(excludedIdsRef.current);
                const nextBatchSongs = recommenderRes.data ?? [];
                console.log("YOUR NEXT SONGS ARE", nextBatchSongs, "LENGTH ", nextBatchSongs.length);

                if (nextBatchSongs.length > 0) {
                    setSongs(prevSongs => prevSongs.concat(nextBatchSongs));
                    const newBatchSongIds = nextBatchSongs.map((song: SimpleSong) => song.song_id);
                    const updatedExcludedIds = [...excludedIdsRef.current, ...newBatchSongIds];
                    excludedIdsRef.current = updatedExcludedIds;
                    setAllUserSeenSongIds(updatedExcludedIds);
                    console.log("CONCATENATED", nextBatchSongs);
                }
            } catch (error) {
                console.log("CANT LOAD");
                console.error("Failed to load new songs", error);
            } finally {
                console.log("done loading, next songs are ", sessionSeenSongs);
                setIsLoading(false);
            }
        }
    }

    return <main className="relative text-center w-full h-full">
        <Swiper
        modules={[Virtual, Mousewheel]}
        direction="vertical"
        className="w-full h-full"
        slidesPerView={1}
        mousewheel={true}
        style={{ width: "100%"}}
        
        virtual={{
            enabled: true,
            addSlidesAfter: 1,
            addSlidesBefore: 1,
            slides: sessionSeenSongs
        }}

        onSlideChange={(swiper) => {
            // const currIndex = swiper.activeIndex;
            handleSwipeNext(swiper);
        }}
        >
            <SwiperUpDown />
            {sessionSeenSongs.map((song, index) =>
                <SwiperSlide key={song.song_id} className=" w-full h-full flex items-center justify center">    
                    <div className="bg-red-200 flex flex-col">
                        <span className="m-20">
                            <h2 className="font-medium text-7xl mt-4 mb-8">{song.title}</h2>
                            <p className="text-lg mb-8">{song.artist}</p>
                            <span className="text-sm absolute -translate-x-8 bottom-4 text-center ">Card Index: {index}</span>
                        </span>
                    </div>
                </SwiperSlide>
            )}

        {/* Loading */}
        {isLoading && (
        <SwiperSlide virtualIndex={sessionSeenSongs.length} className="w-full h-full">
            <div className="w-full h-full flex flex-col justify-center items-center text-white">
                {/* Spinner */}
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-black text-md animate-pulse">Loading...</p>
            </div>
        </SwiperSlide>
        )}

        </Swiper>
    </main>
}