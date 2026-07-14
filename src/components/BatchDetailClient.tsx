'use client'

import { useState, useTransition } from 'react'
import { Plus, X, Users, Calendar, AlertTriangle, Clock, User, CheckCircle, GraduationCap, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { createClassScheduleAction, toggleClassStatusAction, removeLeadFromBatchAction } from '@/app/actions/courses'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BatchDetailClient({ batch }: { batch: any }) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()

  const handleRemoveStudent = async (studentId: string) => {
    if (!confirm('Are you sure you want to remove this student from the batch?')) return
    startTransition(async () => {
      const result = await removeLeadFromBatchAction(batch.id, studentId)
      if (result.error) {
        console.error(result.error)
      } else {
        router.refresh()
      }
    })
  }
  
  // Local state for Schedule
  const [schedules, setSchedules] = useState<any[]>(batch.schedules || [])
  const [isAddingClass, setIsAddingClass] = useState(false)
  const [classTitle, setClassTitle] = useState('')
  const [classDate, setClassDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [classError, setClassError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!classTitle || !classDate) return

    setIsSubmitting(true)
    setClassError('')
    
    const formData = new FormData()
    formData.append('batchId', batch.id)
    formData.append('title', classTitle)
    formData.append('classDate', classDate)
    if (startTime) formData.append('startTime', startTime)
    if (endTime) formData.append('endTime', endTime)

    const result = await createClassScheduleAction(formData)
    setIsSubmitting(false)

    if (result.error) {
      setClassError(result.error)
    } else {
      setIsAddingClass(false)
      setClassTitle('')
      setClassDate('')
      setStartTime('')
      setEndTime('')
      router.refresh()
    }
  }

  const handleToggleCompleted = async (scheduleId: string, currentStatus: boolean) => {
    startTransition(async () => {
      const result = await toggleClassStatusAction(scheduleId, !currentStatus)
      if (result.error) {
        console.error(result.error)
      } else {
        router.refresh()
      }
    })
  }

  // Format time (e.g. "14:00:00" -> "02:00 PM")
  const formatTime = (timeStr: string | null) => {
    if (!timeStr) return ''
    const [hours, minutes] = timeStr.split(':')
    const h = parseInt(hours, 10)
    const ampm = h >= 12 ? 'PM' : 'AM'
    const formattedHours = h % 12 || 12
    return `${formattedHours}:${minutes} ${ampm}`
  }

  const completedClassesCount = batch.schedules?.filter((s: any) => s.isCompleted).length || 0
  const totalClassesCount = batch.schedules?.length || 0

  const inputClass = "w-full bg-[#1E1E1E] border border-[#3E3E42] rounded-sm py-2 px-3 text-xs font-medium text-[#D4D4D4] placeholder-[#858585] focus:outline-none focus:border-[#007ACC] transition-all"
  const selectClass = "px-3 py-2 bg-[#1E1E1E] border border-[#3E3E42] text-xs font-bold text-[#CCCCCC] rounded-sm outline-none focus:border border-[#3E3E42] transition-all cursor-pointer"

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* LEFT COL - Batch Info Card */}
      <div className="xl:col-span-1 space-y-6">
        <div className="bg-[#252526] border border-[#3E3E42] rounded-md p-5">
          <div className="flex items-center gap-2 mb-4 text-[#D4D4D4] font-semibold border-b border-[#3E3E42] pb-3">
            <GraduationCap className="w-4 h-4 text-[#4EC9B0]" /> Batch Overview
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-[#858585] uppercase tracking-wider mb-1">Batch Name</p>
              <p className="text-sm text-[#D4D4D4] font-medium">{batch.name}</p>
            </div>

            <div>
              <p className="text-[10px] text-[#858585] uppercase tracking-wider mb-1">Assigned Instructor</p>
              <p className="text-sm text-[#D4D4D4] font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#CE9178]" />
                {batch.instructor?.fullName || 'Not assigned'}
              </p>
            </div>
            
            <div>
              <p className="text-[10px] text-[#858585] uppercase tracking-wider mb-1">Capacity</p>
              <p className="text-sm text-[#D4D4D4] font-medium">
                {batch.students?.length || 0} / {batch.capacity || 'Unlimited'} Students Enrolled
              </p>
            </div>

            <div>
              <p className="text-[10px] text-[#858585] uppercase tracking-wider mb-1">Schedule Timeline</p>
              <p className="text-xs text-[#CCCCCC] flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#007ACC]" />
                {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'TBD'} 
                {' - '} 
                {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'TBD'}
              </p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#252526] border border-[#3E3E42] rounded-md p-4 flex flex-col items-center text-center">
            <span className="text-2xl font-bold text-[#D4D4D4] mb-1">{totalClassesCount}</span>
            <span className="text-[10px] text-[#858585] uppercase tracking-wider">Classes Scheduled</span>
          </div>
          <div className="bg-[#252526] border border-[#3E3E42] rounded-md p-4 flex flex-col items-center text-center">
            <span className="text-2xl font-bold text-[#21C285] mb-1">{completedClassesCount}</span>
            <span className="text-[10px] text-[#858585] uppercase tracking-wider">Completed</span>
          </div>
        </div>
      </div>

      {/* RIGHT COL - Enrolled Students & Class Schedule */}
      <div className="xl:col-span-2 space-y-6">
        
        {/* Class Schedule Section */}
        <div className="bg-[#252526] border border-[#3E3E42] rounded-md overflow-hidden">
          <div className="p-5 flex justify-between items-center border-b border-[#3E3E42]">
            <h3 className="text-sm font-semibold text-[#D4D4D4] flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#007ACC]" /> Class Schedule
            </h3>
            <button 
              onClick={() => setIsAddingClass(!isAddingClass)}
              className="px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#333333] border border-[#3E3E42] text-[#D4D4D4] text-[10px] font-medium rounded-sm transition-colors flex items-center gap-1.5"
            >
              {isAddingClass ? <><X className="w-3.5 h-3.5"/> Cancel</> : <><Plus className="w-3.5 h-3.5"/> Add Class</>}
            </button>
          </div>

          {isAddingClass && (
            <form onSubmit={handleCreateClass} className="p-5 border-b border-[#3E3E42] bg-[#1E1E1E] space-y-4">
              {classError && (
                <div className="flex items-center gap-2 text-[10px] text-[#E5484D] bg-[#E5484D]/10 p-2 rounded-sm border border-[#E5484D]/20">
                  <AlertTriangle className="w-3.5 h-3.5" /> {classError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-[10px] text-[#CCCCCC] mb-1.5 uppercase tracking-wider">Class Title / Topic *</label>
                  <input required value={classTitle} onChange={e => setClassTitle(e.target.value)} className={inputClass} placeholder="e.g. IELTS Reading - Section 1" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#CCCCCC] mb-1.5 uppercase tracking-wider">Class Date *</label>
                  <input required type="date" value={classDate} onChange={e => setClassDate(e.target.value)} className={inputClass} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] text-[#CCCCCC] mb-1.5 uppercase tracking-wider">Start Time</label>
                    <input type="time" value={startTime} onChange={e => setStartTime(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-[10px] text-[#CCCCCC] mb-1.5 uppercase tracking-wider">End Time</label>
                    <input type="time" value={endTime} onChange={e => setEndTime(e.target.value)} className={inputClass} />
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button disabled={isSubmitting} type="submit" className="px-4 py-2 bg-[#007ACC] hover:bg-[#005999] disabled:opacity-50 text-white text-xs font-medium rounded-sm transition-colors">
                  {isSubmitting ? 'Saving...' : 'Add Class'}
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-[#3E3E42]">
            {batch.schedules.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#858585]">
                No classes scheduled for this batch yet.
              </div>
            ) : (
              batch.schedules.map((schedule: any) => (
                <div 
                  key={schedule.id} 
                  className={`p-5 hover:bg-[#1E1E1E]/50 transition-colors flex items-center justify-between gap-4 ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
                >
                  <div className="flex items-start gap-4">
                    <button 
                      onClick={() => handleToggleCompleted(schedule.id, schedule.isCompleted)}
                      className={`mt-0.5 w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                        schedule.isCompleted 
                          ? 'border-[#21C285] bg-[#21C285]/10 text-[#21C285]' 
                          : 'border-[#3E3E42] text-transparent hover:border-[#CCCCCC]'
                      }`}
                      title={schedule.isCompleted ? "Mark as pending" : "Mark as completed"}
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                    </button>
                    <div>
                      <h4 className={`text-sm font-medium text-[#D4D4D4] ${schedule.isCompleted ? 'line-through text-[#858585]' : ''}`}>
                        {schedule.title}
                      </h4>
                      <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[10px] text-[#858585]">
                        <span className="font-semibold">{new Date(schedule.classDate).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        {(schedule.startTime || schedule.endTime) && (
                          <>
                            <span>•</span>
                            <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div>
                    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-bold ${
                      schedule.isCompleted 
                        ? 'bg-[#21C285]/10 text-[#21C285] border border-[#21C285]/20' 
                        : 'bg-[#007ACC]/10 text-[#007ACC] border border-[#007ACC]/20'
                    }`}>
                      {schedule.isCompleted ? 'COMPLETED' : 'SCHEDULED'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Enrolled Students list */}
        <div className="bg-[#252526] border border-[#3E3E42] rounded-md overflow-hidden">
          <div className="p-5 border-b border-[#3E3E42]">
            <h3 className="text-sm font-semibold text-[#D4D4D4] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#21C285]" /> Students Enrolled ({batch.students?.length || 0})
            </h3>
          </div>
          <div className="divide-y divide-[#3E3E42]">
            {!batch.students || batch.students.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#858585]">
                No students enrolled in this batch yet.
              </div>
            ) : (
              batch.students.map((student: any) => (
                <div key={student.id} className="p-5 hover:bg-[#1E1E1E] transition-colors flex items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-[#D4D4D4]">{student.fullName}</h4>
                    <div className="flex items-center gap-3 mt-1 text-[10px] text-[#858585]">
                      <span>{student.email || 'No email'}</span>
                      <span>•</span>
                      <span>{student.phone || 'No phone'}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link 
                      href={`/dashboard/leads/${student.id}`}
                      className="px-3 py-1.5 border border-[#3E3E42] text-[#CCCCCC] hover:text-white hover:bg-[#333333] rounded-sm text-[10px] font-medium transition-colors"
                    >
                      View Profile
                    </Link>
                    <button 
                      onClick={() => handleRemoveStudent(student.id)}
                      className="px-3 py-1.5 border border-[#3E3E42] hover:border-red-500/50 text-[#858585] hover:text-red-500 hover:bg-[#E5484D]/10 rounded-sm text-[10px] font-medium transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
