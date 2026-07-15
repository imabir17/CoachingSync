import { getUserSession } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { LeadFilters } from '@/components/LeadFilters'
import { getStagesAction } from '@/app/actions/stages'
import LeadsTableClient from './LeadsTableClient'

export default async function LeadsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ [key: string]: string | string[] | undefined }> 
}) {
  const user = await getUserSession()
  if (!user) return null

  const resolvedSearchParams = await searchParams
  const q = resolvedSearchParams.q as string | undefined
  const stage = resolvedSearchParams.stage as string | undefined
  const rating = resolvedSearchParams.rating as string | undefined
  const counselorId = resolvedSearchParams.counselorId as string | undefined
  const source = resolvedSearchParams.source as string | undefined
  const courseId = resolvedSearchParams.courseId as string | undefined
  const batchId = resolvedSearchParams.batchId as string | undefined

  const isAdminOrManager = user.role === 'Super Admin' || user.role === 'Manager'
  const supabase = await createClient()
  
  // 1. Fetch counselors for filtering and transfer
  const { data: counselorsData } = await supabase
    .from('User')
    .select('id, fullName')
    .eq('role', 'Counselor')
    .eq('companyId', user.companyId)
  
  const counselors = counselorsData || []

  // 2. Fetch distinct sources from database (filtered in memory for simplicity)
  const { data: rawSources } = await supabase
    .from('Lead')
    .select('source')
    .eq('companyId', user.companyId)

  const dbSources = rawSources ? (rawSources.map(s => s.source).filter(Boolean) as string[]) : []
  const predefinedSources = ['Facebook', 'Google', 'Instagram', 'Word of Mouth', 'Walk-in', 'Agent', 'Event/Seminar', 'Other']
  const allSources = Array.from(new Set([...predefinedSources, ...dbSources])).sort()

  // 3. Fetch courses and batches for filtering
  const { data: coursesData } = await supabase
    .from('Course')
    .select('id, name')
    .eq('companyId', user.companyId)
    .order('name', { ascending: true })

  const courseIds = coursesData?.map(c => c.id) || []

  const { data: batchesData } = await supabase
    .from('Batch')
    .select('id, name, courseId')
    .in('courseId', courseIds)
    .order('name', { ascending: true })

  // 3. Build the Supabase query based on search and filters
  let query = supabase
    .from('Lead')
    .select('*, assignedCounselor:User!Lead_assignedCounselorId_fkey(*)')
    .eq('companyId', user.companyId)
    .order('createdAt', { ascending: false })
  
  if (counselorId) {
    query = query.eq('assignedCounselorId', counselorId)
  }

  if (q) {
    query = query.or(`fullName.ilike.%${q}%,email.ilike.%${q}%,phone.ilike.%${q}%`)
  }

  if (stage) {
    query = query.eq('stage', stage)
  }
  
  if (rating) {
    query = query.eq('rating', rating)
  }

  if (source) {
    query = query.eq('source', source)
  }

  if (batchId) {
    const { data: enrollments } = await supabase
      .from('BatchEnrollment')
      .select('leadId')
      .eq('batchId', batchId)
    
    const leadIds = enrollments?.map(e => e.leadId) || []
    query = query.in('id', leadIds.length > 0 ? leadIds : ['none-found-matching-batch'])
  } else if (courseId) {
    const { data: courseBatches } = await supabase
      .from('Batch')
      .select('id')
      .eq('courseId', courseId)
    
    const batchIds = courseBatches?.map(b => b.id) || []
    
    if (batchIds.length > 0) {
      const { data: enrollments } = await supabase
        .from('BatchEnrollment')
        .select('leadId')
        .in('batchId', batchIds)
      
      const leadIds = enrollments?.map(e => e.leadId) || []
      query = query.in('id', leadIds.length > 0 ? leadIds : ['none-found-matching-course'])
    } else {
      query = query.in('id', ['none-found-matching-course'])
    }
  }

  const { data: leadsData, error: queryError } = await query
  console.log('Leads Page Debug:', {
    userId: user.id,
    userRole: user.role,
    userCompanyId: user.companyId,
    leadsCount: leadsData ? leadsData.length : null,
    searchParams: resolvedSearchParams
  })
  if (queryError) {
    console.error('Leads Query Error:', {
      message: queryError.message,
      details: queryError.details,
      hint: queryError.hint,
      code: queryError.code
    })
  }
  const leads = leadsData || []

  // Fetch customizable stages
  const stages = await getStagesAction()

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <div className="space-y-6">
        <LeadFilters 
          isAdminOrManager={isAdminOrManager} 
          counselors={counselors} 
          sources={allSources} 
          stages={stages}
          courses={coursesData || []}
          batches={batchesData || []}
        />
        <LeadsTableClient leads={leads} isAdminOrManager={isAdminOrManager} counselors={counselors} />
      </div>
    </div>
  )
}
