"use client";
import Link from "next/link";
import { useState } from "react";
import { Loader2 } from "lucide-react"

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        // Send request to backend here
        setTimeout(() => {
            setIsLoading(false);
            setIsSubmitted(true);
        }, 1400);
    }

    return <span>
        {!isSubmitted ? (
                <div className="bg-[#E9EEF8] min-h-screen flex justify-center items-center">
                    <div className="h-full max-h-md w-full max-w-md pl-3 flex flex-col justify-center shadow-xl bg-white max-h-md p-8 rounded-2xl shadow-blue-900/5">
                        <div>
                            <h1 className="mt-3 text-3xl font-semibold mb-2 tracking-tight text-[#334155] text-center"> Reset Password</h1>
                            <p className="text-sm text-gray-500/80 mt-1 mb-6 text-center">
                                Enter your email address to receive a secure recovery link
                            </p>
                        </div>

                        <form onSubmit={handleReset} className="space-y-4 flex flex-col items-center">
                            <div className="mt-3">
                                <label className="mb-1 font-semibold text-sm text-[#334155]">
                                    Email Address
                                </label>
                                <input 
                                    type="email" 
                                    placeholder="Email" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-1 bg-[#F0F4FC]/70 w-90 border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-grey-200 flex"
                                    required 
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-full max-w-90 mt-8 text-l items-center font-semibold text-[#F8FAFC] transition hover:bg-[#2f4da8] rounded-xl bg-[#3B5CCC] px-7 py-3 text-white py-2 px-4 mt-4 mb-3 flex justify-center">
                                {isLoading 
                                    ? <> <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying... </>
                                    : "Send Reset Link" }
                            </button>
                            {/* divider */}
                            <div className="w-full max-w-90 my-5 border-t border-gray-100"/>
                        </form>
                        <span className="text-center mt-1">
                            Already have an account? {" "}
                            <Link href="/login" className="text-[#3B5CCC] hover:underline font-semibold">
                                Sign in now
                            </Link>
                        </span>
                    </div>
                </div>
                ) : (
                    // EMAIL SENT 
                    <div className="bg-[#E9EEF8] min-h-screen flex justify-center items-center">
                    <div className="h-full max-h-md w-full max-w-md pl-3 flex flex-col justify-center items-center shadow-xl bg-white max-h-md p-8 rounded-2xl shadow-blue-900/5">
                        <div>
                            <h1 className="mt-3 text-3xl font-semibold mb-6 tracking-tight text-[#334155] text-center"> Check your email </h1>
                            <p className="max-w-80 text-md text-gray-500/80 mt-1 mb-10 text-center">
                                We have sent a secure password recovery link to <span className="underline italic text-grey-500 font-medium">{email}</span> if an account exists
                            </p>
                        </div>

                            <Link href="/login" className="text-[#3B5CCC] hover:underline font-semibold text-center mt-10">
                                Return to login page
                            </Link>
                    </div>
                </div>
                    // <div className="text-center space-y-3 py-4">
                    //     <h1 className="text-2xl font-bold">Check your email</h1>
                    //     <p className="text-sm text-gray-400">
                    //         We have sent a secure password recovery link to <span className="underline italic text-grey-500 font-medium">{email}</span> if an account exists.
                    //     </p>
                    //     <Link href="/login" className="text-xs text-blue-500 underline block mt-4 hover:text-blue-400">
                    //         Return to Login screen
                    //     </Link>
                    // </div>
                )}
        {/* <img src="/reaction.jpeg" className="size w-[50px] h-[50px]" />
        <span> Reset password</span>
        <input type="password" placeholder="Enter email" className="w-80 border border-gray-300 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-grey-200 flex" /> */}
    </span>
}