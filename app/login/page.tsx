import Link from "next/link";

export default function LoginPage() {
    return <div>
        <h1 className="text-2xl font-bold mb-2">Login</h1>
        <input type="text" placeholder="Username" className="border border-gray-300 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-grey-200 flex" />
        <input type="password" placeholder="Password" className="border border-gray-300 rounded py-2 px-4 focus:outline-none focus:ring-2 focus:ring-grey-200 flex" />
        <input type="checkbox" id="remember" className="mr-2" />
        <label htmlFor="remember">Remember me</label>
        <Link href='/forgot-password'className="text-blue underline rounded py-2 px-4 mt-4 hover:bg-blue-50">Forgot password?</Link>
    </div>
}