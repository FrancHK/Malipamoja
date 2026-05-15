import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const body = await request.json()
    const { group_id, member_id, amount, period_start, period_end, notes } = body

    const admin = createAdminClient()

    const { data: contribution, error } = await admin
      .from('contributions')
      .insert({
        group_id, member_id, amount, period_start, period_end,
        status: 'paid',
        paid_at: new Date().toISOString(),
        recorded_by: user.id,
        notes,
      })
      .select()
      .single()

    if (error) {
      console.error('contributions insert:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Log transaction (non-blocking)
    admin.from('transactions').insert({
      group_id,
      type: 'contribution',
      amount,
      description: `Mchango wa ${period_start} – ${period_end}`,
      reference_id: contribution.id,
      performed_by: user.id,
      member_id,
    }).then(({ error: txErr }) => {
      if (txErr) console.error('transactions insert:', txErr)
    })

    return NextResponse.json({ contribution }, { status: 201 })
  } catch (err) {
    console.error('POST /api/contributions:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva' }, { status: 500 })
  }
}
