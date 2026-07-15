'use client'

import { useState } from 'react'
import { LayoutDashboard, Users, UserSquare, LogOut, CheckSquare, BarChart, Menu, X, Settings, BookOpen, CreditCard, Calendar, Plus } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface User {
  fullName: string
  role: string
}

interface DashboardNavClientProps {
  user: User
  isAdminOrManager: boolean
  children: React.ReactNode
  logoutAction: () => Promise<void>
  planName: string
  maxSeats: number | null
  maxLeads: number | null
  currentSeats: number
  currentLeads: number
}

export default function DashboardNavClient({
  user,
  isAdminOrManager,
  children,
  logoutAction,
  planName,
  maxSeats,
  maxLeads,
  currentSeats,
  currentLeads,
}: DashboardNavClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Overview',
      icon: LayoutDashboard,
      show: true,
    },
    {
      href: '/dashboard/leads',
      label: 'Leads',
      icon: Users,
      show: true,
    },
    {
      href: '/dashboard/courses',
      label: 'Courses & Batches',
      icon: BookOpen,
      show: isAdminOrManager,
    },
    {
      href: '/dashboard/schedule',
      label: 'Schedule',
      icon: Calendar,
      show: true,
    },
    {
      href: '/dashboard/reports',
      label: 'Reports',
      icon: BarChart,
      show: isAdminOrManager,
    },
    {
      href: '/dashboard/staff',
      label: 'Staff Management',
      icon: UserSquare,
      show: user.role === 'Super Admin',
    },
    {
      href: '/dashboard/billing',
      label: 'Billing & Subscriptions',
      icon: CreditCard,
      show: user.role === 'Super Admin',
    },
    {
      href: '/dashboard/settings',
      label: 'Settings',
      icon: Settings,
      show: isAdminOrManager,
    },
  ]

  // Resolve title based on pathname to match user's custom specs
  const getHeaderInfo = () => {
    const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })
    
    if (pathname === '/dashboard') {
      return { title: 'Overview', sub: `${todayStr} — here's how things look today.` }
    }
    if (pathname === '/dashboard/leads') {
      return { title: 'Leads', sub: 'Manage and track your prospective student recruitment.' }
    }
    if (pathname?.startsWith('/dashboard/leads/new')) {
      return { title: 'Add New Lead', sub: 'Create a new lead profile in the recruitment pipeline.' }
    }
    if (pathname?.startsWith('/dashboard/leads/')) {
      return { title: 'Lead Details', sub: 'View and manage lead profile and enrollment.' }
    }
    if (pathname === '/dashboard/tasks') {
      return { title: 'Tasks', sub: 'Track your daily follow-ups and schedule.' }
    }
    if (pathname === '/dashboard/courses') {
      return { title: 'Courses & Batches', sub: 'Manage courses and schedule batches for your students.' }
    }
    if (pathname?.startsWith('/dashboard/courses/')) {
      return { title: 'Course Details', sub: 'Manage batches and curriculum details.' }
    }
    if (pathname?.startsWith('/dashboard/batches/')) {
      return { title: 'Batch Details', sub: 'Manage student enrollments and class routine.' }
    }
    if (pathname === '/dashboard/schedule') {
      return { title: 'Schedule', sub: "This week's routine across all batches." }
    }
    if (pathname === '/dashboard/billing') {
      return { title: 'Billing & Subscriptions', sub: 'Manage your company subscription and billing details.' }
    }
    if (pathname === '/dashboard/settings') {
      return { title: 'Settings', sub: 'Configure custom pipeline stages and dashboard preferences.' }
    }
    if (pathname === '/dashboard/staff') {
      return { title: 'Staff Management', sub: 'Manage your team access and roles.' }
    }
    if (pathname === '/dashboard/reports') {
      return { title: 'Reports', sub: 'Analyze lead conversion rates and team performances.' }
    }
    return { title: 'Workspace', sub: 'Manage your coaching operations.' }
  }

  const headerInfo = getHeaderInfo()

  // Render function to avoid unmounting/remounting subtree performance issues
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#16241F] text-[#F2EFE6]">
      {/* Brand logo area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-[rgba(242,239,230,0.14)] shrink-0">
        <div className="flex items-center gap-2.5 font-bold text-base">
          <span className="w-2.5 h-2.5 bg-[#E3A72F] rounded-[2px] rotate-45 shrink-0" />
          <span className="font-extrabold tracking-tight text-[17px] text-[#F2EFE6] font-display">CoachingSync</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-2 rounded-sm bg-transparent border border-[rgba(242,239,230,0.14)] text-[rgba(242,239,230,0.65)] hover:text-[#F2EFE6] transition-all"
          aria-label="Close sidebar menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Nav links */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <div className="font-mono text-[10.5px] uppercase tracking-wider text-[rgba(242,239,230,0.35)] px-4 mb-3 select-none">
          Workspace
        </div>
        <nav className="space-y-1">
          {navItems
            .filter((item) => item.show)
            .map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`flex items-center px-4 py-3 text-xs font-bold rounded-sm transition-all duration-200 group ${
                    isActive
                      ? 'text-[#16241F] bg-[#E3A72F]'
                      : 'text-[rgba(242,239,230,0.65)] hover:text-[#F2EFE6] hover:bg-[rgba(242,239,230,0.06)]'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-4.5 w-4.5 transition-colors ${
                      isActive ? 'text-[#16241F]' : 'text-[rgba(242,239,230,0.5)] group-hover:text-[#F2EFE6]'
                    }`}
                  />
                  {item.label}
                </Link>
              )
            })}
        </nav>
      </div>
      

      {/* Profile & Logout card */}
      <div className="p-4 border-t border-[rgba(242,239,230,0.14)] shrink-0">
        <div className="flex items-center p-3 rounded-md bg-transparent border border-[rgba(242,239,230,0.1)] mb-4">
          <div className="flex-shrink-0">
            <div className="h-9 w-9 rounded-sm bg-[#E3A72F] text-[#16241F] font-extrabold flex items-center justify-center text-sm">
              {user.fullName.charAt(0) + (user.fullName.split(' ')[1]?.charAt(0) || '')}
            </div>
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-xs font-bold text-[#F2EFE6] truncate">{user.fullName}</p>
            <p className="text-[9px] font-mono font-bold text-[#E3A72F] uppercase tracking-wider">{user.role}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 px-4 py-2.5 text-xs font-bold rounded-sm text-red-400 bg-[rgba(242,239,230,0.04)] border border-[rgba(242,239,230,0.1)] hover:border-[rgba(242,239,230,0.2)] active:translate-y-0.5 transition-all duration-150"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[var(--bg)] text-[var(--text-1)] overflow-hidden w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-[var(--line)] bg-[#16241F]">
        {renderSidebarContent()}
      </aside>

      {/* Mobile Drawer Navigation (Overlay) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          {/* Overlay Background */}
          <div
            onClick={() => setIsMobileOpen(false)}
            className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
          />
          {/* Drawer Panel */}
          <aside className="relative w-64 max-w-xs flex flex-col bg-[#16241F] border-r border-[var(--line)] shadow-2xl animate-in slide-in-from-left duration-200">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[var(--bg)]">
        {/* Header */}
        <header className="h-20 border-b border-[var(--line)] flex items-center justify-between px-8 bg-transparent shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2 rounded-sm bg-[var(--bg-deep)] border border-[var(--line)] text-[var(--text-3)] hover:text-[var(--text-1)] mr-2 transition-all"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-[var(--text-1)] font-display tracking-tight leading-none mb-1">{headerInfo.title}</h1>
              <p className="text-[11px] text-[var(--text-3)] leading-none">{headerInfo.sub}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Search Box */}
            <div className="hidden md:flex items-center gap-2 bg-[var(--card)] border border-[var(--line)] rounded-sm px-3 py-2 w-56">
              <svg className="w-3.5 h-3.5 text-[var(--text-3)]" viewBox="0 0 14 14" fill="none">
                <circle cx="6" cy="6" r="4.3" stroke="currentColor" strokeWidth="1.4"/>
                <path d="M9.2 9.2L12 12" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              <input 
                type="text"
                placeholder="Search leads, students..."
                className="bg-transparent border-none outline-none text-xs text-[var(--text-1)] placeholder-[var(--text-3)] w-full"
              />
            </div>
            
            {/* Notification Bell */}
            <button className="w-9 h-9 rounded-sm bg-[var(--card)] border border-[var(--line)] hover:border-[var(--text-3)] text-[var(--text-1)] flex items-center justify-center relative transition-all">
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-[#D6584A]" />
              <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
                <path d="M4 6.5C4 4 5.8 2.5 8 2.5C10.2 2.5 12 4 12 6.5C12 10 13.5 10.7 13.5 11.3C13.5 11.7 13.1 12 12.6 12H3.4C2.9 12 2.5 11.7 2.5 11.3C2.5 10.7 4 10 4 6.5Z" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M6.5 13.5C6.9 14 7.4 14.2 8 14.2C8.6 14.2 9.1 14 9.5 13.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </button>
            
            {/* Add Lead Link Button */}
            <Link
              href="/dashboard/leads/new"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#E3A72F] hover:bg-[#C4880E] text-[#16241F] text-xs font-bold rounded-sm border border-[rgba(22,36,31,0.12)] active:translate-y-0.5 transition-all duration-150"
            >
              <Plus className="w-4 h-4" />
              Add Lead
            </Link>
          </div>
        </header>

        {/* Scrollable Viewport Wrapper */}
        <main className="flex-1 overflow-auto p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
