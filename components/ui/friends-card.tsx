import { Input } from "./input";
import { Button } from "./button";
import { Card, CardHeader, CardFooter, CardDescription, CardContent } from "./card";
import { ScrollArea } from "./scroll-area"
import { useEffect, useRef, useState } from "react";
import { Search, Check, X, UserPlus} from "lucide-react";
import { searchUsernames, addFriend, deleteFriend, acceptFriendRequest,  getFriendSongs } from "@/app/auth/actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./dialog"

interface FriendCardProps {
    onClick: (e:string) => void;
    friendsList: {id: string, username: string}[];
    requestsList: {id: string, username: string}[];
    userId: string;
}

interface MadeFriendProp {
    userId: string;
    id: string;
    username: string;
    onRemove: (id: string) => void;
    onAccept: (id: string, username: string) => void;
    onClick: (id: string, username: string) => void;
}

interface FriendRequestProp {
    userId: string;
    id: string;
    username: string;
    onRemove: (id: string) => void;
    onAccept: (id: string, username: string) => void;
}

interface Song {
    id: string;
    title: string;
    artist: string;
    created_at: string
}

export function MadeFriendTag({username, id, userId, onRemove, onClick}: MadeFriendProp) {
    return (
        <Card className="w-[90%] h-auto min-h-10 flex flex-row justify-center items-center m-2 p-2 hover:cursor-pointer" onClick={() => onClick(id, username)}>
            <div className="flex flex-row bg-grey w-[90%] items-center justify-between">
                <span className="text-sm font-medium leading-none">{username}</span>
                <Button variant="ghost" onClick={(e) => {
                        e.stopPropagation();
                        onRemove(id);
                    }} 
                    size="icon" className="h-6 w-6"><X color="red" className="h-4 w-4" /></Button>
            </div>
        </Card>
    )
}

export function FriendRequestTag({username, id, userId, onRemove, onAccept}: FriendRequestProp) {
    return (
        <Card className="w-[90%] h-auto min-h-10 flex flex-row justify-center items-center m-2 p-2">
            <div className="flex flex-row bg-grey w-[90%] items-center justify-between">
                <span className="text-sm font-medium leading-none">{username}</span>
                <div>
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => onAccept(id, username)}><Check color="green" className="h-4 w-4" /></Button>
                    <Button variant="ghost" onClick={() => onRemove(id)} size="icon" className="h-6 w-6"><X color="red" className="h-4 w-4" /></Button>
                </div>
            </div>
        </Card>
    )
}

