import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const body = await request.json()
    const { name, description, contribution_amount, contribution_cycle } = body

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Jina la kundi linahitajika' }, { status: 400 })
    }
    if (!contribution_amount || Number(contribution_amount) < 1000) {
      return NextResponse.json({ error: 'Kiasi cha mchango lazima kiwe angalau TZS 1,000' }, { status: 400 })
    }

    // Use admin client for all writes — RLS blocks the creator from adding
    // themselves to group_members before they are yet in the group.
    const admin = createAdminClient()

    // Ensure profile exists in case trigger didn't fire on signup
    await admin.from('profiles').upsert({
      id: user.id,
      full_name: user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'Mtumiaji',
      phone: user.user_metadata?.phone ?? null,
    }, { onConflict: 'id', ignoreDuplicates: true })

    const { data: group, error: groupError } = await admin
      .from('groups')
      .insert({
        name: name.trim(),
        description: description?.trim() || null,
        contribution_amount: Number(contribution_amount),
        contribution_cycle: contribution_cycle || 'monthly',
        created_by: user.id,
      })
      .select()
      .single()

    if (groupError) {
      console.error('groups insert:', groupError)
      return NextResponse.json({ error: groupError.message }, { status: 500 })
    }

    // Add creator as group admin
    const { error: memberError } = await admin.from('group_members').insert({
      group_id: group.id,
      user_id: user.id,
      role: 'admin',
    })
    if (memberError) {
      console.error('group_members insert:', memberError)
      return NextResponse.json({ error: memberError.message }, { status: 500 })
    }

    return NextResponse.json({ group }, { status: 201 })
  } catch (err) {
    console.error('POST /api/groups:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva isiyo tarajiwa' }, { status: 500 })
  }
}

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const { data: memberships } = await supabase
      .from('group_members')
      .select('group_id, role')
      .eq('user_id', user.id)
      .eq('is_active', true)

    if (!memberships?.length) return NextResponse.json({ groups: [] })

    const groupIds = memberships.map((m) => m.group_id)
    const { data: groups, error } = await supabase
      .from('groups')
      .select('*')
      .in('id', groupIds)
      .order('created_at', { ascending: false })

    if (error) throw error
    return NextResponse.json({ groups })
  } catch (err) {
    console.error('GET /api/groups:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva' }, { status: 500 })
  }
}
