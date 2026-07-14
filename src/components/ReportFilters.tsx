'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

export function ReportFilters({ 
  counselors, 
  isAdmin 
}: { 
  counselors: { id: string, fullName: string }[]
  isAdmin: boolean 
}) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [dateRange, setDateRange] = useState(searchParams.get('range') || 'thisMonth')
  const [customStart, setCustomStart] = useState(searchParams.get('start') || '')
  const [customEnd, setCustomEnd] = useState(searchParams.get('end') || '')
  const [selectedCounselor, setSelectedCounselor] = useState(searchParams.get('counselorId') || '')

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    params.set('range', dateRange)
    
    if (dateRange === 'custom') {
      if (customStart) params.set('start', customStart)
      if (customEnd) params.set('end', customEnd)
    }

    if (selectedCounselor) {
      params.set('counselorId', selectedCounselor)
    }

    router.push(`/dashboard/reports?${params.toString()}`)
  }

  const selectClass = "px-3 py-2.5 bg-[#1E1E1E] border border-[#3E3E42] text-xs font-bold text-[#CCCCCC] hover:text-[#D4D4D4] rounded-sm outline-none focus:border border-[#3E3E42] transition-all cursor-pointer"
  const inputClass = "px-3 py-2 bg-[#1E1E1E] border border-[#3E3E42] border-none rounded-sm text-xs font-semibold text-[#D4D4D4] placeholder-[#858585] focus:outline-none transition-all"

  return (
    <div className="neo-raised p-5 mb-8 flex flex-wrap gap-5 items-end">
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold text-[#858585] uppercase tracking-wider">Time Range</label>
        <select 
          value={dateRange}
          onChange={(e) => setDateRange(e.target.value)}
          className={selectClass}
        >
          <option value="thisWeek">This Week</option>
          <option value="thisMonth">This Month</option>
          <option value="lastMonth">Last Month</option>
          <option value="custom">Custom Date Range</option>
        </select>
      </div>

      {dateRange === 'custom' && (
        <>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#858585] uppercase tracking-wider">Start Date</label>
            <input 
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className={inputClass}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] font-bold text-[#858585] uppercase tracking-wider">End Date</label>
            <input 
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className={inputClass}
            />
          </div>
        </>
      )}

      {isAdmin && (
        <div className="flex flex-col gap-2 min-w-[200px]">
          <label className="text-[10px] font-bold text-[#858585] uppercase tracking-wider">Counselor</label>
          <select 
            value={selectedCounselor}
            onChange={(e) => setSelectedCounselor(e.target.value)}
            className={selectClass}
          >
            <option value="">All Counselors</option>
            {counselors.map(c => (
              <option key={c.id} value={c.id}>{c.fullName}</option>
            ))}
          </select>
        </div>
      )}

      <button 
        onClick={applyFilters}
        className="px-5 py-3 bg-gradient-to-br from-[#007ACC] to-[#0062A3] text-white text-xs font-bold rounded-sm border border-[#3E3E42] hover:border-[#555555] active:translate-y-0.5 transition-all duration-150 cursor-pointer"
      >
        Apply Filters
      </button>
    </div>
  )
}
