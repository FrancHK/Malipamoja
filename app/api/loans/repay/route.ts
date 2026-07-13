import { NextRequest, NextResponse } from 'next/server'
import { getSessionUser } from '@/lib/auth/session'
import { sql } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const user = await getSessionUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const { loan_id, amount, notes } = await request.json()

    const loanRows = await sql`select * from loans where id = ${loan_id}`
    const loan = loanRows[0]
    if (!loan) return NextResponse.json({ error: 'Mkopo haukupatikana' }, { status: 404 })

    const repayRows = await sql`
      insert into repayments (loan_id, amount, paid_at, recorded_by, notes)
      values (${loan_id}, ${amount}, now(), ${user.id}, ${notes ?? null})
      returning *
    `
    const repayment = repayRows[0]

    const newAmountPaid = Number(loan.amount_paid) + Number(amount)
    const isComplete = newAmountPaid >= Number(loan.total_due)

    await sql`
      update loans set amount_paid = ${newAmountPaid}, status = ${isComplete ? 'completed' : 'active'}
      where id = ${loan_id}
    `

    try {
      await sql`
        insert into transactions (group_id, type, amount, description, reference_id, performed_by, member_id)
        values (${loan.group_id}, 'repayment', ${amount}, ${`Malipo ya mkopo${isComplete ? ' (Mkopo umekamilika!)' : ''}`}, ${repayment.id}, ${user.id}, ${loan.borrower_id})
      `
    } catch (txErr) {
      console.error('transactions insert:', txErr)
    }

    return NextResponse.json({ repayment, is_complete: isComplete }, { status: 201 })
  } catch (err) {
    console.error('POST /api/loans/repay:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva' }, { status: 500 })
  }
}
