"use client"

import { Bookmark } from "lucide-react";
import { useState, useEffect } from "react";

interface inputInfo {
    isAdded: boolean
    actionOnAdd: (e?:React.MouseEvent<HTMLButtonElement>) => void;
    className?: string
}

export function AddToLibraryButton({ isAdded, actionOnAdd, className }: inputInfo) {
    const [isClicked, setIsClicked] = useState(false);
    useEffect(() => {
        setIsClicked(isAdded);
    }, [isAdded])

    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        setIsClicked(prev => !prev);
        if (actionOnAdd) {
            actionOnAdd(e);
        }
    }

    return <button onClick={handleClick} type="submit" className={`${className}`}>
        <Bookmark
            strokeWidth={1.5}
            className={`${isClicked ? "fill-yellow-500" : "none"} -translate-y-3 h-10 w-10 text-medium hover:fill-yellow-500 hover:scale-110 transition ease-in-out duration-100`}
        />
    </button>
}