export function FriendsCard({ onClick, friendsList, requestsList, userId }: FriendCardProps) {
    const [text, setText] = useState("");
    const[friends, setFriends] = useState(friendsList);
    const[requests, setRequests] = useState(requestsList);
    const [results, setResults] = useState<{id: string; username: string }[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [showDropdown, setShowDropdown] = useState(false);
    const [songDialogOpen, setSongDialogOpen] = useState(false);
    const [selectedFriend, setSelectedFriend] = useState<{id: string; username: string} | null>(null);
    const [songs, setSongs] = useState<Song[]>([]);
    const [songsLoading, setSongsLoading] = useState(false);
    const [songsError, setSongsError] = useState<string | null>(null);


    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if(selectedId && results.find((r) => r.id === selectedId)?.username !== text) {
            setSelectedId(null);
        }

        if (text.trim().length < 2) {
            setResults([]);
            return;
        }

        setLoading(true);
        const timeout = setTimeout( async() => {
            const data = await searchUsernames(text);
            setResults(data);
            setLoading(false);
            setShowDropdown(true);
        }, 300);


        return () => clearTimeout(timeout);
    }, [text]);

    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside)
        return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [])

    function handleSelectUser(user: {id: string, username: string}) {
        setText(user.username);
        setSelectedId(user.id);
        setShowDropdown(false);
    }

    async function buttonClick() {
        if (!selectedId) return;
        
        const idToSend = selectedId;
        setText("");
        setSelectedId(null);
        setResults([]);
        setShowDropdown(false)

        try {
            const result = await addFriend(idToSend);
            if (result?.error) {
                throw new Error(result.error);
            }
            onClick(idToSend);
        } catch (err) {
            console.error("Failed to send friend request", err);
        }

    }

    async function handleRemoveFriend(id: string) {
        const prevFriends = friends;
        setFriends((current) => current.filter((f) => f.id !== id));

        try{
            const result = await deleteFriend(userId, id);
            if (result?.error) {
                throw new Error(result.error);
            }
        } catch (err) {
            setFriends(prevFriends);
            console.error("Failed to delete friend, rolled back", err);
        }
    }

    async function handleRemoveRequest(id: string) {
        const prevRequests = requests;
        setRequests((current) => current.filter((f) => f.id !== id));

        try{
            const result = await deleteFriend(userId, id);
            if (result?.error) {
                throw new Error(result.error);
            }
        } catch (err) {
            setRequests(prevRequests);
            console.error("Failed to delete friend, rolled back", err);
        }
    }

    async function handleAcceptRequest(id: string, username: string) {
        const prevRequests = requests;
        const prevFriends = friends;
        const newFriend = {id: id, username: username};
        setRequests((current) => current.filter((f) => f.id !== id));
        setFriends(friends.concat([newFriend]));

        try{
            const result = await acceptFriendRequest(id, userId);
            if (result?.error) {
                throw new Error(result.error);
            }
        } catch (err) {
            setRequests(prevRequests);
            setFriends(prevFriends)
            console.error("Failed to delete friend, rolled back", err);
        }
    }

    async function handleFriendClick(id: string, username: string) {
        setSelectedFriend({id, username});
        setSongDialogOpen(true);
        setSongsLoading(true);
        setSongsError(null);

        try {
            const result = await getFriendSongs(id);
            if (!Array.isArray(result)) {
                throw new Error(result.error);
            }
            setSongs(result as Song[]);
        } catch (err) {
            console.error("Failed to fetch recent songs", err);
            setSongsError("Couldnt load Songs");
            setSongs([]);
        } finally {
            setSongsLoading(false);
        }
    }

    function handleDialogChange(open: boolean) {
        setSongDialogOpen(open);
        if (!open) {
            setSongs([]);
            setSelectedFriend(null);
            setSongsError(null);
        }
    }

    const testFriends = ["Friend 1", "Friend 2", "Friend 3", "Friend 4", "Friend 5"]

    return (
        <div className="flex flex-col gap-3 h-screen min-h-dvh">
            <Card className="flex flex-col py-5 min-h-0 bg-neutral-200 shrink-0 basis-1/2 border-[#77797a] border-1 overflow-visible">
                <CardHeader className="flex flex-row bg-neutral-100 rounded-t-lg py-3 -mt-4.5 mx-0">
                    <h1 className="pl-3">Friends</h1>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 overflow-visible bg-neutral-200">
                    <ScrollArea className="flex-1 overflow-y-auto mb-2">
                        {friends.map((item, index) => (
                            <MadeFriendTag onClick={handleFriendClick} key={item.id} onAccept={() => handleAcceptRequest(item.id, item.username)} userId={userId} id={item.id} username={item.username} onRemove={handleRemoveFriend}/>
                        ))}
                    </ScrollArea>
                    <div className="relative flex flex-row gap-2 shrink-0" ref={containerRef}>
                        <Input 
                        type="text" 
                        className="py-0 bg-neutral-100" 
                        placeholder="Add Friend" 
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        onFocus={() => { if (results.length > 0) setShowDropdown(true)}}/>
                        <Button onClick={buttonClick} disabled={!selectedId} className="hover:cursor-pointer" type="button"><UserPlus/></Button>
                        {showDropdown && (
                            <Card className="absolute top-full left-0 right-11 mt-1 z-10 max-h-48 overflow-y-auto p-1 bg-neutral-100">
                                {loading && (
                                    <div className="text-sm text-muted-foreground px-2 py-1">Searching..</div>
                                )}
                                {!loading && results.length === 0 && (
                                    <div className="text-sm text-muted-foreground px-2 py-1">No Users Found</div>
                                )}
                                {!loading && results.map((user) => (
                                    <div
                                        key={user.id}
                                        className="px-2 py-1 rounded hover:bg-neutral-200 cursor-pointer text-sm"
                                        onClick={() => { handleSelectUser(user)}}>{user.username}</div>
                                ))}
                            </Card>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Card className="flex flex-col py-5 min-h-0 bg-neutral-200 border-[#77797a] border-1 overflow-hidden">
                <CardHeader className="flex flex-row bg-neutral-100 py-3 -mt-5 -mx-5">
                    <p className="pl-4">Friend Requests</p>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 overflow-hidden bg-neutral-200">
                    <ScrollArea className="flex-1 overflow-y-auto mb-2">
                        {requests.map((item, index) => (
                            <FriendRequestTag onAccept={() => handleAcceptRequest(item.id, item.username)} onRemove={handleRemoveRequest} key={index} userId={userId} id={item.id} username={item.username}/>
                        ))}
                    </ScrollArea>
                </CardContent>
            </Card>
            <Dialog open={songDialogOpen} onOpenChange={handleDialogChange}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedFriend?.username}'s Recent Songs</DialogTitle>
                        <DialogDescription>Latest 5 Songs added to their library</DialogDescription>
                    </DialogHeader>

                    {songsLoading && (
                        <div className="text-sm text-muted-foreground py-4">Loading</div>
                    )}
                    {!songsLoading && !songsError && songs.length === 0 && (
                        <div className="text=sm text-muted-foreground py-4">No Songs Found</div>
                    )}
                    {!songsLoading && songs.map((song) => (
                        <div key={song.id} className="flex flex-col py-2 border-b last:border-0">
                            <span className="text-sm font-medium">{song.title}</span>
                            <span className="text-xs text-muted-foreground">{song.artist}</span>
                        </div>
                    ))}
                </DialogContent>
            </Dialog>
        </div>
    )
}
