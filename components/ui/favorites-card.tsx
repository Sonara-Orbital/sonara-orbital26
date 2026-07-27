"use client";

import { useEffect, useState, useTransition } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { updateFavorites } from "@/app/auth/actions";

interface FavoritesCardProps {
    userId: string;
    initialFavoriteArtist: string | null;
    initialFavoriteSong: string | null;
}

export function FavoritesCard({ userId, initialFavoriteArtist, initialFavoriteSong }: FavoritesCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [favoriteArtist, setFavoriteArtist] = useState(initialFavoriteArtist ?? "");
    const [favoriteSong, setFavoriteSong] = useState(initialFavoriteSong ?? "");
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setFavoriteArtist(initialFavoriteArtist ?? "");
        setFavoriteSong(initialFavoriteSong ?? "");
    }, [initialFavoriteArtist, initialFavoriteSong])

    const handleSave = () => {
        startTransition(async () => {
            const result = await updateFavorites(userId, favoriteArtist, favoriteSong);
            if (result.success) {
                setIsEditing(false);
                setError(null);
            } else {
                setError(result.error ?? "Something went wrong");
            }
        });
    };

    const handleCancel = () => {
        setFavoriteArtist(initialFavoriteArtist ?? "");
        setFavoriteSong(initialFavoriteSong ?? "");
        setIsEditing(false);
        setError(null);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Favorites</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4">
                <div>
                    <label className="text-sm text-muted-foreground">Favorite Artist</label>
                    {isEditing ? (
                        <InputGroup>
                            <InputGroupInput
                                value={favoriteArtist}
                                onChange={(e) => setFavoriteArtist(e.target.value)}
                                placeholder="e.g. Tame Impala"
                            />
                        </InputGroup>
                    ) : (
                        <p className="text-base">{favoriteArtist || "Not set"}</p>
                    )}
                </div>

                <div>
                    <label className="text-sm text-muted-foreground">Favorite Song</label>
                    {isEditing ? (
                        <InputGroup>
                            <InputGroupInput
                                value={favoriteSong}
                                onChange={(e) => setFavoriteSong(e.target.value)}
                                placeholder="e.g. The Less I Know The Better"
                            />
                        </InputGroup>
                    ) : (
                        <p className="text-base">{favoriteSong || "Not set"}</p>
                    )}
                </div>

                {error && <p className="text-sm text-red-500">{error}</p>}
            </CardContent>
            <CardFooter className="flex gap-2">
                {isEditing ? (
                    <>
                        <Button onClick={handleSave} disabled={isPending}>
                            {isPending ? "Saving..." : "Save"}
                        </Button>
                        <Button variant="outline" onClick={handleCancel} disabled={isPending}>
                            Cancel
                        </Button>
                    </>
                ) : (
                    <Button variant="outline" onClick={() => setIsEditing(true)}>
                        Edit
                    </Button>
                )}
            </CardFooter>
        </Card>
    );
}