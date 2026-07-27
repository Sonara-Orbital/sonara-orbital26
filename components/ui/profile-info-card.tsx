// components/ui/profile-info-card.tsx
"use client";

import { useState, useTransition, useRef } from "react";
import Image from "next/image";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupInput } from "@/components/ui/input-group";
import { updateProfile } from "@/app/auth/actions";
import { uploadAvatar } from "@/utils/supabase/upload-avatar";
import { LogOut } from "lucide-react";

interface ProfileInfoCardProps {
    userId: string;
    initialName: string;
    initialAvatarUrl: string | null;
    joinDate: string;
    onSignOut: () => void;
    isSigningOut: boolean;
}

export function ProfileInfoCard({ onSignOut, isSigningOut, userId, initialName, initialAvatarUrl, joinDate }: ProfileInfoCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [name, setName] = useState(initialName ?? "");
    const [avatarUrl, setAvatarUrl] = useState(initialAvatarUrl);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [pendingFile, setPendingFile] = useState<File | null>(null);
    const [isPending, startTransition] = useTransition();
    const [error, setError] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith("image/")) {
            setError("Please select an image file");
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            setError("Image must be under 5MB");
            return;
        }

        setPendingFile(file);
        setPreviewUrl(URL.createObjectURL(file));
        setError(null);
    };

    const handleSave = () => {
        startTransition(async () => {
            let newAvatarUrl = avatarUrl;

            if (pendingFile) {
                const uploadResult = await uploadAvatar(userId, pendingFile);
                if (!uploadResult.success) {
                    setError(uploadResult.error ?? "Upload failed");
                    return;
                }
                newAvatarUrl = uploadResult.url ?? null;
            }

            const result = await updateProfile(userId, name, newAvatarUrl);
            if (result.success) {
                setAvatarUrl(newAvatarUrl);
                setPendingFile(null);
                setPreviewUrl(null);
                setIsEditing(false);
                setError(null);
            } else {
                setError(result.error ?? "Something went wrong");
            }
        });
    };

    const handleCancel = () => {
        setName(initialName ?? "");
        setPendingFile(null);
        setPreviewUrl(null);
        setIsEditing(false);
        setError(null);
    };

    const displayUrl = previewUrl ?? avatarUrl;

    return (
        <Card className="relative">
            <Button variant="ghost" size="icon" className="absolute top-3 right-3 h-8 w-8" 
            onClick={onSignOut} disabled={isSigningOut} aria-label="Sign out">
                <LogOut className="h-4 w-4"/> 
            </Button>
            <CardHeader>
                <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 text-center">
                <div
                    className={`relative w-20 h-20 rounded-full overflow-hidden bg-muted ${isEditing ? "cursor-pointer" : ""}`}
                    onClick={() => isEditing && fileInputRef.current?.click()}
                >
                    {displayUrl ? (
                        <Image priority sizes="80px" src={displayUrl} alt={`${name}'s avatar`} fill className="object-cover" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-lg font-medium text-muted-foreground">
                            {name?.[0]?.toUpperCase()}
                        </div>
                    )}
                    {isEditing && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-xs">
                            Change
                        </div>
                    )}
                </div>

                {isEditing && (
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileSelect}
                    />
                )}

                {isEditing ? (
                    <div className="flex flex-col items-center gap-2 w-full">
                        <InputGroup>
                            <InputGroupInput
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                            />
                        </InputGroup>
                        {error && <p className="text-sm text-red-500">{error}</p>}
                        <div className="flex gap-2">
                            <Button size="sm" onClick={handleSave} disabled={isPending}>
                                {isPending ? "Saving..." : "Save"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancel} disabled={isPending}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div>
                        <div className="flex items-center gap-2 justify-center">
                            <p className="text-lg font-semibold">{name}</p>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="text-xs text-muted-foreground underline"
                            >
                                Edit
                            </button>
                        </div>
                        <p className="text-sm text-muted-foreground">Joined {joinDate}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}