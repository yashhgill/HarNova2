'use client'
import Link from 'next/link'
import { ArrowRight, Check, Star } from 'lucide-react'
import { useEffect, useState, useRef } from 'react'

const VIGNETTES = [
  {
    name: 'Mak Cik Kuih',
    owner: 'Siti Aminah · Shah Alam',
    before: 'Handwritten price list on a kitchen table, orders taken one WhatsApp message at a time.',
    sketch: 'kuih',
  },
  {
    name: 'Cikgu Nurul Tuition',
    owner: 'Nurul Rashidah · Penang',
    before: 'A photocopied flyer pinned to a notice board, phone number smudged from the rain.',
    sketch: 'tuition',
  },
  {
    name: 'Jahit Lina Tailoring',
    owner: 'Lina · Ipoh',
    before: 'A shopfront sign and a measuring tape — no way for new customers to find her.',
    sketch: 'tailor',
  },
]

const FEATURES = [
  { icon: '🤖', title: 'Claude AI builds it', desc: "Describe your stall, your service, your craft — in your own words. Claude writes the whole site, content included." },
  { icon: '⚡', title: 'Live in under a minute', desc: 'One click and your site is on a real address. No waiting, no developer, no back-and-forth.' },
  { icon: '💾', title: 'You own the code', desc: 'Download everything, anytime, for free. Nothing about your business stays locked to us.' },
  { icon: '🔗', title: 'Push to GitHub', desc: 'If you outgrow us, take it with you. One click sends your whole site to your own repo.' },
  { icon: '🌐', title: 'A real domain', desc: 'Buy yourname.com right from your dashboard. We handle the technical setup.' },
  { icon: '📊', title: 'Pay only for what you use', desc: 'No subscriptions, no surprise bills. Tokens never expire — top up from RM100.' },
]

const STEPS = [
  { n: '01', title: 'Tell us about your business', desc: 'A sentence or two is enough — what you sell, who it\'s for, what makes it yours.' },
  { n: '02', title: 'Claude writes the site', desc: 'Real copy, real layout, built around what you actually do — not a generic template.' },
  { n: '03', title: 'See it, tweak it', desc: 'Change the wording, regenerate a section, make it sound like you.' },
  { n: '04', title: 'Put it in the world', desc: 'A free address today, or your own domain when you\'re ready to make it permanent.' },
]

const PACKS = [
  { tokens: 100, myr: 100, label: 'Starter', builds: 3, note: '' },
  { tokens: 200, myr: 200, label: 'Builder', builds: 6, popular: true },
  { tokens: 500, myr: 400, label: 'Pro',     builds: 16 },
]

const TESTIMONIALS = [
  { name: 'Siti Aminah', biz: 'Kuih Tradisional · Shah Alam', text: 'Described my shop in two sentences. Full website in 30 seconds. My orders doubled in a month.', rating: 5, avatar: 'SA' },
  { name: 'Lim Kah Weng', biz: 'Auto Parts · Petaling Jaya', text: 'Way cheaper than hiring an agency. My site looks better than competitors who paid RM5,000+.', rating: 5, avatar: 'LK' },
  { name: 'Nurul Rashidah', biz: 'Math Tutor · Penang', text: '20 new students in 3 months — all found me through the website HarNova built me.', rating: 5, avatar: 'NR' },
]

const COSTS = [
  { action: 'Generate a website',    cost: 30 },
  { action: 'Regenerate / tweak',    cost: 5 },
  { action: 'Deploy (2-day trial)',  cost: 5 },
  { action: 'Permanent hosting /mo', cost: 300, discount: 150 },
  { action: 'Custom domain /year',   cost: 50 },
  { action: 'GitHub push',           cost: 5 },
  { action: 'Download ZIP',          cost: 0 },
]

function Reveal({ children, delay = 0, className = '' }: { children: React.ReactNode; delay?: number; className?: string }) {
  return (
    <div data-reveal className={className} style={{ opacity: 0, transform: 'translateY(20px)', transition: `opacity 0.6s ease-out ${delay}s, transform 0.6s ease-out ${delay}s` }}>
      {children}
    </div>
  )
}

