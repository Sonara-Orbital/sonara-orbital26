import React, { useState } from "react";

export function useHomeContentLogger() {
    const [searchMode, setSearchMode] = useState("song");
    const [inputVal, setInputVal] = useState("");

    console.log("Welcome to HomeContent component!");
    console.log("Current search mode:", searchMode);
    console.log("User input value:", inputVal);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting search for:", inputVal);

        try {
            const res = await fetch("/api/process", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ inputVal })
            });

            console.log("API response status:", res.status);

            const rawData = await res.json();
            console.log("Fetched raw song data:", rawData);

            console.log("Successfully rendered recommendations for turn:", 0);
        } catch (error) {
            console.error("Error during submission:", error);
        }
    };

    return {
        searchMode,
        setSearchMode,
        inputVal,
        setInputVal,
        handleSubmit,
    };
}