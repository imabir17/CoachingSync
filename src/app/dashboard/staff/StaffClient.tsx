'use client'

import { useState } from 'react'
import { createStaff, updateStaff, deleteStaff, deactivateStaff, reactivateStaff, revokeInvite } from '@/app/actions/staff'
import { bulkTransferLeads } from '@/app/actions/leads'
import { Plus, Edit2, Trash2, X, Copy, Check, AlertTriangle, UserMinus, UserPlus, Link2 } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

export default function StaffClient({ 
  initialUsers, 
  initialInvites = [], 
  currentUserId,
  currentUserRole 
}: { 
  initialUsers: any[]
  initialInvites: any[]
  currentUserId: string
  currentUserRole: string
}) {
  const [users, setUsers] = useState(initialUsers)
  const [invites, setInvites] = useState(initialInvites)
  const [activeTab, setActiveTab] = useState<'staff' | 'invites'>('staff')

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState({ fullName: '', email: '', role: 'Counselor' })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Invite Link Display Modal
  const [showInviteLinkModal, setShowInviteLinkModal] = useState(false)
  const [generatedInviteLink, setGeneratedInviteLink] = useState('')
  const [copiedLink, setCopiedLink] = useState(false)

  // Reassignment & Deactivation state
  const [isReassignModalOpen, setIsReassignModalOpen] = useState(false)
  const [deactivatingId, setDeactivatingId] = useState<string>('')
  const [assignedLeadsCount, setAssignedLeadsCount] = useState(0)
  const [targetCounselorId, setTargetCounselorId] = useState('')
  const [isReassigning, setIsReassigning] = useState(false)

  // Copy status per invite ID
  const [copiedInviteId, setCopiedInviteId] = useState<string | null>(null)

  const openModal = (user?: any) => {
    setError('')
    if (user) {
      setEditingUser(user)
      setFormData({ fullName: user.fullName, email: user.email, role: user.role })
    } else {
      setEditingUser(null)
      setFormData({ fullName: '', email: '', role: 'Counselor' })
    }
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingUser(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    const data = new FormData()
    data.append('fullName', formData.fullName)
    data.append('email', formData.email)
    data.append('role', formData.role)

    if (editingUser) {
      const res = await updateStaff(editingUser.id, data)
      if (res.error) {
        setError(res.error)
        setIsLoading(false)
      } else {
        window.location.reload()
      }
    } else {
      const res = await createStaff(data)
      if (res.error) {
        setError(res.error)
        setIsLoading(false)
      } else {
        if (res.inviteLink) {
          // Invite created! Show invite link to Super Admin
          setGeneratedInviteLink(res.inviteLink)
          setShowInviteLinkModal(true)
          setIsModalOpen(false)
          // Refresh invites in list
          const supabase = createClient()
          const { data: newInvites } = await supabase
            .from('Invite')
            .select('*')
            .eq('status', 'Pending')
            .order('createdAt', { ascending: false })
          if (newInvites) setInvites(newInvites)
        } else {
          window.location.reload()
        }
        setIsLoading(false)
      }
    }
  }

  const handleCopyInviteLink = (link: string, id?: string) => {
    navigator.clipboard.writeText(link)
    if (id) {
      setCopiedInviteId(id)
      setTimeout(() => setCopiedInviteId(null), 2000)
    } else {
      setCopiedLink(true)
      setTimeout(() => setCopiedLink(false), 2000)
    }
  }

  const handleRevokeInvite = async (id: string) => {
    if (!confirm('Are you sure you want to revoke this invitation?')) return
    const res = await revokeInvite(id)
    if (res.error) {
      alert(res.error)
    } else {
      setInvites(invites.filter(inv => inv.id !== id))
    }
  }

  const handleDeactivateClick = async (userId: string) => {
    const supabase = createClient()
    
    // Check if user has assigned leads
    setIsLoading(true)
    const { count, error: countError } = await supabase
      .from('Lead')
      .select('id', { count: 'exact', head: true })
      .eq('assignedCounselorId', userId)

    setIsLoading(false)

    if (countError) {
      alert('Error verifying user leads: ' + countError.message)
      return
    }

    const leadsCount = count || 0
    if (leadsCount > 0) {
      // Open reassign modal
      setDeactivatingId(userId)
      setAssignedLeadsCount(leadsCount)
      setTargetCounselorId('')
      setIsReassignModalOpen(true)
    } else {
      if (confirm('Are you sure you want to deactivate this staff member? They will lose access to the system immediately.')) {
        setIsLoading(true)
        const res = await deactivateStaff(userId)
        setIsLoading(false)
        if (res.error) {
          alert(res.error)
        } else {
          window.location.reload()
        }
      }
    }
  }

  const handleReassignAndDeactivate = async () => {
    if (!targetCounselorId) {
      alert('Please select a counselor to reassign leads.')
      return
    }

    setIsReassigning(true)
    try {
      const supabase = createClient()
      
      // Fetch all lead IDs assigned to the deactivating counselor
      const { data: leads } = await supabase
        .from('Lead')
        .select('id')
        .eq('assignedCounselorId', deactivatingId)

      if (leads && leads.length > 0) {
        const leadIds = leads.map(l => l.id)
        await bulkTransferLeads(leadIds, targetCounselorId)
      }

      const res = await deactivateStaff(deactivatingId)
      if (res.error) {
        alert(res.error)
      } else {
        window.location.reload()
      }
    } catch (err: any) {
      alert('Reassignment failed: ' + err.message)
    } finally {
      setIsReassigning(false)
      setIsReassignModalOpen(false)
    }
  }

  const handleReactivate = async (userId: string) => {
    if (!confirm('Reactivate this staff member? They will be allowed to log back in.')) return
    setIsLoading(true)
    const res = await reactivateStaff(userId)
    setIsLoading(false)
    if (res.error) {
      alert(res.error)
    } else {
      window.location.reload()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this user profile and their auth records? This action is irreversible.')) return
    setIsLoading(true)
    const res = await deleteStaff(id)
    setIsLoading(false)
    if (res.error) {
      alert(res.error)
    } else {
      window.location.reload()
    }
  }

  const inputClass = "w-full bg-[#1E1E1E] border border-[#3E3E42] rounded-sm py-2.5 px-3 text-xs font-semibold text-[#D4D4D4] placeholder-[#858585] focus:outline-none transition-all"
  const selectClass = "w-full bg-[#1E1E1E] border border-[#3E3E42] text-xs font-bold text-[#CCCCCC] rounded-sm py-2.5 px-3 outline-none focus:border border-[#3E3E42] transition-all cursor-pointer"

  return (
    <>
      <div className="space-y-8 pb-12">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#D4D4D4] font-display">Staff Management</h2>
            <p className="text-xs text-[#CCCCCC]">Manage staff accounts, invitations, permissions, and roles.</p>
          </div>
          <button 
            onClick={() => openModal()} 
            className="flex items-center gap-1.5 px-5 py-3 bg-gradient-to-br from-[#007ACC] to-[#0062A3] text-white text-xs font-bold rounded-sm border border-[#3E3E42] hover:border-[#555555] active:translate-y-0.5 transition-all duration-150 self-start sm:self-auto"
          >
            <Plus className="h-4.5 w-4.5" /> Invite Staff
          </button>
        </div>

        {/* Tab Controls */}
        <div className="flex border-b border-[#3E3E42] gap-6 text-sm font-semibold">
          <button 
            onClick={() => setActiveTab('staff')}
            className={`pb-3 relative transition-all ${activeTab === 'staff' ? 'text-white' : 'text-[#858585] hover:text-[#CCCCCC]'}`}
          >
            Active & Deactivated Staff ({users.length})
            {activeTab === 'staff' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#007ACC]" />}
          </button>
          <button 
            onClick={() => setActiveTab('invites')}
            className={`pb-3 relative transition-all ${activeTab === 'invites' ? 'text-white' : 'text-[#858585] hover:text-[#CCCCCC]'}`}
          >
            Pending Invites ({invites.length})
            {activeTab === 'invites' && <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#007ACC]" />}
          </button>
        </div>

        {activeTab === 'staff' ? (
          <div className="neo-raised overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#111317]/20">
                <thead className="bg-[#252526]">
                  <tr className="text-[#CCCCCC] text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4 text-left">Name</th>
                    <th className="px-6 py-4 text-left">Email</th>
                    <th className="px-6 py-4 text-left">Role</th>
                    <th className="px-6 py-4 text-left">Status</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111317]/20 bg-[#1E1E1E]">
                  {users.map((user) => (
                    <tr key={user.id} className="hover:bg-[#252526]/25 transition-colors group">
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-[#D4D4D4]">{user.fullName}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-[#CCCCCC]">{user.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold">
                        <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-bold leading-5 rounded-full border ${
                          user.role === 'Super Admin' 
                            ? 'bg-red-500/10 text-red-600 border-red-500/20' 
                            : user.role === 'Manager' 
                              ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' 
                              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold">
                        <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-bold leading-5 rounded-full border ${
                          user.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold space-x-2">
                        {currentUserRole === 'Super Admin' && (
                          <button 
                            onClick={() => openModal(user)} 
                            className="inline-flex p-2 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-[#007ACC] hover:border-[#555555] transition-all"
                            title="Edit staff details"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                        {user.id !== currentUserId && (
                          <>
                            {user.status === 'Active' ? (
                              <button 
                                onClick={() => handleDeactivateClick(user.id)} 
                                className="inline-flex p-2 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-yellow-500 hover:border-[#555555] transition-all"
                                title="Deactivate account"
                              >
                                <UserMinus className="h-3.5 w-3.5" />
                              </button>
                            ) : (
                              <button 
                                onClick={() => handleReactivate(user.id)} 
                                className="inline-flex p-2 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-emerald-500 hover:border-[#555555] transition-all"
                                title="Reactivate account"
                              >
                                <UserPlus className="h-3.5 w-3.5" />
                              </button>
                            )}
                          </>
                        )}
                        {currentUserRole === 'Super Admin' && user.id !== currentUserId && (
                          <button 
                            onClick={() => handleDelete(user.id)} 
                            className="inline-flex p-2 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-red-500 hover:border-[#555555] transition-all"
                            title="Permanently Delete account"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-xs text-[#858585]">
                        No staff members found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="neo-raised overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#111317]/20">
                <thead className="bg-[#252526]">
                  <tr className="text-[#CCCCCC] text-[10px] font-bold uppercase tracking-wider">
                    <th className="px-6 py-4 text-left">Email</th>
                    <th className="px-6 py-4 text-left">Role</th>
                    <th className="px-6 py-4 text-left">Expires At</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#111317]/20 bg-[#1E1E1E]">
                  {invites.map((invite) => {
                    const inviteLink = typeof window !== 'undefined' 
                      ? `${window.location.origin}/invite/accept?token=${invite.token}` 
                      : ''

                    return (
                      <tr key={invite.id} className="hover:bg-[#252526]/25 transition-colors group">
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold text-[#D4D4D4]">{invite.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-semibold">
                          <span className={`px-2.5 py-0.5 inline-flex text-[10px] font-bold leading-5 rounded-full border ${
                            invite.role === 'Manager' 
                              ? 'bg-blue-500/10 text-blue-600 border-blue-500/20' 
                              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
                          }`}>
                            {invite.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-xs font-medium text-[#858585]">
                          {new Date(invite.expiresAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs font-bold space-x-2">
                          <button 
                            onClick={() => handleCopyInviteLink(inviteLink, invite.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-[#CCCCCC] hover:border-[#555555] transition-all"
                            title="Copy invitation link"
                          >
                            {copiedInviteId === invite.id ? (
                              <>
                                <Check className="h-3 w-3 text-emerald-500" />
                                <span className="text-[10px]">Copied</span>
                              </>
                            ) : (
                              <>
                                <Copy className="h-3 w-3" />
                                <span className="text-[10px]">Copy Link</span>
                              </>
                            )}
                          </button>
                          <button 
                            onClick={() => handleRevokeInvite(invite.id)} 
                            className="inline-flex p-2 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-red-500 hover:border-[#555555] transition-all"
                            title="Revoke invitation"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                  {invites.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-10 text-center text-xs text-[#858585]">
                        No pending invitations.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Staff Editor / Invite Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="neo-raised-lg max-w-md w-full p-8 bg-[#1E1E1E] border border-[#3E3E42] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-base font-bold text-[#D4D4D4]">
                {editingUser ? 'Edit Staff Details' : 'Invite New Staff Member'}
              </h3>
              <button 
                onClick={closeModal} 
                className="p-1.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] hover:border-[#555555] text-[#CCCCCC] transition-all"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs font-bold rounded-sm shadow-sm">
                {error}
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {editingUser ? (
                <div>
                  <label className="block text-xs font-bold text-[#CCCCCC] mb-2">Full Name</label>
                  <input required type="text" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} className={inputClass} placeholder="E.g. Tanvir Ahmed" />
                </div>
              ) : (
                <div className="p-3 bg-blue-500/5 border border-blue-500/10 rounded-sm text-[11px] text-[#CCCCCC] mb-2">
                  Invited staff will receive a link to set up their account and password.
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-[#CCCCCC] mb-2">Email Address</label>
                <input required type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className={inputClass} placeholder="tanvir@agency.com" />
              </div>
              
              <div>
                <label className="block text-xs font-bold text-[#CCCCCC] mb-2">Role</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className={selectClass}>
                  <option value="Counselor">Counselor</option>
                  <option value="Manager">Manager</option>
                  {/* Super Admin can only edit or be set if authorized */}
                  {currentUserRole === 'Super Admin' && (
                    <option value="Super Admin">Super Admin</option>
                  )}
                </select>
              </div>
              
              <div className="pt-4 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="px-5 py-2.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-xs font-bold text-[#CCCCCC] hover:border-[#555555] transition-all"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading} 
                  className="px-5 py-2.5 rounded-sm bg-gradient-to-br from-[#007ACC] to-[#0062A3] text-white text-xs font-bold border border-[#3E3E42] hover:border-[#555555] disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {isLoading ? 'Processing...' : editingUser ? 'Save' : 'Send Invite'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generated Invite Link Display Modal */}
      {showInviteLinkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="neo-raised-lg max-w-md w-full p-8 bg-[#1E1E1E] border border-[#3E3E42] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className="w-12 h-12 rounded-full bg-[#4EC9B0]/10 border border-[#4EC9B0]/20 flex items-center justify-center mx-auto mb-4">
              <Link2 className="w-6 h-6 text-[#4EC9B0]" />
            </div>
            <h3 className="text-lg font-bold text-white mb-2">Invitation Created</h3>
            <p className="text-xs text-[#CCCCCC] mb-6">
              The invitation token is generated. You can copy the activation link below to share it with the team member.
            </p>

            <div className="p-3 bg-[#252526] border border-[#3E3E42] rounded-sm text-xs font-mono text-[#D4D4D4] break-all select-all text-left mb-6">
              {generatedInviteLink}
            </div>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => handleCopyInviteLink(generatedInviteLink)}
                className="flex items-center gap-1.5 px-5 py-2.5 bg-gradient-to-br from-[#007ACC] to-[#0062A3] text-white text-xs font-bold rounded-sm border border-[#3E3E42] hover:border-[#555555] active:translate-y-0.5 transition-all"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
              <button
                onClick={() => setShowInviteLinkModal(false)}
                className="px-5 py-2.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-xs font-bold text-[#CCCCCC] hover:border-[#555555] transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deactivate & Reassign Leads Modal */}
      {isReassignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="neo-raised-lg max-w-md w-full p-8 bg-[#1E1E1E] border border-[#3E3E42] rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5 mb-6">
              <div className="w-10 h-10 shrink-0 rounded-full bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-yellow-500" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Reassign Leads & Deactivate</h3>
                <p className="text-xs text-[#CCCCCC] mt-1">
                  This counselor is currently assigned to <strong className="text-white">{assignedLeadsCount}</strong> active leads. Reassign their leads to another counselor before deactivating.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#CCCCCC] mb-2">Reassign leads to:</label>
                <select 
                  value={targetCounselorId} 
                  onChange={e => setTargetCounselorId(e.target.value)} 
                  className={selectClass}
                >
                  <option value="">Select Counselor</option>
                  {users
                    .filter(u => u.id !== deactivatingId && u.role === 'Counselor' && u.status === 'Active')
                    .map(u => (
                      <option key={u.id} value={u.id}>{u.fullName}</option>
                    ))
                  }
                </select>
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button 
                  onClick={() => setIsReassignModalOpen(false)} 
                  className="px-5 py-2.5 rounded-sm bg-[#1E1E1E] border border-[#3E3E42] text-xs font-bold text-[#CCCCCC] hover:border-[#555555] transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleReassignAndDeactivate}
                  disabled={isReassigning || !targetCounselorId}
                  className="px-5 py-2.5 rounded-sm bg-yellow-500 text-black text-xs font-bold border border-[#3E3E42] hover:bg-yellow-600 disabled:opacity-50 transition-all flex items-center gap-1.5"
                >
                  {isReassigning ? 'Reassigning...' : 'Confirm & Deactivate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
