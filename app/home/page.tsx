import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import styles from "./page.module.css";
import Link from "next/link";
import HomeContent from "./HomeContent";

export default async function Home({ children }: { children: React.ReactNode}) {
    const cookieStore = await cookies();
    const supabase = createClient(cookieStore);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const metadata = user.user_metadata;

    return (
                <HomeContent userMetadata={metadata}>
                    {children}
                </HomeContent>
    )
}
