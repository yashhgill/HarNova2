import React, { useState } from "react";
import { motion } from "motion/react";
import { Zap, Shield, Sparkles, Mail, Lock, Loader2, ArrowRight } from "lucide-react";
import { HarNovaStore } from "../services/store";

interface AuthScreenProps {
  onAuthSuccess: (uid: string, email: string) => void;
}

export default function AuthScreen({ onAuthSuccess }: AuthScreenProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg("Please fill in all standard credentials.");
      return;
    }
    setErrorMsg("");
    setIsLoading(true);

    try {
      if (isSignUp) {
        const profile = await HarNovaStore.signUpWithEmail(email, password);
        onAuthSuccess(profile.uid, profile.email);
      } else {
        const profile = await HarNovaStore.signInWithEmail(email, password);
        onAuthSuccess(profile.uid, profile.email);
      }
    } catch (error: any) {
      setErrorMsg(error.message || "Failed to process authentication.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setErrorMsg("");
    setIsLoading(true);
    try {
      const profile = await HarNovaStore.signInWithGoogle();
      onAuthSuccess(profile.uid, profile.email);
    } catch (error: any) {
      console.error("Google login failure:", error);
      setErrorMsg(error.message || "Google authentication failed or was cancelled.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSandboxLogin = async () => {
    setErrorMsg("");
    setIsLoading(true);
    try {
      const profile = await HarNovaStore.signInAnonymously();
      onAuthSuccess(profile.uid, profile.email);
    } catch (error: any) {
      console.error("Sandbox login failure:", error);
      setErrorMsg(error.message || "Sandbox login failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      {/* Exquisite motion graphic background lines / glowing orbs */}
      <div className="absolute top-0 left-0 right-0 bottom-0 overflow-hidden pointer-events-none -z-10">
        <motion.div 
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 40, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/4 left-1/3 w-96 h-96 bg-orange-600/10 rounded-full blur-[100px]"
        />
        <motion.div 
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -60, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-1/4 right-1/3 w-[450px] h-[450px] bg-purple-600/10 rounded-full blur-[120px]"
        />
        
        {/* Floating animated sparkles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full bg-orange-400/40"
            style={{
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [-25, -150],
              opacity: [0, 0.8, 0],
              scale: [0.5, 1.2, 0.5],
            }}
            transition={{
              duration: 8 + Math.random() * 8,
              repeat: Infinity,
              ease: "linear",
              delay: Math.random() * 5,
            }}
          />
        ))}

        {/* Diagonal wireframe line accents */}
        <svg className="absolute inset-0 w-full h-full stroke-slate-900/60 stroke-[0.5]" fill="none">
          <line x1="0%" y1="10%" x2="100%" y2="80%"/>
          <line x1="0%" y1="40%" x2="100%" y2="100%"/>
          <line x1="20%" y1="0%" x2="80%" y2="100%"/>
        </svg>
      </div>

      {/* Decorative ambient radial grids */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-radial-at-t from-orange-500/10 via-transparent to-transparent -z-10" />
      <div className="absolute -bottom-80 -right-80 w-[600px] h-[600px] bg-radial-at-c from-purple-500/5 to-transparent -z-10" />

      {/* Header */}
      <header className="max-w-7xl w-full mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white font-bold text-lg shadow-xl shadow-orange-500/20">
            HN
          </div>
          <span className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            HarNova <span className="text-orange-500">Builder</span>
          </span>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-6 py-12 flex flex-col lg:flex-row items-center justify-between gap-12 flex-grow">
        {/* Pitch Panel */}
        <div className="lg:w-1/2 text-left space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-xs font-semibold text-orange-400">
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>AI Instant Web Deploy Engine</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-tight">
            Deploy Beautiful Websites <br />
            <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-pink-500 bg-clip-text text-transparent animate-gradient">
              Directly via Prompt
            </span>
          </h1>

          <p className="text-slate-400 leading-relaxed font-light text-base max-w-md">
            HarNova is the ultimate generative SaaS that turns your text prompts into complete, functional, hosted websites with pointing domains. Instant preview, zero code, and robust CDN performance.
          </p>

          {/* Feature highlights */}
          <div className="space-y-4 pt-4">
            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">1-Click AI Compilation</h4>
                <p className="text-xs text-slate-500">Gemini generates tailored HTML5, CSS layout grids, responsive menus, and scripts instantly.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
                <Shield className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-sm font-semibold">Decentralized Global Hosting</h4>
                <p className="text-xs text-slate-500">Every site is hosted securely on our persistent edge server nodes immediately.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="w-full lg:w-[480px]">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-8 rounded-2xl bg-slate-900 border border-slate-800/80 shadow-2xl relative overflow-hidden backdrop-blur-sm"
          >
            {/* Active scanner wireframe animation to look ultra premium */}
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-orange-500 to-transparent animate-[pulse_2s_infinite] shadow-[0_0_15px_rgba(249,115,22,0.8)]" />

            <div className="mb-6">
              <h2 className="text-xl font-bold tracking-tight">Access HarNova Portal</h2>
              <p className="text-xs text-slate-500 mt-1">
                {isSignUp ? "Create your workspace to purchase tokens" : "Sign in to compile and route custom domains"}
              </p>
            </div>

            {errorMsg && (
              <div className="p-3 mb-4 rounded-xl bg-red-950/40 border border-red-500/30 text-xs text-red-300">
                {errorMsg}
              </div>
            )}

            {/* Google Sign-In Button */}
            <button
              onClick={handleGoogleAuth}
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-neutral-100 text-slate-950 font-bold text-sm transition-all duration-300 flex items-center justify-center space-x-3 shadow-lg hover:shadow-white/5 cursor-pointer disabled:opacity-50 select-none mb-5"
            >
              {isLoading ? (
                <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
              ) : (
                <>
                  <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                  </svg>
                  <span>Continue with Google</span>
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center my-5">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="px-3 text-[10px] uppercase tracking-wider text-slate-500 font-medium">Or email security gate</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider text-left">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    required
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-1000 border border-slate-800 focus:border-orange-500/50 text-sm placeholder-slate-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5 uppercase tracking-wider text-left">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-10 pr-4 py-3.5 rounded-xl bg-slate-1000 border border-slate-800 focus:border-orange-500/50 text-sm placeholder-slate-600 focus:outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 rounded-xl bg-orange-650 hover:bg-orange-650/90 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg shadow-orange-600/10 cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>{isSignUp ? "Create Account & Start" : "Authenticate Identity"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-800/80 flex items-center justify-center text-xs">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-slate-400 hover:text-orange-400 transition"
              >
                {isSignUp ? "Already have a membership? Sign In" : "Need credentials? Create Account"}
              </button>
            </div>

            {/* Quick Sandbox Login Fallback */}
            <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col space-y-3">
              <div className="text-center">
                <span className="text-[10px] uppercase tracking-wider text-slate-600">Or bypass setup instantly</span>
              </div>
              <button
                type="button"
                onClick={handleSandboxLogin}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700/50 hover:border-slate-600 font-semibold text-xs transition duration-200 cursor-pointer"
              >
                Enter Sandbox Mode & get 30 Free Tokens
              </button>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full text-center py-6 text-slate-600 text-xs border-t border-slate-900/50 z-10 bg-slate-950">
        &copy; 2026 HarNova SaaS. Verified Zero-Trust Portal Cloud Architecture.
      </footer>
    </div>
  );
}
