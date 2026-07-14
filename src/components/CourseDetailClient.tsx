'use client'

import { useState } from 'react'
import { Plus, X, Users, Calendar, AlertTriangle, BookOpen, Clock, User, CheckCircle } from 'lucide-react'
import { createBatchAction } from '@/app/actions/courses'
import { useRouter } from 'next/navigation'

export default function CourseDetailClient({ course, staff }: { course: any, staff: any[] }) {
  const router = useRouter()
  const [batches, setBatches] = useState<any[]>(course.batches || [])
  
  const [isAddingBatch, setIsAddingBatch] = useState(false)
  const [batchName, setBatchName] = useState('')
  const [batchCapacity, setBatchCapacity] = useState('')
  const [batchStartDate, setBatchStartDate] = useState('')
  const [batchEndDate, setBatchEndDate] = useState('')
  const [instructorId, setInstructorId] = useState('')
  const [batchError, setBatchError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleCreateBatch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!batchName) return

    setIsSubmitting(true)
    setBatchError('')
    const formData = new FormData()
    formData.append('courseId', course.id)
    formData.append('name', batchName)
    formData.append('capacity', batchCapacity)
    if (batchStartDate) formData.append('startDate', batchStartDate)
    if (batchEndDate) formData.append('endDate', batchEndDate)
    if (instructorId) formData.append('instructorId', instructorId)

    const result = await createBatchAction(formData)
    setIsSubmitting(false)
    
    if (result.error) {
      setBatchError(result.error)
    } else {
      // Find full instructor object for optimistic update
      const assignedInstructor = staff.find(s => s.id === instructorId) || null
      const newBatch = {
        ...result.batch,
        instructor: assignedInstructor
      }
      setBatches([newBatch, ...batches])
      setIsAddingBatch(false)
      setBatchName('')
      setBatchCapacity('')
      setBatchStartDate('')
      setBatchEndDate('')
      setInstructorId('')
      router.refresh() // To ensure server state syncs
    }
  }

  const inputClass = "w-full bg-[#1E1E1E] border border-[#3E3E42] rounded-sm py-2 px-3 text-xs font-medium text-[#D4D4D4] placeholder-[#858585] focus:outline-none focus:border-[#007ACC] transition-all"

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      
      {/* LEFT COL - Course Overview */}
      <div className="xl:col-span-1 space-y-6">
        <div className="bg-[#252526] border border-[#3E3E42] rounded-md p-5">
          <div className="flex items-center gap-2 mb-4 text-[#D4D4D4] font-semibold border-b border-[#3E3E42] pb-3">
            <BookOpen className="w-4 h-4 text-[#4EC9B0]" /> Course Details
          </div>
          
          <div className="space-y-4">
            <div>
              <p className="text-[10px] text-[#858585] uppercase tracking-wider mb-1">Course Name</p>
              <p className="text-sm text-[#D4D4D4] font-medium">{course.name || course.title}</p>
            </div>
            
            <div>
              <p className="text-[10px] text-[#858585] uppercase tracking-wider mb-1">Fee</p>
              <p className="text-sm font-medium text-[#007ACC]">{course.fee || 'N/A'}</p>
            </div>

            <div>
              <p className="text-[10px] text-[#858585] uppercase tracking-wider mb-1">In-Charge</p>
              <p className="text-sm text-[#D4D4D4] font-medium flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#858585]" /> 
                {course.inCharge?.fullName || 'Not assigned'}
              </p>
            </div>

            <div>
              <p className="text-[10px] text-[#858585] uppercase tracking-wider mb-1">Description</p>
              <p className="text-xs text-[#CCCCCC] leading-relaxed">
                {course.description || <span className="italic text-[#858585]">No description provided.</span>}
              </p>
            </div>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-[#252526] border border-[#3E3E42] rounded-md p-4 flex flex-col items-center text-center">
            <span className="text-2xl font-bold text-[#D4D4D4] mb-1">{batches.length}</span>
            <span className="text-[10px] text-[#858585] uppercase tracking-wider">Total Batches</span>
          </div>
          <div className="bg-[#252526] border border-[#3E3E42] rounded-md p-4 flex flex-col items-center text-center">
            <span className="text-2xl font-bold text-[#D4D4D4] mb-1">
              {batches.reduce((sum, b) => sum + (b.capacity || 0), 0)}
            </span>
            <span className="text-[10px] text-[#858585] uppercase tracking-wider">Total Capacity</span>
          </div>
        </div>
      </div>

      {/* RIGHT COL - Batch Management */}
      <div className="xl:col-span-2 space-y-6">
        <div className="bg-[#252526] border border-[#3E3E42] rounded-md overflow-hidden">
          
          <div className="p-5 flex justify-between items-center border-b border-[#3E3E42]">
            <h3 className="text-sm font-semibold text-[#D4D4D4] flex items-center gap-2">
              <Users className="w-4 h-4 text-[#007ACC]" /> Batch Schedule
            </h3>
            <button 
              onClick={() => setIsAddingBatch(!isAddingBatch)}
              className="px-3 py-1.5 bg-[#1E1E1E] hover:bg-[#333333] border border-[#3E3E42] text-[#D4D4D4] text-[10px] font-medium rounded-sm transition-colors flex items-center gap-1.5"
            >
              {isAddingBatch ? <><X className="w-3.5 h-3.5"/> Cancel</> : <><Plus className="w-3.5 h-3.5"/> Create Batch</>}
            </button>
          </div>

          {isAddingBatch && (
            <form onSubmit={handleCreateBatch} className="p-5 border-b border-[#3E3E42] bg-[#1E1E1E]">
              {batchError && (
                <div className="mb-4 flex items-center gap-2 text-[10px] text-[#E5484D] bg-[#E5484D]/10 p-2 rounded-sm border border-[#E5484D]/20">
                  <AlertTriangle className="w-3.5 h-3.5" /> {batchError}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-[10px] text-[#CCCCCC] mb-1.5 uppercase tracking-wider">Batch Name *</label>
                  <input required value={batchName} onChange={e => setBatchName(e.target.value)} className={inputClass} placeholder="e.g. Batch 101 - Morning" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#CCCCCC] mb-1.5 uppercase tracking-wider">Student Capacity</label>
                  <input type="number" min="1" value={batchCapacity} onChange={e => setBatchCapacity(e.target.value)} className={inputClass} placeholder="e.g. 30" />
                </div>
                <div>
                  <label className="block text-[10px] text-[#CCCCCC] mb-1.5 uppercase tracking-wider">Start Date</label>
                  <input type="date" value={batchStartDate} onChange={e => setBatchStartDate(e.target.value)} className={inputClass} />
                </div>
                <div>
                  <label className="block text-[10px] text-[#CCCCCC] mb-1.5 uppercase tracking-wider">End Date</label>
                  <input type="date" value={batchEndDate} onChange={e => setBatchEndDate(e.target.value)} className={inputClass} />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-[10px] text-[#CCCCCC] mb-1.5 uppercase tracking-wider">Assigned Instructor</label>
                  <select value={instructorId} onChange={e => setInstructorId(e.target.value)} className={inputClass}>
                    <option value="">-- Select Instructor --</option>
                    {staff.map(member => (
                      <option key={member.id} value={member.id}>{member.fullName} ({member.role})</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-2">
                <button disabled={isSubmitting} type="submit" className="px-4 py-2 bg-[#007ACC] hover:bg-[#005999] disabled:opacity-50 text-white text-xs font-medium rounded-sm transition-colors">
                  {isSubmitting ? 'Saving...' : 'Save Batch'}
                </button>
              </div>
            </form>
          )}

          <div className="divide-y divide-[#3E3E42]">
            {batches.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#858585]">
                No batches created for this course yet.
              </div>
            ) : (
              batches.map(batch => (
                <div key={batch.id} className="p-5 hover:bg-[#1E1E1E] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-[#D4D4D4] flex items-center gap-2 mb-1">
                      {batch.name}
                      {batch.capacity && <span className="px-1.5 py-0.5 rounded-sm bg-[#333333] text-[9px] text-[#858585] font-semibold">CAP: {batch.capacity}</span>}
                    </h4>
                    
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[10px] text-[#858585]">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-[#007ACC]" />
                        {batch.startDate ? new Date(batch.startDate).toLocaleDateString() : 'TBD'} 
                        {' - '} 
                        {batch.endDate ? new Date(batch.endDate).toLocaleDateString() : 'TBD'}
                      </span>
                      
                      {batch.instructor && (
                        <>
                          <span className="text-[#3E3E42]">|</span>
                          <span className="flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-[#CE9178]" />
                            {batch.instructor.fullName}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div>
                    <button className="px-3 py-1.5 border border-[#3E3E42] text-[#CCCCCC] hover:text-white hover:bg-[#333333] rounded-sm text-[10px] font-medium transition-colors">
                      Edit
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
