'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LayoutDashboard, Globe, CreditCard, Settings, LogOut, Zap, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types'

const NAV = [
  { href: '/dashboard',          label: 'Overview',          icon: LayoutDashboard },
  { href: '/dashboard/sites',    label: 'My Sites',          icon: Globe },
  { href: '/dashboard/billing',  label: 'Tokens & Billing',  icon: CreditCard },
  { href: '/dashboard/settings', label: 'Settings',          icon: Settings },
]

export default function Sidebar({ profile }: { profile: Profile | null }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function signOut() {
    await supabase.auth.signOut()
    router.push('/'); router.refresh()
  }

  return (
    <aside className="w-60 min-h-screen bg-white border-r border-surface-200 flex flex-col sticky top-0 flex-shrink-0">
      <div className="p-5 border-b border-surface-200">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
          <span className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center text-white text-xs font-black">HN</span>
          HarNova
        </Link>
      </div>

      <div className="mx-4 mt-4 bg-brand-50 border border-brand-100 rounded-2xl p-4">
        <div className="flex items-center gap-1.5 mb-1.5 text-brand-700">
          <Zap size={13} />
          <span className="text-xs font-semibold">Token Balance</span>
        </div>
        <div className="font-black text-2xl text-brand-700">{profile?.token_balance ?? 0}</div>
        <Link href="/dashboard/billing" className="text-xs text-brand-600 font-medium hover:underline mt-1 inline-block">
          + Buy more tokens
        </Link>
      </div>

      <div className="px-4 mt-4">
        <Link href="/builder" className="btn btn-primary btn-md w-full">
          <Plus size={15} /> New Website
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-1 mt-2">
        {NAV.map(item => {
          const active = pathname === item.href
          return (
            <Link key={item.href} href={item.href}
              className={cn('flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? 'bg-brand-600 text-white shadow-sm' : 'text-gray-600 hover:bg-surface-100 hover:text-gray-900')}>
              <item.icon size={16} />{item.label}
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-surface-200">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
            {profile?.email?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold truncate">{profile?.full_name ?? 'User'}</div>
            <div className="text-xs text-gray-400 truncate">{profile?.email}</div>
          </div>
        </div>
        <button onClick={signOut} className="w-full flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 font-medium px-3 py-2 rounded-xl hover:bg-red-50 transition-colors">
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </aside>
  )
}
