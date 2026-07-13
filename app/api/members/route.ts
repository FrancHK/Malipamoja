import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { sql } from '@/lib/db'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

  const memberships = (await sql`
    select group_id from group_members where user_id = ${user.id} and is_active = true
  `) as { group_id: string }[]
  const groupIds = memberships.map((m) => m.group_id)
  if (!groupIds.length) return NextResponse.json({ members: [], groups: [] })

  const [members, groups] = await Promise.all([
    sql`
      select gm.*,
             json_build_object('id', p.id, 'full_name', p.full_name, 'phone', p.phone,
               'avatar_url', p.avatar_url, 'member_code', p.member_code,
               'created_at', p.created_at, 'updated_at', p.updated_at) as profile,
             coalesce((select sum(c.amount) from contributions c
                       where c.member_id = gm.user_id and c.group_id = any(${groupIds}) and c.status = 'paid'), 0)::float8 as total_contributions,
             coalesce((select sum(c.amount) from contributions c
                       where c.member_id = gm.user_id and c.group_id = any(${groupIds}) and c.status <> 'paid'), 0)::float8 as pending_contributions
      from group_members gm
      join profiles p on p.id = gm.user_id
      where gm.group_id = any(${groupIds}) and gm.is_active = true
      order by gm.joined_at
    `,
    sql`select id, name from groups where id = any(${groupIds})`,
  ])

  return NextResponse.json({ members, groups })
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const body = await request.json()
    const { group_id, email, role } = body

    // Verify requester is admin or treasurer
    const requester = await sql`
      select role from group_members
      where group_id = ${group_id} and user_id = ${user.id}
      limit 1
    `
    if (!requester[0] || !['admin', 'treasurer'].includes(requester[0].role as string)) {
      return NextResponse.json({ error: 'Huna ruhusa ya kuongeza wanachama' }, { status: 403 })
    }

    // Find the target user by email (Neon Auth users table)
    const notFound = 'Mtumiaji mwenye barua pepe hiyo hajapatikana. Lazima ajiandikishe kwanza.'
    const target = await sql`select id from neon_auth."user" where email = ${email} limit 1`
    if (!target[0]) return NextResponse.json({ error: notFound }, { status: 404 })

    const profile = await sql`select id from profiles where id = ${target[0].id} limit 1`
    if (!profile[0]) return NextResponse.json({ error: notFound }, { status: 404 })

    try {
      await sql`
        insert into group_members (group_id, user_id, role)
        values (${group_id}, ${target[0].id}, ${role ?? 'member'})
      `
    } catch (e: unknown) {
      const err = e as { code?: string; message?: string }
      if (err.code === '23505' || /duplicate|unique/i.test(err.message ?? '')) {
        return NextResponse.json({ error: 'Mtumiaji tayari ni mwanachama wa kundi hili' }, { status: 409 })
      }
      throw e
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('POST /api/members:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva' }, { status: 500 })
  }
}
