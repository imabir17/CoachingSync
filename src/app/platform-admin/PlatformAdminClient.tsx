'use client'

import { useState } from 'react'
import { 
  confirmPayment, 
  rejectPayment, 
  updateSubscriptionOverride, 
  suspendSubscription, 
  resumeSubscription 
} from '@/app/actions/platformAdmin'
import { 
  Shield, 
  Check, 
  X, 
  AlertCircle, 
  Loader2, 
  Settings, 
  Sliders, 
  Ban, 
  Play
} from 'lucide-react'

type Plan = {
  id: string
  name: string
  billingCycle: string
  priceUsd: number
  setupFeeUsd: number
  userLimit: number | null
  leadLimitPerMonth: number | null
}

type Company = {
  id: string
  name: string
}

type Subscription = {
  id: string
  companyId: string
  planId: string
  status: string
  overrideUserLimit: number | null
  overrideLeadLimit: number | null
  isCustom: boolean
  currentPeriodStart: string
  currentPeriodEnd: string | null
  Company: Company
  Plan: Plan
}

type Payment = {
  id: string
  subscriptionId: string
  companyId: string
  planId: string
  amountUsd: number
  method: string
  transactionNumber: string
  status: string
  createdAt: string
  Company: Company
  Plan: Plan
}

type PlatformAdminProps = {
  initialData: {
    pendingPayments: Payment[]
    subscriptions: Subscription[]
    plans: Plan[]
  }
}

