'use client'
import Link from 'next/link'
import { useEffect, useRef } from 'react'

const SERVICES = [
  { icon: '🌐', name: 'Web Development', desc: 'Fast, modern web apps on React and Next.js. Portals, dashboards, and landing pages built for Malaysian users and mobile-first.', tag: 'Available', tagColor: '#22C55E' },
  { icon: '☁️', name: 'Cloud Infrastructure', desc: 'AWS, GCP, and Azure architecture, deployment, and management. VPNs, load balancers, databases — Well-Architected by design.', tag: 'Available', tagColor: '#22C55E' },
  { icon: '🤖', name: 'AI-Powered Products', desc: 'Custom AI features integrated into your systems — triage engines, document processors, chatbots — using the latest open models.', tag: 'Available', tagColor: '#22C55E' },
  { icon: '🛒', name: 'E-Commerce Solutions', desc: 'Full e-commerce with DuitNow, FPX, and TnG payment integration. Inventory, orders, delivery tracking — no foreign gateways.', tag: 'Available', tagColor: '#22C55E' },
  { icon: '📦', name: 'SaaS Platforms', desc: 'Multi-tenant SaaS products from scratch — auth, billing, onboarding, dashboards. You focus on the business, we handle the platform.', tag: 'Coming Soon', tagColor: '#F59E0B' },
  { icon: '🧭', name: 'IT Consulting', desc: 'Tech stack decisions, cloud cost reviews, architecture audits. Honest advice with no vendor lock-in agenda.', tag: 'Available', tagColor: '#22C55E' },
]

const MEDILINK_FEATURES = [
  'MyKad IC kiosk check-in via camera — no NFC hardware needed',
  'Manchester Triage System AI — real clinical scoring, not a chatbot',
  'DuitNow QR, TnG eWallet, FPX, and cash payment support',
  'Pharmacy inventory with low-stock and expiry alerts',
  '99% uptime SLA via local-first PostgreSQL + AWS RDS sync',
  'Full audit logging — every patient data access tracked',
  'Multi-facility record sharing with consent-gated access',
  'Real-time queue WebSocket broadcast to all dashboards',
]

const COMING_SOON = [
  { icon: '🏪', name: 'HarNova Store', desc: 'White-label e-commerce SaaS for Malaysian SMEs with DuitNow, FPX, and Shopee/Lazada sync.' },
  { icon: '📊', name: 'HarNova Analytics', desc: 'Business intelligence dashboard for SMEs — sales, inventory, and customer data in one place.' },
  { icon: '🤖', name: 'HarNova AI Agents', desc: 'Plug-in AI agents — customer support, data extraction, and workflow automation for Malaysian businesses.' },
]

const WHY = [
  { icon: '🇲🇾', title: 'Built for Malaysia, not copied from the West', desc: 'DuitNow QR, TnG eWallet, MyKad IC, FPX — every product we build works natively with Malaysian payment and identity systems.' },
  { icon: '⚡', title: 'We ship, not just consult', desc: 'Every engagement ends with working, deployed software — not a 50-slide deck. We stay until it\'s live and stable.' },
  { icon: '🔐', title: 'Security and uptime by design', desc: 'JWT auth, RBAC, HTTPS everywhere, audit logs, and hybrid architecture baked in from day one — not bolted on after a breach.' },
  { icon: '📈', title: 'Long-term partner, not a one-off vendor', desc: 'We build with the next 3 years in mind. Scalable infrastructure, clean codebases, and documentation that survives us.' },
]

const TECH = [
  ['⚛️', 'React / Next.js'], ['🐍', 'FastAPI'], ['🐘', 'PostgreSQL'],
  ['☁️', 'AWS'], ['🤖', 'Groq AI'], ['🔷', 'Supabase'],
  ['🐳', 'Docker'], ['🌐', 'Cloudflare'], ['🔒', 'JWT / RBAC'],
]

