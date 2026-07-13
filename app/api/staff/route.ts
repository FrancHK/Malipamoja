import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { auth } from '@/lib/auth/server'
import { sql } from '@/lib/db'
import type { SystemRole } from '@/lib/types'

export async function POST(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Hakuna ruhusa' }, { status: 401 })

  const mine = await sql`select role from profiles where id = ${user.id} limit 1`
  if (mine[0]?.role !== 'mwenyekiti') {
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

  const tempPassword = crypto.randomUUID()

  const { data, error } = await auth.admin.createUser({
    email,
    password: tempPassword,
    name: full_name,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const newId = data?.user?.id
  if (newId) {
    // The app-level SystemRole lives on profiles.
    await sql`
      insert into profiles (id, full_name, phone, role)
      values (${newId}, ${full_name}, ${phone ?? null}, ${role})
      on conflict (id) do update
        set full_name = excluded.full_name, phone = excluded.phone, role = excluded.role
    `
  }

  return NextResponse.json({
    success: true,
    user_id: newId,
    temp_password: tempPassword,
  })
}
