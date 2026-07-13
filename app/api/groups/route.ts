import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const body = await request.json()
    const { name, description, contribution_amount, contribution_cycle } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Jina la kundi linahitajika' }, { status: 400 })
    }
    if (!contribution_amount || Number(contribution_amount) < 1000) {
      return NextResponse.json({ error: 'Kiasi cha mchango lazima kiwe angalau TZS 1,000' }, { status: 400 })
    }

    // Ensure the creator has a profile row (FK target for created_by).
    await sql`
      insert into profiles (id, full_name)
      values (${user.id}, ${user.name ?? user.email?.split('@')[0] ?? 'Mtumiaji'})
      on conflict (id) do nothing
    `

    const groupRows = await sql`
      insert into groups (name, description, contribution_amount, contribution_cycle, created_by)
      values (
        ${name.trim()}, ${description?.trim() || null},
        ${Number(contribution_amount)}, ${contribution_cycle || 'monthly'}, ${user.id}
      )
      returning *
    `
    const group = groupRows[0]

    // Add creator as group admin
    await sql`
      insert into group_members (group_id, user_id, role)
      values (${group.id}, ${user.id}, 'admin')
    `

    return NextResponse.json({ group }, { status: 201 })
  } catch (err) {
    console.error('POST /api/groups:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva isiyo tarajiwa' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const groups = await sql`
      select g.id, g.name, g.description,
             g.contribution_amount::float8 as contribution_amount, g.contribution_cycle,
             g.interest_rate::float8 as interest_rate, g.max_loan_multiplier,
             g.created_by, g.created_at, g.updated_at,
             gm.role as my_role,
             (select count(*)::int from group_members m where m.group_id = g.id and m.is_active = true) as member_count,
             (select coalesce(sum(c.amount), 0)::float8 from contributions c where c.group_id = g.id and c.status = 'paid') as total_savings,
             (select count(*)::int from loans l where l.group_id = g.id and l.status = 'active') as active_loans
      from groups g
      join group_members gm on gm.group_id = g.id
      where gm.user_id = ${user.id} and gm.is_active = true
      order by g.created_at desc
    `
    return NextResponse.json({ groups })
  } catch (err) {
    console.error('GET /api/groups:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva' }, { status: 500 })
  }
}
