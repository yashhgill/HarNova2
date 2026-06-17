import Link from 'next/link'

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      <div className="p-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight w-fit">
          <span className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white text-sm font-black">HN</span>
          HarNova
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-5 py-10">
        {children}
      </div>
    </div>
  )
}
