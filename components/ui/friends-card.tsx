import { Input } from "./input";
import { Button } from "./button";
import { Card, CardHeader, CardFooter, CardDescription, CardContent } from "./card";
import { ScrollArea } from "./scroll-area"
import { useState } from "react";
import { Search, Check, X} from "lucide-react";
import { deleteFriend, acceptFriendRequest } from "@/app/auth/actions";

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
}

export function MadeFriendTag({username, id, userId, onRemove}: MadeFriendProp) {
    return (
        <Card className="w-[90%] h-auto min-h-10 flex flex-row justify-center items-center m-2 p-2">
            <div className="flex flex-row bg-grey w-[90%] items-center justify-between">
                <span className="text-sm font-medium leading-none">{username}</span>
                <Button variant="ghost" onClick={() => onRemove(id)} size="icon" className="h-6 w-6"><X color="red" className="h-4 w-4" /></Button>
            </div>
        </Card>
    )
}

export function FriendRequestTag({username, id, userId, onRemove, onAccept}: MadeFriendProp) {
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

    function buttonClick() {
        const username = text
        onClick(username)
        setText("")
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

    const testFriends = ["Friend 1", "Friend 2", "Friend 3", "Friend 4", "Friend 5"]

    return (
        <div className="flex flex-col gap-3 h-screen min-h-dvh">
            <Card className="flex flex-col py-5 min-h-0 bg-neutral-200 shrink-0 basis-1/2 border-[#77797a] border-1 overflow-hidden">
                <CardHeader className="flex flex-row bg-neutral-100 rounded-t-lg py-3 -mt-5 -mx-4">
                    <h1 className="pl-3">Friends</h1>
                </CardHeader>
                <CardContent className="flex flex-col flex-1 overflow-hidden bg-neutral-200">
                    <ScrollArea className="flex-1 overflow-y-auto mb-2">
                        {friends.map((item, index) => (
                            <MadeFriendTag key={item.id} onAccept={() => handleAcceptRequest(item.id, item.username)} userId={userId} id={item.id} username={item.username} onRemove={handleRemoveFriend}/>
                        ))}
                    </ScrollArea>
                    <div className="flex  flex-row gap-2 shrink-0">
                        <Input type="text" className="py-0 bg-neutral-100" placeholder="Add Friend" value={text} onChange={(e) => setText(e.target.value)}/>
                        <Button onClick={buttonClick} className="hover:cursor-pointer" type="button"><Search/></Button>
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
        </div>
    )
}
