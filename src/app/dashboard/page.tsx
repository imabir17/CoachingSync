import { getUserSession } from '@/lib/auth'
import { createClient } from '@/utils/supabase/server'
import { Users, UserCheck, Clock, Activity, BarChart2, BookOpen, Layers, GraduationCap, CalendarCheck, CheckCircle2 } from 'lucide-react'
import DashboardTasks from '@/components/DashboardTasks'
import DashboardCharts from '@/components/DashboardCharts'
import TasksModalClient from '@/components/TasksModalClient'
import { LEAD_RATINGS, LEAD_STAGES } from '@/lib/constants'
import { getStagesAction } from '@/app/actions/stages'
import Link from 'next/link'

const STAGE_COLORS = [
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#84cc16', '#22c55e', '#14b8a6', '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e'
]

export default async function DashboardPage() {
  const user = await getUserSession()
  if (!user) return null

  const isAdminOrManager = user.role === 'Super Admin' || user.role === 'Manager'
  const supabase = await createClient()

  // 1. Fetch leads
  const leadsQuery = supabase
    .from('Lead')
    .select('rating, stage')
    .eq('companyId', user.companyId)

  // 2. Fetch tasks
  let tasksQuery = supabase
    .from('Task')
    .select('*, lead:Lead(fullName), counselor:User!inner(companyId)')
    .order('dueDate', { ascending: false })

  if (!isAdminOrManager) {
    tasksQuery = tasksQuery.eq('counselorId', user.id)
  } else {
    tasksQuery = tasksQuery.eq('counselor.companyId', user.companyId)
  }

  // 3. Fetch courses, batches, enrollments, class schedules
  const coursesQuery = supabase
    .from('Course')
    .select('id, name')
    .eq('companyId', user.companyId)

  const batchesQuery = supabase
    .from('Batch')
    .select('id, courseId, capacity')

  const enrollmentsQuery = supabase
    .from('BatchEnrollment')
    .select('id, batchId')

  const schedulesQuery = supabase
    .from('ClassSchedule')
    .select('id, batchId, isCompleted, classDate')

  const [leadsRes, tasksRes, coursesRes, batchesRes, enrollmentsRes, schedulesRes] = await Promise.all([
    leadsQuery,
    tasksQuery,
    coursesQuery,
    batchesQuery,
    enrollmentsQuery,
    schedulesQuery
  ])

  const leadsForStats = leadsRes.data || []
  const allTasks = tasksRes.data || []
  const allCourses = coursesRes.data || []
  const allBatches = batchesRes.data || []
  const allEnrollments = enrollmentsRes.data || []
  const allSchedules = schedulesRes.data || []

  // Filter batches and enrollments to only this company's courses
  const courseIds = new Set(allCourses.map(c => c.id))
  const companyBatches = allBatches.filter(b => courseIds.has(b.courseId))
  const companyBatchIds = new Set(companyBatches.map(b => b.id))
  const companyEnrollments = allEnrollments.filter(e => companyBatchIds.has(e.batchId))
  const companySchedules = allSchedules.filter(s => companyBatchIds.has(s.batchId))

  const totalLeads = leadsForStats.length
  const pendingCount = allTasks.filter(t => t.status === 'Pending').length
  const totalCourses = allCourses.length
  const totalBatches = companyBatches.length
  const totalEnrolled = companyEnrollments.length
  const totalClasses = companySchedules.length
  const completedClasses = companySchedules.filter(s => s.isCompleted).length
  const upcomingClasses = companySchedules.filter(s => !s.isCompleted && new Date(s.classDate) >= new Date(new Date().toDateString())).length
  const totalCapacity = companyBatches.reduce((sum, b) => sum + (b.capacity || 0), 0)

  // Process Ratings
  const ratingsCounts: Record<string, number> = {}
  leadsForStats.forEach(lead => {
    const ratingStr = lead.rating || 'Unrated'
    let ratingVal = 'Unrated'
    if (ratingStr === 'Very Good') ratingVal = '5'
    else if (ratingStr === 'Good') ratingVal = '4'
    else if (ratingStr === 'Moderate') ratingVal = '3'
    else if (ratingStr === 'Bad') ratingVal = '2'
    else if (['1', '2', '3', '4', '5'].includes(ratingStr)) ratingVal = ratingStr
    
    ratingsCounts[ratingVal] = (ratingsCounts[ratingVal] || 0) + 1
  })

  const RATING_LABELS: Record<string, string> = {
    '5': '5 Stars', '4': '4 Stars', '3': '3 Stars', '2': '2 Stars', '1': '1 Star', 'Unrated': 'Unrated'
  }
  const RATING_COLORS_NEW: Record<string, string> = {
    '5': '#10b981', '4': '#3b82f6', '3': '#f59e0b', '2': '#ef4444', '1': '#f43f5e', 'Unrated': '#737373'
  }

  const ratingsCards = ['5', '4', '3', '2', '1', 'Unrated'].map(ratingKey => ({
    name: RATING_LABELS[ratingKey],
    count: ratingsCounts[ratingKey] || 0,
    color: RATING_COLORS_NEW[ratingKey] || '#737373'
  }))
  
  const ratingsChartData = ratingsCards.filter(r => r.count > 0).map(r => ({
    name: r.name, value: r.count, fill: r.color
  }))

  const veryGoodCount = ratingsCounts['5'] || 0
  const goodCount = ratingsCounts['4'] || 0
  const conversionRate = totalLeads > 0 ? Math.round(((veryGoodCount + goodCount) / totalLeads) * 100) : 0

  // Process Stages
  const stages = await getStagesAction()
  const stageListNames = stages.length > 0 ? stages.map(s => s.name) : LEAD_STAGES
  const stagesCounts: Record<string, number> = {}
  leadsForStats.forEach(lead => {
    const stage = lead.stage || 'New'
    stagesCounts[stage] = (stagesCounts[stage] || 0) + 1
  })
  const stagesCards = stageListNames.map((stage, i) => ({
    name: stage, count: stagesCounts[stage] || 0, color: STAGE_COLORS[i % STAGE_COLORS.length]
  }))
  const stagesChartData = stagesCards.filter(s => s.count > 0).map(s => ({
    name: s.name, value: s.count, fill: s.color
  }))

  const classCompletionRate = totalClasses > 0 ? Math.round((completedClasses / totalClasses) * 100) : 0
  const enrollmentFillRate = totalCapacity > 0 ? Math.round((totalEnrolled / totalCapacity) * 100) : 0

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      {/* Title */}
      <div>
        <h2 className="text-2xl font-bold text-[#D4D4D4] font-display">Dashboard</h2>
        <p className="text-xs text-[#858585] mt-1">Real-time overview of your coaching operations.</p>
      </div>

      {/* ─── Primary Metrics Row ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
        {/* Total Leads */}
        <Link href="/dashboard/leads" className="group">
          <div className="relative overflow-hidden bg-[#252526] border border-[#3E3E42] rounded-md p-5 hover:border-[#007ACC]/50 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-[#007ACC]/5 group-hover:bg-[#007ACC]/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#007ACC] to-[#005A9E] flex items-center justify-center shadow-lg shadow-[#007ACC]/20">
                <Users className="h-4.5 w-4.5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#D4D4D4] font-display">{totalLeads}</p>
            <p className="text-[10px] text-[#858585] font-bold uppercase tracking-wider mt-1">Total Leads</p>
          </div>
        </Link>

        {/* Total Courses */}
        <Link href="/dashboard/courses" className="group">
          <div className="relative overflow-hidden bg-[#252526] border border-[#3E3E42] rounded-md p-5 hover:border-[#4EC9B0]/50 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-[#4EC9B0]/5 group-hover:bg-[#4EC9B0]/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#4EC9B0] to-[#35A08A] flex items-center justify-center shadow-lg shadow-[#4EC9B0]/20">
                <BookOpen className="h-4.5 w-4.5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#D4D4D4] font-display">{totalCourses}</p>
            <p className="text-[10px] text-[#858585] font-bold uppercase tracking-wider mt-1">Active Courses</p>
          </div>
        </Link>

        {/* Total Batches */}
        <Link href="/dashboard/courses" className="group">
          <div className="relative overflow-hidden bg-[#252526] border border-[#3E3E42] rounded-md p-5 hover:border-[#CE9178]/50 hover:-translate-y-1 transition-all duration-300">
            <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-[#CE9178]/5 group-hover:bg-[#CE9178]/10 transition-colors" />
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#CE9178] to-[#B07060] flex items-center justify-center shadow-lg shadow-[#CE9178]/20">
                <Layers className="h-4.5 w-4.5 text-white" />
              </div>
            </div>
            <p className="text-2xl font-black text-[#D4D4D4] font-display">{totalBatches}</p>
            <p className="text-[10px] text-[#858585] font-bold uppercase tracking-wider mt-1">Active Batches</p>
          </div>
        </Link>

        {/* Enrolled Students */}
        <div className="relative overflow-hidden bg-[#252526] border border-[#3E3E42] rounded-md p-5 hover:border-[#21C285]/50 hover:-translate-y-1 transition-all duration-300 group">
          <div className="absolute -top-4 -right-4 w-16 h-16 rounded-full bg-[#21C285]/5 group-hover:bg-[#21C285]/10 transition-colors" />
          <div className="flex items-center justify-between mb-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#21C285] to-[#17956A] flex items-center justify-center shadow-lg shadow-[#21C285]/20">
              <GraduationCap className="h-4.5 w-4.5 text-white" />
            </div>
          </div>
          <p className="text-2xl font-black text-[#D4D4D4] font-display">{totalEnrolled}</p>
          <p className="text-[10px] text-[#858585] font-bold uppercase tracking-wider mt-1">Enrolled Students</p>
        </div>
      </div>

      {/* ─── Secondary Metrics: Classes & Progress ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Classes Overview Card */}
        <div className="bg-[#252526] border border-[#3E3E42] rounded-md p-6 space-y-5">
          <div className="flex items-center gap-2 text-[#D4D4D4] font-semibold text-sm">
            <CalendarCheck className="w-4.5 h-4.5 text-[#007ACC]" /> Class Schedule
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-xl font-black text-[#D4D4D4] font-display">{totalClasses}</p>
              <p className="text-[9px] text-[#858585] font-bold uppercase tracking-wider mt-0.5">Total</p>
            </div>
            <div>
              <p className="text-xl font-black text-[#21C285] font-display">{completedClasses}</p>
              <p className="text-[9px] text-[#858585] font-bold uppercase tracking-wider mt-0.5">Done</p>
            </div>
            <div>
              <p className="text-xl font-black text-[#007ACC] font-display">{upcomingClasses}</p>
              <p className="text-[9px] text-[#858585] font-bold uppercase tracking-wider mt-0.5">Upcoming</p>
            </div>
          </div>
          {/* Progress bar */}
          <div>
            <div className="flex justify-between text-[10px] text-[#858585] mb-1.5">
              <span>Class Completion</span>
              <span className="font-bold text-[#D4D4D4]">{classCompletionRate}%</span>
            </div>
            <div className="w-full h-2 bg-[#1E1E1E] border border-[#3E3E42] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${classCompletionRate}%`, background: 'linear-gradient(90deg, #21C285, #4EC9B0)' }}
              />
            </div>
          </div>
        </div>

        {/* Pipeline Health Card */}
        <div className="bg-[#252526] border border-[#3E3E42] rounded-md p-6 space-y-5">
          <div className="flex items-center gap-2 text-[#D4D4D4] font-semibold text-sm">
            <Activity className="w-4.5 h-4.5 text-[#3FC7CE]" /> Pipeline Health
          </div>
          <div className="flex items-end gap-3">
            <p className="text-4xl font-black text-[#D4D4D4] font-display leading-none">{conversionRate}%</p>
            <p className="text-[10px] text-[#858585] mb-1">high-potential<br/>leads ratio</p>
          </div>
          <div>
            <div className="flex justify-between text-[10px] text-[#858585] mb-1.5">
              <span>4-5 Star Leads</span>
              <span className="font-bold text-[#D4D4D4]">{veryGoodCount + goodCount} / {totalLeads}</span>
            </div>
            <div className="w-full h-2 bg-[#1E1E1E] border border-[#3E3E42] rounded-full overflow-hidden">
              <div 
                className="h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${conversionRate}%`, background: 'linear-gradient(90deg, #3FC7CE, #0F8A94)' }}
              />
            </div>
          </div>
        </div>

        {/* Tasks / Enrollment Fill Card */}
        <div className="bg-[#252526] border border-[#3E3E42] rounded-md p-6 space-y-5">
          <div className="flex items-center gap-2 text-[#D4D4D4] font-semibold text-sm">
            <CheckCircle2 className="w-4.5 h-4.5 text-[#CE9178]" /> Quick Stats
          </div>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-xl font-black text-[#CE9178] font-display">{pendingCount}</p>
              <p className="text-[9px] text-[#858585] font-bold uppercase tracking-wider mt-0.5">Pending Tasks</p>
            </div>
            <div>
              <p className="text-xl font-black text-[#D4D4D4] font-display">{totalCapacity > 0 ? enrollmentFillRate + '%' : 'N/A'}</p>
              <p className="text-[9px] text-[#858585] font-bold uppercase tracking-wider mt-0.5">Batch Fill Rate</p>
            </div>
          </div>
          {totalCapacity > 0 && (
            <div>
              <div className="flex justify-between text-[10px] text-[#858585] mb-1.5">
                <span>Enrollment Fill</span>
                <span className="font-bold text-[#D4D4D4]">{totalEnrolled} / {totalCapacity}</span>
              </div>
              <div className="w-full h-2 bg-[#1E1E1E] border border-[#3E3E42] rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${Math.min(enrollmentFillRate, 100)}%`, background: 'linear-gradient(90deg, #CE9178, #E8B4A0)' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tasks Modal Trigger (hidden card for modal) */}
      <div className="hidden">
        <TasksModalClient tasks={allTasks} pendingCount={pendingCount} />
      </div>

      {/* Agenda for non-admins */}
      {user.role !== 'Super Admin' && (
        <div className="bg-[#252526] border border-[#3E3E42] rounded-md p-8">
          <h3 className="text-base font-bold text-[#D4D4D4] mb-6 flex items-center gap-2">
            <Clock className="w-4.5 h-4.5 text-[#CE9178]" />
            Today&apos;s Agenda
          </h3>
          <DashboardTasks tasks={allTasks} />
        </div>
      )}

      {/* ─── Ratings Grid ─── */}
      <div>
        <h3 className="text-base font-bold text-[#D4D4D4] mb-5 flex items-center gap-2">
          <UserCheck className="h-5 w-5 text-[#21C285]" /> Lead Ratings
        </h3>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {ratingsCards.map(rating => (
            <Link key={rating.name} href={`/dashboard/leads?rating=${encodeURIComponent(rating.name)}`}>
              <div className="bg-[#252526] border border-[#3E3E42] rounded-md p-4 hover:border-[#555555] hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between h-24 group">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-[#858585] group-hover:text-[#CCCCCC] transition-colors">{rating.name}</span>
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: rating.color, boxShadow: `0 0 8px ${rating.color}50` }}></span>
                </div>
                <p className="text-xl font-black text-[#D4D4D4] font-display">{rating.count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ─── Lead Stages Snapshot ─── */}
      <div className="bg-[#252526] border border-[#3E3E42] rounded-md p-8">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-base font-bold text-[#D4D4D4] flex items-center gap-2 font-display">
            <BarChart2 className="h-5 w-5 text-[#007ACC]" /> Lead Stages
          </h3>
          <Link href="/dashboard/leads" className="text-xs font-bold text-[#007ACC] hover:underline flex items-center gap-1">
            View All →
          </Link>
        </div>
        <div className="space-y-4">
          {stagesCards.map(stage => {
            const percentage = totalLeads > 0 ? Math.round((stage.count / totalLeads) * 100) : 0
            return (
              <Link key={stage.name} href={`/dashboard/leads?stage=${encodeURIComponent(stage.name)}`} className="block group">
                <div className="flex items-center gap-4">
                  <span className="w-28 text-xs font-bold text-[#858585] group-hover:text-[#D4D4D4] transition-colors truncate">{stage.name}</span>
                  <div className="flex-1 h-3 bg-[#1E1E1E] border border-[#3E3E42] rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 ease-out group-hover:brightness-110" 
                      style={{ 
                        width: `${percentage}%`, 
                        backgroundColor: stage.color,
                        boxShadow: `0 0 8px ${stage.color}30`
                      }}
                    ></div>
                  </div>
                  <span className="w-8 text-right text-xs font-bold text-[#D4D4D4]">{stage.count}</span>
                  <span className="w-10 text-right text-[10px] text-[#858585]">{percentage}%</span>
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      {/* ─── Charts ─── */}
      {totalLeads > 0 && (
        <div className="bg-[#252526] border border-[#3E3E42] rounded-md p-8">
          <h3 className="text-base font-bold text-[#D4D4D4] mb-6 font-display">Analytics</h3>
          <DashboardCharts ratingsData={ratingsChartData} stagesData={stagesChartData} />
        </div>
      )}
    </div>
  )
}
