"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SignupPage() {

    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const supabase = createClient();

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        console.log({name});
        console.log({email});
        console.log({password});

        const {data, error} = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username: name // sends the username as metadata
                }
            }
        });

        if (!email.includes("@")) {
            setLoading(false);
            setError("Please Enter Valid Email")
            alert("Please Enter Valid Email")
        } else if (error) {
            setLoading(false);
            setError(error.message);
            alert("Error")
            return;
        } else {
            alert("Check your email for verification!");
            router.push("/login");
        } 
    };

    // send userData to backend
    const userData = {
        userName: name, 
        emailAddress: email,
        password: password 
    }

    return <div className="bg-[#E9EEF8] min-h-screen flex justify-center items-center">
        <div className="h-full max-h-md w-full max-w-md pl-3 flex flex-col justify-center items-center shadow-xl bg-white max-h-md p-8 rounded-2xl shadow-blue-900/5">
            <h1 className="text-3xl font-semibold mb-8 tracking-tight text-[#334155]">Create Account</h1>
            <form onSubmit={handleSignup} className="flex flex-col items-center">
                {/* Username */}
                <div>
                    <label className="mb-1 font-semibold text-sm text-[#334155]"> 
                        Username
                    </label>
                    <input type="text" placeholder="Jeff" value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="mb-2 bg-[#F0F4FC]/70 w-90 border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:text-gray-900 focus:ring-2 focus:ring-grey-100/10 flex"
                        required/>
                </div>

                {/* Email */}
                <div>
                    <label className="mb-1 font-semibold text-sm text-[#334155]"> 
                        Email
                    </label>
                    <input type="text" 
                        placeholder="ABC@gmail.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="mb-2 bg-[#F0F4FC]/70 w-90 border border-gray-300 rounded-xl py-2 px-4 focus:outline-none focus:text-gray-900 focus:ring-2 focus:ring-grey-100/10 flex"
                        required/>
                </div>

                {/* Password */}
                <div>
                    <label className="mb-1 font-semibold text-sm text-[#334155]"> 
                        Password
                    </label>
                    <input type="text" 
                        placeholder="******" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="mb-5 bg-[#F0F4FC]/70 w-90 border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:text-gray-900 focus:ring-2 focus:ring-grey-100/10 flex"
                        required/>
                </div>
                <button 
                    type="submit" disabled={loading}
                    className="flex items-center justify-center bg-[#3B5CCC] hover:bg-[#2f4da8]'} font-semibold text-[#F8FAFC] transition hover:bg-[#2f4da8] rounded-lg bg-[#3B5CCC] px-7 py-3 text-white py-2 px-4 mt-6 mb-3 w-90 text-center">
                        {loading ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating Account... </>) : "Sign Up"}
                </button>
                {/* divider */}
                <div className="w-full my-7 border-t border-gray-100" />
            </form>

            <p> Already have account? {" "}
                <Link href="/login" className="text-[#3B5CCC] hover:underline font-semibold">Sign in</Link>
            </p>
        </div>
    </div>
}
