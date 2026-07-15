'use client'

import { useActionState, useState } from 'react'
import { resetPassword } from '@/app/actions/auth'
import Link from 'next/link'
import { Mail, ArrowLeft, Check, AlertCircle } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(resetPassword, { error: '', success: '' } as any)
  const [email, setEmail] = useState('')

  return (
    <div className="min-h-screen bg-[#F3F1E8] flex items-center justify-center p-6 relative overflow-hidden font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800;900&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');

        :root {
          --ink-900: #16241F;
          --ink-700: #243830;
          --ink-600: #324B41;
          --paper: #F3F1E8;
          --paper-dim: #E7E4D6;
          --chalk: #F2EFE6;
          --gold: #E3A72F;
          --gold-deep: #C4880E;
          --green: #5FA779;
          --red: #D6584A;
          --line-light: rgba(22,36,31,0.13);
          --text-body-light: #3A4B44;
        }

        body {
          background: var(--paper);
          color: var(--ink-900);
          font-family: 'IBM Plex Sans', sans-serif;
        }

        h2 { 
          font-family: 'Archivo', sans-serif; 
          letter-spacing: -0.01em; 
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-spin-custom {
          animation: spin .7s linear infinite;
        }
      `}</style>

      <div className="relative z-10 w-full max-w-[460px] rounded-[24px] bg-[#F2EFE6] border border-[rgba(22,36,31,0.13)] p-8 md:p-10 shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-500">
        
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="w-10 h-10 rounded-[8px] bg-[#E3A72F] flex items-center justify-center">
            <span className="dot" style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#16241F', transform: 'rotate(45deg)' }}></span>
          </div>
        </div>

        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-[#16241F] mb-2">Forgot Password</h2>
          <p className="text-xs text-[#3A4B44]">
            Enter your email to receive a secure password recovery link.
          </p>
        </div>

        <form action={formAction} className="space-y-5">
          {/* Error Message */}
          {state?.error && (
            <div className="flex items-center gap-2 text-xs text-[#D6584A] bg-[#D6584A]/10 p-3.5 rounded-md shadow-sm border border-[#D6584A]/20">
              <AlertCircle className="w-4.5 h-4.5 shrink-0" />
              <span>{state.error}</span>
            </div>
          )}

          {/* Success Message */}
          {state?.success && (
            <div className="flex items-center gap-2 text-xs text-[#5FA779] bg-[#5FA779]/10 p-3.5 rounded-md shadow-sm border border-[#5FA779]/20">
              <Check className="w-4.5 h-4.5 shrink-0" />
              <span>{state.success}</span>
            </div>
          )}

          {/* Email input field */}
          <div>
            <label htmlFor="email" className="block text-[10px] font-bold text-[#3A4B44] uppercase tracking-wider mb-2">
              Email address
            </label>
            <div className="rounded-md p-1 pr-4 pl-4 bg-[#FFF] border border-[rgba(22,36,31,0.13)] flex items-center gap-3 focus-within:border-[#E3A72F] transition-all">
              <Mail className="w-4 h-4 text-[#324B41] shrink-0" />
              <input 
                type="email" 
                id="email" 
                name="email"
                placeholder="you@coaching.com" 
                autoComplete="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-none bg-transparent outline-none w-full py-3.5 text-xs text-[#16241F]"
              />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={isPending}
            className={`w-full py-4 rounded-md font-bold text-xs text-[#16241F] bg-[#E3A72F] hover:bg-[#C4880E] active:translate-y-0.5 transition-all duration-150 flex items-center justify-center gap-2 shadow-sm ${
              isPending ? 'opacity-85 pointer-events-none' : ''
            }`}
          >
            {isPending && <span className="w-4 h-4 rounded-full border-2 border-[#16241F]/40 border-t-[#16241F] animate-spin-custom"></span>}
            <span>{isPending ? 'Sending...' : 'Send Recovery Link'}</span>
          </button>
        </form>

        <div className="text-center mt-8">
          <Link href="/login" className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C4880E] hover:underline group transition-all">
            <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  )
}
