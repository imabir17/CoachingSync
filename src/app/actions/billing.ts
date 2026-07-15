'use server'

import { createClient } from '@/utils/supabase/server'
import { getUserSession } from '@/lib/auth'
import { createAdminClient } from '@/utils/supabase/admin'

async function healSubscription(companyId: string) {
  const admin = createAdminClient()
  
  // 1. Get or create default branch
  let { data: branch } = await admin
    .from('Branch')
    .select('id')
    .eq('companyId', companyId)
    .eq('isDefault', true)
    .maybeSingle()

  if (!branch) {
    const { data: newBranch, error: nbErr } = await admin
      .from('Branch')
      .insert({ companyId, name: 'Main Branch', isDefault: true })
      .select()
      .single()
    if (nbErr) {
      console.error('[BILLING ERROR] healSubscription branch creation error:', nbErr)
      throw new Error(`Failed to self-heal branch: ${nbErr.message}`)
    }
    branch = newBranch
  }

  // 2. Get Free plan
  const { data: freePlan, error: fpErr } = await admin
    .from('Plan')
    .select('id')
    .eq('name', 'Free')
    .single()

  if (fpErr || !freePlan) {
    console.error('[BILLING ERROR] healSubscription free plan fetch error:', fpErr)
    throw new Error('Failed to find Free plan. Ensure SQL migrations are fully run.')
  }

  if (!branch) {
    throw new Error('Failed to create default branch for company.')
  }

  // 3. Create Subscription
  const { data: newSub, error: nsErr } = await admin
    .from('Subscription')
    .insert({
      branchId: branch.id,
      companyId: companyId,
      planId: freePlan.id,
      status: 'active',
      currentPeriodEnd: null,
    })
    .select(`
      *,
      Plan (*)
    `)
    .single()

  if (nsErr) {
    console.error('[BILLING ERROR] healSubscription subscription creation error:', nsErr)
    throw new Error(`Failed to self-heal subscription: ${nsErr.message}`)
  }

  return newSub
}

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
  let { data: sub } = await supabase
    .from('Subscription')
    .select('id')
    .eq('companyId', me.companyId)
    .maybeSingle()

  if (!sub) {
    // Self-heal
    sub = await healSubscription(me.companyId)
  }

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
  // Order by status (active first) then most recent to handle multiple rows gracefully
  let { data: sub, error: subErr } = await supabase
    .from('Subscription')
    .select(`
      *,
      Plan (*)
    `)
    .eq('companyId', user.companyId)
    .order('createdAt', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (subErr) {
    console.error('[BILLING ERROR] getBillingDetails subscription error:', subErr)
    throw new Error(`Database error fetching subscription details: ${subErr.message}`)
  }

  if (!sub) {
    // Self-heal
    sub = await healSubscription(user.companyId)
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

  const subPlan = (sub as any)?.Plan

  return {
    subscription: sub ? {
      ...sub,
      plan: subPlan,
      // Convenience: if isCustom flag set and plan is still 'Free', use override display name
      effectivePlanName: sub.isCustom ? 'Custom' : (subPlan?.name ?? 'Free'),
    } : null,
    branches: branches || [],
    payments: payments || [],
    plans: (plans || []).filter((p: any) => p.billingCycle !== 'free' && p.billingCycle !== 'custom'),
    paymentMethods: paymentMethods || [],
  }
}
