'use client'
import { useState, useRef, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import {
  Sparkles, Download, Save, RefreshCw, Loader2, AlertCircle, CheckCircle,
  Zap, Monitor, Smartphone, ChevronLeft, Rocket, Github, Globe, Clock, X
} from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const SITE_TYPES = [
  { value: 'landing',    label: '🏢 SME Business' },
  { value: 'ecommerce',  label: '🛒 E-Commerce' },
  { value: 'restaurant', label: '🍜 Restaurant / F&B' },
  { value: 'portfolio',  label: '🎨 Portfolio' },
  { value: 'saas',       label: '💻 SaaS / App' },
  { value: 'fullstack',  label: '⚙️ Full-stack App' },
]

const LOADING_MSGS = [
  '🎨 Sketching your layout...',
  '🤖 Claude is writing your content...',
  '📱 Making it mobile-friendly...',
  '✨ Adding finishing touches...',
  '🚀 Almost ready...',
]

function DeployModal({ open, onClose, onDeploy, deploying }: { open: boolean; onClose: () => void; onDeploy: (permanent: boolean) => void; deploying: boolean }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-card-lg max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={18} /></button>
        <h2 className="text-xl font-bold mb-1">Deploy your website</h2>
        <p className="text-gray-500 text-sm mb-5">Choose how you want to go live.</p>

        <div className="space-y-3">
          <button onClick={() => onDeploy(false)} disabled={deploying}
            className="w-full text-left p-4 border border-surface-200 rounded-xl hover:border-brand-400 hover:bg-brand-50/30 transition-all flex items-start gap-3">
            <Clock size={20} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">2-Day Trial <span className="token-badge">5 tokens</span></div>
              <div className="text-xs text-gray-500 mt-0.5">Live on a harnova.my subdomain for 48 hours. Great for testing.</div>
            </div>
          </button>
          <button onClick={() => onDeploy(true)} disabled={deploying}
            className="w-full text-left p-4 border border-surface-200 rounded-xl hover:border-brand-400 hover:bg-brand-50/30 transition-all flex items-start gap-3">
            <Globe size={20} className="text-brand-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-semibold text-sm flex items-center gap-2">Permanent Subdomain <span className="token-badge">20 tokens</span></div>
              <div className="text-xs text-gray-500 mt-0.5">Live permanently on yoursite.harnova.my. Billed 10 tokens/month after first month.</div>
            </div>
          </button>
        </div>

        {deploying && (
          <div className="mt-4 flex items-center gap-2 text-sm text-brand-600">
            <Loader2 size={14} className="animate-spin" /> Deploying your site...
          </div>
        )}

        <p className="text-xs text-gray-400 mt-4">Want a custom domain like mybusiness.com? Go to Settings → Domains after deploying.</p>
      </div>
    </div>
  )
}

function GithubModal({ open, onClose, onPush, pushing }: { open: boolean; onClose: () => void; onPush: (token: string, repo: string) => void; pushing: boolean }) {
  const [token, setToken] = useState('')
  const [repo, setRepo] = useState('')
  if (!open) return null
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-card-lg max-w-md w-full p-6 relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"><X size={18} /></button>
        <h2 className="text-xl font-bold mb-1 flex items-center gap-2"><Github size={20} /> Push to GitHub</h2>
        <p className="text-gray-500 text-sm mb-5">5 tokens · Creates a new repo and pushes your site.</p>

        <div className="space-y-3">
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">GitHub Personal Access Token</label>
            <input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="ghp_..." className="input" />
            <p className="text-xs text-gray-400 mt-1">
              Needs <code className="bg-surface-100 px-1 rounded">repo</code> scope. Generate at{' '}
              <a href="https://github.com/settings/tokens" target="_blank" rel="noopener" className="text-brand-600 underline">github.com/settings/tokens</a>
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1.5 text-gray-700">Repository name</label>
            <input value={repo} onChange={e => setRepo(e.target.value)} placeholder="my-business-website" className="input" />
          </div>
        </div>

        <button onClick={() => onPush(token, repo)} disabled={pushing || !token || !repo} className="btn btn-primary btn-md w-full mt-5">
          {pushing ? <Loader2 size={14} className="animate-spin" /> : <Github size={14} />}
          {pushing ? 'Pushing...' : 'Push to GitHub'}
        </button>
      </div>
    </div>
  )
}

