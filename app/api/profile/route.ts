import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { sql } from '@/lib/db'

export async function PATCH(req: Request) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Hakuna ruhusa' }, { status: 401 })

  const { full_name, phone } = (await req.json()) as { full_name?: string; phone?: string }

  if (!full_name?.trim()) {
    return NextResponse.json({ error: 'Jina kamili linahitajika' }, { status: 400 })
  }

  const rows = await sql`
    update profiles
    set full_name = ${full_name.trim()}, phone = ${phone?.trim() || null}
    where id = ${user.id}
    returning id, full_name, phone
  `
  if (!rows[0]) {
    return NextResponse.json({ error: 'Wasifu haupatikani' }, { status: 404 })
  }

  return NextResponse.json({ success: true, profile: rows[0] })
}
