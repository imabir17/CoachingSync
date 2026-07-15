'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { provisionCompany } from '@/app/actions/auth'
import { Check, Loader2, AlertCircle } from 'lucide-react'

export default function OnboardingCompletePage() {
  const router = useRouter()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    let active = true

    async function runProvision() {
      try {
        const res = await provisionCompany()
        if (!active) return

        setStatus('success')
        // Give the user a brief moment to see the success state
        setTimeout(() => {
          router.replace('/dashboard')
        }, 1500)
      } catch (err: any) {
        if (!active) return
        setStatus('error')
        setErrorMsg(err.message || 'Failed to set up workspace.')
        console.error('Provisioning error:', err)
      }
    }

    runProvision()

    return () => {
      active = false
    }
  }, [router])

  return (
    <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-6 relative font-sans text-[#D4D4D4]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        body {
          background: #1E1E1E;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        h2 {
          font-family: 'Space Grotesk', sans-serif;
        }
      `}</style>

      <div className="w-full max-w-md p-8 rounded-2xl bg-[#1E1E1E] border border-[#3E3E42] text-center shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#007ACC] rounded-full filter blur-xl opacity-20 pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-[#4EC9B0] rounded-full filter blur-xl opacity-20 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-[#007ACC] animate-spin mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">Setting up your workspace...</h2>
              <p className="text-xs text-[#858585] max-w-[280px]">
                We are provisioning your secure agency database and setting up your administrator privileges.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 rounded-full bg-[#4EC9B0]/10 border border-[#4EC9B0]/20 flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-[#4EC9B0]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Workspace ready!</h2>
              <p className="text-xs text-[#858585] max-w-[280px]">
                Your account is verified and company profile is created. Redirecting you to the dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 rounded-full bg-[#E5484D]/10 border border-[#E5484D]/20 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-[#E5484D]" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Provisioning Failed</h2>
              <p className="text-xs text-[#E5484D] mb-4 max-w-[280px]">
                {errorMsg}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-xs font-bold text-white bg-gradient-to-br from-[#007ACC] to-[#0062A3] rounded-sm border border-[#3E3E42] hover:border-[#555555] active:translate-y-0.5 transition-all"
              >
                Retry Setup
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