// Hand-drawn-feel sketch icons for each vignette's "before" state
function SketchIcon({ type }: { type: string }) {
  if (type === 'kuih') {
    return (
      <svg viewBox="0 0 120 90" className="w-full h-full">
        <rect x="8" y="50" width="104" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <path d="M14 50 L20 30 L100 30 L106 50" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
        <circle cx="35" cy="40" r="6" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="60" cy="38" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <circle cx="85" cy="41" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
        <line x1="20" y1="62" x2="60" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
        <line x1="20" y1="70" x2="50" y2="69" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.5" />
      </svg>
    )
  }
  if (type === 'tuition') {
    return (
      <svg viewBox="0 0 120 90" className="w-full h-full">
        <rect x="20" y="10" width="80" height="70" rx="1" fill="none" stroke="currentColor" strokeWidth="1.5" />
        <line x1="30" y1="26" x2="90" y2="26" stroke="currentColor" strokeWidth="1.3" />
        <line x1="30" y1="36" x2="80" y2="36" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="30" y1="44" x2="85" y2="44" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <line x1="30" y1="52" x2="70" y2="52" stroke="currentColor" strokeWidth="1" opacity="0.6" />
        <rect x="30" y="60" width="34" height="12" fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray="2 2" opacity="0.7" />
        <circle cx="95" cy="18" r="9" fill="none" stroke="currentColor" strokeWidth="1.3" />
        <line x1="20" y1="5" x2="100" y2="3" stroke="currentColor" strokeWidth="1" opacity="0.4" />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 120 90" className="w-full h-full">
      <path d="M40 15 L80 15 L88 30 L75 30 L75 78 L45 78 L45 30 L32 30 Z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <line x1="50" y1="40" x2="70" y2="40" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <line x1="50" y1="50" x2="70" y2="50" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      <circle cx="20" cy="55" r="3" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <line x1="20" y1="58" x2="20" y2="75" stroke="currentColor" strokeWidth="1.2" />
      <line x1="14" y1="65" x2="26" y2="65" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

export default function Home() {
  const [activeVignette, setActiveVignette] = useState(0)
  const [morphed, setMorphed] = useState(false)

  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]')
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const el = e.target as HTMLElement
          el.style.opacity = '1'
          el.style.transform = 'translateY(0)'
        }
      })
    }, { threshold: 0.12 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  // Orchestrated hero sequence: sketch shows, then morphs into the live site, then cycles
  useEffect(() => {
    let cycle: ReturnType<typeof setTimeout>
    const runCycle = () => {
      setMorphed(false)
      const t1 = setTimeout(() => setMorphed(true), 1800)
      const t2 = setTimeout(() => {
        setActiveVignette(v => (v + 1) % VIGNETTES.length)
      }, 5200)
      cycle = t2
      return () => { clearTimeout(t1); clearTimeout(t2) }
    }
    const cleanup = runCycle()
    return cleanup
  }, [activeVignette])

  const current = VIGNETTES[activeVignette]

  return (
    <div className="min-h-screen" style={{ background: '#FBF6EE' }}>
      <style>{`
        .clay { color: #B8472E; }
        .bg-clay { background: #B8472E; }
        .border-clay { border-color: #B8472E; }
        .turmeric { color: #C8842A; }
        .bg-turmeric { background: #E8A33D; }
        .charcoal { color: #211C18; }
        .bg-charcoal { background: #211C18; }
        .sage { color: #5C7355; }
        .bg-sage { background: #5C7355; }
        .font-serif-display { font-family: var(--font-fraunces), Georgia, serif; }
        @keyframes drawIn { from { stroke-dashoffset: 240; opacity: 0; } to { stroke-dashoffset: 0; opacity: 1; } }
        @keyframes paperFloat { 0%, 100% { transform: rotate(-1deg) translateY(0); } 50% { transform: rotate(0.5deg) translateY(-4px); } }
        @keyframes screenRise { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes fadeOut { from { opacity: 1; } to { opacity: 0; } }
        @keyframes marqueeScroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .sketch-draw path, .sketch-draw circle, .sketch-draw rect, .sketch-draw line {
          stroke-dasharray: 240;
          animation: drawIn 1.4s ease-out forwards;
        }
        .paper-card { animation: paperFloat 5s ease-in-out infinite; }
        .screen-rise { animation: screenRise 0.6s ease-out forwards; }
      `}</style>

      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b" style={{ borderColor: 'rgba(33,28,24,0.1)', background: 'rgba(251,246,238,0.88)', backdropFilter: 'blur(12px)' }}>
        <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-serif-display font-medium text-xl tracking-tight charcoal">
            <span className="w-8 h-8 bg-clay rounded-lg flex items-center justify-center text-white text-sm font-bold font-sans">HN</span>
            HarNova
          </Link>
          <div className="hidden md:flex items-center gap-7 text-sm font-medium" style={{ color: 'rgba(33,28,24,0.6)' }}>
            <Link href="#features" className="hover:opacity-70 transition-opacity">Features</Link>
            <Link href="#pricing" className="hover:opacity-70 transition-opacity">Pricing</Link>
            <Link href="#how" className="hover:opacity-70 transition-opacity">How it works</Link>
            <Link href="/enterprise" className="hover:opacity-70 transition-opacity">Enterprise</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/auth/login" className="text-sm font-medium charcoal hidden md:flex hover:opacity-70 transition-opacity">Log in</Link>
            <Link href="/auth/signup" className="inline-flex items-center gap-1.5 text-sm font-semibold text-white bg-clay px-4 py-2 rounded-full hover:opacity-90 transition-opacity">
              Get started free <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden pt-16 pb-20 px-5">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-sm font-semibold turmeric mb-4 tracking-wide">🇲🇾 Built for Malaysian small businesses</p>
            <h1 className="font-serif-display text-5xl md:text-6xl font-medium leading-[1.08] charcoal mb-6">
              Every stall, every<br />tuition class, every<br />tailor — deserves<br />a website.
            </h1>
            <p className="text-lg leading-relaxed mb-8" style={{ color: 'rgba(33,28,24,0.65)', maxWidth: '460px' }}>
              Describe what you do. Claude writes and builds the whole site —
              real words, real layout, live in under a minute.
            </p>
            <div className="flex items-center gap-4 flex-wrap">
              <Link href="/auth/signup" className="inline-flex items-center gap-2 text-base font-semibold text-white bg-clay px-7 py-3.5 rounded-full hover:opacity-90 transition-opacity">
                Start building free <ArrowRight size={18} />
              </Link>
              <Link href="#how" className="inline-flex items-center gap-2 text-base font-semibold charcoal px-7 py-3.5 rounded-full border" style={{ borderColor: 'rgba(33,28,24,0.2)' }}>
                See how it works
              </Link>
            </div>
            <p className="text-sm mt-5" style={{ color: 'rgba(33,28,24,0.45)' }}>
              10 free tokens on signup · No credit card needed
            </p>
          </div>

          {/* Signature element: sketch-to-screen transformation */}
          <div className="relative h-[420px] flex items-center justify-center">
            <div className="absolute top-2 left-1/2 -translate-x-1/2 text-center w-full">
              <p className="font-serif-display text-base italic" style={{ color: 'rgba(33,28,24,0.55)' }}>
                {current.name} <span className="not-italic" style={{ color: 'rgba(33,28,24,0.35)' }}>· {current.owner}</span>
              </p>
            </div>

            <div className="relative w-72 h-80 mt-8">
              {/* Before: hand-drawn paper sketch */}
              <div
                key={`sketch-${activeVignette}`}
                className="absolute inset-0 paper-card"
                style={{
                  background: '#FFFDF8',
                  border: '1.5px solid rgba(33,28,24,0.18)',
                  borderRadius: '4px',
                  boxShadow: '0 8px 24px rgba(33,28,24,0.08)',
                  padding: '28px 24px',
                  opacity: morphed ? 0 : 1,
                  transition: 'opacity 0.5s ease-out',
                  pointerEvents: 'none',
                }}
              >
                <div className="sketch-draw w-full h-32 mb-4" style={{ color: 'rgba(33,28,24,0.5)' }}>
                  <SketchIcon type={current.sketch} />
                </div>
                <p className="text-sm leading-relaxed font-serif-display italic" style={{ color: 'rgba(33,28,24,0.55)' }}>
                  {current.before}
                </p>
              </div>

              {/* After: live phone-style screen */}
              <div
                className={`absolute inset-0 rounded-2xl overflow-hidden ${morphed ? 'screen-rise' : ''}`}
                style={{
                  background: '#211C18',
                  padding: '6px',
                  opacity: morphed ? 1 : 0,
                  transition: 'opacity 0.4s ease-out',
                  pointerEvents: 'none',
                }}
              >
                <div className="w-full h-full rounded-xl overflow-hidden" style={{ background: '#FBF6EE' }}>
                  <div className="h-7 bg-clay flex items-center px-3">
                    <span className="text-white text-xs font-semibold font-serif-display">{current.name}</span>
                  </div>
                  <div className="p-3">
                    <div className="h-16 rounded-lg mb-2" style={{ background: 'rgba(232,163,61,0.35)' }} />
                    <div className="h-2.5 w-3/4 rounded mb-1.5" style={{ background: 'rgba(33,28,24,0.15)' }} />
                    <div className="h-2.5 w-1/2 rounded mb-3" style={{ background: 'rgba(33,28,24,0.1)' }} />
                    <div className="flex gap-2 mb-3">
                      <div className="h-7 w-20 rounded-full bg-clay" />
                      <div className="h-7 w-16 rounded-full" style={{ background: 'rgba(33,28,24,0.08)' }} />
                    </div>
                    <div className="grid grid-cols-3 gap-1.5">
                      {[0, 1, 2].map(i => <div key={i} className="aspect-square rounded" style={{ background: 'rgba(33,28,24,0.06)' }} />)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 flex gap-1.5">
              {VIGNETTES.map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full transition-all" style={{ background: i === activeVignette ? '#B8472E' : 'rgba(33,28,24,0.15)' }} />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="bg-charcoal py-3 overflow-hidden">
        <div className="flex gap-10 w-max" style={{ animation: 'marqueeScroll 28s linear infinite' }}>
          {[0, 1].map(ri =>
            ['Built for hawkers', 'Built for tutors', 'Built for tailors', 'Built for home bakers', 'Built for freelancers', 'Built for every small business'].map((item, i) => (
              <span key={`${ri}-${i}`} className="text-sm font-medium flex items-center gap-3 whitespace-nowrap" style={{ color: 'rgba(251,246,238,0.85)' }}>
                <span className="w-1 h-1 rounded-full bg-turmeric" /> {item}
              </span>
            ))
          )}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="py-24 px-5">
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-sm font-semibold clay mb-3 tracking-wide">What you get</p>
            <Reveal><h2 className="font-serif-display text-4xl font-medium charcoal max-w-lg">Everything a small business needs to be found online</h2></Reveal>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 0.07} className="p-6 rounded-2xl" style={{ background: 'white', border: '1px solid rgba(33,28,24,0.08)' } as React.CSSProperties}>
                <div className="text-3xl mb-4">{f.icon}</div>
                <h3 className="font-serif-display font-medium text-lg mb-2 charcoal">{f.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(33,28,24,0.6)' }}>{f.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section id="how" className="py-24 px-5" style={{ background: 'rgba(232,163,61,0.08)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <p className="text-sm font-semibold clay mb-3 tracking-wide">How it works</p>
            <Reveal><h2 className="font-serif-display text-4xl font-medium charcoal">From idea to live site, today</h2></Reveal>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 0.09}>
                <div className="font-serif-display text-3xl font-medium turmeric mb-3">{s.n}</div>
                <h3 className="font-medium text-base mb-2 charcoal">{s.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: 'rgba(33,28,24,0.6)' }}>{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="py-24 px-5">
        <div className="max-w-5xl mx-auto">

          {/* DISCOUNT BANNER */}
          <Reveal>
            <div className="mb-10 rounded-2xl px-6 py-4 flex flex-wrap items-center justify-between gap-4"
              style={{ background: 'linear-gradient(135deg, #B8472E 0%, #8B2E1A 100%)', color: 'white' }}>
              <div className="flex items-center gap-3">
                <span style={{ fontSize: '1.4rem' }}>🎉</span>
                <div>
                  <p className="font-semibold text-sm">Launch Discount — Limited Time</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.75)' }}>
                    Hosting at <span style={{ textDecoration: 'line-through', opacity: 0.7 }}>RM300/mo</span>{' '}
                    <strong style={{ color: '#FFD580' }}>RM150/mo</strong> — valid until 24 September 2026
                  </p>
                </div>
              </div>
              <a href="/auth/signup"
                className="text-xs font-semibold px-4 py-2 rounded-full flex-shrink-0"
                style={{ background: '#FFD580', color: '#211C18' }}>
                Claim offer →
              </a>
            </div>
          </Reveal>

          <div className="mb-10">
            <p className="text-sm font-semibold clay mb-3 tracking-wide">Pricing</p>
            <Reveal><h2 className="font-serif-display text-4xl font-medium charcoal mb-2">Pay only for what you use</h2></Reveal>
            <Reveal delay={0.05}><p style={{ color: 'rgba(33,28,24,0.6)' }}>Tokens never expire. No monthly subscription.</p></Reveal>
          </div>

          <Reveal className="max-w-2xl mb-10">
            <div className="p-6 rounded-2xl" style={{ background: 'white', border: '1px solid rgba(33,28,24,0.08)' }}>
              <p className="font-medium text-sm mb-4 charcoal">Token cost per action</p>
              <div className="grid grid-cols-2 gap-2">
                {COSTS.map((c, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b last:border-0" style={{ borderColor: 'rgba(33,28,24,0.06)' }}>
                    <span className="text-sm" style={{ color: 'rgba(33,28,24,0.7)' }}>{c.action}</span>
                    <span className="font-mono font-semibold text-sm clay flex items-center gap-1.5">
                      {c.cost === 0 ? 'Free' : (
                        c.discount ? (
                          <>
                            <span style={{ textDecoration: 'line-through', opacity: 0.45, fontWeight: 400 }}>RM{c.cost}</span>
                            <span style={{ color: '#B8472E' }}>RM{c.discount} 🎉</span>
                          </>
                        ) : `${c.cost} tokens`
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-5">
            {PACKS.map((p, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div
                  className="relative rounded-2xl p-6 h-full"
                  style={p.popular ? { background: '#211C18', color: 'white' } : { background: 'white', border: '1px solid rgba(33,28,24,0.08)' }}
                >
                  {p.popular && (
                    <div className="absolute -top-3 right-5 bg-turmeric text-white text-xs font-semibold px-3 py-1 rounded-full">
                      Most popular
                    </div>
                  )}
                  <div className={`font-medium text-lg mb-1 font-serif-display ${p.popular ? 'text-white' : 'charcoal'}`}>{p.label}</div>
                  <div className={`text-4xl font-serif-display font-medium mb-1 ${p.popular ? 'text-white' : 'charcoal'}`}>RM{p.myr}</div>
                  <div className="text-sm mb-5" style={{ color: p.popular ? 'rgba(251,246,238,0.6)' : 'rgba(33,28,24,0.55)' }}>
                    {p.tokens} tokens · {p.builds} website builds
                  </div>
                  <ul className="space-y-2 mb-6">
                    {['Tokens never expire', 'All features included', 'Priority support'].map((item, j) => (
                      <li key={j} className="text-sm flex items-center gap-2" style={{ color: p.popular ? 'rgba(251,246,238,0.85)' : 'rgba(33,28,24,0.7)' }}>
                        <Check size={14} className={p.popular ? 'text-turmeric' : 'clay'} />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href="/auth/signup"
                    className="flex items-center justify-center gap-2 w-full text-sm font-semibold py-2.5 rounded-full"
                    style={p.popular ? { background: '#E8A33D', color: '#211C18' } : { background: '#B8472E', color: 'white' }}
                  >
                    Get {p.tokens} tokens <ArrowRight size={15} />
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="py-24 px-5" style={{ background: 'rgba(92,115,85,0.06)' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-14">
            <Reveal><h2 className="font-serif-display text-4xl font-medium charcoal">Real businesses, real results</h2></Reveal>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={i} delay={i * 0.08} className="p-6 rounded-2xl" style={{ background: 'white', border: '1px solid rgba(33,28,24,0.08)' } as React.CSSProperties}>
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.rating)].map((_, j) => <Star key={j} size={14} fill="#E8A33D" stroke="none" />)}
                </div>
                <p className="text-sm leading-relaxed mb-5 italic font-serif-display" style={{ color: 'rgba(33,28,24,0.75)' }}>"{t.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-sage text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">{t.avatar}</div>
                  <div>
                    <div className="font-medium text-sm charcoal">{t.name}</div>
                    <div className="text-xs" style={{ color: 'rgba(33,28,24,0.45)' }}>{t.biz}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>


      {/* ENTERPRISE / MEDILINK */}
      <section className="py-24 px-5" style={{ background: '#0A0A0F' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-14">
            <p className="text-sm font-semibold mb-3 tracking-wide" style={{ color: '#7C3AFF' }}>Enterprise solutions</p>
            <Reveal>
              <h2 className="font-serif-display text-4xl font-medium text-white mb-3">
                We don't just build websites.<br />We build platforms.
              </h2>
            </Reveal>
            <Reveal delay={0.05}>
              <p className="text-lg" style={{ color: 'rgba(240,238,248,0.55)', maxWidth: '520px' }}>
                For businesses that need more than a presence — HarNova builds full cloud systems, AI-powered products, and mission-critical infrastructure.
              </p>
            </Reveal>
          </div>

          {/* MediLink card */}
          <Reveal>
            <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(91,33,240,0.2)', background: '#13121A' }}>
              <div className="grid md:grid-cols-2 gap-0">
                {/* Left: info */}
                <div className="p-10 flex flex-col justify-center">
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-6"
                    style={{ background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', color: '#22C55E' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                    Live · Healthcare
                  </div>
                  <h3 className="font-serif-display text-3xl font-medium text-white mb-3">MediLink</h3>
                  <p className="text-base mb-6 leading-relaxed" style={{ color: 'rgba(240,238,248,0.6)' }}>
                    A high-availability hybrid cloud EHR platform for Malaysian clinics. Runs offline when internet drops. Syncs to AWS when it's back. 99% uptime SLA.
                  </p>
                  <ul className="space-y-2.5 mb-8">
                    {[
                      'MyKad IC kiosk check-in — camera-based, no NFC hardware',
                      'Manchester Triage System AI — real clinical scoring',
                      'DuitNow, TnG, FPX, and cash payment support',
                      'Pharmacy inventory with expiry & low-stock alerts',
                    ].map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm" style={{ color: 'rgba(240,238,248,0.65)' }}>
                        <span className="mt-0.5 flex-shrink-0 text-purple-400">✓</span>
                        {f}
                      </li>
                    ))}
                  </ul>
                  <div className="flex gap-3 flex-wrap">
                    <a href="mailto:hello@harnova.my?subject=MediLink Demo"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-white"
                      style={{ background: '#5B21F0' }}>
                      Request a demo →
                    </a>
                    <a href="https://github.com/yashhgill/Medilink" target="_blank" rel="noopener"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold"
                      style={{ border: '1px solid rgba(240,238,248,0.15)', color: 'rgba(240,238,248,0.7)' }}>
                      View on GitHub
                    </a>
                  </div>
                </div>
                {/* Right: mini dashboard mockup */}
                <div className="p-8 flex items-center justify-center" style={{ background: 'rgba(10,10,15,0.6)', borderLeft: '1px solid rgba(91,33,240,0.12)' }}>
                  <div className="w-full max-w-xs rounded-xl overflow-hidden" style={{ background: '#0D0C14', border: '1px solid #2D2B3D', boxShadow: '0 20px 48px rgba(0,0,0,0.5)' }}>
                    <div className="flex items-center gap-1.5 px-3 py-2.5" style={{ borderBottom: '1px solid #2D2B3D', background: '#0A0910' }}>
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
                      <span className="w-2.5 h-2.5 rounded-full bg-yellow-400" />
                      <span className="w-2.5 h-2.5 rounded-full bg-green-400" />
                      <span className="ml-2 text-xs" style={{ color: '#55536A' }}>MediLink — Reception</span>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="grid grid-cols-3 gap-1.5">
                        {[['Queue', '14', '#7C3AFF'], ['Active', '3', '#F0EEF8'], ['Sync', 'Live', '#22C55E']].map(([l,v,c]) => (
                          <div key={l} className="rounded-lg p-2.5" style={{ background: '#1C1B28', border: '1px solid #2D2B3D' }}>
                            <div className="text-xs mb-1" style={{ color: '#55536A', textTransform: 'uppercase', letterSpacing: '0.08em', fontSize: '8px' }}>{l}</div>
                            <div className="font-bold text-sm" style={{ color: c, fontFamily: 'monospace' }}>{v}</div>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-lg overflow-hidden" style={{ background: '#1C1B28', border: '1px solid #2D2B3D' }}>
                        <div className="px-3 py-1.5 text-xs" style={{ color: '#55536A', borderBottom: '1px solid #2D2B3D', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Live Queue</div>
                        {[
                          ['#01', 'Arjun Rao', 'In Progress', '#7C3AFF'],
                          ['#02', 'Mei Lin Chong', 'Pharmacy', '#60A5FA'],
                          ['#03', 'Hafiz Rahman', 'Checked In', '#22C55E'],
                          ['#04', 'Priya Nair', 'Waiting', '#F59E0B'],
                        ].map(([n, name, status, c]) => (
                          <div key={n} className="flex items-center gap-2 px-3 py-2" style={{ borderBottom: '1px solid rgba(45,43,61,0.5)', fontSize: '9px' }}>
                            <span className="font-bold w-5" style={{ color: '#7C3AFF', fontFamily: 'monospace' }}>{n}</span>
                            <span className="flex-1 text-white">{name}</span>
                            <span className="px-1.5 py-0.5 rounded text-white font-semibold" style={{ background: c + '22', color: c, fontSize: '8px' }}>{status}</span>
                          </div>
                        ))}
                      </div>
                      <div className="rounded-lg p-2.5" style={{ background: 'rgba(91,33,240,0.08)', border: '1px solid rgba(91,33,240,0.2)' }}>
                        <div className="text-xs font-semibold mb-1" style={{ color: '#7C3AFF', fontSize: '8px', textTransform: 'uppercase', letterSpacing: '0.08em' }}>⚡ AI Triage — #03</div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded font-bold" style={{ background: 'rgba(245,158,11,0.15)', color: '#F59E0B', fontSize: '8px' }}>URGENT · Yellow</span>
                          <span style={{ color: '#55536A', fontSize: '8px' }}>60 min target</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          {/* View full startup page CTA */}
          <Reveal delay={0.1}>
            <div className="mt-10 text-center">
              <a href="/enterprise"
                className="inline-flex items-center gap-2 text-sm font-semibold px-6 py-3 rounded-full"
                style={{ border: '1px solid rgba(91,33,240,0.3)', color: '#7C3AFF', background: 'rgba(91,33,240,0.06)' }}>
                See all HarNova enterprise solutions →
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-5 bg-charcoal">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-serif-display text-4xl md:text-5xl font-medium text-white mb-5">
            Your craft deserves to be seen
          </h2>
          <p className="text-lg mb-8 leading-relaxed" style={{ color: 'rgba(251,246,238,0.65)' }}>
            Sign up free, get 10 tokens, and build your first website today.
          </p>
          <Link href="/auth/signup" className="inline-flex items-center gap-2 text-base font-semibold px-8 py-4 rounded-full bg-turmeric" style={{ color: '#211C18' }}>
            Start for free <ArrowRight size={18} />
          </Link>
          <p className="text-sm mt-4" style={{ color: 'rgba(251,246,238,0.4)' }}>No credit card · 10 free tokens · harnova.my</p>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-10 px-5" style={{ background: '#1A1611' }}>
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-2 text-white font-serif-display font-medium">
            <span className="w-7 h-7 bg-clay rounded-lg flex items-center justify-center text-white text-xs font-bold font-sans">HN</span>
            HarNova
          </div>
          <div className="flex gap-6 text-sm" style={{ color: 'rgba(251,246,238,0.5)' }}>
            <Link href="/auth/login" className="hover:text-white transition-colors">Login</Link>
            <Link href="/auth/signup" className="hover:text-white transition-colors">Sign up</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <a href="https://wa.me/60182085097" target="_blank" rel="noopener" className="hover:text-white transition-colors">WhatsApp</a>
          </div>
          <p className="text-xs" style={{ color: 'rgba(251,246,238,0.35)' }}>© 2026 HarNova · harnova.my</p>
        </div>
      </footer>
    </div>
  )
}
