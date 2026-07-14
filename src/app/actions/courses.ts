'use server'

import { createClient } from '@/utils/supabase/server'
import { getUserSession } from '@/lib/auth'

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

  const title = formData.get('title') as string
  const fee = formData.get('fee') as string
  const description = formData.get('description') as string

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Course')
    .insert({
      companyId: user.companyId,
      title,
      fee,
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
  const schedule = formData.get('schedule') as string
  const capacity = formData.get('capacity') as string
  const startDateStr = formData.get('startDate') as string
  const endDateStr = formData.get('endDate') as string

  const supabase = await createClient()

  const { data, error } = await supabase
    .from('Batch')
    .insert({
      courseId,
      companyId: user.companyId,
      name,
      schedule,
      capacity,
      startDate: startDateStr ? new Date(startDateStr).toISOString() : null,
      endDate: endDateStr ? new Date(endDateStr).toISOString() : null,
    })
    .select()
    .single()

  if (error) {
    console.error('Error creating batch:', error)
    return { error: 'Failed to create batch' }
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
