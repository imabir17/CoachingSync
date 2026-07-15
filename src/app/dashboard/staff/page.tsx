import { getUserSession } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import StaffClient from './StaffClient'
import { getInvites } from '@/app/actions/staff'

export default async function StaffManagementPage() {
  const user = await getUserSession()
  
  // Super Admin and Manager can access this page
  if (!user || !['Super Admin', 'Manager'].includes(user.role)) {
    redirect('/dashboard')
  }

  const supabase = await createClient()

  const { data: usersData } = await supabase
    .from('User')
    .select('id, fullName, email, role, status')
    .eq('companyId', user.companyId)
    .order('createdAt', { ascending: false })

  const users = usersData || []
  const invites = await getInvites()

  return (
    <>
      <StaffClient 
        initialUsers={users} 
        initialInvites={invites} 
        currentUserId={user.id}
        currentUserRole={user.role}
      />
    </>
  )
}