export default function EnterprisePage() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    // Animated dot grid
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')!
    let W = 0, H = 0
    type Dot = { x: number; y: number; base: number; phase: number }
    let dots: Dot[] = []
    const mouse = { x: -999, y: -999 }
    const SPACING = 38, ACCENT = '91,33,240'
    let raf: number

    const resize = () => {
      W = canvas.width = canvas.offsetWidth
      H = canvas.height = canvas.offsetHeight
      dots = []
      const cols = Math.ceil(W / SPACING) + 1
      const rows = Math.ceil(H / SPACING) + 1
      for (let r = 0; r < rows; r++)
        for (let c = 0; c < cols; c++)
          dots.push({ x: c * SPACING, y: r * SPACING, base: 0.1 + Math.random() * 0.12, phase: Math.random() * Math.PI * 2 })
    }

    const draw = (ts: number) => {
      ctx.clearRect(0, 0, W, H)
      const t = ts / 1000
      for (const d of dots) {
        const pulse = d.base + Math.sin(t * 0.05 + d.phase) * 0.04
        const dx = d.x - mouse.x, dy = d.y - mouse.y
        const dist = Math.sqrt(dx * dx + dy * dy)
        const prox = Math.max(0, 1 - dist / 180)
        const alpha = Math.min(1, pulse + prox * 0.5)
        const r = 1.4 + prox * 1.5
        ctx.beginPath()
        ctx.arc(d.x, d.y, r, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${ACCENT},${alpha})`
        ctx.fill()
      }
      raf = requestAnimationFrame(draw)
    }

    const onMouse = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      mouse.x = e.clientX - rect.left
      mouse.y = e.clientY - rect.top
    }

    window.addEventListener('resize', resize)
    window.addEventListener('mousemove', onMouse)
    resize()
    raf = requestAnimationFrame(draw)
    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      window.removeEventListener('mousemove', onMouse)
    }
  }, [])

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
    }, { threshold: 0.1 })
    els.forEach(el => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  const reveal = (delay = 0) => ({
    'data-reveal': '',
    style: {
      opacity: 0,
      transform: 'translateY(24px)',
      transition: `opacity 0.65s ease-out ${delay}s, transform 0.65s ease-out ${delay}s`,
    } as React.CSSProperties,
  })

  return (
    <div style={{ background: '#0A0A0F', color: '#F0EEF8', fontFamily: "'DM Sans', system-ui, sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500;600&display=swap');
        .syne { font-family: 'Syne', sans-serif; }
        .accent { color: #7C3AFF; }
        .accent-grad { background: linear-gradient(135deg, #7C3AFF, #A78BFA); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; }
        .card-hover { transition: background 0.2s, border-color 0.2s; }
        .card-hover:hover { background: #1C1B28 !important; border-color: rgba(91,33,240,0.3) !important; }
      `}</style>

      {/* Nav */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,10,15,0.85)', backdropFilter: 'blur(16px)', borderBottom: '1px solid #2D2B3D', padding: '16px 0' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontFamily: 'Syne, sans-serif', fontWeight: 800, fontSize: '1.25rem', letterSpacing: '-0.03em', color: '#F0EEF8' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5B21F0', boxShadow: '0 0 10px rgba(91,33,240,0.5)', display: 'inline-block' }} />
            HarNova
          </Link>
          <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
            <a href="#services" style={{ fontSize: '0.875rem', color: '#9896B0', textDecoration: 'none' }}>Services</a>
            <a href="#products" style={{ fontSize: '0.875rem', color: '#9896B0', textDecoration: 'none' }}>Products</a>
            <a href="#contact" style={{ fontSize: '0.875rem', color: '#9896B0', textDecoration: 'none' }}>Contact</a>
            <Link href="/" style={{ fontSize: '0.875rem', color: '#9896B0', textDecoration: 'none' }}>← Back to site builder</Link>
            <a href="mailto:hello@harnova.my" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 20px', background: '#5B21F0', borderRadius: 8, fontSize: '0.875rem', fontWeight: 600, color: '#fff', textDecoration: 'none' }}>
              Get in touch →
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', padding: '120px 0 80px', position: 'relative', overflow: 'hidden' }}>
        <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.45, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: '-20%', right: '-10%', width: 800, height: 800, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,33,240,0.18) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', position: 'relative', zIndex: 1 }}>
          <div {...reveal()}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 14px', background: 'rgba(91,33,240,0.12)', border: '1px solid rgba(91,33,240,0.3)', borderRadius: 999, marginBottom: 28 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block', animation: 'none' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 500, color: '#7C3AFF' }}>Malaysian Tech Startup · Kuala Lumpur</span>
            </div>
            <h1 className="syne" style={{ fontSize: 'clamp(2.8rem, 6vw, 5rem)', fontWeight: 800, lineHeight: 1.05, letterSpacing: '-0.03em', marginBottom: 20 }}>
              Building the tech<br />
              <span className="accent-grad">infrastructure</span><br />
              Malaysia needs.
            </h1>
            <p style={{ fontSize: 'clamp(1rem, 2vw, 1.2rem)', color: '#9896B0', maxWidth: 520, lineHeight: 1.7, marginBottom: 40 }}>
              HarNova designs and ships cloud platforms, AI products, and digital systems for Malaysian businesses — from SMEs to hospitals.
            </p>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <a href="#products" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#5B21F0', borderRadius: 10, fontWeight: 600, fontSize: '0.95rem', color: '#fff', textDecoration: 'none' }}>
                See our products →
              </a>
              <a href="mailto:hello@harnova.my" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', border: '1px solid #2D2B3D', borderRadius: 10, fontWeight: 500, fontSize: '0.95rem', color: '#9896B0', textDecoration: 'none' }}>
                Talk to us
              </a>
            </div>
            <div style={{ display: 'flex', gap: 48, marginTop: 72, paddingTop: 40, borderTop: '1px solid #2D2B3D', flexWrap: 'wrap' }}>
              {[['99%', 'Uptime SLA on our platforms'], ['6+', 'Tech solutions delivered'], ['MY', 'Built for the Malaysian market']].map(([n, l]) => (
                <div key={l}>
                  <div className="syne" style={{ fontSize: '2rem', fontWeight: 800, color: '#F0EEF8', lineHeight: 1 }}>
                    <span style={{ color: '#7C3AFF' }}>{n}</span>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#9896B0', marginTop: 4 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" style={{ background: '#13121A', padding: '100px 0' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
          <div {...reveal()} style={{ marginBottom: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 24, height: 2, background: '#5B21F0', borderRadius: 2 }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7C3AFF' }}>What we do</span>
            </div>
            <h2 className="syne" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 12 }}>
              End-to-end tech services for Malaysia
            </h2>
            <p style={{ color: '#9896B0', fontSize: '1rem', maxWidth: 500, lineHeight: 1.7 }}>
              From a landing page to a full cloud system with AI — one team, no vendor juggling.
            </p>
          </div>
          <div {...reveal(0.05)} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 2, background: '#2D2B3D', borderRadius: 16, overflow: 'hidden' }}>
            {SERVICES.map((s) => (
              <div key={s.name} className="card-hover" style={{ background: '#13121A', padding: '36px 32px' }}>
                <div style={{ width: 44, height: 44, borderRadius: 10, background: 'rgba(91,33,240,0.12)', border: '1px solid rgba(91,33,240,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.3rem', marginBottom: 20 }}>{s.icon}</div>
                <div className="syne" style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: 8 }}>{s.name}</div>
                <div style={{ fontSize: '0.875rem', color: '#9896B0', lineHeight: 1.65 }}>{s.desc}</div>
                <span style={{ display: 'inline-block', marginTop: 16, padding: '3px 10px', background: s.tagColor + '18', border: `1px solid ${s.tagColor}40`, borderRadius: 999, fontSize: '0.7rem', fontWeight: 600, color: s.tagColor, letterSpacing: '0.06em', textTransform: 'uppercase' }}>{s.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products — MediLink flagship */}
      <section id="products" style={{ padding: '100px 0' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
          <div {...reveal()} style={{ marginBottom: 56 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
              <div style={{ width: 24, height: 2, background: '#5B21F0', borderRadius: 2 }} />
              <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7C3AFF' }}>Our products</span>
            </div>
            <h2 className="syne" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Platforms we've built and shipped
            </h2>
          </div>

          {/* MediLink card */}
          <div {...reveal(0.05)} style={{ background: '#13121A', border: '1px solid #2D2B3D', borderRadius: 20, padding: '56px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center', position: 'relative', overflow: 'hidden', marginBottom: 24 }}>
            <div style={{ position: 'absolute', top: -100, right: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(91,33,240,0.08), transparent 70%)', pointerEvents: 'none' }} />
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 12px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 999, fontSize: '0.72rem', fontWeight: 600, color: '#22C55E', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 20 }}>
                <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                Live · Healthcare
              </div>
              <h3 className="syne" style={{ fontSize: 'clamp(1.8rem, 3vw, 2.4rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 12 }}>MediLink</h3>
              <p style={{ fontSize: '1rem', color: '#9896B0', lineHeight: 1.7, marginBottom: 28 }}>
                A high-availability hybrid cloud EHR platform for Malaysian clinics and hospitals. Runs fully offline when internet drops. Syncs to AWS when it's back up.
              </p>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 32 }}>
                {MEDILINK_FEATURES.map((f) => (
                  <li key={f} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: '0.9rem', color: '#9896B0' }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'rgba(91,33,240,0.15)', border: '1px solid rgba(91,33,240,0.3)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 2, color: '#7C3AFF', fontSize: 10 }}>✓</span>
                    {f}
                  </li>
                ))}
              </ul>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <a href="mailto:hello@harnova.my?subject=MediLink Demo" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#5B21F0', borderRadius: 10, fontWeight: 600, fontSize: '0.95rem', color: '#fff', textDecoration: 'none' }}>
                  Request a demo →
                </a>
                <a href="https://github.com/yashhgill/Medilink" target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', border: '1px solid #2D2B3D', borderRadius: 10, fontWeight: 500, fontSize: '0.95rem', color: '#9896B0', textDecoration: 'none' }}>
                  View on GitHub
                </a>
              </div>
            </div>

            {/* Live dashboard mockup */}
            <div>
              <div style={{ background: '#0D0C14', border: '1px solid #2D2B3D', borderRadius: 14, overflow: 'hidden', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 14px', borderBottom: '1px solid #2D2B3D', background: '#0A0910' }}>
                  {['#FF5F57', '#FFBD2E', '#28C840'].map(c => <span key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, display: 'inline-block' }} />)}
                  <span style={{ marginLeft: 8, fontSize: 10, color: '#55536A' }}>MediLink — Reception Dashboard</span>
                </div>
                <div style={{ padding: 16 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 10 }}>
                    {[['Queue Today', '14', '#7C3AFF'], ['In Progress', '3', '#F0EEF8'], ['Sync Status', 'Live', '#22C55E']].map(([l, v, c]) => (
                      <div key={l} style={{ background: '#1C1B28', border: '1px solid #2D2B3D', borderRadius: 8, padding: '10px 12px' }}>
                        <div style={{ fontSize: 8, color: '#55536A', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 2 }}>{l}</div>
                        <div className="syne" style={{ fontSize: '1.1rem', fontWeight: 700, color: c }}>{v}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: '#1C1B28', border: '1px solid #2D2B3D', borderRadius: 8, overflow: 'hidden', marginBottom: 8 }}>
                    <div style={{ padding: '7px 12px', fontSize: 8, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#55536A', borderBottom: '1px solid #2D2B3D' }}>Live Queue</div>
                    {[['#01', 'Arjun Rao', 'In Progress', '#7C3AFF'], ['#02', 'Mei Lin Chong', 'Pharmacy', '#60A5FA'], ['#03', 'Hafiz Rahman', 'Checked In', '#22C55E'], ['#04', 'Priya Nair', 'Waiting', '#F59E0B'], ['#05', 'Lim Ah Kow', 'Waiting', '#F59E0B']].map(([n, name, status, c]) => (
                      <div key={n} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '7px 12px', borderBottom: '1px solid rgba(45,43,61,0.5)', fontSize: 9 }}>
                        <span className="syne" style={{ fontWeight: 700, color: '#7C3AFF', width: 20 }}>{n}</span>
                        <span style={{ color: '#F0EEF8', flex: 1 }}>{name}</span>
                        <span style={{ padding: '2px 6px', borderRadius: 4, fontSize: 8, fontWeight: 600, background: c + '22', color: c }}>{status}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: 'rgba(91,33,240,0.08)', border: '1px solid rgba(91,33,240,0.2)', borderRadius: 8, padding: '10px 12px' }}>
                    <div style={{ fontSize: 8, color: '#7C3AFF', fontWeight: 600, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 6 }}>⚡ AI Triage — #03 Hafiz Rahman</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ padding: '3px 8px', background: 'rgba(245,158,11,0.15)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 4, fontSize: 8, fontWeight: 700, color: '#F59E0B' }}>URGENT · Yellow</span>
                      <span style={{ fontSize: 8, color: '#55536A' }}>Target wait: 60 min · Chest tightness + elevated BP</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Coming soon */}
          <div {...reveal(0.1)} style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {COMING_SOON.map((p) => (
              <div key={p.name} style={{ background: '#13121A', border: '1px solid #2D2B3D', borderRadius: 14, padding: '28px 24px', opacity: 0.7, position: 'relative' }}>
                <span style={{ position: 'absolute', top: 14, right: 14, padding: '3px 8px', background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 4, fontSize: '0.65rem', fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Coming Soon</span>
                <div style={{ fontSize: '1.6rem', marginBottom: 12 }}>{p.icon}</div>
                <div className="syne" style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 6 }}>{p.name}</div>
                <div style={{ fontSize: '0.82rem', color: '#9896B0', lineHeight: 1.6 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why HarNova */}
      <section id="why" style={{ background: '#13121A', padding: '100px 0' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 64, alignItems: 'center' }}>
            <div {...reveal()}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 24, height: 2, background: '#5B21F0', borderRadius: 2 }} />
                <span style={{ fontSize: '0.72rem', fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#7C3AFF' }}>Why HarNova</span>
              </div>
              <h2 className="syne" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.4rem)', fontWeight: 700, letterSpacing: '-0.02em', marginBottom: 36 }}>
                We're not an agency.<br />We're a product studio.
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
                {WHY.map((w) => (
                  <div key={w.title} style={{ display: 'flex', gap: 16 }}>
                    <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(91,33,240,0.1)', border: '1px solid rgba(91,33,240,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{w.icon}</div>
                    <div>
                      <div className="syne" style={{ fontWeight: 700, fontSize: '1rem', marginBottom: 4 }}>{w.title}</div>
                      <div style={{ fontSize: '0.875rem', color: '#9896B0', lineHeight: 1.65 }}>{w.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div {...reveal(0.1)}>
              <div style={{ background: '#0A0A0F', border: '1px solid #2D2B3D', borderRadius: 16, padding: 32 }}>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, color: '#9896B0', marginBottom: 16, fontFamily: 'Syne, sans-serif' }}>Our tech stack</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                  {TECH.map(([emoji, name]) => (
                    <div key={name} className="card-hover" style={{ background: '#1C1B28', border: '1px solid #2D2B3D', borderRadius: 8, padding: '10px 12px', textAlign: 'center', cursor: 'default' }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: 4 }}>{emoji}</div>
                      <div style={{ fontSize: '0.78rem', fontWeight: 500, color: '#9896B0' }}>{name}</div>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop: 24, padding: 20, background: 'rgba(91,33,240,0.06)', border: '1px solid rgba(91,33,240,0.15)', borderRadius: 12 }}>
                  <div className="syne" style={{ fontWeight: 700, color: '#7C3AFF', fontSize: '0.875rem', marginBottom: 6 }}>AWS Well-Architected Framework</div>
                  <div style={{ fontSize: '0.82rem', color: '#9896B0', lineHeight: 1.7 }}>
                    Every HarNova cloud deployment is reviewed against all 6 pillars: Reliability, Security, Performance Efficiency, Cost Optimisation, Operational Excellence, and Sustainability.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section id="contact" style={{ padding: '100px 0' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px' }}>
          <div {...reveal()} style={{ background: 'linear-gradient(135deg, rgba(91,33,240,0.2) 0%, rgba(91,33,240,0.05) 100%)', border: '1px solid rgba(91,33,240,0.25)', borderRadius: 24, padding: '72px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: 600, height: 1, background: 'linear-gradient(90deg, transparent, #5B21F0, transparent)' }} />
            <h2 className="syne" style={{ fontSize: 'clamp(1.8rem, 3.5vw, 2.8rem)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: 16 }}>
              Ready to build something real?
            </h2>
            <p style={{ fontSize: '1rem', color: '#9896B0', marginBottom: 36 }}>
              Tell us what you're trying to solve. We'll figure out the tech together.
            </p>
            <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40 }}>
              <a href="mailto:hello@harnova.my" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', background: '#5B21F0', borderRadius: 10, fontWeight: 600, fontSize: '0.95rem', color: '#fff', textDecoration: 'none' }}>
                Email us →
              </a>
              <a href="https://wa.me/60182085097" target="_blank" rel="noopener" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '14px 28px', border: '1px solid #2D2B3D', borderRadius: 10, fontWeight: 500, fontSize: '0.95rem', color: '#9896B0', textDecoration: 'none' }}>
                WhatsApp
              </a>
            </div>
            <div style={{ display: 'flex', gap: 32, justifyContent: 'center', flexWrap: 'wrap' }}>
              {[['📧', 'hello@harnova.my', 'mailto:hello@harnova.my'], ['🌐', 'harnova.my', 'https://harnova.my'], ['📍', 'Kuala Lumpur, Malaysia', null]].map(([icon, text, href]) => (
                <div key={text as string} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.875rem', color: '#9896B0' }}>
                  {icon} {href ? <a href={href as string} style={{ color: '#7C3AFF', textDecoration: 'none' }}>{text}</a> : text}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid #2D2B3D', padding: '40px 0' }}>
        <div style={{ maxWidth: 1160, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="syne" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.03em', marginBottom: 6 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#5B21F0', display: 'inline-block' }} />
              HarNova
            </div>
            <div style={{ fontSize: '0.82rem', color: '#55536A' }}>© 2025 HarNova Technology · harnova.my</div>
          </div>
          <div style={{ display: 'flex', gap: 24 }}>
            {[['Services', '#services'], ['Products', '#products'], ['Contact', 'mailto:hello@harnova.my'], ['GitHub', 'https://github.com/yashhgill'], ['Site Builder', '/']].map(([label, href]) => (
              <a key={label as string} href={href as string} style={{ fontSize: '0.82rem', color: '#55536A', textDecoration: 'none' }}>{label}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  )
}
