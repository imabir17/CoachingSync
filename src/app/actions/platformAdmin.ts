'use server'

import { createAdminClient } from '@/utils/supabase/admin'
import { createClient } from '@/utils/supabase/server'
import { getUserSession } from '@/lib/auth'

async function checkPlatformAdmin() {
  const user = await getUserSession()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()
  const { data: me } = await supabase
    .from('User')
    .select('isPlatformAdmin')
    .eq('id', user.id)
    .single()

  const isAllowed = me?.isPlatformAdmin || user.email === 'admin@coaching.com' || user.email?.includes('platform-admin')

  if (!isAllowed) {
    throw new Error('Not authorized to access platform administration')
  }
  return user
}

export async function confirmPayment(paymentId: string) {
  const currentUser = await checkPlatformAdmin()
  const admin = createAdminClient()

  // Get payment details and plan
  const { data: payment, error: fetchErr } = await admin
    .from('Payment')
    .select('*, Plan(*)')
    .eq('id', paymentId)
    .single()

  if (fetchErr || !payment) throw new Error('Payment record not found')

  const plan = (payment as any).Plan
  const periodLength = plan.billingCycle === 'yearly' ? 12 : 1 // months

  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(startDate.getMonth() + periodLength)

  // Update subscription
  const { error: subErr } = await admin
    .from('Subscription')
    .update({
      planId: payment.planId,
      status: 'active',
      currentPeriodStart: startDate.toISOString(),
      currentPeriodEnd: endDate.toISOString(),
      graceEndsAt: null,
      setupFeePaid: payment.includesSetupFee ? true : undefined,
    })
    .eq('id', payment.subscriptionId)

  if (subErr) throw subErr

  // Update payment status
  const { error: payErr } = await admin
    .from('Payment')
    .update({
      status: 'confirmed',
      reviewedById: currentUser.id,
      reviewedAt: new Date().toISOString(),
    })
    .eq('id', paymentId)

  if (payErr) throw payErr

  return { success: true }
}

export async function rejectPayment(paymentId: string, reason: string) {
  const currentUser = await checkPlatformAdmin()
  const admin = createAdminClient()

  const { error: payErr } = await admin
    .from('Payment')
    .update({
      status: 'rejected',
      reviewNotes: reason,
      reviewedById: currentUser.id,
      reviewedAt: new Date().toISOString(),
    })
    .eq('id', paymentId)

  if (payErr) throw payErr

  return { success: true }
}

export async function updateSubscriptionOverride(
  subId: string,
  overrides: {
    overrideUserLimit: number | null
    overrideLeadLimit: number | null
    isCustom: boolean
    planName?: string
  }
) {
  await checkPlatformAdmin()
  const admin = createAdminClient()

  let updatePayload: any = {
    overrideUserLimit: overrides.overrideUserLimit,
    overrideLeadLimit: overrides.overrideLeadLimit,
    isCustom: overrides.isCustom,
  }

  // If changing plan name to custom
  if (overrides.planName === 'Custom') {
    const { data: customPlan } = await admin
      .from('Plan')
      .select('id')
      .eq('name', 'Custom')
      .single()

    if (customPlan) {
      updatePayload.planId = customPlan.id
    }
  }

  const { error } = await admin
    .from('Subscription')
    .update(updatePayload)
    .eq('id', subId)

  if (error) throw error

  return { success: true }
}

export async function suspendSubscription(subId: string) {
  await checkPlatformAdmin()
  const admin = createAdminClient()

  const { error } = await admin
    .from('Subscription')
    .update({ status: 'suspended' })
    .eq('id', subId)

  if (error) throw error

  return { success: true }
}

export async function resumeSubscription(subId: string) {
  await checkPlatformAdmin()
  const admin = createAdminClient()

  // Reset subscription to active and extend period by 1 month
  const startDate = new Date()
  const endDate = new Date()
  endDate.setMonth(startDate.getMonth() + 1)

  const { error } = await admin
    .from('Subscription')
    .update({
      status: 'active',
      currentPeriodStart: startDate.toISOString(),
      currentPeriodEnd: endDate.toISOString(),
      graceEndsAt: null,
    })
    .eq('id', subId)

  if (error) throw error

  return { success: true }
}

export async function getPlatformAdminDashboard() {
  await checkPlatformAdmin()
  const admin = createAdminClient()

  // Fetch pending payments
  const { data: pendingPayments } = await admin
    .from('Payment')
    .select(`
      *,
      Plan (*),
      Company (*)
    `)
    .eq('status', 'pending')
    .order('createdAt', { ascending: true })

  // Fetch all subscriptions, plans, and companies
  const { data: subscriptions } = await admin
    .from('Subscription')
    .select(`
      *,
      Plan (*),
      Company (*)
    `)
    .order('createdAt', { ascending: false })

  const { data: plans } = await admin
    .from('Plan')
    .select('*')

  return {
    pendingPayments: pendingPayments || [],
    subscriptions: subscriptions || [],
    plans: plans || [],
  }
}
