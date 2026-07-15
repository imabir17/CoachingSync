'use server'

import { redirect } from 'next/navigation'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/utils/supabase/admin'
import { headers } from 'next/headers'

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  if (!email || !password) {
    return { error: 'Email and password are required' }
  }

  const supabase = await createServerClient()

  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Provision Super Admin profile in database if missing
  if (authData?.user) {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { error: 'Failed to authenticate admin client: SUPABASE_SERVICE_ROLE_KEY is not defined.' }
    }

    // Verify key format to prevent silent RLS blockages
    try {
      const parts = process.env.SUPABASE_SERVICE_ROLE_KEY.split('.')
      if (parts.length >= 2) {
        const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString())
        if (payload.role !== 'service_role') {
          return { error: `Invalid SUPABASE_SERVICE_ROLE_KEY: The key provided has the role '${payload.role}' instead of 'service_role'. Please check your Vercel environment variables.` }
        }
      }
    } catch (e) {
      return { error: 'Failed to validate SUPABASE_SERVICE_ROLE_KEY format. Please ensure it is copy-pasted correctly.' }
    }

    // Use admin client to bypass RLS for profile verification and insertion
    const supabaseAdmin = createSupabaseAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    )

    // Verify profile existence safely
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('User')
      .select('id, status')
      .eq('email', email)
      .maybeSingle()

    if (checkError) {
      return { error: 'Failed to verify user profile: ' + checkError.message }
    }

    if (existingUser && existingUser.status === 'Deactivated') {
      const supabase = await createServerClient()
      await supabase.auth.signOut()
      return { error: 'Your account has been deactivated. Please contact your administrator.' }
    }

    if (!existingUser) {
      const { data: company, error: companyError } = await supabaseAdmin
        .from('Company')
        .insert({ name: 'My Company' })
        .select()
        .single()

      if (companyError || !company) {
        return { error: 'Failed to create company profile: ' + (companyError?.message || 'Unknown error') }
      }

      const { error: userError } = await supabaseAdmin
        .from('User')
        .insert({
          id: authData.user.id,
          email,
          fullName: authData.user.user_metadata?.full_name || 'Admin User',
          role: 'Super Admin',
          companyId: company.id
        })

      if (userError) {
        return { error: 'Failed to create user profile: ' + userError.message }
      }

      // Store tenant context in JWT app_metadata to enable high-performance RLS check paths
      await supabaseAdmin.auth.admin.updateUserById(
        authData.user.id,
        { app_metadata: { companyId: company.id, role: 'Super Admin' } }
      )
    }
  }

  redirect('/dashboard')
}

export async function logout() {
  const supabase = await createServerClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function resetPassword(prevState: any, formData: FormData) {
  const email = formData.get('email') as string
  
  if (!email) {
    return { error: 'Email is required' }
  }

  const supabase = await createServerClient()
  const headersList = await headers()
  const host = headersList.get('host') || 'localhost:3000'
  const protocol = host.includes('localhost') ? 'http' : 'https'
  const siteUrl = `${protocol}://${host}`

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/update-password`,
  })

  if (error) {
    return { error: error.message }
  }

  return { success: 'Password reset link sent to your email.' }
}

export async function updatePassword(prevState: any, formData: FormData) {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || !confirmPassword) {
    return { error: 'Both fields are required' }
  }

  if (password !== confirmPassword) {
    return { error: 'Passwords do not match' }
  }
  
  if (password.length < 6) {
    return { error: 'Password must be at least 6 characters' }
  }

  const supabase = await createServerClient()
  
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { error: error.message }
  }


  // Clear active session to enforce a clean re-login with the new password
  await supabase.auth.signOut()
  redirect('/login?message=Password updated. Please log in.')
}

export async function provisionCompany() {
  const supabase = await createServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const admin = createAdminClient()

  // Guard against double-provisioning if this route is hit twice
  const { data: existing } = await admin.from('User').select('id').eq('id', user.id).maybeSingle()
  if (existing) return { alreadyProvisioned: true }

  const companyName = user.user_metadata.pendingCompanyName ?? 'My Coaching Center'

  const { data: company, error: companyErr } = await admin
    .from('Company')
    .insert({ name: companyName })
    .select()
    .single()
  if (companyErr) throw companyErr

  const { error: userErr } = await admin.from('User').insert({
    id: user.id,
    email: user.email!,
    fullName: user.user_metadata.fullName ?? '',
    role: 'Super Admin',
    companyId: company.id,
  })
  if (userErr) throw userErr

  const { data: branch, error: branchErr } = await admin
    .from('Branch')
    .insert({
      companyId: company.id,
      name: 'Main Branch',
      isDefault: true,
    })
    .select()
    .single()
  if (branchErr) throw branchErr

  const { data: freePlan, error: planErr } = await admin
    .from('Plan')
    .select('id')
    .eq('name', 'Free')
    .single()
  if (planErr) throw planErr

  const { error: subErr } = await admin.from('Subscription').insert({
    branchId: branch.id,
    companyId: company.id,
    planId: freePlan.id,
    status: 'active',
    currentPeriodEnd: null,
  })
  if (subErr) throw subErr

  await admin.from('ActivityLog').insert({
    companyId: company.id,
    actorId: user.id,
    action: 'company.created',
    entityType: 'Company',
    entityId: company.id,
  })

  // Set the app_metadata claims in GoTrue so they are cached in user's JWT
  await admin.auth.admin.updateUserById(user.id, {
    app_metadata: { companyId: company.id, role: 'Super Admin' },
  })

  return { companyId: company.id }
}
