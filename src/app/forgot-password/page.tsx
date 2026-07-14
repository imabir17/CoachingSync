'use client'

import { useActionState, useState } from 'react'
import { resetPassword } from '@/app/actions/auth'
import Link from 'next/link'
import { Mail, ArrowLeft, Check, AlertCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPassword, { error: '', success: '' } as any)
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --bg: #1E1E1E;
          --shadow-dark: #111317;
          --shadow-light: #252A31;
          --text-1: #D4D4D4;
          --text-2: #CCCCCC;
          --text-3: #858585;
          --accent: #007ACC;
          --accent-light: #007ACC;
          --accent-dark: #0062A3;
          --teal: #4EC9B0;
          --error: #E5484D;
        }

        body {
          background: var(--bg);
          color: var(--text-1);
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        h2 { 
          font-family: 'Space Grotesk', sans-serif; 
          letter-spacing: -0.02em; 
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          opacity: .35;
          z-index: 0;
        }

        .orb1 {
          width: 350px;
          height: 350px;
          background: var(--accent);
          top: -100px;
          left: -80px;
          animation: drift 15s ease-in-out infinite;
        }

        .orb2 {
          width: 300px;
          height: 300px;
          background: var(--teal);
          bottom: -100px;
          right: -80px;
          animation: drift 18s ease-in-out infinite reverse;
        }

        @keyframes drift {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(25px,-20px); }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-spin-custom {
          animation: spin .7s linear infinite;
        }
      `}</style>

      {/* Orbs */}
      <div className="orb orb1 pointer-events-none"></div>
      <div className="orb orb2 pointer-events-none"></div>

      <div className="relative z-10 w-full max-w-[460px] rounded-[32px] bg-[#1E1E1E] border border-[#3E3E42] p-8 md:p-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#007ACC] to-[#0062A3] border border-[#3E3E42] flex items-center justify-center">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M2 12L22 4L14 22L11 14L2 12Z" fill="white"/>
            </svg>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#D4D4D4] mb-2">Forgot Password</h2>
          <p className="text-xs text-[#CCCCCC]">
            Enter your email to receive a secure password recovery link.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          {/* Error Message */}
          {state?.error && (
            <div className="flex items-center gap-2 text-xs text-[#E5484D] bg-[#E5484D]/8 p-3.5 rounded-sm shadow-sm border border-[#E5484D]/10">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Success Message */}
          {state?.success && (
            <div className="flex items-center gap-2 text-xs text-[#4EC9B0] bg-[#4EC9B0]/8 p-3.5 rounded-sm shadow-sm border border-[#4EC9B0]/10">
              <Check className="w-4.5 h-4.5 shrink-0" />
              <span>{state.success}</span>
            </div>
          )}

          {/* Email input field */}
          <div>
            <label htmlFor="email" className="block text-[10px] font-bold text-[#CCCCCC] uppercase tracking-wider mb-2">
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
                className="border-none bg-transparent outline-none w-full py-3.5 text-xs text-[#D4D4D4]"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className={`w-full py-4 rounded-sm font-bold text-xs text-white bg-gradient-to-br from-[#007ACC] to-[#0062A3] border border-[#3E3E42] hover:border-[#555555] active:translate-y-0.5 transition-all duration-150 flex items-center justify-center gap-2 ${
              isPending ? 'opacity-85 pointer-events-none' : ''
            }`}
          >
            {isPending && <span className="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin-custom"></span>}
            <span>{isPending ? 'Sending...' : 'Send Recovery Link'}</span>
          </button>
        </form>

        <div className="text-center mt-8">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#007ACC] hover:text-[#0062A3] group transition-all">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  )
}
