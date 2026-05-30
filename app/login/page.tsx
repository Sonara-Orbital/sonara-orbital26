"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2 } from 'lucide-react';


export default function LoginPage() {
    const router = useRouter();
    const [loginInput, setLoginInput] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    
    const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
    );
    
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

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
                setIsLoading(false);
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
            setIsLoading(false);
        } else {
            if (data?.session) {
                console.log("SIGNED IN!!!")
                router.push("/home")
            }
        }
    }

    const [showPassword, setShowPassword] = useState(false);


    return (<div className="bg-[#E9EEF8] min-h-screen flex flex-col justify-center items-center">
        {/* ADD SONARA AND LOGO HERE /}
        {/* Main card */}
        <div className="h-full max-h-md w-full max-w-md pl-3 flex flex-col justify-center items-center shadow-xl bg-white max-h-md p-8 rounded-2xl shadow-blue-900/5">
            {/* Title */}
            <h1 className="text-3xl font-semibold mb-8 tracking-tight text-[#334155]"> Sign In </h1>
            <form onSubmit={handleLogin} className="flex flex-col">
                {/* Username */}
                <label className="mb-1 font-semibold text-sm text-[#334155]"> Email or Username </label>
                <input onChange={(e) => setLoginInput(e.target.value)} type="text" placeholder="Email or Username" className="bg-[#F0F4FC]/70 w-90 border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-grey-100/10 flex"/>
                <div className="mt-4 max-w-83 text-[#334155] mt-3">
                    {/* Password and show password */} 
                    <label className="mb-1 font-semibold text-sm text-[#334155]"> Password </label>
                    <div className="relative">
                        <input onChange={(e) => setPassword(e.target.value)} type={showPassword ? "text" : "password"} placeholder="Password" className="bg-[#F0F4FC]/70 w-90 border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-grey-200 flex"/>
                        {/* Show password eye */}
                        <button type="button" onClick={() => {setShowPassword(!showPassword); console.log(showPassword);}}
                            className="p-2.5 hover-blue-400 absolute -right-6.5 top-0.5"> {showPassword ? <EyeOff className="h-5 w-5 text-[#334155] hover:text-[#1e293b] transition-colors"></EyeOff> : <Eye className="h-5 w-5 text-[#334155] hover:text-[#1e293b]"></Eye>} </button>
                    </div>  
                    {/* Forgot password */}
                    <Link href='/forgot-password' className="ml-0.5 mb-2 block mt-1 text-[#3B5CCC] text-xs rounded pr-4 py-2 hover:underline ">Forgot password?</Link>
                </div>
                {/* Login button #3B5CCC */} 
                <button type="submit" disabled={isLoading} className="w-full w-90 ${isLoading ? 'bg-blue-400 cursor-not-allowed' : 'bg-[#3B5CCC] hover:bg-[#2f4da8]'} flex items-center font-semibold text-[#F8FAFC] transition hover:bg-[#2f4da8] rounded-lg bg-[#3B5CCC] px-7 py-3 text-white py-2 px-4 mt-4 mb-3 flex justify-center"> 
                    {isLoading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing In... </>) : ("Log In") }
                </button>
            {/* divider */}
            <div className="my-6 border-t border-gray-100" />
            </form>
            {/* Sign up*/}
            <div className="mt-1">
                <span className="text-sm"> Don't have an account? </span>
                <Link href="/signup" className="text-[#3B5CCC] hover:underline font-semibold"> Sign up now </Link>
            </div>
        </div>
    </div>)

}