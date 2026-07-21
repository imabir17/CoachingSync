import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const isLoginPage = request.nextUrl.pathname.startsWith('/login')
  const isProtectedPage =
    request.nextUrl.pathname.startsWith('/dashboard') ||
    request.nextUrl.pathname.startsWith('/platform-admin') ||
    request.nextUrl.pathname.startsWith('/saas-admin') ||
    request.nextUrl.pathname.startsWith('/onboarding')

  if (!user && isProtectedPage) {
    // no user, potentially respond by redirecting the user to the login page
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  if (user && isLoginPage) {
    // Only query database when visiting the login page with an active auth session
    const { data: dbUser } = await supabase
      .from('User')
      .select('id, isPlatformAdmin')
      .eq('email', user.email)
      .maybeSingle()

    if (dbUser) {
      const url = request.nextUrl.clone()
      url.pathname = dbUser.isPlatformAdmin ? '/platform-admin' : '/dashboard'
      return NextResponse.redirect(url)
    } else {
      // Logged in via Supabase Auth but no DB profile exists.
      // Platform admins never have a DB row — don't sign them out.
      const isPlatformAdmin =
        user.email === 'admin@coaching.com' ||
        user.email?.includes('platform-admin')

      if (isPlatformAdmin) {
        const url = request.nextUrl.clone()
        url.pathname = '/platform-admin'
        return NextResponse.redirect(url)
      }

      // For all other users without a DB profile, force sign-out to clean the session.
      await supabase.auth.signOut()
    }
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is.
  // If you're creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!
  return supabaseResponse
}
