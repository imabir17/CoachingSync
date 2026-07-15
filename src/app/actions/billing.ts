'use server'

import { createClient } from '@/utils/supabase/server'
import { getUserSession } from '@/lib/auth'

export async function submitPayment(planId: string, method: string, transactionNumber: string) {
  const user = await getUserSession()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  // Verify roles
  const { data: me } = await supabase
    .from('User')
    .select('companyId, role')
    .eq('id', user.id)
    .single()

  if (!me || me.role !== 'Super Admin') {
    throw new Error('Only Super Admin can manage billing and payments')
  }

  // Get active subscription
  const { data: sub } = await supabase
    .from('Subscription')
    .select('id')
    .eq('companyId', me.companyId)
    .single()

  if (!sub) throw new Error('No active subscription found')

  // Get Plan details to compute total
  const { data: plan } = await supabase
    .from('Plan')
    .select('*')
    .eq('id', planId)
    .single()

  if (!plan) throw new Error('Selected plan not found')

  const includesSetupFee = plan.billingCycle === 'monthly'
  const amount = Number(plan.priceUsd) + (includesSetupFee ? Number(plan.setupFeeUsd) : 0)

  const { data: payment, error } = await supabase
    .from('Payment')
    .insert({
      subscriptionId: sub.id,
      companyId: me.companyId,
      planId: plan.id,
      amountUsd: amount,
      includesSetupFee,
      method,
      transactionNumber,
      submittedById: user.id,
    })
    .select()
    .single()

  if (error) throw error
  return { success: true, payment }
}

export async function getBillingDetails() {
  const user = await getUserSession()
  if (!user) throw new Error('Not authenticated')

  const supabase = await createClient()

  // Get subscription, plan, branch, and payments
  const { data: sub, error: subErr } = await supabase
    .from('Subscription')
    .select(`
      *,
      Plan (*)
    `)
    .eq('companyId', user.companyId)
    .maybeSingle()

  if (subErr) {
    console.error('[BILLING ERROR] getBillingDetails subscription error:', subErr)
    throw new Error(`Database error fetching subscription details: ${subErr.message}`)
  }

  const { data: branches, error: branchErr } = await supabase
    .from('Branch')
    .select('*')
    .eq('companyId', user.companyId)

  if (branchErr) {
    console.error('[BILLING ERROR] getBillingDetails branches error:', branchErr)
    throw new Error(`Database error fetching branches: ${branchErr.message}`)
  }

  const { data: payments, error: payErr } = await supabase
    .from('Payment')
    .select(`
      *,
      Plan (*)
    `)
    .eq('companyId', user.companyId)
    .order('createdAt', { ascending: false })

  if (payErr) {
    console.error('[BILLING ERROR] getBillingDetails payments error:', payErr)
    throw new Error(`Database error fetching payments: ${payErr.message}`)
  }

  const { data: plans, error: plansErr } = await supabase
    .from('Plan')
    .select('*')
    .eq('isActive', true)
    .eq('isPublic', true)

  if (plansErr) {
    console.error('[BILLING ERROR] getBillingDetails plans error:', plansErr)
    throw new Error(`Database error fetching plans: ${plansErr.message}`)
  }

  const { data: paymentMethods, error: pmErr } = await supabase
    .from('PaymentMethodConfig')
    .select('*')
    .eq('isActive', true)

  if (pmErr) {
    console.error('[BILLING ERROR] getBillingDetails payment methods error:', pmErr)
    throw new Error(`Database error fetching payment methods: ${pmErr.message}`)
  }

  return {
    subscription: sub ? {
      ...sub,
      plan: (sub as any).Plan
    } : null,
    branches: branches || [],
    payments: payments || [],
    plans: plans || [],
    paymentMethods: paymentMethods || [],
  }
}
