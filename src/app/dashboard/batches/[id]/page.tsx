import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getBatchDetailsAction } from '@/app/actions/courses'
import BatchDetailClient from '@/components/BatchDetailClient'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

export const metadata = {
  title: 'Batch Details | CoachingSync',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BatchDetailPage({ params }: PageProps) {
  const user = await getUserSession()
  if (!user) redirect('/login')

  const resolvedParams = await params
  const { data: batch, error } = await getBatchDetailsAction(resolvedParams.id)

  if (error || !batch) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-6 text-center space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="p-8 bg-[#252526] border border-[#E5484D]/30 rounded-md max-w-md mx-auto">
          <h2 className="text-base font-bold text-[#E5484D] mb-3">Batch Not Found</h2>
          <p className="text-xs text-[#CCCCCC] mb-6">
            {error || "The batch you are looking for does not exist or you do not have permission to view it."}
          </p>
          <Link 
            href="/dashboard/courses" 
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#1E1E1E] border border-[#3E3E42] rounded-sm text-xs font-bold text-[#CCCCCC] hover:text-white hover:border-[#555555] transition-all"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Courses
          </Link>
        </div>
      </div>
    )
  }

  return (
    <BatchDetailPageContent batch={batch} />
  )
}

function BatchDetailPageContent({ batch }: { batch: any }) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link 
            href={`/dashboard/courses/${batch.course.id}`} 
            className="p-2.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] hover:border-[#555555] text-[#CCCCCC] hover:text-[#D4D4D4] transition-all"
            aria-label="Back to course details"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-[#D4D4D4] font-display">{batch.name}</h2>
            <p className="text-xs text-[#CCCCCC] mt-1">
              Course: <span className="font-bold text-[#007ACC]">{batch.course.name}</span>
            </p>
          </div>
        </div>
      </div>

      <BatchDetailClient batch={batch} />
    </div>
  )
}
