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
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

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
      <div className="min-h-screen bg-[#F3F1E8] flex items-center justify-center p-6 text-[#16241F] font-sans">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#E3A72F] animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold">Verifying invitation...</h2>
        </div>
      </div>
    )
  }

  if (inviteError) {
    return (
      <div className="min-h-screen bg-[#F3F1E8] flex items-center justify-center p-6 text-[#16241F] font-sans">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[#F2EFE6] border border-[rgba(22,36,31,0.13)] text-center shadow-2xl relative overflow-hidden">
          <div className="w-12 h-12 rounded-full bg-[#D6584A]/10 border border-[#D6584A]/20 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6 text-[#D6584A]" />
          </div>
          <h2 className="text-xl font-bold text-[#16241F] mb-2">Invitation Error</h2>
          <p className="text-xs text-[#D6584A] mb-6">
            {inviteError}
          </p>
          <Link
            href="/login"
            className="inline-block px-5 py-2.5 text-xs font-bold text-[#16241F] bg-[#E3A72F] hover:bg-[#C4880E] rounded-md shadow-sm active:translate-y-0.5 transition-all"
          >
            Back to Sign In
          </Link>
        </div>
      </div>
    )
  }

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

        h1, h2, h3 { 
          font-family: 'Archivo', sans-serif; 
          letter-spacing: -0.01em; 
          line-height: 1.1;
        }

        .mono { 
          font-family: 'IBM Plex Mono', monospace; 
        }

        @keyframes bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }

        .animate-bob-1 { animation: bob 5s ease-in-out infinite; }
        .animate-bob-2 { animation: bob 5s ease-in-out infinite 1.4s; }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .animate-spin-custom {
          animation: spin .7s linear infinite;
        }
      `}</style>

      {/* Main container shell */}
      <div className="relative z-10 w-full max-w-[920px] grid grid-cols-1 md:grid-cols-2 rounded-[24px] bg-[#F2EFE6] border border-[rgba(22,36,31,0.13)] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-500">
        
        {/* LEFT PANEL: Branding & Visuals */}
        <div className="hidden md:flex p-12 bg-[#16241F] flex-col justify-between relative text-[#F2EFE6]">
          <div>
            <div className="flex items-center gap-2.5 font-bold text-[#F2EFE6] text-lg">
              <div className="w-9 h-9 rounded-[8px] bg-[#E3A72F] flex items-center justify-center">
                <span className="dot" style={{ width: '9px', height: '9px', borderRadius: '2px', background: '#16241F', transform: 'rotate(45deg)' }}></span>
              </div>
              CoachingSync
            </div>
            
            <div className="mt-10">
              <h2 className="text-[26px] font-bold text-[#F2EFE6] leading-[1.25] mb-3.5">
                Join your team workspace.
              </h2>
              <p className="text-xs text-[rgba(242,239,230,0.72)] max-w-[280px] leading-relaxed">
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
              className="w-56 h-36 rounded-[12px] bg-[#243830] border border-[rgba(242,239,230,0.1)] relative transform-style-preserve-3d transition-transform duration-100 ease-out p-4 pointer-events-auto shadow-xl"
              style={{
                transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) translateZ(0)`
              }}
            >
              {/* Inner depth layer */}
              <div className="absolute inset-2.5 rounded-[8px] bg-gradient-to-br from-[#F2EFE6] to-[#E7E4D6] border border-[rgba(22,36,31,0.1)] pointer-events-none"></div>

              <div className="relative z-10 h-full flex flex-col transform translate-z-[24px] text-[#16241F]">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] font-mono text-[#324B41]">INVITATION</span>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded-full text-[#16241F] bg-[#E3A72F]">
                    {inviteDetails?.role}
                  </span>
                </div>
                
                <div className="font-bold text-[14px] text-[#16241F] mt-4">{fullName || 'Your Name'}</div>
                <div className="text-[10px] text-[#324B41] mt-0.5">{inviteDetails?.email}</div>
                
                <div className="mt-auto flex gap-2">
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-[#16241F] bg-[rgba(22,36,31,0.06)]">Pending</span>
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-[#16241F] bg-[rgba(22,36,31,0.06)]">Invite Setup</span>
                </div>
              </div>
            </div>

            {/* Float tags */}
            <div className="absolute top-2 right-2 bg-[#243830] text-[#E7E4D6] px-3 py-2 rounded-md flex items-center gap-1.5 text-[11px] font-bold border border-[rgba(242,239,230,0.1)] animate-bob-1">
              <Check className="w-3.5 h-3.5 text-[#5FA779]" /> Invited
            </div>
            <div className="absolute bottom-6 -left-2 bg-[#243830] text-[#E7E4D6] px-3 py-2 rounded-md flex items-center gap-1.5 text-[11px] font-bold border border-[rgba(242,239,230,0.1)] animate-bob-2">
              <User className="w-3.5 h-3.5 text-[#E3A72F]" /> Team Member
            </div>
          </div>

          <div className="text-[11px] text-[rgba(242,239,230,0.4)] font-semibold">
            © {new Date().getFullYear()} CoachingSync · Center Management System
          </div>
        </div>

        {/* RIGHT PANEL: Form Inputs */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-[#F2EFE6] text-[#16241F]">
          <div className="mb-8">
            <span className="text-[10px] font-bold font-mono text-[#C4880E] tracking-widest block mb-2">JOIN WORKSPACE</span>
            <h1 className="text-2xl font-bold text-[#16241F] mb-1">Accept Invitation</h1>
            <p className="text-xs text-[#3A4B44]">Setup your profile details and create your credentials.</p>
          </div>

          {/* Success Message Box */}
          {success && (
            <div className="flex items-start gap-2.5 text-xs text-[#5FA779] bg-[#5FA779]/10 p-3.5 rounded-md mb-6 border border-[#5FA779]/20 shadow-sm">
              <Check className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{success}</span>
            </div>
          )}

          {/* Error Message Box */}
          {error && (
            <div className="flex items-center gap-2.5 text-xs text-[#D6584A] bg-[#D6584A]/10 p-3.5 rounded-md mb-6 border border-[#D6584A]/20">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {!success && (
            <form onSubmit={handleAccept} className="space-y-4">
              {/* Email (Read Only Visual) */}
              <div>
                <label className="block text-xs font-bold text-[#3A4B44] mb-2">
                  Invited Email
                </label>
                <div className="rounded-md p-4 bg-[#FFF] border border-[rgba(22,36,31,0.13)] text-xs font-semibold text-[#324B41]">
                  {inviteDetails?.email}
                </div>
              </div>

              {/* Your Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-xs font-bold text-[#3A4B44] mb-2">
                  Your Full Name
                </label>
                <div className="rounded-md p-1 pr-4 pl-4 bg-[#FFF] border border-[rgba(22,36,31,0.13)] flex items-center gap-3 focus-within:border-[#E3A72F] transition-all">
                  <User className="w-4 h-4 text-[#324B41] shrink-0" />
                  <input 
                    type="text" 
                    id="fullName" 
                    placeholder="E.g. Fahim Shahriar" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-none bg-transparent outline-none w-full py-3.5 text-base text-[#16241F]"
                  />
                </div>
              </div>

              {/* Create Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-[#3A4B44] mb-2">
                  Create Password
                </label>
                <div className="rounded-md p-1 pr-3 pl-4 bg-[#FFF] border border-[rgba(22,36,31,0.13)] flex items-center gap-3 focus-within:border-[#E3A72F] transition-all">
                  <Lock className="w-4 h-4 text-[#324B41] shrink-0" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="password" 
                    placeholder="Minimum 6 characters" 
                    autoComplete="new-password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="border-none bg-transparent outline-none w-full py-3.5 text-base text-[#16241F]"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="p-1 text-[#324B41] hover:text-[#16241F] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-bold text-[#3A4B44] mb-2">
                  Confirm Password
                </label>
                <div className="rounded-md p-1 pr-3 pl-4 bg-[#FFF] border border-[rgba(22,36,31,0.13)] flex items-center gap-3 focus-within:border-[#E3A72F] transition-all">
                  <Lock className="w-4 h-4 text-[#324B41] shrink-0" />
                  <input 
                    type={showConfirmPassword ? 'text' : 'password'} 
                    id="confirmPassword" 
                    placeholder="Repeat password" 
                    autoComplete="new-password" 
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="border-none bg-transparent outline-none w-full py-3.5 text-base text-[#16241F]"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="p-1 text-[#324B41] hover:text-[#16241F] transition-colors"
                    aria-label={showConfirmPassword ? 'Hide confirmed password' : 'Show confirmed password'}
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isPending}
                className={`w-full py-4 rounded-md font-bold text-xs text-[#16241F] bg-[#E3A72F] hover:bg-[#C4880E] active:translate-y-0.5 transition-all duration-150 flex items-center justify-center gap-2 shadow-sm ${
                  isPending ? 'opacity-85 pointer-events-none' : ''
                }`}
              >
                {isPending && <span className="w-4 h-4 rounded-full border-2 border-[#16241F]/40 border-t-[#16241F] animate-spin-custom"></span>}
                <span>{isPending ? 'Accepting Invite...' : 'Accept Invite'}</span>
              </button>
            </form>
          )}

          <div className="flex justify-center items-center gap-4 mt-8 text-[10px] text-[#324B41]">
            <Link href="/privacy" className="hover:underline transition-colors">Privacy Policy</Link>
            <span>•</span>
            <Link href="/terms" className="hover:underline transition-colors">Terms & Conditions</Link>
          </div>
        </div>

      </div>
    </div>
  )
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#F3F1E8] flex items-center justify-center p-6 text-[#16241F] font-sans">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#E3A72F] animate-spin mx-auto mb-4" />
          <h2 className="text-lg font-bold">Loading invitation...</h2>
        </div>
      </div>
    }>
      <AcceptInviteForm />
    </Suspense>
  )
}
