"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from 'next/navigation';


export default function LoginPage() {
    const router = useRouter();
    const [loginInput, setLoginInput] = useState("");
    const [password, setPassword] = useState("");
    
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        let targetEmail: string = loginInput.trim()
         
        const isEmail: boolean = targetEmail.includes('@');
        console.log(isEmail)
        console.log(loginInput)
        console.log(password)

        // Convert to email
        if (isEmail) {
            console.log("User entered email");
        } else {
            console.log("User entered username");
            const { data: userData, error: userError} = await supabase
                .from('Users')
                .select('email')
                .eq('username', loginInput)
                // .returns<string>()
                .single();
            if (!userData || userError) {
                console.error("User not found. ", userError?.message)
            } else {
                console.log("USER FOUND")
                console.log("DATA>>>>>>>>")
                console.log(userData);
                targetEmail = userData.email;
            }
        }

        // Sign in 
        const { data, error } = await supabase.auth.signInWithPassword({
            email: targetEmail,
            password: password
        });

        if (error) {
            console.error("Login failed..... ", error.message)
            alert("Invalid Username/Password");
        } else {
            if (data?.session) {
                console.log("SIGNED IN!!!")
                router.push("/home")
            }
        }
     }

    return <div className="pl-3">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">Login</h1>
        <form onSubmit={handleLogin} className="flex flex-col">
            {/* Username */}
            <input onChange={(e) => setLoginInput(e.target.value)} type="text" placeholder="Username or Password" className="w-80 border border-gray-300 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-grey-200 flex" />
            <div className="max-w-83">
                {/* Password */}                
                <input onChange={(e) => setPassword(e.target.value)} type="password" placeholder="Password" className="w-80 border border-gray-300 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-grey-200 flex" />
                <div className="flex justify-between">
                    {/* Forgot password */}
                    <Link href='/forgot-password' className="text-blue underline text-[10px] rounded pr-4 py-2 hover:bg-blue-50">Forgot password?</Link>
                </div>
            </div>
            {/* Login button */}
            {/*  HAVENT LINKED LOGIN PAGE YET */}
            <button type="submit" className="bg-blue-500 text-white rounded py-2 px-4 mt-4 hover:bg-blue-600 flex">Login</button>
        </form>
            {/* Sign up*/}
            <div className="mt-4">
                <span className="text-sm"> Don't have an account? </span>
                <Link href="/signup" className="text-blue-500"> Signup now </Link>
            </div>
    </div>
}