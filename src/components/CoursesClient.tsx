'use client'

import { useState } from 'react'
import { Plus, X, GraduationCap, AlertTriangle, ArrowRight } from 'lucide-react'
import { createCourseAction } from '@/app/actions/courses'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CoursesClient({ initialCourses, staff }: { initialCourses: any[], staff: any[] }) {
  const router = useRouter()
  const [courses, setCourses] = useState<any[]>(initialCourses)
  
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [courseName, setCourseName] = useState('')
  const [courseFee, setCourseFee] = useState('')
  const [inChargeId, setInChargeId] = useState('')
  const [courseDescription, setCourseDescription] = useState('')
  const [courseError, setCourseError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseName || !courseFee) return

    setIsSubmitting(true)
    setCourseError('')
    const formData = new FormData()
    formData.append('name', courseName)
    formData.append('fee', courseFee)
    formData.append('inChargeId', inChargeId)
    formData.append('description', courseDescription)

    const result = await createCourseAction(formData)
    setIsSubmitting(false)
    if (result.error) {
      setCourseError(result.error)
    } else {
      setCourses([{ ...result.course, batches: [] }, ...courses])
      setIsAddingCourse(false)
      setCourseName('')
      setCourseFee('')
      setInChargeId('')
      setCourseDescription('')
      
      // Optionally redirect to the newly created course immediately
      router.push(`/dashboard/courses/${result.course.id}`)
    }
  }

  const inputClass = "w-full bg-[#1E1E1E] border border-[#3E3E42] rounded-sm py-2 px-3 text-xs font-medium text-[#D4D4D4] placeholder-[#858585] focus:outline-none focus:border-[#007ACC] transition-all"
  
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-[#252526] p-5 border border-[#3E3E42] rounded-md">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 border border-[#3E3E42] bg-[#1E1E1E] rounded-sm flex items-center justify-center text-[#4EC9B0]">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-[#D4D4D4]">Course Management</h2>
            <p className="text-[10px] text-[#858585]">Total {courses.length} courses</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddingCourse(!isAddingCourse)}
          className="px-4 py-2 bg-[#007ACC] hover:bg-[#005999] text-white text-xs font-medium rounded-sm transition-colors flex items-center gap-1.5"
        >
          {isAddingCourse ? <><X className="w-4 h-4"/> Cancel</> : <><Plus className="w-4 h-4"/> New Course</>}
        </button>
      </div>

      {isAddingCourse && (
        <form onSubmit={handleCreateCourse} className="bg-[#252526] p-6 border border-[#3E3E42] rounded-md animate-in fade-in slide-in-from-top-4 duration-200">
          <h3 className="text-sm font-semibold text-[#D4D4D4] mb-4">Create New Course</h3>
          {courseError && (
            <div className="mb-4 flex items-center gap-2 text-xs text-[#E5484D] bg-[#E5484D]/10 p-3 rounded-sm border border-[#E5484D]/20">
              <AlertTriangle className="w-4 h-4" /> {courseError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            <div>
              <label className="block text-[10px] text-[#CCCCCC] mb-1.5 uppercase tracking-wider">Course Name *</label>
              <input required value={courseName} onChange={e => setCourseName(e.target.value)} className={inputClass} placeholder="e.g. IELTS Regular" />
            </div>
            <div>
              <label className="block text-[10px] text-[#CCCCCC] mb-1.5 uppercase tracking-wider">Course Fee *</label>
              <input required value={courseFee} onChange={e => setCourseFee(e.target.value)} className={inputClass} placeholder="e.g. 15,000 BDT" />
            </div>
            <div>
              <label className="block text-[10px] text-[#CCCCCC] mb-1.5 uppercase tracking-wider">In-Charge (Instructor/Manager)</label>
              <select value={inChargeId} onChange={e => setInChargeId(e.target.value)} className={inputClass}>
                <option value="">-- Select Staff --</option>
                {staff.map(member => (
                  <option key={member.id} value={member.id}>{member.fullName} ({member.role})</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-[10px] text-[#CCCCCC] mb-1.5 uppercase tracking-wider">Course Details</label>
              <textarea value={courseDescription} onChange={e => setCourseDescription(e.target.value)} className={`${inputClass} resize-none min-h-[80px]`} placeholder="Curriculum details, duration, etc..." />
            </div>
          </div>
          <div className="flex justify-end">
            <button disabled={isSubmitting} type="submit" className="px-5 py-2 bg-[#007ACC] hover:bg-[#005999] disabled:opacity-50 text-white text-xs font-medium rounded-sm transition-colors">
              {isSubmitting ? 'Saving...' : 'Save Course'}
            </button>
          </div>
        </form>
      )}

      {/* Course List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {courses.map(course => (
          <div key={course.id} className="bg-[#252526] border border-[#3E3E42] rounded-md overflow-hidden flex flex-col h-full">
            <div className="p-5 flex-1">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-base font-medium text-[#D4D4D4]">{course.name || course.title}</h3>
                <span className="text-[#007ACC] font-medium text-xs bg-[#007ACC]/10 px-2 py-1 rounded-sm">{course.fee}</span>
              </div>
              
              {course.description && (
                <p className="text-xs text-[#858585] mb-4 line-clamp-2">{course.description}</p>
              )}

              <div className="flex items-center gap-4 text-[10px] text-[#CCCCCC]">
                <div className="flex flex-col">
                  <span className="uppercase text-[#858585] tracking-wider mb-1">Batches</span>
                  <span className="font-medium text-[#D4D4D4]">{course.batches?.length || 0} active</span>
                </div>
                {course.inChargeId && (
                  <div className="flex flex-col">
                    <span className="uppercase text-[#858585] tracking-wider mb-1">In-Charge</span>
                    <span className="font-medium text-[#D4D4D4]">{staff.find(s => s.id === course.inChargeId)?.fullName || 'Assigned'}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="border-t border-[#3E3E42] bg-[#1E1E1E]">
              <Link href={`/dashboard/courses/${course.id}`} className="block w-full p-3 text-center text-xs font-medium text-[#007ACC] hover:bg-[#007ACC]/10 transition-colors flex items-center justify-center gap-2">
                Manage Batches & Course Details <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full text-center text-[#858585] py-12 border border-dashed border-[#3E3E42] rounded-md text-xs bg-[#252526]">
            No courses available. Click "New Course" to create one.
          </div>
        )}
      </div>
    </div>
  )
}
