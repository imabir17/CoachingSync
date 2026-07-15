'use server'

import { createClient as createServerClient } from '@/utils/supabase/server'
import { getUserSession } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import { createAdminClient } from '@/utils/supabase/admin'

export async function createStaff(formData: FormData) {
  const user = await getUserSession()
  if (!user || !['Super Admin', 'Manager'].includes(user.role)) {
    throw new Error('Unauthorized')
  }

  const email = formData.get('email') as string
  const role = formData.get('role') as 'Manager' | 'Counselor'

  if (!email || !role) {
    return { error: 'Email and role are required' }
  }

  try {
    const invite = await createInvite(email, role)
    
    let siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    siteUrl = siteUrl.includes('http') ? siteUrl : `https://${siteUrl}`
    siteUrl = siteUrl.replace(/\/$/, '')
    const inviteLink = `${siteUrl}/invite/accept?token=${invite.token}`

    console.log(`[STAFF INVITE CREATED] Email: ${email}, Link: ${inviteLink}`)

    return { success: true, inviteLink }
  } catch (err: any) {
    return { error: err.message || 'Failed to create invitation' }
  }
}

export async function createInvite(email: string, role: 'Manager' | 'Counselor') {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data: me } = await supabase.from('User').select('companyId, role').eq('id', user.id).single()
  if (!me || !['Super Admin', 'Manager'].includes(me.role)) {
    throw new Error('Not authorized')
  }

  // Check if an active/deactivated user already has this email in DB
  const { data: existingUser } = await supabase
    .from('User')
    .select('id')
    .eq('email', email)
    .maybeSingle()

  if (existingUser) {
    throw new Error('A staff member with this email already exists.')
  }

  // Check if a pending invite already exists
  const { data: existingInvite } = await supabase
    .from('Invite')
    .select('id, expiresAt')
    .eq('companyId', me.companyId)
    .eq('email', email)
    .eq('status', 'Pending')
    .maybeSingle()

  if (existingInvite) {
    if (new Date(existingInvite.expiresAt) > new Date()) {
      throw new Error('A pending invite for this email already exists and is active.')
    } else {
      await supabase
        .from('Invite')
        .update({ status: 'Revoked' })
        .eq('id', existingInvite.id)
    }
  }

  const { data: invite, error } = await supabase.from('Invite').insert({
    companyId: me.companyId,
    email,
    role,
    invitedById: user.id,
  }).select().single()
  
  if (error) throw error

  await supabase.from('ActivityLog').insert({
    companyId: me.companyId,
    actorId: user.id,
    action: 'user.invited',
    entityType: 'Invite',
    entityId: invite.id,
    metadata: { email, role },
  })

  return invite
}

export async function acceptInvite(token: string, password: string, fullName: string) {
  const admin = createAdminClient()

  const { data: invite } = await admin.from('Invite').select('*').eq('token', token).single()
  if (!invite || invite.status !== 'Pending') throw new Error('Invalid or already-used invite')
  if (new Date(invite.expiresAt) < new Date()) throw new Error('This invite has expired')

  // Create or reuse the auth user
  let userId: string
  const { data: existingAuthUser } = await admin.auth.admin.listUsers()
  const found = existingAuthUser.users.find(u => u.email === invite.email)

  if (found) {
    userId = found.id
  } else {
    const { data: created, error } = await admin.auth.admin.createUser({
      email: invite.email,
      password,
      email_confirm: true, // invite link itself acts as email confirmation
    })
    if (error) throw error
    userId = created.user.id
  }

  // Reject if this email is already a member of a DIFFERENT company
  const { data: existingUserRow } = await admin.from('User').select('companyId').eq('id', userId).maybeSingle()
  if (existingUserRow && existingUserRow.companyId !== invite.companyId) {
    throw new Error('This email already belongs to a different company')
  }

  if (!existingUserRow) {
    await admin.from('User').insert({
      id: userId,
      email: invite.email,
      fullName,
      role: invite.role,
      companyId: invite.companyId,
    })
  } else {
    await admin
      .from('User')
      .update({ status: 'Active', role: invite.role, fullName })
      .eq('id', userId)
  }

  await admin.auth.admin.updateUserById(userId, {
    ban_duration: 'none',
    app_metadata: { companyId: invite.companyId, role: invite.role },
  })

  await admin.from('Invite').update({ status: 'Accepted' }).eq('id', invite.id)
  
  await admin.from('ActivityLog').insert({
    companyId: invite.companyId,
    actorId: userId,
    action: 'invite.accepted',
    entityType: 'User',
    entityId: userId,
  })

  return { success: true }
}

