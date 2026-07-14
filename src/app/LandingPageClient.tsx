'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { 
  GraduationCap, 
  Globe, 
  CheckCircle2, 
  Activity, 
  Users, 
  BarChart3, 
  FileText, 
  Mail, 
  ArrowRight, 
  Menu, 
  X, 
  ShieldCheck, 
  FileSpreadsheet, 
  Plus, 
  MessageSquare, 
  Check 
} from 'lucide-react'

export default function LandingPageClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [tilt, setTilt] = useState({ x: 0, y: 0 })
  const cardRef = useRef<HTMLDivElement>(null)

  // Track window scroll for nav shadow
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Reveal elements on scroll
  useEffect(() => {
    const revealEls = document.querySelectorAll('.reveal')
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('in')
            observer.unobserve(e.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )
    revealEls.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  // 3D card tilt
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = cardRef.current
    if (!card) return
    const rect = card.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    // Scale rotation angles
    setTilt({ x: x * 18, y: -y * 18 })
  }

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 })
  }

  return (
    <div className="min-h-screen font-sans selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden antialiased">
      {/* CSS Styles Integration */}
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
          --radius-lg: 28px;
          --radius-md: 18px;
          --radius-sm: 12px;
          --dist: 9px;
          --blur: 18px;
        }

        body {
          background: var(--bg);
          color: var(--text-1);
          font-family: 'Plus Jakarta Sans', sans-serif;
          line-height: 1.5;
        }

        h1, h2, h3, .display { 
          font-family: 'Space Grotesk', sans-serif; 
          letter-spacing: -0.02em; 
        }
        
        .mono { 
          font-family: 'JetBrains Mono', monospace; 
          letter-spacing: 0.04em; 
        }

        /* Neomorphic Primitives */
        .neo-raised {
          background: var(--bg);
          border-radius: var(--radius-lg);
          box-shadow:
            var(--dist) var(--dist) var(--blur) var(--shadow-dark),
            calc(var(--dist) * -1) calc(var(--dist) * -1) var(--blur) var(--shadow-light);
        }

        .neo-pressed {
          background: var(--bg);
          border-radius: var(--radius-md);
          box-shadow:
            inset 6px 6px 12px var(--shadow-dark),
            inset -6px -6px 12px var(--shadow-light);
        }

        .neo-flat {
          background: var(--bg);
          border-radius: var(--radius-md);
          box-shadow:
            6px 6px 12px var(--shadow-dark),
            -6px -6px 12px var(--shadow-light);
        }

        .neo-inline {
          background: var(--bg);
          border-radius: 999px;
          box-shadow:
            4px 4px 8px var(--shadow-dark),
            -4px -4px 8px var(--shadow-light);
        }

        /* Reveal on scroll */
        .reveal { 
          opacity: 0; 
          transform: translateY(28px); 
          transition: opacity .8s cubic-bezier(.16,.84,.44,1), transform .8s cubic-bezier(.16,.84,.44,1); 
        }
        
        .reveal.in { 
          opacity: 1; 
          transform: translateY(0); 
        }
        
        .reveal.d1 { transition-delay: .08s; }
        .reveal.d2 { transition-delay: .16s; }
        .reveal.d3 { transition-delay: .24s; }
        .reveal.d4 { transition-delay: .32s; }
        .reveal.d5 { transition-delay: .4s; }

        /* Animation utilities */
        @keyframes bob {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }

        .animate-bob-1 { animation: bob 5s ease-in-out infinite; }
        .animate-bob-2 { animation: bob 5s ease-in-out infinite 1.4s; }
        .animate-bob-3 { animation: bob 5s ease-in-out infinite 2.6s; }
      `}</style>

      {/* Header / Navigation */}
      <nav className={`fixed top-0 left-0 w-full z-50 py-4 transition-all duration-300 ${
        isScrolled ? 'bg-[#1E1E1E]/75 backdrop-blur-md border border-[#3E3E42]' : ''
      }`}>
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3 font-bold text-lg text-[#D4D4D4]">
            <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-[#007ACC] to-[#0062A3] border border-[#3E3E42] flex items-center justify-center">
              <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                <path d="M2 12L22 4L14 22L11 14L2 12Z" fill="white"/>
              </svg>
            </div>
            <span className="font-bold tracking-tight text-xl font-display text-[#D4D4D4]">CoachingSync</span>
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex gap-1 p-1.5 neo-pressed items-center">
            <a href="#product" className="px-5 py-2 rounded-full text-sm font-semibold text-[#CCCCCC] hover:text-[#D4D4D4] hover:border-[#555555] transition-all duration-200">Product</a>
            <a href="#pipeline" className="px-5 py-2 rounded-full text-sm font-semibold text-[#CCCCCC] hover:text-[#D4D4D4] hover:border-[#555555] transition-all duration-200">Pipeline</a>
            <a href="#access" className="px-5 py-2 rounded-full text-sm font-semibold text-[#CCCCCC] hover:text-[#D4D4D4] hover:border-[#555555] transition-all duration-200">Access</a>
            <a href="#pricing" className="px-5 py-2 rounded-full text-sm font-semibold text-[#CCCCCC] hover:text-[#D4D4D4] hover:border-[#555555] transition-all duration-200">Pricing</a>
          </div>

          <div className="hidden md:flex gap-4 items-center">
            {isLoggedIn ? (
              <Link href="/dashboard" className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-br from-[#007ACC] to-[#0062A3] hover:border-[#555555] active:translate-y-0.5 transition-all duration-150">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="px-5 py-2.5 rounded-full text-sm font-bold text-[#D4D4D4] bg-[#1E1E1E] border border-[#3E3E42] hover:border-[#555555] transition-all duration-200">
                  Sign In
                </Link>
                <a href="#pricing" className="px-5 py-2.5 rounded-full text-sm font-bold text-white bg-gradient-to-br from-[#007ACC] to-[#0062A3] hover:border-[#555555] active:translate-y-0.5 transition-all duration-150">
                  Get Started
                </a>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] active:border border-[#3E3E42] text-[#D4D4D4] transition-all duration-200"
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="md:hidden absolute top-20 left-0 w-full bg-[#1E1E1E] border-b border-[#111317]/30 p-6 flex flex-col gap-4 shadow-xl z-40">
            <a 
              href="#product" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 px-4 rounded-sm text-[#CCCCCC] hover:text-[#D4D4D4] active:border border-[#3E3E42] transition-all font-semibold"
            >
              Product
            </a>
            <a 
              href="#pipeline" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 px-4 rounded-sm text-[#CCCCCC] hover:text-[#D4D4D4] active:border border-[#3E3E42] transition-all font-semibold"
            >
              Pipeline
            </a>
            <a 
              href="#access" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 px-4 rounded-sm text-[#CCCCCC] hover:text-[#D4D4D4] active:border border-[#3E3E42] transition-all font-semibold"
            >
              Access
            </a>
            <a 
              href="#pricing" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="py-3 px-4 rounded-sm text-[#CCCCCC] hover:text-[#D4D4D4] active:border border-[#3E3E42] transition-all font-semibold"
            >
              Pricing
            </a>
            <div className="h-[1px] bg-[#111317]/30 my-2"></div>
            {isLoggedIn ? (
              <Link 
                href="/dashboard" 
                onClick={() => setIsMobileMenuOpen(false)}
                className="py-3.5 px-5 text-center rounded-full font-bold text-white bg-gradient-to-br from-[#007ACC] to-[#0062A3]"
              >
                Go to Dashboard
              </Link>
            ) : (
              <div className="flex flex-col gap-3">
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3 text-center rounded-full font-bold text-[#D4D4D4] bg-[#1E1E1E] border border-[#3E3E42]"
                >
                  Sign In
                </Link>
                <a 
                  href="#pricing" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="py-3.5 text-center rounded-full font-bold text-white bg-gradient-to-br from-[#007ACC] to-[#0062A3]"
                >
                  Get Started
                </a>
              </div>
            )}
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <header className="pt-32 pb-20 px-6 relative">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <span className="eyebrow inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-[#0062A3] neo-inline mb-6">
              <span className="w-2.5 h-2.5 rounded-full bg-[#CE9178] border border-[#3E3E42]"></span>
              BUILT FOR STUDY ABROAD CONSULTANCIES
            </span>
            <h1 className="reveal in text-4xl md:text-6xl font-bold font-display leading-[1.08] text-[#D4D4D4] mb-6">
              Every application,<br />tracked from inquiry<br />to <span className="text-[#007ACC]">visa stamp.</span>
            </h1>
            <p className="reveal in d1 text-[#CCCCCC] text-base md:text-lg max-w-lg mb-8">
              CoachingSync replaces the spreadsheet chaos of student recruitment with one pipeline — academic history, test scores, university applications, and counselor follow-ups, all in sync.
            </p>
            <div className="hero-actions reveal in d2 flex flex-wrap gap-4 items-center mb-10">
              <a href="#pricing" className="px-7 py-3.5 rounded-full text-base font-bold text-white bg-gradient-to-br from-[#007ACC] to-[#0062A3] hover:border-[#555555] active:translate-y-0.5 transition-all duration-150">
                Start free trial
              </a>
              <a href="#pipeline" className="px-7 py-3.5 rounded-full text-base font-bold text-[#D4D4D4] bg-[#1E1E1E] border border-[#3E3E42] hover:border-[#555555] transition-all duration-200">
                See the pipeline ↓
              </a>
            </div>
            <div className="trust-row reveal in d3 flex gap-8 flex-wrap pt-4 border-t border-[#111317]/20">
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-[#D4D4D4]">12,400+</span>
                <span className="text-xs text-[#858585]">Students tracked</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-[#D4D4D4]">340</span>
                <span className="text-xs text-[#858585]">Partner universities</span>
              </div>
              <div className="flex flex-col">
                <span className="font-display text-2xl font-bold text-[#D4D4D4]">98%</span>
                <span className="text-xs text-[#858585]">On-time follow-ups</span>
              </div>
            </div>
          </div>

          {/* Interactive 3D Card Stage */}
          <div className="stage reveal in d2 relative h-[450px] w-full flex items-center justify-center perspective-[1400px]">
            <div 
              ref={cardRef}
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
              className="card3d w-80 h-[390px] rounded-[26px] bg-[#1E1E1E] relative transform-style-preserve-3d border border-[#3E3E42] transition-transform duration-100 ease-out p-6"
              style={{
                transform: `rotateY(${tilt.x}deg) rotateX(${tilt.y}deg) translateZ(0)`
              }}
            >
              {/* Inner container with inner-shadow styling */}
              <div className="absolute inset-3.5 rounded-[18px] bg-gradient-to-br from-[#EEF2F7] to-[#DEE5EF] border border-[#3E3E42] pointer-events-none"></div>
              
              <div className="relative z-10 h-full flex flex-col transform translate-z-[30px]">
                <div className="flex justify-between items-start">
                  <span className="text-[10px] font-semibold text-[#858585] tracking-wider font-mono">STUDENT FILE · #A2291</span>
                  <span className="text-[9px] font-bold px-2 py-1 rounded-full text-white bg-gradient-to-br from-[#21C285] to-[#159a68] border border-[#3E3E42] rotate-[6deg]">
                    OFFER RECEIVED
                  </span>
                </div>
                
                <div className="w-16 h-16 rounded-md margin mt-5 mb-3 bg-gradient-to-br from-[#007ACC] to-[#0062A3] border border-[#3E3E42] flex items-center justify-center text-white font-display font-bold text-2xl">
                  FR
                </div>
                
                <div className="font-display font-bold text-lg text-[#D4D4D4]">Farhan Rahman</div>
                <div className="text-xs text-[#858585] mt-0.5">B.Sc → M.Sc Computer Science</div>
                
                <div className="h-[1px] bg-gradient-to-r from-transparent via-[#111317] to-transparent my-4"></div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#858585]">Destination</span>
                    <span className="text-[#D4D4D4] font-bold">Toronto, CA</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#858585]">IELTS</span>
                    <span className="text-[#D4D4D4] font-bold">7.5 Overall</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#858585]">Counselor</span>
                    <span className="text-[#D4D4D4] font-bold">S. Chowdhury</span>
                  </div>
                </div>
                
                <div className="mt-auto flex gap-2">
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full text-[#CCCCCC] bg-[#1E1E1E] border border-[#3E3E42]">Fall 2027</span>
                  <span className="text-[10px] font-bold px-3 py-1 rounded-full text-[#CCCCCC] bg-[#1E1E1E] border border-[#3E3E42]">3 Applications</span>
                </div>
              </div>
            </div>

            {/* Floating Badges */}
            <div className="absolute top-6 left-0 bg-[#1E1E1E] px-3.5 py-2.5 rounded-md flex items-center gap-2 text-xs font-bold text-[#D4D4D4] border border-[#3E3E42] animate-bob-1">
              <Check className="w-4 h-4 text-[#4EC9B0]" /> Test verified
            </div>
            <div className="absolute bottom-10 right-0 bg-[#1E1E1E] px-3.5 py-2.5 rounded-md flex items-center gap-2 text-xs font-bold text-[#D4D4D4] border border-[#3E3E42] animate-bob-2">
              <Activity className="w-4 h-4 text-[#CE9178]" /> Next task in 2d
            </div>
            <div className="absolute top-1/2 -right-6 bg-[#1E1E1E] px-3.5 py-2.5 rounded-md flex items-center gap-2 text-xs font-bold text-[#D4D4D4] border border-[#3E3E42] animate-bob-3">
              <GraduationCap className="w-4 h-4 text-[#007ACC]" /> 3 unis compared
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div className="max-w-6xl mx-auto mt-16 stats-strip reveal">
          <div className="stats-panel neo-pressed grid grid-cols-2 md:grid-cols-4 gap-6 p-8">
            <div className="text-center p-3">
              <div className="font-display text-2xl md:text-3xl font-bold text-[#0062A3]">360°</div>
              <div className="text-xs text-[#858585] mt-1.5">Student profile per lead</div>
            </div>
            <div className="text-center p-3 border-l border-[#111317]/20">
              <div className="font-display text-2xl md:text-3xl font-bold text-[#0062A3]">Multi-uni</div>
              <div className="text-xs text-[#858585] mt-1.5">Application tracking</div>
            </div>
            <div className="text-center p-3 border-l border-[#111317]/20">
              <div className="font-display text-2xl md:text-3xl font-bold text-[#0062A3]">Row-level</div>
              <div className="text-xs text-[#858585] mt-1.5">Security by role</div>
            </div>
            <div className="text-center p-3 border-l border-[#111317]/20">
              <div className="font-display text-2xl md:text-3xl font-bold text-[#0062A3]">1-click</div>
              <div className="text-xs text-[#858585] mt-1.5">Branded PDF export</div>
            </div>
          </div>
        </div>
      </header>

      {/* Pipeline Section */}
      <section id="pipeline" className="py-20 px-6">
        <div className="max-w-6xl mx-auto bg-[#252526] rounded-[48px] p-8 md:p-14 border border-[#3E3E42]">
          <div className="max-w-xl mb-12 reveal">
            <span className="text-[11px] font-bold font-mono text-[#4EC9B0] tracking-widest block mb-3">THE PIPELINE</span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#D4D4D4] mb-4">From first inquiry to boarding pass.</h2>
            <p className="text-[#CCCCCC] text-sm md:text-base">
              Every lead moves through five real stages. Counselors always know exactly where a student stands — and what to do next.
            </p>
          </div>

          <div className="relative mt-12 reveal overflow-hidden">
            {/* SVG Flight Path Line */}
            <svg className="w-full h-auto min-h-[60px]" viewBox="0 0 1000 120" preserveAspectRatio="none">
              <path 
                id="flightPath" 
                d="M 60 60 Q 250 10, 500 60 T 940 60" 
                fill="none" 
                stroke="#B7C1D2" 
                strokeWidth="2" 
                strokeDasharray="2 10" 
                strokeLinecap="round" 
              />
              <circle r="6" fill="#007ACC">
                <animateMotion dur="7s" repeatCount="indefinite" rotate="auto">
                  <mpath href="#flightPath"/>
                </animateMotion>
              </circle>
            </svg>

            {/* Nodes Row */}
            <div className="grid grid-cols-5 gap-3 -mt-10">
              <div className="text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-md bg-gradient-to-br from-[#007ACC] to-[#0062A3] border border-[#3E3E42] flex items-center justify-center text-white">
                  <Plus className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs md:text-sm text-[#D4D4D4] mt-3">New</div>
                <div className="text-[10px] text-[#858585] hidden md:block mt-1">Lead captured</div>
              </div>

              <div className="text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-md bg-[#252526] border border-[#3E3E42] flex items-center justify-center text-[#CCCCCC]">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs md:text-sm text-[#D4D4D4] mt-3">Contacted</div>
                <div className="text-[10px] text-[#858585] hidden md:block mt-1">First response logged</div>
              </div>

              <div className="text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-md bg-[#252526] border border-[#3E3E42] flex items-center justify-center text-[#CCCCCC]">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs md:text-sm text-[#D4D4D4] mt-3">Applied</div>
                <div className="text-[10px] text-[#858585] hidden md:block mt-1">Sent to universities</div>
              </div>

              <div className="text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-md bg-[#252526] border border-[#3E3E42] flex items-center justify-center text-[#CCCCCC]">
                  <Check className="w-5 h-5" />
                </div>
                <div className="font-bold text-xs md:text-sm text-[#D4D4D4] mt-3">Offer</div>
                <div className="text-[10px] text-[#858585] hidden md:block mt-1">Admission received</div>
              </div>

              <div className="text-center flex flex-col items-center">
                <div className="w-14 h-14 rounded-md bg-[#252526] border border-[#3E3E42] flex items-center justify-center text-[#CCCCCC]">
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12L22 4L14 22L11 14L2 12Z" />
                  </svg>
                </div>
                <div className="font-bold text-xs md:text-sm text-[#D4D4D4] mt-3">Visa</div>
                <div className="text-[10px] text-[#858585] hidden md:block mt-1">Departure ready</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid Section */}
      <section id="product" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-12 reveal">
            <span className="text-[11px] font-bold font-mono text-[#teal] tracking-widest block mb-3">PRODUCT</span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#D4D4D4] mb-4">Built around how counselors actually work.</h2>
            <p className="text-[#CCCCCC] text-sm md:text-base">
              Not a generic sales CRM with fields renamed. Every screen matches the shape of a study-abroad application.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="feat-card neo-flat p-8 hover:-translate-y-1.5 transition-all duration-300 reveal">
              <div className="w-12 h-12 rounded-md bg-[#1E1E1E] border border-[#3E3E42] flex items-center justify-center text-[#007ACC] mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-[#D4D4D4] font-bold text-lg mb-2">360° student profiles</h3>
              <p className="text-xs text-[#CCCCCC] leading-relaxed">
                SSC/HSC grades, degrees, IELTS/PTE/TOEFL/Duolingo scores, budget, and destination preferences in one file.
              </p>
            </div>

            <div className="feat-card neo-flat p-8 hover:-translate-y-1.5 transition-all duration-300 reveal d1">
              <div className="w-12 h-12 rounded-md bg-[#1E1E1E] border border-[#3E3E42] flex items-center justify-center text-[#4EC9B0] mb-6">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-[#D4D4D4] font-bold text-lg mb-2">Multi-university tracking</h3>
              <p className="text-xs text-[#CCCCCC] leading-relaxed">
                Run several live applications per student side by side, each with its own status and requirements.
              </p>
            </div>

            <div className="feat-card neo-flat p-8 hover:-translate-y-1.5 transition-all duration-300 reveal d2">
              <div className="w-12 h-12 rounded-md bg-[#1E1E1E] border border-[#3E3E42] flex items-center justify-center text-[#CE9178] mb-6">
                <Activity className="w-6 h-6" />
              </div>
              <h3 className="text-[#D4D4D4] font-bold text-lg mb-2">Shared timeline</h3>
              <p className="text-xs text-[#CCCCCC] leading-relaxed">
                A chronological feed of counselor notes, comments, and file changes — nothing gets lost in someone's inbox.
              </p>
            </div>

            <div className="feat-card neo-flat p-8 hover:-translate-y-1.5 transition-all duration-300 reveal">
              <div className="w-12 h-12 rounded-md bg-[#1E1E1E] border border-[#3E3E42] flex items-center justify-center text-[#007ACC] mb-6">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-[#D4D4D4] font-bold text-lg mb-2">Timezone-aware tasks</h3>
              <p className="text-xs text-[#CCCCCC] leading-relaxed">
                Follow-up agendas and tasks that respect where your counselors and students actually are.
              </p>
            </div>

            <div className="feat-card neo-flat p-8 hover:-translate-y-1.5 transition-all duration-300 reveal d1">
              <div className="w-12 h-12 rounded-md bg-[#1E1E1E] border border-[#3E3E42] flex items-center justify-center text-[#4EC9B0] mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-[#D4D4D4] font-bold text-lg mb-2">Role-based permissions</h3>
              <p className="text-xs text-[#CCCCCC] leading-relaxed">
                Super Admin, Manager, and Counselor roles with row-level database access — people only see what's theirs.
              </p>
            </div>

            <div className="feat-card neo-flat p-8 hover:-translate-y-1.5 transition-all duration-300 reveal d2">
              <div className="w-12 h-12 rounded-md bg-[#1E1E1E] border border-[#3E3E42] flex items-center justify-center text-[#CE9178] mb-6">
                <FileText className="w-6 h-6" />
              </div>
              <h3 className="text-[#D4D4D4] font-bold text-lg mb-2">Branded PDF export</h3>
              <p className="text-xs text-[#CCCCCC] leading-relaxed">
                One click turns a student file into a clean, submission-ready profile for partner universities or reviews.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Access Control section */}
      <section id="access" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="max-w-xl mb-12 reveal">
            <span className="text-[11px] font-bold font-mono text-[#0062A3] tracking-widest block mb-3">ACCESS CONTROL</span>
            <h2 className="text-2xl md:text-4xl font-bold text-[#D4D4D4] mb-4">Everyone sees exactly their lane.</h2>
            <p className="text-[#CCCCCC] text-sm md:text-base">
              Three roles, scoped by company and by ownership — designed so counselors can move fast without stepping on each other's work.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="role-card neo-flat p-8 reveal">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-md bg-gradient-to-br from-[#007ACC] to-[#0062A3] flex items-center justify-center text-white shrink-0 border border-[#3E3E42]">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#D4D4D4]">Super Admin</h3>
                  <div className="text-[11px] text-[#858585] mt-0.5">Owns company workspace</div>
                </div>
              </div>
              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5 text-xs text-[#CCCCCC]">
                  <Check className="w-4 h-4 text-[#4EC9B0] mt-0.5 shrink-0" />
                  <span>Invite and manage staff members</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#CCCCCC]">
                  <Check className="w-4 h-4 text-[#4EC9B0] mt-0.5 shrink-0" />
                  <span>View every student lead company-wide</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#CCCCCC]">
                  <Check className="w-4 h-4 text-[#4EC9B0] mt-0.5 shrink-0" />
                  <span>Perform bulk transfers & reassignments</span>
                </div>
              </div>
            </div>

            <div className="role-card neo-flat p-8 reveal d1">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-md bg-gradient-to-br from-[#3FC7CE] to-[#0F8A94] flex items-center justify-center text-white shrink-0 border border-[#3E3E42]">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#D4D4D4]">Manager</h3>
                  <div className="text-[11px] text-[#858585] mt-0.5">Runs counselor team</div>
                </div>
              </div>
              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5 text-xs text-[#CCCCCC]">
                  <Check className="w-4 h-4 text-[#4EC9B0] mt-0.5 shrink-0" />
                  <span>Build team conversion and performance reports</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#CCCCCC]">
                  <Check className="w-4 h-4 text-[#4EC9B0] mt-0.5 shrink-0" />
                  <span>Transfer leads between assigned counselors</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#CCCCCC]">
                  <Check className="w-4 h-4 text-[#4EC9B0] mt-0.5 shrink-0" />
                  <span>Monitor lead activities and pipelines</span>
                </div>
              </div>
            </div>

            <div className="role-card neo-flat p-8 reveal d2">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-md bg-gradient-to-br from-[#FF9B78] to-[#E85C33] flex items-center justify-center text-white shrink-0 border border-[#3E3E42]">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-[#D4D4D4]">Counselor</h3>
                  <div className="text-[11px] text-[#858585] mt-0.5">Works assigned students</div>
                </div>
              </div>
              <div className="space-y-3.5">
                <div className="flex items-start gap-2.5 text-xs text-[#CCCCCC]">
                  <Check className="w-4 h-4 text-[#4EC9B0] mt-0.5 shrink-0" />
                  <span>Manage and update their own lead files</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#CCCCCC]">
                  <Check className="w-4 h-4 text-[#4EC9B0] mt-0.5 shrink-0" />
                  <span>Log interaction notes and upcoming tasks</span>
                </div>
                <div className="flex items-start gap-2.5 text-xs text-[#CCCCCC]">
                  <Check className="w-4 h-4 text-[#4EC9B0] mt-0.5 shrink-0" />
                  <span>Export student files to branded PDFs</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing and CTA section */}
      <section id="pricing" className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 reveal">
            <span className="text-[11px] font-bold font-mono text-[#0062A3] tracking-widest block mb-3">PRICING PLANS</span>
            <h2 className="text-3xl md:text-4xl font-bold text-[#D4D4D4]">Simple, transparent pricing.</h2>
            <p className="text-[#CCCCCC] text-sm md:text-base mt-3 max-w-xl mx-auto">
              One flat rate for full CRM access across your agency branches. No scaling user seat costs.
            </p>
          </div>

          <div className="max-w-md mx-auto rounded-[2.5rem] bg-[#1E1E1E] border border-[#3E3E42] p-8 md:p-12 relative overflow-hidden reveal">
            {/* Limited offer tag */}
            <div className="absolute top-0 right-0 bg-[#CE9178] text-white text-[9px] font-bold tracking-wider py-1.5 px-4 rounded-bl-2xl shadow-sm">
              LIMITED TIME OFFER
            </div>

            <div className="text-center mb-8 pt-4">
              <h3 className="text-xl font-bold text-[#D4D4D4] mb-2 font-display">Full Access License</h3>
              <div className="flex items-center justify-center gap-2 mb-2">
                <span className="text-[#858585] font-bold text-xl line-through">$449</span>
                <span className="text-4xl font-black text-[#007ACC] font-display">$349</span>
                <span className="text-[#CCCCCC] font-medium text-xs">USD / year</span>
              </div>
              <p className="text-[#4EC9B0] font-semibold text-xs bg-[#4EC9B0]/10 inline-block px-3 py-1 rounded-full">Save $100 annually</p>
            </div>

            <div className="space-y-4 mb-8">
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-[#4EC9B0] mr-3 shrink-0 mt-0.5" />
                <span className="text-xs text-[#CCCCCC]">Unlimited Counselors and Managers</span>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-[#4EC9B0] mr-3 shrink-0 mt-0.5" />
                <span className="text-xs text-[#CCCCCC]">Complete CRM and Application Pipeline</span>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-[#4EC9B0] mr-3 shrink-0 mt-0.5" />
                <span className="text-xs text-[#CCCCCC]">Automated PDF Profile Exporter</span>
              </div>
              <div className="flex items-start">
                <CheckCircle2 className="w-5 h-5 text-[#4EC9B0] mr-3 shrink-0 mt-0.5" />
                <span className="text-xs text-[#CCCCCC]">Visual Team Performance Analytics</span>
              </div>
            </div>

            <a 
              href="mailto:CoachingSync@gmail.com" 
              className="w-full py-3.5 rounded-full bg-gradient-to-br from-[#007ACC] to-[#0062A3] text-white font-bold text-center flex items-center justify-center hover:border-[#555555] active:translate-y-0.5 transition-all duration-150"
            >
              <Mail className="w-4 h-4 mr-2" />
              Contact Sales to Get Started
            </a>
          </div>
        </div>
      </section>

      {/* CTA Box Section */}
      <section className="pb-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="cta-panel neo-raised p-8 md:p-16 text-center relative overflow-hidden reveal">
            {/* Blurred background Orbs */}
            <div className="absolute w-72 h-72 rounded-full filter blur-[60px] opacity-[0.25] bg-[#007ACC] -top-24 -left-20 pointer-events-none"></div>
            <div className="absolute w-72 h-72 rounded-full filter blur-[60px] opacity-[0.25] bg-[#4EC9B0] -bottom-24 -right-20 pointer-events-none"></div>
            
            <h2 className="text-2xl md:text-4xl font-bold text-[#D4D4D4] mb-4">Stop tracking students in spreadsheets.</h2>
            <p className="text-[#CCCCCC] text-sm md:text-base max-w-md mx-auto mb-8">
              Set up your workspace in a few minutes and move your first lead through the pipeline today.
            </p>
            <a 
              href="mailto:CoachingSync@gmail.com" 
              className="px-8 py-3.5 rounded-full font-bold text-white bg-gradient-to-br from-[#007ACC] to-[#0062A3] inline-flex items-center gap-2 hover:border-[#555555] active:translate-y-0.5 transition-all duration-150"
            >
              Start free trial <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-[#111317]/20 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-[#007ACC] to-[#0062A3] flex items-center justify-center">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path d="M2 12L22 4L14 22L11 14L2 12Z" fill="white"/>
              </svg>
            </div>
            <span className="font-bold text-[#D4D4D4] tracking-tight">CoachingSync</span>
          </div>

          <div className="flex gap-6 text-xs text-[#858585]">
            <a href="#product" className="hover:text-[#D4D4D4] transition-colors">Product</a>
            <a href="#pipeline" className="hover:text-[#D4D4D4] transition-colors">Pipeline</a>
            <a href="#access" className="hover:text-[#D4D4D4] transition-colors">Access</a>
            <a href="mailto:CoachingSync@gmail.com" className="hover:text-[#D4D4D4] transition-colors">CoachingSync@gmail.com</a>
          </div>

          <div className="text-xs text-[#858585]">
            © {new Date().getFullYear()} CoachingSync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  )
}
