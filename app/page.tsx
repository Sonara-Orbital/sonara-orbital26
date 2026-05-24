import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="font-sans dark:bg-black">
      <div>
        <h1 className="font-sans text-[50px]"> Sonara</h1>
      </div>
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <h1>Welcome to the Home Page</h1>
      </main>
      
      <div>
        <Link href="/login" className="bg-blue-100"> Log in </Link>
      </div>
    </div>
  )
}
