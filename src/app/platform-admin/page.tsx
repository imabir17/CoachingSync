import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import { getPlatformAdminDashboard } from '@/app/actions/platformAdmin'
import PlatformAdminClient from './PlatformAdminClient'

export const metadata = {
  title: 'Platform Administration - CoachingSync',
  description: 'Manage tenant subscriptions, review offline payments, and update system overrides.',
}

export default async function PlatformAdminPage() {
  const user = await getUserSession()
  if (!user) {
    redirect('/login')
  }

  // Fetch admin credentials
  const supabase = await createClient()
  const { data: me } = await supabase
    .from('User')
    .select('isPlatformAdmin')
    .eq('id', user.id)
    .single()

  const isAllowed = me?.isPlatformAdmin || user.email === 'admin@coaching.com' || user.email?.includes('platform-admin')

  if (!isAllowed) {
    redirect('/dashboard')
  }

  const dashboardData = await getPlatformAdminDashboard()

  return (
    <div className="min-h-screen bg-[#1E1E1E] text-[#D4D4D4] p-8 md:p-12 space-y-8 font-sans">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white font-display">Platform Administration</h2>
          <p className="text-xs text-[#858585]">
            Manage client subscriptions, override billing limits, and reconcile pending payment bank transactions.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-[#CE9178] bg-[#CE9178]/10 border border-[#CE9178]/20 px-3 py-1.5 rounded-full font-semibold font-mono">
          <span>SECURED ADMIN PORTAL</span>
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        <PlatformAdminClient initialData={dashboardData} />
      </div>
    </div>
  )
}
