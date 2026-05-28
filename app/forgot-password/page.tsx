"use client";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPassword() {
    const [email, setEmail] = useState("");
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        // Send request to backend here
        setIsSubmitted(true);
    }

    return <h1>
        {!isSubmitted ? (
                <div className="min-h-screen w-full flex items-center justify-center p-4 text-white">
                    <div className="w-full max-w-md bg-slate-900 p-8 rounded-xl border border-slate-800 space-y-5 flex flex-col items-center">
                        <div>
                            <h1 className="text-2xl font-bold">Reset Password</h1>
                            <p className="text-sm text-gray-400 mt-1">
                                Enter your email address to receive a secure recovery link.
                            </p>
                        </div>

                        <form onSubmit={handleReset} className="space-y-4 flex flex-col items-center">
                            <div>
                                <label className="block text-sm font-medium text-gray-400 mb-1">
                                    Email Address
                                </label>
                                <input 
                                    type="email" 
                                    placeholder="you@example.com" 
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-64 bg-neutral-900 border border-neutral-700 rounded py-2 px-4 focus:ring-2 focus:ring-neutral-500 text-white"
                                    required 
                                />
                            </div>

                            <button 
                                type="submit" 
                                className="w-52 bg-blue-500 text-white rounded py-2 px-4 font-medium hover:bg-blue-600 transition"
                            >
                                Send Reset Link
                            </button>
                        </form>
                        <Link href="/login" className="underline text-blue-500 hover:text-blue-400">
                            Back to Login
                        </Link>
                    </div>
                </div>
                ) : (
                    <div className="text-center space-y-3 py-4">
                        <h1 className="text-2xl font-bold">Check your email</h1>
                        <p className="text-sm text-gray-400">
                            We have sent a secure password recovery link to <span className="underline italic text-grey-500 font-medium">{email}</span> if an account exists.
                        </p>
                        <Link href="/login" className="text-xs text-blue-500 underline block mt-4 hover:text-blue-400">
                            Return to Login screen
                        </Link>
                    </div>
                )}
        {/* <img src="/reaction.jpeg" className="size w-[50px] h-[50px]" />
        <span> Reset password</span>
        <input type="password" placeholder="Enter email" className="w-80 border border-gray-300 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-grey-200 flex" /> */}
    </h1>
}