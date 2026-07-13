import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { sql } from '@/lib/db'

export async function POST(req: Request) {
  const { full_name, email, phone, password } = (await req.json()) as {
    full_name: string
    email: string
    phone?: string
    password: string
  }

  if (!full_name?.trim() || !email?.trim() || !password) {
    return NextResponse.json({ error: 'Jaza sehemu zote muhimu' }, { status: 400 })
  }
  if (password.length < 8) {
    return NextResponse.json({ error: 'Nywila lazima iwe na herufi 8 au zaidi' }, { status: 400 })
  }

  const { data, error } = await auth.signUp.email({
    email: email.trim(),
    password,
    name: full_name.trim(),
  })

  if (error) {
    return NextResponse.json({ error: error.message ?? 'Imeshindwa kujisajili' }, { status: 400 })
  }

  const userId = data?.user?.id
  if (userId) {
    // Self-registered accounts manage a group → chairman (mwenyekiti) by default.
    await sql`
      insert into profiles (id, full_name, phone, role)
      values (${userId}, ${full_name.trim()}, ${phone?.trim() || null}, 'mwenyekiti')
      on conflict (id) do update
        set full_name = excluded.full_name, phone = excluded.phone
    `
    // Staff approve join requests, which creates member accounts via the
    // Neon Auth admin API — that API requires the Better Auth 'admin' role.
    await sql`update neon_auth."user" set role = 'admin' where id = ${userId}`
  }

  return NextResponse.json({ success: true })
}
