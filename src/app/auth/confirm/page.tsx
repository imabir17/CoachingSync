'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ShieldCheck, ShieldAlert, Loader2 } from 'lucide-react'

function ConfirmPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying')
  const [errorMessage, setErrorMessage] = useState('')

  useEffect(() => {
    const verify = async () => {
      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')
      const next = searchParams.get('next') ?? '/update-password'

      if (!token_hash || !type) {
        setStatus('error')
        setErrorMessage('Invalid verification link')
        return
      }

      const supabase = createClient()
      
      const { error } = await supabase.auth.verifyOtp({
        type: type as any,
        token_hash,
      })

      if (error) {
        console.error('Verification error:', error)
        setStatus('error')
        setErrorMessage(error.message)
      } else {
        setStatus('success')
        // Short delay for visual feedback, then redirect
        setTimeout(() => {
          router.replace(next)
        }, 1200)
      }
    }

    verify()
  }, [searchParams, router])

  return (
    <div className="w-full max-w-[420px] bg-[#F2EFE6] border border-[rgba(22,36,31,0.13)] rounded-[32px] p-8 md:p-10 text-center space-y-6 animate-in fade-in duration-300 relative z-10 text-[#16241F] shadow-2xl">
      {status === 'verifying' && (
        <div className="space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#F2EFE6] border border-[rgba(22,36,31,0.13)] flex items-center justify-center mx-auto text-[#E3A72F]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-[#16241F] font-display">Verifying Link</h2>
          <p className="text-[#3A4B44] text-xs font-semibold leading-relaxed">
            Please wait a moment while we verify your secure access token...
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#5FA779]/10 border border-[#5FA779]/20 flex items-center justify-center mx-auto text-[#5FA779]">
            <ShieldCheck className="h-8 w-8 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold text-[#16241F] font-display">Verified Successfully</h2>
          <p className="text-[#3A4B44] text-xs font-semibold leading-relaxed">
            Secure session established. Redirecting you to your workspace destination...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-5">
          <div className="w-16 h-16 rounded-full bg-[#D6584A]/10 border border-[#D6584A]/20 flex items-center justify-center mx-auto text-[#D6584A]">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-[#16241F] font-display">Verification Failed</h2>
          <p className="text-[#D6584A] text-xs font-bold leading-relaxed">
            {errorMessage || 'The verification link is invalid or has expired.'}
          </p>
          <button 
            onClick={() => router.replace('/login')}
            className="w-full py-4 bg-[#E3A72F] hover:bg-[#C4880E] text-[#16241F] text-xs font-bold rounded-md border border-[rgba(22,36,31,0.13)] active:translate-y-0.5 transition-all shadow-sm"
          >
            Go to Login
          </button>
        </div>
      )}
    </div>
  )
}

export default function AuthConfirmPage() {
  return (
    <div className="min-h-screen bg-[#F3F1E8] flex flex-col justify-center items-center p-6 text-[#16241F] relative overflow-hidden font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800;900&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');

        :root {
          --bg: #F3F1E8;
          --ink-900: #16241F;
          --paper: #F3F1E8;
          --chalk: #F2EFE6;
          --gold: #E3A72F;
          --gold-deep: #C4880E;
          --green: #5FA779;
          --red: #D6584A;
        }

        body {
          background: var(--bg);
          color: var(--ink-900);
          font-family: 'IBM Plex Sans', sans-serif;
        }

        h2 { 
          font-family: 'Archivo', sans-serif; 
          letter-spacing: -0.02em; 
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(75px);
          opacity: .18;
          z-index: 0;
        }

        .orb1 {
          width: 350px;
          height: 350px;
          background: var(--gold);
          top: -100px;
          left: -80px;
          animation: drift 15s ease-in-out infinite;
        }

        .orb2 {
          width: 300px;
          height: 300px;
          background: var(--green);
          bottom: -100px;
          right: -80px;
          animation: drift 18s ease-in-out infinite reverse;
        }

        @keyframes drift {
          0%, 100% { transform: translate(0,0); }
          50% { transform: translate(25px,-20px); }
        }
      `}</style>

      {/* Orbs */}
      <div className="orb orb1 pointer-events-none"></div>
      <div className="orb orb2 pointer-events-none"></div>

      <Suspense fallback={
        <div className="w-full max-w-[420px] bg-[#F2EFE6] border border-[rgba(22,36,31,0.13)] rounded-[32px] p-8 md:p-10 text-center space-y-5 animate-in fade-in duration-200 relative z-10 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-[#F2EFE6] border border-[rgba(22,36,31,0.13)] flex items-center justify-center mx-auto text-[#E3A72F]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-[#16241F] font-display">Loading Verification...</h2>
        </div>
      }>
        <ConfirmPageContent />
      </Suspense>
    </div>
  )
}
