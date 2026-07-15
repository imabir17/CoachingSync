import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { logout } from '@/app/actions/auth'
import { createClient } from '@/utils/supabase/server'
import DashboardNavClient from './DashboardNavClient'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const user = await getUserSession()

  if (!user) {
    redirect('/login')
  }

  const isAdminOrManager = user.role === 'Super Admin' || user.role === 'Manager'

  const supabase = await createClient()

  // Get active subscription and plan details
  const { data: sub } = await supabase
    .from('Subscription')
    .select(`
      *,
      Plan (*)
    `)
    .eq('companyId', user.companyId)
    .maybeSingle()

  // Count active team members in company
  const { count: userCount } = await supabase
    .from('User')
    .select('*', { count: 'exact', head: true })
    .eq('companyId', user.companyId)

  // Count leads created this month
  const startOfMonth = new Date()
  startOfMonth.setDate(1)
  startOfMonth.setHours(0, 0, 0, 0)
  
  const { count: leadCount } = await supabase
    .from('Lead')
    .select('*', { count: 'exact', head: true })
    .eq('companyId', user.companyId)
    .gte('createdAt', startOfMonth.toISOString())

  const planName = sub?.Plan?.name || 'Free'
  const maxSeats = sub?.overrideUserLimit || sub?.Plan?.userLimit || 2
  const maxLeads = sub?.overrideLeadLimit || sub?.Plan?.leadLimitPerMonth || 100
  const currentSeats = userCount || 0
  const currentLeads = leadCount || 0

  return (
    <DashboardNavClient
      user={user}
      isAdminOrManager={isAdminOrManager}
      logoutAction={logout}
      planName={planName}
      maxSeats={maxSeats}
      maxLeads={maxLeads}
      currentSeats={currentSeats}
      currentLeads={currentLeads}
    >
      {children}
    </DashboardNavClient>
  )
}
