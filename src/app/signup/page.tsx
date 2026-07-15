'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff, Check, AlertCircle, Building, User } from 'lucide-react'

export default function SignupPage() {
  const [companyName, setCompanyName] = useState('')
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsPending(true)
    setError('')
    setSuccess('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.')
      setIsPending(false)
      return
    }

    try {
      const supabase = createClient()
      
      const siteUrl = window.location.origin

      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${siteUrl}/onboarding/complete`,
          data: { 
            fullName, 
            pendingCompanyName: companyName 
          }
        }
      })

      if (signupError) {
        setError(signupError.message)
      } else if (data.user) {
        setSuccess('Account created! Please check your email to verify your registration and complete onboarding.')
      } else {
        setError('Signup failed. Please try again.')
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.')
    } finally {
      setIsPending(false)
    }
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
                Launch your center's workspace.
              </h2>
              <p className="text-xs text-[rgba(242,239,230,0.72)] max-w-[280px] leading-relaxed">
                Empower your managers and counselors, simplify lead tracking, and accelerate student enrollments.
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
                  <span className="text-[9px] font-mono text-[#324B41]">LEAD #4092</span>
                  <span className="text-[8px] font-bold px-2 py-0.5 rounded-full text-[#16241F] bg-[#5FA779]">
                    HOT
                  </span>
                </div>
                
                <div className="font-bold text-[14px] text-[#16241F] mt-4">Rafi Ahmed</div>
                <div className="text-[10px] text-[#324B41] mt-0.5">Spoken English · HSC</div>
                
                <div className="mt-auto flex gap-2">
                  <span className="text-[9px] font-semibold px-2 py-0.5 rounded-full text-[#16241F] bg-[rgba(22,36,31,0.06)]">Rating ★★★★★</span>
                </div>
              </div>
            </div>

            {/* Float tags */}
            <div className="absolute top-2 right-2 bg-[#243830] text-[#E7E4D6] px-3 py-2 rounded-md flex items-center gap-1.5 text-[11px] font-bold border border-[rgba(242,239,230,0.1)] animate-bob-1">
              <Check className="w-3.5 h-3.5 text-[#5FA779]" /> Hot Lead
            </div>
            <div className="absolute bottom-6 -left-2 bg-[#243830] text-[#E7E4D6] px-3 py-2 rounded-md flex items-center gap-1.5 text-[11px] font-bold border border-[rgba(242,239,230,0.1)] animate-bob-2">
              <AlertCircle className="w-3.5 h-3.5 text-[#E3A72F]" /> Callback
            </div>
          </div>

          <div className="text-[11px] text-[rgba(242,239,230,0.4)] font-semibold">
            © {new Date().getFullYear()} CoachingSync · Center Management System
          </div>
        </div>

        {/* RIGHT PANEL: Form Inputs */}
        <div className="p-8 md:p-12 flex flex-col justify-center bg-[#F2EFE6] text-[#16241F]">
          <div className="mb-8">
            <span className="text-[10px] font-bold font-mono text-[#C4880E] tracking-widest block mb-2">GET STARTED</span>
            <h1 className="text-2xl font-bold text-[#16241F] mb-1">Create your workspace</h1>
            <p className="text-xs text-[#3A4B44]">Register your coaching center today.</p>
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
            <form onSubmit={handleSignup} className="space-y-4">
              {/* Coaching Center Name Field */}
              <div>
                <label htmlFor="companyName" className="block text-xs font-bold text-[#3A4B44] mb-2">
                  Coaching Center Name
                </label>
                <div className="rounded-md p-1 pr-4 pl-4 bg-[#FFF] border border-[rgba(22,36,31,0.13)] flex items-center gap-3 focus-within:border-[#E3A72F] transition-all">
                  <Building className="w-4 h-4 text-[#324B41] shrink-0" />
                  <input 
                    type="text" 
                    id="companyName" 
                    placeholder="E.g. Apex Academy" 
                    required
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    className="border-none bg-transparent outline-none w-full py-3.5 text-base text-[#16241F]"
                  />
                </div>
              </div>

              {/* Full Name Field */}
              <div>
                <label htmlFor="fullName" className="block text-xs font-bold text-[#3A4B44] mb-2">
                  Your Full Name
                </label>
                <div className="rounded-md p-1 pr-4 pl-4 bg-[#FFF] border border-[rgba(22,36,31,0.13)] flex items-center gap-3 focus-within:border-[#E3A72F] transition-all">
                  <User className="w-4 h-4 text-[#324B41] shrink-0" />
                  <input 
                    type="text" 
                    id="fullName" 
                    placeholder="E.g. Rafi Ahmed" 
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="border-none bg-transparent outline-none w-full py-3.5 text-base text-[#16241F]"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-xs font-bold text-[#3A4B44] mb-2">
                  Email address
                </label>
                <div className="rounded-md p-1 pr-4 pl-4 bg-[#FFF] border border-[rgba(22,36,31,0.13)] flex items-center gap-3 focus-within:border-[#E3A72F] transition-all">
                  <Mail className="w-4 h-4 text-[#324B41] shrink-0" />
                  <input 
                    type="email" 
                    id="email" 
                    placeholder="you@coaching.com" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="border-none bg-transparent outline-none w-full py-3.5 text-base text-[#16241F]"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-xs font-bold text-[#3A4B44] mb-2">
                  Password
                </label>
                <div className="rounded-md p-1 pr-3 pl-4 bg-[#FFF] border border-[rgba(22,36,31,0.13)] flex items-center gap-3 focus-within:border-[#E3A72F] transition-all">
                  <Lock className="w-4 h-4 text-[#324B41] shrink-0" />
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    id="password" 
                    placeholder="••••••••" 
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

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={isPending}
                className={`w-full py-4 rounded-md font-bold text-xs text-[#16241F] bg-[#E3A72F] hover:bg-[#C4880E] active:translate-y-0.5 transition-all duration-150 flex items-center justify-center gap-2 shadow-sm ${
                  isPending ? 'opacity-85 pointer-events-none' : ''
                }`}
              >
                {isPending && <span className="w-4 h-4 rounded-full border-2 border-[#16241F]/40 border-t-[#16241F] animate-spin-custom"></span>}
                <span>{isPending ? 'Creating Account...' : 'Create Account'}</span>
              </button>
            </form>
          )}

          <p className="signup-note text-center mt-6 text-xs text-[#324B41]">
            Already have an account? <Link href="/login" className="font-bold text-[#C4880E] hover:underline">Sign in</Link>
          </p>
          
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
