'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Loader2 } from 'lucide-react'

export default function CallbackPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') { router.push('/dashboard'); router.refresh() }
    })
    // In case session already exists
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) { router.push('/dashboard'); router.refresh() }
    })
  }, [])

  return (
    <div className="text-center">
      <Loader2 size={32} className="animate-spin text-brand-600 mx-auto mb-4" />
      <h2 className="font-bold text-xl">Verifying your account...</h2>
      <p className="text-gray-500 text-sm mt-2">Redirecting you to the dashboard.</p>
    </div>
  )
}
