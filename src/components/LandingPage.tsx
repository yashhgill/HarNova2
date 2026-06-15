import React, { useState } from "react";
import { motion } from "motion/react";
import { 
  Zap, 
  Shield, 
  Globe, 
  Sparkles, 
  ArrowRight, 
  Cpu, 
  CheckCircle2, 
  CreditCard,
  Code,
  Share2
} from "lucide-react";

interface LandingPageProps {
  onStartBuilding: () => void;
}

export default function LandingPage({ onStartBuilding }: LandingPageProps) {
  const [activeTab, setActiveTab] = useState<"code" | "domain">("code");
  const [demoPrompt, setDemoPrompt] = useState("A brutalist high-contrast portfolio for an architectural photographer in Berlin. Use deep black backgrounds, neon lime styling, and list coordinates in margins.");

  const pricingPacks = [
    {
      name: "Starter Bundle",
      tokens: 30,
      price: "$9",
      description: "Perfect for testing ideas and launching a single elegant landing page.",
      popular: false,
      features: ["30 Generation Credits", "Standard Static Edge Hosting", "SSL Certificate included", "Basic .harnova.app subdomain"]
    },
    {
      name: "Founder Pack",
      tokens: 150,
      price: "$29",
      description: "Our most popular pricing bundle. Scale up quickly with premium components.",
      popular: true,
      features: ["150 Generation Credits", "High Performance Edge CDN", "Point Custom Domains", "AI inline copy assistance", "24/7 Hosting node diagnostics"]
    },
    {
      name: "SaaS Enterprise",
      tokens: 600,
      price: "$99",
      description: "Designed for digital studios compiling and mapping production setups simultaneously.",
      popular: false,
      features: ["600 Generation Credits", "Ultra Fast API response speeds", "Unlimited Custom Domain Pointer API links", "Custom styling configuration presets", "Priority developer assistance"]
    }
  ];

  return (
    <div className="bg-slate-950 text-slate-100 min-h-screen relative overflow-hidden font-sans">
      {/* Dynamic ambient backgrounds */}
      <div className="absolute top-0 left-1/3 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-radial-at-t from-orange-500/10 via-transparent to-transparent -z-10" />
      <div className="absolute top-[800px] right-0 w-[500px] h-[500px] bg-radial-at-c from-purple-500/5 to-transparent -z-10" />

      {/* Nav */}
      <nav className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between border-b border-slate-900/80 sticky top-0 bg-slate-950/80 backdrop-blur-md z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold tracking-tight shadow-xl shadow-orange-500/15">
            HN
          </div>
          <span className="font-extrabold text-lg tracking-tight">HarNova</span>
        </div>
        
        <div className="flex items-center space-x-6">
          <a href="#features" class="hidden md:inline text-xs text-slate-400 hover:text-slate-200 transition">Tech Specs</a>
          <a href="#pricing" class="hidden md:inline text-xs text-slate-400 hover:text-slate-200 transition font-medium">Tokens & Pricing</a>
          <button 
            onClick={onStartBuilding}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-semibold text-xs tracking-wide transition duration-150 cursor-pointer"
          >
            Launch Builder
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-16 md:pt-24 pb-16 text-center">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400 mb-8"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>The Emergent.sh Paradigm, Reimagined</span>
        </motion.div>

        <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 text-white max-w-5xl mx-auto">
          Prompt your website. <br />
          <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-pink-500 bg-clip-text text-transparent">
            Instant Host & Point Custom Domains.
          </span>
        </h1>

        <p className="text-slate-400 font-light text-base md:text-xl max-w-3xl mx-auto mb-12 leading-relaxed">
          Create exquisite, self-contained landing pages and platforms in 30 seconds. Buy token bundles as you grow, publish instantly to our edge networks, and link custom domains through raw API validations.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <button 
            onClick={onStartBuilding}
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-orange-600 to-amber-500 text-white font-bold text-sm tracking-wide shadow-xl shadow-orange-600/20 hover:opacity-95 hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center space-x-2"
          >
            <span>Compile Your First Page Now</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <a 
            href="#pricing"
            className="w-full sm:w-auto px-8 py-4 rounded-xl border border-slate-800 bg-slate-900/30 text-slate-300 font-semibold text-sm hover:bg-slate-800/50 transition flex items-center justify-center space-x-2"
          >
            <CreditCard className="w-4 h-4 text-slate-400" />
            <span>View Token Packages</span>
          </a>
        </div>

        {/* Feature Interactive Showcase Card */}
        <div id="demo" className="max-w-5xl mx-auto rounded-2xl bg-slate-900 border border-slate-800 p-1 md:p-2 shadow-2xl relative">
          <div className="rounded-xl bg-slate-950 border border-slate-800 p-6 text-left">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-slate-900 pb-6 mb-6">
              <div className="flex items-center space-x-3 shrink-0">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <span className="text-xs font-mono text-slate-500 pl-2">harnova-sandbox-compiler.sh</span>
              </div>
              <div className="flex bg-slate-900 px-1 py-1 rounded-lg border border-slate-800/60 w-full md:w-auto">
                <button 
                  onClick={() => setActiveTab("code")}
                  className={`flex-1 md:flex-initial px-4 py-1.5 rounded-md text-xs font-medium transition ${activeTab === 'code' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Code Compiler
                </button>
                <button 
                  onClick={() => setActiveTab("domain")}
                  className={`flex-1 md:flex-initial px-4 py-1.5 rounded-md text-xs font-medium transition ${activeTab === 'domain' ? 'bg-orange-600 text-white font-semibold' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Custom Domain API
                </button>
              </div>
            </div>

            {activeTab === "code" ? (
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2">
                    <Code className="w-4 h-4 text-orange-500" />
                    <span>User prompt script</span>
                  </h3>
                  <textarea 
                    value={demoPrompt}
                    onChange={(e) => setDemoPrompt(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-900 border border-slate-850 p-4 rounded-xl text-xs font-mono text-slate-350 focus:outline-none focus:border-orange-500/40 resize-none leading-relaxed"
                  />
                  <div className="p-4 rounded-xl bg-orange-950/20 border border-orange-500/20 flex gap-3 text-xs leading-relaxed text-orange-200">
                    <Cpu className="w-5 h-5 shrink-0 text-orange-400 mt-0.5" />
                    <span>
                      Compile cost: <strong>1 Token</strong>. Our advanced systems read the variables and write beautifully isolated layouts containing custom components, style variables, and menus.
                    </span>
                  </div>
                </div>

                <div className="p-6 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                  <div>
                    <h4 className="text-xs font-mono text-slate-500 uppercase mb-2">Live CDN Preview Shell</h4>
                    <div className="p-4 bg-slate-950 rounded-lg space-y-2">
                      <div className="h-2 w-12 bg-orange-500 rounded"></div>
                      <div className="h-4 w-40 bg-slate-800 rounded mt-4"></div>
                      <div className="h-3 w-52 bg-slate-800 rounded"></div>
                      <div className="grid grid-cols-3 gap-3 pt-4">
                        <div className="h-10 bg-slate-900 border border-slate-850 rounded"></div>
                        <div className="h-10 bg-slate-900 border border-slate-850 rounded"></div>
                        <div className="h-10 bg-slate-900 border border-slate-850 rounded"></div>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={onStartBuilding}
                    className="w-full mt-6 py-3 bg-orange-650 hover:bg-orange-600 rounded-xl font-bold text-xs text-white transition tracking-wide cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>Launch Member Dashboard</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center space-x-2 mb-2">
                    <Globe className="w-4 h-4 text-orange-400" />
                    <span>Linking Custom Domain API</span>
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed max-w-2xl">
                    With HarNova, you aren't jailed inside boring sandbox subdomains. Type any custom domain you own (e.g. <code>myphotostudio.de</code>) and link it securely. Our server monitors DNS propagations live.
                  </p>
                </div>

                <div className="grid sm:grid-cols-3 gap-4 font-mono text-[11px]">
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-slate-500">TYPE</span>
                    <div className="text-white font-bold">A Record</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-slate-500">POINTS TO IP</span>
                    <div className="text-orange-400 font-bold">76.76.21.21</div>
                  </div>
                  <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                    <span className="text-slate-500">STATUS</span>
                    <div className="text-green-400 flex items-center space-x-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-green-400"></span>
                      <span>Verified Active</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-900 border border-slate-850 flex gap-4 items-center">
                  <Share2 className="w-5 h-5 text-slate-400 flex-shrink-0" />
                  <div className="text-xs leading-relaxed text-slate-400">
                    Once DNS values match, our secure system automatically queries Let's Encrypt to provision zero-cost SSL certificates for your custom domain mapping.
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Pricing / Tokens Section */}
      <section id="pricing" className="py-24 border-t border-slate-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold tracking-tight mb-4">Recharge Token Bundles</h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Compile risk-free. Standard users start with <strong>30 Free tokens</strong> instantly upon registration. Recharge custom packages safely using secure credit transactions as your portfolio grows.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPacks.map((pack, idx) => (
              <div 
                key={idx}
                className={`p-8 rounded-2xl border flex flex-col justify-between relative transition duration-300 ${pack.popular ? 'border-orange-500 bg-slate-900/60 shadow-xl shadow-orange-500/5' : 'border-slate-850 bg-slate-900/20 hover:border-slate-800'}`}
              >
                {pack.popular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-orange-600 font-bold text-[10px] tracking-widest text-white uppercase">Most Selected</span>
                )}
                <div>
                  <h3 className="text-lg font-bold">{pack.name}</h3>
                  <p className="text-xs text-slate-400 mt-2">{pack.description}</p>
                  
                  {/* Token big text */}
                  <div className="my-6 flex items-baseline space-x-2">
                    <span className="text-4xl font-extrabold bg-gradient-to-r from-orange-400 to-amber-300 bg-clip-text text-transparent">
                      {pack.tokens}
                    </span>
                    <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Tokens</span>
                    <span className="text-slate-600 px-2">/</span>
                    <span className="text-2xl font-bold text-slate-350">{pack.price}</span>
                  </div>

                  <ul className="space-y-3.5 border-t border-slate-900 pt-6">
                    {pack.features.map((feat, f_idx) => (
                      <li key={f_idx} className="flex items-start space-x-3 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-orange-500 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button 
                  onClick={onStartBuilding}
                  className={`w-full py-3 rounded-xl mt-8 font-bold text-xs tracking-wide transition block text-center cursor-pointer ${pack.popular ? 'bg-orange-600 hover:bg-orange-500 text-white' : 'bg-slate-800 hover:bg-slate-755 text-slate-200'}`}
                >
                  Claim This Bundle
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-16 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-lg bg-orange-600 flex items-center justify-center text-white font-bold">
              HN
            </div>
            <span className="font-extrabold text-sm tracking-tight text-slate-300">HarNova</span>
          </div>
          <span>&copy; 2026 HarNova. Integrated API systems mapped safely on Cloud Run.</span>
        </div>
      </footer>
    </div>
  );
}
