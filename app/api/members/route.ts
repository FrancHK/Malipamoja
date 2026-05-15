import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: 'Haujaidhinishwa' }, { status: 401 })

    const body = await request.json()
    const { group_id, email, role } = body

    const admin = createAdminClient()

    // Verify requester is admin or treasurer
    const { data: requesterMembership } = await admin
      .from('group_members')
      .select('role')
      .eq('group_id', group_id)
      .eq('user_id', user.id)
      .single()

    if (!requesterMembership || !['admin', 'treasurer'].includes(requesterMembership.role)) {
      return NextResponse.json({ error: 'Huna ruhusa ya kuongeza wanachama' }, { status: 403 })
    }

    // Find user by email via admin auth API
    const { data: { users }, error: listError } = await admin.auth.admin.listUsers()
    if (listError) throw listError

    const targetAuthUser = users.find(u => u.email === email)
    if (!targetAuthUser) {
      return NextResponse.json({ error: 'Mtumiaji mwenye barua pepe hiyo hajapatikana. Lazima ajiandikishe kwanza.' }, { status: 404 })
    }

    const { data: targetProfile } = await admin
      .from('profiles')
      .select('id')
      .eq('id', targetAuthUser.id)
      .maybeSingle()

    if (!targetProfile) {
      return NextResponse.json({ error: 'Mtumiaji mwenye barua pepe hiyo hajapatikana. Lazima ajiandikishe kwanza.' }, { status: 404 })
    }

    const { error } = await admin.from('group_members').insert({
      group_id,
      user_id: targetProfile.id,
      role: role ?? 'member',
    })

    if (error) {
      if (error.code === '23505') return NextResponse.json({ error: 'Mtumiaji tayari ni mwanachama wa kundi hili' }, { status: 409 })
      console.error('group_members insert:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err) {
    console.error('POST /api/members:', err)
    return NextResponse.json({ error: 'Hitilafu ya seva' }, { status: 500 })
  }
}
