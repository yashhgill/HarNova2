'use client'
import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, Eye, EyeOff, Loader2, Mail } from 'lucide-react'

export default function SignupPage() {
  const supabase = createClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error: err } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName }, emailRedirectTo: `${window.location.origin}/auth/callback` },
    })
    if (err) { setError(err.message); setLoading(false); return }
    setDone(true); setLoading(false)
  }

  if (done) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 bg-brand-50 rounded-2xl flex items-center justify-center mx-auto mb-5">
          <Mail size={28} className="text-brand-600" />
        </div>
        <h1 className="text-2xl font-bold mb-3">Check your email</h1>
        <p className="text-gray-500 mb-6">
          We sent a confirmation link to <strong>{email}</strong>. Click it to activate your account and claim your 10 free tokens.
        </p>
        <Link href="/auth/login" className="text-brand-600 font-semibold hover:underline text-sm">Back to login →</Link>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md">
      <div className="card-lg p-8">
        <div className="mb-6">
          <span className="token-badge mb-4">🎁 10 free tokens on signup</span>
          <h1 className="text-3xl font-black tracking-tight">Create your account</h1>
          <p className="text-gray-500 text-sm mt-1">Start building your website for free.</p>
        </div>

        {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 mb-4">{error}</div>}

        <form onSubmit={handleSignup} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Full name</label>
            <input value={fullName} onChange={e => setFullName(e.target.value)} placeholder="Ahmad bin Ali" className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Email address</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="you@email.com" className="input" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Password</label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" minLength={8} className="input pr-10" required />
              <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-lg w-full">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <ArrowRight size={16} />}
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account? <Link href="/auth/login" className="text-brand-600 font-semibold hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  )
}
