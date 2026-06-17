'use client'
import Link from 'next/link'
import { ArrowRight, Zap, Globe, Download, GitBranch, Check, Star, ChevronRight } from 'lucide-react'
import { useEffect, useRef } from 'react'

const FEATURES = [
  { icon: '🤖', title: 'Claude AI builds it', desc: 'Powered by Anthropic\'s Claude — describe your business in plain language and get a full, professional website instantly.' },
  { icon: '⚡', title: 'Deploy in 60 seconds', desc: 'One-click deploy to a live harnova.my subdomain. Upgrade to a permanent URL or your own custom domain anytime.' },
  { icon: '💾', title: 'Download your code', desc: 'Own your website forever. Download the full source code as a ZIP, no strings attached. Free.' },
  { icon: '🔗', title: 'Push to GitHub', desc: 'Connect your GitHub account and push your site directly to a repo. CI/CD ready from day one.' },
  { icon: '🌐', title: 'Custom domains', desc: 'Buy a .com or .my domain right from the dashboard. DNS configured automatically in minutes.' },
  { icon: '📊', title: 'Token-based pricing', desc: 'Pay only for what you use. Tokens never expire. Top up anytime from $15.' },
]

const STEPS = [
  { n: '01', title: 'Sign up & get 10 free tokens', desc: 'Create your account. 10 tokens land instantly — enough to generate your first website.' },
  { n: '02', title: 'Describe your business to AI', desc: 'Tell Claude what your business does. The more detail, the better the output.' },
  { n: '03', title: 'Preview & refine', desc: 'See your website live in the browser. Tweak it, regenerate sections, or edit the code directly.' },
  { n: '04', title: 'Deploy or download', desc: 'Go live with a HarNova subdomain, buy a custom domain, push to GitHub, or download the zip.' },
]

const PACKS = [
  { tokens: 100, usd: 15, label: 'Starter', icon: '🌱', builds: 10 },
  { tokens: 200, usd: 30, label: 'Builder', icon: '🏗️', builds: 20, popular: true },
  { tokens: 500, usd: 60, label: 'Pro',     icon: '🚀', builds: 50 },
]

const TESTIMONIALS = [
  { name: 'Siti Aminah', biz: 'Kuih Tradisional · Shah Alam', text: 'Described my shop in two sentences. Full website in 30 seconds. My orders doubled in a month.', rating: 5, avatar: 'SA', c: 'bg-brand-600' },
  { name: 'Lim Kah Weng', biz: 'Auto Parts · Petaling Jaya', text: 'Way cheaper than hiring an agency. My site looks better than competitors who paid RM5,000+.', rating: 5, avatar: 'LK', c: 'bg-amber-500' },
  { name: 'Nurul Rashidah', biz: 'Math Tutor · Penang', text: '20 new students in 3 months — all found me through the website HarNova built me.', rating: 5, avatar: 'NR', c: 'bg-emerald-500' },
]

const COSTS = [
  { action: 'Generate a website',        cost: 10, icon: '✨' },
  { action: 'Regenerate / tweak',        cost: 5,  icon: '🔄' },
  { action: 'Deploy (2-day trial)',       cost: 5,  icon: '🚀' },
  { action: 'Permanent hosting /mo',     cost: 10, icon: '☁️' },
  { action: 'Custom domain /year',       cost: 50, icon: '🌐' },
  { action: 'GitHub push',               cost: 5,  icon: '🔗' },
  { action: 'Download ZIP',              cost: 0,  icon: '💾' },
]

