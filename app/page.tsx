import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="bg-[#E9EEF8] min-h-screen flex flex-col items-center">
        <div className="mt-10 h-full max-h-md w-full max-w-md pl-3 flex flex-col justify-center items-center shadow-xl bg-white max-h-md p-8 rounded-2xl shadow-blue-900/5">
          <div className="mt-10 mb-8 text-7xl font-bold text-[#334155] mb-4 tracking-tight">Sonara</div>
          <Link href="/login" className="'bg-[#3B5CCC] hover:bg-[#2f4da8]'} flex items-center font-semibold text-[#F8FAFC] transition hover:bg-[#2f4da8] rounded-lg bg-[#3B5CCC] px-7 py-3 text-white py-2 px-4 mt-4 mb-3 flex justify-center"> 
            Start Now
          </Link>
        </div>
    </div>
  )
}
