'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

const PACKS = [
  { id: 'starter', tokens: 100, usd: 15, label: 'Starter', icon: '🌱', desc: '10 website builds' },
  { id: 'builder', tokens: 200, usd: 30, label: 'Builder', icon: '🏗️', desc: '20 website builds', popular: true },
  { id: 'pro',     tokens: 500, usd: 60, label: 'Pro',     icon: '🚀', desc: '50 website builds' },
]

const COSTS = [
  { label: 'Generate website',  cost: 10, icon: '✨' },
  { label: 'Regenerate',        cost: 5,  icon: '🔄' },
  { label: 'Deploy (2-day)',    cost: 5,  icon: '🚀' },
  { label: 'Permanent deploy',  cost: 20, icon: '🌐' },
  { label: 'Hosting / month',   cost: 10, icon: '☁️' },
  { label: 'GitHub push',       cost: 5,  icon: '🔗' },
  { label: 'Custom domain/yr',  cost: 50, icon: '🏷️' },
  { label: 'Download ZIP',      cost: 0,  icon: '💾' },
]

function BillingContent() {
  const supabase = createClient()
  const searchParams = useSearchParams()
  const [balance, setBalance] = useState<number | null>(null)
  const [txs, setTxs] = useState<any[]>([])
  const [loadingPack, setLoadingPack] = useState<string | null>(null)
  const success = searchParams.get('success')
  const canceled = searchParams.get('canceled')

  useEffect(() => {
    supabase.from('profiles').select('token_balance').then(({ data }) => { if (data?.[0]) setBalance(data[0].token_balance) })
    supabase.from('token_transactions').select('*').order('created_at', { ascending: false }).limit(20).then(({ data }) => { if (data) setTxs(data) })
  }, [])

  async function buyPack(packId: string) {
    setLoadingPack(packId)
    try {
      const res = await fetch('/api/stripe/checkout', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ packId }) })
      const data = await res.json()
      if (data.url) window.location.href = data.url
    } finally { setLoadingPack(null) }
  }

  return (
    <div className="p-8 max-w-4xl">
      <h1 className="text-3xl font-black tracking-tight mb-2">Tokens & Billing</h1>
      <p className="text-gray-500 mb-6">Buy tokens to generate and deploy websites.</p>

      {success && <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 mb-6 flex items-center gap-2 text-emerald-700 text-sm"><CheckCircle size={16} /> Payment successful! Tokens added to your account.</div>}
      {canceled && <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 flex items-center gap-2 text-amber-700 text-sm"><XCircle size={16} /> Checkout canceled. No charge was made.</div>}

      <div className="bg-brand-600 text-white rounded-2xl shadow-card p-6 mb-8 flex items-center justify-between">
        <div>
          <p className="text-brand-200 text-sm mb-1">Current balance</p>
          <div className="font-black text-5xl flex items-baseline gap-2">
            {balance ?? <Loader2 size={28} className="animate-spin" />}
            <span className="text-brand-300 text-2xl">tokens</span>
          </div>
        </div>
        <div className="text-5xl">⚡</div>
      </div>

      <div className="card p-5 mb-8">
        <h2 className="font-bold text-lg mb-4">Token costs</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {COSTS.map((item, i) => (
            <div key={i} className="bg-surface-50 border border-surface-200 rounded-xl p-3 text-center">
              <div className="text-2xl mb-1">{item.icon}</div>
              <div className="font-black text-xl text-brand-700">{item.cost === 0 ? 'Free' : item.cost}</div>
              <div className="text-xs text-gray-500 mt-0.5">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      <h2 className="font-bold text-xl mb-4">Buy tokens</h2>
      <div className="grid md:grid-cols-3 gap-4 mb-10">
        {PACKS.map(pack => (
          <div key={pack.id} className={`relative rounded-2xl border p-5 ${pack.popular ? 'bg-brand-600 border-brand-600 text-white shadow-card-lg' : 'bg-white border-surface-200 shadow-card'}`}>
            {pack.popular && <span className="absolute -top-3 right-4 bg-yellow-400 text-black border border-yellow-500 rounded-full px-2.5 py-0.5 text-xs font-bold">⭐ Popular</span>}
            <div className="text-3xl mb-2">{pack.icon}</div>
            <div className="font-bold text-lg mb-1">{pack.label}</div>
            <div className="font-black text-4xl mb-1">${pack.usd}</div>
            <div className={`text-sm mb-4 ${pack.popular ? 'text-brand-200' : 'text-gray-500'}`}>{pack.tokens} tokens · {pack.desc}</div>
            <button onClick={() => buyPack(pack.id)} disabled={loadingPack === pack.id}
              className={`btn btn-md w-full ${pack.popular ? 'bg-white text-brand-700 border-white hover:bg-brand-50' : 'btn-primary'}`}>
              {loadingPack === pack.id ? <Loader2 size={14} className="animate-spin" /> : null}
              Buy {pack.tokens} tokens
            </button>
          </div>
        ))}
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-800">
        💬 Having trouble paying? WhatsApp <a href="https://wa.me/60182085097" target="_blank" rel="noopener" className="font-bold underline">+60 18-208 5097</a> and we'll top up manually.
      </div>

      <h2 className="font-bold text-xl mb-4">Transaction history</h2>
      <div className="card overflow-hidden">
        {txs.length === 0 ? (
          <div className="py-12 text-center text-gray-400 text-sm">No transactions yet.</div>
        ) : (
          <div className="divide-y divide-surface-100">
            {txs.map(tx => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3.5">
                <div>
                  <div className="text-sm font-medium">{tx.description}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{new Date(tx.created_at).toLocaleString('en-MY')}</div>
                </div>
                <div className={`font-mono font-bold text-base ${tx.amount > 0 ? 'text-emerald-600' : 'text-red-500'}`}>{tx.amount > 0 ? '+' : ''}{tx.amount}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default function BillingPage() {
  return <Suspense><BillingContent /></Suspense>
}
