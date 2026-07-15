import { NextResponse } from 'next/server'
import { createAdminClient } from '@/utils/supabase/admin'

export async function GET(request: Request) {
  // Simple header authentication to protect cron endpoint
  const { searchParams } = new URL(request.url)
  const key = searchParams.get('key') || request.headers.get('x-cron-key')
  
  const expectedKey = process.env.CRON_SECRET || 'coachingsync_cron_secret_2026'
  if (key !== expectedKey) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const now = new Date()

  try {
    // Select all active or grace subscriptions that have an expiration period
    const { data: subs, error: fetchErr } = await admin
      .from('Subscription')
      .select('*, Company(*)')
      .in('status', ['active', 'grace'])
      .not('currentPeriodEnd', 'is', null)

    if (fetchErr) throw fetchErr

    const results = []

    for (const sub of (subs || [])) {
      const periodEnd = new Date(sub.currentPeriodEnd)
      const timeDiff = periodEnd.getTime() - now.getTime()
      const daysLeft = Math.ceil(timeDiff / 86400000)

      let transitionPerformed = null

      // 1. Check for reminder notifications
      if (daysLeft === 7) {
        await notifyOnce(sub.id, '7_day', sub, admin)
        transitionPerformed = 'Sent 7-day reminder'
      } else if (daysLeft === 3) {
        await notifyOnce(sub.id, '3_day', sub, admin)
        transitionPerformed = 'Sent 3-day reminder'
      } else if (daysLeft === 1) {
        await notifyOnce(sub.id, '24_hour', sub, admin)
        transitionPerformed = 'Sent 24-hour reminder'
      }

      // 2. Handle active subscription expiration (grace period transition)
      if (daysLeft <= 0 && sub.status === 'active') {
        const graceEnd = new Date(periodEnd.getTime() + 3 * 86400000) // 3 days grace
        
        const { error: graceErr } = await admin
          .from('Subscription')
          .update({
            status: 'grace',
            graceEndsAt: graceEnd.toISOString(),
          })
          .eq('id', sub.id)

        if (graceErr) throw graceErr
        
        await notifyOnce(sub.id, 'grace_started', sub, admin)
        transitionPerformed = 'Transitioned to Grace status'
      }

      // 3. Handle grace period expiration (suspension)
      if (sub.status === 'grace' && sub.graceEndsAt) {
        const graceEndsAtDate = new Date(sub.graceEndsAt)
        if (graceEndsAtDate < now) {
          const { error: suspendErr } = await admin
            .from('Subscription')
            .update({ status: 'suspended' })
            .eq('id', sub.id)

          if (suspendErr) throw suspendErr

          await notifyOnce(sub.id, 'suspended', sub, admin)
          transitionPerformed = 'Suspended due to grace period expiry'
        }
      }

      results.push({
        subscriptionId: sub.id,
        companyName: sub.Company?.name,
        daysLeft,
        status: sub.status,
        action: transitionPerformed || 'Checked, no action needed'
      })
    }

    return NextResponse.json({ success: true, checkedCount: subs?.length || 0, details: results })
  } catch (err: any) {
    console.error('[CRON ERROR] Subscription reminder cron failed:', err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}

async function notifyOnce(subscriptionId: string, type: string, sub: any, admin: any) {
  const today = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  
  // Check if this type of notification has already been sent today
  const { data: already } = await admin
    .from('SubscriptionNotification')
    .select('id')
    .eq('subscriptionId', subscriptionId)
    .eq('type', type)
    .gte('sentAt', `${today}T00:00:00Z`)
    .maybeSingle()

  if (already) return // Already notified today

  // Insert notification log
  await admin.from('SubscriptionNotification').insert({
    subscriptionId,
    type,
    sentAt: new Date().toISOString()
  })

  // Insert System Activity Log to make it visible on dashboards
  await admin.from('ActivityLog').insert({
    companyId: sub.companyId,
    action: `subscription.notify_${type}`,
    entityType: 'Subscription',
    entityId: subscriptionId,
    metadata: {
      daysLeft: Math.ceil((new Date(sub.currentPeriodEnd).getTime() - Date.now()) / 86400000),
      currentPeriodEnd: sub.currentPeriodEnd,
      status: sub.status
    }
  })
}
