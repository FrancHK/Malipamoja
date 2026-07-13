import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { sql } from '@/lib/db'
import { calculateLoanTotal } from '@/lib/utils'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

  const memberships = (await sql`
    select group_id, role from group_members where user_id = ${user.id} and is_active = true
  `) as { group_id: string; role: string }[]
  const groupIds = memberships.map((m) => m.group_id)
  if (!groupIds.length) return NextResponse.json({ loans: [], groups: [], userRole: 'member' })

  const roles = memberships.map((m) => m.role)
  const userRole = roles.includes('admin') ? 'admin' : roles.includes('treasurer') ? 'treasurer' : 'member'

  const [loans, groups] = await Promise.all([
    sql`
      select l.*, l.amount::float8 as amount, l.total_due::float8 as total_due,
             l.amount_paid::float8 as amount_paid, l.interest_rate::float8 as interest_rate,
             json_build_object('id', p.id, 'full_name', p.full_name, 'phone', p.phone,
               'avatar_url', p.avatar_url, 'created_at', p.created_at, 'updated_at', p.updated_at) as borrower
      from loans l
      join profiles p on p.id = l.borrower_id
      where l.group_id = any(${groupIds})
      order by l.requested_at desc
    `,
    sql`
      select id, name, description, contribution_amount::float8 as contribution_amount, contribution_cycle,
             interest_rate::float8 as interest_rate, max_loan_multiplier, created_by, created_at, updated_at
      from groups where id = any(${groupIds}) order by name
    `,
  ])

  return NextResponse.json({ loans, groups, userRole })
}

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const body = await request.json()
    const { group_id, amount, duration_months, interest_rate, purpose } = body

    // Verify membership
    const membership = await sql`
      select role from group_members
      where group_id = ${group_id} and user_id = ${user.id} and is_active = true
      limit 1
    `
    if (!membership[0]) return NextResponse.json({ error: 'Si mwanachama wa kundi hili' }, { status: 403 })

    // Check no active loan
    const activeLoan = await sql`
      select id from loans
      where group_id = ${group_id} and borrower_id = ${user.id} and status = 'active'
      limit 1
    `
    if (activeLoan[0]) {
      return NextResponse.json({ error: 'Tayari una mkopo unaoendelea katika kundi hili' }, { status: 409 })
    }

    const total_due = calculateLoanTotal(amount, interest_rate, duration_months)

    const loanRows = await sql`
      insert into loans (group_id, borrower_id, amount, interest_rate, duration_months, total_due, amount_paid, status, purpose)
      values (${group_id}, ${user.id}, ${amount}, ${interest_rate}, ${duration_months}, ${total_due}, 0, 'pending', ${purpose ?? null})
      returning *
    `

    return NextResponse.json({ loan: loanRows[0] }, { status: 201 })
  } catch (err) {
    console.error('POST /api/loans:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const body = await request.json()
    const { loan_id, action } = body // action: 'approve' | 'reject'

    const loanRows = await sql`select * from loans where id = ${loan_id}`
    const loan = loanRows[0]
    if (!loan) return NextResponse.json({ error: 'Mkopo haukupatikana' }, { status: 404 })

    // Verify admin/treasurer
    const membership = await sql`
      select role from group_members
      where group_id = ${loan.group_id} and user_id = ${user.id} and role in ('admin', 'treasurer')
      limit 1
    `
    if (!membership[0]) return NextResponse.json({ error: 'Huna ruhusa ya kuidhinisha mikopo' }, { status: 403 })

    if (action === 'approve') {
      await sql`update loans set status = 'active', approved_by = ${user.id}, approved_at = now() where id = ${loan_id}`
      try {
        await sql`
          insert into transactions (group_id, type, amount, description, reference_id, performed_by, member_id)
          values (${loan.group_id}, 'loan_disbursement', ${loan.amount}, 'Mkopo uliotolewa', ${loan_id}, ${user.id}, ${loan.borrower_id})
        `
      } catch (txErr) {
        console.error('transactions insert:', txErr)
      }
    } else {
      await sql`update loans set status = 'rejected', approved_by = ${user.id} where id = ${loan_id}`
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH /api/loans:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva' }, { status: 500 })
  }
}