export async function getInvites() {
  const user = await getUserSession()
  if (!user || !['Super Admin', 'Manager'].includes(user.role)) {
    return []
  }

  const supabase = await createServerClient()
  const { data: invites } = await supabase
    .from('Invite')
    .select('*')
    .eq('companyId', user.companyId)
    .eq('status', 'Pending')
    .order('createdAt', { ascending: false })

  return invites || []
}

export async function revokeInvite(id: string) {
  const user = await getUserSession()
  if (!user || !['Super Admin', 'Manager'].includes(user.role)) {
    throw new Error('Unauthorized')
  }

  const supabase = await createServerClient()
  const { error } = await supabase
    .from('Invite')
    .update({ status: 'Revoked' })
    .eq('id', id)
    .eq('companyId', user.companyId)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/staff')
  return { success: true }
}

export async function updateStaff(id: string, formData: FormData) {
  const user = await getUserSession()
  if (!user || user.role !== 'Super Admin') {
    throw new Error('Unauthorized')
  }

  const fullName = formData.get('fullName') as string
  const email = formData.get('email') as string
  const role = formData.get('role') as string

  if (!fullName || !email || !role) {
    return { error: 'Name, email, and role are required' }
  }

  const supabase = await createServerClient()

  // Verify company scope
  const { data: staff } = await supabase
    .from('User')
    .select('id')
    .eq('id', id)
    .eq('companyId', user.companyId)
    .maybeSingle()

  if (!staff) throw new Error('Staff not found in your company')

  const { error: updateError } = await supabase
    .from('User')
    .update({ fullName, email, role })
    .eq('id', id)

  if (updateError) {
    return { error: 'Failed to update staff: ' + updateError.message }
  }

  // Update auth role
  const supabaseAdmin = createAdminClient()
  await supabaseAdmin.auth.admin.updateUserById(id, {
    app_metadata: { role }
  })

  revalidatePath('/dashboard/staff')
  return { success: true }
}

export async function changeStaffRole(id: string, newRole: string) {
  const user = await getUserSession()
  if (!user || user.role !== 'Super Admin') {
    throw new Error('Unauthorized')
  }

  const supabase = await createServerClient()

  // Verify company scope
  const { data: targetUser } = await supabase
    .from('User')
    .select('role')
    .eq('id', id)
    .eq('companyId', user.companyId)
    .single()

  if (!targetUser) throw new Error('User not found in your company')

  // Prevent demoting self if they are the last active Super Admin
  if (user.id === id && targetUser.role === 'Super Admin' && newRole !== 'Super Admin') {
    const { count } = await supabase
      .from('User')
      .select('id', { count: 'exact', head: true })
      .eq('companyId', user.companyId)
      .eq('role', 'Super Admin')
      .eq('status', 'Active')

    if (count === 1) {
      return { error: 'Cannot demote yourself as you are the only remaining active Super Admin' }
    }
  }

  const { error: updateError } = await supabase
    .from('User')
    .update({ role: newRole })
    .eq('id', id)

  if (updateError) {
    return { error: 'Failed to change role: ' + updateError.message }
  }

  const supabaseAdmin = createAdminClient()
  await supabaseAdmin.auth.admin.updateUserById(id, {
    app_metadata: { role: newRole }
  })

  await supabase.from('ActivityLog').insert({
    companyId: user.companyId,
    actorId: user.id,
    action: 'user.role_changed',
    entityType: 'User',
    entityId: id,
    metadata: { oldRole: targetUser.role, newRole }
  })

  revalidatePath('/dashboard/staff')
  return { success: true }
}

