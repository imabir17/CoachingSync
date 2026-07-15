'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, CheckCircle2, Clock, MapPin, Calendar, Loader2 } from 'lucide-react'
import { toggleClassStatusAction } from '@/app/actions/courses'
import { useRouter } from 'next/navigation'

interface ScheduleClientProps {
  initialSchedules: any[]
  initialBatches: any[]
}

const DAYS_OF_WEEK = [
  { key: 'Saturday', label: 'SAT' },
  { key: 'Sunday', label: 'SUN' },
  { key: 'Monday', label: 'MON' },
  { key: 'Tuesday', label: 'TUE' },
  { key: 'Wednesday', label: 'WED' },
  { key: 'Thursday', label: 'THU' },
  { key: 'Friday', label: 'FRI' }
]

function getStartOfWeek(date: Date) {
  // Start week on Saturday (index 6) in Bangladesh style
  const resultDate = new Date(date)
  const day = resultDate.getDay() // Sun=0, Mon=1, ..., Sat=6
  const diff = day === 6 ? 0 : -(day + 1)
  resultDate.setDate(resultDate.getDate() + diff)
  resultDate.setHours(0, 0, 0, 0)
  return resultDate
}

function formatTime(timeStr: string) {
  if (!timeStr) return ''
  const parts = timeStr.split(':')
  let hours = parseInt(parts[0], 10)
  const minutes = parts[1] || '00'
  const ampm = hours >= 12 ? 'PM' : 'AM'
  hours = hours % 12
  hours = hours ? hours : 12
  return `${hours}:${minutes} ${ampm}`
}

// Generate a deterministic color class based on course name/id
function getCourseColorClass(courseId: string) {
  const hash = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  const colors = [
    { bg: 'bg-[#FBEDCB] text-[#C4880E] border-[#E3A72F]', bar: 'bg-[#E3A72F]' }, // Gold
    { bg: 'bg-[#E3F1E8] text-[#2E6B49] border-[#5FA779]', bar: 'bg-[#5FA779]' }, // Green
    { bg: 'bg-[#FBE7E4] text-[#A33A2E] border-[#D6584A]', bar: 'bg-[#D6584A]' }, // Red
    { bg: 'bg-[#E5F1FB] text-[#1E5F9E] border-[#007ACC]', bar: 'bg-[#007ACC]' }, // Blue
    { bg: 'bg-[#F2EDFB] text-[#693FA6] border-[#8D58D6]', bar: 'bg-[#8D58D6]' }, // Purple
  ]
  return colors[hash % colors.length]
}

