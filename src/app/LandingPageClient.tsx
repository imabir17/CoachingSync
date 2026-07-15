'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function LandingPageClient({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-[#F3F1E8] text-[#16241F] font-sans overflow-x-hidden antialiased">
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
          --line-dark: rgba(242,239,230,0.14);
          --line-light: rgba(22,36,31,0.13);
          --text-body-dark: rgba(242,239,230,0.72);
          --text-body-light: #3A4B44;
          --radius: 14px;
          --wrap: 1180px;
        }

        * {
          box-sizing: border-box;
        }
        
        html {
          scroll-behavior: smooth;
        }

        h1, h2, h3 {
          font-family: 'Archivo', sans-serif;
          margin: 0;
          letter-spacing: -0.01em;
          line-height: 1.05;
        }

        .eyebrow {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          font-weight: 500;
        }

        /* ---------- NAV ---------- */
        header.nav {
          position: sticky;
          top: 0;
          z-index: 50;
          background: rgba(243, 241, 232, 0.88);
          backdrop-filter: blur(10px);
          border-bottom: 1px solid var(--line-light);
        }

        .nav-inner {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 28px;
          max-width: var(--wrap);
          margin: 0 auto;
        }

        .logo {
          display: flex;
          align-items: center;
          gap: 9px;
          font-family: 'Archivo', sans-serif;
          font-weight: 800;
          font-size: 19px;
          color: var(--ink-900);
        }

        .logo .dot {
          width: 9px;
          height: 9px;
          border-radius: 2px;
          background: var(--gold);
          transform: rotate(45deg);
        }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 34px;
        }

        .nav-links a {
          font-size: 14.5px;
          font-weight: 500;
          color: var(--ink-600);
          transition: color .15s ease;
        }

        .nav-links a:hover {
          color: var(--ink-900);
        }

        .nav-cta {
          display: flex;
          align-items: center;
          gap: 18px;
        }

        .btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px 22px;
          border-radius: 9px;
          font-size: 14.5px;
          font-weight: 600;
          border: 1px solid transparent;
          transition: transform .15s ease, box-shadow .15s ease, background .15s ease;
        }

        .btn:focus-visible {
          outline: 2px solid var(--gold);
          outline-offset: 2px;
        }

        .btn-primary {
          background: var(--gold);
          color: var(--ink-900);
        }

        .btn-primary:hover {
          transform: translateY(-1px);
          box-shadow: 0 8px 20px -8px rgba(227, 167, 47, 0.55);
        }

        .btn-ghost-dark {
          color: var(--ink-900);
          font-weight: 600;
        }

        .btn-outline-light {
          border-color: rgba(242, 239, 230, 0.3);
          color: var(--chalk);
        }

        .btn-outline-light:hover {
          background: rgba(242, 239, 230, 0.08);
        }

        /* ---------- HERO ---------- */
        .hero {
          background: var(--ink-900);
          color: var(--chalk);
          padding: 76px 0 96px;
          position: relative;
          overflow: hidden;
        }

        .hero-grid {
          display: grid;
          grid-template-columns: 1.05fr 1fr;
          gap: 56px;
          align-items: center;
        }

        .hero-eyebrow {
          color: var(--gold);
          margin-bottom: 20px;
        }

        .hero h1 {
          font-size: clamp(34px, 4.4vw, 54px);
          font-weight: 900;
          color: var(--chalk);
          max-width: 12ch;
        }

        .hero h1 em {
          font-style: normal;
          color: var(--gold);
        }

        .hero-sub {
          margin-top: 22px;
          font-size: 17px;
          line-height: 1.6;
          color: var(--text-body-dark);
          max-width: 46ch;
        }

        .hero-ctas {
          margin-top: 32px;
          display: flex;
          align-items: center;
          gap: 14px;
          flex-wrap: wrap;
        }

        .hero-stats {
          margin-top: 34px;
          display: flex;
          gap: 28px;
          flex-wrap: wrap;
        }

        .hero-stats .hero-stat {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          color: rgba(242, 239, 230, 0.55);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .hero-stat b {
          color: var(--chalk);
          font-weight: 600;
        }

        .hero-stat .sep {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--gold);
        }

        /* ---------- ROUTINE BOARD ---------- */
        .board-frame {
          background: var(--ink-700);
          border: 1px solid var(--line-dark);
          border-radius: 18px;
          padding: 20px;
          box-shadow: 0 40px 80px -30px rgba(0, 0, 0, 0.55);
          position: relative;
        }

        .board-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 14px;
          padding: 0 4px;
        }

        .board-title {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11.5px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: rgba(242, 239, 230, 0.5);
        }

        .board-live {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          color: var(--green);
        }

        .board-live .pulse {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: var(--green);
          animation: pulse 1.8s ease-in-out infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.35; }
        }

        .board {
          display: grid;
          grid-template-columns: 44px repeat(5, 1fr);
          gap: 6px;
          position: relative;
        }

        .board .day-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10.5px;
          color: rgba(242, 239, 230, 0.45);
          text-align: center;
          padding: 6px 0 10px;
          letter-spacing: 0.05em;
        }

        .board .time-label {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 9.5px;
          color: rgba(242, 239, 230, 0.35);
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding-right: 6px;
          height: 52px;
        }

        .slot {
          height: 52px;
          border-radius: 8px;
          background: rgba(242, 239, 230, 0.035);
          border: 1px dashed rgba(242, 239, 230, 0.08);
        }

        .slot.filled {
          border: 1px solid transparent;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 6px 9px;
          font-family: 'IBM Plex Mono', monospace;
        }

        .slot.filled b {
          font-size: 11px;
          font-weight: 600;
          display: block;
        }

        .slot.filled span {
          font-size: 9.5px;
          opacity: 0.75;
        }

        .slot.gold {
          background: rgba(227, 167, 47, 0.16);
          color: #F5D98A;
        }

        .slot.green {
          background: rgba(95, 167, 121, 0.16);
          color: #9CD3B3;
        }

        .slot.red {
          background: rgba(214, 88, 74, 0.14);
          color: #E9A79D;
        }

        .lead-pill {
          position: absolute;
          top: 78px;
          right: -190px;
          display: flex;
          align-items: center;
          gap: 7px;
          background: var(--chalk);
          color: var(--ink-900);
          padding: 7px 12px 7px 8px;
          border-radius: 100px;
          font-family: 'IBM Plex Mono', monospace;
          font-size: 10.5px;
          font-weight: 600;
          box-shadow: 0 10px 24px -8px rgba(0, 0, 0, 0.4);
          animation: slideIn 5s cubic-bezier(.55, 0, .15, 1) infinite;
        }

        .lead-pill .avatar {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: var(--gold);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 9px;
          color: var(--ink-900);
          font-weight: 800;
        }

        @keyframes slideIn {
          0% { transform: translateX(0); opacity: 0; }
          12% { opacity: 1; }
          38% { transform: translateX(-236px); opacity: 1; }
          46% { transform: translateX(-236px) scale(0.85); opacity: 0; }
          100% { transform: translateX(-236px) scale(0.85); opacity: 0; }
        }

        .board-caption {
          margin-top: 16px;
          padding-top: 14px;
          border-top: 1px solid var(--line-dark);
          font-size: 12.5px;
          color: rgba(242, 239, 230, 0.5);
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .board-caption b {
          color: var(--gold);
          font-weight: 600;
        }

        @media (prefers-reduced-motion: reduce) {
          .lead-pill {
            animation: none;
            opacity: 1;
            transform: translateX(-236px);
          }
          .board-live .pulse {
            animation: none;
          }
        }

        /* ---------- TRUST STRIP ---------- */
        .trust {
          background: var(--paper-dim);
          border-bottom: 1px solid var(--line-light);
          padding: 22px 0;
        }

        .trust-inner {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          flex-wrap: wrap;
          text-align: center;
        }

        .trust-inner span {
          font-size: 13.5px;
          color: var(--text-body-light);
        }

        .trust-inner b {
          color: var(--ink-900);
          font-weight: 600;
        }

        .trust-dot {
          color: var(--gold);
        }

        /* ---------- SECTION SHARED ---------- */
        section {
          padding: 96px 0;
        }

        .section-head {
          max-width: 620px;
          margin-bottom: 56px;
        }

        .section-eyebrow {
          color: var(--gold-deep);
          margin-bottom: 14px;
        }

        .section-head h2 {
          font-size: clamp(26px, 3vw, 36px);
          font-weight: 800;
          color: var(--ink-900);
        }

        .section-head p {
          margin-top: 14px;
          font-size: 16px;
          line-height: 1.6;
          color: var(--text-body-light);
        }

        /* ---------- FUNNEL ---------- */
        .funnel {
          background: var(--ink-900);
          color: var(--chalk);
        }

        .funnel .section-head p {
          color: var(--text-body-dark);
        }

        .funnel .section-head h2 {
          color: var(--chalk);
        }

        .funnel-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2px;
          background: var(--line-dark);
          border: 1px solid var(--line-dark);
          border-radius: 16px;
          overflow: hidden;
        }

        .funnel-step {
          background: var(--ink-900);
          padding: 32px 26px;
          position: relative;
        }

        .funnel-step .fnum {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: var(--gold);
          margin-bottom: 22px;
        }

        .funnel-step h3 {
          font-size: 18px;
          font-weight: 700;
          color: var(--chalk);
          margin-bottom: 10px;
        }

        .funnel-step p {
          font-size: 14px;
          line-height: 1.55;
          color: var(--text-body-dark);
        }

        .funnel-step::after {
          content: '';
          position: absolute;
          right: -1px;
          top: 50%;
          transform: translateY(-50%);
          width: 8px;
          height: 8px;
          border-top: 1px solid rgba(242, 239, 230, 0.3);
          border-right: 1px solid rgba(242, 239, 230, 0.3);
          rotate: 45deg;
          z-index: 2;
        }

        .funnel-step:last-child::after {
          display: none;
        }

        /* ---------- FEATURES ---------- */
        .features-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .feature-card {
          background: var(--chalk);
          border: 1px solid var(--line-light);
          border-radius: var(--radius);
          padding: 28px 24px;
          transition: transform .15s ease, box-shadow .15s ease;
        }

        .feature-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 20px 40px -24px rgba(22, 36, 31, 0.25);
        }

        .feature-icon {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: var(--ink-900);
          border-radius: 9px;
          margin-bottom: 18px;
        }

        .feature-card h3 {
          font-size: 16.5px;
          font-weight: 700;
          margin-bottom: 9px;
          color: var(--ink-900);
        }

        .feature-card p {
          font-size: 14px;
          line-height: 1.55;
          color: var(--text-body-light);
        }

        /* ---------- PRICING ---------- */
        .pricing {
          background: var(--paper-dim);
        }

        .toggle-wrap {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 44px;
        }

        .toggle {
          display: inline-flex;
          background: var(--ink-900);
          border-radius: 100px;
          padding: 4px;
        }

        .toggle button {
          border: none;
          background: transparent;
          color: rgba(242, 239, 230, 0.55);
          padding: 9px 20px;
          border-radius: 100px;
          font-size: 13.5px;
          font-weight: 600;
          font-family: 'IBM Plex Mono', monospace;
          transition: all .15s ease;
          cursor: pointer;
        }

        .toggle button.active {
          background: var(--gold);
          color: var(--ink-900);
        }

        .save-badge {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12px;
          color: var(--green);
          font-weight: 600;
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .price-card {
          background: var(--chalk);
          border-radius: var(--radius);
          border: 1px solid var(--line-light);
          padding: 30px 26px;
          display: flex;
          flex-direction: column;
        }

        .price-card.featured {
          background: var(--ink-900);
          color: var(--chalk);
          border-color: var(--ink-900);
          position: relative;
          box-shadow: 0 30px 60px -30px rgba(22, 36, 31, 0.4);
        }

        .price-card.featured .price-desc {
          color: var(--text-body-dark);
        }

        .featured-tag {
          position: absolute;
          top: -13px;
          left: 26px;
          background: var(--gold);
          color: var(--ink-900);
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11px;
          font-weight: 700;
          padding: 5px 12px;
          border-radius: 100px;
          letter-spacing: 0.04em;
        }

        .price-card h3 {
          font-size: 15px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }

        .price-card .price-desc {
          font-size: 13.5px;
          color: var(--text-body-light);
          margin-top: 8px;
          min-height: 36px;
        }

        .price-num {
          margin-top: 22px;
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .price-num .amt {
          font-family: 'Archivo', sans-serif;
          font-weight: 900;
          font-size: 40px;
        }

        .price-num .cyc {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 12.5px;
          opacity: 0.6;
        }

        .price-setup {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11.5px;
          margin-top: 8px;
          opacity: 0.6;
        }

        .price-list {
          margin: 24px 0 26px;
          display: flex;
          flex-direction: column;
          gap: 11px;
          flex-grow: 1;
        }

        .price-list div {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          font-size: 13.5px;
        }

        .price-list .check {
          color: var(--green);
          font-weight: 700;
          flex-shrink: 0;
        }

        .price-card.featured .price-list .check {
          color: var(--gold);
        }

        .price-card .btn {
          width: 100%;
        }

        .price-card:not(.featured) .btn {
          background: var(--ink-900);
          color: var(--chalk);
        }

        .custom-note {
          margin-top: 28px;
          text-align: center;
          font-size: 13.5px;
          color: var(--text-body-light);
        }

        .custom-note a {
          color: var(--ink-900);
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 3px;
        }

        /* ---------- CTA BAND ---------- */
        .cta-band {
          background: var(--ink-900);
          color: var(--chalk);
          padding: 70px 0;
          text-align: center;
        }

        .cta-band h2 {
          font-size: clamp(24px, 3.2vw, 34px);
          font-weight: 800;
          max-width: 16ch;
          margin: 0 auto;
        }

        .cta-band p {
          margin-top: 14px;
          font-size: 15.5px;
          color: var(--text-body-dark);
        }

        .cta-band .hero-ctas {
          justify-content: center;
          margin-top: 28px;
        }

        /* ---------- FOOTER ---------- */
        footer {
          background: var(--ink-900);
          color: rgba(242, 239, 230, 0.55);
          padding: 36px 0;
          border-top: 1px solid var(--line-dark);
        }

        .footer-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }

        .footer-inner .logo {
          color: var(--chalk);
          font-size: 16px;
        }

        .footer-links {
          display: flex;
          gap: 24px;
          font-size: 13px;
        }

        .footer-links a:hover {
          color: var(--chalk);
        }

        .footer-fine {
          font-family: 'IBM Plex Mono', monospace;
          font-size: 11.5px;
        }

        /* Mobile Menu Button & Drawer */
        .mobile-toggle {
          display: none;
          background: transparent;
          border: none;
          color: var(--ink-900);
          padding: 8px;
          cursor: pointer;
          outline: none;
        }

        .mobile-drawer {
          position: fixed;
          top: 61px; /* Height of nav header */
          left: 0;
          right: 0;
          bottom: 0;
          background: var(--paper);
          z-index: 40;
          padding: 40px 28px;
          display: flex;
          flex-direction: column;
          gap: 24px;
          border-top: 1px solid var(--line-light);
          transform: translateY(-100%);
          opacity: 0;
          pointer-events: none;
          transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease;
        }

        .mobile-drawer.open {
          transform: translateY(0);
          opacity: 1;
          pointer-events: auto;
        }

        .mobile-drawer-links {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .mobile-drawer-links a {
          font-family: 'Archivo', sans-serif;
          font-size: 22px;
          font-weight: 700;
          color: var(--ink-900);
        }

        .mobile-drawer .mobile-ctas {
          margin-top: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          padding-bottom: 40px;
        }

        .mobile-drawer .mobile-ctas .btn {
          width: 100%;
          padding: 16px;
          font-size: 16px;
        }

        /* ---------- RESPONSIVE ---------- */
        @media (max-width: 900px) {
          .nav-links {
            display: none !important;
          }
          .nav-cta {
            display: none !important;
          }
          .mobile-toggle {
            display: block !important;
          }
          .hero-grid {
            grid-template-columns: 1fr;
            text-align: center;
            gap: 40px;
          }
          .hero h1 {
            margin: 0 auto;
          }
          .hero-sub {
            margin-left: auto;
            margin-right: auto;
          }
          .hero-ctas {
            justify-content: center;
          }
          .hero-stats {
            justify-content: center;
          }
          .board-frame {
            margin-top: 8px;
            max-width: 540px;
            margin-left: auto;
            margin-right: auto;
            width: 100%;
          }
          .lead-pill {
            display: none;
          }
          .funnel-row {
            grid-template-columns: 1fr 1fr;
          }
          .funnel-step::after {
            display: none !important;
          }
          .features-grid {
            grid-template-columns: 1fr 1fr;
          }
          .pricing-grid {
            grid-template-columns: 1fr;
            max-width: 450px;
            margin: 0 auto;
          }
          .board {
            grid-template-columns: 34px repeat(5, 1fr);
          }
        }

        @media (max-width: 560px) {
          .funnel-row {
            grid-template-columns: 1fr;
          }
          .features-grid {
            grid-template-columns: 1fr;
          }
          section {
            padding: 64px 0;
          }
          .hero {
            padding: 56px 0 72px;
          }
          .board {
            grid-template-columns: 28px repeat(5, 1fr);
          }
          .time-label {
            font-size: 8px !important;
          }
          .slot.filled {
            padding: 4px 6px !important;
          }
          .slot.filled b {
            font-size: 9px !important;
            line-height: 1.1;
          }
          .slot.filled span {
            display: none !important;
          }
          .board-caption {
            font-size: 11px;
          }
        }

        @media (max-width: 400px) {
          .board-frame {
            padding: 12px;
          }
          .board {
            grid-template-columns: 24px repeat(5, minmax(36px, 1fr));
            gap: 4px;
          }
          .day-label {
            font-size: 9px !important;
          }
          .time-label {
            font-size: 7.5px !important;
            padding-right: 3px !important;
          }
        }
      `}</style>

      <header className="nav">
        <div className="nav-inner">
          <div className="logo">
            <span className="dot"></span>CoachingSync
          </div>
          <nav className="nav-links">
            <a href="#features">Features</a>
            <a href="#funnel">How it works</a>
            <a href="#pricing">Pricing</a>
          </nav>
          <div className="nav-cta">
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn btn-primary">
                Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" className="btn btn-ghost-dark">
                  Log in
                </Link>
                <Link href="/signup" className="btn btn-primary">
                  Start free
                </Link>
              </>
            )}
          </div>

          {/* Hamburger button for mobile */}
          <button 
            className="mobile-toggle"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle navigation menu"
          >
            {isMobileMenuOpen ? (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            ) : (
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12"></line>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <line x1="3" y1="18" x2="21" y2="18"></line>
              </svg>
            )}
          </button>
        </div>

        {/* Mobile Navigation Drawer */}
        <div className={`mobile-drawer ${isMobileMenuOpen ? 'open' : ''}`}>
          <nav className="mobile-drawer-links">
            <a href="#features" onClick={() => setIsMobileMenuOpen(false)}>Features</a>
            <a href="#funnel" onClick={() => setIsMobileMenuOpen(false)}>How it works</a>
            <a href="#pricing" onClick={() => setIsMobileMenuOpen(false)}>Pricing</a>
          </nav>
          
          <div className="mobile-ctas">
            {isLoggedIn ? (
              <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-ghost-dark">
                  Log in
                </Link>
                <Link href="/signup" onClick={() => setIsMobileMenuOpen(false)} className="btn btn-primary">
                  Start free
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <section className="hero">
        <div className="wrap hero-grid">
          <div>
            <div className="eyebrow hero-eyebrow">For coaching centers in Dhaka</div>
            <h1>Every lead. Every batch. <em>One routine.</em></h1>
            <p className="hero-sub">Stop losing admissions in WhatsApp threads and register books. CoachingSync tracks every inquiry from first call to enrolled student, and drops them straight into the right batch on the schedule.</p>
            <div className="hero-ctas">
              {isLoggedIn ? (
                <Link href="/dashboard" className="btn btn-primary">
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link href="/signup" className="btn btn-primary">
                    Start free — no card needed
                  </Link>
                  <a href="#pricing" className="btn btn-outline-light">
                    See pricing
                  </a>
                </>
              )}
            </div>
            <div className="hero-stats">
              <div className="hero-stat"><b>2 seats</b> free, always</div>
              <div className="hero-stat"><span className="sep"></span><b>100 leads</b> /month on Free</div>
              <div className="hero-stat"><span className="sep"></span>Pay by <b>bKash, Nagad, Rocket</b></div>
            </div>
          </div>

          <div className="board-frame">
            <div className="board-head">
              <div className="board-title">This week's routine</div>
              <div className="board-live"><span className="pulse"></span>Live</div>
            </div>
            <div className="board">
              <div className="time-label"></div>
              <div className="day-label">SAT</div>
              <div className="day-label">SUN</div>
              <div className="day-label">MON</div>
              <div className="day-label">TUE</div>
              <div className="day-label">WED</div>

              <div className="time-label">4:00</div>
              <div className="slot filled gold"><b>HSC Physics</b><span>Batch 2A · 18 students</span></div>
              <div className="slot"></div>
              <div className="slot filled gold"><b>HSC Physics</b><span>Batch 2A · 18 students</span></div>
              <div className="slot"></div>
              <div className="slot filled gold"><b>HSC Physics</b><span>Batch 2A · 18 students</span></div>

              <div className="time-label">5:30</div>
              <div className="slot"></div>
              <div className="slot filled green"><b>Spoken English</b><span>Batch 4B · 12 students</span></div>
              <div className="slot"></div>
              <div className="slot filled green" id="target-slot"><b>Spoken English</b><span>Batch 4B · 12 students</span></div>
              <div className="slot"></div>

              <div className="time-label">7:00</div>
              <div className="slot filled red"><b>Admission Test Prep</b><span>Batch 1C · 9 students</span></div>
              <div className="slot"></div>
              <div className="slot filled red"><b>Admission Test Prep</b><span>Batch 1C · 9 students</span></div>
              <div className="slot"></div>
              <div className="slot filled red"><b>Admission Test Prep</b><span>Batch 1C · 9 students</span></div>

              <div className="lead-pill"><span className="avatar">R</span>Rafi enrolled → Batch 4B</div>
            </div>
            <div className="board-caption">Enrolled leads appear on the routine <b>automatically</b> — no re-entering students by hand.</div>
          </div>
        </div>
      </section>

      <div className="trust">
        <div className="wrap trust-inner">
          <span>Built for <b>admission coaching</b>, <b>language centers</b> <span className="trust-dot">·</span> and <b>skill academies</b> across <b>Dhaka</b> and <b>Chattogram</b></span>
        </div>
      </div>

      <section id="funnel" className="funnel">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow section-eyebrow">The admission funnel</div>
            <h2>From first call to first class, in one pipeline.</h2>
            <p>Every coaching center runs this exact sequence — CoachingSync just makes sure nobody falls out of it.</p>
          </div>
          <div className="funnel-row">
            <div className="funnel-step">
              <div className="fnum">01 / Inquiry</div>
              <h3>Lead comes in</h3>
              <p>Add a lead manually with a stage and a star rating, so your counselors know what's worth calling back first.</p>
            </div>
            <div className="funnel-step">
              <div className="fnum">02 / Trial</div>
              <h3>Counselor follows up</h3>
              <p>Every call, message, and visit gets logged on the lead's profile — nothing lives in someone's personal WhatsApp.</p>
            </div>
            <div className="funnel-step">
              <div className="fnum">03 / Enrolled</div>
              <h3>Lead becomes a student</h3>
              <p>One click converts an enrolled lead into a student record — no retyping their details from scratch.</p>
            </div>
            <div className="funnel-step">
              <div className="fnum">04 / Batch</div>
              <h3>Assigned to a routine</h3>
              <p>Pick the course and batch, and the student shows up on that batch's class schedule immediately.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="features">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow section-eyebrow">Everything in one place</div>
            <h2>Built around how a coaching center actually runs.</h2>
            <p>Not a generic CRM with education labels bolted on — every screen matches something your team already does on paper.</p>
          </div>
          <div className="features-grid">

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 15L7 4L11 12L14 6L16 15" stroke="#E3A72F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Lead pipeline with stages &amp; stars</h3>
              <p>Move leads through stages you define yourself, and star-rate them so counselors always know who to chase first.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><rect x="2" y="3" width="14" height="12" rx="1.5" stroke="#E3A72F" strokeWidth="1.6"/><path d="M2 7.5H16" stroke="#E3A72F" strokeWidth="1.6"/></svg>
              </div>
              <h3>Courses &amp; batches</h3>
              <p>Set up courses, split them into batches, and enrolled students appear in the right one without manual re-entry.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="7" stroke="#E3A72F" strokeWidth="1.6"/><path d="M9 5V9L12 11" stroke="#E3A72F" strokeWidth="1.6" strokeLinecap="round"/></svg>
              </div>
              <h3>Class schedules</h3>
              <p>Build the weekly routine per batch and mark classes done as they happen — a running record, not a static timetable.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 15V6.5L9 2L15 6.5V15H3Z" stroke="#E3A72F" strokeWidth="1.6" strokeLinejoin="round"/><path d="M7 15V10H11V15" stroke="#E3A72F" stroke-width="1.6"/></svg>
              </div>
              <h3>Student communication log</h3>
              <p>Every call, message, and visit for every student lives on one profile — visible to whoever picks up the phone next.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="6" cy="6" r="2.5" stroke="#E3A72F" strokeWidth="1.6"/><circle cx="13" cy="12" r="2.5" stroke="#E3A72F" strokeWidth="1.6"/><path d="M8 7.5L11 10.5" stroke="#E3A72F" strokeWidth="1.6"/></svg>
              </div>
              <h3>Role-based access</h3>
              <p>Admins and managers see everything. Counselors see all leads but only edit their own — no accidental overwrites.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M2 9H16M16 9L11 4M16 9L11 14" stroke="#E3A72F" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <h3>Bulk lead transfer</h3>
              <p>Admins and managers can reassign a batch of leads to a counselor in one move — useful the moment someone's on leave.</p>
            </div>

          </div>
        </div>
      </section>

      <section id="pricing" className="pricing">
        <div className="wrap">
          <div className="section-head">
            <div className="eyebrow section-eyebrow">Pricing</div>
            <h2>Start free. Pay only once you're growing.</h2>
            <p>Every paid plan is billed per branch. Pay by bKash, Nagad, or Rocket — no card required.</p>
          </div>

          <div className="toggle-wrap">
            <div className="toggle">
              <button 
                id="btn-monthly" 
                className={cycle === 'monthly' ? 'active' : ''} 
                onClick={() => setCycle('monthly')}
              >
                Monthly
              </button>
              <button 
                id="btn-yearly" 
                className={cycle === 'yearly' ? 'active' : ''} 
                onClick={() => setCycle('yearly')}
              >
                Yearly
              </button>
            </div>
            {cycle === 'yearly' && (
              <span className="save-badge" id="save-badge">
                Setup fee waived + 2 months free
              </span>
            )}
          </div>

          <div className="pricing-grid">
            <div className="price-card">
              <h3>Free</h3>
              <p className="price-desc">For getting your pipeline off paper.</p>
              <div className="price-num">
                <span className="amt">$0</span>
              </div>
              <div className="price-setup">No setup fee</div>
              <div className="price-list">
                <div><span className="check">✓</span>1 manager + 1 counselor</div>
                <div><span className="check">✓</span>100 leads per month</div>
                <div><span className="check">✓</span>Stages, stars &amp; batch scheduling</div>
              </div>
              {isLoggedIn ? (
                <Link href="/dashboard" className="btn">
                  Go to Dashboard
                </Link>
              ) : (
                <Link href="/signup" className="btn">
                  Start free
                </Link>
              )}
            </div>

            <div className="price-card featured">
              <span className="featured-tag">Most centers choose this</span>
              <h3>Basic</h3>
              <p className="price-desc">For one growing branch.</p>
              <div className="price-num">
                <span className="amt">
                  {cycle === 'monthly' ? '$35' : '$399'}
                </span>
                <span className="cyc">
                  {cycle === 'monthly' ? '/month' : '/year'}
                </span>
              </div>
              <div className="price-setup">
                {cycle === 'monthly' ? '+ $20 one-time setup fee' : 'No setup fee'}
              </div>
              <div className="price-list">
                <div><span className="check">✓</span>Up to 20 team members</div>
                <div><span className="check">✓</span>Unlimited leads</div>
                <div><span className="check">✓</span>Everything in Free</div>
                <div><span className="check">✓</span>Priority support</div>
              </div>
              {isLoggedIn ? (
                <Link href="/dashboard" className="btn btn-primary">
                  Choose Basic
                </Link>
              ) : (
                <Link href="/signup" className="btn btn-primary">
                  Choose Basic
                </Link>
              )}
            </div>

            <div className="price-card">
              <h3>Pro</h3>
              <p className="price-desc">For larger centers with big teams.</p>
              <div className="price-num">
                <span className="amt">
                  {cycle === 'monthly' ? '$70' : '$799'}
                </span>
                <span className="cyc">
                  {cycle === 'monthly' ? '/month' : '/year'}
                </span>
              </div>
              <div className="price-setup">
                {cycle === 'monthly' ? '+ $20 one-time setup fee' : 'No setup fee'}
              </div>
              <div className="price-list">
                <div><span className="check">✓</span>Up to 100 team members</div>
                <div><span className="check">✓</span>Unlimited leads</div>
                <div><span className="check">✓</span>Everything in Basic</div>
                <div><span className="check">✓</span>Dedicated onboarding</div>
              </div>
              {isLoggedIn ? (
                <Link href="/dashboard" className="btn">
                  Choose Pro
                </Link>
              ) : (
                <Link href="/signup" className="btn">
                  Choose Pro
                </Link>
              )}
            </div>
          </div>

          <p className="custom-note">Running more than one branch, or need a custom plan? <a href="#">Talk to us</a> — every branch unlocks with its own plan.</p>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap">
          <h2>Your next admission is one WhatsApp message away from getting lost.</h2>
          <p>Set up CoachingSync in an afternoon — free for your first two team members.</p>
          <div className="hero-ctas">
            {isLoggedIn ? (
              <Link href="/dashboard" className="btn btn-primary">
                Go to Dashboard
              </Link>
            ) : (
              <Link href="/signup" className="btn btn-primary">
                Start free — no card needed
              </Link>
            )}
          </div>
        </div>
      </section>

      <footer>
        <div className="wrap footer-inner">
          <div className="logo">
            <span className="dot"></span>CoachingSync
          </div>
          <div className="footer-links">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#">Contact</a>
          </div>
          <div className="footer-fine">© 2026 CoachingSync, Dhaka</div>
        </div>
      </footer>
    </div>
  )
}
