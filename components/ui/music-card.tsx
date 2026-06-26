import React from "react";
import Image from "next/image";
import { Card, CardDescription, CardTitle, CardContent } from "@/components/ui/card";

interface MusicCardProps {
    songName: string,
    albumName: string,
    artistName: string,
    imageUrl: string,
    className?: string,
}

export function MusicCard({ songName, albumName, artistName, imageUrl, className }: MusicCardProps) {
    return (
        <Card className="relative aspect-video overflow-hidden mx-auto w-full max-w-sm pt-0">
            <img 
                src={imageUrl}
                alt="Album Cover"
                className="absolute inset-0 z-10"
            />
            <div className="absolute p-10 inset-0 z-20">
                <CardTitle>{songName}</CardTitle>
                <CardDescription>in {albumName} by {artistName}</CardDescription>
            </div>

        </Card>
    )
}