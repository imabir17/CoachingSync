'use client'

import { Search, Filter, Users, GraduationCap, ClipboardList } from 'lucide-react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { useTransition, useState, useEffect } from 'react'
import { LEAD_STAGES } from '@/lib/constants'

type Counselor = { id: string; fullName: string }
type Course = { id: string; name: string }
type Batch = { id: string; name: string; courseId: string }

export function LeadFilters({ 
  isAdminOrManager, 
  counselors, 
  sources = [],
  stages = [],
  courses = [],
  batches = []
}: { 
  isAdminOrManager: boolean
  counselors: Counselor[]
  sources?: string[] 
  stages?: any[]
  courses?: Course[]
  batches?: Batch[]
}) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [isPending, startTransition] = useTransition()

  // Keep track of the selected course so we can filter the batches dropdown locally
  const [selectedCourseId, setSelectedCourseId] = useState(searchParams.get('courseId') || '')

  useEffect(() => {
    setSelectedCourseId(searchParams.get('courseId') || '')
  }, [searchParams])

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (term) {
      params.set('q', term)
    } else {
      params.delete('q')
    }
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const handleStageFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const stage = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (stage) {
      params.set('stage', stage)
    } else {
      params.delete('stage')
    }
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const handleCounselorFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const counselorId = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (counselorId) {
      params.set('counselorId', counselorId)
    } else {
      params.delete('counselorId')
    }
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const handleCourseFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const courseId = e.target.value
    setSelectedCourseId(courseId)
    const params = new URLSearchParams(searchParams.toString())
    
    if (courseId) {
      params.set('courseId', courseId)
    } else {
      params.delete('courseId')
    }
    // Reset batch filter if course changes
    params.delete('batchId')
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const handleBatchFilter = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const batchId = e.target.value
    const params = new URLSearchParams(searchParams.toString())
    if (batchId) {
      params.set('batchId', batchId)
    } else {
      params.delete('batchId')
    }
    
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}`)
    })
  }

  const filteredBatches = selectedCourseId 
    ? batches.filter(b => b.courseId === selectedCourseId)
    : batches

  const selectClass = "px-3 py-2 bg-[#1E1E1E] border border-[#3E3E42] text-xs font-bold text-[#CCCCCC] hover:text-[#D4D4D4] rounded-sm outline-none focus:border border-[#3E3E42] transition-all cursor-pointer"

  return (
    <div className="neo-raised p-6 flex flex-col gap-4 relative">
      {isPending && (
        <span className="absolute top-3 right-4 text-[10px] font-bold text-[#4EC9B0] bg-[#4EC9B0]/10 px-2 py-0.5 rounded-full">
          Updating...
        </span>
      )}
      
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full lg:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[#858585]" />
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            defaultValue={searchParams.get('q') || ''}
            onChange={handleSearch}
            className="w-full pl-10 pr-4 py-3 bg-[#1E1E1E] border border-[#3E3E42] rounded-sm text-xs font-semibold text-[#D4D4D4] placeholder-[#858585] focus:outline-none focus:border border-[#3E3E42] transition-all"
          />
        </div>

        {/* Filters Controls */}
        <div className="flex flex-wrap items-center gap-3">
          {isAdminOrManager && (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-[#858585] shrink-0" />
              <select 
                onChange={handleCounselorFilter}
                defaultValue={searchParams.get('counselorId') || ''}
                className={selectClass}
              >
                <option value="">All Counselors</option>
                {counselors.map(c => (
                  <option key={c.id} value={c.id}>{c.fullName}</option>
                ))}
              </select>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-[#858585] shrink-0" />
            <select 
              onChange={handleStageFilter}
              defaultValue={searchParams.get('stage') || ''}
              className={selectClass}
            >
              <option value="">All Stages</option>
              {stages.length > 0 ? (
                stages.map(s => (
                  <option key={s.id} value={s.name}>{s.name}</option>
                ))
              ) : (
                LEAD_STAGES.map(stage => (
                  <option key={stage} value={stage}>{stage}</option>
                ))
              )}
            </select>
          </div>

          <select 
            onChange={(e) => {
              const rating = e.target.value
              const params = new URLSearchParams(searchParams.toString())
              if (rating) {
                params.set('rating', rating)
              } else {
                params.delete('rating')
              }
              startTransition(() => {
                router.replace(`${pathname}?${params.toString()}`)
              })
            }}
            defaultValue={searchParams.get('rating') || ''}
            className={selectClass}
          >
            <option value="">All Ratings</option>
            <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
            <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
            <option value="3">⭐⭐⭐ (3 Stars)</option>
            <option value="2">⭐⭐ (2 Stars)</option>
            <option value="1">⭐ (1 Star)</option>
          </select>

          <select 
            onChange={(e) => {
              const source = e.target.value
              const params = new URLSearchParams(searchParams.toString())
              if (source) {
                params.set('source', source)
              } else {
                params.delete('source')
              }
              startTransition(() => {
                router.replace(`${pathname}?${params.toString()}`)
              })
            }}
            defaultValue={searchParams.get('source') || ''}
            className={selectClass}
          >
            <option value="">All Sources</option>
            {sources.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          {/* New Course Filter */}
          <div className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4 text-[#858585] shrink-0" />
            <select 
              onChange={handleCourseFilter}
              value={selectedCourseId}
              className={selectClass}
            >
              <option value="">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.name}</option>
              ))}
            </select>
          </div>

          {/* New Batch Filter */}
          <div className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[#858585] shrink-0" />
            <select 
              onChange={handleBatchFilter}
              defaultValue={searchParams.get('batchId') || ''}
              className={selectClass}
            >
              <option value="">All Batches</option>
              {filteredBatches.map(batch => (
                <option key={batch.id} value={batch.id}>{batch.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}
