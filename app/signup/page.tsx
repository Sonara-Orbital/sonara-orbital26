"use client";
import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import Link from "next/link";
import { useRouter } from "next/navigation";

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
            password
        });

        setLoading(true);

        if (error) {
            setError(error.message);
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

    return <div>
        <div className="flex flex-col">
            <h1 className="text-2xl font-bold mb-2">Create an Account</h1>
            <form onSubmit={handleSignup} className="flex flex-col">
                {/* Username */}
                <div>
                    <label className=""> 
                        Username
                    </label>
                    <input type="text" placeholder="Jeff" value={name} 
                        onChange={(e) => setName(e.target.value)}
                        className="border border-2 border-neutral-500 my-1 ml-2"
                        required/>
                </div>

                {/* Email */}
                <div>
                    <label className=""> 
                        Email
                    </label>
                    <input type="text" 
                        placeholder="ABC@gmail.com" 
                        value={email} 
                        onChange={(e) => setEmail(e.target.value)}
                        className="border border-2 border-neutral-500 my-1 ml-2"
                        required/>
                </div>

                {/* Password */}
                <div>
                    <label className=""> 
                        Password
                    </label>
                    <input type="text" 
                        placeholder="***" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)}
                        className="border border-2 border-neutral-500 my-1 ml-2"
                        required/>
                </div>
                <button 
                    type="submit" disabled={loading}
                    className="w-46 bg-neutral-500 text-gray-200">
                        {loading ? "Creating Account.." : "Sign Up"}
                    </button>
            </form>

            <p> Already have account? 
                <Link href="/login" className="underline text-blue-500">Sign in</Link>
            </p>
        </div>
    </div>
}