export default function Home() {
  const revealRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) { (e.target as HTMLElement).style.opacity = '1'; (e.target as HTMLElement).style.transform = 'translateY(0)' } })
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const rv = { style: { opacity: 0, transform: 'translateY(20px)', transition: 'all 0.55s ease-out' } as React.CSSProperties }

  return (
    <div className="min-h-screen bg-white">
      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-surface-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <span className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white text-sm font-black">HN</span>
            HarNova
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium text-gray-500">
            <Link href="#features" className="hover:text-gray-900 transition-colors">Features</Link>
            <Link href="#pricing" className="hover:text-gray-900 transition-colors">Pricing</Link>
            <Link href="#how" className="hover:text-gray-900 transition-colors">How it works</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="btn btn-ghost btn-sm hidden md:flex">Log in</Link>
            <Link href="/auth/signup" className="btn btn-primary btn-sm">
              Get started free <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden pt-20 pb-28 px-5">
        {/* BG gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-brand-500/5 rounded-full blur-3xl" />
          <div className="absolute top-20 right-0 w-72 h-72 bg-purple-500/5 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-brand-50 border border-brand-100 rounded-full text-brand-700 text-sm font-medium mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full animate-pulse" />
            🇲🇾 Built for Malaysian SMEs · Powered by Claude AI
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight leading-[1.05] mb-6 animate-fade-up">
            Build your website<br />
            <span className="bg-gradient-to-r from-brand-600 to-purple-600 bg-clip-text text-transparent">
              with AI in minutes
            </span>
          </h1>

          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up" style={{ animationDelay: '0.1s' }}>
            Describe your business. Claude builds a full professional website.
            Deploy live, buy a domain, push to GitHub — all from one dashboard.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-up" style={{ animationDelay: '0.2s' }}>
            <Link href="/auth/signup" className="btn btn-primary btn-xl">
              Start building free <ArrowRight size={18} />
            </Link>
            <Link href="#how" className="btn btn-secondary btn-xl">
              See how it works
            </Link>
          </div>

          <p className="text-sm text-gray-400 mt-5 animate-fade-up" style={{ animationDelay: '0.3s' }}>
            10 free tokens on signup · No credit card needed · Cancel anytime
          </p>
        </div>

        {/* Hero mockup */}
        <div className="relative max-w-5xl mx-auto mt-16 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <div className="card-lg overflow-hidden">
            {/* Builder UI mockup */}
            <div className="flex h-[420px]">
              {/* Left panel */}
              <div className="w-72 border-r border-surface-200 bg-surface-50 p-4 flex flex-col gap-4 flex-shrink-0">
                <div className="h-8 skeleton w-3/4" />
                <div className="h-24 skeleton w-full" />
                <div className="flex gap-2">
                  <div className="h-7 skeleton w-20 rounded-full" />
                  <div className="h-7 skeleton w-20 rounded-full" />
                </div>
                <div className="mt-auto h-10 bg-brand-600 rounded-xl" />
              </div>
              {/* Right preview */}
              <div className="flex-1 bg-surface-50 p-4">
                <div className="bg-white rounded-xl border border-surface-200 h-full overflow-hidden">
                  <div className="h-8 bg-gray-900 flex items-center gap-1.5 px-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                    <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                    <div className="flex-1 mx-3 h-4 bg-gray-700 rounded-full" />
                  </div>
                  <div className="p-6">
                    <div className="h-8 skeleton w-2/3 mb-3" />
                    <div className="h-4 skeleton w-full mb-2" />
                    <div className="h-4 skeleton w-5/6 mb-5" />
                    <div className="flex gap-3">
                      <div className="h-9 w-28 bg-brand-600 rounded-lg" />
                      <div className="h-9 w-24 skeleton rounded-lg" />
                    </div>
                    <div className="mt-6 grid grid-cols-3 gap-3">
                      {[0,1,2].map(i => <div key={i} className="aspect-video skeleton rounded-lg" />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* Floating badges */}
          <div className="absolute -bottom-4 left-8 card px-4 py-2.5 shadow-card-lg flex items-center gap-2 text-sm font-medium">
            <span className="w-2 h-2 bg-emerald-500 rounded-full" /> Live in 30 seconds
          </div>
          <div className="absolute -bottom-4 right-8 card px-4 py-2.5 shadow-card-lg flex items-center gap-2 text-sm font-medium">
            <Zap size={14} className="text-brand-600" /> 10 tokens used
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-brand-600 py-3 overflow-hidden">
        <div className="flex gap-10 animate-[marquee_25s_linear_infinite] w-max">
          {[...Array(2)].map((_, ri) =>
            ['AI-Powered','Mobile-First','WhatsApp Integration','SEO Ready','Deploy in 60s','Download Code','GitHub Connect','Custom Domains','Malaysian SME Focus','Token-Based Pricing'].map((item, i) => (
              <span key={`${ri}-${i}`} className="text-white/90 text-sm font-medium flex items-center gap-3 whitespace-nowrap">
                <span className="w-1 h-1 rounded-full bg-white/50" /> {item}
              </span>
            ))
          )}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 tracking-widest uppercase mb-3">Features</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight" {...rv} data-reveal>Everything you need to go online</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className="card p-6 hover:shadow-card-md transition-shadow" {...rv} data-reveal>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-bold text-lg mb-2">{f.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-5 bg-surface-50 border-y border-surface-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-brand-600 tracking-widest uppercase mb-3">How it works</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight" {...rv} data-reveal>Live in 4 steps</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <div key={i} className="relative" {...rv} data-reveal>
                {i < 3 && <div className="hidden md:block absolute top-6 left-full w-full h-px bg-surface-300 z-0" />}
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-brand-600 text-white rounded-2xl flex items-center justify-center font-black text-sm mb-4">
                    {s.n}
                  </div>
                  <h3 className="font-bold text-base mb-2">{s.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-5">
            <p className="text-sm font-semibold text-brand-600 tracking-widest uppercase mb-3">Pricing</p>
            <h2 className="text-4xl md:text-5xl font-black tracking-tight" {...rv} data-reveal>Pay only for what you use</h2>
            <p className="text-gray-500 mt-3" {...rv} data-reveal>Tokens never expire. No monthly subscription.</p>
          </div>

          {/* Cost reference */}
          <div className="card p-6 mb-10 max-w-2xl mx-auto" {...rv} data-reveal>
            <p className="font-semibold text-sm text-gray-600 mb-4">Token cost per action</p>
            <div className="grid grid-cols-2 gap-2">
              {COSTS.map((c, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-surface-100 last:border-0">
                  <span className="text-sm text-gray-600 flex items-center gap-2"><span>{c.icon}</span>{c.action}</span>
                  <span className="font-mono font-bold text-sm text-brand-700">{c.cost === 0 ? 'FREE' : `${c.cost}`}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Packs */}
          <div className="grid md:grid-cols-3 gap-5">
            {PACKS.map((p, i) => (
              <div key={i} className={`relative rounded-2xl border p-6 ${p.popular ? 'bg-brand-600 border-brand-600 text-white shadow-card-lg' : 'bg-white border-surface-200 shadow-card'}`} {...rv} data-reveal>
                {p.popular && (
                  <div className="absolute -top-3 right-5 bg-yellow-400 text-black text-xs font-bold px-3 py-1 rounded-full">
                    Most popular
                  </div>
                )}
                <div className="text-3xl mb-3">{p.icon}</div>
                <div className={`font-bold text-lg mb-1 ${p.popular ? 'text-white' : ''}`}>{p.label}</div>
                <div className={`text-4xl font-black mb-1 ${p.popular ? 'text-white' : ''}`}>${p.usd}</div>
                <div className={`text-sm mb-5 ${p.popular ? 'text-brand-200' : 'text-gray-500'}`}>{p.tokens} tokens · {p.builds} website builds</div>
                <ul className="space-y-2 mb-6">
                  {['Tokens never expire', 'All features included', 'Priority support'].map((item, j) => (
                    <li key={j} className={`text-sm flex items-center gap-2 ${p.popular ? 'text-brand-100' : 'text-gray-600'}`}>
                      <Check size={14} className={p.popular ? 'text-yellow-400' : 'text-brand-600'} />
                      {item}
                    </li>
                  ))}
                </ul>
                <Link href="/auth/signup" className={`btn btn-lg w-full ${p.popular ? 'bg-white text-brand-700 border-white hover:bg-brand-50' : 'btn-primary'}`}>
                  Get {p.tokens} tokens <ArrowRight size={15} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-5 bg-surface-50 border-y border-surface-200">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black tracking-tight" {...rv} data-reveal>Loved by Malaysian SMEs</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="card p-6" {...rv} data-reveal>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill="currentColor" className="text-yellow-400" />)}
                </div>
                <p className="text-gray-700 text-sm leading-relaxed mb-5 italic">"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full ${t.c} text-white text-xs font-bold flex items-center justify-center flex-shrink-0`}>{t.avatar}</div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-gray-400">{t.biz}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5 bg-brand-600">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-5">
            Your business deserves a great website
          </h2>
          <p className="text-brand-200 text-lg mb-8 leading-relaxed">
            Sign up free, get 10 tokens, and build your first AI website today.
          </p>
          <Link href="/auth/signup" className="btn bg-white text-brand-700 border-white hover:bg-brand-50 btn-xl">
            Start for free <ArrowRight size={18} />
          </Link>
          <p className="text-brand-300/70 text-sm mt-4">No credit card · 10 free tokens · harnova.my</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-gray-950 text-gray-500 py-10 px-5 border-t border-gray-900">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-2 text-white font-bold">
            <span className="w-7 h-7 bg-brand-600 rounded-lg flex items-center justify-center text-white text-xs font-black">HN</span>
            HarNova
          </div>
          <div className="flex gap-6 text-sm">
            <Link href="/auth/login"   className="hover:text-white transition-colors">Login</Link>
            <Link href="/auth/signup"  className="hover:text-white transition-colors">Sign up</Link>
            <Link href="#pricing"      className="hover:text-white transition-colors">Pricing</Link>
            <a href="https://wa.me/60182085097" target="_blank" rel="noopener" className="hover:text-white transition-colors">WhatsApp</a>
          </div>
          <p className="text-xs">© 2025 HarNova · harnova.my</p>
        </div>
      </footer>
    </div>
  )
}