export default function ScheduleClient({ initialSchedules, initialBatches }: ScheduleClientProps) {
  const router = useRouter()
  const [schedules, setSchedules] = useState<any[]>(initialSchedules)
  const [currentDate, setCurrentDate] = useState<Date>(new Date())
  const [togglingId, setTogglingId] = useState<string | null>(null)

  // Sync state if props change
  useEffect(() => {
    setSchedules(initialSchedules)
  }, [initialSchedules])

  // Get date range of current view (Sat to Fri)
  const startOfWeek = getStartOfWeek(currentDate)
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6)
  endOfWeek.setHours(23, 59, 59, 999)

  const handlePrevWeek = () => {
    const prev = new Date(currentDate)
    prev.setDate(currentDate.getDate() - 7)
    setCurrentDate(prev)
  }

  const handleNextWeek = () => {
    const next = new Date(currentDate)
    next.setDate(currentDate.getDate() + 7)
    setCurrentDate(next)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleToggleStatus = async (scheduleId: string, currentStatus: boolean) => {
    setTogglingId(scheduleId)
    const newStatus = !currentStatus

    // Optimistic UI update
    setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, isCompleted: newStatus } : s))

    const result = await toggleClassStatusAction(scheduleId, newStatus)
    setTogglingId(null)

    if (result.error) {
      // Revert if error
      setSchedules(prev => prev.map(s => s.id === scheduleId ? { ...s, isCompleted: currentStatus } : s))
      alert(result.error)
    } else {
      router.refresh()
    }
  }

  // Filter schedules to current week
  const weekSchedules = schedules.filter(s => {
    const classDate = new Date(s.classDate)
    return classDate >= startOfWeek && classDate <= endOfWeek
  })

  // Extract unique sorted time slots (formatted as HH:MM)
  const uniqueTimes = Array.from(new Set(weekSchedules.map(s => {
    const parts = (s.startTime || '00:00').split(':')
    return `${parts[0].padStart(2, '0')}:${parts[1].padStart(2, '0')}`
  }))).sort()

  // Group schedules by day & start time
  const scheduleGrid: { [key: string]: any } = {}
  weekSchedules.forEach(s => {
    const dateObj = new Date(s.classDate)
    const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' })
    const timeParts = (s.startTime || '00:00').split(':')
    const timeKey = `${timeParts[0].padStart(2, '0')}:${timeParts[1].padStart(2, '0')}`
    const gridKey = `${dayName}-${timeKey}`
    scheduleGrid[gridKey] = s
  })

  // Unique list of courses for Legend
  const uniqueCoursesMap = new Map()
  initialBatches.forEach(b => {
    if (b.Course) {
      uniqueCoursesMap.set(b.Course.id, b.Course.name)
    }
  })
  const legendCourses = Array.from(uniqueCoursesMap.entries()).map(([id, name]) => ({ id, name }))

  return (
    <div className="space-y-6">
      
      {/* Week Navigation Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-[#252526] p-5 border border-[#3E3E42] rounded-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-[#3E3E42] bg-[#1E1E1E] rounded-sm flex items-center justify-center text-[#E3A72F]">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#D4D4D4] font-display">
              {startOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              {' — '}
              {endOfWeek.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </h2>
            <p className="text-[10px] text-[#858585]">
              Showing {weekSchedules.length} class sessions this week
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handlePrevWeek}
            className="p-2 border border-[#3E3E42] hover:border-[#555555] bg-[#1E1E1E] text-[#D4D4D4] rounded-sm transition-all"
            aria-label="Previous week"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button 
            onClick={handleToday}
            className="px-4 py-2 border border-[#3E3E42] hover:border-[#555555] bg-[#1E1E1E] text-[#D4D4D4] text-xs font-semibold rounded-sm transition-all"
          >
            Today
          </button>
          <button 
            onClick={handleNextWeek}
            className="p-2 border border-[#3E3E42] hover:border-[#555555] bg-[#1E1E1E] text-[#D4D4D4] rounded-sm transition-all"
            aria-label="Next week"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Routine Grid Container */}
      <div className="bg-[#252526] border border-[#3E3E42] rounded-md p-6 overflow-x-auto">
        <div className="min-w-[800px] space-y-3">
          
          {/* Days Grid Header */}
          <div className="grid grid-cols-8 gap-3 border-b border-[#3E3E42] pb-3">
            <div className="col-span-1"></div> {/* Spacer for time labels */}
            {DAYS_OF_WEEK.map(day => (
              <div key={day.key} className="col-span-1 text-center font-mono text-xs font-bold text-[#858585] tracking-wider uppercase">
                {day.label}
              </div>
            ))}
          </div>

          {/* Time Slot Rows */}
          {uniqueTimes.length === 0 ? (
            <div className="text-center py-16 text-xs text-[#858585] border border-dashed border-[#3E3E42] rounded-md bg-[#1E1E1E]">
              No classes scheduled for this week. Create schedules in batch settings.
            </div>
          ) : (
            uniqueTimes.map(timeSlot => (
              <div key={timeSlot} className="grid grid-cols-8 gap-3 items-center min-h-[85px]">
                {/* Time Label */}
                <div className="col-span-1 text-right pr-4 font-mono text-xs font-bold text-[#858585]">
                  {formatTime(timeSlot)}
                </div>

                {/* Day Slots */}
                {DAYS_OF_WEEK.map(day => {
                  const gridKey = `${day.key}-${timeSlot}`
                  const schedule = scheduleGrid[gridKey]

                  if (schedule) {
                    const color = getCourseColorClass(schedule.Batch?.courseId || '')
                    const isToggling = togglingId === schedule.id

                    return (
                      <div 
                        key={day.key} 
                        className={`col-span-1 h-full rounded-sm border p-3 flex flex-col justify-between relative transition-all ${color.bg}`}
                      >
                        <div>
                          <div className="text-[12px] font-bold leading-tight font-display mb-1 truncate">
                            {schedule.Batch?.name || 'Class Session'}
                          </div>
                          <div className="text-[10px] opacity-75 font-medium leading-none flex items-center gap-1">
                            <Clock className="w-3 h-3 shrink-0" />
                            {formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}
                          </div>
                          {schedule.title && schedule.title !== schedule.Batch?.name && (
                            <div className="text-[9px] opacity-60 font-semibold mt-1 truncate">
                              Topic: {schedule.title}
                            </div>
                          )}
                        </div>

                        {/* Status Checkmark */}
                        <div className="mt-2.5 flex items-center justify-between">
                          <button
                            onClick={() => handleToggleStatus(schedule.id, schedule.isCompleted)}
                            disabled={isToggling}
                            className="flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider hover:opacity-80 transition-all select-none"
                          >
                            {isToggling ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : schedule.isCompleted ? (
                              <>
                                <CheckCircle2 className="w-3 h-3 text-emerald-600 fill-emerald-600/10" />
                                <span className="text-emerald-700">Done</span>
                              </>
                            ) : (
                              <>
                                <div className="w-3 h-3 rounded-full border border-current" />
                                <span>Upcoming</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    )
                  }

                  return (
                    <div 
                      key={day.key} 
                      className="col-span-1 h-full min-h-[85px] border border-dashed border-[#3E3E42] bg-[#1E1E1E]/40 rounded-sm"
                    />
                  )
                })}
              </div>
            ))
          )}

        </div>
      </div>

      {/* Course Color Legend */}
      {legendCourses.length > 0 && (
        <div className="bg-[#252526] border border-[#3E3E42] rounded-md p-5">
          <h3 className="text-xs font-bold text-[#858585] uppercase tracking-wider mb-3">Course Legend</h3>
          <div className="flex flex-wrap gap-4">
            {legendCourses.map(course => {
              const color = getCourseColorClass(course.id)
              return (
                <div key={course.id} className="flex items-center gap-2 text-xs font-medium text-[#CCCCCC]">
                  <span className={`w-3.5 h-3.5 rounded-sm border ${color.bar} shrink-0`} />
                  <span>{course.name}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

    </div>
  )
}
