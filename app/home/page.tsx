import { redirect } from "next/navigation"
import { createClient } from "@/utils/supabase/server"
import { cookies } from "next/headers"

export default async function Home() {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login")
    }

    return (
        <div>
            <h1>Welcome {user.email}</h1>
            <p>Login Success</p>
        </div>
    )
}
