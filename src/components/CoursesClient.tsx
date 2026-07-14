'use client'

import { useState } from 'react'
import { Plus, X, GraduationCap, Users, Calendar, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'
import { createCourseAction, createBatchAction, addLeadToBatchAction } from '@/app/actions/courses'

export default function CoursesClient({ initialCourses }: { initialCourses: any[] }) {
  const [courses, setCourses] = useState<any[]>(initialCourses)
  
  const [isAddingCourse, setIsAddingCourse] = useState(false)
  const [courseTitle, setCourseTitle] = useState('')
  const [courseFee, setCourseFee] = useState('')
  const [courseDescription, setCourseDescription] = useState('')
  const [courseError, setCourseError] = useState('')

  const [expandedCourse, setExpandedCourse] = useState<string | null>(null)
  
  const [isAddingBatch, setIsAddingBatch] = useState<string | null>(null)
  const [batchName, setBatchName] = useState('')
  const [batchSchedule, setBatchSchedule] = useState('')
  const [batchCapacity, setBatchCapacity] = useState('')
  const [batchStartDate, setBatchStartDate] = useState('')
  const [batchEndDate, setBatchEndDate] = useState('')
  const [batchError, setBatchError] = useState('')

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!courseTitle || !courseFee) return

    setCourseError('')
    const formData = new FormData()
    formData.append('title', courseTitle)
    formData.append('fee', courseFee)
    formData.append('description', courseDescription)

    const result = await createCourseAction(formData)
    if (result.error) {
      setCourseError(result.error)
    } else {
      setCourses([{ ...result.course, batches: [] }, ...courses])
      setIsAddingCourse(false)
      setCourseTitle('')
      setCourseFee('')
      setCourseDescription('')
    }
  }

  const handleCreateBatch = async (e: React.FormEvent, courseId: string) => {
    e.preventDefault()
    if (!batchName) return

    setBatchError('')
    const formData = new FormData()
    formData.append('courseId', courseId)
    formData.append('name', batchName)
    formData.append('schedule', batchSchedule)
    formData.append('capacity', batchCapacity)
    if (batchStartDate) formData.append('startDate', batchStartDate)
    if (batchEndDate) formData.append('endDate', batchEndDate)

    const result = await createBatchAction(formData)
    if (result.error) {
      setBatchError(result.error)
    } else {
      setCourses(courses.map(c => {
        if (c.id === courseId) {
          return {
            ...c,
            batches: [...(c.batches || []), result.batch]
          }
        }
        return c
      }))
      setIsAddingBatch(null)
      setBatchName('')
      setBatchSchedule('')
      setBatchCapacity('')
      setBatchStartDate('')
      setBatchEndDate('')
    }
  }

  const inputClass = "w-full bg-[#1E1E1E] border border-[#3C3C3C] rounded-sm py-2.5 px-4 text-xs font-semibold text-white placeholder-gray-500 focus:outline-none focus:border-[#007ACC] transition-all"
  
  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex justify-between items-center bg-[#252526] p-6 rounded-md border border-[#3C3C3C] border border-[#3E3E42]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-sm bg-[#21C285]/10 flex items-center justify-center text-[#21C285]">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white">Course Management</h2>
            <p className="text-[10px] text-gray-400">Total {courses.length} courses</p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddingCourse(!isAddingCourse)}
          className="px-5 py-2.5 rounded-sm bg-[#0E639C] text-white text-xs font-bold border border-[#3E3E42] hover:bg-[#1177BB] active:translate-y-0.5 transition-all flex items-center gap-2"
        >
          {isAddingCourse ? <><X className="w-4 h-4"/> Cancel</> : <><Plus className="w-4 h-4"/> New Course</>}
        </button>
      </div>

      {isAddingCourse && (
        <form onSubmit={handleCreateCourse} className="bg-[#252526] p-6 rounded-md border border-[#3C3C3C] border border-[#3E3E42] animate-in fade-in slide-in-from-top-4 duration-300">
          <h3 className="text-base font-bold text-white mb-5">Create New Course</h3>
          {courseError && (
            <div className="mb-4 flex items-center gap-2 text-xs text-[#E5484D] bg-[#E5484D]/10 p-3 rounded-sm">
              <AlertTriangle className="w-4 h-4" /> {courseError}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Course Title *</label>
              <input required value={courseTitle} onChange={e => setCourseTitle(e.target.value)} className={inputClass} placeholder="e.g. IELTS Regular" />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Fee *</label>
              <input required value={courseFee} onChange={e => setCourseFee(e.target.value)} className={inputClass} placeholder="e.g. 15,000 BDT" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-2">Description</label>
              <textarea value={courseDescription} onChange={e => setCourseDescription(e.target.value)} className={`${inputClass} resize-none min-h-[80px]`} placeholder="Course details..." />
            </div>
          </div>
          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2.5 rounded-sm bg-[#0E639C] text-white text-xs font-bold border border-[#3E3E42] hover:bg-[#1177BB] transition-all">Save Course</button>
          </div>
        </form>
      )}

      {/* Course List */}
      <div className="space-y-4">
        {courses.map(course => (
          <div key={course.id} className="bg-[#252526] rounded-md border border-[#3C3C3C] border border-[#3E3E42] overflow-hidden">
            {/* Course Header */}
            <div 
              className="p-5 flex items-center justify-between cursor-pointer hover:bg-[#2A2D2E] transition-colors"
              onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
            >
              <div>
                <h3 className="text-base font-bold text-white mb-1">{course.title}</h3>
                <div className="flex items-center gap-4 text-xs font-semibold text-gray-400">
                  <span>Fee: <span className="text-[#007ACC]">{course.fee}</span></span>
                  <span>ΓÇó</span>
                  <span>{course.batches?.length || 0} Batches</span>
                </div>
              </div>
              <div className="text-gray-400">
                {expandedCourse === course.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </div>
            </div>

            {/* Course Details & Batches */}
            {expandedCourse === course.id && (
              <div className="p-5 border-t border-[#3C3C3C] bg-[#1E1E1E]">
                {course.description && (
                  <p className="text-xs text-gray-400 mb-6 font-semibold leading-relaxed">{course.description}</p>
                )}
                
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-sm font-bold text-white flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#21C285]" /> Batches
                  </h4>
                  <button 
                    onClick={() => setIsAddingBatch(isAddingBatch === course.id ? null : course.id)}
                    className="text-[10px] font-bold text-[#007ACC] hover:text-[#3399FF] bg-[#0E639C]/10 px-3 py-1.5 rounded-sm border border-[#0E639C]/20 transition-all"
                  >
                    + Add Batch
                  </button>
                </div>

                {isAddingBatch === course.id && (
                  <form onSubmit={(e) => handleCreateBatch(e, course.id)} className="bg-[#252526] p-4 rounded-sm border border-[#3C3C3C] mb-4">
                    {batchError && <div className="mb-3 text-[10px] text-[#E5484D] font-bold">{batchError}</div>}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Batch Name *</label>
                        <input required value={batchName} onChange={e => setBatchName(e.target.value)} className={inputClass} placeholder="e.g. Batch 101" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Capacity</label>
                        <input value={batchCapacity} onChange={e => setBatchCapacity(e.target.value)} className={inputClass} placeholder="e.g. 30" />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Start Date</label>
                        <input type="date" value={batchStartDate} onChange={e => setBatchStartDate(e.target.value)} className={inputClass} />
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">End Date</label>
                        <input type="date" value={batchEndDate} onChange={e => setBatchEndDate(e.target.value)} className={inputClass} />
                      </div>
                      <div className="col-span-2 md:col-span-4">
                        <label className="block text-[9px] font-bold text-gray-400 uppercase mb-1">Schedule Details</label>
                        <input value={batchSchedule} onChange={e => setBatchSchedule(e.target.value)} className={inputClass} placeholder="e.g. Sun, Tue, Thu - 4:00 PM to 6:00 PM" />
                      </div>
                    </div>
                    <div className="flex justify-end gap-2">
                      <button type="button" onClick={() => setIsAddingBatch(null)} className="px-4 py-2 bg-[#333333] text-white text-[10px] font-bold rounded-sm hover:bg-[#444]">Cancel</button>
                      <button type="submit" className="px-4 py-2 bg-[#21C285] text-white text-[10px] font-bold rounded-sm border border-[#3E3E42] hover:bg-[#1ca671]">Save Batch</button>
                    </div>
                  </form>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {(!course.batches || course.batches.length === 0) ? (
                    <div className="col-span-full py-6 text-center text-xs font-bold text-gray-500 border border-dashed border-[#3C3C3C] rounded-sm">
                      No batches created yet.
                    </div>
                  ) : (
                    course.batches.map((batch: any) => (
                      <div key={batch.id} className="bg-[#252526] border border-[#3C3C3C] p-4 rounded-sm flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start mb-2">
                            <h5 className="text-xs font-bold text-white">{batch.name}</h5>
                            {batch.capacity && <span className="text-[9px] bg-[#333] px-2 py-0.5 rounded text-gray-400 font-bold">Cap: {batch.capacity}</span>}
                          </div>
                          {batch.schedule && (
                            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mb-2 font-semibold">
                              <Calendar className="w-3 h-3 text-[#CE9178]" /> {batch.schedule}
                            </div>
                          )}
                          {(batch.startDate || batch.endDate) && (
                            <div className="text-[10px] text-gray-500 font-semibold mb-3">
                              {batch.startDate && new Date(batch.startDate).toLocaleDateString()} 
                              {batch.endDate && ` - ${new Date(batch.endDate).toLocaleDateString()}`}
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        ))}

        {courses.length === 0 && (
          <div className="text-center text-gray-500 py-12 border border-dashed border-[#3C3C3C] rounded-md font-bold text-sm bg-[#252526]">
            No courses available. Click "New Course" to create one.
          </div>
        )}
      </div>
    </div>
  )
}
