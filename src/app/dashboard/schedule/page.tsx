import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { createClient } from '@/utils/supabase/server'
import ScheduleClient from './ScheduleClient'

export const metadata = {
  title: 'Routine Schedule | CoachingSync',
}

export default async function SchedulePage() {
  const user = await getUserSession()
  if (!user) redirect('/login')

  const supabase = await createClient()

  // 1. Get all courses belonging to this company
  const { data: courses } = await supabase
    .from('Course')
    .select('id, name')
    .eq('companyId', user.companyId)

  const courseIds = courses?.map(c => c.id) || []

  let initialSchedules: any[] = []
  let initialBatches: any[] = []

  if (courseIds.length > 0) {
    // 2. Get all batches for these courses
    const { data: batchesData } = await supabase
      .from('Batch')
      .select('*, Course(*)')
      .in('courseId', courseIds)

    initialBatches = batchesData || []
    const batchIds = initialBatches.map(b => b.id)

    if (batchIds.length > 0) {
      // 3. Get class schedules for these batches
      const { data: schedulesData } = await supabase
        .from('ClassSchedule')
        .select('*, Batch(*, Course(*))')
        .in('batchId', batchIds)
        .order('classDate', { ascending: true })

      initialSchedules = schedulesData || []
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <div>
        <h1 className="text-2xl font-bold text-white font-display mb-2">Routine Schedule</h1>
        <p className="text-xs text-gray-400">View weekly schedule and routines across all course batches.</p>
      </div>

      <ScheduleClient initialSchedules={initialSchedules} initialBatches={initialBatches} />
    </div>
  )
}
