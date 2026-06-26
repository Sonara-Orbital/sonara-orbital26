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
        <Card className="relative mx-auto my-5 ml-30 w-full max-w-sm pt-0">
            <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
                <img 
                    src={imageUrl}
                    alt="Album Cover"
                    className="relative z-20 aspect-video w-full object-cover"
                />
                <CardTitle className="px-5">{songName}</CardTitle>
                <CardDescription className="px-5">in "{albumName}" by "{artistName}"</CardDescription>
        </Card>
    )
}