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
  if (!groupIds.length) return NextResponse.json({ contributions: [], groups: [], members: [] })

  const [contributions, groups, members] = await Promise.all([
    sql`
      select c.*, c.amount::float8 as amount,
             json_build_object('id', p.id, 'full_name', p.full_name, 'phone', p.phone,
               'avatar_url', p.avatar_url, 'created_at', p.created_at, 'updated_at', p.updated_at) as member
      from contributions c
      join profiles p on p.id = c.member_id
      where c.group_id = any(${groupIds})
      order by c.created_at desc
    `,
    sql`
      select id, name, description, contribution_amount::float8 as contribution_amount, contribution_cycle,
             interest_rate::float8 as interest_rate, max_loan_multiplier, created_by, created_at, updated_at
      from groups where id = any(${groupIds}) order by name
    `,
    sql`
      select gm.*,
             json_build_object('id', p.id, 'full_name', p.full_name, 'phone', p.phone,
               'avatar_url', p.avatar_url, 'created_at', p.created_at, 'updated_at', p.updated_at) as profile
      from group_members gm
      join profiles p on p.id = gm.user_id
      where gm.group_id = any(${groupIds}) and gm.is_active = true
    `,
  ])

  return NextResponse.json({ contributions, groups, members })
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const body = await request.json()
    const { group_id, member_id, amount, period_start, period_end, notes } = body

    const rows = await sql`
      insert into contributions (group_id, member_id, amount, period_start, period_end, status, paid_at, recorded_by, notes)
      values (${group_id}, ${member_id}, ${amount}, ${period_start}, ${period_end}, 'paid', now(), ${user.id}, ${notes ?? null})
      returning *
    `
    const contribution = rows[0]

    // Log transaction (non-fatal)
    try {
      await sql`
        insert into transactions (group_id, type, amount, description, reference_id, performed_by, member_id)
        values (${group_id}, 'contribution', ${amount}, ${`Mchango wa ${period_start} – ${period_end}`}, ${contribution.id}, ${user.id}, ${member_id})
      `
    } catch (txErr) {
      console.error('transactions insert:', txErr)
    }

    return NextResponse.json({ contribution }, { status: 201 })
  } catch (err) {
    console.error('POST /api/contributions:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva' }, { status: 500 })
  }
}
