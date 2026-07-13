import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth/server'
import { sql } from '@/lib/db'
import { deriveMemberPassword, memberEmail } from '@/lib/member-code'

export async function POST(req: Request) {
  const { code } = (await req.json()) as { code: string }

  if (!code?.trim()) {
    return NextResponse.json({ error: 'Ingiza code yako' }, { status: 400 })
  }

  const upperCode = code.trim().toUpperCase()

  // Verify the code belongs to an actual member
  const rows = (await sql`
    select id from profiles
    where member_code = ${upperCode} and role = 'mwanachama'
    limit 1
  `) as { id: string }[]

  if (!rows[0]) {
    return NextResponse.json({ error: 'Code si sahihi' }, { status: 401 })
  }

  const email = memberEmail(upperCode)
  const password = deriveMemberPassword(upperCode)

  // Sign the member in with their derived credentials (sets the session cookie)
  const { error } = await auth.signIn.email({ email, password })

  if (error) {
    return NextResponse.json({ error: 'Imeshindwa kuingia — wasiliana na msimamizi' }, { status: 401 })
  }

  return NextResponse.json({ success: true, redirect: '/member/dashboard' })
}
