import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Globe, Plus, Zap, TrendingUp, ArrowRight } from 'lucide-react'
import { timeAgo } from '@/lib/utils'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: profile }, { data: sites }, { data: txs }] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user!.id).single(),
    supabase.from('sites').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
    supabase.from('token_transactions').select('*').eq('user_id', user!.id).order('created_at', { ascending: false }).limit(5),
  ])

  const totalSites = sites?.length ?? 0
  const deployedSites = sites?.filter(s => s.status === 'deployed').length ?? 0

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-black tracking-tight">
          Welcome back{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-gray-500 mt-1">Here's what's happening with your websites.</p>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Token Balance', value: profile?.token_balance ?? 0, icon: <Zap size={18} />, color: 'bg-brand-50 text-brand-700', href: '/dashboard/billing' },
          { label: 'Total Sites',   value: totalSites,                 icon: <Globe size={18} />, color: 'bg-emerald-50 text-emerald-700', href: '/dashboard/sites' },
          { label: 'Deployed',      value: deployedSites,              icon: <TrendingUp size={18} />, color: 'bg-amber-50 text-amber-700', href: '/dashboard/sites' },
        ].map((stat, i) => (
          <Link key={i} href={stat.href} className="card p-5 hover:shadow-card-md transition-shadow">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.color}`}>{stat.icon}</div>
            <div className="font-black text-3xl">{stat.value}</div>
            <div className="text-sm text-gray-500 mt-0.5">{stat.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link href="/builder" className="bg-brand-600 text-white rounded-2xl p-5 shadow-card hover:shadow-card-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center text-2xl">✨</div>
          <div>
            <div className="font-bold text-lg">Build a new website</div>
            <div className="text-brand-200 text-sm">10 tokens · AI-powered</div>
          </div>
        </Link>
        <Link href="/dashboard/billing" className="card p-5 hover:shadow-card-md transition-shadow flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-2xl">⚡</div>
          <div>
            <div className="font-bold text-lg">Top up tokens</div>
            <div className="text-gray-500 text-sm">From $15 for 100 tokens</div>
          </div>
        </Link>
      </div>

      <div className="card overflow-hidden mb-6">
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200">
          <h2 className="font-bold text-lg">Recent Sites</h2>
          <Link href="/dashboard/sites" className="text-sm text-brand-600 font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight size={13} />
          </Link>
        </div>

        {!sites || sites.length === 0 ? (
          <div className="py-14 text-center">
            <div className="text-4xl mb-3">🌐</div>
            <p className="font-bold text-lg mb-2">No sites yet</p>
            <p className="text-gray-500 text-sm mb-4">Build your first AI website in minutes.</p>
            <Link href="/builder" className="btn btn-primary btn-md w-fit mx-auto"><Plus size={14} /> Create first site</Link>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {sites.map(site => (
              <div key={site.id} className="flex items-center justify-between px-6 py-4 hover:bg-surface-50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-brand-50 rounded-lg flex items-center justify-center text-brand-600"><Globe size={15} /></div>
                  <div>
                    <div className="font-medium text-sm">{site.name}</div>
                    <div className="text-xs text-gray-400">{site.subdomain}.harnova.my · {timeAgo(site.created_at)}</div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`status-${site.status}`} />
                  <span className="text-xs text-gray-500 capitalize">{site.status}</span>
                  <Link href={`/builder?site=${site.id}`} className="text-xs font-semibold text-brand-600 hover:underline ml-2">Edit</Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {txs && txs.length > 0 && (
        <div className="card overflow-hidden">
          <div className="px-6 py-4 border-b border-surface-200"><h2 className="font-bold text-lg">Recent Activity</h2></div>
          <div className="divide-y divide-surface-100">
            {txs.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-6 py-3">
                <div className="text-sm text-gray-600">{tx.description}</div>
                <div className={`font-mono font-bold text-sm ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {tx.amount > 0 ? '+' : ''}{tx.amount}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
