import Link from "next/link";

// Connected to fastAPI function generateFeed
// takes in list of songID list[str], returns list of songs list[dict] (5-10 songs at once)

export default function songDiscovery() {
    return <main>
        <Link href="/home" className="hover:text-blue-500 top-4 left-4 relative">  
            &lt; <span className="hover:underline"> back </span>
        </Link>
        <p className="text-center top-100 relative w-full">Song discovery is here</p>
    </main>
}