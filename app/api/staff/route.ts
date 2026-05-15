import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import type { SystemRole } from '@/lib/types'

export async function POST(req: Request) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Hakuna ruhusa' }, { status: 401 })

  const { data: myProfile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (myProfile?.role !== 'mwenyekiti') {
    return NextResponse.json({ error: 'Ni mwenyekiti tu anayeweza kuunda wafanyakazi' }, { status: 403 })
  }

  const body = await req.json()
  const { full_name, email, phone, role } = body as {
    full_name: string; email: string; phone?: string; role: SystemRole
  }

  const allowedRoles: SystemRole[] = ['katibu', 'mweka_hazina', 'msimamizi']
  if (!allowedRoles.includes(role)) {
    return NextResponse.json({ error: 'Chaguo la nafasi si sahihi' }, { status: 400 })
  }

  const adminClient = createAdminClient()
  const tempPassword = crypto.randomUUID()

  const { data: newUser, error } = await adminClient.auth.admin.createUser({
    email,
    password: tempPassword,
    email_confirm: true,
    user_metadata: { full_name, phone, role },
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({
    success: true,
    user_id: newUser.user?.id,
    temp_password: tempPassword,
  })
}
