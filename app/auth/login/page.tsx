'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true); setError('')
    const { error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err) { setError(err.message); setLoading(false); return }
    router.push('/dashboard'); router.refresh()
  }

  return (
    <div className="w-full max-w-md">
      <div className="card-lg p-8">
        <div className="mb-6">
          <h1 className="text-3xl font-black tracking-tight">Welcome back</h1>
          <p className="text-gray-500 text-sm mt-1">Log in to your HarNova dashboard.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-4">{error}</div>}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="Your password" className="input pr-10" required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            {loading ? 'Logging in...' : 'Log in'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          No account yet? <Link href="/auth/signup" className="text-brand-600 font-semibold hover:underline">Sign up free</Link>
        </p>
      </div>
    </div>
  )
}
