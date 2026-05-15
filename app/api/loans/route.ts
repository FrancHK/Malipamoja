import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { calculateLoanTotal } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const body = await request.json()
    const { group_id, amount, duration_months, interest_rate, purpose } = body

    const admin = createAdminClient()

    // Verify membership
    const { data: membership } = await admin
      .from('group_members')
      .select('role')
      .eq('group_id', group_id)
      .eq('user_id', user.id)
      .eq('is_active', true)
      .single()

    if (!membership) return NextResponse.json({ error: 'Si mwanachama wa kundi hili' }, { status: 403 })

    // Check no active loan
    const { data: activeLoan } = await admin
      .from('loans')
      .select('id')
      .eq('group_id', group_id)
      .eq('borrower_id', user.id)
      .eq('status', 'active')
      .maybeSingle()

    if (activeLoan) {
      return NextResponse.json({ error: 'Tayari una mkopo unaoendelea katika kundi hili' }, { status: 409 })
    }

    const total_due = calculateLoanTotal(amount, interest_rate, duration_months)

    const { data: loan, error } = await admin
      .from('loans')
      .insert({
        group_id,
        borrower_id: user.id,
        amount,
        interest_rate,
        duration_months,
        total_due,
        amount_paid: 0,
        status: 'pending',
        purpose,
      })
      .select()
      .single()

    if (error) {
      console.error('loans insert:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ loan }, { status: 201 })
  } catch (err) {
    console.error('POST /api/loans:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const body = await request.json()
    const { loan_id, action } = body // action: 'approve' | 'reject'

    const admin = createAdminClient()

    const { data: loan } = await admin.from('loans').select('*, group_id').eq('id', loan_id).single()
    if (!loan) return NextResponse.json({ error: 'Mkopo haukupatikana' }, { status: 404 })

    // Verify admin/treasurer
    const { data: membership } = await admin
      .from('group_members')
      .select('role')
      .eq('group_id', loan.group_id)
      .eq('user_id', user.id)
      .in('role', ['admin', 'treasurer'])
      .maybeSingle()

    if (!membership) return NextResponse.json({ error: 'Huna ruhusa ya kuidhinisha mikopo' }, { status: 403 })

    const updates =
      action === 'approve'
        ? { status: 'active', approved_by: user.id, approved_at: new Date().toISOString() }
        : { status: 'rejected', approved_by: user.id }

    const { error } = await admin.from('loans').update(updates).eq('id', loan_id)
    if (error) {
      console.error('loans update:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (action === 'approve') {
      admin.from('transactions').insert({
        group_id: loan.group_id,
        type: 'loan_disbursement',
        amount: loan.amount,
        description: `Mkopo uliotolewa`,
        reference_id: loan_id,
        performed_by: user.id,
        member_id: loan.borrower_id,
      }).then(({ error: txErr }) => {
        if (txErr) console.error('transactions insert:', txErr)
      })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('PATCH /api/loans:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva' }, { status: 500 })
  }
}
