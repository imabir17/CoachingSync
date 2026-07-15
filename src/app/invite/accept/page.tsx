'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { acceptInvite, verifyInviteToken } from '@/app/actions/staff'
import Link from 'next/link'
import { Lock, Eye, EyeOff, Check, AlertCircle, User, Loader2 } from 'lucide-react'

function AcceptInviteForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [fullName, setFullName] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)

  const [checkingInvite, setCheckingInvite] = useState(true)
  const [inviteError, setInviteError] = useState('')
  const [inviteDetails, setInviteDetails] = useState<{ email: string; role: string } | null>(null)

  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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

  // Verify the invite token on mount
  useEffect(() => {
    async function verify() {
      if (!token) {
        setInviteError('No invitation token was provided. Please request a new invite link.')
        setCheckingInvite(false)
        return
      }

      try {
        const details = await verifyInviteToken(token)
        setInviteDetails(details)
      } catch (err: any) {
        setInviteError(err.message || 'Invalid or expired invitation token.')
      } finally {
        setCheckingInvite(false)
      }
    }

    verify()
  }, [token])

  const handleAccept = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setError('')
    setSuccess('')

    if (!token) {
      setError('Invitation token is missing.')
      setIsPending(false)
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      setIsPending(false)
      return
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      setIsPending(false)
      return
    }

    try {
      const res = await acceptInvite(token, password, fullName)
      if (res.success) {
        setSuccess('Invitation accepted successfully!')
        
        // Log in the user automatically if possible, or redirect to login page
        // Wait, acceptInvite creates the auth user in Supabase.
        // We will redirect to /login with a message so they can log in cleanly.
        setTimeout(() => {
          router.replace(`/login?message=Invitation accepted! Please sign in with email: ${inviteDetails?.email}`)
        }, 1500)
      }
    } catch (err: any) {
      setError(err.message || 'Failed to accept invitation.')
    } finally {
      setIsPending(false)
    }
  }

  if (checkingInvite) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-6 text-[#D4D4D4] font-sans">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#007ACC] animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold">Verifying invitation...</h2>
        </div>
      </div>
    )
  }

  if (inviteError) {
    return (
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-6 text-[#D4D4D4] font-sans">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#1E1E1E] border border-[#3E3E42] text-center shadow-2xl relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-[#E5484D]/10 border border-[#E5484D]/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-[#E5484D]" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Invitation Error</h2>
          <p className="text-xs text-[#E5484D] mb-6">
            {inviteError}
          </p>
          <Link
            href="/login"
            className="inline-block px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-br from-[#007ACC] to-[#0062A3] rounded-sm border border-[#3E3E42] hover:border-[#555555] active:translate-y-0.5 transition-all"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    )
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
                Join your team workspace.
              </h2>
              <p className="text-xs text-[#CCCCCC] max-w-[280px] leading-relaxed">
                Accept this invitation to start managing student applications and collaborating with your team in real time.
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
                  <span className="text-[9px] font-mono text-[#858585]">INVITATION</span>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded-full text-white bg-gradient-to-br from-[#21C285] to-[#159a68]">
                    {inviteDetails?.role}
                  </span>
                </div>
                
                <div className="font-bold text-[14px] text-[#D4D4D4] mt-4">{fullName || 'Your Name'}</div>
                <div className="text-[10px] text-[#858585] mt-0.5">{inviteDetails?.email}</div>
                
                <div className="mt-auto flex gap-2">
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-[#CCCCCC] bg-[#1E1E1E] border border-[#3E3E42]">Pending</span>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-[#CCCCCC] bg-[#1E1E1E] border border-[#3E3E42]">Invite Setup</span>
                </div>
              </div>
            </div>

            {/* Float tags */}
            <div className="absolute top-2 right-2 bg-[#1E1E1E] px-3 py-2 rounded-sm flex items-center gap-1.5 text-[11px] font-bold text-[#D4D4D4] border border-[#3E3E42] animate-bob-1">
              <Check className="w-3.5 h-3.5 text-[#4EC9B0]" /> Invited
            </div>
            <div className="absolute bottom-6 -left-2 bg-[#1E1E1E] px-3 py-2 rounded-sm flex items-center gap-1.5 text-[11px] font-bold text-[#D4D4D4] border border-[#3E3E42] animate-bob-2">
              <User className="w-3.5 h-3.5 text-[#CE9178]" /> Team Member
            </div>
          </div>

          <div className="text-[11px] text-[#858585] font-semibold">
            © {new Date().getFullYear()} CoachingSync · Student Recruitment CRM
          </div>
        </div>

        {/* RIGHT PANEL: Form Inputs */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-[#1E1E1E]">
          <div className="mb-8">
            <span className="text-[10px] font-bold font-mono text-[#4EC9B0] tracking-widest block mb-2">JOIN WORKSPACE</span>
            <h1 className="text-2xl font-bold text-[#D4D4D4] mb-1">Accept Invitation</h1>
            <p className="text-xs text-[#CCCCCC]">Setup your profile details and credential credentials.</p>
          </div>

          {/* Success Message Box */}
          {success && (
            <div className="flex items-start gap-2.5 text-xs text-[#4EC9B0] bg-[#4EC9B0]/8 p-3 rounded-sm mb-6 shadow-sm border border-[#4EC9B0]/10">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Error Message Box */}
          {error && (
            <div className="flex items-center gap-2.5 text-xs text-[#E5484D] bg-[#E5484D]/8 p-3 rounded-sm mb-6 shadow-sm border border-[#E5484D]/10">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleAccept} className="space-y-4">
              {/* Email (Read Only Visual) */}
              <div>
                <label className="block text-xs font-bold text-[#CCCCCC] mb-2">
                  Invited Email
                </label>
                <div className="rounded-sm p-4 bg-[#252526] border border-[#3E3E42] text-xs font-semibold text-[#858585]">
                  {inviteDetails?.email}
                </div>
              </div>

              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-xs font-bold text-[#CCCCCC] mb-2">
                  Your Full Name
                </label>
                <div className="rounded-sm p-1 pr-4 pl-4 bg-[#1E1E1E] border border-[#3E3E42] flex items-center gap-3 focus-within:border border-[#3E3E42] transition-all">
                  <User className="w-4 h-4 text-[#858585] shrink-0" />
                  <input 
                    type="text" 
                    id="fullName" 
                    placeholder="E.g. Fahim Shahriar" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-none bg-transparent outline-none w-full py-3.5 text-base text-[#D4D4D4]"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-[#CCCCCC] mb-2">
                  Create Password
                </label>
                <div className="rounded-sm p-1 pr-3 pl-4 bg-[#1E1E1E] border border-[#3E3E42] flex items-center gap-3 focus-within:border border-[#3E3E42] transition-all">
                  <Lock className="w-4 h-4 text-[#858585] shrink-0" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="password" 
                    placeholder="Minimum 6 characters" 
                    autoComplete="new-password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-none bg-transparent outline-none w-full py-3.5 text-base text-[#D4D4D4]"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-[#858585] hover:text-[#D4D4D4] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#CCCCCC] mb-2">
                  Confirm Password
                </label>
                <div className="rounded-sm p-1 pr-3 pl-4 bg-[#1E1E1E] border border-[#3E3E42] flex items-center gap-3 focus-within:border border-[#3E3E42] transition-all">
                  <Lock className="w-4 h-4 text-[#858585] shrink-0" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="confirmPassword" 
                    placeholder="Repeat password" 
                    autoComplete="new-password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-none bg-transparent outline-none w-full py-3.5 text-base text-[#D4D4D4]"
                  />
                </div>
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
                <span>{isPending ? 'Accepting Invite...' : 'Accept Invite'}</span>
              </button>
            </form>
          )}

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

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#1E1E1E] flex items-center justify-center p-6 text-[#D4D4D4] font-sans">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#007ACC] animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold">Loading invitation...</h2>
        </div>
      </div>
    }>
      <AcceptInviteForm />
    </Suspense>
  )
}