export async function deactivateStaff(id: string) {
  const user = await getUserSession()
  if (!user || !['Super Admin', 'Manager'].includes(user.role)) {
    throw new Error('Unauthorized')
  }

  if (user.id === id) {
    return { error: 'Cannot deactivate your own account' }
  }

  const supabase = await createServerClient()

  const { data: targetUser } = await supabase
    .from('User')
    .select('role')
    .eq('id', id)
    .eq('companyId', user.companyId)
    .single()

  if (!targetUser) throw new Error('User not found in your company')

  if (user.role === 'Manager' && ['Super Admin', 'Manager'].includes(targetUser.role)) {
    return { error: 'Managers cannot deactivate Super Admins or other Managers' }
  }

  if (targetUser.role === 'Super Admin') {
    const { count } = await supabase
      .from('User')
      .select('id', { count: 'exact', head: true })
      .eq('companyId', user.companyId)
      .eq('role', 'Super Admin')
      .eq('status', 'Active')

    if (count === 1) {
      return { error: 'Cannot deactivate the only remaining active Super Admin' }
    }
  }

  const { error: updateError } = await supabase
    .from('User')
    .update({ status: 'Deactivated' })
    .eq('id', id)

  if (updateError) {
    return { error: 'Failed to deactivate staff: ' + updateError.message }
  }

  // Ban user in Auth
  const supabaseAdmin = createAdminClient()
  await supabaseAdmin.auth.admin.updateUserById(id, {
    ban_duration: 'infinite'
  })

  await supabase.from('ActivityLog').insert({
    companyId: user.companyId,
    actorId: user.id,
    action: 'user.deactivated',
    entityType: 'User',
    entityId: id,
  })

  revalidatePath('/dashboard/staff')
  return { success: true }
}

export async function reactivateStaff(id: string) {
  const user = await getUserSession()
  if (!user || !['Super Admin', 'Manager'].includes(user.role)) {
    throw new Error('Unauthorized')
  }

  const supabase = await createServerClient()

  const { data: targetUser } = await supabase
    .from('User')
    .select('role')
    .eq('id', id)
    .eq('companyId', user.companyId)
    .single()

  if (!targetUser) throw new Error('User not found in your company')

  if (user.role === 'Manager' && ['Super Admin', 'Manager'].includes(targetUser.role)) {
    return { error: 'Managers cannot reactivate Super Admins or other Managers' }
  }

  const { error: updateError } = await supabase
    .from('User')
    .update({ status: 'Active' })
    .eq('id', id)

  if (updateError) {
    return { error: 'Failed to reactivate staff: ' + updateError.message }
  }

  // Unban user in Auth
  const supabaseAdmin = createAdminClient()
  await supabaseAdmin.auth.admin.updateUserById(id, {
    ban_duration: 'none'
  })

  await supabase.from('ActivityLog').insert({
    companyId: user.companyId,
    actorId: user.id,
    action: 'user.reactivated',
    entityType: 'User',
    entityId: id,
  })

  revalidatePath('/dashboard/staff')
  return { success: true }
}

export async function deleteStaff(id: string) {
  const user = await getUserSession()
  if (!user || user.role !== 'Super Admin') {
    throw new Error('Unauthorized')
  }

  if (user.id === id) {
    return { error: 'Cannot delete your own account' }
  }

  const supabase = await createServerClient()

  const { data: staff } = await supabase
    .from('User')
    .select('id')
    .eq('id', id)
    .eq('companyId', user.companyId)
    .maybeSingle()

  if (!staff) throw new Error('Staff not found in your company')

  const { error: deleteError } = await supabase
    .from('User')
    .delete()
    .eq('id', id)

  if (deleteError) {
    return { error: 'Failed to delete staff: ' + deleteError.message }
  }

  // Delete from Auth as well
  const supabaseAdmin = createAdminClient()
  await supabaseAdmin.auth.admin.deleteUser(id)

  revalidatePath('/dashboard/staff')
  return { success: true }
}

export async function verifyInviteToken(token: string) {
  const admin = createAdminClient()
  const { data: invite, error } = await admin
    .from('Invite')
    .select('email, role, status, expiresAt')
    .eq('token', token)
    .maybeSingle()

  if (error || !invite) {
    throw new Error('Invalid or non-existent invitation token.')
  }

  if (invite.status !== 'Pending') {
    throw new Error('This invitation has already been accepted or revoked.')
  }

  if (new Date(invite.expiresAt) < new Date()) {
    throw new Error('This invitation has expired. Please request a new one.')
  }

  return { email: invite.email, role: invite.role }
}

