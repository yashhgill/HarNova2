'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, CheckCircle } from 'lucide-react'

export default function SettingsPage() {
  const supabase = createClient()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) { setEmail(user.email ?? ''); setFullName(user.user_metadata?.full_name ?? '') }
    })
  }, [])

  async function save(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setSaved(false)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await Promise.all([
        supabase.auth.updateUser({ data: { full_name: fullName } }),
        supabase.from('profiles').update({ full_name: fullName }).eq('id', user.id),
      ])
    }
    setLoading(false); setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="p-8 max-w-lg">
      <h1 className="text-3xl font-black tracking-tight mb-2">Settings</h1>
      <p className="text-gray-500 mb-8">Manage your account details.</p>

      <div className="card p-6">
        <form onSubmit={save} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Full name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} className="input" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Email address</label>
            <input value={email} disabled className="input bg-surface-100 text-gray-400 cursor-not-allowed" />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p>
          </div>

          {saved && <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl p-3"><CheckCircle size={15} /> Changes saved!</div>}

          <button type="submit" disabled={loading} className="btn btn-primary btn-md w-full">
            {loading ? <Loader2 size={15} className="animate-spin" /> : null} Save changes
          </button>
        </form>
      </div>
    </div>
  )
}
