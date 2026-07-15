import { getUserSession } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { getBillingDetails } from '@/app/actions/billing'
import BillingClient from './BillingClient'

export const metadata = {
  title: 'Billing & Subscriptions - CoachingSync',
  description: 'Manage your center branch subscription plans and pay via bkash, nagad, rocket',
}

export default async function BillingPage() {
  const user = await getUserSession()
  if (!user || user.role !== 'Super Admin') {
    redirect('/dashboard')
  }

  const billingData = await getBillingDetails()

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out pb-12">
      <div>
        <h2 className="text-2xl font-bold text-white font-display">Billing &amp; Subscription</h2>
        <p className="text-xs text-[#858585]">
          Manage your branches, active subscriptions, pricing plans, and offline payments.
        </p>
      </div>

      <BillingClient initialData={billingData} />
    </div>
  )
}
