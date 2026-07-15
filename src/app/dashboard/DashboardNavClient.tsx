'use client'

import { useState } from 'react'
import { LayoutDashboard, Users, UserSquare, LogOut, CheckSquare, BarChart, Menu, X, Settings, Kanban, BookOpen, CreditCard, Calendar } from 'lucide-react'
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
}

export default function DashboardNavClient({
  user,
  isAdminOrManager,
  children,
  logoutAction,
}: DashboardNavClientProps) {
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const pathname = usePathname()

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
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
      href: '/dashboard/tasks',
      label: 'Tasks',
      icon: CheckSquare,
      show: true,
    },
    {
      href: '/dashboard/courses',
      label: 'Courses',
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

  // Render function to avoid unmounting/remounting subtree performance issues
  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-[#1E1E1E] text-[#D4D4D4]">
      {/* Brand area */}
      <div className="h-20 flex items-center justify-between px-6 border-b border-[#111317]/20 shrink-0">
        <div className="flex items-center gap-2.5 font-bold text-base">
          <div className="w-8 h-8 rounded-sm bg-gradient-to-br from-[#007ACC] to-[#0062A3] border border-[#3E3E42] flex items-center justify-center">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none">
              <path d="M2 12L22 4L14 22L11 14L2 12Z" fill="white"/>
            </svg>
          </div>
          <span className="font-bold tracking-tight text-lg text-[#D4D4D4] font-display">CoachingSync</span>
        </div>
        <button
          onClick={() => setIsMobileOpen(false)}
          className="lg:hidden p-2 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] active:border border-[#3E3E42] text-[#CCCCCC] hover:text-[#D4D4D4] transition-all"
          aria-label="Close sidebar menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      
      {/* Nav links */}
      <div className="flex-1 overflow-y-auto py-6 px-4">
        <nav className="space-y-3">
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
                      ? 'text-[#D4D4D4] bg-[#1E1E1E] border border-[#3E3E42]'
                      : 'text-[#CCCCCC] hover:text-[#D4D4D4] hover:border-[#555555]'
                  }`}
                >
                  <Icon
                    className={`mr-3 h-4.5 w-4.5 transition-colors ${
                      isActive ? 'text-[#007ACC]' : 'text-[#858585] group-hover:text-[#007ACC]'
                    }`}
                  />
                  {item.label}
                </Link>
              )
            })}
        </nav>
      </div>
      
      {/* Profile & Logout card */}
      <div className="p-4 border-t border-[#111317]/20 shrink-0">
        <div className="flex items-center p-3 rounded-md bg-[#1E1E1E] border border-[#3E3E42] mb-4">
          <div className="flex-shrink-0">
            <div className="h-9 w-9 rounded-sm bg-gradient-to-br from-[#007ACC] to-[#0062A3] shadow-sm flex items-center justify-center text-white font-bold text-sm">
              {user.fullName.charAt(0)}
            </div>
          </div>
          <div className="ml-3 min-w-0">
            <p className="text-xs font-bold text-[#D4D4D4] truncate">{user.fullName}</p>
            <p className="text-[10px] font-semibold text-[#858585] truncate">{user.role}</p>
          </div>
        </div>
        <form action={logoutAction}>
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-bold rounded-sm text-red-500 bg-[#1E1E1E] border border-[#3E3E42] hover:border-[#555555] active:translate-y-0.5 transition-all duration-150"
          >
            <LogOut className="h-4.5 w-4.5" />
            Sign out
          </button>
        </form>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-[#1E1E1E] text-[#D4D4D4] overflow-hidden w-full">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 border-r border-[#111317]/20 bg-[#1E1E1E] border border-[#3E3E42]">
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
          <aside className="relative w-64 max-w-xs flex flex-col bg-[#1E1E1E] border-r border-[#111317]/20 shadow-2xl animate-in slide-in-from-left duration-200">
            {renderSidebarContent()}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#1E1E1E]">
        {/* Header */}
        <header className="h-16 border-b border-[#111317]/20 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-[#1E1E1E]/80 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileOpen(true)}
              className="lg:hidden p-2.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] active:border border-[#3E3E42] text-[#CCCCCC] hover:text-[#D4D4D4] transition-all"
              aria-label="Open sidebar menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm sm:text-base font-bold text-[#CCCCCC] truncate">
              Welcome back, <span className="text-[#D4D4D4]">{user.fullName.split(' ')[0]}</span>
            </h2>
          </div>
        </header>

        {/* Scrollable Viewport Wrapper */}
        <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
