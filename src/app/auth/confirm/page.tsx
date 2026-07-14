'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { ShieldCheck, ShieldAlert, Loader2, RefreshCw } from 'lucide-react'

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
    <div className="w-full max-w-[420px] bg-[#1E1E1E] border border-[#3E3E42] rounded-[32px] p-8 md:p-10 text-center space-y-6 animate-in fade-in duration-300 relative z-10">
      {status === 'verifying' && (
        <div className="space-y-5">
          <div className="w-16 h-16 rounded-md bg-[#1E1E1E] border border-[#3E3E42] flex items-center justify-center mx-auto text-[#007ACC]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-[#D4D4D4] font-display">Verifying Link</h2>
          <p className="text-[#CCCCCC] text-xs font-semibold leading-relaxed">
            Please wait a moment while we verify your secure access token...
          </p>
        </div>
      )}

      {status === 'success' && (
        <div className="space-y-5">
          <div className="w-16 h-16 rounded-md bg-[#1E1E1E] border border-[#3E3E42] flex items-center justify-center mx-auto text-[#4EC9B0]">
            <ShieldCheck className="h-8 w-8 animate-bounce" />
          </div>
          <h2 className="text-xl font-bold text-[#D4D4D4] font-display">Verified Successfully</h2>
          <p className="text-[#CCCCCC] text-xs font-semibold leading-relaxed">
            Secure session established. Redirecting you to your workspace destination...
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="space-y-5">
          <div className="w-16 h-16 rounded-md bg-[#1E1E1E] border border-[#3E3E42] flex items-center justify-center mx-auto text-[#E5484D]">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h2 className="text-xl font-bold text-[#D4D4D4] font-display">Verification Failed</h2>
          <p className="text-[#E5484D] text-xs font-bold leading-relaxed">
            {errorMessage || 'The verification link is invalid or has expired.'}
          </p>
          <button 
            onClick={() => router.replace('/login')}
            className="w-full py-4 bg-gradient-to-br from-[#007ACC] to-[#0062A3] text-white text-xs font-bold rounded-sm border border-[#3E3E42] hover:border border-[#3E3E42] active:translate-y-0.5 transition-all"
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
    <div className="min-h-screen bg-[#1E1E1E] flex flex-col justify-center items-center p-6 text-[#D4D4D4] relative overflow-hidden font-sans">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

        :root {
          --bg: #1E1E1E;
          --shadow-dark: #111317;
          --shadow-light: #252A31;
          --text-1: #D4D4D4;
          --text-2: #CCCCCC;
          --accent: #007ACC;
          --teal: #4EC9B0;
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
      `}</style>

      {/* Orbs */}
      <div className="orb orb1 pointer-events-none"></div>
      <div className="orb orb2 pointer-events-none"></div>

      <Suspense fallback={
        <div className="w-full max-w-[420px] bg-[#1E1E1E] border border-[#3E3E42] rounded-[32px] p-8 md:p-10 text-center space-y-5 animate-in fade-in duration-200 relative z-10">
          <div className="w-16 h-16 rounded-md bg-[#1E1E1E] border border-[#3E3E42] flex items-center justify-center mx-auto text-[#007ACC]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-[#D4D4D4] font-display">Loading Verification...</h2>
        </div>
      }>
        <ConfirmPageContent />
      </Suspense>
    </div>
  )
}