export default function PlatformAdminClient({ initialData }: PlatformAdminProps) {
  const [pendingPayments, setPendingPayments] = useState<Payment[]>(initialData.pendingPayments)
  const [subscriptions, setSubscriptions] = useState<Subscription[]>(initialData.subscriptions)
  
  // Local state for actions
  const [actioningPaymentId, setActioningPaymentId] = useState<string | null>(null)
  const [rejectionReasons, setRejectionReasons] = useState<{ [key: string]: string }>({})
  const [showRejectFormId, setShowRejectFormId] = useState<string | null>(null)

  // Subscription override local state
  const [editingSubId, setEditingSubId] = useState<string | null>(null)
  const [userLimitInput, setUserLimitInput] = useState<string>('')
  const [leadLimitInput, setLeadLimitInput] = useState<string>('')
  const [isCustomInput, setIsCustomInput] = useState<boolean>(false)
  const [isCustomPlanInput, setIsCustomPlanInput] = useState<boolean>(false)

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null)

  const handleConfirm = async (paymentId: string) => {
    setActioningPaymentId(paymentId)
    setMessage(null)
    try {
      await confirmPayment(paymentId)
      setMessage({ text: 'Payment confirmed successfully. Subscription is now active.', type: 'success' })
      setPendingPayments(pendingPayments.filter(p => p.id !== paymentId))
      
      // Update local subscription state
      const confirmedPayment = pendingPayments.find(p => p.id === paymentId)
      if (confirmedPayment) {
        setSubscriptions(subscriptions.map(s => {
          if (s.id === confirmedPayment.subscriptionId) {
            return {
              ...s,
              status: 'active',
              planId: confirmedPayment.planId,
              Plan: confirmedPayment.Plan
            }
          }
          return s
        }))
      }
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to confirm payment', type: 'error' })
    } finally {
      setActioningPaymentId(null)
    }
  }

  const handleReject = async (paymentId: string) => {
    const reason = rejectionReasons[paymentId] || ''
    if (!reason.trim()) {
      setMessage({ text: 'Please enter a rejection reason note', type: 'error' })
      return
    }

    setActioningPaymentId(paymentId)
    setMessage(null)
    try {
      await rejectPayment(paymentId, reason)
      setMessage({ text: 'Payment reference rejected successfully.', type: 'success' })
      setPendingPayments(pendingPayments.filter(p => p.id !== paymentId))
      setShowRejectFormId(null)
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to reject payment', type: 'error' })
    } finally {
      setActioningPaymentId(null)
    }
  }

  const handleSaveOverride = async (sub: Subscription) => {
    setMessage(null)
    const overrideUserLimit = userLimitInput.trim() === '' ? null : Number(userLimitInput)
    const overrideLeadLimit = leadLimitInput.trim() === '' ? null : Number(leadLimitInput)
    
    try {
      await updateSubscriptionOverride(sub.id, {
        overrideUserLimit,
        overrideLeadLimit,
        isCustom: isCustomInput,
        planName: isCustomPlanInput ? 'Custom' : undefined
      })
      
      setMessage({ text: 'Subscription overrides updated successfully.', type: 'success' })
      
      setSubscriptions(subscriptions.map(s => {
        if (s.id === sub.id) {
          return {
            ...s,
            overrideUserLimit,
            overrideLeadLimit,
            isCustom: isCustomInput,
            planId: isCustomPlanInput ? initialData.plans.find(p => p.name === 'Custom')?.id || s.planId : s.planId,
            Plan: isCustomPlanInput ? initialData.plans.find(p => p.name === 'Custom') || s.Plan : s.Plan
          }
        }
        return s
      }))
      
      setEditingSubId(null)
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to update overrides', type: 'error' })
    }
  }

  const handleSuspend = async (subId: string) => {
    setMessage(null)
    try {
      await suspendSubscription(subId)
      setMessage({ text: 'Subscription suspended successfully.', type: 'success' })
      setSubscriptions(subscriptions.map(s => {
        if (s.id === subId) {
          return { ...s, status: 'suspended' }
        }
        return s
      }))
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to suspend subscription', type: 'error' })
    }
  }

  const handleResume = async (subId: string) => {
    setMessage(null)
    try {
      await resumeSubscription(subId)
      setMessage({ text: 'Subscription resumed and extended successfully.', type: 'success' })
      setSubscriptions(subscriptions.map(s => {
        if (s.id === subId) {
          return { ...s, status: 'active' }
        }
        return s
      }))
    } catch (err: any) {
      setMessage({ text: err.message || 'Failed to resume subscription', type: 'error' })
    }
  }

  const openOverrideEditor = (sub: Subscription) => {
    setEditingSubId(sub.id)
    setUserLimitInput(sub.overrideUserLimit !== null ? String(sub.overrideUserLimit) : '')
    setLeadLimitInput(sub.overrideLeadLimit !== null ? String(sub.overrideLeadLimit) : '')
    setIsCustomInput(sub.isCustom)
    setIsCustomPlanInput(sub.Plan?.name === 'Custom')
  }

  return (
    <div className="space-y-8">
      {/* STATUS NOTIFICATIONS */}
      {message && (
        <div className={`p-4 rounded-md border text-xs flex items-center gap-3 ${
          message.type === 'success' 
            ? 'bg-[#4EC9B0]/10 border-[#4EC9B0]/20 text-[#4EC9B0]' 
            : 'bg-[#E5484D]/10 border-[#E5484D]/20 text-[#E5484D]'
        }`}>
          {message.type === 'success' ? <Check className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
          <span>{message.text}</span>
        </div>
      )}

      {/* PENDING PAYMENTS SECTION */}
      <div className="neo-raised-lg p-6 bg-[#1E1E1E]">
        <h3 className="text-lg font-bold text-white mb-4 font-display flex items-center gap-2">
          <Shield className="w-5 h-5 text-[#CE9178]" />
          <span>Pending Payment Verification Queue</span>
        </h3>

        {pendingPayments.length === 0 ? (
          <div className="text-center p-8 rounded-md bg-[#252526] border border-dashed border-[#3E3E42]">
            <p className="text-xs text-[#858585]">No pending payment references to review.</p>
          </div>
        ) : (
          <div className="divide-y divide-[#3E3E42]">
            {pendingPayments.map(p => (
              <div key={p.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white">{p.Company?.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#CE9178]/10 text-[#CE9178] uppercase border border-[#CE9178]/20">
                      {p.Plan?.name}
                    </span>
                  </div>
                  <div className="text-xs text-[#CCCCCC] space-y-0.5">
                    <div>Method: <span className="font-semibold text-white">{p.method}</span></div>
                    <div>Transaction ID: <span className="font-mono text-white select-all">{p.transactionNumber}</span></div>
                    <div>Amount: <span className="font-semibold text-[#CE9178]">${p.amountUsd}</span></div>
                    <div className="text-[10px] text-[#858585]">Submitted: {new Date(p.createdAt).toLocaleString()}</div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  {showRejectFormId === p.id ? (
                    <div className="flex flex-col gap-2 w-full max-w-[280px]">
                      <input
                        type="text"
                        placeholder="Rejection reason notes..."
                        value={rejectionReasons[p.id] || ''}
                        onChange={(e) => setRejectionReasons({ ...rejectionReasons, [p.id]: e.target.value })}
                        className="p-2 rounded bg-[#252526] border border-[#3E3E42] text-xs text-white placeholder-[rgba(255,255,255,0.3)] w-full"
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => setShowRejectFormId(null)}
                          className="px-2.5 py-1.5 rounded bg-[#252526] text-[#858585] text-xs font-bold border border-[#3E3E42] hover:text-white"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleReject(p.id)}
                          disabled={actioningPaymentId === p.id}
                          className="px-3 py-1.5 rounded bg-[#E5484D] text-white text-xs font-bold hover:bg-[#c93237] flex items-center gap-1"
                        >
                          {actioningPaymentId === p.id ? <Loader2 className="w-3 h-3 animate-spin" /> : <X className="w-3 h-3" />}
                          Confirm Rejection
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowRejectFormId(p.id)}
                        className="px-3 py-1.5 rounded bg-[#252526] text-[#E5484D] border border-[#E5484D]/30 text-xs font-bold hover:bg-[#E5484D]/10 flex items-center gap-1.5"
                      >
                        <X className="w-3.5 h-3.5" />
                        Reject
                      </button>
                      <button
                        onClick={() => handleConfirm(p.id)}
                        disabled={actioningPaymentId === p.id}
                        className="px-3 py-1.5 rounded bg-[#CE9178] text-[#1E1E1E] text-xs font-bold hover:bg-[#b07b0b] flex items-center gap-1.5"
                      >
                        {actioningPaymentId === p.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                        Verify &amp; Confirm
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SUBSCRIPTION DIRECTORY SECTION */}
      <div className="neo-raised-lg p-6 bg-[#1E1E1E]">
        <h3 className="text-lg font-bold text-white mb-6 font-display flex items-center gap-2">
          <Settings className="w-5 h-5 text-[#CE9178]" />
          <span>Tenant Subscriptions Directory</span>
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#3E3E42] text-[#858585] font-mono">
                <th className="pb-3 font-semibold">Company Name</th>
                <th className="pb-3 font-semibold">Plan</th>
                <th className="pb-3 font-semibold">Period End</th>
                <th className="pb-3 font-semibold">User Limit</th>
                <th className="pb-3 font-semibold">Lead Limit</th>
                <th className="pb-3 font-semibold">Status</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3E3E42]">
              {subscriptions.map(s => {
                const isEditing = editingSubId === s.id
                return (
                  <tr key={s.id} className="text-[#CCCCCC] group hover:bg-[#252526]/50">
                    <td className="py-4 font-bold text-white">{s.Company?.name}</td>
                    <td className="py-4">
                      <span className="font-semibold">{s.Plan?.name}</span>
                      {s.isCustom && (
                        <span className="text-[9px] text-[#CE9178] font-bold px-1.5 py-0.5 rounded bg-[#CE9178]/10 ml-2">Custom</span>
                      )}
                    </td>
                    <td className="py-4">
                      {s.currentPeriodEnd 
                        ? new Date(s.currentPeriodEnd).toLocaleDateString()
                        : 'Never'
                      }
                    </td>
                    
                    {/* User Limit Column */}
                    <td className="py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={userLimitInput}
                          onChange={(e) => setUserLimitInput(e.target.value)}
                          placeholder="Plan default"
                          className="w-16 p-1 rounded bg-[#252526] border border-[#3E3E42] text-xs text-white"
                        />
                      ) : (
                        <span>
                          {s.overrideUserLimit === -1 ? 'Unlimited' : (s.overrideUserLimit ?? s.Plan?.userLimit ?? 'N/A')}
                          {s.overrideUserLimit !== null && <span className="text-[#CE9178] font-bold text-[9px] ml-1">*</span>}
                        </span>
                      )}
                    </td>

                    {/* Lead Limit Column */}
                    <td className="py-4">
                      {isEditing ? (
                        <input
                          type="text"
                          value={leadLimitInput}
                          onChange={(e) => setLeadLimitInput(e.target.value)}
                          placeholder="Plan default"
                          className="w-16 p-1 rounded bg-[#252526] border border-[#3E3E42] text-xs text-white"
                        />
                      ) : (
                        <span>
                          {s.overrideLeadLimit === -1 ? 'Unlimited' : (s.overrideLeadLimit ?? s.Plan?.leadLimitPerMonth ?? 'Unlimited')}
                          {s.overrideLeadLimit !== null && <span className="text-[#CE9178] font-bold text-[9px] ml-1">*</span>}
                        </span>
                      )}
                    </td>

                    <td className="py-4">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                        s.status === 'active' ? 'text-[#4EC9B0] border-[#4EC9B0]/20 bg-[#4EC9B0]/10' :
                        s.status === 'suspended' ? 'text-[#E5484D] border-[#E5484D]/20 bg-[#E5484D]/10' :
                        'text-[#CE9178] border-[#CE9178]/20 bg-[#CE9178]/10'
                      }`}>
                        {s.status}
                      </span>
                    </td>

                    <td className="py-4 text-right">
                      {isEditing ? (
                        <div className="space-y-2 flex flex-col items-end">
                          <label className="flex items-center gap-1.5 text-[10px] text-[#CCCCCC]">
                            <input
                              type="checkbox"
                              checked={isCustomInput}
                              onChange={(e) => setIsCustomInput(e.target.checked)}
                              className="rounded border-[#3E3E42] bg-[#252526]"
                            />
                            Hide Upgrades (Custom Flag)
                          </label>
                          <label className="flex items-center gap-1.5 text-[10px] text-[#CCCCCC]">
                            <input
                              type="checkbox"
                              checked={isCustomPlanInput}
                              onChange={(e) => setIsCustomPlanInput(e.target.checked)}
                              className="rounded border-[#3E3E42] bg-[#252526]"
                            />
                            Plan: Custom Plan Row
                          </label>
                          <div className="flex gap-1">
                            <button
                              onClick={() => setEditingSubId(null)}
                              className="px-2 py-1 rounded bg-[#252526] border border-[#3E3E42] text-[10px] font-bold text-[#858585] hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleSaveOverride(s)}
                              className="px-2 py-1 rounded bg-[#CE9178] text-[#1E1E1E] text-[10px] font-bold hover:bg-[#b07b0b]"
                            >
                              Save Overrides
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={() => openOverrideEditor(s)}
                            className="p-1.5 rounded bg-[#252526] border border-[#3E3E42] hover:border-[#555555] text-white flex items-center gap-1 text-[10px] font-semibold"
                            title="Edit subscription limits &amp; flags"
                          >
                            <Sliders className="w-3 h-3 text-[#CE9178]" />
                            Limits
                          </button>
                          {s.status === 'suspended' ? (
                            <button
                              onClick={() => handleResume(s.id)}
                              className="p-1.5 rounded bg-[#4EC9B0]/10 border border-[#4EC9B0]/20 text-[#4EC9B0] hover:bg-[#4EC9B0]/20 flex items-center gap-1 text-[10px] font-semibold"
                            >
                              <Play className="w-3 h-3" />
                              Resume
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSuspend(s.id)}
                              className="p-1.5 rounded bg-[#E5484D]/10 border border-[#E5484D]/20 text-[#E5484D] hover:bg-[#E5484D]/20 flex items-center gap-1 text-[10px] font-semibold"
                            >
                              <Ban className="w-3 h-3" />
                              Suspend
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
