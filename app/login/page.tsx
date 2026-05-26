import Link from "next/link";

export default function LoginPage() {
    return <div className="pl-3">
        {/* Title */}
        <h1 className="text-2xl font-bold mb-2">Login</h1>
        {/* Username */}
        <input type="text" placeholder="Username" className="w-80 border border-gray-300 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-grey-200 flex" />
        <div className="max-w-83">
            {/* Password */}                
            <input type="password" placeholder="Password" className="w-80 border border-gray-300 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-grey-200 flex" />
            <div className="flex justify-between">
                {/* Remember me */}
                <span className="py-1">
                    <input type="checkbox" id="remember" className="mr-2" />
                    <label htmlFor="remember">Remember me</label>
                </span>
                {/* Forgot password */}
                <Link href='/forgot-password' className="text-blue underline text-[10px] rounded pr-4 py-2 hover:bg-blue-50">Forgot password?</Link>
            </div>
        </div>
        {/* Login button */}
        {/*  HAVENT LINKED LOGIN PAGE YET */}
        <button className="bg-blue-500 text-white rounded py-2 px-4 mt-4 hover:bg-blue-600 flex">Login</button>
        {/* Sign up*/}
        <div className="mt-4">
            <span className="text-sm"> Don't have an account? </span>
            <Link href="/signup" className="text-blue-500"> Signup now </Link>
        </div>
    </div>
}