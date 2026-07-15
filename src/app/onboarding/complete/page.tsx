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
    <div className="min-h-screen bg-[#F3F1E8] flex items-center justify-center p-6 relative font-sans text-[#16241F]">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500;700;800;900&family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
        
        body {
          background: #F3F1E8;
          font-family: 'IBM Plex Sans', sans-serif;
        }

        h2 {
          font-family: 'Archivo', sans-serif;
        }
      `}</style>

      <div className="w-full max-w-md p-8 rounded-[24px] bg-[#F2EFE6] border border-[rgba(22,36,31,0.13)] text-center shadow-2xl relative overflow-hidden">
        {/* Glow decoration */}
        <div className="absolute -top-12 -left-12 w-24 h-24 bg-[#E3A72F] rounded-full filter blur-xl opacity-10 pointer-events-none"></div>
        <div className="absolute -bottom-12 -right-12 w-24 h-24 bg-[#5FA779] rounded-full filter blur-xl opacity-10 pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          {status === 'loading' && (
            <>
              <Loader2 className="w-12 h-12 text-[#E3A72F] animate-spin mb-4" />
              <h2 className="text-xl font-bold text-[#16241F] mb-2">Setting up your workspace...</h2>
              <p className="text-xs text-[#3A4B44] max-w-[280px]">
                We are provisioning your secure center database and setting up your administrator privileges.
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="w-12 h-12 rounded-full bg-[#5FA779]/10 border border-[#5FA779]/20 flex items-center justify-center mb-4">
                <Check className="w-6 h-6 text-[#5FA779]" />
              </div>
              <h2 className="text-xl font-bold text-[#16241F] mb-2">Workspace ready!</h2>
              <p className="text-xs text-[#3A4B44] max-w-[280px]">
                Your account is verified and company profile is created. Redirecting you to the dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="w-12 h-12 rounded-full bg-[#D6584A]/10 border border-[#D6584A]/20 flex items-center justify-center mb-4">
                <AlertCircle className="w-6 h-6 text-[#D6584A]" />
              </div>
              <h2 className="text-xl font-bold text-[#16241F] mb-2">Provisioning Failed</h2>
              <p className="text-xs text-[#D6584A] mb-4 max-w-[280px]">
                {errorMsg}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-xs font-bold text-[#16241F] bg-[#E3A72F] hover:bg-[#C4880E] rounded-md shadow-sm border border-[rgba(22,36,31,0.13)] active:translate-y-0.5 transition-all"
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
