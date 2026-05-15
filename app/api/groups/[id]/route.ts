import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const admin = createAdminClient()
    const { id } = await params

    // Verify user is admin of this group
    const { data: membership } = await admin
      .from('group_members')
      .select('role')
      .eq('group_id', id)
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    if (!membership) {
      return NextResponse.json({ error: 'Huna ruhusa ya kubadilisha kundi hili' }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, contribution_amount, contribution_cycle } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Jina la kundi linahitajika' }, { status: 400 })
    }
    if (!contribution_amount || Number(contribution_amount) < 1000) {
      return NextResponse.json({ error: 'Kiasi cha mchango lazima kiwe angalau TZS 1,000' }, { status: 400 })
    }

    const { data: group, error } = await admin
      .from('groups')
      .update({
        name: name.trim(),
        description: description?.trim() || null,
        contribution_amount: Number(contribution_amount),
        contribution_cycle: contribution_cycle || 'monthly',
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('groups update:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ group })
  } catch (err) {
    console.error('PATCH /api/groups/[id]:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva' }, { status: 500 })
  }
}
