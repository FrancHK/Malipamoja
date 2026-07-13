import { NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { sql } from '@/lib/db'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Hakuna ruhusa' }, { status: 401 })

  const rows = await sql`
    select a.*,
           case when g.id is null then null
                else json_build_object('name', g.name) end as group
    from member_applications a
    left join groups g on g.id = a.group_id
    order by a.created_at desc
  `
  return NextResponse.json(rows)
}

export async function POST(req: Request) {
  const body = await req.json()
  const { full_name, phone, id_number, occupation, reason, group_id } = body

  if (!full_name?.trim() || !phone?.trim()) {
    return NextResponse.json({ error: 'Jina na simu zinahitajika' }, { status: 400 })
  }

  // Public endpoint — anonymous applicants submit without a session.
  await sql`
    insert into member_applications (full_name, phone, id_number, occupation, reason, group_id)
    values (
      ${full_name.trim()}, ${phone.trim()},
      ${id_number?.trim() || null}, ${occupation?.trim() || null},
      ${reason?.trim() || null}, ${group_id || null}
    )
  `
  return NextResponse.json({ success: true }, { status: 201 })
}