function BuilderContent() {
  const searchParams = useSearchParams()
  const supabase = createClient()

  const [prompt, setPrompt] = useState('')
  const [siteName, setSiteName] = useState('')
  const [siteType, setSiteType] = useState('landing')
  const [html, setHtml] = useState('')
  const [siteId, setSiteId] = useState<string | null>(searchParams.get('site'))
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [tokenBalance, setTokenBalance] = useState<number | null>(null)
  const [tokensUsed, setTokensUsed] = useState<number | null>(null)
  const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
  const [generated, setGenerated] = useState(false)
  const [loadingMsg, setLoadingMsg] = useState('')
  const [deployModal, setDeployModal] = useState(false)
  const [githubModal, setGithubModal] = useState(false)
  const [deploying, setDeploying] = useState(false)
  const [pushing, setPushing] = useState(false)
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null)
  const [toast, setToast] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)

  useEffect(() => {
    supabase.from('profiles').select('token_balance').then(({ data }) => { if (data?.[0]) setTokenBalance(data[0].token_balance) })
  }, [])

  useEffect(() => {
    if (siteId) {
      supabase.from('sites').select('*').eq('id', siteId).single().then(({ data }) => {
        if (data) { setHtml(data.html); setSiteName(data.name); setGenerated(true); setDeployedUrl(data.deployed_url) }
      })
    }
  }, [siteId])

  useEffect(() => {
    if (!loading) return
    let i = 0
    const iv = setInterval(() => { setLoadingMsg(LOADING_MSGS[i % LOADING_MSGS.length]); i++ }, 1800)
    return () => clearInterval(iv)
  }, [loading])

  useEffect(() => {
    if (!toast) return
    const t = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(t)
  }, [toast])

  async function generate(isRegenerate = false) {
    if (!prompt.trim()) { setError('Please describe your business first.'); return }
    setLoading(true); setError(''); setLoadingMsg(LOADING_MSGS[0])

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, siteType, siteName, regenerate: isRegenerate, existingSiteId: isRegenerate ? siteId : undefined }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error || 'Generation failed'); return }

      setHtml(data.html); setSiteId(data.siteId); setTokenBalance(data.newBalance); setTokensUsed(data.tokensUsed); setGenerated(true)
    } catch (e: any) {
      setError(e.message || 'Something went wrong')
    } finally { setLoading(false) }
  }

  async function saveSite() {
    if (!siteId || !html) return
    setSaving(true)
    await fetch('/api/sites/save', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteId, html, name: siteName }) })
    setSaving(false)
    setToast({ type: 'success', msg: 'Saved!' })
  }

  function downloadHtml() {
    if (!html) return
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${siteName || 'my-website'}.html`; a.click()
    URL.revokeObjectURL(url)
  }

  async function handleDeploy(permanent: boolean) {
    if (!siteId) return
    setDeploying(true)
    try {
      const res = await fetch('/api/sites/deploy', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteId, permanent }) })
      const data = await res.json()
      if (!res.ok) { setToast({ type: 'error', msg: data.error || 'Deploy failed' }); return }
      setDeployedUrl(data.deployedUrl); setTokenBalance(data.newBalance); setDeployModal(false)
      setToast({ type: 'success', msg: 'Deployed successfully!' })
    } catch (e: any) {
      setToast({ type: 'error', msg: e.message })
    } finally { setDeploying(false) }
  }

  async function handleGithubPush(token: string, repo: string) {
    if (!siteId) return
    setPushing(true)
    try {
      const res = await fetch('/api/github/connect', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ siteId, githubToken: token, repoName: repo }) })
      const data = await res.json()
      if (!res.ok) { setToast({ type: 'error', msg: data.error || 'Push failed' }); return }
      setTokenBalance(data.newBalance); setGithubModal(false)
      setToast({ type: 'success', msg: `Pushed to ${data.repoUrl}` })
    } catch (e: any) {
      setToast({ type: 'error', msg: e.message })
    } finally { setPushing(false) }
  }

  return (
    <div className="min-h-screen bg-surface-50 flex flex-col">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-card-lg text-sm font-medium flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
          {toast.type === 'success' ? <CheckCircle size={15} /> : <AlertCircle size={15} />} {toast.msg}
        </div>
      )}

      <DeployModal open={deployModal} onClose={() => setDeployModal(false)} onDeploy={handleDeploy} deploying={deploying} />
      <GithubModal open={githubModal} onClose={() => setGithubModal(false)} onPush={handleGithubPush} pushing={pushing} />

      {/* Top bar */}
      <header className="bg-white border-b border-surface-200 px-5 h-14 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="text-gray-400 hover:text-gray-900 transition-colors"><ChevronLeft size={20} /></Link>
          <span className="font-bold text-lg tracking-tight">HarNova <span className="text-brand-600">Builder</span></span>
          {siteName && <span className="text-sm text-gray-400">/ {siteName}</span>}
          {deployedUrl && (
            <a href={deployedUrl} target="_blank" rel="noopener" className="token-badge bg-emerald-50 text-emerald-700 border-emerald-100">
              <Globe size={11} /> Live
            </a>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {tokenBalance !== null && <div className="token-badge"><Zap size={12} /> {tokenBalance} tokens</div>}

          {generated && (
            <>
              <div className="flex border border-surface-300 rounded-full overflow-hidden">
                <button onClick={() => setViewMode('desktop')} className={`px-3 py-1.5 transition-colors ${viewMode === 'desktop' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500'}`}><Monitor size={13} /></button>
                <button onClick={() => setViewMode('mobile')} className={`px-3 py-1.5 transition-colors ${viewMode === 'mobile' ? 'bg-gray-900 text-white' : 'bg-white text-gray-500'}`}><Smartphone size={13} /></button>
              </div>

              <button onClick={() => generate(true)} disabled={loading} className="btn btn-secondary btn-sm"><RefreshCw size={12} /> Regenerate</button>
              <button onClick={saveSite} disabled={saving} className="btn btn-secondary btn-sm">{saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save</button>
              <button onClick={downloadHtml} className="btn btn-secondary btn-sm"><Download size={12} /> Download</button>
              <button onClick={() => setGithubModal(true)} className="btn btn-secondary btn-sm"><Github size={12} /> GitHub</button>
              <button onClick={() => setDeployModal(true)} className="btn btn-primary btn-sm"><Rocket size={12} /> Deploy</button>
            </>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left panel */}
        <aside className="w-80 bg-white border-r border-surface-200 flex flex-col">
          <div className="flex-1 p-5 space-y-5 overflow-y-auto">
            <div>
              <h2 className="font-semibold text-sm mb-1.5">Business name</h2>
              <input value={siteName} onChange={e => setSiteName(e.target.value)} placeholder="e.g. Mak Cik Kuih" className="input" />
            </div>

            <div>
              <h2 className="font-semibold text-sm mb-1.5">Website type</h2>
              <select value={siteType} onChange={e => setSiteType(e.target.value)} className="input">
                {SITE_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <h2 className="font-semibold text-sm mb-1.5">Describe your business</h2>
              <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={7} className="textarea"
                placeholder="e.g. I sell homemade kuih in Petaling Jaya. My speciality is kuih lapis and ondeh-ondeh. I want customers to order via WhatsApp. My colours are pink and gold." />
              <p className="text-xs text-gray-400 mt-1">More detail = better website</p>
            </div>

            <div className="bg-brand-50 border border-brand-100 rounded-xl p-3.5">
              <p className="text-xs font-semibold text-brand-700 mb-1.5">💡 Tips for best results</p>
              <ul className="text-xs text-brand-600 space-y-1">
                <li>• Mention your location</li>
                <li>• Describe your services or products</li>
                <li>• State your brand colours</li>
                <li>• Add your WhatsApp number</li>
              </ul>
            </div>

            {error && <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-2 text-sm text-red-700"><AlertCircle size={15} className="flex-shrink-0 mt-0.5" />{error}</div>}
            {tokensUsed !== null && !loading && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex gap-2 text-sm text-emerald-700">
                <CheckCircle size={15} className="flex-shrink-0 mt-0.5" /> Used {tokensUsed} tokens · {tokenBalance} remaining
              </div>
            )}
          </div>

          <div className="p-5 border-t border-surface-200">
            <button onClick={() => generate(false)} disabled={loading || !prompt.trim()} className="btn btn-primary btn-lg w-full">
              {loading ? <><Loader2 size={16} className="animate-spin" /> Generating...</> : <><Sparkles size={16} /> Generate Website (10 tokens)</>}
            </button>
          </div>
        </aside>

        {/* Right preview */}
        <main className="flex-1 bg-surface-100 flex items-center justify-center overflow-auto p-6">
          {loading ? (
            <div className="text-center">
              <div className="text-5xl mb-4 animate-bounce">🤖</div>
              <p className="font-bold text-lg mb-2">{loadingMsg}</p>
              <p className="text-gray-400 text-sm">This takes about 15–30 seconds</p>
              <div className="mt-4 w-64 h-1.5 bg-surface-200 rounded-full mx-auto overflow-hidden">
                <div className="h-full bg-brand-600 rounded-full animate-pulse" style={{ width: '60%' }} />
              </div>
            </div>
          ) : html ? (
            <div className={`transition-all duration-300 ${viewMode === 'mobile' ? 'w-[390px]' : 'w-full'} h-full`}>
              <div className="bg-white rounded-2xl overflow-hidden shadow-card-lg h-full flex flex-col">
                <div className="h-8 bg-gray-900 flex items-center gap-1.5 px-3 flex-shrink-0">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                  <div className="flex-1 mx-3 bg-gray-700 rounded-full px-3 py-0.5 text-xs text-gray-400 font-mono truncate">
                    {deployedUrl || `preview · ${siteName || 'my-website'}.harnova.my`}
                  </div>
                </div>
                <iframe srcDoc={html} className="flex-1 w-full" title="Website preview" sandbox="allow-scripts allow-same-origin" />
              </div>
            </div>
          ) : (
            <div className="text-center max-w-sm">
              <div className="text-6xl mb-4">✨</div>
              <h3 className="font-bold text-xl mb-2">Describe your business</h3>
              <p className="text-gray-500 text-sm">Fill in the details on the left and click Generate. Your website will appear here in about 20 seconds.</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default function BuilderPage() {
  return <Suspense><BuilderContent /></Suspense>
}
