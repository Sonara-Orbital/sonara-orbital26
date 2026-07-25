"use client";
import { SimpleSong } from "@/types/song";
import { ScrollRecommender } from "@/actions/scrollRecommender";
import { addSong, addSongFromId } from "@/actions/songs";

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
import { SpotifyExportButton } from "@/components/ui/SpotifyExportButton";
import { Bookmark } from "lucide-react";
import { MusicCard } from "@/components/ui/MusicCard";

export default function DoomscrollFeed({ currentSongs }: { currentSongs: SimpleSong[] }) {
    const [sessionSeenSongs, setSongs] = useState<SimpleSong[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [allUserSeenSongIds, setAllUserSeenSongIds] = useState<string[]>([])
    const excludedIdsRef = React.useRef<string[]>([]);
    const [libraryIsEmpty, setLibraryIsEmpty] = useState(false);

    const [alreadyAdded, setAlreadyAdded] = useState<{[key: string]: boolean}>({});
    
    // Query first batch of songs on page load
    // Retrieve user's seen songs, update during session, send back to db after session ends
    React.useEffect(() => {
        const fetchInitialSongs = async () => {
            const userSeenSongsData: string[] = (await getUserBlacklist()) ?? [];  // array of seen song_id's
            excludedIdsRef.current = userSeenSongsData;
            setAllUserSeenSongIds(userSeenSongsData);
            console.log("SET", allUserSeenSongIds, userSeenSongsData);
            try {
                const recommenderRes = await ScrollRecommender(userSeenSongsData);  // CALL BACKEND FOR NEW SONGS
                
                // No songs in library, display message to user to add songs
                console.log("RECOMMENDER RES IS", recommenderRes);     
                if (recommenderRes.error == "empty library error") {
                    console.log("LIBRARY IS EMPTY SETTING TRUE");
                    setLibraryIsEmpty(true);
                    // return { sucess: false, error: "empty library error" };
                } else {
                    setLibraryIsEmpty(false);
                }

                console.log(libraryIsEmpty, "LIBRARY IS EMPTY");
            
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
            console.log(libraryIsEmpty, "LIBRARY IS EMPTY CANT ADD");
        }}
        >
        <SwiperUpDown />
        
        {libraryIsEmpty && (
            <SwiperSlide virtualIndex={0} className="h-full w-full">
                <div className="text-2xl bg-white p-2">Add Songs to Library to get recommendations!</div>
            </SwiperSlide>
        )}
        
            {sessionSeenSongs.map((song, index) => (
                <SwiperSlide key={song.song_id} className="relative w-full h-full flex justify-center items-end pt-2">    

                    {/* Button Group to interact with displayed song */}
                    <div className="absolute flex right-4 gap-2">
                        
                        {/* Export to spotify button */}
                        <div className="group relative p-1">
                            {/* <SpotifyExportButton 
                                songId={song.song_id} 
                                className="-translate-y-1 transition-transform opacity-100 hover:text-green-500/90 hover:opacity-100 opacity-80 group-hover:scale-110"
                                iconSize="w-10 h-10" */}
                                {/* />  */}
                                {/* tooltip */}
                            {/* <span className="pointer-events-none absolute right-20 top-3 opacity-0 -translate-y-4 translate-x-6 group-hover:opacity-100 transition-all duration-300 ease-out bg-neutral-900/90 text-white text-xs font-sm px-2 py-1 rounded shadow-md group-hover:delay-400">
                                Open in Spotify
                            </span> */}
                        </div>
                        
                        {/* Add to library button, BOOKMARK ICON*/}
                        {/* <div className="group relative">
                            <button className="hover:opacity-100 opacity-80 hover:scale-110"
                                onClick={async () => {
                                    const {success} = await addSongFromId(song.song_id); 
                                    console.log("adding");
                                    const songKey = `${song.title}-${song.artist}`;
                                    setAlreadyAdded(prev => ({...prev, [songKey]: true}));
                                    if (!success) {
                                        console.log("CANT ADD");
                                    }
                            }}>
                                <Bookmark className={`w-10 h-10 hover:fill-yellow-500 hover:outline-yellow-500 transition-transform duration-100
                                ${alreadyAdded[`${song.title}-${song.artist}`] 
                                    ? "fill-yellow-500"
                                    : "none"}`}
                                />
                            </button> */}

                            {/* tooltip */}
                            {/* <span className="pointer-events-none absolute right-20 top-3 opacity-0 translate-y-8 translate-x-20 group-hover:opacity-100 transition-all duration-300 ease-out bg-neutral-900/90 text-white text-xs font-sm px-2 py-1 rounded shadow-md group-hover:delay-400">
                                Save to Library
                            </span>
                        </div> */}
                        
                    </div>

                    {/* Main Song Display */}
                    {/* <div className="flex flex-col mt-14 rounded rounded-lg bg-blue-100/80 z-20">
                        <span className="m-20 text-stone-900">
                            <h2 className="font-medium text-5xl mt-4 mb-8">{song.title}</h2>
                            <p className="text-lg mb-8">{song.artist}</p>
                            <span className="text-sm absolute -translate-x-8 bottom-4 text-center">Card Index: {index}</span>
                        </span>
                    </div> */}
                    <MusicCard
                        songName={song.title}
                        albumName=""
                        artistName={song.artist}
                        imageUrl=""
                        songId={song.song_id}
                        isAdded={false}
                        buttonSize={10}    
                    ></MusicCard>
                </SwiperSlide> )
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