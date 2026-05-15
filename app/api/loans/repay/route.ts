import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const { loan_id, amount, notes } = await request.json()

    const admin = createAdminClient()

    const { data: loan } = await admin.from('loans').select('*').eq('id', loan_id).single()
    if (!loan) return NextResponse.json({ error: 'Mkopo haukupatikana' }, { status: 404 })

    const { data: repayment, error: repayError } = await admin
      .from('repayments')
      .insert({ loan_id, amount, paid_at: new Date().toISOString(), recorded_by: user.id, notes })
      .select()
      .single()

    if (repayError) {
      console.error('repayments insert:', repayError)
      return NextResponse.json({ error: repayError.message }, { status: 500 })
    }

    const newAmountPaid = loan.amount_paid + amount
    const isComplete = newAmountPaid >= loan.total_due

    await admin.from('loans').update({
      amount_paid: newAmountPaid,
      status: isComplete ? 'completed' : 'active',
    }).eq('id', loan_id)

    admin.from('transactions').insert({
      group_id: loan.group_id,
      type: 'repayment',
      amount,
      description: `Malipo ya mkopo${isComplete ? ' (Mkopo umekamilika!)' : ''}`,
      reference_id: repayment.id,
      performed_by: user.id,
      member_id: loan.borrower_id,
    }).then(({ error: txErr }) => {
      if (txErr) console.error('transactions insert:', txErr)
    })

    return NextResponse.json({ repayment, is_complete: isComplete }, { status: 201 })
  } catch (err) {
    console.error('POST /api/loans/repay:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva' }, { status: 500 })
  }
}
