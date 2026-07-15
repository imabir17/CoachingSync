import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import CoursesClient from '@/components/CoursesClient'
import { getCoursesAction } from '@/app/actions/courses'

export const metadata = {
  title: 'Courses & Batches | CoachingSync',
}

export default async function CoursesPage() {
  const user = await getUserSession()
  if (!user) redirect('/login')

  const { data: courses } = await getCoursesAction()

  const supabase = await createClient()
  const { data: staffData } = await supabase
    .from('User')
    .select('id, fullName, role')
    .eq('companyId', user.companyId)

  const staff = staffData || []

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <CoursesClient initialCourses={courses || []} staff={staff} />
    </div>
  )
}
