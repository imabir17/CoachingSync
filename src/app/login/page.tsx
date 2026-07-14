'use client'

import { useState, useRef, useActionState } from 'react'
import { login } from '@/app/actions/auth'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Check, X, AlertCircle } from 'lucide-react'

export default function LoginPage() {
  // Binds the login action with React 19 useActionState
  const [state, formAction, isPending] = useActionState(login, { error: '' })
  
  // Local state for input values to support autofill
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)

  // 3D card tilt coordinates
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    setTilt({ x: x * 16, y: -y * 16 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }



  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap');

        :root {
          --bg: #1E1E1E;
          --bg-deep: #252526;
          --shadow-dark: #111317;
          --shadow-light: #252A31;
          --text-1: #D4D4D4;
          --text-2: #CCCCCC;
          --text-3: #858585;
          --accent: #007ACC;
          --accent-light: #007ACC;
          --accent-dark: #0062A3;
          --teal: #4EC9B0;
          --coral: #CE9178;
          --error: #E5484D;
        }

        body {
          background: var(--bg);
          color: var(--text-1);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        h1, h2, h3 { 
          font-family: 'Space Grotesk', sans-serif; 
          letter-spacing: -0.02em; 
        }

        .mono { 
          font-family: 'JetBrains Mono', monospace; 
          letter-spacing: 0.04em; 
        }

        /* Ambient Orbs */
        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: .3;
          z-index: 0;
        }

        .orb1 {
          width: 380px;
          height: 380px;
          background: var(--accent);
          top: -120px;
          left: -100px;
          animation: drift 14s ease-in-out infinite;
        }

        .orb2 {
          width: 320px;
          height: 320px;
          background: var(--teal);
          bottom: -100px;
          right: -80px;
          animation: drift 16s ease-in-out infinite reverse;
        }

        @keyframes drift {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(30px,-24px); }
        }

        /* Neomorphic Primitives */
        .neo-raised {
          background: var(--bg);
          box-shadow: 9px 9px 18px var(--shadow-dark), -9px -9px 18px var(--shadow-light);
        }

        .neo-pressed {
          background: var(--bg);
          box-shadow: inset 6px 6px 12px var(--shadow-dark), inset -6px -6px 12px var(--shadow-light);
        }

        .neo-flat {
          background: var(--bg);
          box-shadow: 6px 6px 12px var(--shadow-dark), -6px -6px 12px var(--shadow-light);
        }

        .neo-inline {
          background: var(--bg);
          box-shadow: 4px 4px 8px var(--shadow-dark), -4px -4px 8px var(--shadow-light);
        }

        /* Switch Customization */
        .remember {
          display: flex;
          align-items: center;
          gap: 9px;
          font-size: 13px;
          color: var(--text-2);
          cursor: pointer;
          user-select: none;
        }

        .switch {
          width: 38px;
          height: 22px;
          border-radius: 999px;
          position: relative;
          box-shadow: inset 4px 4px 8px var(--shadow-dark), inset -4px -4px 8px var(--shadow-light);
          transition: background .2s ease;
          flex-shrink: 0;
        }

        .switch::after {
          content: '';
          position: absolute;
          top: 3px;
          left: 3px;
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--bg);
          box-shadow: 2px 2px 5px var(--shadow-dark), -2px -2px 5px var(--shadow-light);
          transition: transform .22s cubic-bezier(.5,-0.3,.5,1.3);
        }

        .hidden-check {
          display: none;
        }

        .hidden-check:checked + .switch {
          background: linear-gradient(145deg, var(--accent-light), var(--accent-dark));
          box-shadow: inset 2px 2px 5px rgba(0,0,0,0.15);
        }

        .hidden-check:checked + .switch::after {
          transform: translateX(16px);
          background: #fff;
        }

        @keyframes bob {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-bob-1 { animation: bob 5s ease-in-out infinite; }
        .animate-bob-2 { animation: bob 5s ease-in-out infinite 1.6s; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-spin-custom {
          animation: spin .7s linear infinite;
        }
      `}</style>

      {/* Background drifting orbs */}
      <div className="orb orb1 pointer-events-none"></div>
      <div className="orb orb2 pointer-events-none"></div>

      {/* Main container shell */}
      <div className="relative z-10 w-full max-w-[920px] grid grid-cols-1 md:grid-cols-2 rounded-[32px] bg-[#1E1E1E] border border-[#3E3E42] overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
        
        {/* LEFT PANEL: Branding & Visuals */}
        <div className="hidden md:flex p-12 bg-gradient-to-br from-[#EEF2F8] to-[#252526] flex-col justify-between relative">
          <div>
            <div className="flex items-center gap-2.5 font-bold text-[#D4D4D4] text-lg">
              <div className="w-9 h-9 rounded-[11px] bg-gradient-to-br from-[#007ACC] to-[#0062A3] border border-[#3E3E42] flex items-center justify-center">
                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="none">
                  <path d="M2 12L22 4L14 22L11 14L2 12Z" fill="white"/>
                </svg>
              </div>
              CoachingSync
            </div>
            
            <div className="mt-10">
              <h2 className="text-[26px] font-bold text-[#D4D4D4] leading-[1.25] mb-3.5">
                Your whole pipeline,<br />waiting where you left it.
              </h2>
              <p className="text-xs text-[#CCCCCC] max-w-[280px] leading-relaxed">
                Sign in to pick up every student file, application, and follow-up exactly where your team left off.
              </p>
            </div>
          </div>

          {/* Interactive Card Space */}
          <div className="relative h-48 w-full mt-4 flex items-center justify-center perspective-[1200px]">
            <div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="w-56 h-36 rounded-md bg-[#1E1E1E] relative transform-style-preserve-3d border border-[#3E3E42] transition-transform duration-100 ease-out p-4 pointer-events-auto"
              style={{
                transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) translateZ(0)`
              }}
            >
              {/* Inner depth layer */}
              <div className="absolute inset-2.5 rounded-[14px] bg-gradient-to-br from-[#EEF2F7] to-[#DEE5EF] border border-[#3E3E42] pointer-events-none"></div>

              <div className="relative z-10 h-full flex flex-col transform translate-z-[24px]">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-[#858585]">#A2291</span>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-br from-[#21C285] to-[#159a68]">
                    OFFER
                  </span>
                </div>
                
                <div className="font-bold text-[14px] text-[#D4D4D4] mt-4">Farhan Rahman</div>
                <div className="text-[10px] text-[#858585] mt-0.5">Toronto, CA · Fall 2027</div>
                
                <div className="mt-auto flex gap-2">
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-[#CCCCCC] bg-[#1E1E1E] border border-[#3E3E42]">IELTS 7.5</span>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-[#CCCCCC] bg-[#1E1E1E] border border-[#3E3E42]">3 Apps</span>
                </div>
              </div>
            </div>

            {/* Float tags */}
            <div className="absolute top-2 right-2 bg-[#1E1E1E] px-3 py-2 rounded-sm flex items-center gap-1.5 text-[11px] font-bold text-[#D4D4D4] border border-[#3E3E42] animate-bob-1">
              <Check className="w-3.5 h-3.5 text-[#4EC9B0]" /> Synced
            </div>
            <div className="absolute bottom-6 -left-2 bg-[#1E1E1E] px-3 py-2 rounded-sm flex items-center gap-1.5 text-[11px] font-bold text-[#D4D4D4] border border-[#3E3E42] animate-bob-2">
              <AlertCircle className="w-3.5 h-3.5 text-[#CE9178]" /> Task due
            </div>
          </div>

          <div className="text-[11px] text-[#858585] font-semibold">
            © {new Date().getFullYear()} CoachingSync · Student Recruitment CRM
          </div>
        </div>

        {/* RIGHT PANEL: Form Inputs */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-[#1E1E1E]">
          <div className="mb-8">
            <span className="text-[10px] font-bold font-mono text-[#4EC9B0] tracking-widest block mb-2">WELCOME BACK</span>
            <h1 className="text-2xl font-bold text-[#D4D4D4] mb-1">Sign in to your workspace</h1>
            <p className="text-xs text-[#CCCCCC]">Enter your credentials to access the dashboard.</p>
          </div>

          {/* Error Message Box */}
          {state?.error && (
            <div className="flex items-center gap-2.5 text-xs text-[#E5484D] bg-[#E5484D]/8 p-3 rounded-sm mb-6 shadow-sm border border-[#E5484D]/10">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          <form action={formAction} className="space-y-4">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#CCCCCC] mb-2">
                Email address
              </label>
              <div className="rounded-sm p-1 pr-4 pl-4 bg-[#1E1E1E] border border-[#3E3E42] flex items-center gap-3 focus-within:border border-[#3E3E42] transition-all">
                <Mail className="w-4 h-4 text-[#858585] shrink-0" />
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  placeholder="you@agency.com" 
                  autoComplete="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="border-none bg-transparent outline-none w-full py-3.5 text-base text-[#D4D4D4]"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#CCCCCC] mb-2">
                Password
              </label>
              <div className="rounded-sm p-1 pr-3 pl-4 bg-[#1E1E1E] border border-[#3E3E42] flex items-center gap-3 focus-within:border border-[#3E3E42] transition-all">
                <Lock className="w-4 h-4 text-[#858585] shrink-0" />
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="password" 
                  name="password"
                  placeholder="••••••••" 
                  autoComplete="current-password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-none bg-transparent outline-none w-full py-3.5 text-base text-[#D4D4D4]"
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="p-1 text-[#858585] hover:text-[#D4D4D4] transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot Row */}
            <div className="flex items-center justify-between py-1.5">
              <label htmlFor="remember-me" className="remember">
                <input 
                  type="checkbox" 
                  id="remember-me" 
                  name="remember-me" 
                  className="hidden-check" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="switch"></span>
                Remember me
              </label>
              <Link href="/forgot-password" className="text-xs font-semibold text-[#007ACC] hover:text-[#0062A3]">
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={isPending}
              className={`w-full py-4 rounded-sm font-bold text-xs text-white bg-gradient-to-br from-[#007ACC] to-[#0062A3] border border-[#3E3E42] hover:border-[#555555] active:translate-y-0.5 transition-all duration-150 flex items-center justify-center gap-2 ${
                isPending ? 'opacity-85 pointer-events-none' : ''
              }`}
            >
              {isPending && <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin-custom"></span>}
              <span>{isPending ? 'Signing in...' : 'Sign in'}</span>
            </button>
          </form>


          <p className="signup-note text-center mt-6 text-xs text-[#858585]">
            New agency? <a href="mailto:CoachingSync@gmail.com" className="font-bold text-[#007ACC] hover:text-[#0062A3]">Request access</a>
          </p>
          
          <div className="flex justify-center items-center gap-4 mt-8 text-[10px] text-[#858585]">
            <Link href="/privacy" className="hover:text-[#007ACC] transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:text-[#007ACC] transition-colors">Terms & Conditions</Link>
          </div>
        </div>

      </div>
    </div>
  )
}
