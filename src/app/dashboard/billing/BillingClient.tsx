'use client'

import { useState } from 'react'
import { submitPayment } from '@/app/actions/billing'
import { 
  CreditCard, 
  Check, 
  AlertCircle, 
  HelpCircle, 
  ArrowRight, 
  Loader2, 
  Building,
  Smartphone,
  Info
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

type Payment = {
  id: string
  amountUsd: number
  includesSetupFee: boolean
  method: string
  transactionNumber: string
  status: string
  createdAt: string
  reviewNotes: string | null
  Plan: Plan
}

type Branch = {
  id: string
  name: string
  isDefault: boolean
}

type PaymentMethod = {
  id: string
  method: string
  number: string
  accountType: string | null
  instructions: string | null
}

type BillingProps = {
  initialData: {
    subscription: any
    branches: Branch[]
    payments: Payment[]
    plans: Plan[]
    paymentMethods: PaymentMethod[]
  }
}

export default function BillingClient({ initialData }: BillingProps) {
  const { subscription, branches, payments: initialPayments, plans, paymentMethods } = initialData
  const [payments, setPayments] = useState<Payment[]>(initialPayments)

  // Billing cycle toggle
  const [cycle, setCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  
  // Payment step states
  const [activeMethodId, setActiveMethodId] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const activeMethod = paymentMethods.find(m => m.id === activeMethodId)
  const selectedPlan = plans.find(p => p.id === selectedPlanId)

  // Filter plans based on cycle toggle
  const filteredPlans = plans.filter(p => {
    if (cycle === 'monthly') return p.billingCycle === 'monthly'
    return p.billingCycle === 'yearly'
  })

  // Calculate setup fee and total
  const getPlanTotal = (plan: Plan) => {
    const price = Number(plan.priceUsd)
    const setupFee = plan.billingCycle === 'monthly' ? Number(plan.setupFeeUsd) : 0
    return price + setupFee
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedPlanId || !activeMethod || !transactionId.trim()) {
      setError('Please select a plan, payment method, and enter transaction ID')
      return
    }

    setIsSubmitting(true)
    setError('')
    setSuccess('')

    try {
      const res = await submitPayment(selectedPlanId, activeMethod.method, transactionId)
      if (res.success) {
        setSuccess('Your payment reference was submitted successfully and is pending review.')
        setTransactionId('')
        setActiveMethodId(null)
        setSelectedPlanId(null)
        // Prepend new payment to local state list
        if (res.payment) {
          const newPayment: Payment = {
            ...res.payment,
            Plan: selectedPlan!
          } as any
          setPayments([newPayment, ...payments])
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment transaction')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-[#4EC9B0] bg-[#4EC9B0]/10 border-[#4EC9B0]/20'
      case 'grace': return 'text-[#CE9178] bg-[#CE9178]/10 border-[#CE9178]/20'
      case 'suspended': return 'text-[#E5484D] bg-[#E5484D]/10 border-[#E5484D]/20'
      case 'canceled': return 'text-[#858585] bg-[#858585]/10 border-[#858585]/20'
      default: return 'text-[#CCCCCC] bg-[#252526] border-[#3E3E42]'
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'text-[#4EC9B0] bg-[#4EC9B0]/10 border-[#4EC9B0]/20'
      case 'rejected': return 'text-[#E5484D] bg-[#E5484D]/10 border-[#E5484D]/20'
      default: return 'text-[#CE9178] bg-[#CE9178]/10 border-[#CE9178]/20'
    }
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* LEFT COLUMN: Current Plan & History */}
      <div className="lg:col-span-2 space-y-8">
        
        {/* CURRENT SUBSCRIPTION BOX */}
        <div className="neo-raised-lg p-6 bg-[#1E1E1E]">
          <div className="flex justify-between items-start mb-6">
            <div>
              <span className="text-[10px] font-bold font-mono text-[#CE9178] tracking-widest block mb-1">CURRENT PLAN</span>
              <h3 className="text-xl font-bold text-white font-display">
                {subscription?.effectivePlanName ?? subscription?.plan?.name ?? 'Free'}
              </h3>
            </div>
            {subscription && (
              <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase border ${getStatusColor(subscription.status)}`}>
                {subscription.status}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-[#3E3E42]">
            <div>
              <span className="text-[10px] text-[#858585] block uppercase font-mono">Billing Cycle</span>
              <span className="text-sm font-semibold text-white mt-1 block capitalize">
                {subscription?.plan?.billingCycle === 'free'
                  ? 'Always Free'
                  : subscription?.plan?.billingCycle === 'monthly'
                  ? 'Monthly'
                  : subscription?.plan?.billingCycle === 'yearly'
                  ? 'Yearly'
                  : (subscription?.plan?.billingCycle ?? 'None')}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#858585] block uppercase font-mono">Renews / Expires</span>
              <span className="text-sm font-semibold text-white mt-1 block">
                {subscription?.currentPeriodEnd 
                  ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                  : 'Never'
                }
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#858585] block uppercase font-mono">Active Branch</span>
              <span className="text-sm font-semibold text-white mt-1 block flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-[#CE9178]" />
                {branches.find(b => b.isDefault)?.name ?? 'Main Branch'}
              </span>
            </div>
          </div>

          {/* Limits display */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 pt-6 border-t border-[#3E3E42]">
            <div className="p-4 rounded-md bg-[#252526] border border-[#3E3E42]">
              <span className="text-[10px] text-[#858585] uppercase font-mono block">User Seat Limit</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-white">
                  {subscription?.overrideUserLimit === -1 ? 'Unlimited' : (subscription?.overrideUserLimit ?? subscription?.plan?.userLimit ?? 'N/A')}
                </span>
                {subscription?.overrideUserLimit && (
                  <span className="text-[9px] text-[#CE9178] font-bold px-1.5 py-0.5 rounded bg-[#CE9178]/10">Override</span>
                )}
              </div>
              <span className="text-[10px] text-[#858585] mt-1 block">Includes managers & counselors.</span>
            </div>

            <div className="p-4 rounded-md bg-[#252526] border border-[#3E3E42]">
              <span className="text-[10px] text-[#858585] uppercase font-mono block">Monthly Lead Limit</span>
              <div className="flex items-baseline gap-2 mt-2">
                <span className="text-2xl font-bold text-white">
                  {subscription?.overrideLeadLimit === -1 ? 'Unlimited' : (subscription?.overrideLeadLimit ?? subscription?.plan?.leadLimitPerMonth ?? 'Unlimited')}
                </span>
                {subscription?.overrideLeadLimit && (
                  <span className="text-[9px] text-[#CE9178] font-bold px-1.5 py-0.5 rounded bg-[#CE9178]/10">Override</span>
                )}
              </div>
              <span className="text-[10px] text-[#858585] mt-1 block">Resets on the first of each month.</span>
            </div>
          </div>
        </div>

        {/* RECONCILIATION PAYMENT HISTORY */}
        <div className="neo-raised-lg p-6 bg-[#1E1E1E]">
          <h3 className="text-lg font-bold text-white mb-4 font-display">Payment Reconciliation History</h3>
          
          {payments.length === 0 ? (
            <div className="text-center p-8 rounded-md bg-[#252526] border border-dashed border-[#3E3E42]">
              <Info className="w-8 h-8 text-[#858585] mx-auto mb-2" />
              <p className="text-xs text-[#858585]">No payment transactions submitted yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-[#3E3E42] text-[#858585] font-mono">
                    <th className="pb-3 font-semibold">Plan Paid For</th>
                    <th className="pb-3 font-semibold">Method</th>
                    <th className="pb-3 font-semibold">Transaction ID</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Date</th>
                    <th className="pb-3 font-semibold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#3E3E42]">
                  {payments.map(p => (
                    <tr key={p.id} className="text-[#CCCCCC] group hover:bg-[#252526]/50">
                      <td className="py-3.5 font-semibold text-white">
                        {p.Plan?.name ?? 'Plan'}
                      </td>
                      <td className="py-3.5">{p.method}</td>
                      <td className="py-3.5 font-mono">{p.transactionNumber}</td>
                      <td className="py-3.5 font-semibold">${p.amountUsd}</td>
                      <td className="py-3.5">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 text-right">
                        <div className="flex flex-col items-end gap-1">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${getPaymentStatusColor(p.status)}`}>
                            {p.status}
                          </span>
                          {p.reviewNotes && (
                            <span className="text-[10px] text-[#E5484D] block mt-1 max-w-[150px] text-right font-medium">
                              Note: {p.reviewNotes}
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT COLUMN: Upgrade Panel */}
      <div className="space-y-8">
        
        {/* PLAN UPGRADE CARD */}
        <div className="neo-raised-lg p-6 bg-[#1E1E1E] flex flex-col">
          <span className="text-[10px] font-bold font-mono text-[#CE9178] tracking-widest block mb-1">UPGRADE</span>
          <h3 className="text-xl font-bold text-white mb-6 font-display">Upgrade Subscription</h3>

          {/* Toggle Cycle */}
          <div className="flex bg-[#252526] rounded-md p-1 border border-[#3E3E42] mb-6">
            <button
              onClick={() => {
                setCycle('monthly')
                setSelectedPlanId(null)
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded ${
                cycle === 'monthly' ? 'bg-[#CE9178] text-[#1E1E1E]' : 'text-[#858585] hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => {
                setCycle('yearly')
                setSelectedPlanId(null)
              }}
              className={`flex-1 py-2 text-xs font-semibold rounded ${
                cycle === 'yearly' ? 'bg-[#CE9178] text-[#1E1E1E]' : 'text-[#858585] hover:text-white'
              }`}
            >
              Yearly
            </button>
          </div>

          {/* Plan Options */}
          <div className="space-y-3 mb-6">
            {filteredPlans.map(p => (
              <div
                key={p.id}
                onClick={() => {
                  setSelectedPlanId(p.id)
                  setActiveMethodId(null)
                  setTransactionId('')
                }}
                className={`p-4 rounded-md border cursor-pointer transition-all ${
                  selectedPlanId === p.id 
                    ? 'border-[#CE9178] bg-[#CE9178]/5' 
                    : 'border-[#3E3E42] bg-[#252526] hover:border-[#555555]'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-bold text-white text-sm">{p.name}</h4>
                    <span className="text-[10px] text-[#858585] font-mono mt-0.5 block">
                      Seats limit: {p.userLimit ?? 'Unlimited'}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-base font-bold text-[#CE9178]">${p.priceUsd}</span>
                    <span className="text-[10px] text-[#858585] font-mono block">
                      /{p.billingCycle === 'yearly' ? 'yr' : 'mo'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout Steps */}
          {selectedPlan && (
            <div className="border-t border-[#3E3E42] pt-6 space-y-6">
              <div>
                <h4 className="text-xs font-bold text-white mb-2 uppercase font-mono tracking-wider">Due Amount</h4>
                <div className="p-3 bg-[#252526] rounded-md border border-[#3E3E42] space-y-1.5 text-xs text-[#CCCCCC]">
                  <div className="flex justify-between">
                    <span>Plan Price</span>
                    <span className="text-white">${selectedPlan.priceUsd}</span>
                  </div>
                  {cycle === 'monthly' && (
                    <div className="flex justify-between">
                      <span>Setup Fee</span>
                      <span className="text-white">${selectedPlan.setupFeeUsd}</span>
                    </div>
                  )}
                  {cycle === 'yearly' && (
                    <div className="flex justify-between text-[#4EC9B0]">
                      <span>Setup Fee</span>
                      <span>Waived</span>
                    </div>
                  )}
                  <div className="h-[1px] bg-[#3E3E42] my-1.5"></div>
                  <div className="flex justify-between font-bold text-sm text-[#CE9178]">
                    <span>Total Due</span>
                    <span>${getPlanTotal(selectedPlan)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method Select */}
              <div>
                <h4 className="text-xs font-bold text-white mb-3 uppercase font-mono tracking-wider">Select payment method</h4>
                <div className="grid grid-cols-3 gap-2">
                  {paymentMethods.map(m => (
                    <button
                      key={m.id}
                      onClick={() => {
                        setActiveMethodId(m.id)
                        setTransactionId('')
                      }}
                      className={`py-3 text-xs font-bold rounded-md border transition-all ${
                        activeMethodId === m.id
                          ? 'border-[#CE9178] bg-[#CE9178]/5 text-white'
                          : 'border-[#3E3E42] bg-[#252526] text-[#CCCCCC] hover:border-[#555555]'
                      }`}
                    >
                      {m.method}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction ID & Submission */}
              {activeMethod && (
                <form onSubmit={handlePaymentSubmit} className="space-y-4">
                  <div className="p-4 bg-[#252526] rounded-md border border-[#CE9178]/20 text-xs space-y-2">
                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Smartphone className="w-3.5 h-3.5 text-[#CE9178]" />
                      <span>Send money to {activeMethod.method}</span>
                    </div>
                    <div className="flex justify-between items-center bg-[#1E1E1E] p-2 rounded border border-[#3E3E42]">
                      <span className="font-mono text-sm font-bold text-white select-all">{activeMethod.number}</span>
                      <span className="text-[10px] text-[#CE9178] font-bold px-1.5 py-0.5 rounded bg-[#CE9178]/10">
                        {activeMethod.accountType ?? 'Personal'}
                      </span>
                    </div>
                    {activeMethod.instructions && (
                      <p className="text-[10px] text-[#858585] leading-relaxed pt-1">
                        Instructions: {activeMethod.instructions}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="transactionId" className="block text-xs font-bold text-[#CCCCCC] mb-2">
                      Transaction ID / Number
                    </label>
                    <input
                      type="text"
                      id="transactionId"
                      placeholder="E.g. TRX82910398"
                      required
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full p-3 rounded-md bg-[#252526] border border-[#3E3E42] text-sm text-white focus:outline-none focus:border-[#CE9178] transition-all"
                    />
                  </div>

                  {error && (
                    <div className="p-3 bg-[#E5484D]/10 border border-[#E5484D]/20 text-xs text-[#E5484D] rounded-md flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {success && (
                    <div className="p-3 bg-[#4EC9B0]/10 border border-[#4EC9B0]/20 text-xs text-[#4EC9B0] rounded-md flex items-center gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{success}</span>
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3.5 rounded-md font-bold text-xs text-[#1E1E1E] bg-[#CE9178] hover:bg-[#b07b0b] active:translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Payment Reference</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
