'use server'

import { createClient } from '@/utils/supabase/server'
import { getUserSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'

export async function getCoursesAction() {
  const user = await getUserSession()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('Course')
    .select('*, batches:Batch(*)')
    .eq('companyId', user.companyId)
    .order('createdAt', { ascending: false })

  if (error) {
    console.error('Error fetching courses:', error)
    return { error: 'Failed to fetch courses' }
  }

  return { data }
}

export async function createCourseAction(formData: FormData) {
  const user = await getUserSession()
  if (!user) return { error: 'Unauthorized' }

  const name = formData.get('name') as string
  const fee = formData.get('fee') as string
  const inChargeId = formData.get('inChargeId') as string
  const description = formData.get('description') as string

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Course')
    .insert({
      companyId: user.companyId,
      name,
      fee,
      inChargeId: inChargeId || null,
      description
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating course:', error)
    return { error: `Failed to create course: ${error.message || JSON.stringify(error)}` }
  }

  return { success: true, course: data }
}

export async function createBatchAction(formData: FormData) {
  const user = await getUserSession()
  if (!user) return { error: 'Unauthorized' }

  const courseId = formData.get('courseId') as string
  const name = formData.get('name') as string
  const capacityStr = formData.get('capacity') as string
  const startDateStr = formData.get('startDate') as string
  const endDateStr = formData.get('endDate') as string
  const instructorId = formData.get('instructorId') as string

  const capacity = capacityStr ? parseInt(capacityStr, 10) : null

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Batch')
    .insert({
      courseId,
      name,
      capacity,
      instructorId: instructorId || null,
      startDate: startDateStr ? new Date(startDateStr).toISOString() : null,
      endDate: endDateStr ? new Date(endDateStr).toISOString() : null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating batch:', error)
    return { error: `Failed to create batch: ${error.message || JSON.stringify(error)}` }
  }

  return { success: true, batch: data }
}

export async function addLeadToBatchAction(batchId: string, leadId: string) {
  const user = await getUserSession()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { error } = await supabase
    .from('BatchEnrollment')
    .insert({
      batchId,
      leadId
    })

  if (error) {
    console.error('Error adding lead to batch:', error)
    return { error: 'Failed to add lead to batch' }
  }

  return { success: true }
}

export async function getCourseByIdAction(id: string) {
  const user = await getUserSession()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()
  
  const { data: course, error: courseError } = await supabase
    .from('Course')
    .select('*')
    .eq('id', id)
    .eq('companyId', user.companyId)
    .single()

  if (courseError) {
    console.error('Error fetching course:', courseError)
    return { error: 'Failed to fetch course' }
  }

  const { data: batches } = await supabase
    .from('Batch')
    .select('*')
    .eq('courseId', id)

  const { data: staff } = await supabase
    .from('User')
    .select('*')
    .eq('companyId', user.companyId)

  const staffMap = new Map(staff?.map(s => [s.id, s]) || [])

  const batchIds = batches?.map(b => b.id) || []
  let enrolledLeads: any[] = []

  if (batchIds.length > 0) {
    const { data: enrollments } = await supabase
      .from('BatchEnrollment')
      .select('*, lead:Lead(*)')
      .in('batchId', batchIds)

    const seen = new Set()
    enrolledLeads = (enrollments || [])
      .map(e => e.lead)
      .filter(Boolean)
      .filter((lead: any) => {
        if (seen.has(lead.id)) return false
        seen.add(lead.id)
        return true
      })
  }

  const result = {
    ...course,
    inCharge: course.inChargeId ? staffMap.get(course.inChargeId) || null : null,
    batches: (batches || []).map(b => ({
      ...b,
      instructor: b.instructorId ? staffMap.get(b.instructorId) || null : null
    })),
    enrolledStudents: enrolledLeads
  }

  return { data: result }
}

export async function getBatchDetailsAction(batchId: string) {
  const user = await getUserSession()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { data: batch, error: batchError } = await supabase
    .from('Batch')
    .select('*')
    .eq('id', batchId)
    .single()

  if (batchError || !batch) {
    console.error('Error fetching batch:', batchError)
    return { error: 'Failed to fetch batch' }
  }

  const { data: course, error: courseError } = await supabase
    .from('Course')
    .select('*')
    .eq('id', batch.courseId)
    .eq('companyId', user.companyId)
    .single()

  if (courseError || !course) {
    console.error('Error fetching course for batch:', courseError)
    return { error: 'Unauthorized or course not found' }
  }

  let instructor = null
  if (batch.instructorId) {
    const { data: instructorData } = await supabase
      .from('User')
      .select('*')
      .eq('id', batch.instructorId)
      .single()
    instructor = instructorData || null
  }

  const { data: enrollments } = await supabase
    .from('BatchEnrollment')
    .select('*, lead:Lead(*)')
    .eq('batchId', batchId)

  const students = enrollments?.map(e => e.lead).filter(Boolean) || []

  const { data: schedules } = await supabase
    .from('ClassSchedule')
    .select('*')
    .eq('batchId', batchId)
    .order('classDate', { ascending: true })

  return {
    data: {
      ...batch,
      course,
      instructor,
      students,
      schedules: schedules || []
    }
  }
}

export async function createClassScheduleAction(formData: FormData) {
  const user = await getUserSession()
  if (!user) return { error: 'Unauthorized' }

  const batchId = formData.get('batchId') as string
  const title = formData.get('title') as string
  const classDate = formData.get('classDate') as string
  const startTime = formData.get('startTime') as string || null
  const endTime = formData.get('endTime') as string || null

  if (!batchId || !title || !classDate) {
    return { error: 'Required fields are missing' }
  }

  const supabase = await createClient()

  const { data: batch } = await supabase
    .from('Batch')
    .select('courseId')
    .eq('id', batchId)
    .single()

  if (!batch) return { error: 'Batch not found' }

  const { data: course } = await supabase
    .from('Course')
    .select('id')
    .eq('id', batch.courseId)
    .eq('companyId', user.companyId)
    .single()

  if (!course) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('ClassSchedule')
    .insert({
      batchId,
      title,
      classDate,
      startTime,
      endTime
    })

  if (error) {
    console.error('Error creating class schedule:', error)
    return { error: 'Failed to create class schedule' }
  }

  revalidatePath(`/dashboard/batches/${batchId}`)
  return { success: true }
}

export async function toggleClassStatusAction(scheduleId: string, isCompleted: boolean) {
  const user = await getUserSession()
  if (!user) return { error: 'Unauthorized' }

  const supabase = await createClient()

  const { data: schedule } = await supabase
    .from('ClassSchedule')
    .select('*, batch:Batch(courseId)')
    .eq('id', scheduleId)
    .single()

  if (!schedule) return { error: 'Schedule not found' }

  const batch = schedule.batch as any
  const { data: course } = await supabase
    .from('Course')
    .select('id')
    .eq('id', batch.courseId)
    .eq('companyId', user.companyId)
    .single()

  if (!course) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('ClassSchedule')
    .update({ isCompleted })
    .eq('id', scheduleId)

  if (error) {
    console.error('Error toggling class status:', error)
    return { error: 'Failed to update status' }
  }

  revalidatePath(`/dashboard/batches/${schedule.batchId}`)
  return { success: true }
}
