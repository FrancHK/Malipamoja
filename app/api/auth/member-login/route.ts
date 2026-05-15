import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { deriveMemberPassword, memberEmail } from '@/lib/member-code'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(req: Request) {
  const { code } = await req.json() as { code: string }

  if (!code?.trim()) {
    return NextResponse.json({ error: 'Ingiza code yako' }, { status: 400 })
  }

  const upperCode = code.trim().toUpperCase()
  const adminClient = createAdminClient()

  // Verify the code exists
  const { data: profile } = await adminClient
    .from('profiles')
    .select('id, full_name, role, member_code')
    .eq('member_code', upperCode)
    .eq('role', 'mwanachama')
    .maybeSingle()

  if (!profile) {
    return NextResponse.json({ error: 'Code si sahihi' }, { status: 401 })
  }

  const email = memberEmail(upperCode)
  const password = deriveMemberPassword(upperCode)

  // Sign in on behalf of the member using derived credentials
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error || !data.session) {
    return NextResponse.json({ error: 'Imeshindwa kuingia — wasiliana na msimamizi' }, { status: 401 })
  }

  return NextResponse.json({ success: true, redirect: '/member/dashboard' })
}
