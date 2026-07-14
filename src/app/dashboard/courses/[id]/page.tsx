import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getCourseByIdAction } from '@/app/actions/courses'
import { createClient } from '@/utils/supabase/server'
import CourseDetailClient from '@/components/CourseDetailClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Course Details | CoachingSync',
}

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getUserSession()
  if (!user) redirect('/login')

  const resolvedParams = await params
  const { data: course, error } = await getCourseByIdAction(resolvedParams.id)

  if (error || !course) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh] text-center">
        <h1 className="text-xl font-bold text-[#D4D4D4] mb-2">Course Not Found</h1>
        <p className="text-xs text-[#858585] mb-6">The course you are looking for does not exist or you do not have permission to view it.</p>
        <Link href="/dashboard/courses" className="px-4 py-2 bg-[#007ACC] text-white text-xs rounded-sm hover:bg-[#005999] transition-colors">
          Return to Courses
        </Link>
      </div>
    )
  }

  // Get staff for batch instructor assignment
  const supabase = await createClient()
  const { data: staffData } = await supabase
    .from('User')
    .select('id, fullName, role')
    .eq('companyId', user.companyId)
    
  const staff = staffData || []

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <div>
        <Link href="/dashboard/courses" className="inline-flex items-center gap-1.5 text-xs text-[#858585] hover:text-[#D4D4D4] transition-colors mb-4">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Courses
        </Link>
        <h1 className="text-2xl font-bold text-[#D4D4D4] mb-2">{course.name}</h1>
        <p className="text-xs text-[#858585]">Manage course details and schedule batches.</p>
      </div>

      <CourseDetailClient course={course} staff={staff} />
    </div>
  )
}
