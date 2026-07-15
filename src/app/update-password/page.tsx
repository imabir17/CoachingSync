'use client'

import { useActionState, useState } from 'react'
import { updatePassword } from '@/app/actions/auth'
import { ShieldAlert, ShieldCheck, Shield, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import Link from 'next/link'

export default function UpdatePasswordPage() {
  const [state, formAction, isPending] = useActionState(updatePassword, { error: '' })
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const getPasswordStrength = () => {
    if (password.length === 0) return { label: 'None', color: 'text-[#324B41]', icon: <Shield className="w-4 h-4" /> }
    if (password.length < 6) return { label: 'Weak', color: 'text-[#D6584A]', icon: <ShieldAlert className="w-4 h-4" /> }
    if (password.length < 10) return { label: 'Fair', color: 'text-[#C4880E]', icon: <Shield className="w-4 h-4" /> }
    
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)
    
    const criteriaCount = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length
    
    if (criteriaCount >= 3) return { label: 'Strong', color: 'text-[#5FA779]', icon: <ShieldCheck className="w-4 h-4" /> }
    return { label: 'Good', color: 'text-[#5FA779]', icon: <Shield className="w-4 h-4" /> }
  }

  const strength = getPasswordStrength()

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
          <h2 className="text-2xl font-bold text-[#16241F] mb-2">Set New Password</h2>
          <p className="text-xs text-[#3A4B44]">
            Please enter a secure, strong password for your user account.
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

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-[10px] font-bold text-[#3A4B44] uppercase tracking-wider mb-2">
              New Password
            </label>
            <div className="rounded-md p-1 pr-3 pl-4 bg-[#FFF] border border-[rgba(22,36,31,0.13)] flex items-center gap-3 focus-within:border-[#E3A72F] transition-all">
              <Lock className="w-4 h-4 text-[#324B41] shrink-0" />
              <input 
                type={showPassword ? 'text' : 'password'} 
                id="password" 
                name="password"
                placeholder="••••••••" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-none bg-transparent outline-none w-full py-3.5 text-xs text-[#16241F]"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-[#324B41] hover:text-[#16241F] transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            
            {/* Password strength indicators */}
            <div className="mt-2.5 flex items-center justify-between text-[10px] font-bold">
              <div className={`flex items-center gap-1.5 ${strength.color}`}>
                {strength.icon} {strength.label} Strength
              </div>
              {password.length > 0 && password.length < 6 && (
                <span className="text-[#D6584A]">At least 6 characters required</span>
              )}
            </div>
          </div>

          {/* Confirm Password Field */}
          <div>
            <label htmlFor="confirmPassword" className="block text-[10px] font-bold text-[#3A4B44] uppercase tracking-wider mb-2">
              Confirm Password
            </label>
            <div className="rounded-md p-1 pr-3 pl-4 bg-[#FFF] border border-[rgba(22,36,31,0.13)] flex items-center gap-3 focus-within:border-[#E3A72F] transition-all">
              <Lock className="w-4 h-4 text-[#324B41] shrink-0" />
              <input 
                type={showConfirmPassword ? 'text' : 'password'} 
                id="confirmPassword" 
                name="confirmPassword"
                placeholder="••••••••" 
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="border-none bg-transparent outline-none w-full py-3.5 text-xs text-[#16241F]"
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

          <button 
            type="submit" 
            disabled={isPending}
            className={`w-full py-4 rounded-md font-bold text-xs text-[#16241F] bg-[#E3A72F] hover:bg-[#C4880E] active:translate-y-0.5 transition-all duration-150 flex items-center justify-center gap-2 shadow-sm ${
              isPending ? 'opacity-85 pointer-events-none' : ''
            }`}
          >
            {isPending && <span className="w-4 h-4 rounded-full border-2 border-[#16241F]/40 border-t-[#16241F] animate-spin-custom"></span>}
            <span>{isPending ? 'Updating...' : 'Update Password'}</span>
          </button>
        </form>

      </div>
    </div>
  )
}
