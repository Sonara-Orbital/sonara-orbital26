"use server";

import { createClient } from "@/utils/supabase/server";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

//SIGN OUT ACTION
export async function signOutAction() {

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    await supabase.auth.signOut();

    redirect("/");
}

//ADD FRIEND ACTION
export async function addFriend(receiver: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: "User not logged in"}
    }

    const sender = user.id;
    console.log("Sender is: " + sender);

    const { data: receiverData, error: receiverError} = await supabase
    .from("Users")
    .select("id")
    .like("username", receiver)

    if (receiverError) {
        console.log(receiverError.message)
        return { success: false, error: receiverError.message}
    }

    if (!receiverData) {
        return { success: false, error: "This Username Doesn't Exist"};
    }

    const receiver_id = receiverData[0]['id'];
    console.log("Receiver is: " + receiver_id);

    const { error } = await supabase
    .from('friends')
    .insert({
        sender: sender,
        receiver: receiver_id,
        status: 'pending',
        updated_by: sender,
    });

    if (error) {
        if (error.code == '23505') {
            return { success: false, error: "A friend request is already pending or exists"};
        }
        return { success: false, error: error.message};
    }

    revalidatePath('/profile');
}

//FIND FRIENDS
interface UserData {
    sender: {
        id: string;
        username: string;
    };
    receiver: {
        id: string;
        username: string;
    }
}

export async function findFriends(user_id: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { success: false, error: "User not logged in"};
    }

    const username = user.user_metadata?.username;

    const { data, error } = await supabase
    .from('friends')
    .select("sender:sender ( id, username), receiver:receiver ( id, username)")
    .eq("status", "accepted")
    .or(`sender.eq.${user_id},receiver.eq.${user_id}`);

    if (error || !data) {
        console.log(error.message);
        return { success: false, error: error.message};
    }

    if (data.length == 0) {
        return [];
    }

    const tempList: string[] = [];
    for (const dict of data) {
        tempList.push((dict as any)["sender"]);
        tempList.push((dict as any)["receiver"]);
    }

    const outputList = tempList.filter(x => (x as any)["username"] !== username);
    console.log(outputList)

    return outputList;
}

//ACCEPT FRIEND REQUEST
export async function acceptFriendRequest(sender: string, receiver: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data, error } = await supabase
    .from('friends')
    .update({status: "accepted", updated_by: receiver})
    .eq("receiver", receiver).eq("sender", sender)
    .select();

    if (error) {
        return { success: false, error: error.message};
    }

    if (!data || data.length == 0) {
        return {success: false, error: "no matching row found"}
    }

    return {success: true, data}

}

//GET FRIEND REQUESTS
export async function getFriendRequests(user_id: string) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const {data: { user: userData }, error: authError} = await supabase.auth.getUser();

    if (authError || !userData) {
        return {success: false, error: "User not logged in"}
    }

    const username = userData.user_metadata?.username

    const { data, error } = await supabase
    .from('friends')
    .select("sender: sender (id, username)")
    .eq("receiver", user_id)

    if (error || !data) {
        return { success: false, error: error.message};
    }

    const tempList: string[] = [];
    for (const dict of data) {
        tempList.push((dict as any)["sender"]);
    }

    const outputList = tempList.filter(x => (x as any)["username"] !== username);
    console.log(outputList)

    return outputList;
}

//DELETE FRIEND :(
export async function deleteFriend(first_id: string, second_id: string) {

    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { error } = await supabase
    .from('friends')
    .delete()
    .or(`and(sender.eq.${first_id},receiver.eq.${second_id}),and(sender.eq.${second_id},receiver.eq.${first_id})`);

    if (error) {
        console.log(error.message);
        return { success: false, error: error.message};
    }


    return { success: true };

}